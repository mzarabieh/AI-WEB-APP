import numpy as np
import tensorflow as tf
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import Dense, Dropout, LSTM
from tensorflow.keras.callbacks import EarlyStopping
import pandas as pd
import os
import json
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler

# This script demonstrates how you would train a TensorFlow model
# to detect procrastination behaviors from MediaPipe landmarks

def load_dataset(data_path):
    """
    Load the dataset of landmarks and labels
    In a real implementation, this would load your collected data
    """
    print(f"Loading dataset from {data_path}")
    
    # In a real implementation, you would load your collected data
    # For demonstration, we'll create a synthetic dataset
    
    # Simulate 1000 samples with 1629 features (543 landmarks * 3 coordinates)
    n_samples = 1000
    n_features = 1629  # 543 landmarks * 3 (x, y, z)
    
    # Generate random landmark data
    X = np.random.random((n_samples, n_features))
    
    # Generate labels (0 = focused, 1 = procrastinating)
    # We'll create 5 different labels for different procrastination behaviors
    y = np.zeros((n_samples, 5))
    
    # Randomly assign some samples as procrastination behaviors
    for i in range(5):
        y[:, i] = (np.random.random(n_samples) > 0.7).astype(int)
    
    # Create a pandas DataFrame for easier manipulation
    columns = [f'landmark_{i}' for i in range(n_features)]
    label_columns = ['looking_away', 'using_phone', 'slouching', 'yawning', 'distracted_movements']
    
    X_df = pd.DataFrame(X, columns=columns)
    y_df = pd.DataFrame(y, columns=label_columns)
    
    # Combine features and labels
    df = pd.concat([X_df, y_df], axis=1)
    
    print(f"Dataset loaded: {df.shape[0]} samples with {df.shape[1]} columns")
    return df

def preprocess_data(df):
    """
    Preprocess the data for training
    """
    print("Preprocessing data...")
    
    # Split features and labels
    X = df.iloc[:, :1629].values
    y = df.iloc[:, 1629:].values
    
    # Split into training and testing sets
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42
    )
    
    # Standardize features
    scaler = StandardScaler()
    X_train = scaler.fit_transform(X_train)
    X_test = scaler.transform(X_test)
    
    print(f"Data preprocessed: {X_train.shape[0]} training samples, {X_test.shape[0]} testing samples")
    return X_train, X_test, y_train, y_test, scaler

def build_model(input_shape, output_shape):
    """
    Build a neural network model for procrastination detection
    """
    print("Building model...")
    
    model = Sequential([
        # First hidden layer
        Dense(512, activation='relu', input_shape=(input_shape,)),
        Dropout(0.3),
        
        # Second hidden layer
        Dense(256, activation='relu'),
        Dropout(0.3),
        
        # Third hidden layer
        Dense(128, activation='relu'),
        Dropout(0.3),
        
        # Output layer - multi-label classification
        Dense(output_shape, activation='sigmoid')
    ])
    
    # Compile the model
    model.compile(
        optimizer='adam',
        loss='binary_crossentropy',
        metrics=['accuracy']
    )
    
    print(model.summary())
    return model

def train_model(model, X_train, y_train, X_test, y_test, epochs=50, batch_size=32):
    """
    Train the model on the dataset
    """
    print("Training model...")
    
    # Early stopping to prevent overfitting
    early_stopping = EarlyStopping(
        monitor='val_loss',
        patience=5,
        restore_best_weights=True
    )
    
    # Train the model
    history = model.fit(
        X_train, y_train,
        epochs=epochs,
        batch_size=batch_size,
        validation_data=(X_test, y_test),
        callbacks=[early_stopping]
    )
    
    # Evaluate the model
    loss, accuracy = model.evaluate(X_test, y_test)
    print(f"Test Loss: {loss:.4f}")
    print(f"Test Accuracy: {accuracy:.4f}")
    
    return model, history

def save_model(model, scaler, output_dir):
    """
    Save the trained model and scaler
    """
    if not os.path.exists(output_dir):
        os.makedirs(output_dir)
    
    # Save the model
    model_path = os.path.join(output_dir, 'procrastination_model.h5')
    model.save(model_path)
    print(f"Model saved to {model_path}")
    
    # Save the scaler
    scaler_path = os.path.join(output_dir, 'scaler.pkl')
    import pickle
    with open(scaler_path, 'wb') as f:
        pickle.dump(scaler, f)
    print(f"Scaler saved to {scaler_path}")

def main():
    # Set paths
    data_path = 'data/landmarks'
    output_dir = 'models'
    
    # Load and preprocess data
    df = load_dataset(data_path)
    X_train, X_test, y_train, y_test, scaler = preprocess_data(df)
    
    # Build and train model
    model = build_model(X_train.shape[1], y_train.shape[1])
    model, history = train_model(model, X_train, y_train, X_test, y_test)
    
    # Save model
    save_model(model, scaler, output_dir)
    
    print("Model training complete!")

if __name__ == "__main__":
    main()

