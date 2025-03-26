import http from 'k6/http';
import { sleep, check } from 'k6';

export let options = {
    thresholds: {
        // 95% of the requests should finish within 500ms
        http_req_duration: ['p(95)<500'],
    },
    scenarios: {
        teastore_ramp: {
            executor: 'ramping-vus',
            startVUs: 10,
            stages: [
                // Ramp-up phases (10, 50, 100, 500, 1000 users)
                { duration: '1m', target: 10 },
                { duration: '1m', target: 50 },
                { duration: '1m', target: 100 },
                { duration: '1m', target: 500 },
                { duration: '1m', target: 1000 },
                // Steady state at maximum load
                { duration: '2m', target: 1000 },
                // Ramp-down phases
                { duration: '1m', target: 500 },
                { duration: '1m', target: 100 },
                { duration: '1m', target: 50 },
                { duration: '1m', target: 10 },
                { duration: '1m', target: 0 },
            ],
            gracefulRampDown: '30s',
        },
    },
};

const BASE_URL = __ENV.HOST || 'http://localhost:8080/teastore';

// Main test function
export default function () {
    // Measure TeaStore's homepage response time and throughput
    let res = http.get(`${BASE_URL}/`);
    check(res, {
        'Homepage status is 200': (r) => r.status === 200,
        'Homepage response time < 500ms': (r) => r.timings.duration < 500,
    });
    
    // Additional endpoint example: product listing
    res = http.get(`${BASE_URL}/products`);
    check(res, {
        'Products status is 200': (r) => r.status === 200,
        'Products response time < 500ms': (r) => r.timings.duration < 500,
    });
    
    // Sleep to simulate real user think time
    sleep(1);
}
