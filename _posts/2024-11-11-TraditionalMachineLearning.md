---
layout: post
title: "Traditional Machine Learning Methods"
date: 2024-11-11
excerpt: "SVM, Decision Tree, Bagging and Boosting, Clustering and so on"
---
  
---  
  
### Bias in Machine Learning

#### Type of bias
- Sampling/selection bias, sample distribution \ne population distribution
- Label bias, human prejudices or systemic errors in label, e.g. survey
- Measurement bias, errors while measruing or recording
- Historical bias, bias in data itself such as social inequalities

#### Mitigate the bias
- If class imbalance, then oversample/undersample/stratify sample
- Augmentation with synthetic data
- Training with regularization and weighted loss
  
---
  
### Resampling Methods
Resampling is used for model validation and performance estimation.

#### **Cross-Validation**:
  - $$ k $$-fold cross-validation:
  
    $$
    \text{Error} = \frac{1}{k} \sum_{i=1}^{k} \text{Test Error}_i
    $$

  - Leave-One-Out Cross-Validation (LOOCV):

    $$
    \text{Error} = \frac{1}{n} \sum_{i=1}^{n} \text{Test Error}_i
    $$

#### **Bootstrap**:  
The bootstrap is a resampling technique that repeatedly draws samples with replacement from the original dataset to estimate the sampling distribution of a statistic (e.g., mean, accuracy, standard error). It is useful to understand the variability of a model's performance, compute confidence interval of metrics such as accuracy or RMSE.  

- Uncertainty Estimation  
  - Evaluates how sensitive the model is to different subsets of data.
  - Provides confidence intervals for model performance metrics (e.g., accuracy, AUC, MSE).
  - Helps quantify the variability of a model’s predictions.

- Alternative to Analytical Methods
  - Useful when theoretical formulas for standard error or confidence intervals are complex or unknown.
  - Particularly helpful with non-parametric models or small datasets.

- Out-of-Bag (OOB) Evaluation
  - In ensemble methods like Random Forests, bootstrap samples are used for training while OOB samples are used for validation without needing a separate test set.
    - Each tree is trained on a bootstrap sample.
    - For each data, validation is computed only using trees where the data point was not seen during training.
    - These predictions are aggregated to produce an OOB prediction.
      - It is effectively a cross-validation.

---

### How It Works
1. Draw **B** bootstrap samples (e.g., 1,000), each the same size as the original dataset, by sampling with replacement.
2. Train the model or compute a statistic (e.g., accuracy) on each sample.
3. Use the distribution of these B results to:
   - Estimate the mean (e.g., average accuracy)
   - Compute confidence intervals
   - Assess bias and variance

### 📌 **Example Use Cases**
- Estimating 95% CI for test accuracy of a classifier
- Calculating feature importance uncertainty in Random Forests
- Comparing two models more rigorously by examining the distribution of the difference in their performance

#### **Limitations**
- Can be computationally expensive for large models
- Assumes the original dataset is representative of the population
- May not perform well with highly dependent or time series data

---

### ML Evaluation


Model evaluation is the process of assessing how well a machine learning model performs on unseen data. It helps determine the model’s predictive power, generalization ability, and suitability for deployment.

---

#### Key Objectives
- Measure **accuracy**, **robustness**, and **bias-variance trade-off**
- Prevent **overfitting** or **underfitting**
- Compare **alternative models or algorithms**
- Select optimal **hyperparameters**

#### Evaluation Metrics

#### Classification
- **Accuracy**: $$ \frac{\text{Correct Predictions}}{\text{Total Predictions}} $$
- **Precision**: $$ \frac{\text{True Positives}}{\text{True Positives + False Positives}} $$
- **Recall (Sensitivity)**: $$ \frac{\text{True Positives}}{\text{True Positives + False Negatives}} $$
- **F1 Score**: Harmonic mean of precision and recall
- **ROC-AUC**: Area under the receiver operating characteristic curve

#### Regression
- **Mean Absolute Error (MAE)**: $$ \frac{1}{n} \sum |y_i - \hat{y}_i| $$
- **Mean Squared Error (MSE)**: $$ \frac{1}{n} \sum (y_i - \hat{y}_i)^2 $$
- **Root Mean Squared Error (RMSE)**: $$ \sqrt{\text{MSE}} $$
- **R-squared ($R^2$)**: Proportion of variance explained

#### **Validation Strategies**
- **Train/Test Split**: Simple, fast, risk of high variance
- **k-Fold Cross Validation**: Partition data into *k* folds; rotate train/test roles
- **Stratified Sampling**: Maintain class proportions in each fold (important for imbalanced datasets)
- **Leave-One-Out CV (LOOCV)**: Extreme case of k-fold (where k = n)

#### **Overfitting & Underfitting**
- **Underfitting**: High bias, poor training and test performance
- **Overfitting**: Low training error, high test error
- Use **learning curves**, **regularization**, and **cross-validation** to monitor and mitigate

#### **Evaluation Beyond Metrics**
- **Confusion Matrix**: Visual breakdown of predictions vs. actuals
- **Calibration Curve**: Checks predicted probabilities vs. actual outcomes
- **Lift and Gain Charts**: For assessing performance in marketing/risk models
- **Business Metrics**: ROI, conversion rate, cost savings, etc.

### ✅ **Best Practices**
- Always evaluate on **held-out or unseen test data**
- Monitor both **performance** and **fairness** (e.g., across demographic groups)
- Use **multiple metrics** to get a holistic view

---
  
## Support Vector Machine (SVM) and Kernel Trick
SVM finds the optimal hyperplane that maximizes the margin between two classes.

### **Linear SVM**
For a linearly separable dataset, the decision boundary is given by:

$$
w \cdot x + b = 0
$$

where:
- $$w$$ is the weight vector,
- $$x$$ is the input feature vector,
- $$b$$ is the bias term.

The margin $$ M $$ is:

$$
M = \frac{2}{||w||}
$$

SVM optimizes $$ w $$ and $$ b $$ by solving:

$$
\min_{w, b} \frac{1}{2} ||w||^2
$$

subject to:

$$
y_i (w \cdot x_i + b) \geq 1, \quad \forall i
$$

### Kernel Trick
When data is not linearly separable, a kernel function \( K(x, y) \) is used to map it into a higher-dimensional space:

$$
K(x, y) = \phi(x)^T \phi(y)
$$

Examples of kernels:
- **Linear Kernel**: $$ K(x, y) = x^T y $$
- **Polynomial Kernel**: $$ K(x, y) = (1 + x^T y)^p $$
- **Gaussian (RBF) Kernel**:

  $$
  K(x, y) = e^{-\gamma ||x - y||^2}
  $$

- **Sigmoid Kernel**:

  $$
  K(x, y) = \tanh(b_0 x^T y + b_1)
  $$
  
---
  
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
  
---
  

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

---
  
## Adaboost (Adaptive Boosting)
Adaboost combines weak classifiers to create a strong classifier by **reweighting misclassified samples**.

1. Assign weights $$ w_i $$ to each training sample.
2. Train a weak classifier $$ h_t(x) $$.
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

---

## Gradient Boosting

### Key Components
Gradient boosting involves three core elements:

1. **Loss Function**: Differentiable, problem-specific (e.g., squared error for regression, logarithmic loss for classification).
2. **Weak Learner**: Decision trees, specifically regression trees, are commonly used.
3. **Additive Model**: Trees are sequentially added to minimize the loss function.

### How Gradient Boosting Works

#### Loss Function
- Must be differentiable; flexible to handle various problems.
- Supports standard functions (squared error, logarithmic loss) and custom-defined ones.

#### Weak Learner
- Decision trees that predict real values (regression trees).
- Trees built greedily based on purity metrics (Gini) or direct loss minimization.
- Usually constrained to be "weak" through depth, splits, or leaf nodes.

#### Additive Model
- Trees added sequentially, each attempting to minimize residual errors of existing trees.
- Utilizes **functional gradient descent**:
  - Instead of adjusting parameters, a new tree is added that best reduces residual errors.
  - Iterative addition continues until reaching a fixed number of trees or until the loss no longer improves.

### Improving Basic Gradient Boosting

Gradient boosting can easily overfit; regularization techniques are crucial:

#### 1. Tree Constraints
- Balance complexity and number of trees:
  - **Number of Trees**: Add trees until performance stops improving.
  - **Tree Depth**: Typically 4-8 levels.
  - **Node/Leaf Constraints**: Restricting number of nodes or leaves.
  - **Minimum Observations per Split**: Ensures sufficient data for meaningful splits.
  - **Minimum Improvement in Loss**: Only significant improvements trigger new splits.

#### 2. Weighted Updates (Shrinkage)
- Each new tree's contribution weighted by learning rate (**shrinkage**).
- Smaller learning rates (0.1 to 0.3 or lower) require more trees but improve generalization.

#### 3. Stochastic Gradient Boosting
- Uses subsampling of data to construct each tree, reducing correlation among trees.
- Variations include:
  - Row subsampling before tree creation.
  - Column subsampling before tree creation or split consideration.
- Typically uses 50% of the data or columns to effectively reduce overfitting.

#### 4. Penalized Gradient Boosting
- Regularizes leaf node predictions to smooth weights and prevent overfitting.
- Common regularization methods:
  - **L1 regularization** (absolute weights penalty).
  - **L2 regularization** (squared weights penalty).

### Practical Considerations
- Balance between learning rate and number of trees is critical.
- Aggressive subsampling and constraints significantly improve model generalization.

---

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
  
---
  
## Entropy
Entropy measures **uncertainty** in a probability distribution:

$$
H(X) = -\sum_{i=1}^{n} P(x_i) \log_2 P(x_i)
$$

- **High entropy**: Data is **impure** or **uncertain**.
- **Low entropy**: Data is **pure** or **certain**.
  
---
  
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
