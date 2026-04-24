---
layout: post
title: "RecSys Architecture Overview"
date: 2024-11-09
excerpt: "The modern recommender system funnel and Credit Karma context"
---

## The Credit Karma ML Context

Credit Karma's recommendation problem is **not** Netflix or YouTube. Key differences:

- **Sparse positives, expensive labels.** A "conversion" = user applies AND gets approved AND funds. Feedback loop is days to weeks, not seconds.
- **Eligibility matters.** Recommending a card a user will be denied for is *worse* than not recommending it (hurts user trust + credit score via hard inquiry).
- **Calibrated probabilities, not just ranking.** Expected revenue = P(click) x P(approval | click) x payout. You need calibrated probabilities to compute expected value, not just a relative ordering.
- **Two-sided marketplace.** Lenders have budget caps, eligibility rules, and bid prices. The system optimizes a constrained objective.
- **Regulatory constraints.** ECOA / fair lending --- you cannot use protected attributes, and disparate impact matters.

## The Modern Recommender Stack (The Funnel)

Almost every large-scale recommender follows this pattern:

```
Billions of items
     |
     v   CANDIDATE GENERATION / RETRIEVAL  (cheap, recall-oriented)
     |   -> Two-Tower, ANN, collaborative filtering, rules
     |
~1000 items
     |
     v   RANKING (expensive, precision-oriented)
     |   -> Wide & Deep, DeepFM, DCN, DLRM
     |
~100 items
     |
     v   RE-RANKING (business logic, diversity, fairness)
     |   -> MMR (Maximal Marginal Relevance), determinantal point
     |      processes, constraint solvers
     |
~10 items shown
```

**Why two stages?** You can't run a 100M-parameter ranker over a billion items per request. Retrieval narrows the set fast; ranking scores precisely.

### Problem Framing (Credit Karma Example)

1. **Problem framing:** Multi-objective ranking --- maximize P(click) * P(approval) * expected_revenue while maintaining member trust
2. **Candidate generation:** Filter by eligibility rules (hard constraints like credit score thresholds). Use embedding-based retrieval (two-tower model) to get ~100 candidates from thousands of offers
3. **Ranking:** Wide-and-deep model scoring candidates on P(click), P(approval), P(conversion). Features include user features (credit score, income, credit utilization, browsing history), item features (APR, rewards, annual fee, issuer), and cross features
4. **Re-ranking:** Apply business rules, diversity constraints (don't show 5 cards from same issuer), and fairness considerations
5. **Evaluation:** Offline (NDCG, MAP, AUC on historical data), online (A/B test CTR, conversion rate, revenue per session, member satisfaction)

## Collaborative Filtering vs. Content-Based Filtering

**Collaborative filtering** assumes users with similar past behavior will agree in the future. Two flavors: user-based (find similar users, recommend what they liked) and item-based (find similar items to what the user liked). Matrix factorization (SVD, ALS) and neural collaborative filtering are common implementations.

**Content-based filtering** uses item features (e.g., APR, credit limit, rewards category for credit cards) to recommend items similar to what the user has interacted with before.

**Credit Karma angle:** For a new user with no interaction history (cold-start), content-based filtering using their credit profile is essential. For engaged users, collaborative filtering captures latent preferences. CK likely uses a hybrid approach --- wide-and-deep models let you combine both.

## Quick-Reference Cheat Sheet

- **Retrieval:** Two-Tower + ANN (HNSW or ScaNN). Sampled softmax with logQ correction. In-batch negatives.
- **Ranking:** DCN-v2 / DeepFM / DLRM. Log loss. Calibrated.
- **Re-rank:** Business rules, diversity (MMR), fairness constraints, budget pacing.
- **Eval offline:** NDCG@k, Recall@k, log loss, ECE (calibration), PR-AUC.
- **Eval online:** A/B test, interleaving, guardrail metrics.
- **Watch for:** position bias, selection bias, feedback loops, popularity bias in negatives.
- **Credit Karma flavor:** calibration > pure ranking, approval != click, fair lending, two-sided marketplace.
