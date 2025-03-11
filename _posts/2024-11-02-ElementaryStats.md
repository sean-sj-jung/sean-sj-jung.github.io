---
layout: post
title: "Elementary Stats"
date: 2024-11-02
excerpt: "Stats/Applied Stats 101 Equivalent Material"
---

## Law of Large Numbers
Given an i.i.d. random variable \( X \):

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
For a large enough sample size \( n \), the sample mean of i.i.d. random variables approximates a normal distribution:

$$
\frac{\bar{X}_n - \mu}{\sigma / \sqrt{n}} \to N(0,1) \text{ as } n \to \infty
$$

## Hypothesis Testing and p-value
- **p-value**: Probability of obtaining test results at least as extreme as the observed results, assuming the null hypothe
