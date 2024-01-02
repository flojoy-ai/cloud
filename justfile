set dotenv-load := true
set dotenv-filename := ".env.local"

init:
  vercel env pull
  supabase start
  pnpm install
  pnpm db:push

dev:
  pnpm dev

stop:
  supabase stop
