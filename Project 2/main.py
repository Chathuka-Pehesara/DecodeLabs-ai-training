import os
from data_loader import load_iris_data, scale_features
from model import split_data, tune_knn, train_classifier
from evaluate import plot_elbow_chart, plot_confusion_matrix_heatmap, print_metrics_report
from sklearn.neighbors import KNeighborsClassifier

def run_classification_pipeline():
 
    print("======================================================================")
    print("           DATA CLASSIFICATION PIPELINE        ")
    print("======================================================================\n")

    # 1. INPUT PHASE
    # Load raw dataset and display descriptive statistics
    X, y, class_names = load_iris_data()
    
    # Shuffle and split data into training (80%) and testing (20%) partitions
    X_train, X_test, y_train, y_test = split_data(X, y, test_size=0.2, random_state=42)
    
    # Scale features to prevent features with larger numeric scales from distorting distance metrics
    X_train_scaled, X_test_scaled, scaler = scale_features(X_train, X_test)
    
    print(f"[INPUT] Splitting dataset complete:")
    print(f"        - Training features shape: {X_train_scaled.shape}")
    print(f"        - Testing features shape:  {X_test_scaled.shape}\n")

    # 2. PROCESS PHASE
    # Define outputs directory
    outputs_dir = "outputs"
    if not os.path.exists(outputs_dir):
        os.makedirs(outputs_dir)
        
    # Run the hyperparameter search loop for K = 1 to 20
    optimal_k, k_values, error_rates = tune_knn(
        X_train_scaled, y_train, X_test_scaled, y_test, max_k=20
    )
    
    # Plot and save the elbow chart to visualise optimal K
    plot_elbow_chart(k_values, error_rates, optimal_k, output_dir=outputs_dir)
    
    # Retrain final KNN classifier using the optimal K value
    print(f"[PROCESS] Retraining final model with optimal K = {optimal_k}...")
    final_knn_model = KNeighborsClassifier(n_neighbors=optimal_k)
    final_knn_model = train_classifier(final_knn_model, X_train_scaled, y_train)
    print("[PROCESS] Model retraining complete.\n")

    # 3. OUTPUT PHASE
    # Generate predictions on scaled test set
    predictions = final_knn_model.predict(X_test_scaled)
    
    # Generate and print performance metrics (Accuracy, Precision, Recall, F1)
    print_metrics_report(y_test, predictions, class_names)
    
    # Generate and save Seaborn confusion matrix heatmap
    plot_confusion_matrix_heatmap(y_test, predictions, class_names, output_dir=outputs_dir)
    
    print("======================================================================")
    print("                     PIPELINE RUN COMPLETED                           ")
    print("======================================================================\n")

if __name__ == "__main__":
    run_classification_pipeline()
