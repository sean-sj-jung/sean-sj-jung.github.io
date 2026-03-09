---
layout: post
title: "Elementary Stats Sample Problems"
date: 2024-11-02
excerpt: "Probability and Statistics problem"
---


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
