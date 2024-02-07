import { type NextRequest } from "next/server";
import { ErrorWithCode, zapierUserAuthMiddleware } from "../middleware";
import { api } from "~/trpc/server";

export const GET = async (req: NextRequest) => {
  try {
    const { workspaceId } = await zapierUserAuthMiddleware(req);
    const hardwares = await api.hardware.getAllHardware.query({
      workspaceId,
    });
    const hardwareFields = hardwares.map((hardware) => {
      return {
        key: hardware.id,
        label: `${hardware.name} (${hardware.type})`,
        value: hardware.id,
      };
    });

    const projects = await api.project.getAllProjectsByWorkspaceId.query({
      workspaceId,
    });
    const projectFields = projects.map((project) => {
      return {
        key: project.id,
        label: project.name,
        value: project.id,
      };
    });
    let testFields: Array<{ key: string; label: string; value: string }> = ({} =
      []);
    if (projects.length > 0) {
      const tests = await api.test.getAllTestsByProjectId.query({
        projectId: projects[0]?.id ?? "",
      });
      testFields = tests.map((test) => {
        return {
          key: test.id,
          label: test.name,
          value: test.id,
        };
      });
    }
    return new Response(
      JSON.stringify([
        { key: "hardwareId", label: "Hardware", choices: hardwareFields },
        { key: "projectId", label: "Project", choices: projectFields },
        ...(testFields.length > 0
          ? [{ key: "testId", label: "Test", choices: testFields }]
          : []),
      ]),
      {
        status: 200,
      },
    );
  } catch (error) {
    if (error instanceof ErrorWithCode) {
      return new Response(JSON.stringify({ message: error.message }), {
        status: error.code,
      });
    }
  }
};
