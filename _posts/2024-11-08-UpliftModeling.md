---
layout: post
title: "Uplift Modeling"
date: 2024-11-08
excerpt: "aka Incremental Modeling"
---

Goal of binary classification modeling: Predict "Who is likely to purchase?"  
Goal of uplift modeling : Predict "Who is likely to convert *because* of my action?"  
  
In other words, uplift modeling predicts "incremental value" rather than targeting Sure-Things, and causing notification fatigue.  

---

## 1. The Four Quadrants of Consumer Behavior
Uplift modeling categorizes your audience into four distinct groups based on how they respond to a treatment:

* **The Persuadables:** These are your primary targets. They only convert if they receive the treatment. This is where your ROI lives.
* **The Sure Things:** These users will convert regardless. 
* **The Lost Causes:** These users will not convert, whether you message them or not. 
* **The Sleeping Dogs:** These users are less likely to respond *because* they were targeted. These users are currently "sleeping" (inactive but satisfied). A push notification might actually trigger them to churn. 
  

---

## 2. The Core Logic: Calculating Uplift
In a standard A/B test, you look at the mean difference between Treatment ($T$) and Control ($C$). Uplift modeling attempts to estimate this at the **individual level**. 

We want to find the **Conditional Average Treatment Effect (CATE)**, defined as:

$$\tau(x) = E[Y | X=x, T=1] - E[Y | X=x, T=0]$$

Where:
* $\tau(x)$ is the Uplift score for a user with features $x$.
* $E[Y | X=x, T=1]$ is the predicted probability of conversion with the push.
* $E[Y | X=x, T=0]$ is the predicted probability of conversion without the push.

---

## 3. Common Modeling Strategies
Since we can never observe the same individual in both states simultaneously (the "Fundamental Problem of Causal Inference"), we use several proxy methods:

### The Two-Model Approach (T-Learner)
You train two separate models: one on the treatment group and one on the control group. 
1.  **Model A:** Predicts $P(Y|X)$ for the Treatment group.
2.  **Model B:** Predicts $P(Y|X)$ for the Control group.
3.  **Uplift Score:** For any new user, calculate the difference between the two model outputs. 

This is prone to error propagation because the models are independent and don't "talk" to each other about the treatment effect.

### The Single-Model Approach (S-Learner)
You train one model where "Treatment" is a feature. To calculate uplift, you run the model twice for each user: once with the `treatment` flag set to 1, and once set to 0. The difference is your score. 

### Class Transformation (Transformed Outcome)
This is a clever trick where you transform the target variable $Y$ into a new variable $Z$. For a randomized experiment with $50/50$ split:

$$Z = Y \times \frac{T - P(T)}{P(T)(1 - P(T))}$$

In simpler terms, if $P(T) = 0.5$, $Z$ becomes $2$ if the user converted in the treatment group, $-2$ if they converted in the control group, and $0$ otherwise. Predicting $Z$ directly estimates the uplift.

---

## 4. Evaluation: Beyond the Confusion Matrix
Standard metrics like Accuracy, Precision, and Recall don't work here because you don't have a "ground truth" for uplift (you don't know what a user *would* have done in the other state). Instead, we use:

* **Qini Curve / AUUC (Area Under the Uplift Curve):** Similar to a Lorenz curve. It plots the cumulative incremental gains as you target more of the population (sorted by uplift score).
* **Uplift Decile Charts:** You bin users by their uplift score and calculate the actual A/B test lift within each decile. In a good model, the top deciles show a massive gap between treatment and control, while the bottom deciles might show a negative gap (the Sleeping Dogs).

