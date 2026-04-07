FROM node:18-alpine AS base

WORKDIR /app

COPY package*.json ./
RUN npm ci

FROM base AS builder

COPY . .
RUN npm run build

FROM nginx:alpine AS production

COPY --from=builder /app/out /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 3000

CMD ["nginx", "-g", "daemon off;"]