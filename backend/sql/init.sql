-- Create tables
CREATE TABLE IF NOT EXISTS "User" (
    "id" SERIAL PRIMARY KEY,
    "telegramId" VARCHAR(255) UNIQUE NOT NULL,
    "displayName" VARCHAR(255) NOT NULL,
    "isNewUser" BOOLEAN NOT NULL DEFAULT true,
    "inventory" JSONB NOT NULL DEFAULT '[]',
    "balance" JSONB NOT NULL DEFAULT '{"money": 0, "shield": 0}',
    "equipment" JSONB NOT NULL DEFAULT '[]',
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "Item" (
    "id" SERIAL PRIMARY KEY,
    "name" VARCHAR(255) NOT NULL,
    "level" INTEGER NOT NULL,
    "shield" INTEGER NOT NULL,
    "type" VARCHAR(255) NOT NULL,
    "price" INTEGER NOT NULL,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Insert sample data
INSERT INTO "User" ("telegramId", "displayName", "isNewUser", "inventory", "balance") VALUES
    ('123456789', 'John Doe', false, '[]', '{"money": 0, "shield": 0}'),
    ('987654321', 'Jane Smith', false, '[]', '{"money": 0, "shield": 0}')
ON CONFLICT ("telegramId") DO NOTHING;

INSERT INTO "Item" ("name", "level", "shield", "type", "price") VALUES
    ('Basic Shield', 1, 10, 'shield', 100),
    ('Advanced Shield', 2, 25, 'shield', 250),
    ('Elite Shield', 3, 50, 'shield', 500)
ON CONFLICT DO NOTHING;