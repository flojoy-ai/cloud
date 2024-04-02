import { type Bundle, createAppTester, tools } from "zapier-platform-core";
import App from "../src/index";
import { describe, test, expect } from "@jest/globals";
import { type MeasurementInputData } from "../src/types/measurement";
import measurement from "../src/creates/measurement";

const appTester = createAppTester(App);
tools.env.inject();

describe("Measurement", () => {
  test("creates a measurement", async () => {
    const bundle = {
      inputData: {
        unitId: "test-123",
        testId: "test-234",
        name: "my test",
        type: "boolean",
        data: "false",
        pass: true,
      },
    } as Bundle<MeasurementInputData>;
    const result = await appTester(
      App.creates[measurement.key].operation.perform,
      bundle,
    );
    expect(result).toHaveProperty("id");
    expect(result).toHaveProperty("unitId", bundle.inputData.unitId);
    expect(result).toHaveProperty("testId", bundle.inputData.testId);
    expect(result).toHaveProperty("name", bundle.inputData.name);
    expect(result).toHaveProperty("pass", bundle.inputData.pass);
  });
});
