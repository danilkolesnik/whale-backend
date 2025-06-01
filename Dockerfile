FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

# Генерируем Prisma Client
RUN npx prisma generate

# В режиме разработки не будем делать build
# RUN npm run build

EXPOSE 3000

# Используем start:dev для разработки
CMD ["npm", "run", "start:dev"] 