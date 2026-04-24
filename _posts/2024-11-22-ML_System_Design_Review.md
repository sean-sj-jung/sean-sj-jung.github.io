---
layout: post
title: "ML System Design Interview"
date: 2024-11-22
excerpt: "Preparation note for ML System Design"
---

# ML System Design Interview — Comprehensive Review

A consolidated study guide covering interview flow, the 5-part framework, architectural patterns, tech-stack vocabulary, worked examples, and quick-reference checklists.

---

## 1. Interview Flow & Timing (≈45-minute session)

A mental clock helps keep the conversation balanced. Don't rush past the problem framing — that's where most candidates lose points.

| Phase | Time | What to do |
| :--- | :--- | :--- |
| **1. Understand the problem** | ~5 min | Identify actors, what the system must do, business requirements and goals. State assumptions explicitly and confirm with the interviewer. |
| **2. High-level design** | ~6 min | Whiteboard the architecture — boxes, arrows, data flow. Just enough detail; the final arrow returns to the user. |
| **3. Data considerations** | ~8–9 min | Where is data coming from (logs, user DB, third-party)? What are the labels (clicks, purchases, explicit ratings)? What features, how stored, real-time vs batch? Split strategy; handle imbalance; negative sampling; data retention window. |
| **4. Modeling + metrics + training** | ~15–16 min | Candidate models, loss, training strategy, overfitting, cold start, A/B test plan. |
| **5. Serving & ops details** | ~5 min | Online eval, training parallelism, trade-offs between two reasonable solutions, and your recommendation. |
| **6. Monitoring & retraining** | — | How to monitor; when to retrain; when to switch. User cold start vs item cold start. |
| **7. Questions for interviewer** | — | Always leave time for this. |

**Key habits:**
- After stating assumptions: *"All good, should we move forward?"*
- Compare against a baseline (existing system or random).
- Discuss trade-offs: **Latency vs Scale vs Performance (Recall/Precision)**.

---

## 2. The 5-Part Framework

When you get "Design X," resist jumping to "I'd use a Transformer." Walk through this architectural flow.

### 2.1 Requirements & Metrics
- **Business goal:** increase watch time, reduce churn, maximize revenue, etc.
- **ML metrics:** Precision, Recall, F1, RMSE, LogLoss, PR-AUC, NDCG.
- **Business metrics:** CTR, RPM (Revenue per Mille), session length, retention.
- **System metrics:** Latency (e.g., P99 < 200ms), throughput, cost per inference.

### 2.2 Data Engineering & Pipeline
- **Sources:** logs, user DB, third-party APIs, content metadata.
- **Labeling:** implicit (clicks, dwell time) vs explicit (ratings, human raters).
- **Feature store:** unified store for training + real-time inference (Tecton, Feast).
- **Lambda architecture:** batch path for historical aggregates + streaming path for hot features.

### 2.3 Model Architecture
- Start with heuristics, then simple models (Logistic Regression), then deep models.
- **Offline training:** batch, distributed strategies.
- **Online inference:** how features are fetched and combined in milliseconds.

### 2.4 Evaluation & Deployment
- **Offline:** backtesting on historical holdout.
- **Online:** A/B testing, canary releases, shadow mode, interleaving for ranking.

### 2.5 Monitoring & Maintenance
- **Data drift:** input distribution changes.
- **Concept drift:** input→output relationship changes.
- **Retraining cadence:** when and how to update.

---

## 3. Tech Stack Mental Model

Lead with the *category*, then name a *tool*. Sounds like an architect, not a buzzword collector.

| Component | Purpose | Example Tools |
| :--- | :--- | :--- |
| **Ingestion** | High-throughput asynchronous streams | Kafka, AWS Kinesis, Pub/Sub, Flink |
| **Hot storage (serving)** | Low-latency feature retrieval | Redis, DynamoDB, Cassandra |
| **Cold storage (training)** | Data lake / historical logs | S3, GCS, HDFS |
| **Feature store** | Bridge training & serving | Tecton, Feast |
| **Model serving** | Wrap model as an API | FastAPI, gRPC (lower latency), TorchServe, Triton |
| **Orchestration** | Automate DAG pipelines | Airflow, Kubeflow, Dagster |
| **Vector DB (retrieval)** | ANN search over embeddings | Milvus, Pinecone, FAISS, Vespa |
| **Load balancing** | Horizontal scaling for 100M+ users | Nginx, AWS ELB |

> **Senior move:** Mention a **Load Balancer** distributing to FastAPI/gRPC workers. Shows you understand horizontal scaling.

**Key interview phrase:** *"We need a distributed message queue for high-throughput ingestion, so I'd use something like Kafka or Kinesis."*

---

## 4. The Multi-Stage Pipeline (Recommendation / Ranking / Ads)

Almost every large-scale recommender or CTR system uses this pattern. Don't propose one giant model.

### Stage 1 — Candidate Generation (Retrieval)
From millions/billions of items, grab ~500–1,000 relevant candidates using cheap methods.
- **Two-Tower Neural Network:** one tower for user, one for item; dot-product similarity. Item tower is precomputed; user embedding computed at request time. ANN lookup in a vector DB.
- **Matrix Factorization / Collaborative Filtering:** classic baseline.
- **Logistic Regression + Feature Hashing:** simple, fast, handles high-cardinality categoricals well.

> **Bag of Retrievers:** candidate generation is *never* just one model — typically 10–20 parallel pipelines. Different retrievers target different goals (personalized, fresh, trending, topical).

### Stage 2 — Ranking (Scoring)
Score the candidates with a "heavy" model.
- **DeepFM / DCN (Deep & Cross Network):** learn cross features automatically (e.g., `gender=male AND category=electronics`).
- **Deep Neural Network** with hundreds of features.
- Predict CTR / watch-time / conversion probability.

### Stage 3 — Re-ranking (Business Logic)
- Remove clickbait or policy-violating items.
- De-duplicate, ensure diversity.
- Apply floors (e.g., reserved slots for new creators).
- Fairness / compliance filters.

---

## 5. Cold Start & New Items (Daily Refresh Problem)

"How do we recommend a video/ad uploaded 5 minutes ago?" — a classic follow-up.

### 5.1 Content-Based Features
Don't treat an item as a unique ID. Use content features: category, brand, color, topic embeddings, text embeddings from the title/description. A brand-new "Red Nike Shoes" ad inherits learned behavior of *Red*, *Nike*, *Shoes*.

### 5.2 Freshness Retrievers
Add specialized retrievers to the bag:
- Heuristic (upload recency × topic match).
- Topic-based.
- Metadata-based.

### 5.3 Near-Real-Time Indexing
On upload, push the item through the item tower → generate embedding → incremental insert into the vector DB. Seconds to minutes, not hours.

### 5.4 Exploration vs Exploitation
Reserve a small % of traffic (~5%) for new content regardless of predicted score.
- **Upper Confidence Bound (UCB)**
- **Thompson Sampling**
- **Multi-Armed Bandits (MAB)**

### 5.5 Incremental / Online Learning
Daily full retraining is too expensive for 100M+ parameter models.
- **Warm start / incremental training:** fine-tune every hour on new data only.
- **Online learning — FTRL (Follow-The-Regularized-Leader):** real-time weight updates as clicks arrive. Pioneered by Google for ads.
- **Buffer model:** a small, fast online learner offsets predictions from the stale deep model.

---

## 6. Distributed Training: LLMs vs RecSys

Both are "big," but they're big in different ways. This distinction impresses interviewers.

### 6.1 LLMs — Compute/Weight-Bound
- Weights are massive and dense.
- **FSDP (Fully Sharded Data Parallel)** or **DeepSpeed** shard weights, gradients, and optimizer state across GPUs.

### 6.2 RecSys (DeepFM / DCN) — Memory-Bound on Embeddings
- The "Deep" layers are small; the **Embedding Tables** are the giant.
- 100M users × 64-dim embedding = tens of GB that won't fit on one GPU.

### 6.3 Sharding Strategy
- **Embedding sharding / Parameter Server:** shard the *embedding tables* across machines (table-wise or row-wise).
- **TorchRec:** PyTorch's purpose-built library for terabyte-scale embeddings; handles table-wise/row-wise sharding natively.
- **Data parallelism** is still fine for the MLP layers.

> **Interview phrase:** *"For the MLP layers, standard data parallelism is fine. But for sparse features with high cardinality, I'd use embedding sharding or a parameter server to distribute embedding tables across the cluster — e.g., TorchRec."*

---

## 7. Evaluation Deep Dive

Standard accuracy is rarely enough at production scale.

- **LogLoss / Cross-Entropy:** gold standard for CTR because it's sensitive to **calibration**. If the model says 10%, it had better mean ~10/100 click — auction bidding depends on this.
- **PR-AUC:** better than ROC-AUC for highly imbalanced data (<1% positive rate).
- **Calibration plots:** predicted vs observed; deviation from the 45° line means you overbid or underbid.
- **Slice-based evaluation:** break performance down by cohort (new vs power users, mobile vs desktop, country). An on-average-good model may be tanking your most profitable segment.
- **Delayed feedback / attribution lag:** install ads convert 2 days later — account for this in training labels and eval.
- **Interleaving (ranking):** more statistical power than A/B for ranking changes.
- **Shadow mode:** run the new model in parallel without serving its predictions; compare offline.

---

## 8. Monitoring & Maintenance

Beyond CTR-by-cohort (which captures concept drift), monitor:

- **Feature attribution drift:** is `device_type` suddenly less predictive? Often means a tracking bug or platform change (e.g., iOS privacy).
- **Input distribution drift:** PSI, KL divergence on feature histograms.
- **Prediction distribution drift:** is the output CTR suddenly shifting?
- **Adversarial / bot activity:** CTR spike from one IP range = possible bot net.
- **Model staleness:** in ads, yesterday's model already degrades.
- **Serving health:** P50/P99 latency, error rate, fallback rate.
- **Feedback loop integrity:** when a user clicks a recommended video, that click becomes next iteration's training data — verify the loop is intact.

**Cold-start taxonomy to monitor:**
- **User cold start** — brand-new user, no history.
- **Item cold start** — brand-new item/ad/video.

---

## 9. Worked Example 1 — YouTube Video Recommendation

*"How would you build a system to recommend videos on the homepage?"*

**Assumptions to state:** billions of users, billions of videos, homepage recommendations, goal = maximize watch time / session depth, latency budget e.g. P99 < 200ms.

**Architecture:**
1. **Candidate generation** — bag of retrievers in parallel:
   - Two-Tower ANN on collaborative signals.
   - Freshness retriever for newly uploaded videos (heuristic or topic-based).
   - Subscription retriever (user's channels).
   - Trending retriever.
2. **Ranking** — DNN scoring ~1,000 candidates by predicted watch time.
3. **Re-ranking** — diversity, policy, already-watched filter, creator fairness.

**Cold start:**
- New videos: freshness retriever + near-real-time indexing (upload → item tower → embedding → vector DB in seconds).
- New users: fall back to trending + demographic priors; use exploration bandits.

**Training:**
- Two-tower refreshed daily (batch).
- Ranker refreshed multiple times per day.
- Item embeddings recomputed on upload.

**Serving:**
- Vector DB for retrieval.
- Feature store (hot: Redis; cold: S3).
- Ranker served via gRPC behind a load balancer.

**Eval:**
- Offline: NDCG, watch-time MSE, recall@k for retrieval.
- Online: A/B on session watch time, DAU return rate.

**Post-recommendation plumbing** (the "how does it get back to the user?" SWE angle):
- Ranker returns an ordered list of video IDs via gRPC.
- Backend hydrates metadata (thumbnail, title) and returns JSON to the client.
- Client renders the feed; impressions are logged back to Kafka for the next training cycle.

---

## 10. Worked Example 2 — Ad CTR Predictor (expanded)

*"Design a system to predict whether a user will click an ad."*

### 10.1 Requirements & Metrics
- **LogLoss** (calibration-sensitive) — critical for auction bidding.
- **PR-AUC** for imbalance.
- **Business:** CTR, RPM, revenue.
- **System:** ad latency < 50ms (else slot goes empty / defaults to cheap fallback = lost revenue).

### 10.2 Data Pipeline (Lambda)
- **Batch path:** S3 logs → Spark (daily feature eng, e.g. "user 30-day CTR") → feature store.
- **Streaming path:** Kafka → Flink → hot features in Redis/DynamoDB (e.g., "impressions of this ad in the last hour").

### 10.3 Modeling
- **Scale:** 100M+ users, huge ad inventory → two-stage is mandatory.
- **Retrieval:** Two-Tower for embeddings + ANN via vector DB. Simple alternative: Logistic Regression with feature hashing.
- **Ranking:** DeepFM or DCN learns cross features (gender × category, etc.). LR baseline for comparison.

### 10.4 Evaluation
- Offline backtesting honoring imbalance.
- **Calibration plots** — slope must be ~1.
- **Slice evaluation** — cohorts, device, country.
- **Delayed feedback** for conversion-type goals.
- Online A/B on revenue and CTR; shadow mode before live.

### 10.5 Monitoring
- CTR by cohort (concept drift).
- Feature attribution drift.
- Bot/adversarial detection.
- Model staleness alerts.

### 10.6 New-Ad Handling (no daily full retrain)
- **Content features** generalize across ad IDs.
- **Freshness retriever** + near-real-time embedding indexing.
- **Explore/Exploit** via UCB / Thompson Sampling (~5% exploration).
- **Incremental training** — hourly fine-tune on new data.
- **FTRL online learner** updates weights as clicks arrive.

### 10.7 Imbalanced Data
- Downsample negatives or upweight positives.
- Feature hashing for high-cardinality categoricals (UserID, AdID).
- Model distillation or simpler model on the final bid hop if latency is tight.

---

## 11. Worked Example 3 — Image Content Moderation

*"Design a system to detect and flag unsafe images uploaded to a social platform."*

- **Core trade-off:** Precision vs Recall. Moderation usually prioritizes **high recall** (don't let bad stuff through) while watching precision to avoid censoring innocent users.
- **Human-in-the-loop:** high-confidence predictions auto-decided; the "unsure zone" (e.g., 40–70% confidence) is routed to a human review queue.
- **Active learning:** feed human judgments back into training to strengthen the uncertainty region.
- **Appeals / feedback loop** for false positives.
- **Model:** CNN / ViT backbone fine-tuned on labeled unsafe content; multi-task heads per policy category.
- **Scale:** async pipeline — upload hits a queue; moderation runs off the critical path with a SLA. Cache decisions by image hash.
- **Monitoring:** category-level recall (sampled audits), reviewer queue depth, appeal rate.

---

## 12. Common Pitfalls & Senior Moves

**Pitfalls:**
- Jumping to a specific model before establishing metrics and data.
- Proposing one monolithic model when a multi-stage pipeline is expected.
- Forgetting latency budgets and how they constrain architecture.
- Ignoring cold start.
- Missing the feedback loop — clicks on recs → next model's training data.

**Senior moves:**
- Always state assumptions, then confirm.
- Name a **baseline** (existing system, heuristic, random).
- Discuss **calibration**, not just accuracy.
- Mention **load balancing** and **horizontal scaling**.
- Distinguish **FSDP** (LLM weights) from **embedding sharding / TorchRec** (RecSys tables).
- Explicitly call out **trade-offs** between two options and pick one.
- Think **APIs and services**, not Jupyter notebooks.
- Describe the **feedback loop** in one sentence.

---

## 13. Quick-Reference Checklists

### Before You Start Designing
- [ ] Who are the actors?
- [ ] What's the business goal?
- [ ] Latency budget?
- [ ] Scale (users, items, QPS)?
- [ ] What data is available, and what are the labels?
- [ ] Confirm assumptions with the interviewer.

### Data
- [ ] Sources (logs, DB, third-party).
- [ ] Labels (implicit vs explicit).
- [ ] Batch vs streaming paths.
- [ ] Feature store.
- [ ] Imbalance handling, negative sampling.
- [ ] Retention window.

### Model
- [ ] Heuristic / simple baseline first.
- [ ] Retrieval model (two-tower, MF, LR+hashing).
- [ ] Ranker (DeepFM, DCN, DNN).
- [ ] Re-ranking rules.
- [ ] Cold-start strategy.

### Training & Serving
- [ ] Offline training cadence.
- [ ] Incremental / online learning where relevant (FTRL).
- [ ] Embedding sharding / TorchRec for large tables.
- [ ] gRPC / FastAPI + load balancer.
- [ ] Vector DB for ANN retrieval.
- [ ] Redis for hot features.

### Evaluation
- [ ] Offline: LogLoss, PR-AUC, NDCG, calibration.
- [ ] Slice-based metrics.
- [ ] Delayed-feedback accounting.
- [ ] Online: A/B, shadow, canary, interleaving.

### Monitoring & Retraining
- [ ] CTR / target metric by cohort.
- [ ] Feature & prediction drift.
- [ ] Adversarial activity.
- [ ] Latency, error rate, fallback rate.
- [ ] Retraining cadence + trigger conditions.
- [ ] User cold-start vs item cold-start paths.

---

## 14. Common Interview Prompts

- Design a recommender system (videos, products, news feed).
- Design an Ad CTR predictor.
- Design harmful / inappropriate content moderation.
- Design a search ranker.
- Design personalized push notifications.
- Design a fraud detector (credit card).
- Design a spam classifier.
- Design a dynamic pricing system.

For any of these: same framework — requirements → data → model (multi-stage if scale demands it) → eval → monitoring — plus explicit treatment of cold start, the feedback loop, and latency.

---

*End of review.*
