---
layout: post
title: "Experiment Design"
date: 2024-11-05
excerpt: "Interview Style"
---

## A/B Testing Basics
---

#### What is an A/B test?
- A controlled experiment comparing two variants: control (A) and treatment (B).
- Users are randomly assigned to either group to estimate the causal effect of a change.
- Goal: measure impact on a key metric (e.g., conversion rate).

#### Why A/B Testing?
- Removes guesswork from feature optimization.
- Enables data-informed decisions.
- Measures impact of changes on business metrics.

#### Limitations of A/B Testing
Cannot test everything effectively:
- Change aversion and novelty effects: Users may resist or overly embrace new experiences initially.
- Long-term effects: Difficult to measure due to delayed or infrequent user actions.

Alternatives when A/B is insufficient:
- Analyze user activity logs
- Retrospective analysis
- User experience research
- Focus groups and surveys
- Human evaluation

### Conducting an A/B Test (5 Steps)

#### Step 1: Choose and Characterize Metrics
- **Invariant Metrics (Sanity Check)**: Should remain stable between control and treatment groups.
- **Evaluation Metrics**: Measure variation effectiveness (e.g., DAU, CTR).
- Metric Categories:
  - Sums and counts
  - Distributions (mean, median, percentiles)
  - Probability and rates (e.g., CTR)
  - Ratios
- Consider sensitivity (ability to detect meaningful changes) and robustness (resistance to irrelevant variations).
- Validate sensitivity and robustness through experiments, A/A tests, and retrospective analyses.

#### Step 2: Set Statistical Parameters
- **Significance Level (α)**: Commonly 0.05.
- **Statistical Power (1 - β)**: Commonly 0.8.
- **Practical Significance**: Level of change needed for actionable decisions, considering business impacts like cost and opportunity.

#### Step 3: Calculate Required Sample Size
Key considerations:
- **Choice of metric**: Affects variability.
- **Unit of Diversion**: Event-based, cookie-based, or user ID.
- **Population Eligibility**: All users or specific segments (e.g., geographic, industry-specific).
- Reduce sample size by adjusting α, β, or choosing appropriate units of diversion.

#### Step 4: Sample Groups and Run Test
Important factors:
- **Duration**: Consider seasonal or weekly cycles.
- **Exposure**: Fraction of traffic exposed to test.
- **Learning Effect**: User behavior stabilizes over time (plateau stage).
  - Manage by using smaller groups over extended periods.

#### Step 5: Analyze Results and Draw Conclusions
- **Sanity Check**: Ensure invariant metrics remain stable.
  - If failed, conduct retrospective analysis or explore learning effects.

- **Analyzing Results**:
  - If no significant difference is observed:
    - Inspect further by breaking down data by platforms or timing.
    - Cross-validate with alternative methods (parametric vs. non-parametric tests).
    - Beware of Simpson’s paradox (trend reverses when groups combined).

  - **Multiple Metrics Problem**:
    - Chance of random significant results increases with multiple tests (e.g., 20 tests → ~64% chance of false positive).
    - Solutions:
      - Bootstrap method for repeatability.
      - Bonferroni correction (divide α by number of tests).
      - Control Familywise Error Rate (FWER).
      - Control False Discovery Rate (FDR).

  - If metrics conflict:
    - Dive deeper to understand underlying causes.
    - Use an Overall Evaluation Criterion (OEC) to balance short-term and long-term goals.

### Practical Considerations
- **Ramp Up After Testing**: Identify incidental impacts on unaffected users.
- **Effect Flattening During Ramp-Up**: Possible reasons include seasonality, novelty, or change aversion.
  - Mitigate with hold-back methods or cohort analyses.

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
