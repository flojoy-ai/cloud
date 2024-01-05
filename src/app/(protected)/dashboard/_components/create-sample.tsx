"use client";

import { init } from "@paralleldrive/cuid2";
import _ from "lodash";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "~/components/ui/button";
import { getPsdData, getSampleData } from "~/lib/sample-data";
import { api } from "~/trpc/react";

const CreateSample = () => {
  const router = useRouter();
  const [isCreating, setIsCreating] = useState<boolean>(false);
  const workspaceCreate = api.workspace.createWorkspace.useMutation();
  const projectCreate = api.project.createProject.useMutation();
  const devicesCreate = api.device.createDevices.useMutation();
  const testCreate = api.test.createTest.useMutation();
  const measurementsCreate = api.measurement.createMeasurements.useMutation();

  getSampleData("/current.csv")
    .then((data) => {
      console.log("Current data:", data);
    })
    .catch((err) => {
      console.error(err);
    });
  getSampleData("/psd.csv")
    .then((data) => {
      console.log("Current data:", data);
    })
    .catch((err) => {
      console.error(err);
    });
  getSampleData("/atten.csv")
    .then((data) => {
      console.log("Current data:", data);
    })
    .catch((err) => {
      console.error(err);
    });

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
      name: "Sample Workspace" + createId(),
    });

    const project = await projectCreate.mutateAsync({
      name: "HL1234 Testing Project",
      workspaceId: workspace.id,
    });

    // boolean example
    // const booleanTest = await testCreate.mutateAsync({
    //   name: "Pass/Fail Test",
    //   projectId: project.id,
    //   measurementType: "boolean",
    // });

    const devices = await devicesCreate.mutateAsync(
      _.times(9, (i) => ({
        name: `HL1234-SN000${i + 1}`,
        projectId: project.id,
      })),
    );

    // await measurementsCreate.mutateAsync(
    //   devices.map((device, i) => ({
    //     name: "Did Power On",
    //     deviceId: device.id,
    //     testId: booleanTest.id,
    //     measurementType: "boolean",
    //     createdAt: new Date(new Date().getTime() + i * 20000),
    //     data: { type: "boolean", passed: Math.random() < 0.8 },
    //   })),
    // );

    // dataframe example
    // const dataframeTest = await testCreate.mutateAsync({
    //   name: "Expected vs Measured",
    //   projectId: project.id,
    //   measurementType: "dataframe",
    // });
    //
    // await measurementsCreate.mutateAsync(
    //   devices.map((device, i) => ({
    //     name: "Data Point",
    //     deviceId: device.id,
    //     testId: dataframeTest.id,
    //     measurementType: "dataframe",
    //     createdAt: new Date(new Date().getTime() + i * 20000),
    //     data: {
    //       type: "dataframe",
    //       dataframe: {
    //         x: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    //         y: generateRandomNumbers(),
    //       },
    //     },
    //   })),
    // );

    const currentTest = await testCreate.mutateAsync({
      name: "Expected vs Measured Current",
      projectId: project.id,
      measurementType: "dataframe",
    });

    const currentData = (await getSampleData("/current.csv")) as Record<
      string,
      number[] | string[]
    >;

    await measurementsCreate.mutateAsync([
      {
        name: "Current values",
        deviceId: devices[0]!.id,
        testId: currentTest.id,
        measurementType: "dataframe",
        createdAt: new Date(),
        data: {
          type: "dataframe",
          dataframe: currentData,
        },
      },
    ]);

    const psdData = await getPsdData();

    const psdDevices = await devicesCreate.mutateAsync(
      psdData.deviceNames.map((name) => ({
        name,
        projectId: project.id,
      })),
    );

    const psdPassFailTest = await testCreate.mutateAsync({
      name: "PSD (Pass/Fail)",
      projectId: project.id,
      measurementType: "boolean",
    });

    await measurementsCreate.mutateAsync(
      _.zip(psdDevices, psdData.passFail, _.range(psdDevices.length)).map(
        ([device, pass, i]) => ({
          name: "PSD Data Point",
          deviceId: device!.id,
          testId: psdPassFailTest.id,
          measurementType: "dataframe",
          createdAt: new Date(new Date().getTime() + i! * 20000),
          data: {
            type: "boolean",
            passed: pass!,
          },
        }),
      ),
    );

    const psdTest = await testCreate.mutateAsync({
      name: "PSD",
      projectId: project.id,
      measurementType: "dataframe",
    });

    await measurementsCreate.mutateAsync(
      _.zip(psdDevices, psdData.y, _.range(psdDevices.length)).map(
        ([device, y, i]) => ({
          name: "PSD Data Point",
          deviceId: device!.id,
          testId: psdTest.id,
          measurementType: "dataframe",
          createdAt: new Date(new Date().getTime() + i! * 20000),
          data: {
            type: "dataframe",
            dataframe: {
              Frequency: psdData.x,
              "dB/Hz": y!,
            },
          },
        }),
      ),
    );

    await measurementsCreate.mutateAsync(
      devices.map((device, i) => ({
        name: "PSD",
        deviceId: device.id,
        testId: psdPassFailTest.id,
        measurementType: "boolean",
        createdAt: new Date(new Date().getTime() + i * 20000),
        data: { type: "boolean", passed: Math.random() < 0.8 },
      })),
    );

    const attenuationData = (await getSampleData("/atten.csv")) as Record<
      string,
      number[] | string[]
    >;

    const attenuationTest = await testCreate.mutateAsync({
      name: "Expected vs Measured Attenuation",
      projectId: project.id,
      measurementType: "dataframe",
    });

    await measurementsCreate.mutateAsync([
      {
        name: "Attenuation values",
        deviceId: devices[0]!.id,
        testId: attenuationTest.id,
        measurementType: "dataframe",
        createdAt: new Date(),
        data: {
          type: "dataframe",
          dataframe: attenuationData,
        },
      },
    ]);

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
