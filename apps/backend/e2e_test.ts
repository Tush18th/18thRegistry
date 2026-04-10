import * as https from 'https';
import * as http from 'http';
import * as fs from 'fs';
import * as path from 'path';

async function apiRequest(options: any, body?: string): Promise<any> {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try { resolve(JSON.parse(data)); } catch { resolve(data); }
      });
    });
    req.on('error', reject);
    if (body) req.write(body);
    req.end();
  });
}

async function run() {
  // Step 1: Login
  console.log('Logging in...');
  const loginRes = await apiRequest({
    host: '127.0.0.1',
    port: 3001,
    path: '/api/v1/auth/login',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, JSON.stringify({ email: 'admin@18thdigitech.com', password: 'Demo@1234!' }));

  console.log('Login response:', JSON.stringify(loginRes, null, 2));
  const token = loginRes?.data?.accessToken;
  if (!token) {
    console.error('Failed to get token!');
    process.exit(1);
  }
  console.log('Token obtained successfully.');

  // Step 2: Upload ZIP
  const zipPath = path.join(__dirname, '18th_DummyModule.zip');
  const zipBuffer = fs.readFileSync(zipPath);
  
  const boundary = '----FormBoundary' + Math.random().toString(36).slice(2);
  const body = Buffer.concat([
    Buffer.from(`--${boundary}\r\nContent-Disposition: form-data; name="file"; filename="18th_DummyModule.zip"\r\nContent-Type: application/zip\r\n\r\n`),
    zipBuffer,
    Buffer.from(`\r\n--${boundary}--\r\n`)
  ]);

  console.log('Uploading ZIP...');
  const uploadRes = await apiRequest({
    host: '127.0.0.1',
    port: 3001,
    path: '/api/v1/ingestion/upload-zip',
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': `multipart/form-data; boundary=${boundary}`,
      'Content-Length': body.length,
    }
  }, body as any);

  console.log('Upload response:', JSON.stringify(uploadRes, null, 2));

  // Wait for BullMQ to process
  console.log('Waiting 5s for ingestion job to complete...');
  await new Promise(r => setTimeout(r, 5000));

  // Step 3: Search for the module
  console.log('Searching for ingested module...');
  const searchRes = await apiRequest({
    host: '127.0.0.1',
    port: 3001,
    path: '/api/v1/modules/search',
    method: 'GET',
    headers: { 'Authorization': `Bearer ${token}` }
  });

  console.log('Search response:', JSON.stringify(searchRes, null, 2));
}

run().catch(console.error);
