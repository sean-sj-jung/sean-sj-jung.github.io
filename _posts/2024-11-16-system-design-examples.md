---
layout: post
title: "RecSys System Design Examples"
date: 2024-11-16
excerpt: "End-to-end system design walkthroughs for recommendation systems"
---

## Framework for RecSys System Design

When asked to design a recommender system, walk through these steps:

1. **Problem framing** --- What are we optimizing? What are the constraints?
2. **Data pipeline** --- How do events flow from user actions to training data?
3. **Candidate generation** --- How do we narrow billions to hundreds?
4. **Ranking** --- How do we score and order candidates?
5. **Re-ranking** --- Business logic, diversity, fairness
6. **Serving** --- Batch vs real-time, latency budget
7. **Evaluation** --- Offline metrics, A/B test design, guardrails
8. **Monitoring** --- Drift detection, alerting

## Example 1: Credit Karma Credit Card Recommendations

### Problem Framing
Multi-objective ranking --- maximize P(click) * P(approval) * expected_revenue while maintaining member trust (don't recommend products they'll be denied for).

### Candidate Generation
Filter by eligibility rules (hard constraints like credit score thresholds). Use embedding-based retrieval (two-tower model) to get ~100 candidates from thousands of offers.

### Ranking
Wide-and-deep model scoring candidates on P(click), P(approval), P(conversion).

**Features:**
- **User features:** credit score, income, credit utilization, browsing history
- **Item features:** APR, rewards, annual fee, issuer
- **Cross features:** user-item interactions

### Re-ranking
- Apply business rules
- Diversity constraints (don't show 5 cards from same issuer)
- Fairness considerations (ECOA compliance)
- Budget pacing (lenders have daily budget caps)

### Evaluation
- **Offline:** NDCG, MAP, AUC on historical data
- **Online:** A/B test CTR, conversion rate, revenue per session, member satisfaction
- **Guardrails:** Approval rate, 12-month account-in-good-standing rate

### Key Credit Karma-Specific Considerations
- CTR model is great but revenue is flat? You're likely optimizing clicks, not approvals/funded loans.
- How to build a system that doesn't recommend products users will be denied for? Separate P(approval) model with hard thresholds.
- How to ensure fair lending compliance? Cannot use protected attributes; monitor for disparate impact.
- Lender has a daily budget cap --- how does that change ranking? Constrained optimization, pacing, shadow prices.

## Example 2: Personalized Push Notifications

### Problem
Decide what notification to send, to whom, and when, to maximize engagement without notification fatigue.

### Data Pipeline
User events (app opens, clicks, applications) streamed to event store -> batch feature computation in BigQuery -> real-time features from Kafka/Pub-Sub.

### Models
1. **P(open | user, notification_type, time)** --- CTR prediction
2. **P(conversion | user, product)** --- downstream value
3. **Fatigue model** --- P(unsubscribe | send_frequency)

### Candidate Generation
For each user, generate candidate notifications: new offer, score change, payment reminder.

### Ranking & Throttling
Score candidates, apply frequency caps, select top-1 per user per day.

### Serving
Batch job runs nightly, outputs (user_id, notification_type, send_time, content) to notification delivery system.

### Evaluation
- **A/B test:** notification strategy
- **Primary:** open rate, conversion
- **Guardrails:** unsubscribe rate, app deletion

### Monitoring
Track delivery rate, open rate by segment, model prediction calibration.

## Trade-off Questions to Expect

These come up frequently in system design interviews:

- **Pointwise vs pairwise vs listwise** --- when would you use each?
- **Dot product vs cosine similarity** in a two-tower model?
- **Why might you NOT use a deep model?** (Latency, interpretability, data size, regulatory explainability.)
- **How to balance short-term revenue vs long-term member value?** Multi-objective optimization with guardrail metrics.

## Final Tip

When you don't know an answer, anchor on the funnel (retrieval -> rank -> re-rank), name the relevant tradeoff (recall vs latency, memorization vs generalization, calibration vs ranking), and reason from there. Interviewers care more about how you decompose problems than whether you can recite DCN's formula.
