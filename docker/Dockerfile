FROM node:20-alpine

ENV GENERATE_SOURCEMAP=false
ENV NODE_OPTIONS=--max-old-space-size=16384

WORKDIR /app

COPY . .

RUN npm i -g pnpm

RUN pnpm install

RUN pnpm build

CMD ["pnpm", "start"]

EXPOSE 3000
