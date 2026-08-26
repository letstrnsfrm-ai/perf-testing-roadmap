/**
 * Day 4: Local Resource Metrics Sampler
 * Samples Node.js memory and CPU usage over a short period to demonstrate telemetry ingestion.
 */

function sampleLocalMetrics(samples = 5, intervalMs = 500) {
  console.log(`[Metrics Collector] Sampling local process resource consumption (${samples} samples)...`);
  let count = 0;
  const memorySnapshots = [];

  const timer = setInterval(() => {
    const mem = process.memoryUsage();
    const cpu = process.cpuUsage();
    memorySnapshots.push(mem.heapUsed / (1024 * 1024));
    count++;

    console.log(`  Sample #${count}: Heap Used = ${(mem.heapUsed / (1024 * 1024)).toFixed(2)} MB | RSS = ${(mem.rss / (1024 * 1024)).toFixed(2)} MB`);

    if (count >= samples) {
      clearInterval(timer);
      const avgMem = (memorySnapshots.reduce((a, b) => a + b, 0) / memorySnapshots.length).toFixed(2);
      const maxMem = Math.max(...memorySnapshots).toFixed(2);
      console.log(`[Metrics Collector] Completed: Avg Heap = ${avgMem} MB, Max Heap = ${maxMem} MB`);
    }
  }, intervalMs);
}

if (require.main === module) {
  sampleLocalMetrics();
}

module.exports = { sampleLocalMetrics };
