import { getMeasurementValueByType } from "src/utils";
import { baseURL } from "../env";
import {
  type HttpRequestOptions,
  type Bundle,
  type ZObject,
} from "zapier-platform-core";
import { MeasurementInputData } from "src/types/measurement";

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
      hardwareId: bundle.inputData.hardwareId,
      testId: bundle.inputData.testId,
      name: bundle.inputData.name,
      data: {
        type: bundle.inputData.type,
        value: getMeasurementValueByType(
          bundle.inputData.data,
          bundle.inputData.type,
        ),
      },
      pass: Boolean(bundle.inputData.pass),
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
    inputFields: [
      inputFields,
      {
        key: "name",
        label: "Name",
        type: "string",
        required: false,
        list: false,
        altersDynamicFields: false,
      },
      {
        key: "type",
        label: "Data Type",
        type: "string",
        choices: ["boolean", "dataframe"],
        required: true,
        list: false,
        altersDynamicFields: false,
      },
      {
        key: "data",
        label: "Data",
        type: "string",
        helpText:
          "This should be either boolean for Data Type `boolean` or `Record<string, number[] | string[]` type in string",
        required: true,
        list: false,
        altersDynamicFields: false,
      },
      {
        key: "pass",
        label: "Passed?",
        type: "boolean",
        required: false,
        list: false,
        altersDynamicFields: false,
      },
    ],
    perform: perform,
  },
};
