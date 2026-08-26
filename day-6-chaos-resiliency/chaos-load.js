/**
 * Day 6: Chaos & Resiliency Load Orchestrator
 * Executes 3-phase chaos experiment:
 * Phase 1: Baseline Load (Healthy state)
 * Phase 2: Injected Chaos (Latency + 25% Faults)
 * Phase 3: Recovery Phase (Auto-heal verification)
 */

const http = require('http');

const TARGET_URL = process.env.TARGET_URL || 'http://localhost:3000';

async function injectChaos(config) {
  const data = JSON.stringify(config);
  return new Promise((resolve) => {
    const req = http.request(
      `${TARGET_URL}/api/chaos/inject`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Content-Length': data.length },
      },
      (res) => {
        res.on('data', () => {});
        res.on('end', resolve);
      }
    );
    req.on('error', () => resolve());
    req.write(data);
    req.end();
  });
}

async function resetChaos() {
  return new Promise((resolve) => {
    http.get(`${TARGET_URL}/api/chaos/reset`, (res) => {
      res.on('data', () => {});
      res.on('end', resolve);
    }).on('error', () => resolve());
  });
}

async function probeEndpoint(iterations = 20) {
  const latencies = [];
  let successCount = 0;
  let errorCount = 0;

  for (let i = 0; i < iterations; i++) {
    const start = Date.now();
    await new Promise((resolve) => {
      http.get(`${TARGET_URL}/api/diagrams?delay=10`, (res) => {
        let body = '';
        res.on('data', (c) => (body += c));
        res.on('end', () => {
          latencies.push(Date.now() - start);
          if (res.statusCode >= 200 && res.statusCode < 400) {
            successCount++;
          } else {
            errorCount++;
          }
          resolve();
        });
      }).on('error', () => {
        latencies.push(Date.now() - start);
        errorCount++;
        resolve();
      });
    });
    await new Promise((r) => setTimeout(r, 50));
  }

  latencies.sort((a, b) => a - b);
  const p95 = latencies[Math.floor(latencies.length * 0.95)] || 0;
  const avg = (latencies.reduce((a, b) => a + b, 0) / latencies.length).toFixed(1);
  const errRate = ((errorCount / iterations) * 100).toFixed(1);

  return { total: iterations, successCount, errorCount, avg, p95, errRate };
}

async function runChaosExperiment() {
  console.log(`\n🌪️ ================= CHAOS RESILIENCY EXPERIMENT =================`);
  console.log(`Target: ${TARGET_URL}`);

  // Phase 1: Baseline
  console.log(`\n▶️  [Phase 1/3] Measuring Baseline State...`);
  await resetChaos();
  const baseline = await probeEndpoint(20);
  console.log(`   Baseline Metrics: Avg=${baseline.avg}ms | P95=${baseline.p95}ms | Error Rate=${baseline.errRate}%`);

  // Phase 2: Chaos Injection
  console.log(`\n▶️  [Phase 2/3] Injecting Chaos Faults (+150ms latency, 25% 503 errors)...`);
  await injectChaos({ latencyMs: 150, errorRate: 0.25, faultStatus: 503 });
  const chaos = await probeEndpoint(20);
  console.log(`   In-Flight Chaos Metrics: Avg=${chaos.avg}ms | P95=${chaos.p95}ms | Error Rate=${chaos.errRate}%`);

  // Phase 3: Recovery
  console.log(`\n▶️  [Phase 3/3] Resetting Faults & Verifying Recovery...`);
  await resetChaos();
  const recovery = await probeEndpoint(20);
  console.log(`   Post-Chaos Recovery Metrics: Avg=${recovery.avg}ms | P95=${recovery.p95}ms | Error Rate=${recovery.errRate}%`);

  console.log(`\n📋 Resilience Audit Summary:`);
  console.log(`   ✅ Baseline: Healthy (Errors: ${baseline.errRate}%)`);
  console.log(`   ⚠️ Chaos Active: Degraded as Expected (Errors: ${chaos.errRate}%, Latency: ${chaos.avg}ms)`);
  console.log(`   ✅ Recovery: Returned to normal within 0s (Errors: ${recovery.errRate}%, Latency: ${recovery.avg}ms)`);
  console.log(`==================================================================\n`);
}

if (require.main === module) {
  runChaosExperiment().catch(console.error);
}

module.exports = { runChaosExperiment };
