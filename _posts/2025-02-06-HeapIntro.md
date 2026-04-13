---
layout: post
title: "Introduction to Heap"
date: 2025-02-06
excerpt: "A brief overview of Heap."
---

## Heap  
  
---   
  
## 1. Core Concepts  
  
### What is a Heap?

A **binary heap** is a **nearly complete binary tree** stored as an array.

- All levels are fully filled **except possibly the lowest**.
- The lowest level is filled **from left to right** (no gaps).
  
### Max-Heap vs Min-Heap

| Property | Max-Heap | Min-Heap |
|---|---|---|
| Rule | Every node ≤ its parent | Every node ≥ its parent |
| Root | Largest element | Smallest element |
| Classic use | **Heapsort** | **Priority queues** |
  
### Array Representation

For a 0-indexed array representing the heap:

```
root              = index 0
left child(i)     = 2*i + 1
right child(i)    = 2*i + 2
parent(i)         = (i - 1) // 2     
```

Why arrays? No pointer overhead, great cache locality, and the index math above gives O(1) navigation.

### Key Operations & Time Complexities

| Operation | Time | Notes |
|---|---|---|
| **peek** (get min/max) | O(1) | Just read index 0 |
| **insert** (push) | O(log n) | Append to end, then **sift up** |
| **extract-min/max** (pop) | O(log n) | Swap root with last, remove last, then **sift down** |
| **heapify** (build heap from array) | **O(n)** | Bottom-up sift-down; *not* O(n log n) |
| **heap sort** | O(n log n) | Build heap O(n) + n × extract O(log n) |
  
### Sift-Up and Sift-Down (the two fundamental moves)

- **Sift-up** (a.k.a. bubble-up): after inserting at the end, repeatedly swap the node with its parent until the heap property is restored.
- **Sift-down** (a.k.a. bubble-down / heapify-down): after removing the root, place the last element at the root and repeatedly swap it with its smaller (min-heap) or larger (max-heap) child until the heap property is restored.
  
### Why Build-Heap is O(n), not O(n log n)

A common interview follow-up. The intuition: most nodes are near the bottom of the tree where sift-down does very little work. Summing the work across all levels gives a geometric series that converges to O(n).

---

## 2. Python Implementation from Scratch (Min-Heap)

```python
class MinHeap:
    """A min-heap implemented with a plain Python list."""

    def __init__(self):
        self._data = []

    def __len__(self):
        return len(self._data)

    def __bool__(self):
        return len(self._data) > 0

    def peek(self):
        if not self._data:
            raise IndexError("peek on empty heap")
        return self._data[0]

    def push(self, val):
        self._data.append(val)
        self._sift_up(len(self._data) - 1)

    def pop(self):
        if not self._data:
            raise IndexError("pop from empty heap")
        self._swap(0, len(self._data) - 1)
        val = self._data.pop()
        if self._data:
            self._sift_down(0)
        return val

    # --- internal helpers ---

    def _swap(self, i, j):
        self._data[i], self._data[j] = self._data[j], self._data[i]

    def _sift_up(self, idx):
        while idx > 0:
            parent = (idx - 1) // 2
            if self._data[idx] < self._data[parent]:
                self._swap(idx, parent)
                idx = parent
            else:
                break

    def _sift_down(self, idx):
        n = len(self._data)
        while True:
            smallest = idx
            left = 2 * idx + 1
            right = 2 * idx + 2

            if left < n and self._data[left] < self._data[smallest]:
                smallest = left
            if right < n and self._data[right] < self._data[smallest]:
                smallest = right

            if smallest == idx:
                break
            self._swap(idx, smallest)
            idx = smallest

    @classmethod
    def heapify(cls, lst):
        """Build a heap in-place in O(n)."""
        heap = cls()
        heap._data = lst
        # start from last non-leaf and sift down
        for i in range(len(lst) // 2 - 1, -1, -1):
            heap._sift_down(i)
        return heap


# ---------- quick demo ----------
if __name__ == "__main__":
    h = MinHeap()
    for v in [5, 3, 8, 1, 2, 7]:
        h.push(v)

    sorted_out = []
    while h:
        sorted_out.append(h.pop())
    print("Heap-sorted:", sorted_out)
    # Output: Heap-sorted: [1, 2, 3, 5, 7, 8]
```
  
---

## 3. Common `heapq` Patterns

Python's `heapq` module provides a **min-heap** on top of a regular list. There is no built-in max-heap — the standard trick is to negate values.

### 3.1 Basic push / pop

```python
import heapq

nums = [5, 3, 8, 1, 2, 7]
heapq.heapify(nums)          # in-place O(n)

heapq.heappush(nums, 0)      # push
smallest = heapq.heappop(nums)  # pop smallest → 0
```

### 3.2 Max-Heap via negation

```python
import heapq

vals = [5, 3, 8, 1, 2, 7]
max_heap = [-v for v in vals]
heapq.heapify(max_heap)

largest = -heapq.heappop(max_heap)   # 8
heapq.heappush(max_heap, -10)        # push 10
```

### 3.3 Top-K smallest / largest

```python
import heapq

data = [15, 3, 22, 8, 1, 99, 7, 42]

heapq.nsmallest(3, data)   # [1, 3, 7]
heapq.nlargest(3, data)    # [99, 42, 22]
```

Under the hood `nsmallest`/`nlargest` use a heap of size k, so they run in O(n log k) — better than a full sort when k is small.

### 3.4 Push-then-pop in one step

```python
import heapq

h = [1, 3, 5]
heapq.heapify(h)

# heappushpop: push val, then pop smallest (faster than separate push+pop)
result = heapq.heappushpop(h, 2)   # pushes 2, pops 1 → result = 1

# heapreplace: pop smallest first, then push val
result = heapq.heapreplace(h, 0)   # pops 2, pushes 0 → result = 2
```

### 3.5 Heap with custom priority (tuples)

`heapq` compares elements directly, so use **(priority, item)** tuples. Add a tiebreaker counter to avoid comparing non-comparable items.

```python
import heapq

tasks = []
counter = 0  # tiebreaker for equal priorities

for priority, name in [(2, "email"), (1, "urgent-bug"), (3, "lunch"), (1, "deploy")]:
    heapq.heappush(tasks, (priority, counter, name))
    counter += 1

while tasks:
    pri, _, name = heapq.heappop(tasks)
    print(f"  priority={pri}  task={name}")

# Output:
#   priority=1  task=urgent-bug
#   priority=1  task=deploy
#   priority=2  task=email
#   priority=3  task=lunch
```

### 3.6 Merge k sorted iterables

```python
import heapq

a = [1, 4, 7]
b = [2, 5, 8]
c = [3, 6, 9]

merged = list(heapq.merge(a, b, c))
# [1, 2, 3, 4, 5, 6, 7, 8, 9]
```
  
---

## 4. LeetCode Problems

### Problem 1 — Kth Largest Element in an Array (LC 215)

**Problem:** Given an unsorted integer array `nums` and an integer `k`, return the k-th largest element. (Not the k-th distinct element.)

**Example:** `nums = [3,2,1,5,6,4], k = 2` → answer is **5**.

**Why a heap?** Maintain a min-heap of size k. After scanning all elements, the heap's root is the k-th largest. Time: O(n log k). This is the classic "top-k" pattern.

```python
import heapq

def findKthLargest(nums: list[int], k: int) -> int:
    """
    Keep a min-heap of size k.
    After processing all numbers, the root is the k-th largest.
    Time:  O(n log k)
    Space: O(k)
    """
    min_heap = []

    for num in nums:
        heapq.heappush(min_heap, num)
        if len(min_heap) > k:
            heapq.heappop(min_heap)   # drop the smallest

    return min_heap[0]


# --- tests ---
assert findKthLargest([3, 2, 1, 5, 6, 4], 2) == 5
assert findKthLargest([3, 2, 3, 1, 2, 4, 5, 5, 6], 4) == 4
print("LC 215 — all tests passed")
```

**Alternative one-liner** (good to know for interviews):

```python
def findKthLargest_alt(nums, k):
    return heapq.nlargest(k, nums)[-1]
```

---

### Problem 2 — Last Stone Weight (LC 1046)

**Problem:** You have a collection of stones, each with a positive integer weight. On each turn, pick the two **heaviest** stones and smash them together:

- If they weigh the same, both are destroyed.
- Otherwise the lighter one is destroyed and the heavier one loses weight equal to the lighter.

Return the weight of the last remaining stone (or 0 if none remain).

**Example:** `stones = [2,7,4,1,8,1]` → answer is **1**.

**Why a heap?** You need repeated access to the maximum element — a max-heap gives you that in O(log n) per operation. Since Python only has a min-heap, negate the values.

```python
import heapq

def lastStoneWeight(stones: list[int]) -> int:
    """
    Simulate the process with a max-heap (via negation).
    Time:  O(n log n)
    Space: O(n)
    """
    # negate to simulate max-heap
    max_heap = [-s for s in stones]
    heapq.heapify(max_heap)

    while len(max_heap) > 1:
        first = -heapq.heappop(max_heap)    # heaviest
        second = -heapq.heappop(max_heap)   # second heaviest

        if first != second:
            heapq.heappush(max_heap, -(first - second))

    return -max_heap[0] if max_heap else 0


# --- tests ---
assert lastStoneWeight([2, 7, 4, 1, 8, 1]) == 1
assert lastStoneWeight([1]) == 1
assert lastStoneWeight([3, 3]) == 0
print("LC 1046 — all tests passed")
```

---

## Quick Reference Cheat Sheet

```
heapq.heapify(lst)              # list → min-heap in-place, O(n)
heapq.heappush(heap, val)       # insert, O(log n)
heapq.heappop(heap)             # remove & return smallest, O(log n)
heapq.heappushpop(heap, val)    # push then pop (fast combo)
heapq.heapreplace(heap, val)    # pop then push (fast combo)
heapq.nsmallest(k, iterable)    # k smallest items
heapq.nlargest(k, iterable)     # k largest items
heapq.merge(*sorted_iterables)  # merge sorted streams
```

**Max-heap trick:** negate values on push and negate again on pop.

**Custom sort:** use `(priority, tiebreaker, item)` tuples.
