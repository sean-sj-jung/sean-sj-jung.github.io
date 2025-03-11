---
layout: post
title: "Elementary Stats"
date: 2024-11-02
excerpt: "Stats/Applied Stats 101 Equivalent Material"
---

## Law of Large Numbers
Given an i.i.d. random variable $$ X :

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

## Central Limit Theorem
For a large enough sample size $$ n $$, the sample mean of i.i.d. random variables approximates a normal distribution:

$$
\frac{\bar{X}_n - \mu}{\sigma / \sqrt{n}} \to N(0,1) \text{ as } n \to \infty
$$

## Hypothesis Testing and p-value
- **p-value**: Probability of obtaining test results at least as extreme as the observed results, assuming the null hypothesis is true.
- **Significance Level $$\alpha$$**: Pre-chosen probability threshold.
- **Power of a Test**: Probability of correctly rejecting the null hypothesis when the alternative is true.

  $$
  \text{Power} = 1 - \beta
  $$

- **Type I Error $$\alpha$$**: False positive, rejecting a true null hypothesis.
- **Type II Error $$\beta$$**: False negative, failing to reject a false null hypothesis.

## Performance Metrics
- **Precision**: 
  $$
  \frac{\text{True Positives}}{\text{True Positives} + \text{False Positives}}
  $$
- **Recall**: 
  $$
  \frac{\text{True Positives}}{\text{True Positives} + \text{False Negatives}}
  $$

## Confidence Interval
An estimated range of an unknown parameter for a given confidence level:

$$
\bar{X} \pm Z_{\alpha/2} \cdot \frac{\sigma}{\sqrt{n}}
$$

## Power Analysis
Determines the minimum sample size required for an experiment based on:
- **Significance level $$\alpha$$, often 0.05.
- **Statistical power $$1-\beta$$**, often 0.8.
- **Effect size**: Magnitude of the difference to detect.
- Example Sample size formula for two-sided t-test with default $$\alpha$$ and $$\beta$$:

  $$
  N = \frac{16s^2}{d^2}
  $$

  where $$ s^2 $$ is sample variance and $$ d = \mu_1 - \mu_2 $$.

## Bayes' Theorem
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

## Logistic Regression 
- Used for binary classification.
- Logit transformation:

  $$
  \log\left(\frac{P}{1 - P}\right) = b_0 + b_1X + \epsilon
  $$

## Maximum Likelihood Estimation (MLE)
  - Estimates coefficients by maximizing:

  $$
  L = f(x_1) f(x_2) \dots f(x_n)
  $$

  - Often optimized by minimizing $$ -\log L $$.

## Linear Regression
- **Equation**: 

  $$
  y = \beta_0 + \beta_1 x_1 + \beta_2 x_2 + \dots + \epsilon
  $$

- Assumptions:
  - Linear relationship between $$ X $$ and $$ Y $$.
  - Errors $$\epsilon$$ are normally distributed.
  - Homoscedasticity.
  - No multicollinearity.

## Bias-Variance Tradeoff
- **Bias**: Assumptions made by the model (e.g., linear regression has high bias).
- **Variance**: Sensitivity to training data (e.g., decision trees have high variance).
- **Tradeoff**: Minimizing both bias and variance is ideal.

$$
\text{MSE} = \text{Bias}^2 + \text{Variance} + \text{Irreducible Error}
$$
