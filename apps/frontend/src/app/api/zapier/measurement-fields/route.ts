import { type NextRequest } from "next/server";
import { ErrorWithCode, zapierUserAuthMiddleware } from "../middleware";
import { api } from "~/trpc/server";

// see https://zapier.github.io/zapier-platform-schema/build/schema.html#fieldschema
type Field = {
  key: string;
  label?: string;
  helpText?: string;
  type?:
    | "string"
    | "text"
    | "integer"
    | "number"
    | "boolean"
    | "datetime"
    | "file"
    | "password"
    | "copy";
  required?: boolean;
  placeholder?: string;
  default?: string;
  dynamic?: string;
  search?: string;
  //see https://zapier.github.io/zapier-platform-schema/build/schema.html#fieldchoicewithlabelschema
  choices?: Array<{
    label: string;
    value: string;
    sample: string;
  }>;
  inputFormat?: string;
  list?: boolean;
  children?: Field[];
  dict?: boolean;
  computed?: boolean;
  altersDynamicFields?: boolean;
};

export const GET = async (req: NextRequest) => {
  try {
    const { workspaceId } = await zapierUserAuthMiddleware(req);
    const hardwares = await api.hardware.getAllHardware({
      workspaceId,
    });
    const hardwareFields: Field["choices"] = hardwares.map((hardware) => {
      return {
        label: `${hardware.name} (${hardware.model.name})`,
        value: hardware.id,
        sample: hardware.id,
      };
    });

    const projects = await api.project.getAllProjects({
      workspaceId,
    });
    const testFields: Field["choices"] = [];
    for (const project of projects) {
      const tests = await api.test.getAllTestsByProjectId({
        projectId: project.id,
      });
      tests.forEach((test) => {
        testFields.push({
          label: `${test.name} (${project.name})`,
          sample: test.id,
          value: test.id,
        });
      });
    }
    const typeChoices: Field["choices"] = [
      {
        label: "Boolean",
        value: "boolean",
        sample: "boolean",
      },
      {
        label: "DataFrame",
        value: "dataframe",
        sample: "dataframe",
      },
    ];

    const res: Field[] = [
      {
        key: "hardwareId",
        label: "Hardware",
        required: true,
        choices: hardwareFields,
      },
      { key: "testId", label: "Test", required: true, choices: testFields },
      {
        key: "name",
        label: "Name",
        required: true,
        type: "string",
        placeholder: "My measurement",
      },
      {
        key: "type",
        label: "Data Type",
        required: true,
        type: "string",
        choices: typeChoices,
      },
      {
        key: "data",
        label: "Data",
        required: true,
        type: "string",
        helpText:
          "This should be either boolean for Data Type `boolean` or `Record<string, number[] | string[]` type in string",
      },
      {
        key: "pass",
        label: "Passed?",
        type: "boolean",
        required: false,
      },
    ];
    return new Response(JSON.stringify(res), {
      status: 200,
    });
  } catch (error) {
    if (error instanceof ErrorWithCode) {
      return new Response(JSON.stringify({ message: error.message }), {
        status: error.code,
      });
    }
    return new Response("An unknown error occurred: " + String(error), {
      status: 500,
    });
  }
};
