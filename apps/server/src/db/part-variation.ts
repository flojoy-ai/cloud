import {
  DB,
  InsertPartVariation,
  PartVariation,
  PartVariationTreeNode,
  PartVariationTreeRoot,
} from "@cloud/shared";
import { ExpressionBuilder, Kysely } from "kysely";
import { Result, err, ok } from "neverthrow";
import { markUpdatedAt } from "../db/query";
import { generateDatabaseId } from "../lib/db-utils";
import { db } from "./kysely";
import { getPart } from "./part";
import {
  InternalServerError,
  NotFoundError,
  BadRequestError,
  RouteError,
} from "../lib/error";
import { PartVariationType } from "@cloud/shared/src/schemas/public/PartVariationType";
import { jsonObjectFrom } from "kysely/helpers/postgres";

async function getOrCreateType(
  db: Kysely<DB>,
  typeName: string,
  workspaceId: string,
): Promise<Result<PartVariationType, RouteError>> {
  const type = await db
    .selectFrom("part_variation_type as pvt")
    .selectAll("pvt")
    .where("pvt.name", "=", typeName)
    .where("pvt.workspaceId", "=", workspaceId)
    .executeTakeFirst();

  if (type) {
    return ok(type);
  }
  const insertResult = await db
    .insertInto("part_variation_type")
    .values({
      id: generateDatabaseId("part_variation_type"),
      workspaceId,
      name: typeName,
    })
    .returningAll()
    .executeTakeFirst();

  if (!insertResult) {
    return err(new InternalServerError("Failed to create part variation type"));
  }

  return ok(insertResult);
}

async function getOrCreateMarket(
  db: Kysely<DB>,
  marketName: string,
  workspaceId: string,
): Promise<Result<PartVariationType, RouteError>> {
  const market = await db
    .selectFrom("part_variation_market as pvt")
    .selectAll("pvt")
    .where("pvt.name", "=", marketName)
    .where("pvt.workspaceId", "=", workspaceId)
    .executeTakeFirst();

  if (market) {
    return ok(market);
  }

  const insertResult = await db
    .insertInto("part_variation_market")
    .values({
      id: generateDatabaseId("part_variation_market"),
      workspaceId,
      name: marketName,
    })
    .returningAll()
    .executeTakeFirst();

  if (!insertResult) {
    return err(
      new InternalServerError("Failed to create part variation market"),
    );
  }

  return ok(insertResult);
}

export async function createPartVariation(
  db: Kysely<DB>,
  input: InsertPartVariation,
): Promise<Result<PartVariation, RouteError>> {
  const { components, ...newPartVariation } = input;

  const part = await getPart(db, input.partId);
  if (!part) {
    return err(new NotFoundError("Part not found"));
  }
  const requiredPrefix = part.name + "-";
  if (!newPartVariation.partNumber.startsWith(requiredPrefix)) {
    return err(
      new BadRequestError(
        `Part number must start with "${requiredPrefix}" for part ${part.name}`,
      ),
    );
  }
  const { type: typeName, market: marketName, ...data } = newPartVariation;

  let typeId: string | undefined = undefined;
  let marketId: string | undefined = undefined;

  if (typeName) {
    const type = await getOrCreateType(db, typeName, input.workspaceId);
    if (type.isOk()) {
      typeId = type.value.id;
    } else {
      return err(type.error);
    }
  }
  if (marketName) {
    const market = await getOrCreateMarket(db, marketName, input.workspaceId);
    if (market.isOk()) {
      marketId = market.value.id;
    } else {
      return err(market.error);
    }
  }

  const partVariation = await db
    .insertInto("part_variation")
    .values({
      id: generateDatabaseId("part_variation"),
      ...data,
      typeId,
      marketId,
    })
    .returningAll()
    .executeTakeFirst();

  if (partVariation === undefined) {
    return err(new InternalServerError("Failed to create part variation"));
  }

  if (components.length > 0) {
    await db
      .insertInto("part_variation_relation")
      .values(
        components.map((c) => ({
          parentPartVariationId: partVariation.id,
          childPartVariationId: c.partVariationId,
          workspaceId: input.workspaceId,
          count: c.count,
        })),
      )
      .execute();
  }

  await markUpdatedAt(db, "workspace", input.workspaceId);

  return ok(partVariation);
}

export async function getPartVariation(partVariationId: string) {
  return await db
    .selectFrom("part_variation")
    .selectAll()
    .where("part_variation.id", "=", partVariationId)

    .executeTakeFirst();
}

export async function getPartVariationComponents(partVariationId: string) {
  return await db
    .selectFrom("part_variation_relation")
    .select(["childPartVariationId as partVariationId", "count"])
    .where("parentPartVariationId", "=", partVariationId)
    .execute();
}

type PartVariationEdge = {
  partNumber: string;
  partVariationId: string;
  parentPartVariationId: string;
  count: number;
};

export async function getPartVariationTree(
  partVariation: PartVariation,
): Promise<PartVariationTreeRoot> {
  const edges = await db
    .withRecursive("part_variation_tree", (qb) =>
      qb
        .selectFrom("part_variation_relation as mr")
        .innerJoin(
          "part_variation",
          "mr.childPartVariationId",
          "part_variation.id",
        )
        .select([
          "parentPartVariationId",
          "count",
          "childPartVariationId as partVariationId",
          "part_variation.partNumber as partNumber",
        ])
        .where("parentPartVariationId", "=", partVariation.id)
        .unionAll((eb) =>
          eb
            .selectFrom("part_variation_relation as mr")
            .innerJoin(
              "part_variation",
              "mr.childPartVariationId",
              "part_variation.id",
            )
            .innerJoin(
              "part_variation_tree",
              "part_variation_tree.partVariationId",
              "mr.parentPartVariationId",
            )
            .select([
              "mr.parentPartVariationId",
              "mr.count",
              "mr.childPartVariationId as partVariationId",
              "part_variation.partNumber as partNumber",
            ]),
        ),
    )
    .selectFrom("part_variation_tree")
    .selectAll()
    .execute();

  return buildPartVariationTree(partVariation, edges);
}

function buildPartVariationTree(
  rootPartVariation: PartVariation,
  edges: PartVariationEdge[],
) {
  const nodes = new Map<string, PartVariationTreeNode>();
  const root: PartVariationTreeRoot = { ...rootPartVariation, components: [] };

  for (const edge of edges) {
    const parent = nodes.get(edge.parentPartVariationId) ?? root;
    let cur = nodes.get(edge.partVariationId);

    if (!cur) {
      cur = {
        id: edge.partVariationId,
        partNumber: edge.partNumber,
        components: [],
      };
      nodes.set(edge.partVariationId, cur);
    }

    parent.components.push({ count: edge.count, partVariation: cur });
  }

  return root;
}

export function withPartVariationType(
  eb: ExpressionBuilder<DB, "part_variation">,
) {
  return jsonObjectFrom(
    eb
      .selectFrom("part_variation_type as pvt")
      .selectAll("pvt")
      .whereRef("pvt.id", "=", "part_variation.typeId"),
  ).as("type");
}

export function withPartVariationMarket(
  eb: ExpressionBuilder<DB, "part_variation">,
) {
  return jsonObjectFrom(
    eb
      .selectFrom("part_variation_market as pvm")
      .selectAll("pvm")
      .whereRef("pvm.id", "=", "part_variation.marketId"),
  ).as("market");
}
