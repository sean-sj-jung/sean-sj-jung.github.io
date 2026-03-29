---
layout: post
title: "Reservorr Sampling"
date: 2021-03-01
excerpt: "Reservoir Sampling and Algorithm R"
---

### The Mathematical Intuition

The goal is to maintain a "reservoir" of size $k$ from a stream of items $$1, 2, 3, \dots, n$$.

1.  **Initialize:** Fill the reservoir with the first $k$ items.
2.  **Iterate:** For every subsequent item $i$ (where $i > k$):
    * Generate a random integer $j$ between $1$ and $i$.
    * If $j \leq k$, replace the $j$-th element in the reservoir with the $i$-th element from the stream.


**The Probability Logic:**
At any step $i$, the probability that the $i$-th item enters the reservoir is exactly $\frac{k}{i}$. Through induction, you can prove that after $n$ steps, the probability that any specific item from the stream is in the reservoir is:

$$P = \frac{k}{n}$$

This holds true even though you never knew what $n$ was until the stream ended.

---

### [Algorithm R](https://en.wikipedia.org/wiki/Reservoir_sampling)  
Case of simple, uniform sampling.  
   
Implementation:  
```python
import random

def reservoir_sample(stream, k):
    """
    Algorithm R (Vitter, 1985)
    Select k items uniformly at random from a stream of unknown length.
    
    Args:
        stream: iterable of unknown (or known) length
        k: number of items to sample
    
    Returns:
        list of k sampled items
    """
    reservoir = []

    for i, item in enumerate(stream):
        if i < k:
            # Fill the reservoir with the first k items
            reservoir.append(item)
        else:
            # Replace a random element with decreasing probability
            j = random.randint(0, i)  # inclusive on both ends
            if j < k:
                reservoir[j] = item

    return reservoir

# Verify uniformity over many trials
from collections import Counter

counts = Counter()
trials = 100_000

for _ in range(trials):
    for item in reservoir_sample(range(20), k=1):
        counts[item] += 1

for item in sorted(counts):
    # You should see each item picked roughly 5% of the time, confirming uniformity
    pct = counts[item] / trials * 100 
```
   
### Algorithm A-Res  
Case of weighted sampling.  
  
Implementation:  
```python
import random
import heapq
from collections import Counter


def weighted_reservoir_single(stream, weights):
    """
    Weighted reservoir sampling for k=1.
    This is the Credit Karma follow-up approach.

    Each item is kept with probability w_i / cumulative_weight.

    Args:
        stream: iterable of items
        weights: iterable of corresponding weights

    Returns:
        single sampled item
    """
    current_pick = None
    total_weight = 0

    for item, w in zip(stream, weights):
        total_weight += w
        if random.random() < w / total_weight:
            current_pick = item

    return current_pick


def weighted_reservoir_k(stream, weights, k):
    """
    Algorithm A-Res (Efraimidis & Spirakis, 2006)
    Select k items from a weighted stream, with selection probability
    proportional to weight.

    Key idea: assign each item a key = random() ^ (1/weight).
    Keep the top-k keys. Higher weight -> key biased toward 1 -> more
    likely to stay in the reservoir.

    Args:
        stream: iterable of items
        weights: iterable of corresponding weights
        k: number of items to sample

    Returns:
        list of k sampled items
    """
    # Min-heap of (key, item) — smallest key gets evicted first
    heap = []

    for item, w in zip(stream, weights):
        # Core formula: key = U ^ (1/w) where U ~ Uniform(0,1)
        key = random.random() ** (1.0 / w)

        if len(heap) < k:
            heapq.heappush(heap, (key, item))
        elif key > heap[0][0]:
            # New item's key beats the weakest in the reservoir
            heapq.heapreplace(heap, (key, item))

    return [item for _, item in heap]

# --- Demo: k items (Algorithm A-Res) ---

items = list(range(10))            # 0 through 9
weights = [1, 1, 1, 1, 1, 1, 1, 1, 1, 91]  # item 9 is heavily weighted
k = 3

counts = Counter()
trials = 100_000

for _ in range(trials):
    sample = weighted_reservoir_k(items, weights, k)
    for item in sample:
        counts[item] += 1

print(f"\n=== Algorithm A-Res (k={k}) ===")
print(f"Weights: items 0-8 have weight 1, item 9 has weight 91")
print(f"Item 9 should appear in almost every sample.\n")
for item in sorted(counts):
    pct = counts[item] / trials * 100
    print(f"  Item {item}: appeared in {pct:.1f}% of samples")

```

---

### Use case in machine learning

In the era of Big Data and LLMs, we are constantly dealing with "Infinite Streams." You can't "pick a random row" from a database table that is being written to 50,000 times per second by global users. 

Example Problem
```python
"""
Part I. 
Given an array of scores, implement a random sampler randomly returns an index with probability proportional to its score.

Input: scores = [1]
Output: 0

Input: scores = [333, 666]
Calls: sampler(), sampler(), sampler()
Output: [1, 1, 0]
"""



```