# 🔍 Day 2: Distributed Tracing & Bottleneck Audits

Capture OpenTelemetry spans, trace latency breakdowns across microservices, and pinpoint database lock contentions.

---

## 📋 Lab Objectives

1. Propagate standard W3C `traceparent` headers across microservice boundaries.
2. Ingest structured distributed trace JSON data with child spans.
3. Identify latency contribution per component and detect exclusive database locks.
4. Generate actionable remediation recommendations for engineering teams.

---

## 🛠️ Execution Commands

### Step 1: Execute Automated Trace Analyzer
```bash
node analyze-traces.js
```

### Step 2: Emit Live Traced HTTP Request
Ensure the mock server is running (`cd ../mock-server && node server.js`), then execute:
```bash
node otel-tracer.js
```
