---
layout: post
title: "Hypothesis Testing"
date: 2024-11-03
excerpt: "Hypothesis testing since it is so popular in interview"
---

## Hypothesis Testing and p-value

---

#### p-value  
The probability of observing results as extreme or more extreme than the current sample statistic, under the assumption that the null hypothesis is true.
  
---

#### Example 1: One-sample **Z-test** (Known population variance)

A company claims that their battery lasts **10 hours on average**. You think it’s **less**.

- $$ H_0 $$: $$ \mu = 10 $$
- $$ H_1 $$: $$ \mu < 10 $$ (left-tailed test)

You test 36 batteries and get:
- Sample mean $$ \bar{x} = 9.5 $$
- Population standard deviation $$ \sigma = 1.8 $$
- Sample size $$ n = 36 $$

#### 1. Compute test statistic (Z-score):

$$
Z = \frac{\bar{x} - \mu_0}{\sigma / \sqrt{n}} = \frac{9.5 - 10}{1.8 / \sqrt{36}} = \frac{-0.5}{0.3} = -1.67
$$

#### 2. Find p-value from Z-table:

Since this is a left-tailed test, the p-value is:

$$
P(Z < -1.67) \approx 0.0475
$$

#### 3. Compare to $$ \alpha = 0.05 $$:
- p-value = 0.0475 < 0.05 → Reject $$ H_0 $$
- Interpretation: The sample gives statistically significant evidence that the battery lasts less than 10 hours


---

#### Example 2: One-sample **t-test** (Unknown population variance)

You're testing whether a new teaching method affects test scores. Normally, average test score is 75.

You collect:
- Sample of 16 students
- Sample mean: $$ \bar{x} = 78 $$
- Sample standard deviation: $$ s = 6 $$

You want to test:
- $$ H_0 $$: $$ \mu = 75 $$
- $$ H_1 $$: $$ \mu \ne 75 $$ (two-tailed)

#### 1. Compute test statistic (t-score):

$$
t = \frac{\bar{x} - \mu_0}{s / \sqrt{n}} = \frac{78 - 75}{6 / \sqrt{16}} = \frac{3}{1.5} = 2.0
$$

#### 2. Degrees of freedom: $$ df = n - 1 = 15 $$

#### 3. Find p-value using t-distribution:
- For a two-tailed test:  
  $$ \text{p-value} = 2 \times P(t > 2.0 \text{ with } df = 15) $$
- From t-tables or calculator:
  $$ P(t > 2.0) \approx 0.032 $$

$$
\text{p-value} \approx 2 \times 0.032 = 0.064
$$

#### 4. Compare to $$ \alpha = 0.05 $$:
- p-value = 0.064 > 0.05 → Fail to reject $$ H_0 $$
- Interpretation: Not enough evidence to conclude the teaching method changes scores.

---

#### $$\alpha$$ and Type I Error
  - Significance level  
  - Probability of making a Type I Error (False Positive)  
    - Rejecting a true null hypothesis  
    - e.g. Approve ineffective drug  
  - If p-value < $$ \alpha $$, reject $$ H_0 $$ 
  - To reduce Type 1 Error, reduce the value of $$ \alpha $$  

#### $$\beta$$ and Type II Error
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


### $$\beta$$ and Power Analysis
Power analysis can be used to determines the minimum sample size required for an experiment based on:
- **Significance level $$\alpha$$**  
- **Statistical power $$1-\beta$$**  
- **Effect size**: Magnitude of the effect to detect
- Example: Approximated sample size for two-sample t-test with $$\alpha = 0.05$$ and $$\beta=0.2$$

$$
n \approx \left( \frac{z_{1 - \alpha/2} + z_{1 - \beta}}{d} \right)^2
$$

Where:
- $$ d = \frac{\mu_1 - \mu_2}{\sigma} $$ is the standardized effect size (Cohen’s d)
- $$ z_{1 - \alpha/2} = 1.96 $$,  $$z_{1 - \beta} = 0.84$$ → $$ n \approx \left(\frac{2.8}{d}\right)^2 $$

Thus, for moderate effect size $$ d = 0.5 $$, we need:

$$
n \approx \left(\frac{2.8}{0.5}\right)^2 = 31.36 \approx 32 \text{ samples per group}
$$
  
where $$ s^2 $$ is an estimate of the population variance and $$ d = \mu_1 - \mu_2 $$.  

---

### Confidence Interval  
- An estimated range of an unknown parameter for a given confidence level 
  $$
  \bar{X} \pm Z_{\alpha/2} \cdot \frac{\sigma}{\sqrt{n}}
  $$
- Plain-English Explanation:
  - A confidence interval gives you a range of values that you can be reasonably sure contains the true answer.
    - "Let's say you get an average of 10 from samples you have. Then we're 95% confident the true average to be between 9 and 11"
    - "In other words, we believe the real answer falls somewhere in this range and we are 95% sure".
- It does NOT mean "95% chance the true value is in the interval"
  - 95% refers to the method; If we repeat the same experiment many times, 95% of the resulting intervals would include the true value.
    - The interval changes for each experiment.

---
