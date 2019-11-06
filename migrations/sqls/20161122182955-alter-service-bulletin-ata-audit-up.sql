-- Removing foreign constraint to allow deletion of service bulletin ata association
ALTER TABLE SERVICE_BULLETIN_ATA_AUDIT DROP CONSTRAINT service_bulletin_ata_audit_ata_id_fkey;
ALTER TABLE SERVICE_BULLETIN_ATA_AUDIT DROP CONSTRAINT service_bulletin_ata_audit_sb_id_fkey;
