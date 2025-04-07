FROM node:20-alpine

WORKDIR /app

COPY package.json pnpm-lock.yaml* turbo.json ./
COPY packages packages
COPY apps/frontend apps/frontend

RUN npm install -g pnpm turbo
RUN cd ./apps/frontend && pnpm install

EXPOSE 5173

CMD [ "pnpm", "start:frontend" ]