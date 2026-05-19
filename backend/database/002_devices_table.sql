CREATE TABLE IF NOT EXISTS devices (
    device_id TEXT PRIMARY KEY,
    name TEXT,
    lat FLOAT,
    lng FLOAT,
    status TEXT DEFAULT 'active',
    calibration_coefficients JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO devices (device_id, name, lat, lng, status, calibration_coefficients)
VALUES 
    ('iligan_city_hall_001', 'Iligan City Hall', 8.2281, 124.2443, 'active', '{"pm2_5_slope": 1.1, "pm2_5_intercept": -0.5}'),
    ('msu_iit_campus_001', 'MSU-IIT Campus', 8.2393, 124.2440, 'active', '{"pm2_5_slope": 1.0, "pm2_5_intercept": 0.0}')
ON CONFLICT (device_id) DO NOTHING;
