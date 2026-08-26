# 🌪️ Day 6: Chaos Engineering & Resiliency Audits

Simulate network latency, 500 error bursts, and database locks under active load to verify graceful degradation and recovery.

---

## 📋 Lab Objectives

1. Model chaos failure scenarios in `chaos-scenarios.json`.
2. Inject controlled fault injections and latency degradations via the mock API.
3. Observe system behavior across 3 distinct lifecycle phases:
   - **Phase 1: Baseline** (Healthy SLO verification)
   - **Phase 2: Injected Chaos** (Tolerance & error boundary verification)
   - **Phase 3: Recovery** (Autonomous restoration check)

---

## 🛠️ Execution Commands

### Step 1: Ensure Mock Target Server is Running
```bash
cd ../mock-server
node server.js
```

### Step 2: Run Automated 3-Phase Chaos Experiment
```bash
node chaos-load.js
```
