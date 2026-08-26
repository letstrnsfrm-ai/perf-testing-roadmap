import http from 'k6/http';
import { check, sleep } from 'k6';

// Multi-stage stepped ramp up simulating production traffic surges
export const options = {
  stages: [
    { duration: '5s', target: 5 },   // Stage 1: Warmup & baseline
    { duration: '10s', target: 30 }, // Stage 2: Surge (triggers HPA scale-up)
    { duration: '10s', target: 50 }, // Stage 3: Peak sustained capacity
    { duration: '5s', target: 5 },   // Stage 4: Cool down (triggers HPA scale-down)
  ],
  thresholds: {
    http_req_duration: ['p(95)<600'],
    http_req_failed: ['rate<0.02'],
  },
};

const BASE_URL = __ENV.TARGET_URL || 'http://localhost:3000';

export default function () {
  // Hit CPU-intensive computation to simulate CPU pressure on container
  const res = http.get(`${BASE_URL}/api/heavy-computation?iterations=20000`);
  check(res, {
    'computation status 200': (r) => r.status === 200,
  });
  sleep(0.5);
}
