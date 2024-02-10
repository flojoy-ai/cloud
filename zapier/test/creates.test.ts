import { type Bundle, createAppTester, tools } from "zapier-platform-core";
import App from "../src/index";
import { describe, test, expect } from "@jest/globals";
import measurement, {
  type MeasurementInputData,
} from "../src/creates/measurement";

const appTester = createAppTester(App);
tools.env.inject();

describe("Measurement", () => {
  test("creates a measurement", async () => {
    const bundle = {
      inputData: {
        hardwareId: "test-123",
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
    expect(result).toHaveProperty("hardwareId", bundle.inputData.hardwareId);
    expect(result).toHaveProperty("testId", bundle.inputData.testId);
    expect(result).toHaveProperty("name", bundle.inputData.name);
    expect(result).toHaveProperty("pass", bundle.inputData.pass);
  });
});
