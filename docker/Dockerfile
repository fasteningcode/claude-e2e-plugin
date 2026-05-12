FROM node:22-alpine AS builder

WORKDIR /app

RUN corepack enable && corepack prepare pnpm@latest --activate

COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY packages/mcp-server/package.json ./packages/mcp-server/
COPY packages/playwright-agent/package.json ./packages/playwright-agent/
COPY packages/appium-agent/package.json ./packages/appium-agent/

RUN pnpm install --frozen-lockfile --ignore-scripts

COPY tsconfig.base.json ./
COPY packages/ ./packages/

RUN pnpm -r run build


FROM node:22-alpine AS runtime

WORKDIR /app

RUN corepack enable && corepack prepare pnpm@latest --activate

COPY --from=builder /app/package.json /app/pnpm-workspace.yaml ./
COPY --from=builder /app/packages/mcp-server/package.json ./packages/mcp-server/
COPY --from=builder /app/packages/playwright-agent/package.json ./packages/playwright-agent/
COPY --from=builder /app/packages/appium-agent/package.json ./packages/appium-agent/

RUN pnpm install --frozen-lockfile --prod --ignore-scripts

COPY --from=builder /app/packages/mcp-server/dist ./packages/mcp-server/dist
COPY --from=builder /app/packages/playwright-agent/dist ./packages/playwright-agent/dist
COPY --from=builder /app/packages/appium-agent/dist ./packages/appium-agent/dist

ENV NODE_ENV=production
ENV PORT=7860

EXPOSE 7860

CMD ["node", "packages/mcp-server/dist/index.js"]
