CREATE SEQUENCE SEQ_SB_AUDIT_ID;

CREATE TABLE SERVICE_BULLETIN_AUDIT
(
  ID BIGINT DEFAULT nextval('SEQ_SB_AUDIT_ID') PRIMARY KEY NOT NULL,
  SB_NUMBER VARCHAR(255) NOT NULL,
  SB_VERSION BIGINT NOT NULL,
  USER_ACTION VARCHAR(255),
  SERVICE_BULLETIN_DATA JSON,
  MODIFIED_BY VARCHAR(255),
  MODIFIED_DATE TIMESTAMP
 );

ALTER TABLE SERVICE_BULLETIN_AUDIT ADD FOREIGN KEY (SB_NUMBER, SB_VERSION) REFERENCES SERVICE_BULLETIN (SB_NUMBER, SB_VERSION);
