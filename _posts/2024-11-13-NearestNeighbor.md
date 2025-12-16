---
layout: post
title: "kNN, Nearest Neighbor"
date: 2024-11-13
excerpt: "Implement nearest neighbor"
---


```python
from dataclasses import dataclass
from typing import Any

def _validate_inputs(X: list[list[float]], y: list[Any], k: int) -> None:
    if k <= 0:
        raise ValueError("k must be >= 1")
    if not X:
        raise ValueError("X is empty")
    if len(X) != len(y):
        raise ValueError("X and y must have the same length")
    d = len(X[0])
    if d == 0:
        raise ValueError("X must have at least 1 feature")
    for i, row in enumerate(X):
        if len(row) != d:
            raise ValueError(f"Inconsistent feature dimensions at row {i}")
        for v in row:
            fv = float(v)
            if fv != fv or fv in (float("inf"), float("-inf")):  # NaN or +/-inf
                raise ValueError(f"X contains non-finite value at row {i}")
    if k > len(X):
        raise ValueError("k cannot exceed number of training samples")


def _l2_sq(a: list[float], b: list[float]) -> float:
    s = 0.0
    for ai, bi in zip(a, b):
        diff = ai - bi
        s += diff * diff
    return s


def _most_common(labels: list[Any]) -> Any:
    # deterministic tie-break: highest count, then smallest repr()
    counts: dict[Any, int] = {}
    for lab in labels:
        counts[lab] = counts.get(lab, 0) + 1

    best_lab: Any = None
    best_cnt = -1
    best_key: str | None = None
    for lab, cnt in counts.items():
        key = repr(lab)
        if cnt > best_cnt or (cnt == best_cnt and (best_key is None or key < best_key)):
            best_lab, best_cnt, best_key = lab, cnt, key
    return best_lab


@dataclass
class KNN:
    k: int = 3
    task: str = "classification"   # "classification" | "regression"
    weights: str = "uniform"       # "uniform" | "distance"
    eps: float = 1e-12

    def fit(self, X: list[list[float]], y: list[Any]) -> KNN:
        _validate_inputs(X, y, self.k)
        t = self.task.lower()
        if t not in ("classification", "regression"):
            raise ValueError("task must be 'classification' or 'regression'")
        w = self.weights.lower()
        if w not in ("uniform", "distance"):
            raise ValueError("weights must be 'uniform' or 'distance'")

        self.task = t
        self.weights = w
        self._X = [[float(v) for v in row] for row in X]
        self._y = list(y)
        self._d = len(self._X[0])
        return self

    def _neighbors(self, x: list[float]) -> list[tuple[float, Any]]:
        if len(x) != self._d:
            raise ValueError(f"Expected input dimension {self._d}, got {len(x)}")

        dists: list[tuple[float, Any]] = []
        for xi, yi in zip(self._X, self._y):
            d_sq = _l2_sq(xi, x)
            dists.append((d_sq, yi))
        dists.sort(key=lambda t: t[0])
        return dists[: self.k]

    def predict_one(self, x: list[float]) -> Any:
        neigh = self._neighbors(x)

        if self.task == "classification":
            if self.weights == "uniform":
                return _most_common([lab for _, lab in neigh])

            votes: dict[Any, float] = {}
            for d_sq, lab in neigh:
                w = 1.0 / (d_sq + self.eps)
                votes[lab] = votes.get(lab, 0.0) + w

            best_lab: Any = None
            best_score = float("-inf")
            best_key: str | None = None
            for lab, score in votes.items():
                key = repr(lab)
                if score > best_score or (score == best_score and (best_key is None or key < best_key)):
                    best_lab, best_score, best_key = lab, score, key
            return best_lab

        # regression
        if self.weights == "uniform":
            return sum(float(v) for _, v in neigh) / self.k

        num = 0.0
        den = 0.0
        for d_sq, v in neigh:
            w = 1.0 / (d_sq + self.eps)
            num += w * float(v)
            den += w
        return num / den if den > 0.0 else float(neigh[0][1])

    def predict(self, X: list[list[float]]) -> list[Any]:
        return [self.predict_one(x) for x in X]

    def kneighbors(self, x: list[float]) -> list[tuple[float, Any]]:
        neigh = self._neighbors(x)
        return [(d_sq ** 0.5, lab) for d_sq, lab in neigh]


if __name__ == "__main__":
    # classification demo
    Xc = [[1.0, 1.0], [1.2, 0.9], [3.0, 3.0], [3.2, 2.9]]
    yc = ["A", "A", "B", "B"]
    clf = KNN(k=3, task="classification", weights="uniform").fit(Xc, yc)
    print(clf.predict_one([1.1, 1.0]))  # A

    # regression demo
    Xr = [[0.0], [1.0], [2.0], [3.0]]
    yr = [0.0, 1.0, 1.9, 3.1]
    reg = KNN(k=2, task="regression", weights="distance").fit(Xr, yr)
    print(reg.predict_one([1.5]))

```


### Note

- brute-force search is O(nd) per query; sorting is O(n\log n); can reduce to O(n) selection via partial selection/heap  
- use squared distance for ranking; only need sqrt if you return actual distances  
- scaling features matters (standardization) for Euclidean distance  