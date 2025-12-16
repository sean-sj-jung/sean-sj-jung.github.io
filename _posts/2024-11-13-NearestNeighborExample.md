---
layout: post
title: "Nearest Neighbor Example question"
date: 2024-11-13
excerpt: "Example question of nearest neighbor"
---


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


Constraint:  No package (such as sklearn) to directly calculate the similarity.  

Sample response:  
```python
import numpy as np
import pandas as pd

def fit_customer_similarity(customers_df, cat_cols, num_cols, w_cat=1.0, w_num=1.0):
    """
    Fits a simple similarity model:
      - one-hot for categorical columns
      - z-score for numeric columns (stats learned from customers_df)
      - block-weighting for cat vs num
      - cosine similarity (implemented via normalized vectors)
    Returns a scorer function for query rows.
    """
    df = customers_df.copy()

    # ----- 1) One-hot on customers (defines the feature space) -----
    X_cat = pd.get_dummies(df[cat_cols], prefix=cat_cols, dtype=float)

    # ----- 2) Z-score numeric on customers -----
    X_num = df[num_cols].astype(float)
    mu = X_num.mean(axis=0)
    sigma = X_num.std(axis=0, ddof=0).replace(0, 1.0)  # avoid division by zero
    X_num = (X_num - mu) / sigma

    # ----- 3) Combine features -----
    X = pd.concat([X_cat, X_num], axis=1)

    # ----- 4) Block weighting (keeps “cat vs num” from being dominated by dimensionality) -----
    cat_feature_cols = list(X_cat.columns)
    num_feature_cols = list(X_num.columns)

    if len(cat_feature_cols) > 0:
        X[cat_feature_cols] *= np.sqrt(w_cat / len(cat_feature_cols))
    if len(num_feature_cols) > 0:
        X[num_feature_cols] *= np.sqrt(w_num / len(num_feature_cols))

    # ----- 5) Pre-normalize customer vectors for cosine similarity -----
    A = X.to_numpy()
    A_norm = A / (np.linalg.norm(A, axis=1, keepdims=True) + 1e-12)

    customer_ids = df["customer_id"].to_numpy()
    feature_columns = X.columns

    def score_queries(query_df, top_k=5, exclude_self=True):
        qdf = query_df.copy()

        # Build query features in the *same* feature space
        Q_cat = pd.get_dummies(qdf[cat_cols], prefix=cat_cols, dtype=float)
        Q_num = qdf[num_cols].astype(float)
        Q_num = (Q_num - mu) / sigma

        Q = pd.concat([Q_cat, Q_num], axis=1).reindex(columns=feature_columns, fill_value=0.0)

        # Apply the same weights
        if len(cat_feature_cols) > 0:
            Q[cat_feature_cols] *= np.sqrt(w_cat / len(cat_feature_cols))
        if len(num_feature_cols) > 0:
            Q[num_feature_cols] *= np.sqrt(w_num / len(num_feature_cols))

        B = Q.to_numpy()
        B_norm = B / (np.linalg.norm(B, axis=1, keepdims=True) + 1e-12)

        # Cosine similarity: (A_norm dot B_norm)
        sims = A_norm @ B_norm.T  # shape: (n_customers, n_queries)

        results = []
        for j in range(sims.shape[1]):
            s = sims[:, j].copy()

            if exclude_self and "customer_id" in qdf.columns:
                qid = qdf.iloc[j]["customer_id"]
                s = np.where(customer_ids == qid, -np.inf, s)

            top_idx = np.argsort(-s)[:top_k]
            out = customers_df.iloc[top_idx].copy()
            out["similarity"] = s[top_idx]
            out["query_customer_id"] = qdf.iloc[j]["customer_id"] if "customer_id" in qdf.columns else None
            results.append(out)

        return pd.concat(results, ignore_index=True)

    return score_queries


# ---- Example usage on your data ----
scorer = fit_customer_similarity(
    customers_df,
    cat_cols=["industry", "pricing_tier"],
    num_cols=["avg_monthly_spend", "tenure"],
    w_cat=1.0,
    w_num=1.0
)

top_matches = scorer(query_customers_df, top_k=3, exclude_self=True)
print(top_matches[["query_customer_id", "customer_id", "industry", "pricing_tier", "avg_monthly_spend", "tenure", "similarity"]])
```
