DO $$
BEGIN
  CREATE TYPE user_role AS ENUM ('user', 'admin');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

ALTER TABLE users ADD COLUMN IF NOT EXISTS open_id text;
ALTER TABLE users ADD COLUMN IF NOT EXISTS login_method text;
ALTER TABLE users ADD COLUMN IF NOT EXISTS role user_role;
ALTER TABLE users ADD COLUMN IF NOT EXISTS updated_at timestamp DEFAULT now();
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_signed_in timestamp DEFAULT now();

UPDATE users
SET
  open_id = COALESCE(open_id, 'local:' || lower(email)),
  login_method = COALESCE(login_method, 'local'),
  role = COALESCE(role, 'user'::user_role),
  updated_at = COALESCE(updated_at, created_at, now()),
  last_signed_in = COALESCE(last_signed_in, created_at, now())
WHERE
  open_id IS NULL
  OR login_method IS NULL
  OR role IS NULL
  OR updated_at IS NULL
  OR last_signed_in IS NULL;

ALTER TABLE users ALTER COLUMN open_id SET NOT NULL;
ALTER TABLE users ALTER COLUMN login_method SET DEFAULT 'local';
ALTER TABLE users ALTER COLUMN login_method SET NOT NULL;
ALTER TABLE users ALTER COLUMN role SET DEFAULT 'user';
ALTER TABLE users ALTER COLUMN role SET NOT NULL;
ALTER TABLE users ALTER COLUMN updated_at SET DEFAULT now();
ALTER TABLE users ALTER COLUMN updated_at SET NOT NULL;
ALTER TABLE users ALTER COLUMN last_signed_in SET DEFAULT now();
ALTER TABLE users ALTER COLUMN last_signed_in SET NOT NULL;
ALTER TABLE users ALTER COLUMN email DROP NOT NULL;
ALTER TABLE users ALTER COLUMN password DROP NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS users_open_id_unique ON users (open_id);
