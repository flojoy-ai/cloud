import { getMeasurementValueByType } from "../utils";
import { baseURL } from "../env";
import {
  type HttpRequestOptions,
  type Bundle,
  type ZObject,
} from "zapier-platform-core";
import { MeasurementInputData } from "../types/measurement";

const inputFieldUrl = `${baseURL}/api/zapier/measurement-fields`;
const inputFields = async (z: ZObject, bundle: Bundle) => {
  const options: HttpRequestOptions = {
    method: "GET",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${bundle.authData.access_token}`,
    },
    params: {},
  };

  return z.request(inputFieldUrl, options).then((response) => {
    response.throwForStatus();
    const results = response.json as Array<Record<string, string>>;
    return results;
  });
};

const performURL = `${baseURL}/api/v1/measurements`;
const perform = async (z: ZObject, bundle: Bundle<MeasurementInputData>) => {
  const options: HttpRequestOptions = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Bearer ${bundle.authData.access_token}`,
    },
    params: {},
    body: {
      unitId: bundle.inputData.unitId,
      testId: bundle.inputData.testId,
      name: bundle.inputData.name,
      data: {
        type: bundle.inputData.type,
        value: getMeasurementValueByType(
          bundle.inputData.data,
          bundle.inputData.type,
        ),
      },
      pass:
        typeof bundle.inputData.pass !== "undefined"
          ? Boolean(bundle.inputData.pass)
          : null,
    },
  };

  return z.request(performURL, options).then((response) => {
    response.throwForStatus();
    const results = response.json as Record<string, string>;
    return results;
  });
};

export default {
  display: {
    description: "Creates a measurement",
    hidden: false,
    label: "Create a new measurement",
  },
  key: "measurement",
  noun: "Measurement",
  operation: {
    inputFields: [inputFields],
    perform: perform,
  },
};
