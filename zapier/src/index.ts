import authentication from "./authenticate";
import { version as platformVersion } from "zapier-platform-core";
import measurementCreate from "./creates/measurement";

import { version } from "../package.json";

export default {
  version,
  platformVersion,
  authentication,
  creates: {
    [measurementCreate.key]: measurementCreate,
  },
  flags: { skipThrowForStatus: false },
};
