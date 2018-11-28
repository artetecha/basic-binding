CREATE TABLE author (
  id UUID DEFAULT uuid_generate_v4 (),
  first_name TEXT,
  last_name TEXT,
  PRIMARY KEY (id)
);

CREATE TABLE media (
  id UUID DEFAULT uuid_generate_v4 (),
  published BOOLEAN,
  title TEXT,
  description TEXT,
  uuid UUID,
  tags TEXT[],
  uri TEXT,
  meta JSONB,
  created TIMESTAMP DEFAULT now(),
  author_id UUID,
  CONSTRAINT media_author FOREIGN KEY (author_id) REFERENCES public.author (id),
  PRIMARY KEY (id)
);

CREATE TABLE video (
) INHERITS (media);

CREATE TABLE audio (
) INHERITS (media);

CREATE TABLE image (
) INHERITS (media);

CREATE TABLE document (
) INHERITS (media);
