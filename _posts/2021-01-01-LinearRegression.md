---
layout: post
title: "Linear Regression"
date: 2021-01-01
excerpt: "Another popular topic"
---

### Linear Regression  

1. Underlying Assumption

2. OLS fitting

3. $$\beta$$, t-stats, and F-stats

4. RSS, $$R^2$$ and goodness of fit 

5. Interpretation and practical pitfalls


---
### A Linear Regression Model  

<div style="padding-left: 2em">

$$
y_i = \beta_0 + \beta_1 x_{i1} + \beta_2 x_{i2} + \dots + \beta_p x_{ip} + \varepsilon_i
$$

</div>

or  

<div style="padding-left: 2em">

$$
\mathbf{y} = X\beta + \varepsilon
$$

</div>

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

### OLS Fitting

Choose $$\beta$$ to minimize the Residual Sum of Squares (RSS):  

<div style="padding-left: 2em">

$$
\begin{align}
\hat\beta &= \arg\min_\beta \ \text{RSS}(\beta) \\
&= \arg\min_\beta \ \| \mathbf{y} - X\beta \|^2
\end{align}	
$$

</div>

Loss:  

<div style="padding-left: 2em">

$$
\begin{align}
L(\beta) &= (\mathbf{y} - X\beta)^\top(\mathbf{y} - X\beta) \\
&= \mathbf{y}^\top \mathbf{y}
- \mathbf{y}^\top X\beta
- (X\beta)^\top \mathbf{y}
+ (X\beta)^\top (X\beta)
\end{align}	
$$

</div>

Using $$(X\beta)^\top = \beta^\top X^\top$$ and $$(X\beta)^\top \mathbf{y} = \beta^\top X^\top \mathbf{y}$$  

<div style="padding-left: 2em">

$$
L(\beta) = \mathbf{y}^\top \mathbf{y} - 2 \beta^\top X^\top \mathbf{y} + \beta^\top X^\top X \beta  
$$

</div>

Take gradient w.r.t. $$\beta$$:  

<div style="padding-left: 2em">

$$
\begin{align}
\nabla_\beta L(\beta) &= \frac{\partial L(\beta)}{\partial \beta} \\
&= \frac{\partial}{\partial \beta}\left( \mathbf{y}^\top \mathbf{y} \right)
- 2 \frac{\partial}{\partial \beta}\left( \beta^\top X^\top \mathbf{y} \right)
+ \frac{\partial}{\partial \beta}\left( \beta^\top X^\top X \beta \right)
\end{align}	
$$

</div>

Where  

<div style="padding-left: 2em">

$$
\frac{\partial}{\partial \beta}\left( \mathbf{y}^\top \mathbf{y} \right) = 0  
$$

</div>

Let $$a = X^\top \mathbf{y}$$ (constant w.r.t. $$\beta$$)  

Then  

<div style="padding-left: 2em">

$$\frac{\partial}{\partial \beta} \left( \beta^\top a \right) = a$$

</div>

so   

<div style="padding-left: 2em">

$$\frac{\partial}{\partial \beta} \left( -2 \beta^\top X^\top \mathbf{y} \right) = -2 X^\top \mathbf{y}$$

</div>

Let $$A = X^\top X$$. Then $$A = A^\top$$. Using the symmetric case:  

<div style="padding-left: 2em">

$$\frac{\partial}{\partial \beta} \left( \beta^\top A \beta \right) = 2A\beta = 2X^\top X \beta$$

</div>

Therefore,   

<div style="padding-left: 2em">

$$  
\nabla_\beta L(\beta) = -2X^\top\mathbf{y} + 2X^\top X\beta
$$

</div>

And  

<div style="padding-left: 2em">

$$  
X^\top X \hat\beta = X^\top \mathbf{y}  
$$

</div>

Assuming $$X^\top X$$ is invertible, we get the closed form OLS solution:   

<div style="padding-left: 2em">

$$  
\hat\beta = (X^\top X)^{-1} X^\top \mathbf{y}
$$

</div>

#### Maximum Likelihood Estimate of $$\beta$$
  
If we assume $$\varepsilon \sim \mathcal{N}(0, \sigma^2 I)$$, then conditional on $$X, \mathbf{y}$$ is multivariate normal with mean $$X\beta$$ and covariance $$\sigma^2 I$$.   
  
The log-likelihood of $$\beta,\sigma^2$$ is (up to constants):  

<div style="padding-left: 2em">

$$  
\ell(\beta, \sigma^2)
= -\frac{n}{2}\log(\sigma^2) - \frac{1}{2\sigma^2} \|\mathbf{y} - X\beta\|^2
$$

</div>

For fixed $$\sigma^2$$, maximizing $$\ell$$ w.r.t. $$\beta$$ is equivalent to minimizing $$\|\mathbf{y} - X\beta\|^2$$.  
i.e. OLS = MLE for $$\beta$$ under Gaussian noise assumption.  

⸻

### Test statistics  
  
Given assumptions, we have:  
Unbiased estimator:  $$E[\hat\beta] = \beta$$  
Variance of estimator:  $$\mathrm{Var}(\hat\beta) = \sigma^2 (X^\top X)^{-1}$$  
  
We can estimate $$\sigma^2$$ by:  

<div style="padding-left: 2em">

$$  
\hat{\sigma}^2 = \frac{1}{n - p - 1} \sum_{i=1}^n (y_i - \hat{y}_i)^2
= \frac{\text{RSS}}{n - p - 1}
$$

</div>

Then the standard error of coefficient $$\hat\beta_j$$ is:  

<div style="padding-left: 2em">

$$\mathrm{SE}(\hat\beta_j) = \sqrt{ \hat{\sigma}^2 [(X^\top X)^{-1}]_{jj} }$$

</div>

t-test for individual coefficient (e.g. $$H_0: \beta_j = 0$$):  

<div style="padding-left: 2em">

$$t_j = \frac{\hat\beta_j - 0}{\mathrm{SE}(\hat\beta_j)}$$

</div>

With normal errors, $$t_j$$ follows a t distribution with $$n - p - 1$$ degrees of freedom. We get a p-value and can build confidence intervals.  
  
F-test for overall model: Compare full model vs intercept-only model to test if at least one coefficient is non-zero.  

---

#### Standard error of coefficient $$\beta$$

##### Sampling distribution of $$\hat\beta$$

Plug model into $$\hat\beta$$:  

<div style="padding-left: 2em">

$$\hat\beta = (X^\top X)^{-1} X^\top (X\beta + \varepsilon)$$

</div>

Distribute:  

<div style="padding-left: 2em">

$$\hat\beta = (X^\top X)^{-1} X^\top X\beta + (X^\top X)^{-1} X^\top \varepsilon$$

</div>

Use $$(X^\top X)^{-1} X^\top X = I_p$$:  

<div style="padding-left: 2em">

$$\hat\beta = \beta + (X^\top X)^{-1} X^\top \varepsilon$$

</div>

Take expectation (condition on fixed X):  

<div style="padding-left: 2em">

$$\mathbb{E}[\hat\beta \mid X] = \beta + (X^\top X)^{-1} X^\top \mathbb{E}[\varepsilon \mid X] = \beta$$

</div>

So $$\hat\beta$$ is unbiased.  
  
Variance:  

<div style="padding-left: 2em">

$$\text{Var}(\hat\beta \mid X) = \text{Var}\big((X^\top X)^{-1} X^\top \varepsilon \,\big|\, X\big)$$

</div>

Let $$A = (X^\top X)^{-1} X^\top$$. Then $$\hat\beta = \beta + A\varepsilon$$, so:  

<div style="padding-left: 2em">

$$\text{Var}(\hat\beta \mid X) = A\,\text{Var}(\varepsilon \mid X)\,A^\top$$

</div>

By assumption, $$\text{Var}(\varepsilon \mid X) = \sigma^2 I_n$$. Thus:  

<div style="padding-left: 2em">

$$\text{Var}(\hat\beta \mid X) = A(\sigma^2 I_n)A^\top = \sigma^2 A A^\top$$

</div>

Compute $$AA^\top$$:  

<div style="padding-left: 2em">

$$A = (X^\top X)^{-1} X^\top \quad\Rightarrow\quad A A^\top = (X^\top X)^{-1} X^\top X (X^\top X)^{-1} = (X^\top X)^{-1}$$

</div>

So:  

<div style="padding-left: 2em">

$$\boxed{\text{Var}(\hat\beta \mid X) = \sigma^2 (X^\top X)^{-1}}$$

</div>

If errors are normal, since $$\hat\beta$$ is a linear transformation of a multivariate normal $$\varepsilon$$, we have:  

<div style="padding-left: 2em">

$$\hat\beta \mid X \sim \mathcal{N}\left(\beta,\ \sigma^2 (X^\top X)^{-1}\right)$$

</div>

##### Standard error of a single coefficient

Let  

<div style="padding-left: 2em">

$$\text{Var}(\hat\beta \mid X) = \sigma^2 (X^\top X)^{-1} = \sigma^2 C$$

</div>

where $$C = (X^\top X)^{-1}$$ is a $$p \times p$$ matrix.  
  
The variance of the j-th coefficient $$\hat\beta_j$$ is the j-th diagonal element of this covariance matrix:  

<div style="padding-left: 2em">

$$\text{Var}(\hat\beta_j \mid X) = \sigma^2 C_{jj}$$

</div>

So the standard deviation (population standard deviation of $$\hat\beta_j$$) is:  

<div style="padding-left: 2em">

$$\text{SD}(\hat\beta_j \mid X) = \sqrt{\sigma^2 C_{jj}} = \sigma \sqrt{C_{jj}}$$

</div>

We don't know $$\sigma$$. In practice, we replace $$\sigma^2$$ with its estimator $$s^2$$. Then the standard error of $$\hat\beta_j$$ is:  

<div style="padding-left: 2em">

$$\boxed{\text{SE}(\hat\beta_j) = \sqrt{s^2 C_{jj}}}$$

</div>

where $$C_{jj}$$ is the j-th diagonal element of $$(X^\top X)^{-1}$$.
##### Single-predictor intuition  
  
For simple linear regression with intercept:  
  
$$y_i = \beta_0 + \beta_1 x_i + \varepsilon_i,\quad i=1,\dots,n$$  
  
You can show (standard result) that:  
	•	$$\hat\beta_1 = \dfrac{\sum (x_i - \bar{x})(y_i - \bar{y})}{\sum (x_i - \bar{x})^2}$$  
	•	$$s^2 = \dfrac{1}{n-2} \sum \hat\varepsilon_i^2$$  
	•	And: $$\text{SE}(\hat\beta_1) = \frac{s}{\sqrt{\sum (x_i - \bar{x})^2}}$$  
  
This matches the matrix formula: $$\text{SE}(\hat\beta_1)^2 = s^2 C_{11}.$$   
  
⸻

### R², Adjusted R² & interpretation  
Total Sum of Squares (TSS):  $$\text{TSS} = \sum_{i=1}^n (y_i - \bar{y})^2$$  
Residual Sum of Squares (RSS):  $$\text{RSS} = \sum_{i=1}^n (y_i - \hat{y}_i)^2$$  
R²:  $$R^2 = 1 - \frac{\text{RSS}}{\text{TSS}}$$  
	Fraction of variance in y explained by the model.  
Adjusted R² penalizes number of predictors:  $$R^2_{\text{adj}} = 1 - \frac{\text{RSS} / (n - p - 1)}{\text{TSS} / (n - 1)}$$  
  
R² always increases (or stays the same) as you add features; adjusted R² tries to correct for this.   
(But in reality, out-of-sample metrics and cross-validation for model comparison)  
  
  
#### F-Test and Sums of Squares  
  
Mean Square Regression (MSR): $$\text{MSR} = \frac{\text{SSR}}{k}$$  
Mean Square Error (MSE): $$\text{MSE} = \frac{\text{SSE}}{n - k - 1}$$  
  
$$F = \frac{\text{MSR}}{\text{MSE}} = \frac{\text{SSR}/k}{\text{SSE}/(n - k - 1)}$$  
  
Intuition:  
MSR ≈ variance in y explained per predictor (signal).  
MSE ≈ variance of the noise (unexplained variation).  
  
If the model is useless (H_0 true), adding predictors doesn’t reduce SSE much relative to noise, so MSR ≈ MSE and F \approx 1.  
  
If the model explains a lot relative to noise, MSR ≫ MSE and F is large.  
  
Under classical assumptions (linear model is correct, errors i.i.d. normal with constant variance, independent):  
Under $$H_0$$, $$F \sim F_{k,\,n-k-1}$$  
(F distribution with k and n-k-1 degrees of freedom)  
  
⸻
  
### Practical issues: multicollinearity, regularization, etc.  
  
#### Multicollinearity:  
If perfect multicollinearity (e.g. $$x_1=2*x_2, x_1=x_2+x_3$$), then $$X^\top X$$ becomes singular, rank-deficient, determinant is zero, and not invertible. No unique solution for $$\hat\beta$$.  
  
If imperfect but high multicollinearity, the determinant is close to zero and $$\hat\beta$$ will have a unique solution with very high variance (= huge $$SE(\beta)$$), likely resulting in statistically not significant estimate of  $$\beta$$ and $$\beta$$ will be sensitive to small changes in the data.  

Fix the multicollinearity by:  
- Dropping/recombining features    
- PCA or other dimensionality reduction  
- Regularization (Ridge / Lasso)  

#### Regularized linear models:  
##### Ridge (L2):  
  
$$\hat\beta^{\text{ridge}} = \arg\min_\beta \ \|y - X\beta\|^2 + \lambda \|\beta\|_2^2$$  
  
Closed form:  
  
$$\hat\beta^{\text{ridge}} = (X^\top X + \lambda I)^{-1} X^\top y$$  

$$\lambda$$  ensure all eigenvalues are positive, determinant becomes non-zero and is always invertible.  
Ridge is biased but low variance.  

##### Lasso (L1):  
  
$$\hat\beta^{\text{lasso}} = \arg\min_\beta \ \|y - X\beta\|^2 + \lambda \|\beta\|_1$$   
  
No closed form; solved by coordinate descent, etc.  
Shirnk coefficient toward zero and useful for feature selection.   

##### Bias-Variance Tradeoff  
OLS is unbiased but can have variance when:  
- p is relatively large to n  
- collinear X  
- out-of-sample prediction  
L1 and L2 regularization can reduce variance with increase in bias  
  
⸻
  
### Example question  
  
Let's say there is a linear regression model $$y = b0 + b1x1 + b2x2 + b3x3$$.   
Q1. I'm interested in whether $$x_1$$ is any useful for predicting $$y$$. In this case, is there any point of including $$x_2$$ and $$x_3$$ in the model?  

1. If you care about any association between $$x_1$$ and $$y$$, then a simple univariate regression will do.  
2. If you care about conditional association, meaning holding other variables fixed, then the $$x_2$$ and $$x_3$$ should be in the model.  
3. If the other variables are correlated with $$x_1$$, then they should be in the model; otherwise $$\beta_1$$ will be biased (omitted variable bias).  
  
Q2. If $$x_2$$ and $$x_3$$ are highly correlated, will it affect the estimate of $$\beta_1$$?  
If $$x_1$$ is correlated as well, then the variance of the estimate will be inflated. But if it has 0 correlation with the two variables, then it won't be affected.  
  
### Another example question  

Suppose you want to predict Y using variables X1 and X2, and linear regression.  
X1 and X2 are correlated and have variance of 1. You try fitting two different models with maximum likelihood - one that predicts Y using X1 and X2, and another that predicts Y using new predictors (X1 + X2) and (X1 - X2). Which method is better and why?  


#### 1. The two models are equivalent, predictively  

The predictors (X1 + X2) and (X1 - X2) are just linear combinations of X1 and X2. Since linear regression with maximum likelihood (i.e., ordinary least squares under Gaussian errors) is being used in both cases, the two models span the exact same column space. Any prediction that can be written as
  
$$\hat{Y} = \beta_1 X_1 + \beta_2 X_2$$
  
can equivalently be written as
  
$$\hat{Y} = \gamma_1 (X_1 + X_2) + \gamma_2 (X_1 - X_2)$$
  
by setting $\gamma_1 = (\beta_1 + \beta_2)/2$ and $\gamma_2 = (\beta_1 - \beta_2)/2$, and vice versa. The mapping is invertible, so the two parameterizations cover exactly the same set of possible fitted surfaces. Maximum likelihood will find the global optimum in both cases (the OLS objective is convex), so the fitted values $\hat{Y}$, residuals, and log-likelihood will be identical.
  
#### 2. Orthogonal  

Since X1 and X2 are correlated (both with variance 1), the design matrix in the original basis has correlated columns, which inflates the variance of $\hat{\beta}_1$ and $\hat{\beta}_2$ (multicollinearity). The transformation to (X1 + X2) and (X1 - X2) can decorrelate or reduce the correlation between the new predictors.   
  
Specifically, if $\text{Corr}(X_1, X_2) = \rho$, then $\text{Var}(X_1 + X_2) = 2(1+\rho)$ and $\text{Var}(X_1 - X_2) = 2(1-\rho)$, and crucially $\text{Cov}(X_1+X_2,\, X_1-X_2) = 0$. So the new predictors are uncorrelated.  

This means the second parameterization gives coefficient estimates with lower individual variance (no multicollinearity), making interpretation and inference on the individual coefficients more stable. But the predictions and overall model fit are exactly the same.  

**In short:** neither method is "better" in terms of predictive accuracy — they produce identical fits. The rotated basis is better conditioned numerically and yields more interpretable, lower-variance coefficient estimates.  

