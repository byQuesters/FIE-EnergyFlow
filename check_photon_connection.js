/**
 * Script para verificar si el Photon está conectado y puede recibir datos
 * Intenta conectarse al mismo servidor que el Photon
 */

import net from 'net';

const SERVER_IP = '148.213.117.98';
const SERVER_PORT = 3300;

console.log('===========================================');
console.log('VERIFICACIÓN DE CONEXIÓN AL SERVIDOR');
console.log('===========================================\n');
console.log(`Servidor: ${SERVER_IP}:${SERVER_PORT}`);
console.log('(Mismo servidor que usa el Photon)\n');

const client = new net.Socket();

client.setTimeout(5000); // 5 segundos timeout

client.connect(SERVER_PORT, SERVER_IP, () => {
    console.log('✅ Conexión exitosa al servidor!');
    console.log('   El servidor está disponible y aceptando conexiones\n');
    
    // Enviar un request de prueba
    const testRequest = 'POST /api/data HTTP/1.1\r\n' +
                       `Host: ${SERVER_IP}\r\n` +
                       'Content-Type: application/json\r\n' +
                       'Content-Length: 100\r\n' +
                       'Connection: close\r\n\r\n' +
                       '{"test": true}';
    
    client.write(testRequest);
    console.log('📤 Request de prueba enviado...\n');
});

client.on('data', (data) => {
    console.log('📥 Respuesta del servidor:');
    console.log('-------------------------------------------');
    console.log(data.toString());
    console.log('-------------------------------------------\n');
    client.destroy();
});

client.on('close', () => {
    console.log('🔌 Conexión cerrada\n');
    console.log('===========================================');
    console.log('CONCLUSIÓN:');
    console.log('===========================================');
    console.log('✅ El servidor está funcionando correctamente');
    console.log('✅ Tu Photon debería poder conectarse');
    console.log('\nSi tu Photon sigue offline, el problema es:');
    console.log('  1. WiFi del Photon no está configurado');
    console.log('  2. Photon no tiene conexión a internet');
    console.log('  3. Código no se cargó correctamente');
    console.log('===========================================\n');
    process.exit(0);
});

client.on('error', (err) => {
    console.error('❌ ERROR de conexión:');
    console.error('-------------------------------------------');
    console.error(err.message);
    console.error('-------------------------------------------\n');
    
    console.log('===========================================');
    console.log('POSIBLES CAUSAS:');
    console.log('===========================================');
    console.log('1. El servidor está caído o inaccesible');
    console.log('2. Firewall bloqueando la conexión');
    console.log('3. Puerto 3300 cerrado');
    console.log('4. IP del servidor cambió');
    console.log('\n⚠️  Tu Photon tampoco podrá conectarse');
    console.log('   hasta que se resuelva este problema.\n');
    console.log('===========================================\n');
    
    process.exit(1);
});

client.on('timeout', () => {
    console.error('⏱️  TIMEOUT: El servidor no respondió en 5 segundos\n');
    client.destroy();
    process.exit(1);
});
