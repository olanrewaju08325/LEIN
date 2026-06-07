CREATE TABLE incidents (
  id BIGSERIAL PRIMARY KEY,
  type TEXT NOT NULL CHECK (type IN ('Medical','Fire','Security','Accident')),
  description TEXT,
  lat FLOAT NOT NULL,
  lng FLOAT NOT NULL,
  severity INTEGER CHECK (severity BETWEEN 1 AND 5),
  priority_score FLOAT CHECK (priority_score BETWEEN 1.0 AND 10.0),
  lga TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active','assigned','resolved')),
  reporter_name TEXT,
  reporter_phone TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE responders (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  lat FLOAT NOT NULL,
  lng FLOAT NOT NULL,
  status TEXT DEFAULT 'available' CHECK (status IN ('available','assigned','returning')),
  lga TEXT,
  type TEXT
);

CREATE TABLE hospitals (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  lat FLOAT NOT NULL,
  lng FLOAT NOT NULL,
  capacity INTEGER CHECK (capacity BETWEEN 0 AND 100),
  specialisation TEXT
);

CREATE TABLE assignments (
  id BIGSERIAL PRIMARY KEY,
  incident_id BIGINT REFERENCES incidents(id),
  responder_id BIGINT REFERENCES responders(id),
  eta_minutes INTEGER,
  assigned_at TIMESTAMPTZ DEFAULT NOW()
);
