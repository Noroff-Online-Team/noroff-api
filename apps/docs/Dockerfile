# Builder Stage
FROM node:18.17.0-alpine AS builder
WORKDIR /app
RUN yarn global add turbo && \
    addgroup --system --gid 1001 noroff && \
    adduser --system --uid 1001 noroff
COPY . .
RUN turbo prune --scope=docs --docker

# Installer Stage
FROM node:18.17.0-alpine AS installer
WORKDIR /app
COPY .gitignore .gitignore
COPY turbo.json turbo.json
COPY --from=builder /app/out/json/ .
COPY --from=builder /app/out/yarn.lock ./yarn.lock
RUN yarn install
COPY --from=builder /app/out/full/ .
RUN yarn turbo run build --filter=docs...

# Runner Stage
FROM node:18.17.0-alpine AS runner
WORKDIR /app
RUN addgroup --system --gid 1001 noroff && \
    adduser --system --uid 1001 noroff
USER noroff
COPY --from=installer /app/apps/docs/public /app/apps/docs/public
COPY --from=installer /app/apps/docs/.next/standalone /app
COPY --from=installer /app/apps/docs/.next/static /app/apps/docs/.next/static
WORKDIR /app/apps/docs
EXPOSE 3000
CMD [ "node", "server.js" ]