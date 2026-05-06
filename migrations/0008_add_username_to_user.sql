-- Better Auth 1.6 uses username from the username plugin.
-- The username column is already created in 0007, so this migration only adds
-- displayUsername for fresh databases without breaking on duplicate username.
ALTER TABLE user ADD COLUMN displayUsername TEXT;
CREATE UNIQUE INDEX IF NOT EXISTS user_username_unique ON user(username);
