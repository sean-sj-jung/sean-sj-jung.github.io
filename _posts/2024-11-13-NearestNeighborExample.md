---
layout: post
title: "Nearest Neighbor Example question"
date: 2024-11-13
excerpt: "Example question of nearest neighbor"
---

  
Mixed input dataset.  
Constraint:  No package (such as sklearn) to directly calculate the similarity.   
  

```python
import pandas as pd
import numpy as np

customers_rows = [
    ['cust_1', 'Tech', 'A', 12000.0, 24],
    ['cust_2', 'Retail', 'B', 5000.0, 18],
    ['cust_3', 'Tech', 'A', 15000.0, 36],
    ['cust_4', 'Finance', 'C', 8000.0, 12],
    ['cust_5', 'Retail', 'B', 4500.0, 20],
    ['cust_6', 'Tech', 'A', 11000.0, 30],
    ['cust_7', 'Finance', 'C', 7500.0, 10],
    ['cust_8', 'Tech', 'A', 13000.0, 28],
    ['cust_9', 'Retail', 'B', 6000.0, 15],
    ['cust_10', 'Finance', 'C', 9000.0, 22],
    ['cust_11', 'Tech', 'A', 12500.0, 25],
    ['cust_12', 'Retail', 'B', 5500.0, 19]
]

customers_df = pd.DataFrame(customers_rows, 
               columns=['customer_id', 'industry', 'pricing_tier', 'avg_monthly_spend', 'tenure']
               )

query_customers_df = pd.DataFrame([['cust_12', 'Retail', 'B', 5500, 19]],
               columns=['customer_id', 'industry', 'pricing_tier', 'avg_monthly_spend', 'tenure']
               )
```
  

Sample response using Gower distance:  
  
```python

def gower_distance(row, query_row, feature_cols, cat_cols, num_ranges):
    """Compute Gower distance between one row and the query row."""
    distances = []
    for col in feature_cols:
        if col in cat_cols:
            # Categorical: 0 if match, 1 if mismatch
            distances.append(0.0 if row[col] == query_row[col] else 1.0)
        else:
            # Numerical: absolute diff normalized by range
            r = num_ranges[col]
            distances.append(abs(row[col] - query_row[col]) / r if r > 0 else 0.0)
    return np.mean(distances)


def find_nearest_customers(customers_df, query_df, top_k=3):
    feature_cols = ['industry', 'pricing_tier', 'avg_monthly_spend', 'tenure']
    cat_cols = {'industry', 'pricing_tier'}
    num_cols = [c for c in feature_cols if c not in cat_cols]

    # Precompute ranges for numerical columns across ALL data
    num_ranges = {col: customers_df[col].max() - customers_df[col].min() for col in num_cols}

    query_row = query_df.iloc[0]

    # Compute distance from query to every customer
    customers_df = customers_df.copy()
    customers_df['gower_dist'] = customers_df.apply(
        lambda row: gower_distance(row, query_row, feature_cols, cat_cols, num_ranges),
        axis=1
    )

    # Exclude the query customer itself, sort, return top_k
    results = (customers_df[customers_df['customer_id'] != query_row['customer_id']]
               .sort_values('gower_dist')
               .head(top_k))

    return results


results = find_nearest_customers(customers_df, query_customers_df, top_k=5)
print(results[['customer_id', 'industry', 'pricing_tier', 'avg_monthly_spend', 'tenure', 'gower_dist']])
```
