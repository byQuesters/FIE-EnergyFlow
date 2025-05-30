
// const DEVICE_ID = '24003b000b47313037363132' 3d003e001547313036303933;
const DEVICE_ID = '3d003e001547313036303933';
const PARTICLE_TOKEN = 'a29eeeb0daa9a0e54417d6f2e28ba98e6a729765';

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
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return { name: varName, value: data.result };
  } catch (err) {
    return { name: varName, error: err.message };
  }
}

async function readAllVariables() {
  const results = await Promise.all(variables.map(getParticleVariable));
  results.forEach(result => {
    if (result.error) {
      console.error(`❌ Error al leer ${result.name}: ${result.error}`);
    } else {
      console.log(`✅ ${result.name}: ${result.value}`);
    }
  });
}

readAllVariables();


