/**
 * Performance Roadmap Mock Target Server
 * Zero-dependency Node.js HTTP server simulating realistic backend microservices.
 * Supports configurable latencies, CPU-bound workloads, DB lock contention,
 * chaos fault injection, and Prometheus-compatible metrics.
 */

const http = require('http');
const url = require('url');

const PORT = process.env.PORT || 3000;

// Internal state & chaos configuration
const state = {
  requestCount: 0,
  errorCount: 0,
  activeLocks: 0,
  chaos: {
    latencyMs: 0,
    errorRate: 0.0, // 0.0 to 1.0 (e.g. 0.2 = 20% errors)
    faultStatus: 500,
  },
  dbPool: {
    maxConnections: 10,
    activeConnections: 0,
    queue: [],
  },
};

// Sample mock diagrams payload
const mockDiagrams = [
  { id: 'diag-001', name: 'Microservices Architecture', category: 'Architecture', nodes: 14, updatedAt: '2026-08-20' },
  { id: 'diag-002', name: 'Event-Driven Kafka Pipeline', category: 'Messaging', nodes: 8, updatedAt: '2026-08-22' },
  { id: 'diag-003', name: 'Zero-Trust Identity Mesh', category: 'Security', nodes: 19, updatedAt: '2026-08-24' },
  { id: 'diag-004', name: 'Global Kubernetes Multi-Region', category: 'Infrastructure', nodes: 32, updatedAt: '2026-08-25' },
];

function sendJson(res, statusCode, data) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Transaction-Id',
  });
  res.end(JSON.stringify(data));
}

const server = http.createServer(async (req, res) => {
  state.requestCount++;
  const parsedUrl = url.parse(req.url, true);
  const { pathname, query } = parsedUrl;

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Transaction-Id',
    });
    res.end();
    return;
  }

  // 1. Chaos Simulation Layer
  if (state.chaos.errorRate > 0 && Math.random() < state.chaos.errorRate) {
    state.errorCount++;
    if (state.chaos.latencyMs > 0) {
      await new Promise((resolve) => setTimeout(resolve, state.chaos.latencyMs));
    }
    sendJson(res, state.chaos.faultStatus, {
      error: 'ChaosInjectionFault',
      message: 'Simulated downstream dependency failure injected by chaos engine',
      timestamp: new Date().toISOString(),
    });
    return;
  }

  if (state.chaos.latencyMs > 0) {
    await new Promise((resolve) => setTimeout(resolve, state.chaos.latencyMs));
  }

  // 2. Routing
  try {
    if (pathname === '/' || pathname === '/api/health') {
      // Fast baseline health endpoint
      sendJson(res, 200, {
        status: 'healthy',
        uptimeSeconds: Math.floor(process.uptime()),
        requestsProcessed: state.requestCount,
        timestamp: new Date().toISOString(),
      });
      return;
    }

    if (pathname === '/api/diagrams') {
      // Realistic API with optional jitter
      const delayMs = parseInt(query.delay || '15', 10);
      if (delayMs > 0) {
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      }
      sendJson(res, 200, {
        status: 'success',
        count: mockDiagrams.length,
        data: mockDiagrams,
      });
      return;
    }

    if (pathname === '/api/heavy-computation') {
      // CPU-intensive workload simulation
      const iterations = Math.min(parseInt(query.iterations || '15000', 10), 100000);
      let sum = 0;
      for (let i = 0; i < iterations; i++) {
        sum += Math.sqrt(i) * Math.sin(i);
      }
      sendJson(res, 200, {
        status: 'completed',
        iterations,
        resultCheck: sum.toFixed(4),
      });
      return;
    }

    if (pathname === '/api/db-lock') {
      // Simulated DB lock & connection contention
      const lockDuration = parseInt(query.lockTime || '120', 10);
      state.activeLocks++;
      await new Promise((resolve) => setTimeout(resolve, lockDuration));
      state.activeLocks--;

      sendJson(res, 200, {
        status: 'lock_released',
        waitedMs: lockDuration,
        activeContendingLocks: state.activeLocks,
      });
      return;
    }

    if (pathname === '/api/chaos/inject' && req.method === 'POST') {
      let body = '';
      req.on('data', (chunk) => { body += chunk; });
      req.on('end', () => {
        try {
          const config = JSON.parse(body || '{}');
          state.chaos.latencyMs = config.latencyMs || 0;
          state.chaos.errorRate = config.errorRate !== undefined ? config.errorRate : 0.0;
          state.chaos.faultStatus = config.faultStatus || 500;
          sendJson(res, 200, { status: 'chaos_configured', currentChaos: state.chaos });
        } catch (e) {
          sendJson(res, 400, { error: 'Invalid JSON payload' });
        }
      });
      return;
    }

    if (pathname === '/api/chaos/reset') {
      state.chaos = { latencyMs: 0, errorRate: 0.0, faultStatus: 500 };
      sendJson(res, 200, { status: 'chaos_reset', currentChaos: state.chaos });
      return;
    }

    if (pathname === '/metrics') {
      // Prometheus metrics format
      const mem = process.memoryUsage();
      const metrics = [
        '# HELP http_requests_total Total number of HTTP requests processed',
        '# TYPE http_requests_total counter',
        `http_requests_total ${state.requestCount}`,
        '# HELP http_requests_errors_total Total number of HTTP 5xx errors returned',
        '# TYPE http_requests_errors_total counter',
        `http_requests_errors_total ${state.errorCount}`,
        '# HELP process_active_db_locks Current active database locks',
        '# TYPE process_active_db_locks gauge',
        `process_active_db_locks ${state.activeLocks}`,
        '# HELP nodejs_heap_used_bytes Node.js process heap memory used',
        '# TYPE nodejs_heap_used_bytes gauge',
        `nodejs_heap_used_bytes ${mem.heapUsed}`,
      ].join('\n') + '\n';

      res.writeHead(200, { 'Content-Type': 'text/plain; version=0.0.4' });
      res.end(metrics);
      return;
    }

    // Default 404
    sendJson(res, 404, { error: 'EndpointNotFound', path: pathname });
  } catch (err) {
    state.errorCount++;
    sendJson(res, 500, { error: 'InternalServerError', message: err.message });
  }
});

if (require.main === module) {
  server.listen(PORT, () => {
    console.log(`[mock-server] Performance Target Server listening on http://localhost:${PORT}`);
    console.log(`[mock-server] Available endpoints:`);
    console.log(`  - GET  /api/health`);
    console.log(`  - GET  /api/diagrams?delay=15`);
    console.log(`  - GET  /api/heavy-computation?iterations=15000`);
    console.log(`  - GET  /api/db-lock?lockTime=120`);
    console.log(`  - POST /api/chaos/inject`);
    console.log(`  - GET  /api/chaos/reset`);
    console.log(`  - GET  /metrics`);
  });
}

module.exports = { server, state };
