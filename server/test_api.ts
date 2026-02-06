
import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:3001/api';

async function testEndpoints() {
    console.log('Testing Backend API...');

    try {
        // Test GET /jobs
        console.log('\n1. Testing GET /jobs...');
        const jobsRes = await fetch(`${BASE_URL}/jobs`);
        if (jobsRes.ok) {
            const jobs = await jobsRes.json();
            console.log(`PASS: Fetched ${jobs.length} jobs.`);
        } else {
            console.error(`FAIL: GET /jobs status ${jobsRes.status}`);
        }

        // Test GET /helpers
        console.log('\n2. Testing GET /helpers...');
        const helpersRes = await fetch(`${BASE_URL}/helpers`);
        if (helpersRes.ok) {
            const helpers = await helpersRes.json();
            console.log(`PASS: Fetched ${helpers.length} helpers.`);
        } else {
            console.error(`FAIL: GET /helpers status ${helpersRes.status}`);
        }

        // Test POST /jobs
        console.log('\n3. Testing POST /jobs...');
        const newJob = {
            title: 'Test Job',
            location: 'Test Location',
            salary: '5000',
            requirements: ['Req1', 'Req2'],
            description: 'Test Description'
        };
        const postJobRes = await fetch(`${BASE_URL}/jobs`, {
            method: 'POST',
            body: JSON.stringify(newJob),
            headers: { 'Content-Type': 'application/json' }
        });

        if (postJobRes.ok) {
            const createdJob = await postJobRes.json();
            console.log(`PASS: Created job with ID ${createdJob.id}`);
        } else {
            console.error(`FAIL: POST /jobs status ${postJobRes.status}`);
        }

    } catch (error) {
        console.error('Test execution failed:', error);
    }
}

testEndpoints();
