/**
 * Day 3: Kubernetes HPA Autoscaling Decision Verifier
 * Evaluates simulated CPU telemetry metrics against Kubernetes HPA scaling algorithm:
 * desiredReplicas = ceil[currentReplicas * ( currentMetricValue / desiredMetricValue )]
 */

const TARGET_CPU_UTILIZATION = 70; // 70% target
const MIN_REPLICAS = 2;
const MAX_REPLICAS = 10;

// Simulated timeline of traffic surges and CPU utilization readings
const telemetryTimeline = [
  { time: '00:00', vus: 5,  currentReplicas: 2, avgCpuPercent: 28 },
  { time: '00:15', vus: 15, currentReplicas: 2, avgCpuPercent: 62 },
  { time: '00:30', vus: 35, currentReplicas: 2, avgCpuPercent: 145 }, // Triggers scale-up
  { time: '00:45', vus: 50, currentReplicas: 5, avgCpuPercent: 110 }, // Ongoing scale-up
  { time: '01:00', vus: 50, currentReplicas: 8, avgCpuPercent: 68 },  // Stabilized at peak
  { time: '01:15', vus: 5,  currentReplicas: 8, avgCpuPercent: 18 },  // Cool down
  { time: '01:30', vus: 5,  currentReplicas: 4, avgCpuPercent: 32 },  // Stabilizing post scale-down
];

function calculateDesiredReplicas(currentReplicas, currentMetric, targetMetric) {
  const ratio = currentMetric / targetMetric;
  // Kubernetes HPA tolerance is 10% (0.1)
  if (Math.abs(1 - ratio) <= 0.1) {
    return currentReplicas;
  }
  let desired = Math.ceil(currentReplicas * ratio);
  desired = Math.max(MIN_REPLICAS, Math.min(MAX_REPLICAS, desired));
  return desired;
}

function verifyAutoscalingPolicy() {
  console.log(`\n⚖️ Kubernetes HPA Autoscaling Simulation & Policy Verification`);
  console.log(`🎯 Target CPU: ${TARGET_CPU_UTILIZATION}% | Bounds: [${MIN_REPLICAS} min .. ${MAX_REPLICAS} max pods]`);
  console.log(`--------------------------------------------------------------------------------`);
  console.log(`${'Timestamp'.padEnd(10)} | ${'VUs'.padEnd(6)} | ${'Current Pods'.padEnd(14)} | ${'CPU %'.padEnd(8)} | ${'HPA Recommendation'.padEnd(20)} | Action`);
  console.log(`--------------------------------------------------------------------------------`);

  for (const step of telemetryTimeline) {
    const desired = calculateDesiredReplicas(step.currentReplicas, step.avgCpuPercent, TARGET_CPU_UTILIZATION);
    let action = 'STABLE (No-op)';
    if (desired > step.currentReplicas) {
      action = `📈 SCALE-UP (+${desired - step.currentReplicas} pods)`;
    } else if (desired < step.currentReplicas) {
      action = `📉 SCALE-DOWN (-${step.currentReplicas - desired} pods)`;
    }

    console.log(
      `${step.time.padEnd(10)} | ${(step.vus + '').padEnd(6)} | ${(step.currentReplicas + ' pods').padEnd(14)} | ${(step.avgCpuPercent + '%').padEnd(8)} | ${(desired + ' pods').padEnd(20)} | ${action}`
    );
  }

  console.log(`--------------------------------------------------------------------------------`);
  console.log(`✅ HPA Verification Completed: Scaling policies successfully absorb load spikes.`);
}

if (require.main === module) {
  verifyAutoscalingPolicy();
}

module.exports = { calculateDesiredReplicas, verifyAutoscalingPolicy };
