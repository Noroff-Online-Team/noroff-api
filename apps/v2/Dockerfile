# Base Stage
FROM node:22.14.0-alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
# Update system and install openssl
RUN apk update && apk upgrade && \
    apk add --no-cache openssl
RUN corepack enable

# Builder Stage
FROM base AS builder
WORKDIR /app
RUN npm install -g turbo
COPY . .
RUN turbo prune v2 --docker

# Installer Stage
FROM base AS installer
WORKDIR /app
RUN npm install -g turbo
COPY .gitignore .gitignore
COPY turbo.json turbo.json
COPY --from=builder /app/out/json/ .
COPY --from=builder /app/out/pnpm-lock.yaml ./pnpm-lock.yaml
RUN pnpm install
COPY --from=builder /app/out/full/ .

# Uncomment and use build args to enable remote caching
# ARG TURBO_TEAM
# ENV TURBO_TEAM=$TURBO_TEAM
# ARG TURBO_TOKEN
# ENV TURBO_TOKEN=$TURBO_TOKEN

RUN turbo run build -F v2...

# Runner Stage
FROM base AS runner
WORKDIR /app
RUN addgroup --system --gid 1001 noroff && \
    adduser --system --uid 1001 noroff
USER noroff
COPY --from=installer --chown=noroff:noroff /app .
WORKDIR /app/apps/v2
EXPOSE 3000
CMD [ "pnpm", "start:migrate:prod" ]
