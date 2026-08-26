/**
 * Day 2: OpenTelemetry Context Propagator & Span Generator
 * Demonstrates W3C traceparent header propagation across client load tests and downstream services.
 */

const crypto = require('crypto');
const http = require('http');

function generateTraceId() {
  return crypto.randomBytes(16).toString('hex');
}

function generateSpanId() {
  return crypto.randomBytes(8).toString('hex');
}

function createW3CTraceParent(traceId, parentSpanId) {
  // Version 00, traceId (32 hex), parentSpanId (16 hex), flags 01 (sampled)
  return `00-${traceId}-${parentSpanId}-01`;
}

async function executeTracedRequest(targetUrl) {
  const traceId = generateTraceId();
  const rootSpanId = generateSpanId();
  const traceParent = createW3CTraceParent(traceId, rootSpanId);

  console.log(`[OTel Tracer] Emitting request with traceparent: ${traceParent}`);

  return new Promise((resolve, reject) => {
    const options = {
      headers: {
        'traceparent': traceParent,
        'X-Transaction-Id': traceId,
      },
    };

    const start = Date.now();
    http.get(targetUrl, options, (res) => {
      let body = '';
      res.on('data', (c) => (body += c));
      res.on('end', () => {
        const duration = Date.now() - start;
        console.log(`[OTel Tracer] Span completed: ${targetUrl} [${res.statusCode}] in ${duration}ms`);
        resolve({ traceId, spanId: rootSpanId, statusCode: res.statusCode, duration });
      });
    }).on('error', reject);
  });
}

if (require.main === module) {
  executeTracedRequest('http://localhost:3000/api/diagrams?delay=20')
    .then((result) => console.log('Trace Result:', result))
    .catch((err) => console.error('Tracer error (ensure mock server is running):', err.message));
}

module.exports = { generateTraceId, generateSpanId, createW3CTraceParent, executeTracedRequest };
