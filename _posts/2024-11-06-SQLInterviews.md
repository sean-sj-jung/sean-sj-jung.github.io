---
layout: post
title: "Interview preparation for SQL"
date: 2024-11-06
excerpt: "Common SQL patterns"
---


---
### Short Notes

#### When doing division, use:

```sql
NULLIF(denominator, 0)
```
to ensure the denominator is non-zero  
  

#### RANK vs DENSE_RANK

RANK = 1, 1, 3  
DENSE_RANK = 1, 1, 2  
  
  
#### CASE WHEN ELSE END

```sql
CASE WHEN x THEN y ELSE 0 END
```
don’t forget END 
  
  
#### CAST Intentionally to avoid integer truncation

CTR is less than 0 so ```1 ELSE 0``` will mostly return 0 (except for when CTR=1)  
  
```sql
SELECT
  app_id,
  ROUND(
    SUM(CASE WHEN event_type = 'click' THEN 1.0 ELSE 0.0 END) /
    NULLIF(SUM(CASE WHEN event_type = 'impression' THEN 1.0 ELSE 0.0 END), 0)
  , 2)  AS ctr_rate
FROM events
GROUP BY app_id;
```



---

### Anti-join pattern : JOIN, NOT EXISTS vs NOT IN  

Example: Find all products that were never sold  
Tables : products, transactions  
  
Method #1: NOT EXISTS, idiomatic, NULL-safe, widely recommended  
```sql
SELECT item_id
FROM products p
WHERE NOT EXISTS (
	SELECT 1 -- SELECT is ignored for NOT EXISTS
	FROM transactions t
	WHERE p.item_id = t.item_id
)
```

Method #2: LEFT JOIN, same anti-join logic; often identical plan to NOT EXISTS  
```sql
SELECT p.item_id
FROM products p
LEFT JOIN transactions t
	ON p.item_id = t.item_id
WHERE t.item_id IS NULL
```

vs Method #3: NOT IN, OK only if you are sure the subquery column can’t be NULL; otherwise dangerous  
```sql
SELECT item_id
FROM products
WHERE item_id NOT IN (SELECT item_id FROM transactions WHERE item_id IS NOT NULL)
```
  
A catch is that NOT IN is dangerous when the subquery column can be NULL.  
If the subquery returns even one NULL, the NOT IN condition evaluates to UNKNOWN for all rows, and you get no results.  
That’s why the first two methods (NOT EXISTS and LEFT JOIN ... IS NULL) are generally preferred; they’re not affected by NULLs in the same way.  

---
  
### ROWS BETWEEN - for moving average  
  
```sql
SELECT *
FROM (
  SELECT
    user_id,
    tweet_date,
    tweet_count,
	-- This part count the number of items in each window and will be used to remove the first n-1
    COUNT(*) OVER (
      PARTITION BY user_id
      ORDER BY tweet_date
      ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
    ) AS row_num,
	-- This part computes the moving average
    AVG(tweet_count) OVER (
      PARTITION BY user_id
      ORDER BY tweet_date
      ROWS BETWEEN 2 PRECEDING AND CURRENT ROW
    ) AS rolling_avg
  FROM tweets
) t
WHERE row_num >= 3
ORDER BY user_id, tweet_date;
```

Other moving windows:  

3-row centered window (prev, current, next):  
```sql
ROWS BETWEEN 1 PRECEDING AND 1 FOLLOWING 
```
  
Up to current row:  
```sql
ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW 
```

---

### RANK, DENSE_RANK

Say you have scores:

id	score
A	100
B	100
C	90
D	80
E	80

And you do:


```sql
RANK()       OVER (ORDER BY score DESC)
DENSE_RANK() OVER (ORDER BY score DESC)
ROW_NUMBER() OVER (ORDER BY score DESC)
```

You’ll get:

id	score	RANK	DENSE_RANK	ROW_NUMBER
A	100	1	1	1
B	100	1	1	2
C	90	3	2	3
D	80	4	3	4
E	80	4	3	5

  
1. RANK() – “competition rank” (with gaps)

	•	Ties get the same rank.
	•	The next distinct value skips ranks by the number of ties.
	•	You care about real “position” in ordering (“how many people are ahead of me?”).  
  
2. DENSE_RANK() – “compact rank” (no gaps)

	•	Ties get the same rank.
	•	The next distinct value gets next integer (no skipping).
	•	Use to count distinct ordered values:
	•	No gaps in the ranking numbers.

3. Other related ones (nice to name-drop)  
  
	•	NTILE(n) – splits ordered rows into n buckets (approx equal size): quartiles, deciles, etc.
	•	PERCENT_RANK() – gives ranking as fraction between 0 and 1 based on position.
	•	CUME_DIST() – cumulative distribution: “what fraction of rows have score ≤ this one?”

---

### Interesting example  
1. Below is an example of using division (e.g. getting a proportion of an activity)  
2. Without CTE, total_ts is computed multiple times so using CTE is beneficial  
3. Always multiply by 100.0 to force floating-point arithmetic. 100 or integer may result in integer truncation (e.g. 0.25% = 0)  


```sql
WITH t1_aggregated AS (
    SELECT
        b.age_bucket
        , SUM(CASE WHEN a.activity_type = 'send' THEN a.time_spent ELSE 0 END) AS ts_send
        , SUM(CASE WHEN a.activity_type = 'open' THEN a.time_spent ELSE 0 END) AS ts_open
        , SUM(
            CASE 
                WHEN a.activity_type IN ('send', 'open') THEN a.time_spent 
                ELSE 0 
            END
          ) AS total_ts 
          
    FROM activities a 
    LEFT JOIN age_breakdown b 
        ON a.user_id = b.user_id
    GROUP BY b.age_bucket
)

SELECT 
    age_bucket
    , ROUND(ts_send / NULLIF(total_ts, 0) * 100.0, 2) AS send_perc
    , ROUND(ts_open / NULLIF(total_ts, 0) * 100.0, 2) AS open_perc
FROM t1_aggregated;
```

—--

NULL + something = NULL so use COALESCE

---

Whenever you're appending stuffs, think of Union operation.  
UNION : Deduplicate (DISTINCT) included - which implies additional processing, often sorting, and can impact performance.  
UNION ALL : Returns all rows including duplicates, but generally offers better performance.  

Example : combining row-level log table and already aggregated historical table
```sql
SELECT
  user_id,
  song_id,
  sum(song_plays) AS song_plays
FROM (
SELECT 
  user_id,
  song_id,
  count(*) AS song_plays
FROM songs_weekly -- individual play logs
GROUP BY user_id, song_id

UNION ALL

SELECT
  user_id,
  song_id,
  song_plays
FROM songs_history -- aggregated counts
) AS t1

GROUP BY user_id, song_id
ORDER BY song_plays DESC
```

---

Using LAG:  

Example: yoy growth rate from transaction table

```sql
WITH annual_rev AS (
    SELECT
        EXTRACT(YEAR from transaction_date) AS year,
        product_id,
        SUM(SPEND) AS curr_year_spend,
        LAG(SUM(SPEND), 1) -- LAG (column, offset value)
            OVER (
                PARTITION BY product_id 
                ORDER BY EXTRACT(YEAR FROM transaction_date) -- This has to be in the GROUP BY clause
            ) AS prev_year_spend
    FROM 
        user_transactions
    GROUP BY 
        EXTRACT(YEAR from transaction_date), 
        product_id
)
SELECT
    year,
    product_id,
    curr_year_spend,
    prev_year_spend,
    ROUND(
        (curr_year_spend - prev_year_spend) / prev_year_spend * 100.0, 
        2
    ) AS yoy_rate
FROM 
    annual_rev
ORDER BY 
    product_id, 
    year;
```

---

Odd, Even numbered items

```sql
WITH temp_table AS (
SELECT 
  ROW_NUMBER() OVER (
    PARTITION BY CAST(measurement_time AS DATE)  
    ORDER BY measurement_time ASC) AS rn
  , CAST(measurement_time AS date) AS measurement_day
  , measurement_value
FROM measurements
)

SELECT
  measurement_day
  , sum(CASE WHEN mod(rn, 2) = 1 THEN measurement_value ELSE 0 END) AS odd_sum
  , sum(CASE WHEN mod(rn, 2) = 0 THEN measurement_value ELSE 0 END) AS even_sum
FROM temp_table
GROUP BY measurement_day
```

---

GROUP BY and MIN, MAX, extracting year and day

```sql
SELECT
  user_id,
  EXTRACT(DAY FROM MAX(post_date) - MIN(post_date)) AS days_between
FROM posts
WHERE EXTRACT(YEAR FROM post_date) = 2021
GROUP BY user_id
HAVING COUNT(*) > 1
ORDER BY user_id DESC;
```


---

Self-Join problem:

Given user_id and login_date, find reactivated users (those who skipped a month e.g. Jan then March)  

```sql
WITH temp_table AS (
SELECT DISTINCT 
  user_id
  , EXTRACT(MONTH FROM login_date) AS login_month
  , EXTRACT(MONTH FROM login_date)-1 AS prev_month
FROM user_logins
)

SELECT 
  -- Counting how many users were reactivated in a given month 
  login_month AS mth, count(DISTINCT user_id) AS reativated_users 
FROM (
  SELECT
    t1.user_id
    , t1.login_month AS login_month
    -- , t2.login_month AS prev_month
  FROM temp_table t1 -- using t1 as the primary, see if there is a record of logging-in a month before
  LEFT JOIN temp_table t2 -- another base table 
    ON t1.user_id = t2.user_id
    AND t1.prev_month = t2.login_month -- A month before of t1 vs base table 
  ORDER BY user_id, login_month
) AS ttt
WHERE prev_month IS NULL
GROUP BY login_month
ORDER BY login_month
```


---

Failed to find efficient soln: 

TABLE server_utilization:
server_id	  status_time	          session_status
1	          08/02/2022 10:00:00	  start
1	          08/04/2022 10:00:00	  stop
2	          08/17/2022 10:00:00	  start
2	          08/24/2022 10:00:00	  stop

Find the total uptime:

My solution - Two WINDOW functions and JOIN 

```sql
WITH start_table AS (
SELECT
  server_id
  , status_time
  , ROW_NUMBER() OVER (PARTITION BY server_id ORDER BY status_time) AS rn1
FROM server_utilization
WHERE session_status = 'start'
)
,

stop_table AS (
SELECT
  server_id
  , status_time
  , ROW_NUMBER() OVER (PARTITION BY server_id ORDER BY status_time) AS rn2
FROM server_utilization
WHERE session_status = 'stop'
)

SELECT
    ROUND(
    SUM(
      EXTRACT(EPOCH FROM (b.status_time - a.status_time))
    ) / 86400.0
  ) AS total_up_time_days
FROM start_table a
INNER JOIN stop_table b
  ON a.server_id = b.server_id
  AND a.rn1 = b.rn2
```
  
Improved soln: Add a few lagged columns using window function. Single pass, No join, One window  
  
```sql
WITH ordered AS (
  SELECT
    server_id,
    status_time,
    session_status,
    LAG(status_time)      OVER (PARTITION BY server_id ORDER BY status_time) AS prev_time,
    LAG(session_status)   OVER (PARTITION BY server_id ORDER BY status_time) AS prev_status
  FROM server_utilization
)
SELECT
  ROUND(
    SUM(
      CASE
        WHEN session_status = 'stop' AND prev_status = 'start'
          THEN EXTRACT(EPOCH FROM (status_time - prev_time))
        ELSE 0
      END
    ) / 86400.0
  ) AS total_up_time_days
FROM ordered;
```

