// const path = require("path");
const { makeKyselyHook } = require("kanel-kysely");
const { generateZodSchemas } = require("kanel-zod");

/** @type {import('kanel').Config} */
module.exports = {
  connection: process.env.DATABASE_URL,

  preDeleteOutputFolder: true,
  outputPath: "./src/schemas",
  preRenderHooks: [generateZodSchemas, makeKyselyHook()],

  enumStyle: "type",

  customTypeMap: {
    "pg_catalog.tsvector": "string",
    "pg_catalog.bpchar": "string",
  },
};
