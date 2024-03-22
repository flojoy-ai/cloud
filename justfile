install:
  bun install
  just packages/python/install

dev:
  bun dev

update:
  bun update
  just packages/python/update

format:
  bun run prettier --write .
  just packages/python/format

check:
  bun run prettier --check .
  just packages/python/check
