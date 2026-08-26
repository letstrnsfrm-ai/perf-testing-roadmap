/**
 * Day 4: Cloud FinOps & Container Right-Sizing Analyzer
 * Ingests container telemetry metrics (p95/p99 CPU & RAM), identifies over-provisioned waste,
 * and generates right-sizing recommendations with projected cost savings.
 */

const fs = require('fs');
const path = require('path');

// Target headroom safety buffer over p99 peak: 25% buffer
const HEADROOM_BUFFER = 1.25;

function analyzeFinOps(dataFile) {
  const services = JSON.parse(fs.readFileSync(dataFile, 'utf8'));

  console.log(`\n💰 Cloud FinOps Resource Efficiency & Right-Sizing Audit`);
  console.log(`🛡️ Target Headroom Policy: p99 peak + 25% safety margin`);
  console.log(`-------------------------------------------------------------------------------------------------------`);
  console.log(`${'Service'.padEnd(28)} | ${'Allocated (CPU/RAM)'.padEnd(22)} | ${'p99 Peak'.padEnd(16)} | ${'Right-Sized'.padEnd(16)} | Monthly Savings`);
  console.log(`-------------------------------------------------------------------------------------------------------`);

  let totalCurrentCost = 0;
  let totalProjectedSavings = 0;

  for (const s of services) {
    totalCurrentCost += s.monthlyCostUsd;

    // Calculate recommended allocation: p99 * headroom
    const recCpu = Math.max(0.5, Math.ceil(s.usage.p99CpuCores * HEADROOM_BUFFER * 10) / 10);
    const recMem = Math.max(1.0, Math.ceil(s.usage.p99MemoryGb * HEADROOM_BUFFER));

    const cpuWastePct = ((1 - (s.usage.p99CpuCores / s.allocated.cpuCores)) * 100).toFixed(0);
    const memWastePct = ((1 - (s.usage.p99MemoryGb / s.allocated.memoryGb)) * 100).toFixed(0);
    const avgWastePct = (parseFloat(cpuWastePct) + parseFloat(memWastePct)) / 2;

    // Projected cost savings based on average resource reduction
    const savingsUsd = Math.round(s.monthlyCostUsd * (avgWastePct / 100) * 0.85); // 85% capture rate
    totalProjectedSavings += savingsUsd;

    const currentStr = `${s.allocated.cpuCores}c / ${s.allocated.memoryGb}GB`;
    const peakStr = `${s.usage.p99CpuCores}c / ${s.usage.p99MemoryGb}GB`;
    const recStr = `${recCpu}c / ${recMem}GB`;
    const savingsStr = `$${savingsUsd}/mo (-${avgWastePct.toFixed(0)}%)`;

    console.log(
      `${s.serviceName.padEnd(28)} | ${currentStr.padEnd(22)} | ${peakStr.padEnd(16)} | ${recStr.padEnd(16)} | ${savingsStr}`
    );
  }

  console.log(`-------------------------------------------------------------------------------------------------------`);
  const totalSavingsPct = ((totalProjectedSavings / totalCurrentCost) * 100).toFixed(1);
  console.log(`\n📊 FinOps Summary:`);
  console.log(`   💵 Current Monthly Spend: $${totalCurrentCost.toLocaleString()} USD / month ($${(totalCurrentCost * 12).toLocaleString()}/yr)`);
  console.log(`   📉 Projected Monthly Savings: $${totalProjectedSavings.toLocaleString()} USD / month ($${(totalProjectedSavings * 12).toLocaleString()}/yr)`);
  console.log(`   🚀 Overall Cloud Cost Reduction: ${totalSavingsPct}%`);
  console.log(`   💡 Action: Update Kubernetes resource requests/limits in Helm / Terraform values.`);

  return { totalCurrentCost, totalProjectedSavings, totalSavingsPct };
}

if (require.main === module) {
  const metricsFile = path.join(__dirname, 'sample-resource-metrics.json');
  analyzeFinOps(metricsFile);
}

module.exports = { analyzeFinOps };
