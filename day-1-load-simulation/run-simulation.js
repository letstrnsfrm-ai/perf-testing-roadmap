/**
 * Cross-platform runner simulating k6 load test execution and generating JSON metrics.
 * Useful for local verification or automated CI pipelines without requiring binary installation.
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

const config = JSON.parse(fs.readFileSync(path.join(__dirname, 'k6-options.json'), 'utf8'));
const TARGET_URL = process.env.TARGET_URL || 'http://localhost:3000';
const VUS = config.vus || 10;
const DURATION_SEC = 5;

async function makeRequest(endpoint) {
  const start = Date.now();
  return new Promise((resolve) => {
    http.get(`${TARGET_URL}${endpoint}`, (res) => {
      let data = '';
      res.on('data', (c) => (data += c));
      res.on('end', () => {
        const duration = Date.now() - start;
        resolve({ statusCode: res.statusCode, duration, ok: res.statusCode >= 200 && res.statusCode < 400 });
      });
    }).on('error', (err) => {
      resolve({ statusCode: 500, duration: Date.now() - start, ok: false, error: err.message });
    });
  });
}

async function runSimulation() {
  console.log(`[Day 1 Simulation] Starting load test with ${VUS} VUs for ${DURATION_SEC}s against ${TARGET_URL}...`);
  const latencies = [];
  let totalRequests = 0;
  let failedRequests = 0;

  const endTime = Date.now() + DURATION_SEC * 1000;
  const workers = Array.from({ length: VUS }, async () => {
    while (Date.now() < endTime) {
      const healthRes = await makeRequest('/api/health');
      latencies.push(healthRes.duration);
      totalRequests++;
      if (!healthRes.ok) failedRequests++;

      const diagRes = await makeRequest('/api/diagrams?delay=10');
      latencies.push(diagRes.duration);
      totalRequests++;
      if (!diagRes.ok) failedRequests++;

      await new Promise((r) => setTimeout(r, 100));
    }
  });

  await Promise.all(workers);

  latencies.sort((a, b) => a - b);
  const p95Index = Math.floor(latencies.length * 0.95);
  const p99Index = Math.floor(latencies.length * 0.99);
  const avg = (latencies.reduce((a, b) => a + b, 0) / (latencies.length || 1)).toFixed(2);
  const p95 = latencies[p95Index] || 0;
  const p99 = latencies[p99Index] || 0;
  const errorRate = ((failedRequests / (totalRequests || 1)) * 100).toFixed(2);

  const report = {
    timestamp: new Date().toISOString(),
    vus: VUS,
    durationSeconds: DURATION_SEC,
    totalRequests,
    failedRequests,
    errorRatePercent: parseFloat(errorRate),
    metrics: {
      http_req_duration: {
        avg: parseFloat(avg),
        p95: p95,
        p99: p99,
        min: latencies[0] || 0,
        max: latencies[latencies.length - 1] || 0,
      },
      http_req_failed: {
        rate: failedRequests / (totalRequests || 1),
      },
    },
    thresholds: {
      'http_req_duration p(95)<500': p95 < 500 ? 'PASSED' : 'FAILED',
      'http_req_failed rate<0.01': parseFloat(errorRate) < 1.0 ? 'PASSED' : 'FAILED',
    },
  };

  const reportsDir = path.join(__dirname, 'reports');
  if (!fs.existsSync(reportsDir)) fs.mkdirSync(reportsDir, { recursive: true });
  const reportPath = path.join(reportsDir, 'load_metrics.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

  console.log(`[Day 1 Simulation] Completed! Total Requests: ${totalRequests} | p95: ${p95}ms | Errors: ${errorRate}%`);
  console.log(`[Day 1 Simulation] Report saved to: ${reportPath}`);
}

if (require.main === module) {
  runSimulation().catch(console.error);
}

module.exports = { runSimulation };
