const { makeKyselyHook } = require("kanel-kysely");
const {
  makeGenerateZodSchemas,
  defaultGetZodSchemaMetadata,
  defaultGetZodIdentifierMetadata,
  defaultZodTypeMap,
} = require("kanel-zod");

const { recase } = require("@kristiandupont/recase");
const { tryParse } = require("tagged-comment-parser");

const generateZodSchemas = makeGenerateZodSchemas({
  getZodSchemaMetadata: defaultGetZodSchemaMetadata,
  getZodIdentifierMetadata: defaultGetZodIdentifierMetadata,
  zodTypeMap: defaultZodTypeMap,
  castToSchema: false,
});

const toPascalCase = recase("snake", "pascal");
const outputPath = "./src/schemas";

/** @type {import('kanel').Config} */
module.exports = {
  connection: process.env.DATABASE_URL,

  preDeleteOutputFolder: true,
  outputPath,
  preRenderHooks: [makeKyselyHook(), generateZodSchemas],

  enumStyle: "type",

  customTypeMap: {
    "pg_catalog.tsvector": "string",
    "pg_catalog.bpchar": "string",
  },

  getPropertyMetadata: (property, _details, generateFor) => {
    const { comment: strippedComment } = tryParse(property.comment);

    return {
      name: toPascalCase(property.name),
      comment: [
        `Database type: ${property.expandedType}`,
        ...(generateFor === "initializer" && property.defaultValue
          ? [`Default value: ${property.defaultValue}`]
          : []),
        ...(strippedComment ? [strippedComment] : []),
      ],
    };
  },
};
