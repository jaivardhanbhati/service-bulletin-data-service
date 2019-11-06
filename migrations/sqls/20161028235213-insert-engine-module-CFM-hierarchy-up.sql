/* Replace with your SQL commands */
INSERT INTO ENGINE_MODULE_HIERARCHY
(ENGINE_FAMILY, MODULE_ID, MODULE_NUMBER, MODULE_NAME, ATA, PART_NUMBER_PATTERN, PARENT_MODULE_ID, CREATED_BY, LAST_MODIFIED_BY) VALUES
('CFM', 1, 'M60', 'Main Engine', '72-00-00', '9324M60G01', 0, 'ADMIN', 'ADMIN'),
('CFM', 2, '', 'Fan Major Module', '72-00-01', '340-035-201', 1, 'ADMIN', 'ADMIN'),
('CFM', 3, '', 'Fan & Booster', '72-21-00', '340-035-301', 2, 'ADMIN', 'ADMIN'),
('CFM', 4, '', '1&2 Bearing', '72-22-00', '340-035-401', 2, 'ADMIN', 'ADMIN'),
('CFM', 5, '', 'Fan Frame', '72-23-00', '340-035-501', 2, 'ADMIN', 'ADMIN'),
('CFM', 6, 'M65', 'Core Major Module', '72-00-02', '9324M65G01', 1, 'ADMIN', 'ADMIN'),
('CFM', 7, 'M68', 'HPC Rotor', '72-31-00', '9324M68G01', 6, 'ADMIN', 'ADMIN'),
('CFM', 8, 'M66', 'HPC FWD Stator', '72-32-00', '9324M66G01', 6, 'ADMIN', 'ADMIN'),
('CFM', 9, 'M67', 'HPC FWD AFT Stator', '72-33-00', '9324M67G01', 6, 'ADMIN', 'ADMIN'),
('CFM', 10, 'M63', 'Comb Case', '72-41-00', '9324M63G01', 6, 'ADMIN', 'ADMIN'),
('CFM', 11, 'M73', 'Comb Liner', '72-42-00', '1493M73G04', 6, 'ADMIN', 'ADMIN'),
('CFM', 12, 'M69', 'NPT NGV', '72-51-00', '9324M69G02', 6, 'ADMIN', 'ADMIN'),
('CFM', 13, 'M61', 'HPT Rotor', '72-52-00', '9324M61G01', 6, 'ADMIN', 'ADMIN'),
('CFM', 14, 'M62', 'LPT NVG', '72-53-00', '9324M62G01', 6, 'ADMIN', 'ADMIN'),
('CFM', 15, '', 'LPT Major Module', '72-00-03', '340-035-601', 1, 'ADMIN', 'ADMIN'),
('CFM', 16, '', 'LPT Rotor/Stator', '72-54-00', '338-092-301', 15, 'ADMIN', 'ADMIN'),
('CFM', 17, '', 'LPT Shaft', '72-55-00', '340-035-801', 15, 'ADMIN', 'ADMIN'),
('CFM', 18, '', 'TRF', '72-56-00', '340-035-901', 15, 'ADMIN', 'ADMIN'),
('CFM', 19, 'M54', 'Inlet Gearbox', '72-61-00', '9324M54G03', 1, 'ADMIN', 'ADMIN'),
('CFM', 20, '', 'Transfer Gearbox', '72-62-00', '340-050-740', 1, 'ADMIN', 'ADMIN'),
('CFM', 21, '', 'Accessory Gearbox', '72-63-00', '340-046-503', 1, 'ADMIN', 'ADMIN');