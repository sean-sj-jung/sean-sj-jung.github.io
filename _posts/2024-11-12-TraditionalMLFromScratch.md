---
layout: post
title: "Implementation of Some Traditional ML Methods"
date: 2024-11-12
excerpt: "Kmeans and so on"
---

### Kmeans
```python
import random

def euclidean_distance(point1, point2):
    return sum([(x - y) ** 2 for x, y in zip(point1, point2)]) ** 0.5

def initialize_centroids(data, k):
    return random.sample(data, k)

def assign_clusters(data, centroids):
    clusters = [[] for _ in range(len(centroids))]
    cluster_assignments = []

    for point in data:
        distances = [euclidean_distance(point, centroid) for centroid in centroids]
        nearest_centroid_index = distances.index(min(distances))
        clusters[nearest_centroid_index].append(point)
        cluster_assignments.append(nearest_centroid_index)

    return clusters, cluster_assignments

def calculate_new_centroids(clusters):
    new_centroids = []
    for cluster in clusters:
        if cluster:
            new_centroid = [
                sum(point[i] for point in cluster) / len(cluster)
                for i in range(len(cluster[0]))
            ]
            new_centroids.append(new_centroid)
        else:
            new_centroids.append(None)
    return new_centroids

def kmeans(data, k, max_iterations=100):
    centroids = initialize_centroids(data, k)
    cluster_assignments = None  # Initialize to None explicitly

    for _ in range(max_iterations):
        clusters, new_cluster_assignments = assign_clusters(data, centroids)
        new_centroids = calculate_new_centroids(clusters)

        # Handle empty clusters by reusing old centroids
        for i in range(len(new_centroids)):
            if new_centroids[i] is None:
                new_centroids[i] = centroids[i]

        # Check if assignments didn't change
        if new_cluster_assignments == cluster_assignments:
            break

        centroids = new_centroids
        cluster_assignments = new_cluster_assignments

    return centroids, cluster_assignments

# Example usage:
data = [[1, 2], [1.5, 1.8], [5, 8], [8, 8], [1, 0.6], [9, 11]]
k = 2

centroids, cluster_assignments = kmeans(data, k)

print("Centroids:", centroids)
print("Cluster Assignments:", cluster_assignments)

# Example usage with 3 clusters
data2 = [[1, 2], [1.5, 1.8], [5, 8], [8, 8], [1, 0.6], [9, 11], [2, 1], [9, 10], [0, 0]]
k2 = 3

centroids2, cluster_assignments2 = kmeans(data2, k2)

print("Centroids:", centroids2)
print("Cluster Assignments:", cluster_assignments2)

```
