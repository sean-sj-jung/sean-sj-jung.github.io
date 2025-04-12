---
layout: post
title: "Elementary Stats"
date: 2024-11-02
excerpt: "Stats/Applied Stats 101 Equivalent Material"
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

### Central Limit Theorem
For a large enough sample size $$ n $$, the sample mean of i.i.d. random variables approximates a normal distribution:

$$
\frac{\bar{X}_n - \mu}{\sigma / \sqrt{n}} \to N(0,1) \text{ as } n \to \infty
$$

### Hypothesis Testing and p-value
#### - **p-value**:  
The probability of observing results as extreme or more extreme than the current sample statistic, under the assumption that the null hypothesis is true.
#### - $$\alpha$$  
  - Significance level  
  - Probability of making a Type I Error (False Positive)  
    - Rejecting a true null hypothesis  
    - e.g. Approve ineffective drug  
  - If p-value < $$ \alpha $$, reject $$ H_0 $$ 
  - To reduce Type 1 Error, reduce the value of $$ \alpha $$  

#### - $$\beta$$  
- Probability of making a Type II Error (False Negative)
  - Fail to reject the null hypothesis when the alternative is true
  - e.g. Fail to approve an effective drug
- The power of test  
  $$
  \text{Power} = 1 - \beta
  $$    
  - $$ 1 - \beta $$ is the probability of correctly rejecting $$ H_0 $$ when it is false.  
- To reduce the chance of Type II Error (or increase the power of test):  
  - Increase sample size
  - Design the study to detect a larger effect size
  - Increase $$ \alpha $$


### \beta and Power Analysis
Power analysis can be used to determines the minimum sample size required for an experiment based on:
- **Significance level $$\alpha$$**  
- **Statistical power $$1-\beta$$**  
- **Effect size**: Magnitude of the effect to detect
- Example: Approximated sample size for two-sample t-test with $$\alpha = 0.05$$ and $$\beta=0.2$$

$$
n \approx \left( \frac{z_{1 - \alpha/2} + z_{1 - \beta}}{d} \right)^2
$$

Where:
- $$ d = \frac{|\mu_1 - \mu_2|}{\sigma} $$ is the standardized effect size (Cohen’s d)
- $$ z_{1 - \alpha/2} = 1.96 $$,  $$z_{1 - \beta} = 0.84$$ → $$ n \approx \left(\frac{2.8}{d}\right)^2 $$

Thus, for moderate effect size $$ d = 0.5 $$, we need:

$$
n \approx \left(\frac{2.8}{0.5}\right)^2 = 31.36 \approx 32 \text{ samples per group}
$$
  where $$ s^2 $$ is an estimate of the population variance and $$ d = \mu_1 - \mu_2 $$.  


### Confusion Matrix
- **Precision**: 
  $$
  \frac{\text{True Positives}}{\text{True Positives} + \text{False Positives}}
  $$  
    
- **Recall**: 
  $$
  \frac{\text{True Positives}}{\text{True Positives} + \text{False Negatives}}
  $$

### Confidence Interval  
An estimated range of an unknown parameter for a given confidence level 

$$
\bar{X} \pm Z_{\alpha/2} \cdot \frac{\sigma}{\sqrt{n}}
$$


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
  
## Some notes regarding A/B Testing

### A/A Testing 

This is where you split your users into two groups, but both groups receive the same experience. 
It's used to validate your testing setup and ensure your randomization and measurement systems work correctly before running actual experiments

### Common Mistake in A/B Testing

1. Difference in distribution between population and sample
	caused by ramping up plans, multiple tests in parallel, segmentation by attributes subject to change (e.g. location) 

2. Violation of SUTVA (Stable Unit Treatment Value Assumption) aka spillover 
	The outcome of treatment only depends on the subject’s status, and is unaffected by another subject’s status
		e.g. social media (a user’s behavior affects another), Two-sided or shared resources (Uber, Lyft)
			Insta - Lower minimum fee of delivery - limit shopper / discourage users in control group etc 

3. Retention of the change 

### Measuring uncertainty in A/B Testing

Compute Confidence Interval or Standard Error

### Testing two dependent samples

Examples:  
- Pre-post experiments: Measuring the same subjects before and after a treatment (e.g., users before and after a UI change).  
- Matched samples: Each participant in one group has a closely matched participant in another group based on key characteristics.  
- Repeated measures: Same participants tested multiple times under different conditions.  

Tests :
- Paired t-test  
- Wilcoxon Signed-Rank Test, non-parametric test without normality assumption  
