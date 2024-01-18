#!/bin/bash

cat <<EOF >/root/cloud/.env

AUTH0_APP_DOMAIN="https://flojoy-dev.us.auth0.com"
AUTH0_CLIENT_ID="dekqx1Ihy3iSfCjjmiNBOwn9U5KM7t6K"
AUTH0_CLIENT_SECRET="9Jz9eEELjuVoRYtppXI-eihj2qxKVXvh18n96BO-bTt_Z6DmCuY3QtQU-bZLR_X2"
AUTH0_REDIRECT_URI="http://localhost:80/login/auth0/callback"
AWS_ACCESS_KEY_ID="AKIAW3MUZRBDNBKOVNEX"
AWS_BUCKET_NAME="flojoy-cloud"
AWS_REGION="us-east-2"
AWS_SECRET_ACCESS_KEY="4iNe8aIX19hJBSCUvqTLB1+GD8WeI1m1gSVtm37e"


# Required
GOOGLE_CLIENT_ID="170329447834-ree1b6u72143637akhng82q1ibka9lgq.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="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"
GOOGLE_REDIRECT_URI="http://localhost:80/login/google/callback"

# Required
JWT_SECRET="7851158cc1c255e7d5dada55f5ff05a366d6f45ea6eb73bccd9d2670996a2b24"

EOF
