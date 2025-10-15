-- Carlini Whiteboard Database Schema
-- Cloudflare D1 (SQLite compatible)

-- Users table (for future authentication)
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    name TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Whiteboards table
CREATE TABLE IF NOT EXISTS whiteboards (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    name TEXT NOT NULL DEFAULT 'Nuevo Tablero',
    data TEXT NOT NULL DEFAULT '[]', -- JSON string with canvas elements
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_whiteboards_user_id ON whiteboards(user_id);
CREATE INDEX IF NOT EXISTS idx_whiteboards_updated_at ON whiteboards(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
