/**
 * Day 5: CI/CD Performance Regression Gate Evaluator
 * Compares current benchmark metrics against baseline metrics and enforces strict SLA gates.
 * Exits with code 0 if all gates pass; exits with code 1 to break the build if SLA is breached.
 */

const fs = require('fs');
const path = require('path');

function parseArgs() {
  const args = process.argv.slice(2);
  const params = {
    current: null,
    baseline: null,
    maxP95Ms: 500,
    maxLatencyDriftPct: 20, // Max allowed latency regression vs baseline: 20%
    maxErrorRate: 0.01,     // 1% max error rate
  };

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--current' && args[i + 1]) params.current = args[++i];
    if (args[i] === '--baseline' && args[i + 1]) params.baseline = args[++i];
    if (args[i] === '--max-p95-ms' && args[i + 1]) params.maxP95Ms = parseFloat(args[++i]);
    if (args[i] === '--max-latency-drift-pct' && args[i + 1]) params.maxLatencyDriftPct = parseFloat(args[++i]);
    if (args[i] === '--max-error-rate' && args[i + 1]) params.maxErrorRate = parseFloat(args[++i]);
  }

  return params;
}

function evaluateGate() {
  const params = parseArgs();
  const currentPath = params.current
    ? path.resolve(params.current)
    : path.join(__dirname, '../day-1-load-simulation/reports/load_metrics.json');
  const baselinePath = params.baseline
    ? path.resolve(params.baseline)
    : path.join(__dirname, 'baseline-metrics.json');

  if (!fs.existsSync(currentPath)) {
    console.error(`❌ Current metrics report not found at: ${currentPath}`);
    console.error(`💡 Tip: Run 'node run-simulation.js' or 'k6 run load_test.js' first.`);
    process.exit(1);
  }

  if (!fs.existsSync(baselinePath)) {
    console.error(`❌ Baseline metrics not found at: ${baselinePath}`);
    process.exit(1);
  }

  const current = JSON.parse(fs.readFileSync(currentPath, 'utf8'));
  const baseline = JSON.parse(fs.readFileSync(baselinePath, 'utf8'));

  const curP95 = current.metrics?.http_req_duration?.p95 || 0;
  const curAvg = current.metrics?.http_req_duration?.avg || 0;
  const curErrorRate = current.metrics?.http_req_failed?.rate || 0;

  const baseP95 = baseline.metrics?.http_req_duration?.p95 || 1;
  const baseAvg = baseline.metrics?.http_req_duration?.avg || 1;

  const p95DriftPct = (((curP95 - baseP95) / baseP95) * 100).toFixed(1);
  const avgDriftPct = (((curAvg - baseAvg) / baseAvg) * 100).toFixed(1);

  console.log(`\n🚦 ==================== CI/CD PERFORMANCE REGRESSION GATE ====================`);
  console.log(`⏱️ Current P95: ${curP95}ms | Baseline P95: ${baseP95}ms (Drift: ${p95DriftPct}%)`);
  console.log(`⏱️ Current Avg: ${curAvg}ms | Baseline Avg: ${baseAvg}ms (Drift: ${avgDriftPct}%)`);
  console.log(`⚠️ Error Rate: ${(curErrorRate * 100).toFixed(2)}% (Max Allowed: ${(params.maxErrorRate * 100).toFixed(1)}%)`);
  console.log(`--------------------------------------------------------------------------------`);

  const checks = [];

  // Gate 1: Absolute P95 SLA Ceiling
  const gate1Pass = curP95 <= params.maxP95Ms;
  checks.push({
    gate: `Absolute P95 Latency <= ${params.maxP95Ms}ms`,
    actual: `${curP95}ms`,
    passed: gate1Pass,
  });

  // Gate 2: Relative P95 Drift vs Baseline
  const gate2Pass = parseFloat(p95DriftPct) <= params.maxLatencyDriftPct;
  checks.push({
    gate: `P95 Regression Drift <= +${params.maxLatencyDriftPct}%`,
    actual: `${p95DriftPct}%`,
    passed: gate2Pass,
  });

  // Gate 3: Error Rate SLA
  const gate3Pass = curErrorRate <= params.maxErrorRate;
  checks.push({
    gate: `Error Rate <= ${(params.maxErrorRate * 100).toFixed(1)}%`,
    actual: `${(curErrorRate * 100).toFixed(2)}%`,
    passed: gate3Pass,
  });

  let allPassed = true;
  for (const c of checks) {
    const statusIcon = c.passed ? '✅ PASSED' : '❌ FAILED (BUILD BREAK)';
    console.log(`  ${c.gate.padEnd(45)} | Actual: ${c.actual.padEnd(10)} | ${statusIcon}`);
    if (!c.passed) allPassed = false;
  }

  console.log(`================================================================================`);

  if (allPassed) {
    console.log(`🎉 ALL PERFORMANCE GATES PASSED! Pipeline green to proceed with deployment.\n`);
    process.exit(0);
  } else {
    console.error(`💥 PERFORMANCE REGRESSION DETECTED! Pull Request blocked by Quality Gate.\n`);
    process.exit(1);
  }
}

if (require.main === module) {
  evaluateGate();
}

module.exports = { evaluateGate };
