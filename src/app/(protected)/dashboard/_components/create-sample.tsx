"use client";

import { init } from "@paralleldrive/cuid2";
import _ from "lodash";
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
  const devicesCreate = api.device.createDevices.useMutation();
  const testCreate = api.test.createTest.useMutation();
  const measurementsCreate = api.measurement.createMeasurements.useMutation();

  const createId = init({
    random: Math.random,
    // the length of the id
    length: 8,
  });

  const createSampleBoolean = async () => {
    setIsCreating(true);
    const workspace = await workspaceCreate.mutateAsync({
      name: "Sample Workspace",
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

    const devices = await devicesCreate.mutateAsync(
      _.times(10, (i) => ({
        name: `Circuit Board #${i + 1}`,
        projectId: project.id,
      })),
    );

    await measurementsCreate.mutateAsync(
      devices.map((device) => ({
        name: "Did Power On",
        deviceId: device.id,
        testId: test.id,
        measurementType: "boolean",
        data: { type: "boolean", passed: Math.random() < 0.8 },
      })),
    );

    router.refresh();
    setIsCreating(false);
  };

  const createSampleDataFrame = async () => {
    setIsCreating(true);

    const workspace = await workspaceCreate.mutateAsync({
      name: "Sample Workspace " + createId(),
    });

    const project = await projectCreate.mutateAsync({
      name: "My Circuit Testing Project",
      workspaceId: workspace.id,
    });

    const test = await testCreate.mutateAsync({
      name: "Expected vs Measured",
      projectId: project.id,
      measurementType: "dataframe",
    });

    const devices = await devicesCreate.mutateAsync(
      _.times(3, (i) => ({
        name: `Circuit Board #${i + 1}`,
        projectId: project.id,
      })),
    );

    const generateRandomNumbers = () => {
      const randomNumbers = [];

      for (let i = 0; i < 10; i++) {
        const randomNumber = Math.random();
        randomNumbers.push(randomNumber);
      }

      return randomNumbers;
    };

    await measurementsCreate.mutateAsync(
      devices.map((device) => ({
        name: "Data Point",
        deviceId: device.id,
        testId: test.id,
        measurementType: "dataframe",
        data: {
          type: "dataframe",
          dataframe: {
            x: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
            y: generateRandomNumbers(),
          },
        },
      })),
    );

    router.refresh();
    setIsCreating(false);
  };

  return (
    <Button
      size="sm"
      disabled={isCreating}
      variant="outline"
      onClick={() =>
        toast.promise(createSampleDataFrame, {
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
