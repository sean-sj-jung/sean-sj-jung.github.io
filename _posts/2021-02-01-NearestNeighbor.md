---
layout: post
title: "kNN, Nearest Neighbor"
date: 2021-02-01
excerpt: "k-NN from Scratch"
---

### Implement k-NN
1. Receive a query point and the training dataset  
2. Compute distance from the query point to every point in the dataset (typically Euclidean)  
3. Sort all distances and pick the k smallest  
4. Aggregate the labels of those k neighbors — majority vote for classification, average for regression  
5. Return the predicted label  

  
#### Version 1, without numpy  
  
```python
data = [
    [5.10, 5.37, 5.09, 2],
    [9.85, 10.17, 10.49, 3],
    [1.27, 0.77, 0.77, 1],
    [5.19, 4.70, 4.85, 2],
    [4.73, 5.06, 4.42, 2],
    [5.10, 4.02, 4.34, 2],
    [0.55, 0.29, 1.73, 1],
    [10.17, 9.12, 10.16, 3],
    [9.94, 9.85, 9.26, 3],
    [10.52, 10.47, 9.58, 3],
    [9.81, 9.66, 10.31, 3],
    [4.70, 5.93, 4.99, 2],
    [0.72, 0.49, 1.16, 1],
    [4.89, 5.03, 4.29, 2],
    [4.47, 5.41, 4.39, 2],
    [1.79, 1.38, 0.77, 1],
    [1.12, 0.04, 0.14, 1],
    [9.64, 9.77, 10.53, 3],
    [1.25, 0.93, 1.32, 1],
    [1.76, 0.88, 0.88, 1]
]

target = [1.1, 0.9, 1.2] # Expected Result for test_sample: 1

import math # can be replaced with ** 0.5, but neither robust nor optimal

def compute_distances(data: list[list], target: list[float]) -> list[tuple[float, int]]:
    pairs = []
    for row in data:
        features, label = row[:-1], row[-1]
        distance = math.sqrt(sum((f - t) ** 2 for f, t in zip(features, target)))
        pairs.append((distance, label))
    return sorted(pairs, key=lambda x: x[0])

def classify(neighbors: list[tuple[float, int]]) -> int:
    votes = {}
    for distance, label in neighbors:
        weight = 1 / (distance + 1e-9)
        votes[label] = votes.get(label, 0) + weight
    return max(votes, key=votes.get) 

def knn(data: list[list], target: list[float], k: int = 3) -> int:
    pairs = compute_distances(data, target)
    return classify(pairs[:k])

print(knn(data, target))  # → 1.0
```
  
#### Version 2, Using numpy  
  

```python
import numpy as np

data = np.array(data)
target = np.array(target)

def compute_distances(data:np.array, target:np.array) -> list:
    diffs = data[:, :-1] - target 
    distances = np.sqrt(np.sum(diffs**2, axis=1)) 
    out = zip(distances, data[:, -1])
    return sorted(out, key=lambda x:x[0])

def classify(distances:list) -> int: 
    # Majority vote
    temp = {}
    for d, label in distances:
        eps = 1e-9
        w = 1 / (d + eps) # weighted distance
        temp[label] = temp.get(label, 0) + w # +1 if it was not weighted
    label = max(temp, key=temp.get) # Getting the MAX OF DICT. 
    
    return label

def kNN(data:np.ndarray, target:np.ndarray, k:int = 3) -> int:
    distances = compute_distances(data, target)
    target_label = classify(distances[:k])

    return target_label



print(kNN(data,target))
```


### Key points:  
  
- Distance metric — Euclidean is standard, but you should mention Manhattan and cosine as alternatives  
- Choice of k — small k = high variance, large k = high bias (the bias-variance tradeoff)  
- Tie-breaking — what happens when votes are equal? (use odd k, or distance-weighted voting)  
    - Other heuristics : pick the smaller/larger class by size, pick the closest one (k=1), expand k until it breaks,  
    - Tie may never break.  
    "A tie means the point lies in a genuinely ambiguous region of the feature space.  
    No tie-breaking rule fixes that — it just picks a policy for handling irreducible uncertainty."  
- Scaling — kNN is sensitive to feature scale, so normalization matters  
- Time complexity — naïve kNN is O(n·d) per query (n = dataset size, d = dimensions); mention k-d trees or ball trees as optimizations  


---
  
### k-Nearest Neighbors (kNN) vs. Approximate Nearest Neighbor (ANN)  

#### The Core Difference
The fundamental difference is Exhaustiveness. 
* **kNN (Exact):** Guarantees finding the absolute $k$ closest neighbors by calculating the distance between the query point and *every single point* in the dataset.
* **ANN (Approximate):** Uses clever data structures (indexes) to find neighbors that are "close enough" with high probability, but not guaranteed to be the absolute closest.

#### Key Comparison Points

| Feature | k-Nearest Neighbors (kNN) | Approximate Nearest Neighbor (ANN) |
| :--- | :--- | :--- |
| **Accuracy** | 100% (Deterministic) | Statistical (Probabilistic) |
| **Complexity** | $O(N \cdot d)$ — Linear search | $O(\log N)$ or $O(1)$ — Sub-linear |
| **Scalability** | Poor; slows down as data grows | Excellent; designed for billion-scale data |
| **Memory** | Low (no index overhead) | High (requires building/storing an index) |

#### When to use which?
* kNN: when the dataset is small (e.g., a few thousand samples) or when 100% precision is non-negotiable (e.g., medical diagnostics on a small reference set).
* ANN: when you are dealing with high-dimensional embeddings at scale (e.g., Pinterest visual search, Spotify recommendations, or LLM retrieval-augmented generation).

### Common ANN Algorithms (Good for "Bonus Points")
If you want to impress the interviewer, mention the techniques used to achieve that speed:
* HNSW (Hierarchical Navigable Small World): A graph-based approach.
* IVF (Inverted File Index): Dividing the space into Voronoi cells.
* LSH (Locality Sensitive Hashing): Hashing similar points into the same "buckets."
  