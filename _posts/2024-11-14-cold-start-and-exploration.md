---
layout: post
title: "Cold Start & Exploration"
date: 2024-11-14
excerpt: "Cold start strategies for new users, items, and systems, plus multi-armed bandits for exploration"
---

## Cold Start Types

| Type | Problem | Approaches |
|:---|:---|:---|
| **New user** | No interaction history | Use demographics, contextual features, ask onboarding questions, popular-item fallback |
| **New item** | No interactions yet | Content-based features in item tower, meta-learning, contextual bandits |
| **New system** | No data at all | Rules, content-based, transfer learning |

## The "Millions of New Items" Problem

For platforms like YouTube/Instagram where millions of items are uploaded daily:

### Why It's Not as Infeasible as It Seems

1. **Two-tower models help.** Unlike matrix factorization (which requires an existing ID), the item tower can generate an embedding from content features alone --- title, description, thumbnail, category. This is **inductive learning**: the model generalizes to unseen items.

2. **Bag of Retrievers.** Production systems don't rely on a single retrieval model. They run 10-20 pipelines in parallel, including simple **freshness retrievers** (latest from subscribed channels, latest in category, metadata-based search via Elasticsearch).

3. **Near-real-time indexing.** Streaming pipelines (Flink/Kafka) push new items through the existing item tower and perform incremental inserts into the vector database within seconds/minutes.

4. **ANN handles the scale.** Adding 1 million fresh vectors throughout the day is manageable for modern distributed vector databases. ANN can query a billion vectors in 10-50ms.

## The Exploration Pipeline (Multi-Armed Bandits)

Platforms dedicate a small percentage of the feed (the "exploration budget") to new content.

**Bandits** (epsilon-greedy, Thompson sampling, LinUCB) are the principled way to handle exploration vs exploitation for cold items.

### How It Works

1. The system identifies "high potential" new items using the content-based item tower.
2. It forces these items into the feeds of a small, diverse subset of users.
3. The system watches the CTR in real-time.
4. If the item performs well, it gets promoted to a wider pool. If not, it drops.

### Common Strategies

- **epsilon-greedy:** Show random new items epsilon% of the time.
- **Thompson Sampling:** Maintain a posterior distribution over each item's CTR. Sample from the posterior to decide whether to show it. Items with uncertain-but-potentially-high CTR get exploration.
- **Upper Confidence Bound (UCB):** Pick the item with the highest upper confidence bound on expected reward. Naturally explores uncertain items.
- **LinUCB:** Contextual bandit that uses user/item features to personalize exploration.

## Cold Start for Credit Karma

For a new user with no interaction history, content-based filtering using their credit profile is essential:

- Credit score, income, credit utilization can be used immediately
- Popular-item fallback (most-clicked cards in their score range)
- Onboarding questions can help narrow preferences

For a new credit card product:

- Content features (APR, rewards category, annual fee, issuer) provide an embedding without interaction history
- Small exploration budget to gather initial signal
- Eligibility rules provide hard constraints from day one
