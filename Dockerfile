# Production image — no npm dependencies, just Node + the app.
FROM node:20-alpine
WORKDIR /app
COPY . .
ENV PORT=3000
EXPOSE 3000
USER node
CMD ["node", "server/index.js"]
