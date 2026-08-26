# 📈 Day 3: Resource Auto-Scaling Policy Verification

Validate Kubernetes Horizontal Pod Autoscaler (HPA) policies, generate staged stepped load ramp-ups, and assert scale-up and scale-down thresholds.

---

## 📋 Lab Objectives

1. Define Kubernetes HPA manifest rules (`hpa-manifest.yaml`) with CPU (70%) and Memory (80%) utilization targets.
2. Execute multi-stage k6 step load testing (`step-load.js`) simulating sudden traffic surges.
3. Validate HPA replica calculation algorithm against empirical telemetry metrics.

---

## 🛠️ Execution Commands

### Step 1: Run HPA Policy Verifier
```bash
node verify-scaling.js
```

### Step 2: Run k6 Stepped Load Simulation
Ensure the mock server is running (`cd ../mock-server && node server.js`), then run:
```bash
k6 run step-load.js
```
