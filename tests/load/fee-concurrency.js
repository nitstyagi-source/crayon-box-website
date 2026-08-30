import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '30s', target: 50 },  // Ramp up to 50 concurrent parents
    { duration: '1m', target: 200 },   // Peak load: 200 concurrent users querying fees
    { duration: '30s', target: 0 },    // Ramp down to 0
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'],  // 95% of requests must complete under 500ms
    http_req_failed: ['rate<0.01'],    // Error rate must be less than 1%
  },
};

const BASE_URL = __ENV.BASE_URL || 'https://crayonboxschool.com';

export default function () {
  const res = http.get(`${BASE_URL}/api/mobile/fees?studentId=test-load-01`, {
    headers: {
      'Accept': 'application/json',
      'User-Agent': 'k6-load-test-agent',
    },
  });

  check(res, {
    'status is 200 or 304': (r) => r.status === 200 || r.status === 304,
    'response time < 500ms': (r) => r.timings.duration < 500,
  });

  sleep(1);
}
