---
layout: post
title: "Experiment Design"
date: 2024-11-05
excerpt: "Interview Style"
---

## A/B Testing Basics
---

What is an A/B test?
- A controlled experiment comparing two variants: control (A) and treatment (B).
- Users are randomly assigned to either group to estimate the causal effect of a change.
- Goal: measure impact on a key metric (e.g., conversion rate).

---

### Key Elements in Experiment Design

- **Randomization:** ensures groups are comparable, reduces confounding bias.
- **Unit of assignment:** user, session, cookie, etc.
- **Primary metric:** define success criteria upfront.
- **Sample size:** based on power, effect size, significance level.
- **Power (1 - β):** probability of detecting a true effect.

**Example: How would you design an experiment to test a new pricing model?**
- Define goal metric (e.g., revenue per user).
- Choose unit (e.g., user) and assign randomly.
- Control for seasonality, track engagement, revenue.
- Monitor pre-experiment covariates to check balance.

---

### Real-World Concerns

What if your treatment group is larger than control?  
- Could indicate allocation bias. Re-randomize or apply weighting if analysis is already done.

Users exposed to both A and B?  
- Leads to contamination. Use user-level randomization, or remove these users in analysis.

How do you handle seasonality?  
- Randomize over time. Stratify or block by day or time period.

---

## Hypothesis Testing

- Null Hypothesis (H₀): no effect.
- Alternative Hypothesis (H₁): there is an effect.
- α (Significance level): probability of Type I error (false positive).
- β: probability of Type II error (false negative).
- p-value: Probability of observing data as extreme as yours under H₀.
- Power: probability of detecting true effect = 1 - β.
    - Likelihood your test correctly rejects H₀ when H₁ is true.
    - Increase with larger sample size, lower variance, bigger effect size.

Example Question: What test for comparing means?
- z-test if population variance known and large n.
- t-test if sample-based estimate. Use Welch’s t-test for unequal variance.
- Mann-Whitney U test for non-normal distributions.

---

### **3. Advanced Considerations**
**Q: What if you run 100 tests?**
- Apply multiple testing correction: Bonferroni, Holm, or FDR (Benjamini-Hochberg).

**Q: Can you stop an A/B test early if p-value < 0.05?**
- No — violates statistical guarantees unless using sequential testing methods (e.g., SPRT, Bayesian).

---

### Case Scenario

**Design an experiment for trust badge on sellers:**
- Metric: conversion rate, bounce rate, or trust score.
- Randomize users at the buyer level.
- Monitor pre- and post-experiment user behavior.
- Include qualitative feedback (surveys).

**When is A/B testing inappropriate?**
- When you can’t randomize (e.g., geographic changes).
- When spillover effects are large.
- Use causal inference methods instead.

---
