# Flojoy Cloud

## Development

### Prerequisites

Besides all the standard Node.js stuff, you will also need:

- [Docker](https://docs.docker.com/get-docker/)
- [Just](https://just.systems)

To initialize the development environment, run

```bash
just init
```

This will grab all the environment variables you need from Vercel, setup a local
Supabase instance (we are only using it for Postgres), and initialize the database.

### Running

```bash
just dev
```
