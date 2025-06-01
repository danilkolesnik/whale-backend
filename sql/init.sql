-- Create tables
CREATE TABLE IF NOT EXISTS "User" (
    "id" SERIAL PRIMARY KEY,
    "telegramId" VARCHAR(255) UNIQUE NOT NULL,
    "displayName" VARCHAR(255) NOT NULL,
    "isNewUser" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "Post" (
    "id" SERIAL PRIMARY KEY,
    "title" VARCHAR(255) NOT NULL,
    "content" TEXT,
    "published" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "authorId" INTEGER NOT NULL REFERENCES "User"("id") ON DELETE CASCADE
);

-- Insert sample data
INSERT INTO "User" ("telegramId", "displayName", "isNewUser") VALUES
    ('123456789', 'John Doe', false),
    ('987654321', 'Jane Smith', false)
ON CONFLICT ("telegramId") DO NOTHING;

INSERT INTO "Post" ("title", "content", "published", "authorId") VALUES
    ('First Post', 'This is the content of the first post', true, 1),
    ('Second Post', 'This is the content of the second post', false, 1),
    ('Hello World', 'Welcome to my blog!', true, 2)
ON CONFLICT DO NOTHING; 