CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  username TEXT NOT NULL UNIQUE,
  phone_number TEXT,
  address TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'dispatcher'
    CHECK (role IN ('dispatcher','supervisor','observer')),
  organisation TEXT,
  terms_accepted BOOLEAN NOT NULL DEFAULT FALSE,
  authority_confirmed BOOLEAN NOT NULL DEFAULT FALSE,
  updates_opt_in BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS profiles_username_idx
  ON public.profiles (username);

CREATE INDEX IF NOT EXISTS profiles_email_idx
  ON public.profiles (email);

NOTIFY pgrst, 'reload schema';
