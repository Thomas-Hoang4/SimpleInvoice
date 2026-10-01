# Stage 1: Build NestJS application
FROM node:22-alpine AS builder

WORKDIR /app

RUN corepack enable && corepack prepare yarn@4.10.3 --activate

COPY .yarnrc.yml package.json yarn.lock ./
COPY backend/package.json ./backend/
COPY frontend/package.json ./frontend/

RUN yarn install

COPY backend ./backend

WORKDIR /app/backend
RUN npx prisma generate
RUN yarn build

# Stage 2: Production runner
FROM node:22-alpine AS runner

WORKDIR /app

RUN corepack enable && corepack prepare yarn@4.10.3 --activate

COPY .yarnrc.yml package.json yarn.lock ./
COPY backend/package.json ./backend/

RUN yarn workspaces focus backend --production

COPY --from=builder /app/backend/dist ./backend/dist
COPY --from=builder /app/backend/prisma ./backend/prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma

WORKDIR /app/backend
EXPOSE 3000

ENV NODE_ENV=production

CMD ["node", "dist/main"]
