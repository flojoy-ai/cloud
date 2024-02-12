"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("./utils");
const accessTokenUrl = `${utils_1.baseURL}/api/zapier/oauth/access-token`;
const getAccessToken = async (z, bundle) => {
    const options = {
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
        const results = response.json;
        return results;
    });
};
exports.default = {
    type: "oauth2",
    test: {
        headers: { Authorization: "Bearer {{bundle.authData.access_token}}" },
        url: `${utils_1.baseURL}/api/zapier/oauth/user`,
    },
    oauth2Config: {
        authorizeUrl: {
            url: `${utils_1.baseURL}/zapier/oauth`,
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
