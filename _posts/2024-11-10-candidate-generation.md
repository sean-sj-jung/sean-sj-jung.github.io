---
layout: post
title: "Candidate Generation & Retrieval"
date: 2024-11-10
excerpt: "Two-tower models, ANN search, and near-real-time indexing"
---

## Two-Tower Model (The Workhorse)

**Architecture:** Two separate neural nets:

- **User tower:** user features -> user embedding u in R^d
- **Item tower:** item features -> item embedding v in R^d
- **Score** = u . v (dot product) or cosine similarity

Both towers are trained in the same vector space through contrastive loss (e.g. triplet). Both towers are updated simultaneously. The pre-computed item tower is used to build HNSW (or any ANN) index. A user vector is the key to HNSW, returning K nearest neighbors.

**Why two towers?** Because the towers are independent at inference time:

1. Pre-compute every item embedding offline, store in an ANN index.
2. At request time, compute the user embedding once, do an ANN lookup.
3. Latency = one forward pass + one ANN query, regardless of catalog size.

A single combined network is not scalable --- each tower has a separate function (one for query, one for building the index).

### Training: In-Batch Negatives

Within a training batch of N (user, positive_item) pairs, the other N-1 items in the batch act as negatives. Loss is typically a softmax / sampled softmax cross-entropy:

```
L = -log( exp(u . v+) / sum_j exp(u . v_j) )
```

### Gotchas to Mention

- **Popularity bias in in-batch negatives.** Popular items appear as negatives more often -> model under-scores them. Fix: **logQ correction** (subtract log of sampling probability from logits) --- this is the trick from the YouTube two-tower paper (Yi et al., 2019).
- **Dot product vs cosine.** Dot product lets magnitude encode "popularity"; cosine normalizes it away. Choice matters.
- **Cold start.** New items have no interactions -> rely on content features in the item tower.

## Approximate Nearest Neighbor (ANN) Search

Once you have embeddings, you need to find top-k neighbors of u over millions of v's in milliseconds. Exact search is O(Nd); ANN trades a little recall for huge speedups. At CK's scale (140M users, thousands of products), exact kNN is infeasible.

### Main Families

| Method | Idea | Strengths | Weaknesses |
|:---|:---|:---|:---|
| **LSH** (Locality-Sensitive Hashing) | Hash so similar vectors collide | Simple, theoretical guarantees | Lower recall in practice |
| **IVF** (Inverted File Index) | Cluster vectors (k-means), search only nearest few clusters | Fast, tunable | Recall drops near cluster boundaries |
| **HNSW** (Hierarchical Navigable Small World) | Multi-layer proximity graph; greedy descent | Best recall/latency tradeoff for most workloads | High memory footprint |
| **PQ** (Product Quantization) | Split vector into subvectors, quantize each | Massive memory savings | Lossy; usually combined as IVF-PQ |
| **ScaNN** (Google) | Anisotropic quantization tuned for inner product | SOTA for MIPS | More complex to tune |

### HNSW vs IVF-PQ: When to Pick Each

- **HNSW:** Graph-based, high recall and speed, but stores the full vectors in memory. RAM scales linearly with data size, so practical for ~10M vectors.
- **IVF-PQ:** IVF for clustering (search only nearest few clusters) + PQ for quantization (approximate, smaller memory but recall loss). Handles 10M-1B+ vectors.
- **HNSW-PQ** is also available now for large-scale use.

### Key Concepts

- **MIPS (Maximum Inner Product Search) != nearest neighbor.** Inner product isn't a metric (no triangle inequality). You either reduce MIPS to L2 via a transformation, or use a method designed for it (ScaNN).
- **Recall@k vs latency** is the tradeoff knob.
- **Libraries:** FAISS (Meta), ScaNN (Google), HNSWlib, Vespa, Milvus.

## Near-Real-Time (NRT) Indexing for New Items

A common question: if the ANN index is built by a daily batch job, how do platforms like YouTube/Instagram recommend content uploaded minutes ago?

### The "Bag of Retrievers" Strategy

Candidate generation is never just one model. A production system uses 10-20 different pipelines:

- **Heuristic-based retrieval:** "Latest videos from channels the user is subscribed to."
- **Topic-based retrieval:** "Latest videos in the 'Gaming' category for users interested in gaming."
- **Metadata-based retrieval:** Using Elasticsearch or Solr to find new items based on tags and titles rather than dense embeddings.

### Streaming Pipeline for Embeddings

The Item Tower often runs in a streaming pipeline (Flink or Kafka):

1. **On Upload:** The moment a video finishes processing, it is sent through the Item Tower.
2. **Embedding Generation:** The tower uses content features (title, description, thumbnail embeddings, video category) to generate a vector immediately.
3. **Incremental Update:** Instead of rebuilding the entire vector database from scratch, the system performs an incremental insert. New items are added to the index in seconds or minutes.

### Why Two-Tower Models Help with Cold Start

- **Matrix Factorization:** Requires an ID. If the ID is new, the model has no vector for it.
- **Two-Tower (Content-Aware):** The Item Tower doesn't just look at IDs; it looks at features. Even if a video has zero views, the model can look at the pixels in the thumbnail and the text in the title to project it into the embedding space near similar content. This is called **Inductive Learning**.

### Daily Batch Optimization: What It Actually Does

Even if the embedding model doesn't change, the *index structure* degrades with incremental inserts:

1. **IVF Re-clustering:** Certain neighborhoods may explode in size from new items. The batch job runs K-Means again on the entire dataset to rebalance bucket sizes.
2. **HNSW Graph Pruning:** Incremental inserts are "greedy." Over time, the graph develops routing inefficiencies. The batch job rebuilds the graph layers.
3. **Quantization Codebook Updates:** As the types of content change, the old PQ codebook may not represent new vectors accurately. The batch job retrains the codebook.
4. **Compaction:** Deleted/hidden items are "tombstoned" but still occupy space. The batch job physically removes them.
5. **Model Weights Change:** Platforms usually retrain the weights daily via warm-starting (continuing training on the last 24 hours of data). Even a 1% weight shift means every vector changes, requiring a full re-index via a **Shadow Index** workflow (build new index in background, then flip traffic).

| Component | Frequency | Purpose |
|:---|:---|:---|
| **Batch Training** | Daily/Weekly | Retrains the weights of the User/Item towers |
| **Incremental Indexing** | Seconds/Minutes | Passes new posts through the existing Item Tower into the vector DB |
| **Freshness Retrievers** | Real-time | Simple queries that don't need a neural network |
| **Ranking Stage** | Real-time | Heavy model that scores the top ~500 candidates |
