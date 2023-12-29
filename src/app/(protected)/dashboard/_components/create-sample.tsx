"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "~/components/ui/button";
import { api } from "~/trpc/react";

const CreateSample = () => {
  const router = useRouter();
  const workspaceCreate = api.workspace.createWorkspace.useMutation();
  const projectCreate = api.project.createProject.useMutation();
  const deviceCreate = api.device.createDevice.useMutation();
  const testCreate = api.test.createTest.useMutation();

  const createSample = async () => {
    const createWorkspaceResult = await workspaceCreate.mutateAsync({
      name: "Sample Workspace",
      planType: "hobby",
    });

    const createProjectResult = await projectCreate.mutateAsync({
      name: "My Circuit Testing Project",
      workspaceId: createWorkspaceResult.id,
    });

    for (let i = 1; i <= 3; i++) {
      await deviceCreate.mutateAsync({
        name: `Circuit Board #${i}`,
        projectId: createProjectResult.id,
      });
    }

    await testCreate.mutateAsync({
      name: "Pass/Fail Test",
      projectId: createProjectResult.id,
    });
    router.refresh();
  };

  return (
    <Button
      size="sm"
      variant="outline"
      onClick={() =>
        toast.promise(createSample, {
          loading: "Creating your sample workspace + project...",
          success: "The sample is ready!",
          error: (err) => {
            console.log(err);
            return "Something went wrong :(";
          },
        })
      }
    >
      Create a Sample Workspace + Project
    </Button>
  );
};

export default CreateSample;
