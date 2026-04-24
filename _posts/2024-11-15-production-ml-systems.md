---
layout: post
title: "Production ML Systems for RecSys"
date: 2024-11-15
excerpt: "Feature engineering, model serving, A/B testing, monitoring, and ML lifecycle at scale"
---

## Feature Engineering at Scale

At CK's scale (140M users), feature computation must be efficient:

- **Batch features:** Precomputed in BigQuery/Spark, stored in feature store, refreshed daily/hourly (e.g., credit score bucket, 30-day click history).
- **Real-time features:** Computed at serving time from streaming events (e.g., current session behavior, time since last visit).
- **Feature store architecture:** Offline store (BigQuery/Hive) for training, online store (Redis/DynamoDB) for serving, with a shared feature registry for consistency.
- Feature drift monitoring: track feature distributions over time, alert on significant shifts.
- **Feature store tools:** Feast, Tecton.

## Training Pipeline

- **Data collection and labeling:** implicit feedback (clicks, applications) vs. explicit (user ratings).
- **Train/validation/test splits:** time-based splits for recommendation (never leak future data).
- **Hyperparameter tuning:** Bayesian optimization, grid search at scale.
- **Distributed training:** for large models (TensorFlow on AI Platform, which CK uses).
- **Reproducibility:** version data, code, config, and model artifacts (MLflow).

## Model Serving

### Batch Scoring
Pre-score all user-item pairs periodically, store in a lookup table. Good for email/push campaigns. CK uses Apache Beam for this.

### Real-Time Scoring
Score at request time. Required for dynamic home feed. Architecture:

```
API gateway -> feature lookup (online store) -> model server (TF Serving / Triton) -> post-processing -> response
```

### Latency Budget
For a recommendation request, typically p99 < 200ms:
- Candidate retrieval (ANN): ~10ms
- Feature lookup: ~20ms
- Model inference: ~50ms
- Re-ranking: ~20ms

### Caching
Cache recommendations for recently scored users with TTL, invalidate on significant profile changes.

### Pre-computed vs Online vs Hybrid

- **Pre-computed (offline):** A batch job runs the RecSys periodically (hourly, nightly), stores the top-N results per user in a fast key-value store (Redis, DynamoDB). Backend just does a lookup at request time. Most common setup.
- **Online/real-time:** RecSys runs at request time using ANN search. Used when freshness matters a lot (e.g., news feeds).
- **Hybrid:** Candidates pre-fetched, but re-ranked in real-time using fresh signals (what the user just clicked).

## What Happens After Retrieval: The Serving Flow

```
User opens app
      |
      v
 API Gateway / Backend
      |
      |-- Rec lookup (Redis / feature store) --> your 100 candidates
      |
      |-- Ranker (re-scores the 100)
      |
      |-- Business logic filter (out of stock, already purchased, region-restricted)
      |
      +-- Returns top 20 item IDs + metadata
               |
               v
          Client renders page 1
               |
         (user scrolls down)
               |
               v
          Client fetches page 2 (cursor/session token)
```

The backend doesn't send 100 items at once. It sends a page (10-20 items) with a cursor. What's sent is typically just item IDs plus lightweight metadata (title, thumbnail URL, price), not full item objects.

## A/B Testing & Experimentation

- **Randomization unit:** user-level (not session-level) for CK.
- **Sample size calculation:** power analysis based on expected effect size and baseline metric variance.
- **Metrics:** primary (CTR, conversion, revenue), guardrails (approval rate, user complaints, churn).
- **Statistical rigor:** sequential testing, multiple comparison correction, novelty effects.
- **CK's experimentation platform:** "Darwin."

### A/B Testing Pitfalls
- Novelty effects (users click more on anything new)
- Network effects (users influence each other)
- Simpson's paradox (aggregate trends reverse within subgroups)
- Peeking (checking results before reaching statistical significance)

## Monitoring & Observability

- **Model performance monitoring:** Track AUC/NDCG on live data, compare to training performance.
- **Data quality monitoring:** Missing features, schema changes, upstream pipeline failures.
- **Prediction distribution monitoring:** Alert if prediction score distribution shifts significantly.
- **Business metric monitoring:** If CTR drops, is it the model or a product change?
- CK uses Monte Carlo for data observability.

## Model Retraining

- **When to retrain:** scheduled (daily/weekly) vs. triggered (performance degradation detected).
- **Warm-starting:** Almost always used in practice. Start with yesterday's weights, continue training on the last 24 hours of data. Much faster than training from scratch.
- **Online learning vs. periodic retraining:** tradeoffs in complexity and freshness.
- **Shadow deployment:** run new model in parallel, compare predictions before switching.
- **Canary deployment:** route small % of traffic to new model, monitor, gradually increase.

### The Shadow Index Workflow (for re-indexing after retraining)

1. **Background Embedding:** A massive Spark/Flink job runs all items through the updated Item Tower.
2. **Index Construction:** New vectors are fed into a brand-new, optimized index.
3. **The Flip:** Once the new index is ready and verified, traffic is routed from old to new index in milliseconds.

## Credit Karma-Specific Infrastructure

- **"Vega" ML Platform:** Three components --- QueryProcessor (BigQuery), PipelineProcessor (Apache Beam), ModelProcessor (TF/Scikit on AI Platform).
- **"Darwin" experimentation system:** CK's internal A/B testing platform.
- **Intuit integration:** Since the acquisition, CK has access to TurboTax and QuickBooks data.
