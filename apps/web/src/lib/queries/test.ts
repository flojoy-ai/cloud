import { Workspace } from "@cloud/shared";
import { queryOptions } from "@tanstack/react-query";
import { client } from "../client";

type GetTestParams = {
  testId: string;
  context: {
    workspace: Workspace;
  };
};

export function getTestQueryKey(testId: string) {
  return ["test", testId];
}

export function getTestQueryOpts({ testId, context }: GetTestParams) {
  return queryOptions({
    queryFn: async () => {
      const { data, error } = await client.test({ testId }).index.get({
        headers: { "flojoy-workspace-id": context.workspace.id },
      });
      if (error) throw error;
      return data;
    },
    queryKey: getTestQueryKey(testId),
  });
}

type GetTestMeasurementsParams = {
  testId: string;
  context: {
    workspace: Workspace;
  };
};

export function getTestMeasurementsQueryKey(testId: string) {
  return ["test", "measurements", testId];
}

export function getTestMeasurementsQueryOpts({
  testId,
  context,
}: GetTestMeasurementsParams) {
  return queryOptions({
    queryFn: async () => {
      const { data, error } = await client.test({ testId }).measurements.get({
        headers: { "flojoy-workspace-id": context.workspace.id },
      });
      if (error) throw error;
      return data;
    },
    queryKey: getTestMeasurementsQueryKey(testId),
  });
}
