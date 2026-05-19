-- Add region column to devices table
ALTER TABLE devices ADD COLUMN IF NOT EXISTS region TEXT DEFAULT 'All';

-- Assign some initial regions to the default devices
UPDATE devices SET region = 'Poblacion' WHERE device_id = 'iligan_city_hall_001';
UPDATE devices SET region = 'Tibanga' WHERE device_id = 'msu_iit_campus_001';
