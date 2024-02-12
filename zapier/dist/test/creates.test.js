"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const zapier_platform_core_1 = require("zapier-platform-core");
const index_1 = require("../src/index");
const globals_1 = require("@jest/globals");
const measurement_1 = require("../src/creates/measurement");
const appTester = (0, zapier_platform_core_1.createAppTester)(index_1.default);
zapier_platform_core_1.tools.env.inject();
(0, globals_1.describe)("Measurement", () => {
    (0, globals_1.test)("creates a measurement", async () => {
        const bundle = {
            inputData: {
                hardwareId: "test-123",
                testId: "test-234",
                name: "my test",
                type: "boolean",
                data: "false",
                pass: true,
            },
        };
        const result = await appTester(index_1.default.creates[measurement_1.default.key].operation.perform, bundle);
        (0, globals_1.expect)(result).toBeDefined();
    });
});
