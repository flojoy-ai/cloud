"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const authenticate_1 = require("./authenticate");
const zapier_platform_core_1 = require("zapier-platform-core");
const measurement_1 = require("./creates/measurement");
const package_json_1 = require("../package.json");
exports.default = {
    version: package_json_1.version,
    platformVersion: zapier_platform_core_1.version,
    authentication: authenticate_1.default,
    creates: {
        [measurement_1.default.key]: measurement_1.default,
    },
    flags: { skipThrowForStatus: false },
};
