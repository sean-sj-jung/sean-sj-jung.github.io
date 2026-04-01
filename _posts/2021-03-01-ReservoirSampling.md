---
layout: post
title: "Reservoir Sampling"
date: 2021-03-01
excerpt: "Reservoir Sampling and Algorithm R"
---

### The Mathematical Intuition

The goal is to maintain a "reservoir" of size $k$ from a stream of items $$1, 2, 3, \dots, n$$.

1.  **Initialize:** Fill the reservoir with the first $k$ items.
2.  **Iterate:** For every subsequent item $i$ (where $i > k$):
    * Generate a random integer $j$ between $1$ and $i$.
    * If $j \leq k$, replace the $j$-th element in the reservoir with the $i$-th element from the stream.


### The Probability Logic  
At any step $i$, the probability that the $i$-th item enters the reservoir is exactly $\frac{k}{i}$. Through induction, you can prove that after $n$ steps, the probability that any specific item from the stream is in the reservoir is:

$$P = \frac{k}{n}$$

This holds true even though you never knew what $n$ was until the stream ended.

### Mathematical induction of the Reservoir Sampling (Algorithm R)  

We want to prove that after $n$ items have been processed, the probability that any specific item $i$ (where $1 \leq i \leq n$) is in the reservoir of size $k$ is:
$$P(i \in R_n) = \frac{k}{n}$$
  

### 1. The Base Case
Consider the moment we have processed exactly $n = k$ items. 
According to the algorithm, the first $k$ items are all placed directly into the reservoir. Therefore, for any item $i \in \{1, \dots, k\}$:
$$P(i \in R_k) = \frac{k}{k} = 1$$
The base case holds.

### 2. The Inductive Step
Assume the hypothesis is true for $n$ items. That is, for any item $i$ processed so far:
$$P(i \in R_n) = \frac{k}{n}$$

Now, we process the $(n+1)$-th item. We need to show that for all items $\{1, \dots, n+1\}$, the probability of being in the reservoir becomes $\frac{k}{n+1}$.

#### For the new item $(n+1)$:
The algorithm states we generate a random integer $j \in \{1, \dots, n+1\}$. If $j \leq k$, the new item enters the reservoir. 
$$P(n+1 \in R_{n+1}) = \frac{k}{n+1}$$
This matches our goal for the new item.

#### For any old item $i$ (where $i \leq n$):
An old item $i$ is in the reservoir at step $n+1$ if and only if:
1. It was already in the reservoir at step $n$.
2. It was **not** replaced by the $(n+1)$-th item.

Let $A$ be the event that item $i$ was in the reservoir at step $n$. By our inductive hypothesis:
$$P(A) = \frac{k}{n}$$

Let $B$ be the event that item $i$ is **not** replaced by item $n+1$. 
Item $i$ is replaced only if item $n+1$ is chosen to enter the reservoir (probability $\frac{k}{n+1}$) **and** item $i$ is specifically chosen to be the one swapped out (probability $\frac{1}{k}$).

$$P(i \text{ is replaced}) = P(n+1 \text{ enters}) \times P(i \text{ is chosen for replacement})$$
$$P(i \text{ is replaced}) = \frac{k}{n+1} \times \frac{1}{k} = \frac{1}{n+1}$$

Therefore, the probability of *not* being replaced is:
$$P(B) = 1 - \frac{1}{n+1} = \frac{n}{n+1}$$

Since the events are independent relative to the $(n+1)$-th choice:
$$P(i \in R_{n+1}) = P(A) \times P(B)$$
$$P(i \in R_{n+1}) = \frac{k}{n} \times \frac{n}{n+1} = \frac{k}{n+1}$$

Both the new item and all previous items now have a probability of exactly $\frac{k}{n+1}$ of being in the reservoir. By the principle of induction, the algorithm produces a true simple random sample for any $n \geq k$.

---
  
### Use case in machine learning  
- **Infinite Streams**: You can't "pick a random row" from a database table that is being written to 50,000 times per second by global users.  
- **Stochastic Gradient Descent**: When streaming ~10TB from S3, you use reservoir sampling to make sure mini-batches aren't biased by the order of the file.  
  
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

---

### Algorithm A-Ress  
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

### A note for the random key trick  

1. Uniform Case:  
Assign a random key drawn from Uniform(0, 1), then keep the top-k keys.  
Equal probability of landing in the top k.  
  
2. Weighted Case:  
Transformation $$ key = U ^ (1/w) $$ where U is drawn from Uniform(0, 1), and w is the item's weight.  
- Large w → small exponent (1/w ≈ 0) → anything raised to a power near 0 goes toward 1. So the key is pushed close to 1. Heavy items almost always get high keys.  
- Small w → large exponent (1/w is big) → U raised to a large power gets crushed toward 0. Light items usually get low keys.  
- Efraimidis and Spirakis (2006) proved that "when you use U^(1/w) as the key and keep the top-k, the probability of any particular item being included in the sample is proportional to its weight"  

---
  
### Example Problem  
```python
"""
Part I. 
Given an array of scores, implement a random sampler that randomly returns an index with probability proportional to its score.

Input: scores = [1]
Output: 0

Input: scores = [333, 666]
Calls: sampler(), sampler(), sampler()
Output: [1, 1, 0]
"""

import random

class WeightedSampler:
    def __init__(self, scores): # Create CDF out of scores
        self.cumulative = []
        total = 0
        for s in scores:
            total += s
            self.cumulative.append(total)
        self.total = total

    def sample(self): # Binary search through the CDF array
        r = random.random() * self.total
        lo, hi = 0, len(self.cumulative) - 1
        while lo < hi:
            mid = (lo + hi) // 2
            if self.cumulative[mid] <= r:
                lo = mid + 1
            else:
                hi = mid
        return lo


"""
Part II.
Now imagine the scores are streamed instead, and you can't store them in memory. Modify your solution so that it processes one entry at a time, while still selecting index with probability proportional to their score.
"""

# Streaming Top-1 Solution
import random

class StreamingWeightedSampler:
    def __init__(self):
        self.current_selection = None
        self.total_weight = 0

    def process_element(self, item_id, score):
        """
        Processes one product at a time from a stream.
        """
        # 1. Increase the total weight seen so far
        self.total_weight += score
        
        # 2. The probability of picking the NEW item is: score / total_weight
        if random.uniform(0, self.total_weight) < score:
            self.current_selection = item_id

    def sample(self):
        return self.current_selection

# --- Example Usage ---
sampler = StreamingWeightedSampler()
stream = [("Product A", 10), ("Product B", 20), ("Product C", 70)]

for product_id, score in stream:
    sampler.process_element(product_id, score)

print(f"Final Selection: {sampler.sample()}")



# Streaming Top-k Solution
import random
import heapq

def weighted_reservoir_top_k(stream, k):
    heap = [] # Min-heap to keep track of the largest keys
    
    for item_id, weight in stream:
        # Generate the 'key'
        # Formula: u^(1/w)
        key = random.random() ** (1.0 / weight)
        
        if len(heap) < k:
            heapq.heappush(heap, (key, item_id))
        elif key > heap[0][0]:
            heapq.heapreplace(heap, (key, item_id))
            
    return [item for key, item in heap]
```

