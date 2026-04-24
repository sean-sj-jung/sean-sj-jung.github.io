---
layout: post
title: "Ranking Models"
date: 2024-11-11
excerpt: "Wide & Deep, DeepFM, DCN-v2, DLRM, and sequence models for recommendation ranking"
---

## 4.1 Wide & Deep (Cheng et al., 2016, Google Play)

**The intuition: memorization vs generalization.**

- **Wide part:** a linear model over raw + cross-product features. Memorizes specific co-occurrences ("users who installed Netflix installed Hulu"). Great for sparse, exception-y patterns.
- **Deep part:** an MLP over dense embeddings of categorical features. Generalizes to unseen feature combinations.
- **Joint training:** both heads feed into a single sigmoid, trained jointly with one loss (NOT ensembled --- this matters; ensembling trains them separately).

**Why it mattered:** Pure deep models over-generalized (recommended weird stuff); pure wide models couldn't handle unseen combos. The hybrid won.

**Manual feature crosses are the wide part's pain point.** That's what the next generation fixed.

### The Core Math

The prediction for a binary classification task:

```
P(Y = 1 | x) = sigmoid( w_wide^T [x, phi(x)] + w_deep^T a^(l_f) + b )
```

Where phi(x) are the cross-product transformations for the Wide part, and a^(l_f) is the final activation of the Deep part.

**Credit Karma angle:** Credit Karma uses this architecture because financial product recommendations need both: precise memorization (regulatory/approval patterns are deterministic) and generalization (discovering new user-product affinities).

### Python Implementation (TensorFlow/Keras)

```python
import tensorflow as tf
from tensorflow.keras import layers, Model

def build_wide_and_deep_model(wide_dim, deep_dim):
    # 1. Define Inputs
    input_wide = layers.Input(shape=(wide_dim,), name="wide_input")
    input_deep = layers.Input(shape=(deep_dim,), name="deep_input")

    # 2. The Deep Branch (Generalization)
    deep_1 = layers.Dense(64, activation='relu')(input_deep)
    deep_2 = layers.Dense(32, activation='relu')(deep_1)
    deep_out = layers.Dense(16, activation='relu')(deep_2)

    # 3. The Wide Branch (Memorization)
    wide_out = layers.Dense(16, activation=None)(input_wide)

    # 4. The "Fusion" Step
    combined = layers.concatenate([wide_out, deep_out])

    # 5. Final Output Layer
    output = layers.Dense(1, activation='sigmoid')(combined)

    model = Model(inputs=[input_wide, input_deep], outputs=output)
    return model

model = build_wide_and_deep_model(wide_dim=10, deep_dim=5)
model.compile(optimizer='adam', loss='binary_crossentropy', metrics=['accuracy'])
model.summary()
```

## 4.2 DeepFM (Guo et al., 2017)

Replaces the wide part's hand-crafted crosses with a **Factorization Machine**, which learns all 2nd-order feature interactions automatically via embeddings. FM and deep components **share embeddings**. No feature engineering needed.

- FM score: sum_i w_i x_i + sum_{i<j} <v_i, v_j> x_i x_j
- The dot product <v_i, v_j> is the learned interaction strength between feature i and feature j.

## 4.3 DCN / DCN-v2 (Deep & Cross Network)

Explicit higher-order crosses via stacked "cross layers":

```
x_{l+1} = x_0 * x_l^T * w_l + b_l + x_l
```

Each layer adds one degree of feature interaction. DCN-v2 (2020) replaces the vector w_l with a matrix --- much more expressive. Google's production replacement for Wide & Deep.

### Pointwise Ranking with BCE

DCN-v2 (and most industry ranking models) solve ranking **pointwise** --- the model scores each candidate independently with a binary label, then ranking falls out from sorting those scores:

```
[500 candidates from retrieval]
        |
DCN-v2 scores each independently:
  item_1  -> P(click) = 0.82
  item_2  -> P(click) = 0.74
  item_3  -> P(click) = 0.41
  ...
  item_500 -> P(click) = 0.11
        |
Sort descending by score -> take top 10-50
        |
Re-ranker (business rules, diversity, etc.)
        |
Final slate shown to user
```

**Why pointwise BCE works:**
- **Computational tractability.** Pairwise losses require O(n^2) pairs per user; listwise requires all candidates simultaneously. Pointwise is the only feasible approach at scale.
- **Calibration is useful.** A calibrated P(click) = 0.7 can be multiplied by expected value (e.g., P(click) x bid price in ads) to produce a utility score.
- **Implicitly solves ranking.** If BCE is minimized well, higher scores = better items. Ranking is a free consequence.

### Where Different Losses Show Up

| Stage | Loss | Why |
|---|---|---|
| Two-tower retrieval | Softmax / BPR (pairwise) | Need to contrast positive vs. negatives from millions of items |
| DCN-v2 ranking | BCE pointwise | Score 500 candidates independently, sort |
| Final re-ranker (small slate) | Sometimes listwise | Only 10-20 items; can afford joint scoring |
| LTR research models | LambdaMART, ApproxNDCG | Offline, batch, accuracy > throughput |

## 4.4 DLRM (Meta, 2019)

Meta's open-sourced production architecture: dense features -> MLP, sparse features -> embeddings, all pairwise dot products -> top MLP -> CTR. Notable for its **embedding tables that can hit terabytes** --- drives a lot of distributed-training infra work.

## 4.5 Sequence Models (Worth Knowing Exist)

- **GRU4Rec** --- RNN over a user's recent interactions.
- **SASRec / BERT4Rec** --- self-attention over sequences; BERT4Rec uses masked-item prediction.
- Useful when **order and recency matter** (session-based recs).

## Key Papers

1. **Cheng et al., 2016** --- Wide & Deep Learning for Recommender Systems
2. **Covington et al., 2016** --- Deep Neural Networks for YouTube Recommendations (candidate-gen + ranking split)
3. **Yi et al., 2019** --- Sampling-Bias-Corrected Neural Modeling for Large Corpus Item Recommendations (two-tower + logQ)
4. **Guo et al., 2017** --- DeepFM
5. **Wang et al., 2020** --- DCN-v2
6. **Naumov et al., 2019** --- DLRM
7. **Malkov & Yashunin, 2016** --- HNSW
