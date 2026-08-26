# 🎯 Performance Testing Mock Server

A lightweight, zero-dependency Node.js HTTP server designed as the target microservice for all 7 days of performance testing, load simulation, distributed tracing, and chaos engineering labs.

---

## ⚡ Quick Start

```bash
cd mock-server
node server.js
```

The server starts instantly on `http://localhost:3000` (or the port defined in `PORT=...`).

---

## 📡 Endpoints Overview

| Endpoint | Method | Purpose | Query Parameters / Body |
| :--- | :---: | :--- | :--- |
| `/api/health` | `GET` | Instant health check (<2ms baseline) | None |
| `/api/diagrams` | `GET` | Microservice data fetching with configurable latency | `?delay=15` (delay in ms) |
| `/api/heavy-computation` | `GET` | CPU-intensive mathematical workload simulation | `?iterations=15000` |
| `/api/db-lock` | `GET` | Database lock contention & thread pool exhaustion | `?lockTime=120` (lock duration in ms) |
| `/api/chaos/inject` | `POST` | Dynamic fault and latency injector | `{"latencyMs": 200, "errorRate": 0.2, "faultStatus": 500}` |
| `/api/chaos/reset` | `GET` | Clears all chaos injection settings | None |
| `/metrics` | `GET` | Prometheus-compatible performance metrics | None |
