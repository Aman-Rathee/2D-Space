FROM node:20-alpine

WORKDIR /app

RUN npm install -g pnpm turbo

COPY package.json pnpm-lock.yaml* pnpm-workspace.yaml turbo.json ./
COPY packages packages
COPY apps/backend apps/backend

RUN pnpm install --frozen-lockfile
RUN pnpm db:generate
RUN pnpm build

EXPOSE 3001

CMD [ "pnpm", "start:backend" ]