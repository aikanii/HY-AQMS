import os
import psycopg2
from psycopg2.extras import RealDictCursor
import logging

logger = logging.getLogger(__name__)

def get_db_connection():
    try:
        conn = psycopg2.connect(
            host=os.getenv('POSTGRES_HOST', 'timescale'),
            database=os.getenv('POSTGRES_DB', 'aqms'),
            user=os.getenv('POSTGRES_USER', 'aqms_user'),
            password=os.getenv('POSTGRES_PASSWORD', 'secret'),
            port=os.getenv('POSTGRES_PORT', '5432')
        )
        return conn
    except Exception as e:
        logger.error(f"Error connecting to database: {e}")
        return None

def fetch_historical_data(device_id=None, days=30):
    """
    Fetch historical reading data from the database.
    If device_id is provided, fetch for that specific device.
    Otherwise, fetch the aggregated city-wide average.
    """
    conn = get_db_connection()
    if not conn:
        return []

    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            if device_id:
                # Fetch raw data for the specific device
                # We'll use 1-hour time buckets to normalize the sequence
                query = f"""
                    SELECT 
                        time_bucket('1 hour', time) AS time,
                        AVG(pm2_5_cal) AS pm2_5,
                        AVG(temperature) AS temperature,
                        AVG(humidity) AS humidity
                    FROM readings
                    WHERE device_id = %s AND time >= NOW() - INTERVAL '{days} days'
                    GROUP BY time_bucket('1 hour', time)
                    ORDER BY time ASC;
                """
                cur.execute(query, (device_id,))
            else:
                # Fetch city-wide average
                query = f"""
                    SELECT 
                        time_bucket('1 hour', time) AS time,
                        AVG(pm2_5_cal) AS pm2_5,
                        AVG(temperature) AS temperature,
                        AVG(humidity) AS humidity
                    FROM readings
                    WHERE time >= NOW() - INTERVAL '{days} days'
                    GROUP BY time_bucket('1 hour', time)
                    ORDER BY time ASC;
                """
                cur.execute(query)
            
            return cur.fetchall()
    except Exception as e:
        logger.error(f"Error fetching data: {e}")
        return []
    finally:
        conn.close()
