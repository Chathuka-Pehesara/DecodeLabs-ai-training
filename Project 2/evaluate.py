import os
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.metrics import classification_report, confusion_matrix, accuracy_score

def plot_elbow_chart(k_values, error_rates, optimal_k, output_dir="outputs"):
    
    # Ensure the outputs directory exists
    if not os.path.exists(output_dir):
        os.makedirs(output_dir)
        print(f"[EVALUATE] Created directory: {output_dir}")
        
    plt.figure(figsize=(10, 6))
    
    # Plot error rates for all K values
    plt.plot(k_values, error_rates, color='#1f77b4', linestyle='dashed', marker='o',
             markerfacecolor='#d62728', markersize=8, label='Test Error Rate')
             
    # Highlight the optimal K value on the plot
    optimal_idx = k_values.index(optimal_k)
    plt.scatter(optimal_k, error_rates[optimal_idx], color='gold', s=220, edgecolors='black', 
                zorder=5, label=f'Optimal K Selected ({optimal_k})')
                
    plt.title('Error Rate vs. K Value (KNN Hyperparameter Tuning)', fontsize=14, fontweight='bold', pad=15)
    plt.xlabel('Value of K (Number of Neighbors)', fontsize=12)
    plt.ylabel('Error Rate (1 - Accuracy)', fontsize=12)
    plt.xticks(k_values)
    plt.grid(True, linestyle='--', alpha=0.5)
    plt.legend(fontsize=11, loc='upper right')
    
    output_path = os.path.join(output_dir, 'elbow_chart.png')
    plt.savefig(output_path, dpi=300, bbox_inches='tight')
    plt.close()
    print(f"[EVALUATE] Saved elbow chart plot to: {output_path}")

def plot_confusion_matrix_heatmap(y_true, y_pred, class_names, output_dir="outputs"):
    
    if not os.path.exists(output_dir):
        os.makedirs(output_dir)
        print(f"[EVALUATE] Created directory: {output_dir}")
        
    # Compute the raw confusion matrix from scikit-learn
    cm = confusion_matrix(y_true, y_pred)
    
    plt.figure(figsize=(8, 6))
    
    # Generate heatmap with values annotated ('annot=True') and formatted as integer ('fmt="d"')
    sns.heatmap(cm, annot=True, fmt='d', cmap='Blues', 
                xticklabels=class_names, yticklabels=class_names,
                cbar_kws={'label': 'Number of Samples'}, annot_kws={'size': 12, 'weight': 'bold'})
                
    plt.title('Confusion Matrix Heatmap', fontsize=14, fontweight='bold', pad=15)
    plt.xlabel('Predicted Label (Model Output)', fontsize=12)
    plt.ylabel('True Label (Actual Ground Truth)', fontsize=12)
    plt.tight_layout()
    
    output_path = os.path.join(output_dir, 'confusion_matrix.png')
    plt.savefig(output_path, dpi=300, bbox_inches='tight')
    plt.close()
    print(f"[EVALUATE] Saved confusion matrix heatmap to: {output_path}")

def print_metrics_report(y_true, y_pred, class_names):
   
    accuracy = accuracy_score(y_true, y_pred)
    
    print("==================================================")
    print("             OUTPUT: EVALUATION REPORT            ")
    print("==================================================")
    print(f"Overall Test Accuracy: {accuracy * 100:.2f}%")
    print("\nClassification Report (Precision, Recall, F1-Score per class):")
    print(classification_report(y_true, y_pred, target_names=class_names))
    print("==================================================\n")
