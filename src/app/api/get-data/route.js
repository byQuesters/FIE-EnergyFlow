// /app/api/get-data/route.js
import { NextResponse } from 'next/server';

const DEVICE_ID = process.env.PARTICLE_DEVICE_ID1;
const PARTICLE_TOKEN = process.env.PARTICLE_TOKEN;

const variables = [
  'I_rmsA', 'I_rmsB', 'I_rmsC',
  'V_rmsA', 'V_rmsB', 'V_rmsC',
  'V_rmsAB', 'V_rmsBC', 'V_rmsCA',
  'KWHA', 'KWHB', 'KWHC',
  'PA', 'PB', 'PC'
];

// Helper function to add delay between requests
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Check if device is online first
async function checkDeviceStatus() {
  const url = `https://api.particle.io/v1/devices/${DEVICE_ID}?access_token=${PARTICLE_TOKEN}`;
  
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);
    
    const res = await fetch(url, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    }
    
    const data = await res.json();
    
    return {
      online: data.connected === true,
      lastHeard: data.last_heard,
      deviceInfo: {
        name: data.name,
        platform: data.platform_id,
        product: data.product_id
      }
    };
  } catch (error) {
    console.error('Error checking device status:', error.message);
    return {
      online: false,
      error: error.message
    };
  }
}

async function getParticleVariable(varName, retryCount = 3, baseDelay = 1000) {
  const url = `https://api.particle.io/v1/devices/${DEVICE_ID}/${varName}?access_token=${PARTICLE_TOKEN}`;
  
  for (let attempt = 1; attempt <= retryCount; attempt++) {
    try {
      console.log(`Reading ${varName} - Attempt ${attempt}/${retryCount}`);
      
      // Progressive timeout: longer for each attempt
      const timeoutMs = 15000 + (attempt * 5000); // 15s, 20s, 25s
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
      
      const res = await fetch(url, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (!res.ok) {
        const errorText = await res.text();
        
        // Don't retry on certain errors
        if (res.status === 401 || res.status === 403 || res.status === 404) {
          throw new Error(`HTTP ${res.status} - ${res.statusText}: ${errorText}`);
        }
        
        // Retry on 408, 429, 500, 502, 503, 504
        if (attempt < retryCount && [408, 429, 500, 502, 503, 504].includes(res.status)) {
          console.log(`Attempt ${attempt} failed for ${varName}: HTTP ${res.status}: ${res.statusText}`);
          await delay(baseDelay * Math.pow(2, attempt - 1)); // Exponential backoff
          continue;
        }
        
        throw new Error(`HTTP ${res.status} - ${res.statusText}: ${errorText}`);
      }
      
      const data = await res.json();
      
      if (!data.hasOwnProperty('result')) {
        throw new Error('Invalid response format from Particle API');
      }
      
      console.log(`✓ ${varName}: ${data.result}`);
      
      return { 
        name: varName, 
        value: typeof data.result === 'number' ? data.result : parseFloat(data.result) || 0,
        success: true,
        timestamp: data.coreInfo?.last_heard || new Date().toISOString(),
        attempts: attempt
      };
      
    } catch (err) {
      if (attempt === retryCount) {
        console.error(`✗ Error reading ${varName} after ${retryCount} attempts:`, err.message);
        return { 
          name: varName, 
          error: err.message, 
          value: 0,
          success: false,
          attempts: attempt
        };
      } else {
        console.log(`Attempt ${attempt} failed for ${varName}: ${err.message}`);
        await delay(baseDelay * Math.pow(2, attempt - 1)); // Exponential backoff
      }
    }
  }
}

async function getAllParticleData() {
  try {
    // Validation
    if (!DEVICE_ID || !PARTICLE_TOKEN) {
      throw new Error('Missing PARTICLE_DEVICE_ID or PARTICLE_TOKEN environment variables');
    }

    console.log(`\n=== Fetching data from device: ${DEVICE_ID} ===`);
    console.log(`Using token: ${PARTICLE_TOKEN.substring(0, 8)}...`);
    
    // Step 1: Check if device is online
    console.log('Step 1: Checking device status...');
    const deviceStatus = await checkDeviceStatus();
    
    if (!deviceStatus.online) {
      console.warn('⚠️  Device appears to be offline or unreachable');
      console.log('Device status:', deviceStatus);
      // Continue anyway, but with a warning
    } else {
      console.log('✓ Device is online');
      console.log(`Last heard: ${deviceStatus.lastHeard}`);
    }
    
    // Step 2: Fetch variables with rate limiting
    console.log(`\nStep 2: Fetching ${variables.length} variables with rate limiting...`);
    const results = [];
    const batchSize = 3; // Process 3 variables at a time to avoid overwhelming the API
    
    for (let i = 0; i < variables.length; i += batchSize) {
      const batch = variables.slice(i, i + batchSize);
      console.log(`\nProcessing batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(variables.length/batchSize)}: ${batch.join(', ')}`);
      
      const batchPromises = batch.map(varName => getParticleVariable(varName, 3, 2000));
      const batchResults = await Promise.all(batchPromises);
      
      results.push(...batchResults);
      
      // Small delay between batches
      if (i + batchSize < variables.length) {
        console.log('Waiting 2s before next batch...');
        await delay(2000);
      }
    }
    
    // Step 3: Process results
    const successfulResults = results.filter(r => r.success);
    const errors = results.filter(r => !r.success);
    
    console.log(`\n=== Results Summary ===`);
    console.log(`✓ Successful: ${successfulResults.length}/${variables.length}`);
    console.log(`✗ Failed: ${errors.length}/${variables.length}`);
    
    if (errors.length > 0) {
      console.log('\nFailed variables:');
      errors.forEach(e => console.log(`  - ${e.name}: ${e.error}`));
    }
    
    // Allow partial success (at least 50% of variables must succeed)
    const successRate = successfulResults.length / variables.length;
    if (successRate < 0.3) { // Less than 30% success
      throw new Error(`Critical failure: Only ${Math.round(successRate * 100)}% of variables were successfully retrieved`);
    }
    
    // Step 4: Map data
    const dataMap = {};
    successfulResults.forEach(result => {
      dataMap[result.name] = result.value || 0;
    });
    
    const mappedData = {
      I_RMSA: dataMap.I_rmsA || 0,
      I_RMSB: dataMap.I_rmsB || 0,
      I_RMSC: dataMap.I_rmsC || 0,
      V_RMSA: dataMap.V_rmsA || 0,
      V_RMSB: dataMap.V_rmsB || 0,
      V_RMSC: dataMap.V_rmsC || 0,
      V_RMSAB: dataMap.V_rmsAB || 0,
      V_RMSBC: dataMap.V_rmsBC || 0,
      V_RMSCA: dataMap.V_rmsCA || 0,
      PPROM_A: dataMap.PA || 0,
      PPROM_B: dataMap.PB || 0,
      PPROM_C: dataMap.PC || 0,
      kWhA: dataMap.KWHA || 0,
      kWhB: dataMap.KWHB || 0,
      kWhC: dataMap.KWHC || 0,
      timestamp: new Date().toISOString()
    };
    
    const result = {
      success: true,
      data: mappedData,
      timestamp: new Date().toISOString(),
      meta: {
        deviceStatus: deviceStatus,
        successfulVariables: successfulResults.length,
        totalVariables: variables.length,
        successRate: Math.round(successRate * 100),
        errors: errors.length > 0 ? errors.map(e => ({ 
          name: e.name, 
          error: e.error,
          attempts: e.attempts 
        })) : undefined
      }
    };
    
    console.log(`\n✓ Successfully completed with ${successfulResults.length}/${variables.length} variables`);
    return result;
    
  } catch (error) {
    console.error('\n✗ Critical error fetching Particle data:', error);
    return {
      success: false,
      error: error.message,
      timestamp: new Date().toISOString(),
      details: {
        deviceId: DEVICE_ID ? `${DEVICE_ID.substring(0, 8)}...` : 'Not set',
        tokenSet: !!PARTICLE_TOKEN,
        variables: variables
      }
    };
  }
}

// GET handler
export async function GET(request) {
  try {
    console.log('\n=== API Route called: /api/get-data ===');
    console.log('Environment check:', {
      deviceId: DEVICE_ID ? `${DEVICE_ID.substring(0, 8)}...` : 'NOT SET',
      tokenExists: !!PARTICLE_TOKEN,
      nodeEnv: process.env.NODE_ENV
    });
    
    const result = await getAllParticleData();
    
    const headers = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    };
    
    if (result.success) {
      return NextResponse.json(result, { 
        status: 200,
        headers
      });
    } else {
      return NextResponse.json(result, { 
        status: 500,
        headers
      });
    }
  } catch (error) {
    console.error('API Route error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error',
        details: error.message,
        timestamp: new Date().toISOString(),
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      }, 
      { status: 500 }
    );
  }
}

// OPTIONS handler for CORS
export async function OPTIONS(request) {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}

// POST handler for testing
export async function POST(request) {
  try {
    const body = await request.json();
    
    if (body.test === true) {
      return NextResponse.json({
        success: true,
        message: 'API endpoint is working',
        timestamp: new Date().toISOString(),
        environment: {
          deviceId: DEVICE_ID ? `${DEVICE_ID.substring(0, 8)}...` : 'NOT SET',
          tokenExists: !!PARTICLE_TOKEN,
          nodeEnv: process.env.NODE_ENV,
          variablesToFetch: variables
        }
      });
    }
    
    // Special endpoint to check device status only
    if (body.checkDevice === true) {
      const deviceStatus = await checkDeviceStatus();
      return NextResponse.json({
        success: true,
        deviceStatus,
        timestamp: new Date().toISOString()
      });
    }
    
    return NextResponse.json(
      { error: 'POST method requires test: true or checkDevice: true in body' }, 
      { status: 400 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: 'Invalid JSON in request body' }, 
      { status: 400 }
    );
  }
}