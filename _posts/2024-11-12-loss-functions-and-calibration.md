---
layout: post
title: "Loss Functions & Calibration"
date: 2024-11-12
excerpt: "Loss functions for recommenders, calibration techniques, and why calibration matters for Credit Karma"
---

## Loss Functions for Recommenders

| Loss | Formulation | When |
|:---|:---|:---|
| **Pointwise (BCE / log loss)** | Predict P(click) per (user, item) | CTR prediction; need calibrated probabilities (Credit Karma!) |
| **Pairwise (BPR)** | `-log sigma(score+ - score-)` | Ranking when only relative order matters |
| **Listwise (Softmax / ListNet / LambdaRank)** | Optimize over the whole list | When metric is NDCG or MRR |
| **Sampled softmax** | Softmax over positive + sampled negatives | Two-tower retrieval at scale |
| **Triplet loss** | `max(0, d(a,p) - d(a,n) + margin)` | Embedding learning |

**Credit Karma angle:** Because revenue depends on **expected approval probability**, pointwise log-loss with **calibration** is more useful than pure ranking losses. A model that ranks correctly but is uncalibrated breaks the expected-value math.

### Pointwise vs Pairwise vs Listwise: When to Use Each

- **Pointwise:** When you need calibrated probabilities for downstream math (e.g., P(click) x bid). Industry standard for ranking stages.
- **Pairwise:** When relative ordering is all that matters and you want to avoid calibration complexity.
- **Listwise:** Theoretically superior for ranking metrics but expensive --- requires feeding all candidates through the model jointly. Used in final re-ranking of small slates (10-20 items).

## Calibration

### What Calibration Actually Means

A model is calibrated if, among all items it scores y_hat = 0.7, roughly 70% of them were actually clicked. BCE + sigmoid *encourages* this but doesn't *guarantee* it.

### Why BCE + Sigmoid Should Work in Theory

The sigmoid + BCE combination has a nice property: the optimal solution under BCE is exactly P(y=1 | x). Minimizing:

```
L = -[y log y_hat + (1-y) log(1 - y_hat)]
```

pushes y_hat toward the true conditional probability.

### Why It Breaks in Practice

1. **Data imbalance.** Click rates in recommendation are often 1-5%. The model sees vastly more 0s than 1s, biasing it toward predicting low probabilities uniformly. Scores still rank correctly (AUC is fine) but absolute values are miscalibrated.
2. **Feature distribution shift.** Training data collected under the old ranking policy --- items shown at position 1 got clicked more due to exposure, not quality. The model learns position bias.
3. **Model architecture constraints.** A model that isn't expressive enough can't fit the true conditional distribution perfectly.
4. **Regularization and early stopping.** L2 regularization and dropout shrink logits toward zero, pushing sigmoid outputs toward 0.5.

### Post-hoc Calibration (Most Common in Industry)

Train your model normally for ranking performance, then fit a lightweight calibration layer on held-out data.

**Platt Scaling** --- fit a logistic regression on top of the raw logit z:

```
P_calibrated = sigmoid(a * z + b)
```

where a and b are learned on a validation set. Very cheap, often surprisingly effective.

**Isotonic Regression** --- fit a non-parametric monotone function mapping raw scores to empirical click rates. More flexible than Platt but needs more data and can overfit on small validation sets.

**Temperature Scaling** --- divide logits by a learned scalar T before sigmoid:

```
P_calibrated = sigmoid(z / T)
```

If T > 1, it softens overconfident predictions. If T < 1, it sharpens underconfident ones. Most popular approach in practice --- one parameter, easy to tune, preserves ranking order.

### During Training

**Downsampling negatives with correction.** Because negatives vastly outnumber positives, a common trick is to downsample negatives by a factor q during training, then correct the bias at inference:

```
P_corrected = P_raw / (P_raw + (1 - P_raw) / q)
```

This is exactly what Facebook described in their 2014 ad click prediction paper.

**Focal loss** --- modifies BCE to down-weight easy negatives:

```
L = -[alpha(1 - y_hat)^gamma * y * log(y_hat) + (1-alpha) * y_hat^gamma * (1-y) * log(1 - y_hat)]
```

Originally from object detection, sometimes used in RecSys. Note: it deliberately distorts calibration in favor of hard examples, so you'd still need post-hoc correction.

### How to Measure Calibration

**Reliability diagrams** --- bin predictions into deciles (0-0.1, 0.1-0.2, ...), plot mean predicted probability vs. mean actual click rate per bin. A perfectly calibrated model falls on the diagonal.

**Expected Calibration Error (ECE):**

```
ECE = sum_m (|B_m| / n) * |accuracy(B_m) - confidence(B_m)|
```

Weighted average of the gap between predicted and actual rates across bins. Lower is better.

### The Practical Takeaway

In industry, the typical pattern is:

1. Train DCN-v2 with BCE for ranking quality (AUC, NDCG)
2. Evaluate calibration separately with a reliability diagram
3. Apply **temperature scaling** or **Platt scaling** on a held-out set
4. If using negative downsampling, apply the **correction factor** at inference time
5. Re-check calibration periodically as data distribution shifts

Calibration matters most when scores are used **beyond just sorting** --- e.g., multiplying P(click) x bid in ads, or combining P(click) x P(convert | click) in a multi-stage utility model. If you're purely sorting, AUC is your metric and calibration is secondary.
