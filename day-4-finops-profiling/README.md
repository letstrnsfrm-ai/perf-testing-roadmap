# 💰 Day 4: Cloud FinOps & Idle Resource Profiling

Analyze cloud resource utilization across containers, identify over-provisioning waste, compute safe p99 headroom, and output right-sizing recommendations.

---

## 📋 Lab Objectives

1. Ingest multi-service cloud resource metrics (`sample-resource-metrics.json`).
2. Calculate empirical waste ratios between allocated vs p99 peak CPU and memory.
3. Compute safe right-sized resource requests (`p99 * 1.25` safety margin).
4. Generate actionable FinOps cost reduction reports.

---

## 🛠️ Execution Commands

### Step 1: Run FinOps Resource Right-Sizer
```bash
node finops-analyzer.js
```

### Step 2: Sample Local Resource Metrics
```bash
node metrics-collector.js
```
