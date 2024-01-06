init:
  pnpm install

  pnpm vercel link
  pnpm vercel env pull

  pnpm supabase start
  pnpm supabase status
  pnpm supabase db reset
  pnpm db:push

dev:
  pnpm dev

reset:
  pnpm supabase start
  pnpm supabase db reset

stop:
  pnpm supabase stop
