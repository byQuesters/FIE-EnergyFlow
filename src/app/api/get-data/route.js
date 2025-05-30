// /app/api/get-data/route.js
import { NextResponse } from 'next/server';

const DEVICE_ID = process.env.PARTICLE_DEVICE_ID;
const PARTICLE_TOKEN = process.env.PARTICLE_TOKEN;

const variables = [
  'I_rmsA', 'I_rmsB', 'I_rmsC',
  'V_rmsA', 'V_rmsB', 'V_rmsC',
  'V_rmsAB', 'V_rmsBC', 'V_rmsCA',
  'KWHA', 'KWHB', 'KWHC',
  'PA', 'PB', 'PC'
];

async function getParticleVariable(varName) {
  const url = `https://api.particle.io/v1/devices/${DEVICE_ID}/${varName}?access_token=${PARTICLE_TOKEN}`;
  
  try {
    // Usar timeout más generoso, igual que tu script funcional
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 segundos
    
    const res = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      },
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`HTTP ${res.status} - ${res.statusText}: ${errorText}`);
    }
    
    const data = await res.json();
    
    // Validación simple como en tu script funcional
    if (!data.hasOwnProperty('result')) {
      throw new Error('Invalid response format from Particle API');
    }
    
    return { 
      name: varName, 
      value: typeof data.result === 'number' ? data.result : parseFloat(data.result) || 0,
      success: true,
      timestamp: data.coreInfo?.last_heard || new Date().toISOString()
    };
  } catch (err) {
    console.error(`Error reading ${varName}:`, err.message);
    return { 
      name: varName, 
      error: err.message, 
      value: 0,
      success: false
    };
  }
}

async function getAllParticleData() {
  try {
    // Validación básica de variables de entorno
    if (!DEVICE_ID || !PARTICLE_TOKEN) {
      throw new Error('Missing PARTICLE_DEVICE_ID or PARTICLE_TOKEN environment variables');
    }

    console.log(`Fetching data from device: ${DEVICE_ID}`);
    console.log(`Using token: ${PARTICLE_TOKEN.substring(0, 8)}...`);
    
    // Obtener todas las variables directamente, como en tu script funcional
    console.log(`Fetching ${variables.length} variables...`);
    const results = await Promise.all(
      variables.map(varName => getParticleVariable(varName))
    );
    
    // Procesar resultados
    const successfulResults = [];
    const errors = [];
    
    results.forEach((result) => {
      if (result.success) {
        successfulResults.push(result);
      } else {
        errors.push(result);
      }
    });
    
    console.log(`Fetch results: ${successfulResults.length} successful, ${errors.length} failed`);
    
    if (successfulResults.length === 0) {
      throw new Error('Failed to fetch any variables from device');
    }
    
    if (errors.length > 0) {
      console.warn(`Failed to fetch ${errors.length}/${variables.length} variables:`, 
        errors.map(e => `${e.name}: ${e.error}`));
    }
    
    // Convertir resultados al formato esperado por el dashboard
    const dataMap = {};
    successfulResults.forEach(result => {
      console.log(`${result.name}: ${result.value}`);
      dataMap[result.name] = result.value || 0;
    });
    
    // Mapeo correcto de variables (igual que en tu script funcional)
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
    
    console.log('Successfully fetched and mapped data:', {
      successfulVariables: successfulResults.length,
      totalVariables: variables.length,
      errors: errors.length,
      sampleData: {
        I_RMSA: mappedData.I_RMSA,
        V_RMSA: mappedData.V_RMSA,
        PPROM_A: mappedData.PPROM_A,
        kWhA: mappedData.kWhA
      }
    });
    
    return {
      success: true,
      data: mappedData,
      timestamp: new Date().toISOString(),
      meta: {
        successfulVariables: successfulResults.length,
        totalVariables: variables.length,
        errors: errors.length > 0 ? errors.map(e => ({ name: e.name, error: e.error })) : undefined
      }
    };
    
  } catch (error) {
    console.error('Error fetching Particle data:', error);
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

// Next.js App Router API Route Handler
export async function GET(request) {
  try {
    console.log('=== API Route called: /api/get-data ===');
    console.log('Environment check:', {
      deviceId: DEVICE_ID ? `${DEVICE_ID.substring(0, 8)}...` : 'NOT SET',
      tokenExists: !!PARTICLE_TOKEN,
      nodeEnv: process.env.NODE_ENV
    });
    
    const result = await getAllParticleData();
    
    // Headers CORS para desarrollo
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

// Handle preflight requests for CORS
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

// Test endpoint para verificar que la API funciona
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
    
    return NextResponse.json(
      { error: 'POST method requires test: true in body' }, 
      { status: 400 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: 'Invalid JSON in request body' }, 
      { status: 400 }
    );
  }
}