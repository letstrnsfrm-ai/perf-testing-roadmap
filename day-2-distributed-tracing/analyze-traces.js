/**
 * Day 2: OpenTelemetry Trace Bottleneck Analyzer
 * Parses distributed trace JSON spans, calculates timeline latency contribution,
 * and pinpoints database locks and external network stalls.
 */

const fs = require('fs');
const path = require('path');

function analyzeTrace(traceFile) {
  const spans = JSON.parse(fs.readFileSync(traceFile, 'utf8'));
  const rootSpan = spans.find((s) => !s.parentSpanId) || spans[0];
  const totalDuration = rootSpan ? rootSpan.durationMs : 1;

  console.log(`\n🔍 Distributed Trace Analysis Report: [Trace ID: ${rootSpan.traceId}]`);
  console.log(`⏱️ Total Request Latency: ${totalDuration}ms`);
  console.log(`--------------------------------------------------------------------------------`);
  console.log(`${'Span Name'.padEnd(45)} | ${'Duration'.padEnd(10)} | ${'% Total'.padEnd(8)} | Status`);
  console.log(`--------------------------------------------------------------------------------`);

  const bottlenecks = [];

  for (const span of spans) {
    const pct = ((span.durationMs / totalDuration) * 100).toFixed(1);
    const isBottleneck = span.durationMs > 200 || (span.attributes && span.attributes.error);
    const status = isBottleneck ? '🚨 BOTTLENECK' : '✅ OK';

    console.log(
      `${span.name.padEnd(45)} | ${(span.durationMs + 'ms').padEnd(10)} | ${(pct + '%').padEnd(8)} | ${status}`
    );

    if (isBottleneck) {
      bottlenecks.push({
        spanId: span.spanId,
        name: span.name,
        durationMs: span.durationMs,
        pct: parseFloat(pct),
        service: span.attributes && span.attributes['service.name'],
        dbStatement: span.attributes && span.attributes['db.statement'],
        lockWaitMs: span.attributes && span.attributes['db.lock.waited_ms'],
        error: span.attributes && span.attributes['error.message'],
      });
    }
  }

  console.log(`--------------------------------------------------------------------------------`);
  console.log(`\n📋 Root Cause Diagnosis & Recommendation:`);
  for (const b of bottlenecks) {
    console.log(`⚠️  Service: [${b.service || 'unknown'}]`);
    console.log(`   Operation: ${b.name} took ${b.durationMs}ms (${b.pct}% of entire latency).`);
    if (b.lockWaitMs) {
      console.log(`   🔥 Database Lock Contention: Waited ${b.lockWaitMs}ms to acquire exclusive lock.`);
      console.log(`   💡 Fix: Convert table-level FOR UPDATE lock to optimistic row-level locking or read-committed isolation.`);
    }
    if (b.error) {
      console.log(`   ⚠️ Logged Error: ${b.error}`);
    }
  }

  return { rootSpan, totalDuration, bottlenecks };
}

if (require.main === module) {
  const tracePath = path.join(__dirname, 'sample-trace.json');
  analyzeTrace(tracePath);
}

module.exports = { analyzeTrace };
