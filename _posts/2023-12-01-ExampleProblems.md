---
layout: post
title: "Example problems, various topics"
date: 2023-12-01
excerpt: "Examples"
---


---

### kNN related. Find the most similar one  
  
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


---

### Max of two random variables

Given $$ Z = \max(X,Y) $$ of independent random variables.

Then, the CDF of $$ Z $$ is:

$$
\begin{align}
F_Z(z) &= P(\max(X,Y) \leq z) \\
&= P(X \leq z,\, Y \leq z) \\
&= P(X \leq z) \cdot P(Y \leq z) \\
&= F_X(z) \cdot F_Y(z)
\end{align}
$$

Then,

$$
\frac{d}{dz} F_Z(z) = f_X(z)\cdot F_Y(z) + F_X(z)\cdot f_Y(z)
$$

If $$ X,Y \sim U(a,b) $$, then:

$$
\begin{align}
f_Z(z) &= \frac{1}{b-a}\cdot\frac{z-a}{b-a} + \frac{z-a}{b-a}\cdot\frac{1}{b-a} \\
&= 2\left(\frac{z-a}{b-a}\right)
\end{align}
$$

---

### Netflix Lazy Rater Problem  

Suppose 80% of Netflix users rate movies thumbs up 60% of the time, and thumbs down 40% of the time.  
However, 20% of Netflix users are lazy: they rate 100% of the movies they watch as thumbs up!  
Given that someone gives 3 movies in a row a thumbs up, what's the probability they are a "lazy" rater?  


| Symbol | Meaning |
|--------|---------|
| `L` | User is a **lazy** rater |
| `N` | User is a **normal** rater |
| `T` | User gives **3 thumbs up in a row** |

$$P(L) = 0.20 \quad \text{(20% of users are lazy)}$$
$$P(N) = 0.80 \quad \text{(80% of users are normal)}$$
  
T: 3 thumbs up in a row, given each user type  
  
Lazy user:
$$P(T \mid L) = 1.0 \times 1.0 \times 1.0 = 1.000$$

Normal user:
$$P(T \mid N) = 0.6 \times 0.6 \times 0.6 = 0.216$$
  
$$P(T) = P(T \mid L) \cdot P(L) + P(T \mid N) \cdot P(N)$$
$$P(T) = (1.0)(0.20) + (0.216)(0.80)$$
$$P(T) = 0.200 + 0.1728 = 0.3728$$

Then,  
$$\boxed{P(L \mid T) = \frac{P(T \mid L) \cdot P(L)}{P(T)} = \frac{1.0 \times 0.20}{0.3728} \approx 0.5364}$$
