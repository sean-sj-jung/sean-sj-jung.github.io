---
layout: post
title: "Additional Notes for A/B Testing"
date: 2024-11-06
excerpt: "A/A, common mistakes and other interview questions"
---

## Some notes for A/B Testing

---

### A/A Testing 

This is where you split your users into two groups, but both groups receive the same experience. 
It's used to validate your testing setup and ensure your randomization and measurement systems work correctly before running actual experiments

---

### Common Mistake in A/B Testing

1. Difference in distribution between population and sample
	caused by ramping up plans, multiple tests in parallel, segmentation by attributes subject to change (e.g. location) 

2. Violation of SUTVA (Stable Unit Treatment Value Assumption) aka spillover 
	The outcome of treatment only depends on the subject’s status, and is unaffected by another subject’s status
		e.g. social media (a user’s behavior affects another), Two-sided or shared resources (Uber, Lyft)
			Insta - Lower minimum fee of delivery - limit shopper / discourage users in control group etc 

3. Retention of the change 

---

### Measuring uncertainty in A/B Testing

Compute Confidence Interval or Standard Error

---

### Testing two dependent samples

Examples:  
- Pre-post experiments: Measuring the same subjects before and after a treatment (e.g., users before and after a UI change).  
- Matched samples: Each participant in one group has a closely matched participant in another group based on key characteristics.  
- Repeated measures: Same participants tested multiple times under different conditions.  

Tests :
- Paired t-test  
- Wilcoxon Signed-Rank Test, non-parametric test without normality assumption  
