CREATE SEQUENCE SEQ_SB_ATA_AUDIT_ID;

CREATE TABLE SERVICE_BULLETIN_ATA_AUDIT
(
  ID BIGINT DEFAULT nextval('SEQ_SB_ATA_AUDIT_ID') PRIMARY KEY NOT NULL,
  ATA_ID BIGINT NOT NULL,
  SB_ID BIGINT NOT NULL,
  SB_NUMBER VARCHAR(255) NOT NULL,
  SB_VERSION BIGINT NOT NULL,
  USER_ACTION VARCHAR(255),
  SERVICE_BULLETIN_ATA_DATA JSON,
  MODIFIED_BY VARCHAR(255),
  MODIFIED_DATE TIMESTAMP
 );

ALTER TABLE SERVICE_BULLETIN_ATA_AUDIT ADD FOREIGN KEY (SB_ID) REFERENCES SERVICE_BULLETIN (SB_ID);
ALTER TABLE SERVICE_BULLETIN_ATA_AUDIT ADD FOREIGN KEY (ATA_ID) REFERENCES SERVICE_BULLETIN_ATA (ID);
