---
layout: post
title: "Experiment Design"
date: 2024-11-02
excerpt: "Interview Style"
---

### **1. A/B Testing Basics**
**Q: What is an A/B test?**
- A controlled experiment comparing two variants: control (A) and treatment (B).
- Users are randomly assigned to either group to estimate the causal effect of a change.
- Goal: measure impact on a key metric (e.g., conversion rate).

---

### **2. Key Elements in Experiment Design**
- **Randomization:** ensures groups are comparable, reduces confounding bias.
- **Unit of assignment:** user, session, cookie, etc.
- **Primary metric:** define success criteria upfront.
- **Sample size:** based on power, effect size, significance level.
- **Power (1 - β):** probability of detecting a true effect.

**Q: How would you design an experiment to test a new pricing model?**
- Define goal metric (e.g., revenue per user).
- Choose unit (e.g., user) and assign randomly.
- Control for seasonality, track engagement, revenue.
- Monitor pre-experiment covariates to check balance.

---

### **3. Real-World Concerns**
**Q: What if your treatment group is larger than control?**
- Could indicate allocation bias. Re-randomize or apply weighting if analysis is already done.

**Q: Users exposed to both A and B?**
- Leads to contamination. Use user-level randomization, or remove these users in analysis.

**Q: How do you handle seasonality?**
- Randomize over time. Stratify or block by day or time period.

---

### **4. Beyond A/B Testing**
**Q: A/B/n test vs. Multi-armed bandit (MAB)?**
- A/B/n: good for statistical inference.
- MAB: better for real-time optimization and adaptive learning.

**Q: What is a factorial design?**
- Varies multiple factors at once.
- Efficient for understanding interaction effects.

---

## 📈 HYPOTHESIS TESTING — CRIB NOTES

### **1. Core Concepts**
- **Null Hypothesis (H₀):** no effect.
- **Alternative Hypothesis (H₁):** there is an effect.
- **α (Significance level):** probability of Type I error (false positive).
- **β:** probability of Type II error (false negative).
- **Power:** probability of detecting true effect = 1 - β.

**Q: What does a p-value mean?**
- Probability of observing data as extreme as yours under H₀.

**Q: What’s statistical power?**
- Likelihood your test correctly rejects H₀ when H₁ is true.
- Increase with larger sample size, lower variance, bigger effect size.

---

### **2. Practical Scenarios**
**Q: Observed lift is 5%, p = 0.08 — what do you conclude?**
- Not statistically significant at α = 0.05.
- Cannot reject H₀. Possibly underpowered; consider confidence intervals.

**Q: What test for comparing means?**
- z-test if population variance known and large n.
- t-test if sample-based estimate. Use Welch’s t-test for unequal variance.
- Mann-Whitney U test for non-normal distributions.

---

### **3. Advanced Considerations**
**Q: What if you run 100 tests?**
- Apply multiple testing correction: Bonferroni, Holm, or FDR (Benjamini-Hochberg).

**Q: Can you stop an A/B test early if p-value < 0.05?**
- No — violates statistical guarantees unless using **sequential testing methods** (e.g., SPRT, Bayesian).

---

## 🎯 Conceptual + Open-Ended

**Q: Design an experiment for trust badge on sellers:**
- Metric: conversion rate, bounce rate, or trust score.
- Randomize users at the buyer level.
- Monitor pre- and post-experiment user behavior.
- Include qualitative feedback (surveys).

**Q: When is A/B testing inappropriate?**
- When you can’t randomize (e.g., geographic changes).
- When spillover effects are large (e.g., network effects).
- Use causal inference methods instead.

---

## 🔍 Causal Inference Corner (Advanced ML)

**Q: RCT vs. observational study?**
- RCT: gold standard; randomization removes confounders.
- Observational: uses statistical methods (e.g., matching, regression, IVs) to estimate causal effects.

**Q: Propensity Score Matching (PSM)?**
- Estimate probability of receiving treatment.
- Match treated and untreated units with similar scores to mimic randomization.

