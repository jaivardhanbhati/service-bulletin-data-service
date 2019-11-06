ALTER TABLE service_bulletin DROP CONSTRAINT sb_primary_key,
ADD CONSTRAINT sb_primary_key PRIMARY KEY (sb_number, sb_version, engine_model);