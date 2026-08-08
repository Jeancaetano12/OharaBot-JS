FROM oven/bun:1
WORKDIR /app

COPY package.json bun.lock* ./
RUN bun install --frozen-lockfile

COPY . .

# Caso precise registrar comandos no Discord antes de iniciar
# RUN bun deploy-commands.js

CMD ["bun", "run", "start"]

