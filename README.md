# Flojoy Cloud

## Deployment

### With Docker

To deploy Cloud app with Docker, follow following steps:

1. Create a .env file with following environment variables:

```txt
AWS_REGION=""                           # AWS region
AWS_ACCESS_KEY_ID=""                    # AWS access key
AWS_SECRET_ACCESS_KEY=""                # AWS secret key
SENDER_EMAIL=""                         # Email registered for AWS SES
GOOGLE_CLIENT_ID=""                     # Google auth client id
GOOGLE_CLIENT_SECRET=""                 # Google client secret
DATABASE_URL=""                         # Postgresql DB connection URL

GOOGLE_REDIRECT_URI="https://<cloud-domain>/login/google/callback"
NEXT_PUBLIC_URL_ORIGIN="https://<cloud-domain>"
```

2. Build Docker image:

```bash
    docker compose build
```

3. Run Cloud app container:

```bash
   docker compose up
```

NOTE: App will start on port 3000 by default. You can change that by providing `PORT=<port>` in `.env` file. For HTTPS connections and reverse-proxy, consider using Nginx or Apache servers.

## Development

### Prerequisites

Besides all the standard Node.js stuff, you will also need:

- [Just](https://just.systems)

To initialize the development environment, run

```bash
just init
```

This will install all the NPM packages and
grab all the environment variables you need from Vercel.

### Contributing

1. Create a branch and push it to remote. For example:

```bash
git checkout -b joey/clo-4-workspace-slug
git push -u origin joey/clo-4-workspace-slug
```

2. Raise a draft PR such that Neon can generate a DB branch for you.

```bash
gh pr create
```

3. Get the new environment variables dedicated for this branch.

```bash
just env
```

4. Start the development server.

```bash
just dev
```

5. Migration scripts can be found in the package.json in `apps/frontend`
