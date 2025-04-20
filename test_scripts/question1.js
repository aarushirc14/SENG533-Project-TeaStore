import http from 'k6/http';
import { sleep, check } from 'k6';

export let options = {
    thresholds: {
        // Ensure 95% of the requests complete within 500ms
        http_req_duration: ['p(95)<500'],
    },
    scenarios: {
        teastore_ramp: {
            executor: 'ramping-vus',
            startVUs: 10,
            stages: [
                { duration: '1m', target: 10 },  // Start with 10 VUs
                { duration: '1m', target: 25 },  // Ramp up to 25 VUs
                { duration: '1m', target: 50 },  // Ramp up to 50 VUs
                { duration: '1m', target: 100 }, // Ramp up to 100 VUs
                { duration: '2m', target: 100 }, // Hold at 100 VUs
                { duration: '1m', target: 50 },  // Ramp down to 50 VUs
                { duration: '1m', target: 25 },  // Ramp down to 25 VUs
                { duration: '1m', target: 10 },  // Ramp down to 10 VUs
                { duration: '1m', target: 0 },   // Ramp down to 0 VUs
            ],
            gracefulRampDown: '30s',
        },
    },
};

const BASE_URL = __ENV.HOST || 'http://100.91.148.100:8080/tools.descartes.teastore.webui';
const USERNAME = __ENV.USERNAME || 'user2';
const PASSWORD = __ENV.PASSWORD || 'password';

export default function () {
    // --- LOGIN STEP ---
    const loginPayload = JSON.stringify({
        username: USERNAME,
        password: PASSWORD,
    });
    let loginRes = http.post(`${BASE_URL}/login`, loginPayload, {
        headers: { 'Content-Type': 'application/json' },
    });
    check(loginRes, {
        'Login status is 200': (r) => r.status === 200,
        'Logged in successfully': (r) => r.json('success') === true,
    });
    sleep(1);

    // --- TEST TEASTORE ENDPOINTS ---
    let res = http.get(`${BASE_URL}/`);
    check(res, {
        'Homepage status is 200': (r) => r.status === 200,
        'Homepage response time < 500ms': (r) => r.timings.duration < 500,
    });

    res = http.get(`${BASE_URL}/category?category=4&page=1`);
    check(res, {
        'Category 4 status is 200': (r) => r.status === 200,
        'Category 4 response time < 500ms': (r) => r.timings.duration < 500,
    });

    res = http.get(`${BASE_URL}/category?category=5&page=1`);
    check(res, {
        'Category 5 status is 200': (r) => r.status === 200,
        'Category 5 response time < 500ms': (r) => r.timings.duration < 500,
    });

    res = http.get(`${BASE_URL}/category?category=6&page=1`);
    check(res, {
        'Category 6 status is 200': (r) => r.status === 200,
        'Category 6 response time < 500ms': (r) => r.timings.duration < 500,
    });

    res = http.get(`${BASE_URL}/cart`);
    check(res, {
        'Cart status is 200': (r) => r.status === 200,
        'Cart response time < 500ms': (r) => r.timings.duration < 500,
    });

    res = http.get(`${BASE_URL}/checkout`);
    check(res, {
        'Checkout page status is 200': (r) => r.status === 200,
        'Checkout page response time < 500ms': (r) => r.timings.duration < 500,
    });

    sleep(1);
}
