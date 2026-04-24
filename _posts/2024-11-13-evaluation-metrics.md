---
layout: post
title: "Evaluation Metrics for RecSys"
date: 2024-11-13
excerpt: "Offline ranking metrics, classification metrics, online evaluation, and the offline-online gap"
---

## Offline Ranking Metrics

- **Precision@k / Recall@k** --- fraction of top-k that are relevant / fraction of relevant captured.
- **MAP** (Mean Average Precision) --- averages precision at each relevant rank.
- **MRR** (Mean Reciprocal Rank) --- `1 / rank of first relevant`. Good for "find one good answer" tasks.
- **NDCG@k** --- Normalized Discounted Cumulative Gain. Discounts relevance by `log2(rank+1)`. Handles graded relevance. **The default for ranking.**
- **Hit Rate @ k** --- was the held-out item in the top k? Common for retrieval eval.

## Classification Metrics (Ranker is Usually a Classifier Under the Hood)

- **AUC-ROC** --- threshold-free, but insensitive to calibration and dominated by easy negatives in imbalanced data.
- **PR-AUC** --- better for heavy class imbalance (most recsys data).
- **Log loss** --- penalizes miscalibration; the loss you actually trained on.
- **Calibration metrics:** reliability diagrams, **ECE** (Expected Calibration Error), Brier score. *Mention these --- Credit Karma cares.*

### Why AUC Can Look Great But Production Performance Is Poor

Imbalanced data. When click rates are 1-5%, a model that just predicts low probabilities everywhere will have a decent AUC but terrible real-world performance. Use PR-AUC and calibration metrics alongside AUC.

## Beyond Accuracy (Increasingly Asked About)

- **Coverage** --- what % of catalog ever gets recommended?
- **Diversity** --- intra-list similarity.
- **Novelty / Serendipity** --- are recs surprising or just popular?
- **Fairness** --- equal opportunity across demographic groups (ECOA-relevant for Credit Karma).

## Online Evaluation

- **A/B testing** is the gold standard. Offline metrics are proxies.
- **Interleaving** (team-draft interleaving) --- much more sensitive than A/B for ranking, lower traffic needed.
- **Counterfactual / off-policy evaluation** --- IPS (inverse propensity scoring) to estimate how a new policy *would have* performed on logged data. Key for recsys because you can't replay history.

## The Offline-Online Gap

A recurring real-world headache: a model wins offline but loses online. Causes:

- **Selection bias** --- your training data only contains items the old model showed.
- **Position bias** --- clicks reflect position, not just relevance.
- **Feedback loops** --- the model's own outputs become its next training data.

**Fixes:** propensity weighting, randomized exploration traffic, position features at train time that you zero out at inference (the YouTube "shallow tower" trick).

## Handling Class Imbalance

Approaches: resampling (SMOTE, undersampling majority), class weights in the loss function, threshold tuning, focal loss for deep models. For CK's click prediction, negative samples vastly outnumber positives. **Negative sampling** (only train on a subset of negatives) is common in large-scale recommender systems. Evaluation should use **precision-recall AUC** rather than ROC-AUC when classes are highly imbalanced.

## Handling Position Bias

The tendency for users to interact with items based on their position (top-ranked gets more clicks):

- Randomize the result for a small % of traffic
- Inverse weighting for top-interaction
- Include position as a feature during training, zero it out at inference
