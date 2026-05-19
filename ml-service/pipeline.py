import pandas as pd
import numpy as np
from sklearn.preprocessing import MinMaxScaler
import joblib
import os

SCALER_PATH = 'scaler.save'

def preprocess_data(raw_data, fit_scaler=False):
    """
    Convert raw dictionary data from database to normalized pandas DataFrame.
    Fills missing values and normalizes.
    """
    if not raw_data:
        return None, None
        
    df = pd.DataFrame(raw_data)
    
    # Ensure time is datetime and set as index
    df['time'] = pd.to_datetime(df['time'])
    df.set_index('time', inplace=True)
    
    # Resample to 1H to ensure continuous time index (in case there are gaps)
    df = df.resample('1H').mean()
    
    # Interpolate missing values (linear interpolation, then bfill/ffill for edges)
    df.interpolate(method='linear', inplace=True)
    df.bfill(inplace=True)
    df.ffill(inplace=True)
    
    # In case there are still NaNs, fill with 0
    df.fillna(0, inplace=True)
    
    features = ['pm2_5', 'temperature', 'humidity']
    
    # Normalization
    if fit_scaler:
        scaler = MinMaxScaler(feature_range=(0, 1))
        scaled_data = scaler.fit_transform(df[features])
        joblib.dump(scaler, SCALER_PATH)
    else:
        if os.path.exists(SCALER_PATH):
            scaler = joblib.load(SCALER_PATH)
            scaled_data = scaler.transform(df[features])
        else:
            # Fallback if scaler doesn't exist
            scaler = MinMaxScaler(feature_range=(0, 1))
            scaled_data = scaler.fit_transform(df[features])
            joblib.dump(scaler, SCALER_PATH)
            
    df_scaled = pd.DataFrame(scaled_data, columns=features, index=df.index)
    return df_scaled, scaler

def create_sequences(data, seq_length=24, pred_length=24):
    """
    Create sequences for time series forecasting.
    data: pandas DataFrame
    seq_length: Number of past time steps to use as input
    pred_length: Number of future time steps to predict
    """
    xs = []
    ys = []
    
    values = data.values
    
    for i in range(len(values) - seq_length - pred_length + 1):
        x = values[i:(i + seq_length)]
        y = values[(i + seq_length):(i + seq_length + pred_length)]
        xs.append(x)
        ys.append(y)
        
    return np.array(xs), np.array(ys)
