branch := `git branch --show-current`

init:
  pnpm install
  pnpm vercel link
  pnpm prepare

env:
  pnpm vercel env pull --environment=preview --git-branch={{branch}}

dev:
  pnpm dev

