---
layout: post
title: "Causal Analysis"
date: 2024-11-07
excerpt: "Notes on Causal Analysis"
---

## Causal Effect
- The goal of A/B testing is to estimate the causal effect of a treatment (B) versus control (A).
- This is typically formalized as:
  $$
  \text{Causal Effect} = \mathbb{E}[Y \mid \text{B}] - \mathbb{E}[Y \mid \text{A}]
  $$
  where $$ Y $$ is the outcome variable (e.g., revenue).

## Causal Inference through A/B Testing  

### Randomization  
- By randomly assigning users to groups A and B, we make sure that on average, the two groups are statistically identical except for the treatment.
- This eliminates confounding factors, i.e., other variables that might influence the outcome.

### Counterfactual Framework  
- Each user has two potential outcomes:
  - $$ Y_i(1) $$: the outcome **if treated**
  - $$ Y_i(0) $$: the outcome **if not treated**
- We can never observe both for the same individual (the fundamental problem of causal inference), but with randomization, the difference in group means estimates the average treatment effect (ATE):
  $$
  \text{ATE} = \mathbb{E}[Y(1) - Y(0)]  
  $$

### **Common Issues in Causal Analysis**
- Violation of Randomization
    - If users self-select into groups, or there’s implementation bias, then causal inference is no longer valid.
- Non-compliance or Attrition
    - If users drop out or do not receive the treatment as assigned, we must adjust for non-compliance (e.g., via instrumental variables or intent-to-treat analysis).
- Heterogeneous Treatment Effects
    - Not all users respond to treatment the same way. Segmenting users and estimating conditional average treatment effects (CATE) can provide richer insights.

---

## Example : Online retailer's new checkout flow

You work for an e-commerce company. Your product team designs a new checkout flow aimed at reducing cart abandonment. You want to know:  
> _“Does the new checkout flow **cause** an increase in completed purchases?”_

### Designing the A/B Test:

- Control Group (A): Sees the current checkout flow.
- Treatment Group (B): Sees the new streamlined checkout flow.
- Users are randomly assigned to either group upon visiting the site.

### Target Metric:
- $$ Y = 1 $$ if user completes a purchase, $$ 0 $$ otherwise.
- Your goal is to estimate:
  $$
  \text{Causal Effect} = \mathbb{E}[Y \mid \text{Treatment}] - \mathbb{E}[Y \mid \text{Control}]
  $$

### Example Data:  

| Group        | Users | Conversion Rate |
|--------------|-------|------------------|
| Control (A)  | 50,000 | 22%              |
| Treatment (B)| 50,000 | 25%              |
  
Estimated average treatment effect (ATE):  
$$
\text{ATE} = 0.25 - 0.22 = 0.03 \Rightarrow \text{3 percentage point increase}
$$  

### Interpretation:  
> Thanks to randomization, we can say with causal confidence that the new checkout flow increased conversion by 3 percentage points.  

### Caveats You'd Check:  
- **Was randomization successful?** (Check balance of covariates like device, location, traffic source.)  
- **Did all users in the treatment group actually see the new flow?** (Non-compliance?)  
- **Are results statistically significant?** (Run a hypothesis test, e.g., z-test for proportions)  
- **Are effects consistent across key segments?** (New vs returning users?)  

### Expanded scenario: Causal Heterogeneity  

You find that:  
- New users increased conversion by **5 percentage points**  
- Returning users saw no change  

So you estimate CATE (Conditional Average Treatment Effect) for user segments. This can lead to personalized rollouts or targeted interventions.  

---

## Some Topics in Causal Analysis

---

### Conditional Average Treatment Effect (CATE)

### Formal Definition:
CATE is the expected causal effect of a treatment conditional on a subgroup or covariates:
$$
\text{CATE}(x) = \mathbb{E}[Y(1) - Y(0) \mid X = x]
$$
Where:
- $$ Y(1), Y(0) $$: potential outcomes under treatment and control
- $$ X = x $$: covariates (e.g., user age, device type, behavior)

### Conceptual Analogy:  
If ATE is the answer to **“Did the medication work?”**,  
then CATE is the answer to **“For whom did it work best?”**  

### Example:
You find the average effect of the new checkout flow is +3%, but now you ask:
> “Is this effect the same for everyone?”

You segment users by:
- Device type (mobile vs desktop)
- User type (new vs returning)

You find:
| Subgroup         | Conversion Lift (CATE) |
|------------------|------------------------|
| New users        | +5%                    |
| Returning users  | +0.5%                  |
| Mobile users     | +6%                    |
| Desktop users    | +1%                    |

Insight: The new checkout flow is highly effective on mobile and for new users. You might decide to roll out the feature only to those segments for now.

### How to Estimate CATE

#### 1. **Stratification**
Group users by categorical covariates (e.g., gender, age group), and compute ATE within each group.

#### 2. **Regression with Interaction Terms**
Use a regression model:
$$
Y = \beta_0 + \beta_1 \cdot \text{Treatment} + \beta_2 \cdot X + \beta_3 \cdot (\text{Treatment} \times X) + \epsilon
$$
The interaction term $$ \beta_3 $$ tells you how treatment effect varies with covariate $$ X $$.

#### 3. **Causal Trees / Forests (e.g., [Grf](https://github.com/grf-labs/grf))**
- Tree-based models that split data based on treatment effect heterogeneity.
- Estimate **CATE at individual or segment level** using recursive partitioning.

#### 4. **Meta-learners (Advanced)**
- **T-learner**: separate models for treated and control
- **S-learner**: single model with treatment as feature
- **X-learner**: tailored for imbalanced treatment groups

---

### Confounder

A confounder is a variable that:
1. Affects both the treatment and the outcome, and
2. Creates a spurious association between them if not properly controlled.

In other words, a confounder confuses the causal relationship between treatment and outcome.  
If confounders aren’t controlled:  
- The estimated treatment effect is biased.  
- You might conclude there's a causal effect when there isn’t — or miss a real effect.  

### Example: Does Exercise Reduce Blood Pressure?
- Treatment (T): Regular exercise
- Outcome (Y): Blood pressure
- Confounder (C): Age

> Older people tend to exercise less and have higher blood pressure.  
> If we don’t adjust for age, we might underestimate the effect of exercise, wrongly attributing the effect to aging rather than exercise itself.

### How to Handle Confounders

### 1. Randomization (Best Option)
- In A/B tests, random assignment ensures confounders are balanced between groups.
- This is why randomized experiments are the gold standard for causal inference.

### 2. Statistical Control (When Randomization is not possible)
- Use methods to adjust for confounders:
  
| Method | Description |
|--------|-------------|
| **Regression adjustment** | Include confounders as covariates in regression |
| **Stratification** | Estimate effects within strata (e.g., age groups) |
| **Matching** | Match treated and control units with similar confounder values |
| **Propensity scores** | Model probability of treatment, and match/weight by that |
| **Instrumental variables** | Use a variable that affects treatment but not outcome directly (more advanced) |

### Not All Covariates Are Confounders

Not all observed variables should be adjusted for.
- Mediators: Lie on the causal path (T → M → Y). Adjusting blocks the effect.
- Colliders: Common effects of T and Y. Conditioning on them introduces bias.

---

## Quasi-Experiment

A quasi-experiment is a study that attempts to estimate causal effects like an experiment but lacks random assignment. It use observational data and methods to mimic a randomized design as closely as possible.

### Common Quasi-Experimental Methods

### 1. **Difference-in-Differences (DiD)**

> Compares the change in outcome over time between a treatment group and a control group.

- Key Assumption: Parallel trends — if no treatment, both groups would have changed the same way.

Example:  
A city introduces a new traffic law in January. You compare accident rates before and after in that city versus another similar city without the law.

$$
\text{DiD Effect} = (Y_{treat, post} - Y_{treat, pre}) - (Y_{control, post} - Y_{control, pre})
$$

---

### 2. **Regression Discontinuity Design (RDD)**

> Uses a cutoff or threshold in an assignment variable to identify causal effects.

- Example: Students with GPA ≥ 3.0 get a scholarship. Compare outcomes for students just above and just below 3.0.

- Assumption: Units close to the cutoff are similar except for the treatment.

---

### 3. **Instrumental Variables (IV)**

> Uses an **external variable (instrument) that affects the treatment but has no direct effect on the outcome.

- Example: Distance to a college might influence whether someone attends college (treatment), but not their future income directly.

- Used when treatment is endogenous (e.g., self-selection into treatment).

---

### **Propensity Score Matching**

> Attempts to create comparable groups by matching units based on the probability of receiving treatment given observed covariates.

- Reduces selection bias.
- Doesn’t guarantee causal inference but can reduce confounding in observational studies.

---

## When to Use Quasi-Experiments

| Use When... | Examples |
|-------------|----------|
| Randomized trials are unethical | e.g., denying medical treatment |
| Logistically infeasible | Large-scale policy rollout, platform changes |
| You have good observational data | Web/app activity logs, natural policy variations |

### Caveats

- Assumptions are key, and often untestable.
- Still vulnerable to unobserved confounders, unless you can justify design rigorously.
- Requires careful design and robust sensitivity analysis.

### Summary Table

| Method                 | Key Assumption                         | Use Case Example                         |
|------------------------|-----------------------------------------|------------------------------------------|
| Difference-in-Differences | Parallel trends                     | Policy change in one region              |
| Regression Discontinuity | Sharp cutoff and local continuity    | Scholarship eligibility by test score    |
| Instrumental Variables | Instrument relevance and exclusion     | College proximity as an instrument       |
| Propensity Score Methods | No unmeasured confounding            | Web user behavior study                  |

---

Let me know if you'd like a visual example (e.g., DiD plot) or code snippet using synthetic data to illustrate any of these techniques!