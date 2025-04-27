FROM node:20-alpine

WORKDIR /app

RUN npm install -g pnpm turbo

COPY package.json pnpm-lock.yaml* pnpm-workspace.yaml turbo.json ./
COPY packages packages
COPY apps/frontend apps/frontend

RUN pnpm install --frozen-lockfile
RUN pnpm build

EXPOSE 4173

CMD [ "pnpm", "start:frontend" ]