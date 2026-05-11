FROM node:20-slim

# Install Chromium for Playwright (optional — only if PLAYWRIGHT sources are added)
# Uncomment below if you add PLAYWRIGHT-type sources:
# RUN apt-get update && apt-get install -y \
#     chromium \
#     fonts-liberation \
#     libgbm1 \
#     libnss3 \
#     libatk-bridge2.0-0 \
#     libgtk-3-0 \
#     libxss1 \
#     --no-install-recommends && rm -rf /var/lib/apt/lists/*
# ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

WORKDIR /app

COPY package*.json ./
RUN npm install --production=false

COPY tsconfig.json ./
COPY src ./src

RUN npm run build

# Prune dev dependencies for smaller image
RUN npm prune --production

EXPOSE 3001

CMD ["npm", "start"]
