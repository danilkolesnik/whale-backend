FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma/

RUN npm install

COPY . .

RUN npx prisma generate

RUN npm run build

# Установка nginx
RUN apk add --no-cache nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 3000

# Запуск Node и nginx
CMD ["sh", "-c", "npm run start:dev & nginx -g 'daemon off;'"]