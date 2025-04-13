---
layout: post
title: "Conditional Probability Problems"
date: 2024-11-10
excerpt: "Example problems"
---


## Difference in efficacy but not in medical domain could trick you

A car company produces all the cars for a country, naming them **Car X** and **Car Y**. The country's car usage is evenly split:

- 50% of the population drives **Car X**.
- 50% of the population drives **Car Y**.

Two new technologies have been discovered to reduce gasoline usage:

- **Technology A** increases the fuel efficiency of **Car X** from **50 MPG** to **75 MPG**.
- **Technology B** increases the fuel efficiency of **Car Y** from **10 MPG** to **11 MPG**.

**Which technology should be implemented to achieve the greatest gasoline savings for the entire country?**

---

For an average commute distance per car, $$D$$,

The total gasoline used $$G$$ is:

$$ G = \frac{D}{MPG} $$

And change in gasoline usage for each technology:

$$ \frac{D}{50} - \frac{D}{75} = \frac{D}{150} $$

$$ \frac{D}{10} - \frac{D}{11} = \frac{D}{110} $$

And

$$ \frac{D}{150} < \frac{D}{110} $$

Therefore, **Technology B** results in greater gasoline savings.

---

## Classic bayesian problem

You called 3 friends independently ask each if it's raining. Each friend has:

- A **2/3** chance of telling the truth.
- A **1/3** chance of intentionally lying.

All three friends respond, "Yes, it's raining."

**What is the probability that it’s actually raining?**

---

- $$P(A)$$ = Probability that it is actually raining.
- $$P(B)$$ = Probability that all three friends say it's raining.
- $$P(A|B)$$ = Probability it's raining, given all friends say it's raining.
- $$P(B|A)$$ = Probability all three friends say it's raining, given it’s actually raining.

$$P(B|A)$$, All fiends saying it is raining when it's actually raining:

$$
P(B|A) = \left(\frac{2}{3}\right)^3 = \frac{8}{27}
$$

Bayesian law of total probability:

$$
P(B) = P(B|A) \cdot P(A) + P(B|\text{not } A) \cdot P(\text{not } A)
$$

Since:

- $$P(\text{not } A) = 1 - P(A)$$.
- $$P(B|\text{not } A)$$ is the probability all friends lie (each friend has a 1/3 chance to lie):

$$
P(B|\text{not } A) = \left(\frac{1}{3}\right)^3 = \frac{1}{27}
$$

Thus:

$$
P(B) = \frac{8}{27} \cdot P(A) + \frac{1}{27} \cdot (1 - P(A))
$$

Then $$P(A|B)$$ is:

$$
P(A|B) = \frac{P(B|A) \cdot P(A)}{P(B)}
$$

Plugging in the values:

$$
P(A|B) = \frac{\frac{8}{27} \cdot P(A)}{\frac{8}{27} \cdot P(A) + \frac{1}{27} \cdot (1 - P(A))} = \frac{8 \cdot P(A)}{8 \cdot P(A) + 1 - P(A)}
$$

Simplifying further:

$$
P(A|B) = \frac{8P(A)}{1 + 7P(A)}
$$

If all three friends say it's raining, the probability it’s actually raining is:

$$\frac{8P(A)}{1 + 7P(A)}$$

---

Here is the disease diagnostic example from the PDF, rewritten in Markdown with equations using `$$`:

---

### Disease Diagnostic Test and Bayesian Updating

Suppose that 1 in 10,000 people (0.01%) has a particular disease. A diagnostic test for the disease has:

- **99% sensitivity**:  
  $$P(A \mid B) = 0.99$$  
  (i.e., if a person has the disease, the test returns positive with probability 0.99)

- **99% specificity**:  
  $$P(A \mid B^c) = 0.01$$  
  (i.e., if a person does not have the disease, the test returns positive with probability 0.01)

What is $$ P(B \mid A) $$

Let:
- $$B$$ = event that a person has the disease  
- $$B^c$$ = event that a person does not have the disease  
- $$A$$ = event that the test result is positive

We are given:
- $$P(B) = 0.0001$$
- $$P(B^c) = 0.9999$$
- $$P(A \mid B) = 0.99$$
- $$P(A \mid B^c) = 0.01$$

#### Compute the marginal probability of a positive test result

Using the law of total probability:

$$
P(A) = P(A \mid B)P(B) + P(A \mid B^c)P(B^c)
$$

$$
P(A) = 0.99 \times 0.0001 + 0.01 \times 0.9999 = 0.010098
$$

#### Step 2: Compute the posterior probability of having the disease given a positive test result

Using Bayes' theorem:

$$
P(B \mid A) = \frac{P(A \mid B)P(B)}{P(A)}
$$

$$
P(B \mid A) = \frac{0.99 \times 0.0001}{0.010098} \approx 0.0098
$$

#### Interpretation

Even with a highly accurate test, the probability of actually having the disease given a positive result is still only about 0.98%. This is because:

- The disease is very rare, and
- There is a non-zero false positive rate

Most positive test results are actually **false positives**.

--- 