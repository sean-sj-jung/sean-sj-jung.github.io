---
layout: post
title: "Hypothesis Testing Example Math"
date: 2024-11-04
excerpt: "Compute p-value from scratch"
---

## Hypothesis testing Example Problems

Two sided tests are twice the one sided tests if:
- The test statistics under the null is symmetrically distributed

But:
- When testing a binomial distribution with small sample sizes, it is not symmetric unless n is large. 
- Bounded test statistics such as Chi-squared is inherently one-sided.
- When the null distribution is skewed, e.g. non-parametric, bayesian, or MLE-based with the non-Gaussian null.

---

### Compute p-value from scratch

Let $$ T $$ be a test statistic, and let $$ t_{\text{obs}} $$ be its observed value from the sample.  

- One-sided (e.g., $$ H_1: \mu > \mu_0 $$): $$ \text{p-value} = P_{H_0}(T \geq t_{\text{obs}}) $$
- One-sided (e.g., $$ H_1: \mu < \mu_0 $$): $$ \text{p-value} = P_{H_0}(T \leq t_{\text{obs}}) $$
- Two-sided (e.g., $$ H_1: \mu \neq \mu_0 $$):
  - If the distribution of $$ T $$ under $$ H_0 $$ is symmetric:
  $$
  \text{p-value} = 2 \cdot P_{H_0}(T \geq |t_{\text{obs}}|)
  $$

  Or more generally:

  $$
  \text{p-value} = P_{H_0}(|T| \geq |t_{\text{obs}}|)
  $$  

---

#### Example

Known population mean : $$ \mu_0 = 170 $$  
Known population stdev : $$ \sigma = 10 $$  
Sample size : $$ n = 25 $$  
Sample mean : $$ \bar{X} $$ = 173  

$$ 
H_0 : \mu = 170, H_a : \mu \neq 170 
$$  
  
$$
\begin{align}
Z &= \bar{X} - \mu_0 / \sigma/\sqrt(n) \\
&= (173-170) / (10/\sqrt{25}) \\
&= 3/2 \\
&= 1.5
\end{align}
$$

And

$$
\begin{align}
P (Z \ge 1.5) &= 1- N(1.5) \\
&~= 1-0.9332 \\
&= 0.0668
\end{align}
$$

$$
p-value = 2 * 0.0668 = 0.1336
$$

At significance level of 0.05, fail to reject the null hypothesis (p=0.1336 >0.05).

---

### t-stats, and unbiased estimation of sample standard deviation 

Sample standard deviation is given by:  
  
$$
s^2 = \frac{1}{n - 1} \sum_{i=1}^{n} (x_i - \bar{x})^2
$$

When the population standard deviation is unknown, then t-statistic is used.  
The test statistic for t-stats is given by: 
  
$$
t = \frac{\bar{x} - \mu_0}{s / \sqrt{n}} \quad \text{(with \( n-1 \) degrees of freedom)}
$$

---

### Other examples tests 

#### Chi-Squared for categorical case
- Example: testing independence between variables in a contingency table:  

  $$
  \chi^2 = \sum \frac{(O - E)^2}{E}
  $$
    
- This follows a **chi-squared distribution**, not normal.

#### Ordinal or non-normal data → Use rank-based or non-parametric tests
- Wilcoxon signed-rank, Mann-Whitney U, Kruskal-Wallis, etc

--- 

### Coin toss, Binomial example  
  
Q. A coin was flipped 1000 times, and 530 times it showed heads. Do you think the coin is biased? Why or why not?  

1.	Hypotheses

$$H_0: p = 0.5 \quad \text{(coin is fair)}$$
$$H_1: p \ne 0.5 \quad \text{(coin is biased)}$$

This is a two-sided test.

⸻

2.	Test statistic

Sample size: n = 1000
Observed proportion of heads:
$$$\hat p = \frac{530}{1000} = 0.53$$$

Under H_0, the standard error is
$$\text{SE}_0 = \sqrt{\frac{p_0(1-p_0)}{n}}
= \sqrt{\frac{0.5 \cdot 0.5}{1000}}
$$
The z-statistic is
$$z = \frac{\hat p - p_0}{\text{SE}_0}
= \frac{0.53 - 0.5}{\sqrt{0.5 \cdot 0.5 / 1000}}
\approx 1.90
$$
⸻

3.	p-value (two-sided)

$$p\text{-value} = 2\big(1 - \Phi(|z|)\big)
\approx 2 \big(1 - \Phi(1.90)\big)
\approx 0.06$$
  
Note: Do not confuse sample's distribution ($$Var(X)=n*p*q$$) vs distribution of $$\hat p=X/n, Var(\hat p)=1/n^2 \times Var(X) $$  
  