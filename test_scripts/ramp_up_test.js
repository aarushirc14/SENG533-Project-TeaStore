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
                // Ramp-up phases: 10, 50, 100, 500, 1000 VUs
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

export default function () {
    // Test TeaStore Homepage
    let res = http.get(`${BASE_URL}/`);
    check(res, {
        'Homepage status is 200': (r) => r.status === 200,
        'Homepage response time < 500ms': (r) => r.timings.duration < 500,
    });

    // Test Products listing endpoint
    res = http.get(`${BASE_URL}/products`);
    check(res, {
        'Products status is 200': (r) => r.status === 200,
        'Products response time < 500ms': (r) => r.timings.duration < 500,
    });

    // Test TeaStore Browse endpoints (simulate browsing different categories)
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

    // Test TeaStore Cart endpoint (simulate viewing the cart)
    res = http.get(`${BASE_URL}/cart`);
    check(res, {
        'Cart status is 200': (r) => r.status === 200,
        'Cart response time < 500ms': (r) => r.timings.duration < 500,
    });

    // Test TeaStore Checkout endpoints
    // Option 1: GET checkout page
    res = http.get(`${BASE_URL}/checkout`);
    check(res, {
        'Checkout page status is 200': (r) => r.status === 200,
        'Checkout page response time < 500ms': (r) => r.timings.duration < 500,
    });

    // Option 2: POST checkout action (simulate completing a purchase)
    const checkoutPayload = JSON.stringify({
        items: [
            { productId: 101, quantity: 1 },
            { productId: 102, quantity: 2 },
        ],
        paymentMethod: 'credit_card',
    });
    res = http.post(`${BASE_URL}/checkout`, checkoutPayload, {
        headers: { 'Content-Type': 'application/json' },
    });
    check(res, {
        'Checkout action status is 200': (r) => r.status === 200,
        'Checkout action response time < 500ms': (r) => r.timings.duration < 500,
    });

    sleep(1);
}
