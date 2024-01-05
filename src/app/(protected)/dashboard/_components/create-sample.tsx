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

  const generateRandomNumbers = () => {
    const randomNumbers = [];

    for (let i = 0; i < 10; i++) {
      const randomNumber = Math.random();
      randomNumbers.push(randomNumber);
    }

    return randomNumbers;
  };

  const createSample = async () => {
    setIsCreating(true);
    const workspace = await workspaceCreate.mutateAsync({
      name: "Sample Workspace " + createId(),
    });

    const project = await projectCreate.mutateAsync({
      name: "HL1234 Testing Project",
      workspaceId: workspace.id,
    });

    // boolean example
    const booleanTest = await testCreate.mutateAsync({
      name: "Pass/Fail Test",
      projectId: project.id,
      measurementType: "boolean",
    });

    const devices = await devicesCreate.mutateAsync(
      _.times(9, (i) => ({
        name: `HL1234-SN000${i + 1}`,
        projectId: project.id,
      })),
    );

    await measurementsCreate.mutateAsync(
      devices.map((device, i) => ({
        name: "Did Power On",
        deviceId: device.id,
        testId: booleanTest.id,
        measurementType: "boolean",
        createdAt: new Date(new Date().getTime() + i * 20000),
        data: { type: "boolean", passed: Math.random() < 0.8 },
      })),
    );

    // dataframe example
    const dataframeTest = await testCreate.mutateAsync({
      name: "Expected vs Measured",
      projectId: project.id,
      measurementType: "dataframe",
    });

    await measurementsCreate.mutateAsync(
      devices.map((device, i) => ({
        name: "Data Point",
        deviceId: device.id,
        testId: dataframeTest.id,
        measurementType: "dataframe",
        createdAt: new Date(new Date().getTime() + i * 20000),
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
      variant="secondary"
      onClick={() =>
        toast.promise(createSample, {
          loading: "Creating your sample workspace...",
          success: "The sample is ready!",
          error: (err) => {
            console.log(err);
            setIsCreating(false);
            return "Something went wrong :(";
          },
        })
      }
    >
      Create a Sample Workspace
    </Button>
  );
};

export default CreateSample;
