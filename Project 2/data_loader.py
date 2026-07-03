import pandas as pd
from sklearn.datasets import load_iris
from sklearn.preprocessing import StandardScaler

def load_iris_data():
    
    # Load raw dataset from scikit-learn
    iris = load_iris()
    
    # Create DataFrame for features
    X = pd.DataFrame(iris.data, columns=iris.feature_names)
    y = pd.Series(iris.target, name='target')
    
    # Print dataset details (Requirement 1: INPUT)
    print("==================================================")
    print("             INPUT: DATASET SUMMARY               ")
    print("==================================================")
    print(f"Dataset Shape: {X.shape[0]} samples, {X.shape[1]} features")
    print(f"Feature Names: {list(X.columns)}")
    print(f"Target Classes: {list(iris.target_names)}")
    
    print("\nFirst 5 Samples:")
    # Display the first few rows of features along with their targets
    print(pd.concat([X, y], axis=1).head())
    
    print("\nBasic Descriptive Statistics:")
    # df.describe() prints count, mean, std, min, and quartiles for features
    print(X.describe())
    print("==================================================\n")
    
    return X, y, list(iris.target_names)

def scale_features(X_train, X_test):
   
    scaler = StandardScaler()
    
    # Fit the scaler on the training features and transform them
    X_train_scaled = scaler.fit_transform(X_train)
    
    # Transform the test features using the training statistics (mean, std)
    X_test_scaled = scaler.transform(X_test)
    
    # Convert scaled arrays back to DataFrames to preserve feature names for downstream code
    X_train_scaled_df = pd.DataFrame(X_train_scaled, columns=X_train.columns)
    X_test_scaled_df = pd.DataFrame(X_test_scaled, columns=X_test.columns)
    
    return X_train_scaled_df, X_test_scaled_df, scaler
