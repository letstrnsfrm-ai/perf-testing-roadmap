# ⚡ Performance Engineering & Load Testing (k6) — 7-Day Sprint

Welcome to the official reference codebase for the **Performance Engineering & Load Testing (k6)** course track on [letustransform.com](https://www.letustransform.com) ([Interactive Roadmaps](https://www.letustransform.com/roadmaps) · [QE Strategy Docs](https://www.letustransform.com/docs)).

This standalone repository contains verified, production-ready load testing scripts (k6, Locust), OpenTelemetry tracing analyzers, Kubernetes auto-scaling policies, Cloud FinOps profilers, automated CI/CD performance regression gates, chaos resilience test suites, and autonomous self-healing tuning loops across all 7 days of the hands-on sprint.

---

## 🗺️ 7-Day Curriculum & Learning Matrix

| Day | Topic & Focus Area | Directory | Key Concepts & Tools | Interactive Playbook |
| :---: | :--- | :--- | :--- | :---: |
| **Day 1** | Agent-Driven Load Simulation Setup | [`day-1-load-simulation`](./day-1-load-simulation/) | k6 virtual users (`vus`), duration, SLA thresholds (`p(95)<500ms`), Locust baseline | [Day 1 Playbook](https://www.letustransform.com/episodes/perf-day-1) |
| **Day 2** | Distributed Tracing & Bottleneck Audits | [`day-2-distributed-tracing`](./day-2-distributed-tracing/) | OpenTelemetry spans, trace latency breakdown, database lock contention analysis | [Day 2 Playbook](https://www.letustransform.com/episodes/perf-day-2) |
| **Day 3** | Resource Auto-Scaling Policy Verification | [`day-3-autoscaling-verification`](./day-3-autoscaling-verification/) | Kubernetes HPA rules, step-up load generation, scale-up/scale-down threshold verification | [Day 3 Playbook](https://www.letustransform.com/episodes/perf-day-3) |
| **Day 4** | Cloud FinOps & Idle Resource Profiling | [`day-4-finops-profiling`](./day-4-finops-profiling/) | P95/P99 CPU & Memory usage vs allocation, right-sizing algorithms, cost-performance ratio | [Day 4 Playbook](https://www.letustransform.com/episodes/perf-day-4) |
| **Day 5** | Performance Regression Gates in CI/CD | [`day-5-cicd-regression-gates`](./day-5-cicd-regression-gates/) | GitHub Actions, Azure DevOps pipelines, automated baseline comparison, build failure traps | [Day 5 Playbook](https://www.letustransform.com/episodes/perf-day-5) |
| **Day 6** | Chaos Engineering & Resiliency Audits | [`day-6-chaos-resiliency`](./day-6-chaos-resiliency/) | Fault injection (latency, 500 error bursts, connection drops), resiliency under load, SLO degradation | [Day 6 Playbook](https://www.letustransform.com/episodes/perf-day-6) |
| **Day 7** | Self-Healing Performance Tuning Loops | [`day-7-self-healing-tuning`](./day-7-self-healing-tuning/) | Autonomous optimization feedback loop, dynamic thread/connection pool & cache tuning | [Day 7 Playbook](https://www.letustransform.com/episodes/perf-day-7) |

---

## 🧰 Prerequisites & Requirements

Before running the labs locally, ensure the following CLI tools are available:

- **Node.js**: `v18.0.0+` (Runs the built-in mock server and analysis tools)
- **k6 CLI**: `v0.45.0+` (Download via `brew install k6` on macOS, `choco install k6` or `winget install k6` on Windows, or official Linux apt packages)
- **Python (Optional for Locust)**: `v3.9+` (`pip install locust`)

---

## 🚀 Quick Start Guide

### 1. Clone the Repository
```bash
git clone https://github.com/letstrnsfrm-ai/perf-testing-roadmap.git
cd perf-testing-roadmap
```

### 2. Start the Built-in Mock Target Server
In a dedicated terminal window:
```bash
cd mock-server
npm install
npm start
# Server listens at http://localhost:3000 (endpoints: /api/health, /api/diagrams, /api/heavy-computation, /api/db-lock, /api/chaos/inject, /metrics)
```

### 3. Run a Daily Lab
For example, to run the **Day 1 Load Simulation** lab:
```bash
cd ../day-1-load-simulation
k6 run load_test.js
```

Or run the **Day 5 CI/CD Performance Regression Gate**:
```bash
cd ../day-5-cicd-regression-gates
node perf-gate.js --current reports/current-metrics.json --baseline baseline-metrics.json --max-p95-ms 500 --max-error-rate 0.01
```

---

## 🛡️ Enterprise Production Context

Each daily lab directory is modeled after real-world enterprise performance engineering standards:
- **SLA & SLO Enforcement**: Explicit p95/p99 latency ceilings and error rate budgets defined as code.
- **Root Cause Tracing**: Correlating load test transaction IDs with distributed OpenTelemetry spans to isolate database lock contentions.
- **FinOps Optimization**: Preventing over-provisioning waste by computing empirical resource headroom vs p99 peak utilization.
- **Fail-Safe CI/CD Gates**: Automated build blocking when code changes introduce latency shifts or memory leaks.

---

## 🔗 Resources & Playbooks
- 🌐 Interactive Web Portal: [letustransform.com](https://www.letustransform.com)
- 📚 Full Roadmaps & Episodes: [letustransform.com/roadmaps](https://www.letustransform.com/roadmaps)
- 📖 QE Strategy & Architecture Docs: [letustransform.com/docs](https://www.letustransform.com/docs)
