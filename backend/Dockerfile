FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install
RUN npm install -g nodemon ts-node

RUN apk add --no-cache nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf


EXPOSE 3000

CMD ["sh", "-c", "nodemon --watch src --ext ts,json --exec ts-node src/telegram/transactionBot/bot.ts & nginx -g 'daemon off;'"] 