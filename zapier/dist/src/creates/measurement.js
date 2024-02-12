"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("../utils");
const inputFieldUrl = `${utils_1.baseURL}/api/zapier/measurement-fields`;
const inputFields = async (z, bundle) => {
    const options = {
        method: "GET",
        headers: {
            Accept: "application/json",
            Authorization: `Bearer ${bundle.authData.access_token}`,
        },
        params: {},
    };
    return z.request(inputFieldUrl, options).then((response) => {
        response.throwForStatus();
        const results = response.json;
        return results;
    });
};
const performURL = `${utils_1.baseURL}/api/v1/measurements`;
const perform = async (z, bundle) => {
    const options = {
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
                value: bundle.inputData.type === "boolean"
                    ? Boolean(bundle.inputData.data)
                    : JSON.parse(bundle.inputData.data),
            },
            pass: Boolean(bundle.inputData.pass),
        },
    };
    return z.request(performURL, options).then((response) => {
        response.throwForStatus();
        const results = response.json;
        return results;
    });
};
exports.default = {
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
                helpText: "This should be either boolean for Data Type `boolean` or `Record<string, number[] | string[]` type in string",
                required: true,
                list: false,
                altersDynamicFields: false,
            },
            {
                key: "pass",
                label: "Passed?",
                type: "boolean",
                required: true,
                list: false,
                altersDynamicFields: false,
            },
        ],
        perform: perform,
    },
};
