import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.neighbors import KNeighborsClassifier
from sklearn.metrics import accuracy_score

def split_data(X, y, test_size=0.2, random_state=42):
    
    # We do a standard split using the provided random_state
    return train_test_split(X, y, test_size=test_size, random_state=random_state)

def tune_knn(X_train, y_train, X_test, y_test, max_k=20):
   
    k_values = list(range(1, max_k + 1))
    error_rates = []
    
    print("==================================================")
    print("           PROCESS: TUNING HYPERPARAMETER K       ")
    print("==================================================")
    print("Running elbow search (testing K from 1 to 20)...")
    
    for k in k_values:
        # 1. Instantiate the model with the current K neighbors
        knn = KNeighborsClassifier(n_neighbors=k)
        
        # 2. Fit (train) the model
        knn.fit(X_train, y_train)
        
        # 3. Predict on the test set
        predictions = knn.predict(X_test)
        
        # 4. Calculate error rate
        accuracy = accuracy_score(y_test, predictions)
        error_rate = 1.0 - accuracy
        error_rates.append(error_rate)
        
        print(f"K = {k:02d} | Test Error Rate = {error_rate:.4f} (Accuracy = {accuracy:.4f})")
    
    # Select optimal K based on the minimum error rate
    # If there is a tie, np.argmin returns the index of the first occurrence (smaller K)
    optimal_idx = np.argmin(error_rates)
    optimal_k = k_values[optimal_idx]
    
    print(f"\nOptimal K automatically selected: K = {optimal_k} (Error Rate = {error_rates[optimal_idx]:.4f})")
    print("==================================================\n")
    
    return optimal_k, k_values, error_rates

def train_classifier(classifier, X_train, y_train):
    
    # Fit the classifier to the training features and targets
    classifier.fit(X_train, y_train)
    return classifier
