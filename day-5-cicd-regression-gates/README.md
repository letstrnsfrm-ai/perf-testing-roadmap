# 🚦 Day 5: Performance Regression Gates in CI/CD

Integrate automated load tests and performance regression gates into GitHub Actions and Azure DevOps pipelines, preventing performance regressions from reaching production.

---

## 📋 Lab Objectives

1. Ingest production performance baselines (`baseline-metrics.json`).
2. Execute automated pull request load tests.
3. Assert multi-dimensional quality gates (Absolute P95 SLA, regression drift percentage, error rate ceiling).
4. Automate pipeline breaks (`exit 1`) when performance degrades.

---

## 🛠️ Execution Commands

### Step 1: Run Quality Gate Evaluator Locally
```bash
node perf-gate.js \
  --current ../day-1-load-simulation/reports/load_metrics.json \
  --baseline baseline-metrics.json \
  --max-p95-ms 500 \
  --max-latency-drift-pct 30 \
  --max-error-rate 0.01
```

### Step 2: Test a Breached Gate (Forcing Build Break)
```bash
node perf-gate.js \
  --current ../day-1-load-simulation/reports/load_metrics.json \
  --baseline baseline-metrics.json \
  --max-p95-ms 10 # Artificially tight SLA to verify failure trap
```
