---
layout: post
title: "Elementary Stats"
date: 2024-11-02
excerpt: "Probabiltiy and Statistics 101 Equivalent Material"
---

### Law of Large Numbers
Given an i.i.d. random variable $$ X $$:

- **General Form**: The sample mean converges to the population mean.

  $$
  \bar{X}_n \to \mu \text{ as } n \to \infty
  $$

- **Weak Law**: Sample mean converges in probability to the population mean.

  $$
  P(|\bar{X}_n - \mu| > \epsilon) \to 0 \text{ as } n \to \infty
  $$

- **Strong Law**: Sample mean converges almost surely.

  $$
  P\left(\lim_{n \to \infty} \bar{X}_n = \mu\right) = 1
  $$

---

### Central Limit Theorem
For a large enough sample size $$ n $$, the sample mean of i.i.d. random variables approximates a normal distribution:

$$
\frac{\bar{X}_n - \mu}{\sigma / \sqrt{n}} \to N(0,1) \text{ as } n \to \infty
$$

---

### Bayes' Theorem
Computes conditional probability:

$$
P(A|B) = \frac{P(B|A) P(A)}{P(B)}
$$  

or  

$$
P(A_i | B) = \frac{P(B | A_i) P(A_i)}{\sum_{j=1}^{n} P(B | A_j) P(A_j)}
$$

- Updates beliefs based on new evidence.
- Used in Bayesian inference to derive posterior probabilities.
  
---

### Confusion Matrix
- **Precision**: True Positive to All Positive Predicted  

  $$
  \frac{\text{True Positives}}{\text{True Positives} + \text{False Positives}}
  $$  
    
- **Recall**: True Positive to All Actual Positives  

  $$
  \frac{\text{True Positives}}{\text{True Positives} + \text{False Negatives}}
  $$

---

### Logistic Regression 
- Used for binary classification.
- Logit transformation:

  $$
  \log\left(\frac{P}{1 - P}\right) = b_0 + b_1X + \epsilon
  $$
  

### Maximum Likelihood Estimation (MLE)
  - Estimates coefficients by maximizing:

  $$
  L = f(x_1) f(x_2) \dots f(x_n)
  $$

  - Often optimized by minimizing $$ -\log L $$.
  

### Linear Regression
- **Equation**: 

  $$
  y = \beta_0 + \beta_1 x_1 + \beta_2 x_2 + \dots + \epsilon
  $$

- Assumptions:
  - Linear relationship between $$ X $$ and $$ Y $$.
  - Errors $$\epsilon$$ are normally distributed.
  - Homoscedasticity.
  - No multicollinearity.
  

### Bias-Variance Tradeoff
- **Bias**: Assumptions made by the model (e.g., linear regression has high bias).
- **Variance**: Sensitivity to training data (e.g., decision trees have high variance).
- **Tradeoff**: Minimizing both bias and variance is ideal.
  
  
**Bias-Variance Decomposition**
Consider a predictor:

  $$
  y = \hat{f}(x) + \epsilon
  $$

  where

  $$
  E[\epsilon] = 0, \quad Var(\epsilon) = \sigma^2
  $$
    
  then its mean squared error is given by: 
  
  $$
  \mathbb{E}[(y - \hat{f}(x))^2] = (\bar{f}(x) - f(x))^2 + \text{Var}[\hat{f}(x)] + \sigma^2
  $$

  where  

  $$
  \bar{f}(x) = \mathbb{E}[\hat{f}(x)]
  $$

  or

  $$
  \text{Total Error} = \text{Bias}^2 + \text{Variance} + \text{Irreducible Error}
  $$
  
