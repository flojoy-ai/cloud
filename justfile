init:
  pnpm install
  pnpm vercel link
  pnpm vercel env pull

dev:
  pnpm vercel env pull
  pnpm dev

reset:
  pnpm vercel env pull
  pnpm db:migrate

nuke:
  -docker kill $(docker ps -aq)
  docker rm $(docker ps -aq)
