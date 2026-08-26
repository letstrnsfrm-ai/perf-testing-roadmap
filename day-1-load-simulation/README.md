# 🚀 Day 1: Agent-Driven Load Simulation Setup

Generate high-throughput request scripts using k6 and Locust libraries with AI agents, define virtual user concurrency, and assert SLA threshold metrics.

---

## 📋 Lab Objectives

1. Configure virtual users (`vus`) and test `duration` in `k6-options.json`.
2. Generate and structure modular k6 and Locust test scripts.
3. Assert SLA performance thresholds:
   - `http_req_duration p(95) < 500ms`
   - `http_req_failed rate < 0.01` (less than 1% error rate)
4. Export structured telemetry metrics to `reports/load_metrics.json`.

---

## 🛠️ Execution Commands

### Step 1: Ensure Mock Target Server is Running
```bash
# In separate terminal:
cd ../mock-server
node server.js
```

### Step 2: Run k6 Load Test
```bash
k6 run --out json=reports/load_metrics.json load_test.js
```

### Step 3: Run Lightweight Node Runner (Alternative)
```bash
node run-simulation.js
```

### Step 4: Run Locust (Python Alternative)
```bash
locust -f locustfile.py --headless -u 10 -r 2 -t 10s --host http://localhost:3000
```
