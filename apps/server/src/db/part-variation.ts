import { generateDatabaseId } from "../lib/db-utils";
import { markUpdatedAt } from "../db/query";
import { Result, err, ok } from "neverthrow";
import {
  DB,
  PartVariation,
  InsertPartVariation,
  PartVariationTreeNode,
  PartVariationTreeRoot,
} from "@cloud/shared";
import { db } from "./kysely";
import { Kysely } from "kysely";

export async function createPartVariation(
  db: Kysely<DB>,
  input: InsertPartVariation,
): Promise<Result<PartVariation, string>> {
  const { components, ...newPartVariation } = input;
  const partVariation = await db
    .insertInto("part_variation")
    .values({
      id: generateDatabaseId("part_variation"),
      ...newPartVariation,
    })
    .returningAll()
    .executeTakeFirst();

  if (partVariation === undefined) {
    return err("Failed to create partVariation");
  }

  if (components.length > 0) {
    await db
      .insertInto("part_variation_relation")
      .values(
        components.map((c) => ({
          parentPartVariationId: partVariation.id,
          childPartVariationId: c.partVariationId,
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
              "part_variation.name as partNumber",
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
