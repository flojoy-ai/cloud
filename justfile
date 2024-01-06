set dotenv-load := true
set dotenv-filename := ".env.local"

init:
  vercel link
  vercel env pull
  supabase start
  supabase status
  pnpm install
  supabase db reset
  pnpm db:push

dev:
  pnpm dev

reset:
  supabase start
  supabase db reset

stop:
  supabase stop
