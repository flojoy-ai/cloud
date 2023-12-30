"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "~/components/ui/button";
import { api } from "~/trpc/react";

const CreateSample = () => {
  const router = useRouter();
  const [isCreating, setIsCreating] = useState<boolean>(false);
  const workspaceCreate = api.workspace.createWorkspace.useMutation();
  const projectCreate = api.project.createProject.useMutation();
  const deviceCreate = api.device.createDevice.useMutation();
  const testCreate = api.test.createTest.useMutation();
  const measurementCreate = api.measurement.createMeasurement.useMutation();

  const createSample = async () => {
    setIsCreating(true);
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
      measurementType: "boolean",
    });

    for (let i = 1; i <= 10; i++) {
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
        data: { passed: Math.random() < 0.9 },
      });
    }

    router.refresh();
    setIsCreating(false);
  };

  return (
    <Button
      size="sm"
      disabled={isCreating}
      variant="outline"
      onClick={() =>
        toast.promise(createSample, {
          loading: "Creating your sample workspace + project...",
          success: "The sample is ready!",
          error: (err) => {
            console.log(err);
            setIsCreating(false);
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
