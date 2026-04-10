import axios from 'axios';

async function validateFlow() {
  const baseURL = 'http://127.0.0.1:3001/api/v1';
  console.log('--- STARTING FLOW VALIDATION ---');

  try {
    // 1. Auth Login
    console.log('[1/5] Logging in...');
    let token = '';
    const credentials = [
      { email: 'admin@18th-digitech.com', password: 'Admin@18th2024' },
      { email: 'admin@18thdigitech.com', password: 'Demo@1234!' },
      { email: 'admin@18th-digitech.com', password: 'Demo@1234!' }
    ];

    for (const cred of credentials) {
      try {
        const loginRes = await axios.post(`${baseURL}/auth/login`, cred);
        token = loginRes.data.accessToken;
        if (token) {
           console.log(`✅ Login successful with ${cred.email}`);
           break;
        }
      } catch (e) {
        console.log(`❌ Login failed for ${cred.email}: ${e.response?.status || e.message}`);
      }
    }

    if (!token) throw new Error('Could not log in with any known credentials');
    const authHeaders = { Authorization: `Bearer ${token}` };

    // 2. User Profile (previously 500)
    console.log('[2/5] Checking /users/profile...');
    const profileRes = await axios.get(`${baseURL}/users/profile`, { headers: authHeaders });
    console.log('✅ Profile loaded:', profileRes.data.email);

    // 3. Module Stats (previously 500)
    console.log('[3/5] Checking /modules/stats...');
    const statsRes = await axios.get(`${baseURL}/modules/stats`, { headers: authHeaders });
    console.log('✅ Stats loaded:', JSON.stringify(statsRes.data.data || statsRes.data));

    // 4. Stack Profile (previously 400)
    console.log('[4/5] Checking /stack-profiles/m247-php83...');
    const stackRes = await axios.get(`${baseURL}/stack-profiles/m247-php83`, { headers: authHeaders });
    console.log('✅ Stack profile loaded:', stackRes.data.magentoVersion);

    // 5. Compatibility Endpoint
    console.log('[5/5] Checking /compatibility/modules/ (fetching a module first)...');
    const modulesRes = await axios.get(`${baseURL}/modules/search`, { headers: authHeaders });
    const firstModuleId = modulesRes.data.data?.[0]?.id || modulesRes.data?.[0]?.id;
    
    if (firstModuleId) {
       console.log(`Checking compatibility for module: ${firstModuleId}`);
       try {
         const compatRes = await axios.get(`${baseURL}/compatibility/modules/${firstModuleId}`, { headers: authHeaders });
         console.log('✅ Compatibility endpoint returned data');
       } catch (e) {
         if (e.response?.status === 404) {
           console.log('✅ Compatibility endpoint returned 404 (Expected for un-analyzed module)');
         } else {
           throw e;
         }
       }
    }

    console.log('--- ALL API CONTRACTS VALIDATED SUCCESSFULLY ---');
  } catch (error) {
    console.error('❌ VALIDATION FAILED');
    if (error.response) {
      console.error(`Status: ${error.response.status}`);
      console.error(`Data: ${JSON.stringify(error.response.data)}`);
    } else {
      console.error(error.message);
    }
    process.exit(1);
  }
}

validateFlow();
