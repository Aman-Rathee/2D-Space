FROM node:20-alpine

WORKDIR /app

RUN npm install -g pnpm turbo

COPY package.json pnpm-lock.yaml* pnpm-workspace.yaml turbo.json ./
COPY packages packages
COPY apps/ws apps/ws

RUN pnpm install --frozen-lockfile
RUN pnpm db:generate
RUN pnpm build

EXPOSE 8080

CMD [ "pnpm", "start:ws" ]