branch := `git branch --show-current`

init:
  pnpm install
  pnpm vercel link

env:
  pnpm vercel env pull --environment=preview --git-branch={{branch}}

dev:
  pnpm dev

migrate-latest:
  pnpm migrate:to-latest
  pnpm kysely:gen
