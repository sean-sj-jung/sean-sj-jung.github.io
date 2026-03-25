---
layout: post
title: "Implement ANN search at scale"
date: 2025-02-08
excerpt: "Example implementation of scalable approximate search using FAISS."
---


```python
"""
Approximate Nearest Neighbor Search at Scale
=============================================
A practical guide to searching billions of vectors using FAISS.

This shows real index configurations you'd use in production,
from small scale to billion-scale.
"""

import numpy as np
import time

# pip install faiss-cpu (or faiss-gpu for GPU acceleration)
import faiss


# =============================================================================
# 1. BRUTE FORCE BASELINE (for comparison — doesn't scale)
# =============================================================================

def brute_force_search(vectors: np.ndarray, query: np.ndarray, k: int = 5):
    """
    Exact nearest neighbor — O(n * d) per query.
    Fine for <100K vectors. Unusable at billions.
    """
    index = faiss.IndexFlatIP(vectors.shape[1])  # Inner Product (cosine if normalized)
    index.add(vectors)
    scores, indices = index.search(query, k)
    return scores, indices


# =============================================================================
# 2. IVF + PQ — The workhorse for billion-scale search
# =============================================================================

def build_ivfpq_index(
    vectors: np.ndarray,
    nlist: int = 4096,       # number of Voronoi cells (clusters)
    m: int = 64,             # number of PQ sub-quantizers (must divide dim)
    nbits: int = 8,          # bits per sub-quantizer (256 centroids each)
    nprobe: int = 32,        # clusters to search at query time
):
    """
    IVF + Product Quantization index.
    
    How it works:
    
    INDEXING (offline, one-time):
      1. Train k-means with `nlist` clusters on a sample of your vectors
      2. Assign each vector to its nearest cluster centroid
      3. Compute residual = vector - centroid
      4. Compress each residual using Product Quantization:
         - Split the residual into `m` sub-vectors
         - Each sub-vector is quantized to one of 2^nbits centroids
         - So a 1536-dim float32 vector (6144 bytes) becomes just 64 bytes!
    
    QUERYING (online, per-request):
      1. Find the `nprobe` nearest cluster centroids to the query
      2. Within those clusters, compute approximate distances using PQ codes
      3. Return top-k results
    
    Memory math for 1 billion vectors:
      - Raw vectors: 1B × 1536 × 4 bytes = ~5.7 TB  (impossible to fit in RAM)
      - With PQ (m=64): 1B × 64 bytes = ~60 GB       (fits on a single machine!)
      - Plus overhead for centroids, IVF lists, etc.
    """
    dim = vectors.shape[1]
    
    # Step 1: Create the composite index
    quantizer = faiss.IndexFlatIP(dim)  # coarse quantizer for IVF
    index = faiss.IndexIVFPQ(
        quantizer,
        dim,
        nlist,   # number of clusters
        m,       # sub-quantizers
        nbits,   # bits per code
        faiss.METRIC_INNER_PRODUCT,
    )
    
    # Step 2: Train on a representative sample
    # For billions of docs, you train on a random sample (1-10M vectors)
    print(f"Training IVF-PQ index on {len(vectors)} vectors...")
    index.train(vectors)
    
    # Step 3: Add all vectors
    # In production, this is done in batches with index.add_with_ids()
    print(f"Adding {len(vectors)} vectors to index...")
    index.add(vectors)
    
    # Step 4: Set search-time parameter
    index.nprobe = nprobe  # trade-off: higher = better recall, slower
    
    return index


# =============================================================================
# 3. HNSW — Best recall/speed trade-off, but uses more memory
# =============================================================================

def build_hnsw_index(
    vectors: np.ndarray,
    M: int = 32,             # connections per node per layer
    ef_construction: int = 200,  # beam width during construction
    ef_search: int = 128,    # beam width during search
):
    """
    Hierarchical Navigable Small World graph.
    
    How it works:
    
    INDEXING:
      1. Build a multi-layer graph. Layer 0 has ALL vectors.
         Higher layers are progressively sparser (random subset).
      2. For each new vector, connect it to its M nearest neighbors
         in each layer, found via greedy graph traversal.
      3. ef_construction controls construction quality
         (higher = better graph, slower build).
    
    QUERYING:
      1. Enter at the top (sparsest) layer
      2. Greedily traverse to the nearest node
      3. Drop down one layer, repeat with wider beam (ef_search neighbors)
      4. At layer 0, return the top-k closest nodes found
    
    Memory: stores full vectors + graph links
      - 1B × 1536 × 4 bytes = 5.7 TB for vectors alone
      - Plus ~1B × M × 2 × 4 bytes ≈ 256 GB for graph
      - So HNSW alone doesn't work at billion scale without sharding
      - Solution: HNSW + PQ (compress stored vectors)
    
    But for <100M vectors, pure HNSW is the gold standard.
    """
    dim = vectors.shape[1]
    
    index = faiss.IndexHNSWFlat(dim, M, faiss.METRIC_INNER_PRODUCT)
    index.hnsw.efConstruction = ef_construction
    index.hnsw.efSearch = ef_search
    
    print(f"Building HNSW index ({len(vectors)} vectors, M={M})...")
    index.add(vectors)
    
    return index


# =============================================================================
# 4. BILLION-SCALE: IVF + HNSW coarse quantizer + PQ
# =============================================================================

def build_billion_scale_index(dim: int = 1536, nlist: int = 65536, m: int = 64):
    """
    The actual pattern used at billion scale.
    
    Key insight: Replace the flat (brute-force) coarse quantizer in IVF
    with an HNSW quantizer. This way, even finding which clusters to search
    is fast at scale.
    
    Architecture:
      ┌─────────────────────────────────────────────────┐
      │  Query comes in                                  │
      │       │                                          │
      │       ▼                                          │
      │  HNSW coarse quantizer                           │
      │  (finds nearest clusters in O(log n))            │
      │       │                                          │
      │       ▼                                          │
      │  Search top-nprobe IVF clusters                  │
      │  (PQ-compressed vectors, ~64 bytes each)         │
      │       │                                          │
      │       ▼                                          │
      │  Return top-k approximate neighbors              │
      └─────────────────────────────────────────────────┘
    
    In FAISS, this is expressed as an index factory string.
    """
    # This single line encodes the entire billion-scale architecture:
    # - OPQ64: Optimized Product Quantization pre-processing (rotation)
    # - IVF65536_HNSW32: IVF with 65536 clusters, HNSW as coarse quantizer
    # - PQ64: Product Quantization with 64 sub-quantizers
    index = faiss.index_factory(
        dim,
        "OPQ64,IVF65536_HNSW32,PQ64",
        faiss.METRIC_INNER_PRODUCT,
    )
    return index


# =============================================================================
# 5. SHARDING — When even compressed vectors don't fit on one machine
# =============================================================================

"""
At true billion scale, you typically shard across multiple machines:

    ┌─────────────┐
    │   Router /   │     Receives query, fans out to all shards
    │   Gateway    │
    └──────┬──────┘
           │
    ┌──────┼──────┬──────────────┐
    │      │      │              │
    ▼      ▼      ▼              ▼
┌──────┐┌──────┐┌──────┐    ┌──────┐
│Shard ││Shard ││Shard │ ...│Shard │   Each shard holds ~100-250M vectors
│  0   ││  1   ││  2   │    │  N   │   Each runs its own FAISS index
└──┬───┘└──┬───┘└──┬───┘    └──┬───┘
   │       │       │            │
   └───────┼───────┼────────────┘
           │
    ┌──────▼──────┐
    │   Merger     │     Merges top-k from each shard,
    │   (top-k)    │     returns global top-k
    └─────────────┘

Each shard:
  - Holds a subset of vectors (partitioned by document ID or hash)
  - Runs an IVF-PQ or HNSW-PQ index
  - Returns local top-k results
  
The router:
  - Sends query to ALL shards in parallel
  - Collects results
  - Merges and re-ranks to get global top-k
  
Typical setup:
  - 1B vectors / 200M per shard = 5 shards
  - Each shard: ~12 GB RAM for PQ codes + overhead
  - Replicas for availability and throughput
"""


# =============================================================================
# 6. FULL PRODUCTION RAG PIPELINE
# =============================================================================

"""
In a real RAG (Retrieval-Augmented Generation) system at scale:

    ┌──────────────────────────────────────────────────────────┐
    │                   INGESTION PIPELINE                      │
    │                                                           │
    │  Documents → Chunking → Embedding Model → Vector Store    │
    │                           (e.g. OpenAI, Cohere,           │
    │                            or your own model)             │
    │                                                           │
    │  Metadata extracted → Stored alongside vector IDs         │
    │  (title, date, source, access permissions, etc.)          │
    └──────────────────────────────────────────────────────────┘

    ┌──────────────────────────────────────────────────────────┐
    │                    QUERY PIPELINE                          │
    │                                                           │
    │  User Query                                               │
    │       │                                                   │
    │       ├──→ Embed query with same model                    │
    │       │                                                   │
    │       ├──→ STAGE 1: ANN search (FAISS / Milvus / etc.)   │
    │       │    Retrieve top-100 candidates in ~5ms            │
    │       │                                                   │
    │       ├──→ STAGE 2: Re-ranking (cross-encoder model)      │
    │       │    Score each candidate with a more expensive      │
    │       │    model that sees (query, document) together      │
    │       │    Narrow to top-10 in ~50ms                       │
    │       │                                                   │
    │       ├──→ STAGE 3: Metadata filtering                    │
    │       │    Apply business rules (date range, permissions,  │
    │       │    document type, etc.)                            │
    │       │    Can also be done pre-retrieval via partitioning │
    │       │                                                   │
    │       └──→ STAGE 4: Pass top documents to LLM             │
    │            Generate answer with retrieved context          │
    └──────────────────────────────────────────────────────────┘

The two-stage retrieval (ANN → re-ranker) is critical at scale.
ANN is fast but approximate; the re-ranker is slow but precise.
Together they give you the best of both worlds.
"""


# =============================================================================
# 7. RUNNABLE DEMO — Compare brute force vs IVF-PQ vs HNSW
# =============================================================================

def demo():
    """Run a comparison on synthetic data to see the speed/recall trade-offs."""
    
    np.random.seed(42)
    
    # Simulate 1M documents with 256-dim embeddings
    # (1536-dim would be realistic but 256 keeps this demo fast)
    n_vectors = 1_000_000
    dim = 256
    n_queries = 100
    k = 10
    
    print(f"Generating {n_vectors:,} random vectors (dim={dim})...")
    vectors = np.random.randn(n_vectors, dim).astype('float32')
    queries = np.random.randn(n_queries, dim).astype('float32')
    
    # Normalize for cosine similarity (inner product on unit vectors = cosine)
    faiss.normalize_L2(vectors)
    faiss.normalize_L2(queries)
    
    # --- Brute Force (ground truth) ---
    print("\n--- Brute Force (Exact) ---")
    index_flat = faiss.IndexFlatIP(dim)
    index_flat.add(vectors)
    
    t0 = time.time()
    gt_scores, gt_ids = index_flat.search(queries, k)
    t_flat = time.time() - t0
    print(f"  Time: {t_flat:.3f}s for {n_queries} queries")
    print(f"  QPS:  {n_queries / t_flat:.0f}")
    
    # --- IVF-PQ ---
    print("\n--- IVF-PQ (nlist=1024, m=32, nprobe=16) ---")
    nlist = 1024
    m = 32
    quantizer = faiss.IndexFlatIP(dim)
    index_ivfpq = faiss.IndexIVFPQ(quantizer, dim, nlist, m, 8, faiss.METRIC_INNER_PRODUCT)
    index_ivfpq.train(vectors)
    index_ivfpq.add(vectors)
    index_ivfpq.nprobe = 16
    
    t0 = time.time()
    ivfpq_scores, ivfpq_ids = index_ivfpq.search(queries, k)
    t_ivfpq = time.time() - t0
    
    # Compute recall: fraction of true top-k that appears in approximate top-k
    recall_ivfpq = np.mean([
        len(set(gt_ids[i]) & set(ivfpq_ids[i])) / k
        for i in range(n_queries)
    ])
    print(f"  Time: {t_ivfpq:.3f}s for {n_queries} queries")
    print(f"  QPS:  {n_queries / t_ivfpq:.0f}")
    print(f"  Recall@{k}: {recall_ivfpq:.3f}")
    print(f"  Speedup: {t_flat / t_ivfpq:.1f}x")
    
    # --- HNSW ---
    print("\n--- HNSW (M=32, efSearch=64) ---")
    index_hnsw = faiss.IndexHNSWFlat(dim, 32, faiss.METRIC_INNER_PRODUCT)
    index_hnsw.hnsw.efConstruction = 200
    index_hnsw.hnsw.efSearch = 64
    index_hnsw.add(vectors)
    
    t0 = time.time()
    hnsw_scores, hnsw_ids = index_hnsw.search(queries, k)
    t_hnsw = time.time() - t0
    
    recall_hnsw = np.mean([
        len(set(gt_ids[i]) & set(hnsw_ids[i])) / k
        for i in range(n_queries)
    ])
    print(f"  Time: {t_hnsw:.3f}s for {n_queries} queries")
    print(f"  QPS:  {n_queries / t_hnsw:.0f}")
    print(f"  Recall@{k}: {recall_hnsw:.3f}")
    print(f"  Speedup: {t_flat / t_hnsw:.1f}x")
    
    # --- Summary ---
    print("\n" + "=" * 60)
    print("SUMMARY")
    print("=" * 60)
    print(f"{'Method':<20} {'QPS':>8} {'Recall@10':>12} {'Speedup':>10}")
    print("-" * 60)
    print(f"{'Brute Force':<20} {n_queries/t_flat:>8.0f} {'1.000':>12} {'1.0x':>10}")
    print(f"{'IVF-PQ':<20} {n_queries/t_ivfpq:>8.0f} {recall_ivfpq:>12.3f} {t_flat/t_ivfpq:>9.1f}x")
    print(f"{'HNSW':<20} {n_queries/t_hnsw:>8.0f} {recall_hnsw:>12.3f} {t_flat/t_hnsw:>9.1f}x")
    print()
    print("Key insight: At 1M vectors, ANN is already 10-100x faster.")
    print("At 1B vectors, brute force is impossible; ANN is mandatory.")
    print()
    print("Memory comparison at 1B vectors (1536-dim, float32):")
    print(f"  Raw vectors:      ~{1e9 * 1536 * 4 / 1e12:.1f} TB")
    print(f"  IVF-PQ (m=64):    ~{1e9 * 64 / 1e9:.0f} GB  (+ centroids)")
    print(f"  HNSW (full):      ~{1e9 * (1536*4 + 32*2*4) / 1e12:.1f} TB  (vectors + graph)")
    print(f"  HNSW + PQ:        ~{1e9 * (64 + 32*2*4) / 1e9:.0f} GB  (compressed + graph)")


if __name__ == "__main__":
    demo()
```