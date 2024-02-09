import {
  type HttpRequestOptions,
  type Bundle,
  type ZObject,
} from "zapier-platform-core";
import { baseURL } from "./utils";

interface CustomBundle<T> extends Bundle<T> {
  cleanedRequest: {
    querystring: {
      workspace_secret: string;
    };
  };
}

const accessTokenUrl = `${baseURL}/api/zapier/oauth/access-token`;
const getAccessToken = async (
  z: ZObject,
  bundle: CustomBundle<{
    code: string;
    redirect_uri: string;
  }>,
) => {
  const options: HttpRequestOptions = {
    method: "POST",
    headers: {
      "content-type": "application/x-www-form-urlencoded",
      accept: "application/json",
      Authorization: `Bearer ${bundle.cleanedRequest.querystring.workspace_secret}`,
    },
    params: {},
    body: {
      code: bundle.inputData.code,
      client_id: process.env.CLIENT_ID,
      client_secret: process.env.CLIENT_SECRET,
      grant_type: "authorization_code",
      redirect_uri: bundle.inputData.redirect_uri,
      workspace_secret: bundle.cleanedRequest.querystring.workspace_secret,
    },
  };

  return z.request(accessTokenUrl, options).then((response) => {
    response.throwForStatus();
    const results = response.json as Record<string, string>;

    return results;
  });
};

export default {
  type: "oauth2",
  test: {
    headers: { Authorization: "Bearer {{bundle.authData.access_token}}" },
    url: `${baseURL}/api/zapier/oauth/user`,
  },
  oauth2Config: {
    authorizeUrl: {
      url: `${baseURL}/zapier/oauth`,
      params: {
        client_id: "{{process.env.CLIENT_ID}}",
        state: "{{bundle.inputData.state}}",
        redirect_uri: "{{bundle.inputData.redirect_uri}}",
        response_type: "code",
      },
    },
    getAccessToken: getAccessToken,
    refreshAccessToken: {
      body: {
        refresh_token: "{{bundle.authData.refresh_token}}",
        grant_type: "refresh_token",
      },
      headers: {
        "content-type": "application/x-www-form-urlencoded",
        accept: "application/json",
      },
      method: "POST",
    },
    enablePkce: false,
    autoRefresh: false,
  },
  connectionLabel: "{{bundle.authData.workspaceNamespace}}",
};
