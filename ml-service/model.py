import torch
import torch.nn as nn

class AQMSPredictor(nn.Module):
    def __init__(self, input_dim=3, hidden_dim=64, num_layers=2, pred_length=24, dropout=0.2):
        """
        LSTM Model for Air Quality Prediction.
        input_dim: number of features (pm2_5, temperature, humidity)
        hidden_dim: number of hidden units in LSTM
        num_layers: number of LSTM layers
        pred_length: number of future time steps to predict
        """
        super(AQMSPredictor, self).__init__()
        self.input_dim = input_dim
        self.hidden_dim = hidden_dim
        self.num_layers = num_layers
        self.pred_length = pred_length
        
        self.lstm = nn.LSTM(input_size=input_dim, 
                            hidden_size=hidden_dim, 
                            num_layers=num_layers, 
                            batch_first=True, 
                            dropout=dropout if num_layers > 1 else 0)
        
        # Output layer maps the last hidden state to the prediction length * number of features
        self.linear = nn.Linear(hidden_dim, pred_length * input_dim)
        
    def forward(self, x):
        # x shape: (batch_size, seq_length, input_dim)
        lstm_out, (hn, cn) = self.lstm(x)
        
        # We take the output of the last time step
        # lstm_out shape: (batch_size, seq_length, hidden_dim)
        last_time_step_out = lstm_out[:, -1, :] 
        
        # prediction shape: (batch_size, pred_length * input_dim)
        prediction = self.linear(last_time_step_out)
        
        # Reshape to (batch_size, pred_length, input_dim)
        prediction = prediction.view(-1, self.pred_length, self.input_dim)
        return prediction
