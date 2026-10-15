# COBOL Studio — Node + GnuCOBOL (same toolchain CI uses on Ubuntu)
FROM node:20-bookworm

RUN apt-get update \
  && apt-get install -y --no-install-recommends \
    gnucobol \
    gcc \
    libc6-dev \
  && rm -rf /var/lib/apt/lists/* \
  && cobc --version

WORKDIR /app

# Workspace manifests first (better layer cache)
COPY package.json package-lock.json ./
COPY apps/studio/package.json ./apps/studio/
COPY packages/runtime-kit/package.json ./packages/runtime-kit/
COPY packages/estate-model/package.json ./packages/estate-model/
COPY packages/estate-ingest/package.json ./packages/estate-ingest/
COPY packages/easylang/package.json ./packages/easylang/

RUN npm ci

COPY . .

# Production UI bundle; drop build-only deps after
RUN npm run studio:build \
  && npm prune --omit=dev

ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=8787

EXPOSE 8787

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:'+(process.env.PORT||8787)+'/api/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

CMD ["npm", "run", "studio:start"]
