import http from 'k6/http';
import { check, sleep } from 'k6';

// Read configuration options from JSON file
const config = JSON.parse(open('./k6-options.json'));

export const options = {
  vus: config.vus || 10,
  duration: config.duration || '10s',
  thresholds: config.thresholds || {
    http_req_duration: ['p(95)<500'],
    http_req_failed: ['rate<0.01'],
  },
};

const BASE_URL = __ENV.TARGET_URL || 'http://localhost:3000';

export default function () {
  // 1. Health check baseline
  const healthRes = http.get(`${BASE_URL}/api/health`);
  check(healthRes, {
    'health status is 200': (r) => r.status === 200,
  });

  // 2. Fetch architecture diagrams
  const diagRes = http.get(`${BASE_URL}/api/diagrams?delay=10`);
  check(diagRes, {
    'diagrams status is 200': (r) => r.status === 200,
    'diagrams count > 0': (r) => JSON.parse(r.body).count > 0,
  });

  // 3. User think time
  sleep(1);
}
