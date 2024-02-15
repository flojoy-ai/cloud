import { createNextRoute, createNextRouter } from "@ts-rest/next";
import { contract } from "~/contract/contract";
import { secretRouter } from "~/handlers/secret";

const router = createNextRoute(contract, {
  secret: secretRouter,
});

// Actually initiate the collective endpoints
export default createNextRouter(contract, router);
