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
  const measurementCreate = api.measurement.createMeasurement.useMutation();

  const createSample = async () => {
    const workspace = await workspaceCreate.mutateAsync({
      name: "Sample Workspace",
      planType: "hobby",
    });

    const project = await projectCreate.mutateAsync({
      name: "My Circuit Testing Project",
      workspaceId: workspace.id,
    });

    const test = await testCreate.mutateAsync({
      name: "Pass/Fail Test",
      projectId: project.id,
    });

    for (let i = 1; i <= 3; i++) {
      const device = await deviceCreate.mutateAsync({
        name: `Circuit Board #${i}`,
        projectId: project.id,
      });
      await measurementCreate.mutateAsync({
        name: "Did Power On",
        deviceId: device.id,
        testId: test.id,
        measurementType: "boolean",
        storageProvider: "local",
        data: { passed: true },
      });
    }

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
