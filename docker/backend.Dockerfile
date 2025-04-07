FROM node:20-alpine

WORKDIR /app

COPY package.json pnpm-lock.yaml* pnpm-workspace.yaml turbo.json ./
COPY packages packages
COPY apps/backend apps/backend

RUN npm install -g pnpm turbo
RUN pnpm install --frozen-lockfile
RUN cd ./apps/backend && pnpm install
RUN pnpm db:generate
RUN pnpm build

EXPOSE 3001

CMD [ "pnpm", "start:backend" ]