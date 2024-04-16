# ----- dev -----

dev:
  bun dev

# ----- build -----

build:
  bun run build

# ----- install -----

install: install-bun && install-poetry

install-bun:
  bun install

install-poetry:
  just packages/python/install

# ----- update -----

update: update-bun && update-poetry

update-bun:
  bun update

update-poetry:
  just packages/python/update

# ----- format -----

format: format-prettier && format-ruff

format-prettier:
  bun run prettier --write .

format-ruff:
  just packages/python/format

# ----- lint -----

lint: lint-eslint && lint-ruff

lint-eslint:
  bun run lint

lint-ruff:
  just packages/python/lint

# ----- check -----

check: check-prettier && check-ruff

check-prettier:
  bun run prettier --check .

check-ruff:
  just packages/python/check

# ----- railway -----

railway:
  just apps/web/railway
  just apps/server/railway

# ----- env -----

env:
  just apps/web/railway
  just apps/server/railway

# ----- nuke -----

nuke:
  rm -rf node_modules
  rm -rf apps/server/node_modules
  rm -rf apps/web/node_modules

# ----- postgres -----

postgres:
  docker compose -f docker-compose.dev.yml up
