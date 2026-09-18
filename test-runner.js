/**
 * Master Test Runner & Empirical Lab Verifier for perf-testing-roadmap (Days 1–7).
 * Automatically handles mock-server lifecycle, runs day-wise verification scripts,
 * and asserts 100% success across the complete curriculum.
 */

const { spawn, execSync } = require('child_process');
const http = require('http');
const path = require('path');

const REPO_ROOT = __dirname;
const MOCK_SERVER_PORT = process.env.PORT || 3000;
const HEALTH_URL = `http://localhost:${MOCK_SERVER_PORT}/api/health`;

function waitForServer(timeoutMs = 8000) {
  const startTime = Date.now();
  return new Promise((resolve, reject) => {
    const check = () => {
      http.get(HEALTH_URL, (res) => {
        if (res.statusCode === 200) {
          return resolve();
        }
        retry();
      }).on('error', () => {
        retry();
      });
    };

    const retry = () => {
      if (Date.now() - startTime > timeoutMs) {
        return reject(new Error(`Timed out waiting for mock server at ${HEALTH_URL}`));
      }
      setTimeout(check, 250);
    };

    check();
  });
}

async function runMasterSuite() {
  console.log('================================================================================');
  console.log('⚡ STARTING EMPIRICAL AUDIT: AI-Driven Performance & FinOps Track (Days 1–7)');
  console.log('================================================================================\n');

  let mockServerProcess = null;

  try {
    // 1. Check if mock server is already running, or start it
    let serverAlreadyRunning = false;
    try {
      await waitForServer(1000);
      serverAlreadyRunning = true;
      console.log('ℹ️ Mock target server already running on port ' + MOCK_SERVER_PORT);
    } catch {
      console.log('🚀 Spawning mock target server on port ' + MOCK_SERVER_PORT + '...');
      mockServerProcess = spawn('node', [path.join(REPO_ROOT, 'mock-server', 'server.js')], {
        stdio: 'inherit',
        env: { ...process.env, PORT: String(MOCK_SERVER_PORT) }
      });
      await waitForServer(8000);
      console.log('✅ Mock target server healthy and responding.\n');
    }

    const labSteps = [
      {
        day: 1,
        name: 'Agent-Driven Load Simulation Setup',
        cwd: path.join(REPO_ROOT, 'day-1-load-simulation'),
        cmd: 'node run-simulation.js',
      },
      {
        day: 2,
        name: 'Distributed Tracing & Bottleneck Audits',
        cwd: path.join(REPO_ROOT, 'day-2-distributed-tracing'),
        cmd: 'node analyze-traces.js',
      },
      {
        day: 3,
        name: 'Resource Auto-Scaling Policy Verification (HPA)',
        cwd: path.join(REPO_ROOT, 'day-3-autoscaling-verification'),
        cmd: 'node verify-scaling.js',
      },
      {
        day: 4,
        name: 'Cloud FinOps & Idle Resource Profiling',
        cwd: path.join(REPO_ROOT, 'day-4-finops-profiling'),
        cmd: 'node finops-analyzer.js',
      },
      {
        day: 5,
        name: 'Performance Regression Gates in CI/CD',
        cwd: path.join(REPO_ROOT, 'day-5-cicd-regression-gates'),
        cmd: 'node perf-gate.js --current baseline-metrics.json --baseline baseline-metrics.json --max-p95-ms 500 --max-error-rate 0.01',
      },
      {
        day: 6,
        name: 'Chaos Engineering & Resiliency Audits',
        cwd: path.join(REPO_ROOT, 'day-6-chaos-resiliency'),
        cmd: 'node chaos-load.js',
      },
      {
        day: 7,
        name: 'Autonomous Self-Healing Performance Tuning Loops',
        cwd: path.join(REPO_ROOT, 'day-7-self-healing-tuning'),
        cmd: 'node tuning-loop.js',
      },
    ];

    const results = [];

    for (const lab of labSteps) {
      console.log(`--------------------------------------------------------------------------------`);
      console.log(`▶️  Executing Day ${lab.day}: ${lab.name}`);
      console.log(`    Command: ${lab.cmd}`);
      console.log(`--------------------------------------------------------------------------------`);
      const start = Date.now();
      try {
        execSync(lab.cmd, {
          cwd: lab.cwd,
          stdio: 'inherit',
          env: { ...process.env, TARGET_URL: `http://localhost:${MOCK_SERVER_PORT}` }
        });
        const durationMs = Date.now() - start;
        results.push({ day: lab.day, name: lab.name, status: 'PASSED', durationMs });
        console.log(`✅ Day ${lab.day} verified successfully (${durationMs}ms)\n`);
      } catch (err) {
        const durationMs = Date.now() - start;
        results.push({ day: lab.day, name: lab.name, status: 'FAILED', durationMs, error: err.message });
        console.error(`❌ Day ${lab.day} failed after ${durationMs}ms:`, err.message);
        throw err;
      }
    }

    console.log('================================================================================');
    console.log('🏆 EMPIRICAL AUDIT SUMMARY: ALL 7 DAYS PASSED (100% SUCCESS RATE)');
    console.log('================================================================================');
    for (const r of results) {
      console.log(`  [Day ${r.day}] ${r.status} (${r.durationMs}ms) - ${r.name}`);
    }
    console.log('================================================================================\n');

  } finally {
    if (mockServerProcess) {
      console.log('🛑 Shutting down spawned mock target server...');
      mockServerProcess.kill('SIGTERM');
    }
  }
}

if (require.main === module) {
  runMasterSuite().catch((err) => {
    console.error('\n💥 Suite execution terminated with errors:', err.message);
    process.exit(1);
  });
}

module.exports = { runMasterSuite };
