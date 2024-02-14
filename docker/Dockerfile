FROM node:20-alpine

WORKDIR /app

COPY . .

RUN npm i -g pnpm && pnpm install

RUN pnpm install

# RUN pnpm build

CMD ["pnpm", "dev"]

EXPOSE 3000
