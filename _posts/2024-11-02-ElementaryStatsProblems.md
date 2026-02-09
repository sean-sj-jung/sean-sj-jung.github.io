---
layout: post
title: "Elementary Stats Sample Problems"
date: 2024-11-02
excerpt: "Max of two random variables"
---


---

## Max of two random variables

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


