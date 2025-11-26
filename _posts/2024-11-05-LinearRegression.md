---
layout: post
title: "Linear Regression"
date: 2024-11-03
excerpt: "Another popular topic in interview"
---

### Linear Regression  

1. Underlying Assumption

2. OLS fitting

3. $$\beta$$, t-stats, and F-stats

4. RSS, $$R^2$$ and goodness of fit 

5. Interpretation and practical pitfalls


---

### A Linear Regression Model  

$$
y_i = \beta_0 + \beta_1 x_{i1} + \beta_2 x_{i2} + \dots + \beta_p x_{ip} + \varepsilon_i
$$
or  
$$
\mathbf{y} = X\beta + \varepsilon
$$

### Assumptions

#### 1. Linearity and Additivity  
There must be a linear and additive relationship between the dependent (outcome) and independent (predictor) variables.  
* Additive effects: The effects of different independent variables on the expected value of the dependent variable are additive.  

#### 2. Statistical Independence of Errors  
The errors (residuals) must be statistically independent.  
* For time series data, no autocorrelation.  

#### 3. Homoscedasticity (Constant Variance)  
The variance of the error terms must be constant across all levels of the independent variables. 
The variance must remain constant:
* Versus time
* Versus the predictions
* Versus any independent variable

#### 4. Normality of the Error Distribution

#### 5. Lack of perfect multicolinearity in the predictors   
If perfect colinearity, the $$\beta$$ will be non-identifiable as there is no unique solution.  

⸻

1.2 OLS

We choose \beta to minimize the Residual Sum of Squares (RSS):
$$
\hat\beta = \arg\min_\beta \ \text{RSS}(\beta)
= \arg\min_\beta \ \| \mathbf{y} - X\beta \|^2
$$
Write loss:
L$$(\beta) = (\mathbf{y} - X\beta)^\top(\mathbf{y} - X\beta)$$

Take gradient w.r.t. \beta:
$$
\nabla_\beta L(\beta) = -2X^\top\mathbf{y} + 2X^\top X\beta
$$
Set gradient to zero:
$$
-2X^\top\mathbf{y} + 2X^\top X\beta = 0
\quad\Rightarrow\quad
X^\top X \hat\beta = X^\top \mathbf{y}
$$
Assuming $$X^\top X$$ is invertible, we get the closed form OLS solution:
$$
\hat\beta = (X^\top X)^{-1} X^\top \mathbf{y}
$$

#### Maximum Likelihood Estimate

If we assume
$$\varepsilon \sim \mathcal{N}(0, \sigma^2 I)$$,
then conditional on $$X, \mathbf{y}$$ is multivariate normal with mean $$X\beta$$ and covariance $$\sigma^2 I$$.

The log-likelihood of $$\beta,\sigma^2$$ is (up to constants):
$$
\ell(\beta, \sigma^2)
= -\frac{n}{2}\log(\sigma^2) - \frac{1}{2\sigma^2} \|\mathbf{y} - X\beta\|^2
$$
For fixed $$\sigma^2$$, maximizing $$\ell$$ w.r.t. $$\beta$$ is equivalent to minimizing $$\|\mathbf{y} - X\beta\|^2$$. So:

OLS = MLE for $$\beta$$ under Gaussian noise assumption.

⸻

1.3 test statistics

Given assumptions, we have:
	•	Unbiased estimator:
$$E[\hat\beta] = \beta$$
	•	Variance of estimator:
$$\mathrm{Var}(\hat\beta) = \sigma^2 (X^\top X)^{-1}$$

We can estimate $$\sigma^2$$ by:
$$
\hat{\sigma}^2 = \frac{1}{n - p - 1} \sum_{i=1}^n (y_i - \hat{y}_i)^2
= \frac{\text{RSS}}{n - p - 1}
$$
Then the standard error of coefficient $$\hat\beta_j$$ is:

\mathrm{SE}(\hat\beta_j) = \sqrt{ \hat{\sigma}^2 [(X^\top X)^{-1}]_{jj} }

t-test for individual coefficient (e.g. H_0: \beta_j = 0):

t_j = \frac{\hat\beta_j - 0}{\mathrm{SE}(\hat\beta_j)}

With normal errors, t_j follows a t distribution with n - p - 1 degrees of freedom. We get a p-value and can build confidence intervals.

F-test for overall model: Compare full model vs intercept-only model to test if at least one coefficient is non-zero.

⸻

1.5 R², Adjusted R² & interpretation
	•	Total Sum of Squares (TSS):
\text{TSS} = \sum_{i=1}^n (y_i - \bar{y})^2
	•	Residual Sum of Squares (RSS):
\text{RSS} = \sum_{i=1}^n (y_i - \hat{y}_i)^2
	•	R²:
R^2 = 1 - \frac{\text{RSS}}{\text{TSS}}
Fraction of variance in y explained by the model.
	•	Adjusted R² penalizes number of predictors:
R^2_{\text{adj}} = 1 - \frac{\text{RSS} / (n - p - 1)}{\text{TSS} / (n - 1)}

Pitfall: R² always increases (or stays the same) as you add features; adjusted R² tries to correct for this. But still, prefer out-of-sample metrics and cross-validation for model comparison.

⸻

1.6 Practical issues: multicollinearity, regularization, etc.
	•	Multicollinearity:
	•	Highly correlated features \Rightarrow X^\top X close to singular.
	•	Leads to unstable \hat\beta, large variances, weird signs.
	•	Fix via:
	•	Dropping/recombining features.
	•	PCA or other dimensionality reduction.
	•	Regularization (Ridge / Lasso).
	•	Regularized linear models:
	•	Ridge (L2):
\hat\beta^{\text{ridge}} = \arg\min_\beta \ \|y - X\beta\|^2 + \lambda \|\beta\|_2^2
Closed form:
\hat\beta^{\text{ridge}} = (X^\top X + \lambda I)^{-1} X^\top y
	•	Lasso (L1):
\hat\beta^{\text{lasso}} = \arg\min_\beta \ \|y - X\beta\|^2 + \lambda \|\beta\|_1
No closed form; solved by coordinate descent, etc. Induces sparsity.

Interview line:
“In practice, I watch for multicollinearity, heteroscedasticity, and outliers. I’ll use residual plots, leverage/influence diagnostics, and often prefer cross-validated error and regularized models like Ridge/Lasso over chasing the highest training R².”

⸻
