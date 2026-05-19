CREATE EXTENSION IF NOT EXISTS timescaledb CASCADE;

CREATE TABLE IF NOT EXISTS readings (
  time        TIMESTAMPTZ NOT NULL,
  device_id   TEXT NOT NULL,
  pm1_0       FLOAT, 
  pm2_5       FLOAT, 
  pm10        FLOAT,
  pm2_5_cal   FLOAT,
  temperature FLOAT, 
  humidity    FLOAT,
  rssi_dbm    INT, 
  battery_mv  INT
);

SELECT create_hypertable('readings', 'time', if_not_exists => TRUE);

CREATE INDEX IF NOT EXISTS ix_readings_device_time ON readings (device_id, time DESC);
