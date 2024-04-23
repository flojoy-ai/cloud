import { fromTransaction, generateDatabaseId, tryQuery } from "../lib/db-utils";
import {
  BadRequestError,
  DuplicateError,
  RouteError,
  InternalServerError,
  NotFoundError,
} from "../lib/error";
import {
  DB,
  WorkspaceUser,
  Unit,
  UnitTreeNode,
  UnitTreeRoot,
  InsertUnit,
  SwapUnitComponent,
  PartVariation,
} from "@cloud/shared";
import { ExpressionBuilder, Kysely } from "kysely";
import { jsonObjectFrom } from "kysely/helpers/postgres";
import _ from "lodash";
import { User } from "lucia";
import { Result, err, fromPromise, ok, safeTry } from "neverthrow";
import { db } from "./kysely";
import { getPartVariation, getPartVariationComponents } from "./part-variation";
import { markUpdatedAt } from "./query";

export async function getUnit(unitId: string, workspaceId: string) {
  return await db
    .selectFrom("unit")
    .selectAll()
    .where("unit.id", "=", unitId)
    .where("workspaceId", "=", workspaceId)
    .executeTakeFirst();
}

export async function createUnit(
  db: Kysely<DB>,
  workspaceId: string,
  user: User,
  unit: InsertUnit,
) {
  return fromPromise(
    db.transaction().execute(async (tx) => {
      const { components, projectId, ...newUnit } = unit;

      const partVariation = await getPartVariation(unit.partVariationId);
      if (!partVariation) {
        throw new NotFoundError("PartVariation not found");
      }

      const created = await tx
        .insertInto("unit")
        .values({
          id: generateDatabaseId("unit"),
          workspaceId,
          ...newUnit,
        })
        .returningAll()
        .executeTakeFirst();
      if (created === undefined) {
        throw new InternalServerError("Failed to create unit");
      }

      const partVariationComponents = await getPartVariationComponents(
        partVariation.id,
      );

      if (partVariationComponents.length > 0) {
        const ids = components;
        if (components.length === 0) {
          throw new BadRequestError(
            "Component list cannot be empty for this part variation",
          );
        }
        if (ids.some((c) => c.length === 0)) {
          throw new BadRequestError(
            "Cannot have empty component ID in component list",
          );
        }
        if (_.uniq(ids).length !== ids.length) {
          throw new BadRequestError("Duplicate unit devices");
        }

        const units = await db
          .selectFrom("unit")
          .selectAll("unit")
          .where("unit.id", "in", ids)
          .where(notInUse)
          .execute();

        if (units.length !== components.length) {
          throw new DuplicateError("Some unit devices are already in use!");
        }

        const partVariationCount = _.countBy(units, (h) => h.partVariationId);
        const matches = _.every(
          partVariationComponents,
          (c) => partVariationCount[c.partVariationId] === c.count,
        );
        // TODO: Check that the keys match exactly

        if (!matches) {
          throw new BadRequestError(
            "Components do not satisfy partVariation requirements",
          );
        }

        await tx
          .insertInto("unit_relation")
          .values(
            components.map((c) => ({
              parentUnitId: created.id,
              workspaceId,
              childUnitId: c,
            })),
          )
          .execute();

        await tx
          .insertInto("unit_revision")
          .values(
            components.map((c) => ({
              unitId: created.id,
              revisionType: "init",
              componentId: c,
              reason: "Initial unit creation",
              userId: user.id,
            })),
          )
          .execute();
      }

      if (projectId !== undefined) {
        await tx
          .insertInto("project_unit")
          .values({
            unitId: created.id,
            projectId,
          })
          .execute();
      }

      await markUpdatedAt(tx, "workspace", workspaceId);

      return created;
    }),
    (e) => e as RouteError,
  );
}

export async function getUnitRevisions(unitId: string) {
  return await db
    .selectFrom("unit_revision as hr")
    .selectAll("hr")
    .innerJoin("unit", "unit.id", "hr.componentId")
    .innerJoin("user", "user.id", "hr.userId")
    .select("unit.serialNumber as componentSerialNumber")
    .select("user.email as userEmail")
    .where("hr.unitId", "=", unitId)
    .orderBy("hr.createdAt", "desc")
    .execute();
}

export async function doUnitComponentSwap(
  unit: Unit,
  user: WorkspaceUser,
  input: SwapUnitComponent,
): Promise<Result<void, RouteError>> {
  const unitComponents = await getUnitComponentsWithPartVariation(unit.id);

  return fromTransaction(async (tx) => {
    return safeTry(async function* () {
      const oldUnitComponent = await getUnit(
        input.oldUnitComponentId,
        user.workspaceId,
      );
      if (oldUnitComponent === undefined)
        return err(new NotFoundError("Old component not found"));

      const newUnitComponent = await getUnit(
        input.newUnitComponentId,
        user.workspaceId,
      );
      if (newUnitComponent === undefined)
        return err(new NotFoundError("New component not found"));

      if (
        oldUnitComponent.partVariationId !== newUnitComponent.partVariationId
      ) {
        return err(new BadRequestError("PartVariation mismatch"));
      }

      if (
        !unitComponents.some((hc) => hc.unitId === input.oldUnitComponentId)
      ) {
        return err(
          new BadRequestError("Old component is not a part of the unit"),
        );
      }

      yield* (
        await tryQuery(
          tx
            .deleteFrom("unit_relation as hr")
            .where("hr.parentUnitId", "=", unit.id)
            .where("hr.childUnitId", "=", input.oldUnitComponentId)
            .execute(),
        )
      ).safeUnwrap();

      yield* (
        await tryQuery(
          tx
            .insertInto("unit_relation")
            .values({
              parentUnitId: unit.id,
              childUnitId: input.newUnitComponentId,
              workspaceId: unit.workspaceId,
            })
            .execute(),
        )
      ).safeUnwrap();

      yield* (
        await tryQuery(
          tx
            .insertInto("unit_revision")
            .values([
              {
                revisionType: "remove",
                userId: user.userId,
                unitId: unit.id,
                componentId: input.oldUnitComponentId,
                reason: input.reason ?? "Component swap",
              },
              {
                revisionType: "add",
                userId: user.userId,
                unitId: unit.id,
                componentId: input.newUnitComponentId,
                reason: input.reason ?? "Component swap",
              },
            ])
            .execute(),
        )
      ).safeUnwrap();

      return ok(undefined);
    });
  });
}

export const notInUse = ({
  not,
  exists,
  selectFrom,
}: ExpressionBuilder<DB, "unit">) => {
  return not(
    exists(
      selectFrom("unit_relation as hr")
        .selectAll()
        .whereRef("hr.childUnitId", "=", "unit.id"),
    ),
  );
};

export function withUnitPartVariation(eb: ExpressionBuilder<DB, "unit">) {
  return jsonObjectFrom(
    eb
      .selectFrom("part_variation as pv")
      .selectAll("pv")
      .whereRef("pv.id", "=", "unit.partVariationId"),
  ).as("partVariation");
}

export async function getUnitTree(
  unit: Omit<UnitTreeRoot, "components">,
): Promise<UnitTreeRoot> {
  const edges = await db
    .withRecursive("unit_tree", (qb) =>
      qb
        .selectFrom("unit_relation as hr")
        .innerJoin("unit", "hr.childUnitId", "unit.id")
        .innerJoin(
          "part_variation",
          "unit.partVariationId",
          "part_variation.id",
        )
        .select([
          "parentUnitId",
          "childUnitId as unitId",
          "unit.serialNumber as serialNumber",
          "unit.partVariationId as partVariationId",
          "part_variation.partNumber as partNumber",
        ])
        .where("parentUnitId", "=", unit.id)
        .unionAll((eb) =>
          eb
            .selectFrom("unit_relation as hr")
            .innerJoin("unit", "hr.childUnitId", "unit.id")
            .innerJoin("unit_tree", "unit_tree.unitId", "hr.parentUnitId")
            .innerJoin(
              "part_variation",
              "unit.partVariationId",
              "part_variation.id",
            )
            .select([
              "hr.parentUnitId",
              "hr.childUnitId as unitId",
              "unit.serialNumber as serialNumber",
              "unit.partVariationId as partVariationId",
              "part_variation.partNumber as partNumber",
            ]),
        ),
    )
    .selectFrom("unit_tree")
    .selectAll()
    .execute();

  return buildUnitTree(unit, edges);
}

type UnitEdge = {
  unitId: string;
  serialNumber: string;
  parentUnitId: string;
  partVariationId: string;
  partNumber: string;
};

export function buildUnitTree(
  rootUnit: Omit<UnitTreeRoot, "components">,
  edges: UnitEdge[],
) {
  const nodes = new Map<string, UnitTreeNode>();
  const root: UnitTreeRoot = { ...rootUnit, components: [] };

  for (const edge of edges) {
    const parent = nodes.get(edge.parentUnitId) ?? root;
    let cur = nodes.get(edge.unitId);

    if (!cur) {
      cur = {
        id: edge.unitId,
        serialNumber: edge.serialNumber,
        partVariationId: edge.partVariationId,
        partNumber: edge.partNumber,
        components: [],
      };
      nodes.set(edge.unitId, cur);
    }

    parent.components.push(cur);
  }

  return root;
}

export async function getUnitComponentsWithPartVariation(id: string) {
  return await db
    .selectFrom("unit_relation as hr")
    .innerJoin("unit", "unit.id", "hr.childUnitId")
    .innerJoin("part_variation", "part_variation.id", "unit.partVariationId")
    .select([
      "hr.childUnitId as unitId",
      "part_variation.id as partVariationId",
    ])
    .where("hr.parentUnitId", "=", id)
    .execute();
}

export async function getUnitBySerialNumber(
  db: Kysely<DB>,
  serialNumber: string,
  workspaceId: string,
) {
  return await db
    .selectFrom("unit")
    .selectAll()
    .where("unit.serialNumber", "=", serialNumber)
    .where("unit.workspaceId", "=", workspaceId)
    .executeTakeFirst();
}

export function withUnitParent(eb: ExpressionBuilder<DB, "unit">) {
  return jsonObjectFrom(
    eb
      .selectFrom("unit as h")
      .leftJoin("unit_relation", "unit.id", "unit_relation.childUnitId")
      .selectAll("h")
      .select((eb) =>
        jsonObjectFrom(
          eb
            .selectFrom("part_variation")
            .selectAll("part_variation")
            .whereRef("part_variation.id", "=", "h.partVariationId"),
        ).as("partVariation"),
      )
      .$narrowType<{ partVariation: PartVariation }>()
      .whereRef("h.id", "=", "unit_relation.parentUnitId"),
  ).as("parent");
}
