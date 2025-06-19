#!/bin/bash
set -e

# Создание базы данных whale (если она не существует)
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" <<-EOSQL
  SELECT 'CREATE DATABASE whale'
  WHERE NOT EXISTS (
    SELECT FROM pg_database WHERE datname = 'whale'
  )\gexec
EOSQL