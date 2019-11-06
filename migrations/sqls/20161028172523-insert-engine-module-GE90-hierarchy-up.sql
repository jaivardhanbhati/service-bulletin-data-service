/* Replace with your SQL commands */
INSERT INTO ENGINE_MODULE_HIERARCHY 
(ENGINE_FAMILY, MODULE_ID, MODULE_NUMBER, MODULE_NAME, ATA, PART_NUMBER_PATTERN, PARENT_MODULE_ID, CREATED_BY, LAST_MODIFIED_BY) VALUES
('GE90', 1, 'M10', 'Engine Assembly', '72-00-00', '2115M10G', 0, 'ADMIN', 'ADMIN'),
('GE90', 2, 'M10', 'Rotating Hardware', '72-21-00', '2115M10G', 1, 'ADMIN', 'ADMIN'),
('GE90', 3, 'M15', 'Fan Case Assembly', '72-00-06', '2115M17G', 1, 'ADMIN', 'ADMIN'),
('GE90', 4, 'M80', 'Lower Bifurcation', '72-00-25', '2115M80G', 1, 'ADMIN', 'ADMIN'),
('GE90', 5, 'M20', 'Base Engine Assembly', '72-00-00', '2115M20G', 1, 'ADMIN', 'ADMIN'),
('GE90', 6, 'M50', 'Core Module Assy', '72-00-02', '2115M50G', 5, 'ADMIN', 'ADMIN'),
('GE90', 7, 'M53', 'Compressor Module Assy', '72-30-00', '2115M53G', 6, 'ADMIN', 'ADMIN'),
('GE90', 8, 'M51', 'Compressor Rotor Assy', '72-30-00', '2115M51G', 7, 'ADMIN', 'ADMIN'),
('GE90', 9, 'M52', 'Compressor Stator Assy', '72-32-00', '2115M52G', 7, 'ADMIN', 'ADMIN'),
('GE90', 10, 'M40', 'Fan Booster Compressor Assy', '72-00-01', '2115M40G', 7, 'ADMIN', 'ADMIN'),
('GE90', 11, 'M21', 'Fan Rotor Stator Assy', '72-21-00', '2115M21G', 7, 'ADMIN', 'ADMIN'),
('GE90', 12, 'M23', 'No1R  Bearing Assy', '72-22-00', '2115M23G', 7, 'ADMIN', 'ADMIN'),
('GE90', 13, 'M24', 'No2B Bearing Assy', '72-26-00', '2115M24G', 7, 'ADMIN', 'ADMIN'),
('GE90', 14, 'M31', 'Fan Frame Assy', '72-23-00', '2115M31G', 7, 'ADMIN', 'ADMIN'),
('GE90', 15, 'M32', 'No3 Brg Inlet Gearbox', '72-61-00', '2115M32G', 14, 'ADMIN', 'ADMIN'),
('GE90', 16, 'M33', 'Transfer Gearbox', '72-62-00', '2115M33G', 14, 'ADMIN', 'ADMIN'),
('GE90', 17, 'M59', 'HP Turbine  Module Assy', '72-50-00', '738L859G', 6, 'ADMIN', 'ADMIN'),
('GE90', 18, 'M45', 'Comb Diffuser Assy', '72-40-00', '2115M45G', 17, 'ADMIN', 'ADMIN'),
('GE90', 19, 'M54', 'Combutor  Assy', '72-42-00', '2115M54G', 18, 'ADMIN', 'ADMIN'),
('GE90', 20, 'M55', 'Stg1 HPT Nozzle Assy', '72-51-00', '2115M55G', 18, 'ADMIN', 'ADMIN'),
('GE90', 21, 'M56', 'S2 Nozzle Assy', '72-52-00', '2115M56G', 17, 'ADMIN', 'ADMIN'),
('GE90', 22, 'M57', 'HPT Rotor Assy', '72-53-00', '2115M57G', 17, 'ADMIN', 'ADMIN'),
('GE90', 23, 'M58', 'Turb Centre Frame Assy', '72-54-00', '2115M58G', 17, 'ADMIN', 'ADMIN'),
('GE90', 24, 'M60', 'LP Turbine  Assy', '72-00-04', '2115M60G', 5, 'ADMIN', 'ADMIN'),
('GE90', 25, 'M61', 'LP Rotor Stator Assy', '72-56-00', '2115M61G', 24, 'ADMIN', 'ADMIN'),
('GE90', 26, 'M63', 'Turbine Rear Frame Assy', '72-57-00', '2115M63G', 24, 'ADMIN', 'ADMIN'),
('GE90', 27, 'M64', 'LP Mid Shaft Assy', '72-58-00', '2115M64G', 24, 'ADMIN', 'ADMIN'),
('GE90', 28, 'M71', 'Accessory Gearbox Assy', '72-00-05', '2115M71G', 5, 'ADMIN', 'ADMIN');