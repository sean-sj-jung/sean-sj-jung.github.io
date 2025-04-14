---
layout: post
title: "Additional Notes for A/B Testing"
date: 2024-11-06
excerpt: "A/A, common mistakes and other interview questions"
---

## Some notes for A/B Testing

---

### A/A Testing 

This is where you split your users into two groups, but both groups receive the same experience. 
It's used to validate your testing setup and ensure your randomization and measurement systems work correctly before running actual experiments

---

### Common Mistake in A/B Testing

1. Difference in distribution between population and sample
	caused by ramping up plans, multiple tests in parallel, segmentation by attributes subject to change (e.g. location) 

2. Violation of SUTVA (Stable Unit Treatment Value Assumption) aka spillover 
	The outcome of treatment only depends on the subject’s status, and is unaffected by another subject’s status
		e.g. social media (a user’s behavior affects another), Two-sided or shared resources (Uber, Lyft)
			Insta - Lower minimum fee of delivery - limit shopper / discourage users in control group etc 

3. Retention of the change 

---

## Measuring uncertainty in A/B Testing

### Standard Error in A/B Testing

In the typical A/B test setup:
- **Group A (Control)** has sample size $$n_A$$, mean $$\bar{x}_A$$, and standard deviation $$s_A$$
- **Group B (Treatment)** has sample size $$n_B$$, mean $$\bar{x}_B$$, and standard deviation $$s_B$$

You're usually interested in the **difference in means**:  
$$
\Delta = \bar{x}_B - \bar{x}_A
$$

The standard error of this difference is:  
$$
\text{SE}(\Delta) = \sqrt{\frac{s_A^2}{n_A} + \frac{s_B^2}{n_B}}
$$

It's derived from the **variance of the difference between two independent sample means**:

If:
- $$X \sim \mathcal{N}(\mu_A, \sigma_A^2 / n_A)$$
- $$Y \sim \mathcal{N}(\mu_B, \sigma_B^2 / n_B)$$

Then:
$$
\text{Var}(Y - X) = \frac{\sigma_A^2}{n_A} + \frac{\sigma_B^2}{n_B}
\Rightarrow \text{SE} = \sqrt{\text{Var}}
$$

Since population variances $$\sigma^2$$ are unknown, we estimate them with sample variances $$s^2$$.

## Example

Suppose:
- Control (A): $$n_A = 1000$$, $$s_A = 1.5$$
- Treatment (B): $$n_B = 1000$$, $$s_B = 1.7$$

Then:
$$
\text{SE} = \sqrt{\frac{1.5^2}{1000} + \frac{1.7^2}{1000}} = \sqrt{\frac{2.25 + 2.89}{1000}} = \sqrt{\frac{5.14}{1000}} \approx 0.0717
$$

- To construct a 95% confidence interval around $$\Delta$$:

$$
CI = \Delta \pm z_{\alpha/2} \cdot \text{SE} \quad \text{(with } z_{0.025} \approx 1.96)
$$

- To compute a z-score or t-statistic:
$$
z = \frac{\bar{x}_B - \bar{x}_A}{\text{SE}}
$$

This z-score can then be used to find a p-value to test the null hypothesis: $$H_0: \mu_A = \mu_B$$.

## Notes

- If sample sizes are **equal and large**, the formula simplifies and becomes more robust.
- For small samples or unequal variances, use **Welch’s t-test**, which adjusts degrees of freedom.
- For binary outcomes (e.g., conversion rate), use proportions:
  $$
  \text{SE}(\Delta) = \sqrt{ \frac{p_A (1 - p_A)}{n_A} + \frac{p_B (1 - p_B)}{n_B} }
  $$

---

Would you like a Python function that calculates standard error, confidence intervals, and p-values for A/B test data?

---

### Testing two dependent samples

Examples:  
- Pre-post experiments: Measuring the same subjects before and after a treatment (e.g., users before and after a UI change).  
- Matched samples: Each participant in one group has a closely matched participant in another group based on key characteristics.  
- Repeated measures: Same participants tested multiple times under different conditions.  

Tests :
- Paired t-test  
- Wilcoxon Signed-Rank Test, non-parametric test without normality assumption  
