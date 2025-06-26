#!/bin/bash

# Настройка SSL сертификата для neriumtest1.website
echo "🚀 Настройка SSL сертификата для neriumtest1.website"

# Запрос email для Let's Encrypt
echo "Введите ваш email для Let's Encrypt:"
read email

if [ -z "$email" ]; then
    echo "❌ Email обязателен!"
    exit 1
fi

# Обновляем команду certbot с реальным email
sed -i "s/your-email@example.com/$email/g" docker-compose.yml

echo "📋 Порядок запуска:"
echo "1. Убеждаемся, что домен neriumtest1.website указывает на ваш сервер"
echo "2. Запускаем nginx без SSL для получения сертификата"
echo "3. Получаем SSL сертификат"
echo "4. Перезапускаем с полной HTTPS конфигурацией"

echo ""
echo "⚠️  ВАЖНО: Перед запуском убедитесь, что:"
echo "   - Домен neriumtest1.website указывает на IP вашего сервера"
echo "   - Порты 80 и 443 открыты в файрволе"
echo ""

echo "🔥 Команды для запуска:"
echo ""
echo "# 1. Запуск для получения сертификата (первый раз)"
echo "docker-compose up -d nginx"
echo "docker-compose run --rm certbot"
echo ""
echo "# 2. После получения сертификата - полный запуск"
echo "docker-compose up -d"
echo ""
echo "# 3. Обновление сертификата (настроить в cron)"
echo "docker-compose run --rm certbot renew"
echo "docker-compose exec nginx nginx -s reload"

echo ""
echo "✅ Готово! Ваша конфигурация настроена для HTTPS на neriumtest1.website" 