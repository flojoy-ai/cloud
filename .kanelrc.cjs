// const path = require("path");
const { makeKyselyHook } = require("kanel-kysely");
const {
  makeGenerateZodSchemas,
  defaultGetZodSchemaMetadata,
  defaultGetZodIdentifierMetadata,
  defaultZodTypeMap,
} = require("kanel-zod");

const generateZodSchemas = makeGenerateZodSchemas({
  getZodSchemaMetadata: defaultGetZodSchemaMetadata,
  getZodIdentifierMetadata: defaultGetZodIdentifierMetadata,
  zodTypeMap: defaultZodTypeMap,
  castToSchema: false,
});

/** @type {import('kanel').Config} */
module.exports = {
  connection: process.env.DATABASE_URL,

  preDeleteOutputFolder: true,
  outputPath: "./src/schemas",
  preRenderHooks: [makeKyselyHook(), generateZodSchemas],

  enumStyle: "type",

  customTypeMap: {
    "pg_catalog.tsvector": "string",
    "pg_catalog.bpchar": "string",
  },
};
