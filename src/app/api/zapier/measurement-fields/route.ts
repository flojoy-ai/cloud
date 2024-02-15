import { type NextRequest } from "next/server";
import { ErrorWithCode, zapierUserAuthMiddleware } from "../middleware";
import { api } from "~/trpc/server";

type Field = { key: string; label: string; value: string };
export const GET = async (req: NextRequest) => {
  try {
    const { workspaceId } = await zapierUserAuthMiddleware(req);
    const hardwares = await api.hardware.getAllHardware.query({
      workspaceId,
    });
    const hardwareFields = hardwares.map((hardware) => {
      return {
        key: hardware.id,
        label: `${hardware.name} (${hardware.model.name})`,
        value: hardware.id,
      };
    });

    const projects = await api.project.getAllProjects.query({
      workspaceId,
    });
    const testFields: Field[] = [];
    for (const project of projects) {
      const tests = await api.test.getAllTestsByProjectId.query({
        projectId: project.id,
      });
      tests.forEach((test) => {
        testFields.push({
          key: test.id,
          label: `${test.name} (${project.name})`,
          value: test.id,
        });
      });
    }

    const res = [
      {
        key: "hardwareId",
        label: "Hardware",
        required: true,
        choices: hardwareFields,
      },
      { key: "testId", label: "Test", required: true, choices: testFields },
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