---
layout: post
title: "Knowledge Distillation"
date: 2025-02-20
excerpt: "Overview and Sample code of Knowledge Distillation"
---

### Knowledge Distillation

- Goal: Train a smaller (student) model using knowledge from a larger, fully-trained (teacher) model.
- Training Strategy: The student learns from both:
  - Hard labels (ground truth): e.g., {cat = 1, dog = 0}
  - Soft labels (teacher's probability output): e.g., {cat = 0.8, dog = 0.2}
- Loss Function:
  - Cross-Entropy (CE) Loss: Encourages correct classification using hard labels.
  - KL Divergence (Soft Targets Loss): Aligns the student's probability distribution with the teacher’s.
- Temperature Scaling:
  - Logits are divided by a temperature T before softmax.
  - Higher T smooths the probability distribution, exposing inter-class relationships.
  - Since scaling logits by 1/T reduces their variance (by 1/T^2), we compensate by multiplying the KL divergence loss by T^2.

```python
import torch
import torch.nn as nn
import torch.optim as optim

def train_knowledge_distillation(teacher, student, train_loader, epochs, learning_rate, T, soft_target_loss_weight, ce_loss_weight, device):
    """
    Train a student model using knowledge distillation.
    
    Args:
        teacher: Trained teacher model.
        student: Student model to be trained.
        train_loader: Dataloader for training data.
        epochs: Number of training epochs.
        learning_rate: Learning rate for the optimizer.
        T: Temperature scaling factor.
        soft_target_loss_weight: Weight for the soft target (KL divergence) loss.
        ce_loss_weight: Weight for the cross-entropy loss.
        device: Device (CPU/GPU) to perform training on.
    """
    ce_loss = nn.CrossEntropyLoss()
    optimizer = optim.Adam(student.parameters(), lr=learning_rate)

    teacher.eval()  # Teacher in evaluation mode (no gradient updates)
    student.train() # Student in training mode

    for epoch in range(epochs):
        running_loss = 0.0

        for inputs, labels in train_loader:
            inputs, labels = inputs.to(device), labels.to(device)

            optimizer.zero_grad()

            # Get teacher's logits (no gradient required)
            with torch.no_grad():
                teacher_logits = teacher(inputs)

            # Get student's logits
            student_logits = student(inputs)

            # Compute soft targets from teacher using temperature scaling
            soft_targets = nn.functional.softmax(teacher_logits / T, dim=-1)
            soft_prob = nn.functional.log_softmax(student_logits / T, dim=-1)

            # Compute KL Divergence loss (corrected for temperature scaling)
            batch_size = inputs.size(0)
            soft_targets_loss = torch.sum(soft_targets * (soft_targets.log() - soft_prob)) / batch_size * (T**2)

            # Compute standard cross-entropy loss using hard labels
            label_loss = ce_loss(student_logits, labels)

            # Combine losses with weighting
            loss = soft_target_loss_weight * soft_targets_loss + ce_loss_weight * label_loss

            # Backpropagation and optimization step
            loss.backward()
            optimizer.step()

            running_loss += loss.item()

        print(f"Epoch [{epoch+1}/{epochs}], Loss: {running_loss:.4f}")
```

### References
[PyTorch Tutorial](https://pytorch.org/tutorials/beginner/knowledge_distillation_tutorial.html)