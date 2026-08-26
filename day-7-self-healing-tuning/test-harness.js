/**
 * Day 7: Workload Simulation Test Harness for Self-Healing Loop
 * Simulates microservice throughput and latency given different thread/connection pool configurations.
 */

function evaluateConfiguration(poolSize, cacheTtlSec) {
  // Realistic non-linear throughput curve:
  // - Too small pool (1-5): Bottleneck, low throughput, high queue latency
  // - Sweet spot pool (15-35): High throughput, low latency
  // - Over-allocated pool (>50): Context switching penalty, memory contention
  const optimalPool = 25;
  const poolEfficiency = Math.max(0.1, 1 - Math.abs(poolSize - optimalPool) / 40);
  const cacheHitRatio = Math.min(0.95, 0.4 + (cacheTtlSec / 120) * 0.5);

  const baseThroughputRps = 150;
  const throughputRps = Math.round(baseThroughputRps * poolEfficiency * (1 + cacheHitRatio * 0.8));
  const baseLatencyMs = 60;
  const latencyP95Ms = Math.round((baseLatencyMs / poolEfficiency) * (1 - cacheHitRatio * 0.4));

  return {
    poolSize,
    cacheTtlSec,
    throughputRps,
    latencyP95Ms,
    cacheHitRatio: (cacheHitRatio * 100).toFixed(1) + '%',
    score: throughputRps / Math.max(1, latencyP95Ms), // Efficiency score: RPS per ms
  };
}

module.exports = { evaluateConfiguration };
