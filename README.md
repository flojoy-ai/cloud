# Flojoy Cloud

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

5. If you need to run migrations, use the following command:

```bash
pnpm db:generate # This generates the migration files
pnpm db:migrate
```
