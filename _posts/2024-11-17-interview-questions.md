---
layout: post
title: "RecSys Interview Question Bank"
date: 2024-11-17
excerpt: "Practice questions for recommender system interviews, organized by category"
---

## Conceptual Questions

1. Walk me through the architecture of a modern large-scale recommender.
2. Why two towers instead of one big network that takes user and item together?
   - Not scalable; each tower has a function (one for query, other for building the ANN index)
3. Why do you need ANN --- why not exact search?
   - No time & resource at scale
4. Compare HNSW and IVF-PQ. When would you pick each?
   - Both ANN but:
   - HNSW: Graph-based, high recall and speed, but stores the full vectors in memory. RAM scales linearly --- practical for ~10M vectors.
   - IVF-PQ: IVF for clustering + PQ for quantization. Approximate, smaller memory but recall loss. Handles 10M-1B+ vectors.
   - HNSW-PQ is also available now.
5. Wide & Deep --- what does each part do, and why train jointly?
   - Wide: can't handle unseen. Deep: over-generalizes. Combined (not ensembled) gets both.
6. Why might AUC look great but the model still perform poorly in production?
   - Imbalanced data
7. How would you evaluate a recommender for a financial product where the reward is approval, not click?
8. How do you handle position bias (tendency for users to interact with items based on position)?
   - Randomize the result, inverse weighting for top-interaction, include position as a feature
9. How do you cold-start a brand new credit card with no interaction data?
10. What's the difference between candidate generation and ranking, and why split them?

## Credit Karma-Flavored Questions

11. You're recommending credit cards. Your CTR model is great but revenue is flat. What's likely wrong?
    - *Hint: optimizing clicks, not approvals/funded loans.*
12. How would you build a system that doesn't recommend products users will be denied for?
13. How would you ensure fair lending compliance in a ranking model?
14. A lender has a daily budget cap. How does that change your ranking objective?
    - *Constrained optimization, pacing, shadow prices.*

## Trade-off Questions (They Love These)

15. Pointwise vs pairwise vs listwise --- when would you use each?
16. Dot product vs cosine similarity in a two-tower model?
17. Why might you NOT use a deep model?
    - *Latency, interpretability, data size, regulatory explainability.*

## ML Fundamentals

**Bias-Variance Tradeoff:**
High bias = model is too simple, underfits. High variance = model is too complex, overfits to training noise. Regularization (L1/L2, dropout, early stopping) penalizes complexity to reduce variance at a slight cost to bias.

**Class Imbalance:**
Approaches: resampling (SMOTE, undersampling majority), class weights in the loss function, threshold tuning, focal loss for deep models. For CK's click prediction, negative sampling is common. Use PR-AUC rather than ROC-AUC.

**kNN vs ANN:**
Exact kNN computes distances to all points --- O(n*d) per query. Fine for <100K items. ANN (FAISS, ScaNN, HNSW) trades small accuracy loss for massive speed gains --- sub-millisecond retrieval over millions.

## Coding Questions to Practice

Be prepared to code on CoderPad:

- Implement cosine similarity between user/item vectors
- Write a simple matrix factorization update step
- Implement a basic gradient descent for logistic regression
- Dynamic programming problem (reported by previous candidates)
- SQL: feature engineering queries --- window functions, self-joins, aggregations

## Technical Concepts to Brush Up On

- **Two-tower models** for candidate retrieval (user tower + item tower, dot product for similarity)
- **Learning-to-rank:** pointwise, pairwise (RankNet), listwise (LambdaMART, LambdaRank)
- **Multi-armed bandits** for explore/exploit in recommendations (Thompson sampling, UCB)
- **Calibration:** ensuring P(approval) predictions are well-calibrated, not just well-ranked
- **Embedding-based retrieval** at scale (FAISS, ScaNN)
- **Feature stores** (Feast, Tecton) --- architecture and benefits
- **A/B testing pitfalls:** novelty effects, network effects, Simpson's paradox, peeking
- **Position bias** in recommendation evaluation
- **Negative sampling** strategies for implicit feedback
- **GenAI for recommendations:** LLMs as user-intent parsers, RAG for financial Q&A
