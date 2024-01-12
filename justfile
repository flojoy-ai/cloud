init:
  pnpm install
  # pnpm vercel link
  # pnpm vercel env pull
  just migrate

dev:
  # pnpm vercel env pull
  docker compose -f docker-compose.dev.yml up

migrate:
  docker compose -f docker-compose.dev.yml run flojoy-cloud-next pnpm db:migrate

reset:
  # pnpm vercel env pull
  rm -rf data

stop:
  docker compose -f docker-compose.dev.yml down

nuke:
  -docker kill $(docker ps -aq)
  docker rm $(docker ps -aq)
