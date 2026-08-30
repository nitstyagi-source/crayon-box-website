import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '20s', target: 100 }, // Rapid morning spike of 100 teachers/kiosks
    { duration: '1m', target: 300 },  // Peak 300 concurrent clock-ins / QR scans
    { duration: '20s', target: 0 },   // Settled
  ],
  thresholds: {
    http_req_duration: ['p(95)<400'], // 95% under 400ms
    http_req_failed: ['rate<0.01'],   // Failure rate under 1%
  },
};

const BASE_URL = __ENV.BASE_URL || 'https://crayonboxschool.com';

export default function () {
  const payload = JSON.stringify({
    grade: 'Grade 5',
    section: 'A',
    date: new Date().toISOString().split('T')[0],
  });

  const params = {
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
  };

  const res = http.post(`${BASE_URL}/api/mobile/attendance/register`, payload, params);

  check(res, {
    'status is 200': (r) => r.status === 200 || r.status === 201,
  });

  sleep(0.5);
}
