const { makeKyselyHook } = require("kanel-kysely");
const { resolveType } = require("kanel");

const { recase } = require("@kristiandupont/recase");
const { tryParse } = require("tagged-comment-parser");


const toCamelCase = recase("snake", "camel");
const toPascalCase = recase("snake", "pascal");
const outputPath = "../../packages/shared/src/schemas";

/** @type {import('kanel').Config} */
module.exports = {
  connection: process.env.DATABASE_URL + "?sslmode=require",

  preDeleteOutputFolder: true,
  outputPath,
  preRenderHooks: [makeKyselyHook()],

  enumStyle: "type",

  customTypeMap: {
    "pg_catalog.tsvector": "string",
    "pg_catalog.bpchar": "string",
  },

  getPropertyMetadata: (property, _details, generateFor) => {
    const { comment: strippedComment } = tryParse(property.comment);

    return {
      name: toCamelCase(property.name),
      comment: [
        `Database type: ${property.expandedType}`,
        ...(generateFor === "initializer" && property.defaultValue
          ? [`Default value: ${property.defaultValue}`]
          : []),
        ...(strippedComment ? [strippedComment] : []),
      ],
    };
  },

  generateIdentifierType: (column, details, config) => {
    const name = toPascalCase(details.name) + toPascalCase(column.name);
    const innerType = resolveType(column, details, {
      ...config,
      // Explicitly disable identifier resolution so we get the actual inner type here
      generateIdentifierType: undefined,
    });
    const imports = [];

    let type = innerType;
    if (typeof innerType === "object") {
      // Handle non-primitives
      type = innerType.name;
      imports.push(...innerType.typeImports);
    }

    return {
      declarationType: "typeDeclaration",
      name,
      exportAs: "named",
      typeDefinition: [innerType],
      typeImports: imports,
      comment: [],
    };
  },
};
