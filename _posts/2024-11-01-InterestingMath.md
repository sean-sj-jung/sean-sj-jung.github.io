---
layout: post
title: "Interesting Math Problems"
date: 2024-11-01
excerpt: "D20, Monty Hall and so on"
---


---

## Optimal Stopping for 20-sided Dice

### Problem
- You have n chances to roll a 20-sided die (values 1 to 20, uniformly random).
- After each roll, you can **either stop** and take the rolled value as your payoff in dollars, or continue (if you haven't reached the nth roll).
- On the last roll, you **must accept** the result.
- Question: What is the optimal strategy to maximize your expected payoff?

### Intuition

Using dynamic programming, work backwards from the final roll and determine the expected value threshold at each step.

- Let $$ V_k $$ be the expected value of optimal play when you have k rolls remaining (so you are on roll $$ n - k + 1 $$).

Compute this recursively, starting from the last roll.

### Dynamic Programming Approach

1. **Base case (k = 1)**:
   - On your last roll, you must accept the result.
   - The expected value is:
     $$
     V_1 = \mathbb{E}[X] = \frac{1 + 2 + \cdots + 20}{20} = \frac{20 \cdot 21}{2 \cdot 20} = 10.5
     $$

2. **General case (k > 1)**:
   - When you roll, you see value $$ x $$.
   - You can either:
     - stop and take $$ x $$, or
     - continue, expecting $$ V_{k-1} $$ on average from future rolls.

   So your expected value is:
   $$
   V_k = \mathbb{E}[\max(x, V_{k-1})]
   $$
   where $$ x \sim \text{Uniform}(1, 20) $$

   More concretely:
   $$
   V_k = \frac{1}{20} \sum_{x=1}^{20} \max(x, V_{k-1})
   $$

   This recurrence lets you compute $$ V_n $$, $$ V_{n-1} $$, … down to $$ V_1 = 10.5 $$.

### Optimal Strategy

At each roll with \( k \) rolls remaining:

- You roll a die and observe value $$ x $$
- If $$ x \geq V_{k-1} $$, you stop.
- If $$ x < V_{k-1} $$, you roll again.

In other words, use thresholding based on future expected value.

### Example for Small n

#### For $$ V_1 = 10.5 $$

#### For $$ V_2 $$:

Compute:
$$
V_2 = \frac{1}{20} \sum_{x=1}^{20} \max(x, 10.5)
$$

Break into two ranges:

- For $$ 1 \ge x \ge 10 $$, $$ \max(x, 10.5) = 10.5 $$
- For $$ 111 \ge x \ge 20 $$,, $$ \max(x, 10.5) = x $$

So:
$$
V_2 = \frac{1}{20} \left(10 \cdot 10.5 + \sum_{x=11}^{20} x \right)
= \frac{1}{20} \left(105 + (11+12+\dots+20)\right)
= \frac{1}{20} \left(105 + \frac{(20+11)\cdot 10}{2} \right)
= \frac{1}{20} \left(105 + 155 \right)
= \frac{260}{20} = 13
$$

So:
- With 2 rolls left, threshold is 13.
- Roll: if result ≥ 13 → stop, else → roll again.

### Python Implementation

```python
def compute_expected_values(n, s):
    '''
    n : number of rolls
    s : number of side in dice
    '''
    V = [0] * n
    V[0] = (s+1)/2

    for k in range(1, n):
        prev = V[k - 1]
        total = 0
        for x in range(1, s+1):
            total += max(x, prev)
        V[k] = total / s
    return V
```

---

## Monty Hall Problem

### Problem:
You are on a game show with 3 doors:  
- Behind 1 door is a car,  
- Behind the other 2 doors are goats.  

You pick a door (say, Door 1).  
Then the host (Monty), who knows what's behind each door, opens another door (say, Door 3) and reveals a goat.  
Monty then gives you a choice:  
**Stick** with your original choice (Door 1), or  
**Switch** to the remaining unopened door (Door 2).

### What's the best strategy?
Intuition says it’s 50/50, but the correct answer is:  
You double your chances of winning by switching.

### Bayes’ Theorem

$$
P(A \mid B) = \frac{P(B \mid A) \cdot P(A)}{P(B)}
$$

Where:
- $$ A $$ is a hypothesis
- $$ B $$ is the evidence
- $$ P(A \mid B) $$ is the posterior probability: how likely is $$ A $$ given $$ B $$

Assume:
- You initially pick Door 1
- Monty opens Door 3 and reveals a goat
- Compute the posterior probability that the car is behind each door, given that Monty opened Door 3

### Define Events:
- $$ C_1 $$: Car is behind Door 1  
- $$ C_2 $$: Car is behind Door 2  
- $$ C_3 $$: Car is behind Door 3  
- $$ M = 3 $$: Monty opens Door 3

### Prior Probabilities  
P(C_1) = P(C_2) = P(C_3) = \frac{1}{3}

### Likelihoods — $$ P(M = 3 \mid C_i) $$
- If car is behind Door 1 (your pick):
  - Monty can open Door 2 or 3 equally likely
  $$
  P(M = 3 \mid C_1) = \frac{1}{2}
  $$

- If car is behind Door 2:
  - Monty **must** open Door 3  
  $$
  P(M = 3 \mid C_2) = 1
  $$

- If car is behind Door 3:
  - Monty cannot open Door 3 (because car is there)
  - Alternatively, Monty already opened it so probability of car being there is Zero
  $$
  P(M = 3 \mid C_3) = 0
  $$

### Total Probability $$ P(M = 3) $$
$$
P(M=3) = \sum_{i=1}^{3} P(M=3 \mid C_i) \cdot P(C_i)
$$
$$
= \left(\frac{1}{2} \cdot \frac{1}{3}\right) + \left(1 \cdot \frac{1}{3}\right) + \left(0 \cdot \frac{1}{3}\right) = \frac{1}{6} + \frac{1}{3} = \frac{1}{2}
$$

### Posterior Probabilities

#### Car behind Door 1:
$$
P(C_1 \mid M=3) = \frac{P(M=3 \mid C_1) \cdot P(C_1)}{P(M=3)} = \frac{\frac{1}{2} \cdot \frac{1}{3}}{\frac{1}{2}} = \frac{1}{3}
$$

#### Car behind Door 2:
$$
P(C_2 \mid M=3) = \frac{P(M=3 \mid C_2) \cdot P(C_2)}{P(M=3)} = \frac{1 \cdot \frac{1}{3}}{\frac{1}{2}} = \frac{2}{3}
$$



---
## The Same Birthday  
Find the smallest integer $$ n $$ such that the probability of at least two people sharing the same birthday is at least 50%.

### Assumptions:
- There are 365 days in a year (no leap years).
- Each person’s birthday is equally likely to be any of the 365 days.
- Birthdays are independent.

### Solution:

Let’s denote:  
- $$ P(n) $$: the probability that all $$ n $$ people have different birthdays.
- So, $$ 1 - P(n) $$: the probability that at least two people share a birthday.

We want:  

$$
1 - P(n) \geq 0.5 \quad \Rightarrow \quad P(n) \leq 0.5
$$

$$
P(n) = \frac{365}{365} \cdot \frac{364}{365} \cdot \frac{363}{365} \cdot \ldots \cdot \frac{365 - n + 1}{365}
= \prod_{k=0}^{n-1} \left(1 - \frac{k}{365} \right)
$$

1. Iteratively compute the probability:  

| $$ n $$ | $$ P(n) $$ (no shared birthday) |
|--------|----------------------------------|
| 1      | 1.000000                         |
| 2      | 0.997260                         |
| 3      | 0.991796                         |
| 4      | 0.983644                         |
| 5      | 0.972864                         |
| 10     | 0.883052                         |
| 15     | 0.747099                         |
| 20     | 0.588560                         |
| 22     | 0.524305                         |
| 23     | 0.492703                         |

2. Logarithmic approximation

log of $$ P(n) $$:  

$$
\ln P(n) = \sum_{k=0}^{n-1} \ln\left(1 - \frac{k}{365} \right)
$$

Approximate the sum using Taylor expansion:

#### Taylor expansion of $$ \ln(1 - x) $$:  

$$
\ln(1 - x) \approx -x - \frac{x^2}{2} - \frac{x^3}{3} - \cdots
$$

For small $$ x $$:  

$$
\ln(1 - x) \approx -x
$$

Therefore:  

$$
\ln\left(1 - \frac{k}{365} \right) \approx -\frac{k}{365}
$$

Hence:  

$$
\ln P(n) \approx -\sum_{k=0}^{n-1} \frac{k}{365} = -\frac{1}{365} \sum_{k=0}^{n-1} k = -\frac{1}{365} \cdot \frac{(n-1)n}{2}
$$


---

## Expected Payoff of Two Dices

Let’s denote the outcomes of the 30‑sided die as \(a\) (with values 1 to 30) and the outcomes of the 20‑sided die as \(b\) (with values 1 to 20). Since the dice are fair and independent, the joint probability for any ordered pair \((a, b)\) is

\[
P(a, b) = \frac{1}{30} \times \frac{1}{20} = \frac{1}{600}.
\]

The rules of the game are:
- If \(a > b\), you win \(a\) dollars.
- If \(a \le b\) (i.e. \(b \ge a\)), you lose \(b\) dollars.

Thus, the payoff \(X(a,b)\) is given by

\[
X(a, b) =
\begin{cases}
a, & \text{if } a > b,\\[1mm]
-b, & \text{if } a \le b.
\end{cases}
\]

The overall expected payoff \(E\) is

\[
E = \sum_{a=1}^{30} \sum_{b=1}^{20} \frac{1}{600}\, X(a, b).
\]

Because the behavior of the payoff function changes when \(a\) passes 20 (since die \(b\) can only roll up to 20), it is useful to break the calculation into two parts.

---

## Case 1: When \(1 \le a \le 20\)

For a fixed \(a\) in this range:
- For \(b < a\) (that is, \(b = 1, 2, \dots, a-1\)), we win \(a\) dollars on each outcome. There are \(a-1\) such outcomes.
- For \(b \ge a\) (that is, \(b = a, a+1, \dots, 20\)), we lose \(b\) dollars. 

Thus, for a given \(a\) (with \(1 \le a \le 20\)), the total payoff contribution for that \(a\) is

\[
\text{Contribution}(a) = a \cdot (a-1) - \sum_{b=a}^{20} b.
\]

The sum \(\sum_{b=a}^{20} b\) can be written in closed form as

\[
\sum_{b=a}^{20} b = \frac{(20+a)(21-a)}{2}.
\]

So the contribution for a given \(a\) is

\[
\text{Contribution}(a) = a(a-1) - \frac{(20+a)(21-a)}{2}.
\]

Let’s denote the total from these outcomes as \(S_1\):

\[
S_1 = \sum_{a=1}^{20} \left[ a(a-1) - \frac{(20+a)(21-a)}{2} \right].
\]

### Simplifying the Expression

First, notice that
\[
a(a-1) = a^2 - a.
\]

We have

\[
S_1 = \sum_{a=1}^{20} \left[ a^2 - a - \frac{(20+a)(21-a)}{2} \right].
\]

Let’s simplify the term \((20+a)(21-a)\):

\[
(20+a)(21-a) = 20\cdot21 + 20(-a) + a\cdot21 - a^2 = 420 - 20a + 21a - a^2 = 420 + a - a^2.
\]

Thus,
\[
\frac{(20+a)(21-a)}{2} = \frac{420 + a - a^2}{2}.
\]

Substitute back in:

\[
S_1 = \sum_{a=1}^{20} \left[ a^2 - a - \frac{420 + a - a^2}{2} \right].
\]

Combine terms by writing \(a^2 - a\) as \(\frac{2a^2 - 2a}{2}\):

\[
S_1 = \sum_{a=1}^{20} \left[ \frac{2a^2 - 2a - 420 - a + a^2}{2} \right]
= \sum_{a=1}^{20} \left[ \frac{3a^2 - 3a - 420}{2} \right].
\]

Factor out \(\frac{3}{2}\):

\[
S_1 = \frac{3}{2} \sum_{a=1}^{20} \left[ a^2 - a \right] - 210 \times  ( \text{since } 420/2 = 210 \text{ and there are 20 terms} ).
\]

Now, calculate the needed sums:
- \(\sum_{a=1}^{20} a = \frac{20 \cdot 21}{2} = 210,\)
- \(\sum_{a=1}^{20} a^2 = \frac{20 \cdot 21 \cdot 41}{6} = 2870.\)

Thus,

\[
\sum_{a=1}^{20} (a^2 - a) = 2870 - 210 = 2660.
\]

So,

\[
S_1 = \frac{3}{2}(2660) - 210 \cdot 20.
\]

Compute each part:
- \(\frac{3}{2}(2660) = \frac{7980}{2} = 3990,\)
- \(210 \cdot 20 = 4200.\)

Thus,

\[
S_1 = 3990 - 4200 = -210.
\]

---

## Case 2: When \(21 \le a \le 30\)

For \(a\) from 21 to 30, every possible \(b\) (which ranges from 1 to 20) satisfies \(b < a\) because the maximum value for \(b\) is 20. Hence, in every outcome we win \(a\) dollars.

For a given \(a\) in this range, the total win is

\[
20 \times a.
\]

Denote the sum over this range as \(S_2\):

\[
S_2 = \sum_{a=21}^{30} 20a = 20 \sum_{a=21}^{30} a.
\]

Now, calculate \(\sum_{a=21}^{30} a\). This can be done by subtracting the sum of the first 20 integers from the sum of the first 30 integers:

\[
\sum_{a=1}^{30} a = \frac{30 \cdot 31}{2} = 465,
\]
\[
\sum_{a=1}^{20} a = 210.
\]

Thus,

\[
\sum_{a=21}^{30} a = 465 - 210 = 255.
\]

So,

\[
S_2 = 20 \times 255 = 5100.
\]

---

## Putting It All Together

The total sum of all payoffs over the 600 equally likely outcomes is

\[
S = S_1 + S_2 = (-210) + 5100 = 4890.
\]

Thus, the expected payoff is

\[
E = \frac{4890}{600} = \frac{4890 \div 30}{600 \div 30} = \frac{163}{20} = 8.15.
\]

---

## Final Answer

The expected payoff is \(\frac{163}{20}\), which is approximately **\$8.15**.