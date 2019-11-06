DELETE FROM ENGINE_MODULE_HIERARCHY WHERE ENGINE_FAMILY='CFM56';
INSERT INTO ENGINE_MODULE_HIERARCHY
(ENGINE_FAMILY, MODULE_ID, MODULE_NUMBER, MODULE_NAME, ATA, PART_NUMBER_PATTERN, PARENT_MODULE_ID, CREATED_BY, LAST_MODIFIED_BY) VALUES
('CFM56', 1, 'M60', 'Main Engine', '72-00-00', '9324M60G', 0, 'ADMIN', 'ADMIN'),
('CFM56', 2, '', 'Fan Major Module', '72-00-01', '340-035-201', 1, 'ADMIN', 'ADMIN'),
('CFM56', 3, '', 'Fan & Booster', '72-21-00', '340-035-301', 2, 'ADMIN', 'ADMIN'),
('CFM56', 4, '', '1&2 Bearing', '72-22-00', '340-035-401', 2, 'ADMIN', 'ADMIN'),
('CFM56', 5, '', 'Fan Frame', '72-23-00', '340-035-501', 2, 'ADMIN', 'ADMIN'),
('CFM56', 6, 'M65', 'Core Major Module', '72-00-02', '9324M65G', 1, 'ADMIN', 'ADMIN'),
('CFM56', 7, 'M68', 'HPC Rotor', '72-31-00', '9324M68G', 6, 'ADMIN', 'ADMIN'),
('CFM56', 8, 'M66', 'HPC FWD Stator', '72-32-00', '9324M66G', 6, 'ADMIN', 'ADMIN'),
('CFM56', 9, 'M67', 'HPC FWD AFT Stator', '72-33-00', '9324M67G', 6, 'ADMIN', 'ADMIN'),
('CFM56', 10, 'M63', 'Comb Case', '72-41-00', '9324M63G', 6, 'ADMIN', 'ADMIN'),
('CFM56', 11, 'M73', 'Comb Liner', '72-42-00', '1493M73G', 6, 'ADMIN', 'ADMIN'),
('CFM56', 12, 'M69', 'HPT NGV', '72-51-00', '9324M69G', 6, 'ADMIN', 'ADMIN'),
('CFM56', 13, 'M61', 'HPT Rotor', '72-52-00', '9324M61G', 6, 'ADMIN', 'ADMIN'),
('CFM56', 14, 'M62', 'LPT NVG', '72-53-00', '9324M62G', 6, 'ADMIN', 'ADMIN'),
('CFM56', 15, '', 'LPT Major Module', '72-00-03', '340-035-601', 1, 'ADMIN', 'ADMIN'),
('CFM56', 16, '', 'LPT Rotor/Stator', '72-54-00', '338-092-301', 15, 'ADMIN', 'ADMIN'),
('CFM56', 17, '', 'LPT Shaft', '72-55-00', '340-035-801', 15, 'ADMIN', 'ADMIN'),
('CFM56', 18, '', 'TRF', '72-56-00', '340-035-901', 15, 'ADMIN', 'ADMIN'),
('CFM56', 19, 'M54', 'Inlet Gearbox', '72-61-00', '9324M54G', 1, 'ADMIN', 'ADMIN'),
('CFM56', 20, '', 'Transfer Gearbox', '72-62-00', '340-050-740', 1, 'ADMIN', 'ADMIN'),
('CFM56', 21, '', 'Accessory Gearbox', '72-63-00', '340-046-503', 1, 'ADMIN', 'ADMIN');