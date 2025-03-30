---
layout: post
title: "Intro to Diffusion"
date: 2025-03-16
excerpt: "First time looking into diffusion"
---

## Diffusion
Code and summary below is from [huggingface](https://huggingface.co/learn/diffusion-course/en/unit1/1)  
  
### Diffusion modeling:  
1. Gradually add noise to original data  
2. Learn to predict the noise to reconstruct the original data from pure noise  
```python
noise = torch.randn_like(x)
noisy_x = noise_scheduler.add_noise(x, noise, timesteps)
model_prediction = model(noisy_x, timesteps).sample
loss = mse_loss(model_prediction, noise) # noise as the target
```
  
  
### Common Architecture of Diffusion models: [UNet](https://arxiv.org/pdf/1505.04597)
Note: This is a simplified example from the huggingface tutorial for representation UNet's contracting and upsampling layers.

```python
class BasicUNet(nn.Module):
    """A minimal UNet implementation."""

    def __init__(self, in_channels=1, out_channels=1):
        super().__init__()
        self.down_layers = torch.nn.ModuleList(
            [
                nn.Conv2d(in_channels, 32, kernel_size=5, padding=2),
                nn.Conv2d(32, 64, kernel_size=5, padding=2),
                nn.Conv2d(64, 64, kernel_size=5, padding=2),
            ]
        )
        self.up_layers = torch.nn.ModuleList(
            [
                nn.Conv2d(64, 64, kernel_size=5, padding=2),
                nn.Conv2d(64, 32, kernel_size=5, padding=2),
                nn.Conv2d(32, out_channels, kernel_size=5, padding=2),
            ]
        )
        self.act = nn.SiLU()  # The activation function
        self.downscale = nn.MaxPool2d(2)
        self.upscale = nn.Upsample(scale_factor=2)

    def forward(self, x):
        h = []
        for i, l in enumerate(self.down_layers):
            x = self.act(l(x))  # Through the layer and the activation function
            if i < 2:  # For all but the third (final) down layer:
                h.append(x)  # Storing output for skip connection
                x = self.downscale(x)  # Downscale ready for the next layer

        for i, l in enumerate(self.up_layers):
            if i > 0:  # For all except the first up layer
                x = self.upscale(x)  # Upscale
                x += h.pop()  # Fetching stored output (skip connection)
            x = self.act(l(x))  # Through the layer and the activation function

        return x
```

### Another Component: (Noise) Scheduler
e.g. [DDPM](https://arxiv.org/abs/2006.11239)  

The DDPM paper describes a corruption process that adds a small amount of noise for every ‘timestep’.  xw
Given $$x_{t-1}$$ for some timestep, we can get the next (slightly more noisy) version $$x_t$$ with:  

$$
\begin{aligned} q(\mathbf{x}_t \vert \mathbf{x}_{t-1}) &= \mathcal{N}(\mathbf{x}_t; \sqrt{1 - \beta_t} \mathbf{x}_{t-1}, \beta_t\mathbf{I}) \end{aligned}  
$$
  
$$
\begin{aligned} q(\mathbf{x}_{1:T} \vert \mathbf{x}_0) &= \prod_{t=1}^T q(\mathbf{x}_t \vert \mathbf{x}_{t-1}) \end{aligned}  
$$

That is, we take $$x_{t-1}$$, scale it by $$\sqrt{1 - \beta_t}$$ and add noise scaled by $$\beta_t$$. This $$\beta$$ is defined for every t according to some schedule, and determines how much noise is added per timestep. Now, we don’t necessarily want to do this operation 500 times to get $$x{500}$$ so we have another formula to get $$x_t$$ for any t given $$x_0$$:  

$$\begin{aligned} q(\mathbf{x}_t \vert \mathbf{x}_0) &= \mathcal{N}(\mathbf{x}_t; \sqrt{\bar{\alpha}_t} \mathbf{x}_0, \sqrt{(1 - \bar{\alpha}_t)} \mathbf{I}) \end{aligned}$$  
where  
$$\begin{aligned} \bar{\alpha}_t &= \prod_{i=1}^T \alpha_i \end{aligned}$$  
$$\begin{aligned} \alpha_i &= 1-\beta_i \end{aligned}$$  



