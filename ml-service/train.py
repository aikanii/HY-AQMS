import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import TensorDataset, DataLoader
import os
import logging
import time

from database import fetch_historical_data
from pipeline import preprocess_data, create_sequences
from model import AQMSPredictor

logger = logging.getLogger(__name__)

MODEL_PATH = 'model.pth'

def train_model(device_id=None, epochs=50, batch_size=32, lr=0.001, seq_length=24, pred_length=24):
    """
    Train the LSTM model.
    If device_id is provided, train on that specific device's data (fine-tuning or individual model).
    Otherwise, train on city-wide data.
    """
    logger.info("Fetching historical data...")
    raw_data = fetch_historical_data(device_id=device_id, days=60) # Fetch up to 60 days
    if not raw_data or len(raw_data) < seq_length + pred_length:
        logger.error("Not enough data to train.")
        return False

    logger.info("Preprocessing data...")
    df_scaled, scaler = preprocess_data(raw_data, fit_scaler=True)
    
    if df_scaled is None:
        logger.error("Preprocessing failed.")
        return False
        
    X, y = create_sequences(df_scaled, seq_length=seq_length, pred_length=pred_length)
    
    # Convert to PyTorch tensors
    X_tensor = torch.tensor(X, dtype=torch.float32)
    y_tensor = torch.tensor(y, dtype=torch.float32)
    
    dataset = TensorDataset(X_tensor, y_tensor)
    dataloader = DataLoader(dataset, batch_size=batch_size, shuffle=True)
    
    device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
    model = AQMSPredictor(input_dim=3, pred_length=pred_length).to(device)
    
    criterion = nn.MSELoss()
    optimizer = optim.Adam(model.parameters(), lr=lr)
    
    logger.info(f"Starting training on device: {device}...")
    model.train()
    for epoch in range(epochs):
        epoch_loss = 0.0
        for batch_X, batch_y in dataloader:
            batch_X, batch_y = batch_X.to(device), batch_y.to(device)
            
            optimizer.zero_grad()
            outputs = model(batch_X)
            loss = criterion(outputs, batch_y)
            loss.backward()
            optimizer.step()
            
            epoch_loss += loss.item()
            
        if (epoch + 1) % 10 == 0:
            logger.info(f"Epoch [{epoch+1}/{epochs}], Loss: {epoch_loss/len(dataloader):.4f}")
            
    # Save the model
    torch.save(model.state_dict(), MODEL_PATH)
    logger.info(f"Model saved to {MODEL_PATH}")
    return True
