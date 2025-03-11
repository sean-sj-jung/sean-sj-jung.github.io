---
layout: post
title: "Traditional Machine Learning Methods"
date: 2024-11-02
excerpt: "SVM, Decision Tree, Bagging and Boosting, Clustering and so on"
---

## Support Vector Machine (SVM) and Kernel Trick
SVM finds the optimal **hyperplane** that maximizes the margin between two classes.

### **Linear SVM**
For a linearly separable dataset, the decision boundary is given by:

$$
w \cdot x + b = 0
$$

where:
- \( w \) is the weight vector,
- \( x \) is the input feature vector,
- \( b \) is the bias term.

The margin \( M \) is:

$$
M = \frac{2}{||w||}
$$

SVM optimizes \( w \) and \( b \) by solving:

$$
\min_{w, b} \frac{1}{2} ||w||^2
$$

subject to:

$$
y_i (w \cdot x_i + b) \geq 1, \quad \forall i
$$

### **Kernel Trick**
When data is not linearly separable, a kernel function \( K(x, y) \) is used to map it into a higher-dimensional space:

$$
K(x, y) = \phi(x)^T \phi(y)
$$

Examples of kernels:
- **Linear Kernel**: \( K(x, y) = x^T y \)
- **Polynomial Kernel**: \( K(x, y) = (1 + x^T y)^p \)
- **Gaussian (RBF) Kernel**:

  $$
  K(x, y) = e^{-\gamma ||x - y||^2}
  $$

- **Sigmoid Kernel**:

  $$
  K(x, y) = \tanh(b_0 x^T y + b_1)
  $$

## Decision Tree
Decision trees use **recursive partitioning** to split data based on the largest **information gain**.

- **Entropy** (Measure of impurity):

  $$
  H(S) = -\sum_{i=1}^{n} p_i \log_2 p_i
  $$

- **Information Gain**:

  $$
  IG = H(\text{parent}) - \sum_{j} \frac{|S_j|}{|S|} H(S_j)
  $$

- **Gini Impurity**:

  $$
  Gini = 1 - \sum_{i=1}^{n} p_i^2
  $$

### **Pruning**
Decision trees tend to **overfit**, so **pruning** is used to reduce complexity.

## Random Forest
Random forests improve decision trees by training multiple trees on different subsets of data.

- Each tree is trained on a **random subset** of data (bootstrap sample).
- Features are randomly selected at each node.
- The final prediction is an **average (for regression)** or **majority vote (for classification)**.

## Bagging (Bootstrap Aggregation)
Bagging is an ensemble method that improves stability by training multiple models on **bootstrapped datasets**.

1. Generate \( m \) bootstrap samples \( S_1, S_2, \dots, S_m \).
2. Train a model on each sample.
3. Aggregate predictions:
   - **Regression**: Average of all models.
   - **Classification**: Majority vote.

## Resampling Methods
Resampling is used for model validation and performance estimation.

- **Cross-Validation**:
  - \( k \)-fold cross-validation:
  
    $$
    \text{Error} = \frac{1}{k} \sum_{i=1}^{k} \text{Test Error}_i
    $$

  - Leave-One-Out Cross-Validation (LOOCV):

    $$
    \text{Error} = \frac{1}{n} \sum_{i=1}^{n} \text{Test Error}_i
    $$

- **Bootstrap**:
  - Sample with replacement and estimate uncertainty in statistics.

## Adaboost (Adaptive Boosting)
Adaboost combines weak classifiers to create a strong classifier by **reweighting misclassified samples**.

1. Assign weights \( w_i \) to each training sample.
2. Train a weak classifier \( h_t(x) \).
3. Compute classifier error:

   $$
   \epsilon_t = \sum_{i=1}^{n} w_i I(h_t(x_i) \neq y_i)
   $$

4. Compute classifier weight:

   $$
   \alpha_t = \frac{1}{2} \log \left(\frac{1 - \epsilon_t}{\epsilon_t} \right)
   $$

5. Update sample weights:

   $$
   w_{i}^{t+1} = w_i^t \cdot e^{-\alpha_t y_i h_t(x_i)}
   $$

6. Final prediction:

   $$
   H(x) = \text{sign} \left( \sum_{t=1}^{T} \alpha_t h_t(x) \right)
   $$

## Clustering
Clustering is an **unsupervised learning** method that groups similar data points.

### **Types of Clustering**
- **Hierarchical Clustering**:
  - **Agglomerative** (bottom-up merging)
  - **Divisive** (top-down splitting)

- **Partitional Clustering**:
  - **K-Means**: Minimizes intra-cluster variance

    $$
    \sum_{i=1}^{k} \sum_{x_j \in C_i} ||x_j - \mu_i||^2
    $$

  - **K-Medoids**: Uses actual data points as centroids.

- **Density-Based Clustering**:
  - **DBSCAN**: Groups points based on density.

## Entropy
Entropy measures **uncertainty** in a probability distribution:

$$
H(X) = -\sum_{i=1}^{n} P(x_i) \log_2 P(x_i)
$$

- **High entropy**: Data is **impure** or **uncertain**.
- **Low entropy**: Data is **pure** or **certain**.

## Lazy Learning vs. Eager Learning
### **Lazy Learning**
- **Delays** processing until a query is received.
- **Instance-based learning** (e.g., k-NN).
- **Pros**: Adapts to new data easily.
- **Cons**: Computationally expensive at prediction time.

### **Eager Learning**
- Builds a **global model** from training data.
- **Examples**: Decision Trees, Neural Networks, SVM.
- **Pros**: Faster inference.
- **Cons**: May generalize poorly to new data.

