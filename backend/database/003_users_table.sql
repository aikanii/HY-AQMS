CREATE TABLE IF NOT EXISTS users (
    user_id SERIAL PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT DEFAULT 'admin',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Default admin:admin (correct bcrypt hash for 'admin')
INSERT INTO users (username, password_hash) 
VALUES ('admin', '$2a$10$1BJH4ZxU.o1tW4fkLqUk7Od9ke9KkIkx9fdhswhQtWCupnjERzwsy') 
ON CONFLICT (username) DO UPDATE SET password_hash = EXCLUDED.password_hash;
