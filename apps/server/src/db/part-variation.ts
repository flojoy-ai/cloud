import {
  DB,
  InsertPartVariation,
  Part,
  PartVariation,
  PartVariationTreeNode,
  PartVariationTreeRoot,
  PartVariationUpdate,
} from "@cloud/shared";
import { PartVariationType } from "@cloud/shared/src/schemas/public/PartVariationType";
import { ExpressionBuilder, Kysely } from "kysely";
import { jsonObjectFrom } from "kysely/helpers/postgres";
import _ from "lodash";
import { Result, err, ok, safeTry } from "neverthrow";
import { markUpdatedAt } from "../db/query";
import { fromTransaction, generateDatabaseId, tryQuery } from "../lib/db-utils";
import {
  BadRequestError,
  InternalServerError,
  NotFoundError,
  RouteError,
} from "../lib/error";
import { db } from "./kysely";
import { getPart } from "./part";
import { withUnitParent } from "./unit";

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

function validatePartNumber(part: Part, partNumber: string) {
  const requiredPrefix = part.name + "-";
  if (!partNumber.startsWith(requiredPrefix)) {
    return err(
      new BadRequestError(
        `Part number must start with "${requiredPrefix}" for part ${part.name}`,
      ),
    );
  }
  return ok(partNumber);
}

export async function createPartVariation(
  db: Kysely<DB>,
  input: InsertPartVariation,
): Promise<Result<PartVariation, RouteError>> {
  const { components, type: typeName, market: marketName, ...data } = input;

  const part = await getPart(db, input.partId);
  if (!part) {
    return err(new NotFoundError("Part not found"));
  }

  const ids = components.map((c) => c.partVariationId);
  if (ids.length !== _.uniq(ids).length) {
    return err(new BadRequestError("Duplicate component ids"));
  }

  return safeTry(async function* () {
    const partNumber = yield* validatePartNumber(
      part,
      input.partNumber,
    ).safeUnwrap();
    let typeId: string | undefined = undefined;
    let marketId: string | undefined = undefined;

    if (typeName) {
      const type = yield* (
        await getOrCreateType(db, typeName, input.workspaceId)
      ).safeUnwrap();
      typeId = type.id;
    }
    if (marketName) {
      const market = yield* (
        await getOrCreateMarket(db, marketName, input.workspaceId)
      ).safeUnwrap();
      marketId = market.id;
    }

    const partVariation = yield* (
      await tryQuery(
        db
          .insertInto("part_variation")
          .values({
            id: generateDatabaseId("part_variation"),
            ...data,
            partNumber,
            typeId,
            marketId,
          })
          .returningAll()
          .executeTakeFirstOrThrow(
            () => new InternalServerError("Failed to create part variation"),
          ),
      )
    ).safeUnwrap();

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
  });
}

export async function getPartVariation(
  workspaceId: string,
  partVariationId: string,
) {
  return await db
    .selectFrom("part_variation")
    .selectAll("part_variation")
    .where("part_variation.id", "=", partVariationId)
    .where("part_variation.workspaceId", "=", workspaceId)
    .select((eb) => [withPartVariationType(eb)])
    .select((eb) => [withPartVariationMarket(eb)])
    .executeTakeFirst();
}

export async function getPartVariationComponents(partVariationId: string) {
  return await db
    .selectFrom("part_variation_relation")
    .select(["childPartVariationId as partVariationId", "count"])
    .where("parentPartVariationId", "=", partVariationId)
    .execute();
}

export async function getPartVariationUnits(partVariationId: string) {
  return await db
    .selectFrom("unit")
    .selectAll("unit")
    .where("unit.partVariationId", "=", partVariationId)
    .select((eb) => withUnitParent(eb))
    .execute();
}

type PartVariationEdge = {
  partNumber: string;
  partVariationId: string;
  parentPartVariationId: string;
  count: number;
  description: string | null;
};

async function getPartVariationTreeEdges(
  db: Kysely<DB>,
  partVariation: PartVariation,
) {
  return await db
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
          "part_variation.partNumber",
          "part_variation.description",
        ])
        .where("parentPartVariationId", "=", partVariation.id)
        .union((eb) =>
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
              "part_variation.partNumber",
              "part_variation.description",
            ]),
        ),
    )
    .selectFrom("part_variation_tree")
    .selectAll()
    .execute();
}

export async function getPartVariationTree(
  db: Kysely<DB>,
  partVariation: PartVariation,
): Promise<PartVariationTreeRoot> {
  const edges = await getPartVariationTreeEdges(db, partVariation);
  return buildPartVariationTree(partVariation, edges);
}

function buildPartVariationTree(
  rootPartVariation: PartVariation,
  edges: PartVariationEdge[],
) {
  const nodes = new Map<string, PartVariationTreeNode>();
  const root: PartVariationTreeRoot = {
    ...rootPartVariation,
    components: [],
  };

  for (const edge of edges) {
    const parent = nodes.get(edge.parentPartVariationId) ?? root;
    let cur = nodes.get(edge.partVariationId);

    if (!cur) {
      cur = {
        id: edge.partVariationId,
        partNumber: edge.partNumber,
        description: edge.description,
        components: [],
      };
      nodes.set(edge.partVariationId, cur);
    }

    if (parent.components.map((c) => c.partVariation).includes(cur)) {
      continue;
    }

    parent.components.push({ count: edge.count, partVariation: cur });
  }

  return root;
}

async function getPartVariationImmediateChildren(
  db: Kysely<DB>,
  partVariationId: string,
) {
  return await db
    .selectFrom("part_variation_relation as mr")
    .innerJoin("part_variation", "mr.childPartVariationId", "part_variation.id")
    .select([
      "parentPartVariationId",
      "count",
      "childPartVariationId as partVariationId",
      "part_variation.partNumber",
      "part_variation.description",
    ])
    .where("parentPartVariationId", "=", partVariationId)
    .execute();
}

async function haveComponentsChanged(
  db: Kysely<DB>,
  partVariationId: string,
  components: { partVariationId: string; count: number }[],
) {
  const curComponents = await getPartVariationImmediateChildren(
    db,
    partVariationId,
  );
  const makeObject = (cs: typeof components) => {
    return Object.fromEntries(cs.map((c) => [c.partVariationId, c.count]));
  };

  const before = makeObject(curComponents);
  const after = makeObject(components);

  return !_.isEqual(before, after);
}

// Returns an error with the node of the cycle if one is detected, otherwise ok
function detectCycle(graph: PartVariationTreeRoot) {
  const dfs = (
    node: PartVariationTreeNode,
    pathVertices: Set<string>,
  ): Result<void, { id: string; partNumber: string }> => {
    if (pathVertices.has(node.id)) {
      return err({ id: node.id, partNumber: node.partNumber });
    }
    if (node.components.length === 0) {
      return ok(undefined);
    }

    pathVertices.add(node.id);
    for (const c of node.components) {
      const res = dfs(c.partVariation, pathVertices);
      if (res.isErr()) {
        return res;
      }
    }
    pathVertices.delete(node.id);

    return ok(undefined);
  };

  return dfs(graph, new Set());
}

export async function updatePartVariation(
  db: Kysely<DB>,
  partVariationId: string,
  workspaceId: string,
  update: PartVariationUpdate,
) {
  const { components, type: typeName, market: marketName, ...data } = update;

  const partVariation = await getPartVariation(workspaceId, partVariationId);
  if (partVariation === undefined)
    return err(new NotFoundError("Part variation not found"));

  const part = await getPart(db, partVariation.partId);
  if (part === undefined) return err(new NotFoundError("Part not found"));

  const ids = components.map((c) => c.partVariationId);
  if (ids.length !== _.uniq(ids).length) {
    return err(new BadRequestError("Duplicate component ids"));
  }

  const existingUnits = await getPartVariationUnits(partVariationId);
  const componentsChanged = await haveComponentsChanged(
    db,
    partVariationId,
    components,
  );

  // Don't allow users to change part structure if there are existing units
  if (componentsChanged && existingUnits.length > 0) {
    return err(
      new BadRequestError(
        "Cannot change part variation components because there are existing units",
      ),
    );
  }

  return fromTransaction(async (tx) => {
    return safeTry(async function* () {
      let typeId: string | null = null;
      let marketId: string | null = null;

      if (typeName) {
        const type = yield* (
          await getOrCreateType(tx, typeName, workspaceId)
        ).safeUnwrap();
        typeId = type.id;
      }
      if (marketName) {
        const market = yield* (
          await getOrCreateMarket(tx, marketName, workspaceId)
        ).safeUnwrap();
        marketId = market.id;
      }

      yield* tryQuery(
        tx
          .updateTable("part_variation")
          .set({
            ...data,
            typeId,
            marketId,
          })
          .where("id", "=", partVariationId)
          .execute(),
      ).safeUnwrap();

      const updatedPartVariation = await getPartVariation(
        workspaceId,
        partVariationId,
      );
      if (updatedPartVariation === undefined) {
        return err(new InternalServerError("Failed to update part variation"));
      }

      if (!componentsChanged) {
        return ok(undefined);
      }

      // Rebuild this level of the component tree
      yield* tryQuery(
        tx
          .deleteFrom("part_variation_relation")
          .where("parentPartVariationId", "=", partVariationId)
          .execute(),
      ).safeUnwrap();

      if (components.length > 0) {
        yield* tryQuery(
          tx
            .insertInto("part_variation_relation")
            .values(
              components.map((c) => ({
                parentPartVariationId: updatedPartVariation.id,
                childPartVariationId: c.partVariationId,
                workspaceId,
                count: c.count,
              })),
            )
            .execute(),
        ).safeUnwrap();

        const graph = await getPartVariationTree(tx, updatedPartVariation);
        yield* detectCycle(graph)
          .mapErr(
            (e) =>
              new BadRequestError(
                `Cycle detected in component graph at: ${e.partNumber}, not allowed`,
              ),
          )
          .safeUnwrap();
      }

      return ok(undefined);
    });
  });
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
