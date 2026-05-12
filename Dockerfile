FROM node:22-alpine

WORKDIR /app

RUN corepack enable && corepack prepare pnpm@latest --activate

COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY packages/mcp-server/package.json ./packages/mcp-server/
COPY packages/playwright-agent/package.json ./packages/playwright-agent/
COPY packages/appium-agent/package.json ./packages/appium-agent/
COPY fixtures/web-app/package.json ./fixtures/web-app/
COPY fixtures/mobile-app/package.json ./fixtures/mobile-app/

RUN pnpm install --frozen-lockfile --prod --ignore-scripts

COPY packages/mcp-server/dist ./packages/mcp-server/dist
COPY packages/playwright-agent/dist ./packages/playwright-agent/dist
COPY packages/appium-agent/dist ./packages/appium-agent/dist

ENV NODE_ENV=production
ENV PORT=7860

EXPOSE 7860

CMD ["node", "packages/mcp-server/dist/index.js"]
