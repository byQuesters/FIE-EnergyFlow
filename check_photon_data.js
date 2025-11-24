/**
 * Verifica si el Photon está enviando datos recientemente
 * Script simplificado sin dependencia de .env
 */

const { createClient } = require('@supabase/supabase-js');

// Credenciales directas (las mismas que usa la app)
const supabaseUrl = 'https://lpjxsvasvbpwazwobcnp.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxwanhzdmFzdmJwd2F6d29iY25wIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc2MTQ3ODUsImV4cCI6MjA2MzE5MDc4NX0.hi3V7w86WxIcpkA0tLZAgSHr9OZ-lGLU-twuigazh1A';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkRecentData() {
    console.log('===========================================');
    console.log('VERIFICACIÓN DE DATOS RECIENTES DEL PHOTON');
    console.log('===========================================\n');

    try {
        // Obtener los últimos 5 registros
        const { data, error } = await supabase
            .from('ElectricalData')
            .select('*')
            .order('timestamp', { ascending: false })
            .limit(5);

        if (error) throw error;

        if (!data || data.length === 0) {
            console.log('❌ NO HAY DATOS en la base de datos');
            console.log('   El Photon nunca ha enviado datos o fueron eliminados\n');
            return;
        }

        console.log(`📊 Últimos ${data.length} registros encontrados:\n`);

        const now = new Date();
        
        data.forEach((record, index) => {
            const timestamp = new Date(record.timestamp);
            const diffMinutes = Math.floor((now - timestamp) / 1000 / 60);
            const diffHours = Math.floor(diffMinutes / 60);
            const diffDays = Math.floor(diffHours / 24);

            let timeAgo = '';
            if (diffDays > 0) {
                timeAgo = `hace ${diffDays} día${diffDays > 1 ? 's' : ''}`;
            } else if (diffHours > 0) {
                timeAgo = `hace ${diffHours} hora${diffHours > 1 ? 's' : ''}`;
            } else if (diffMinutes > 0) {
                timeAgo = `hace ${diffMinutes} minuto${diffMinutes > 1 ? 's' : ''}`;
            } else {
                timeAgo = 'hace menos de 1 minuto';
            }

            const status = diffMinutes <= 2 ? '✅' : 
                          diffMinutes <= 10 ? '⚠️' : 
                          diffMinutes <= 60 ? '🔶' : '❌';

            console.log(`${status} Registro ${index + 1}:`);
            console.log(`   Timestamp: ${timestamp.toLocaleString('es-MX')}`);
            console.log(`   Tiempo transcurrido: ${timeAgo}`);
            console.log(`   kWh A: ${record.kWhA?.toFixed(4) || 'N/A'}`);
            console.log(`   kWh B: ${record.kWhB?.toFixed(4) || 'N/A'}`);
            console.log(`   kWh C: ${record.kWhC?.toFixed(4) || 'N/A'}`);
            console.log('');
        });

        // Análisis del estado
        const latestRecord = data[0];
        const latestTimestamp = new Date(latestRecord.timestamp);
        const minutesSinceLastData = Math.floor((now - latestTimestamp) / 1000 / 60);

        console.log('===========================================');
        console.log('ANÁLISIS:');
        console.log('===========================================');

        if (minutesSinceLastData <= 2) {
            console.log('✅ PHOTON FUNCIONANDO CORRECTAMENTE');
            console.log('   Datos recibidos hace menos de 2 minutos');
            console.log('   El Photon está online y enviando datos\n');
            
            // Verificar si los valores están acumulando correctamente
            if (data.length >= 2) {
                const diff1 = data[0].kWhA - data[1].kWhA;
                const diff2 = data.length >= 3 ? data[1].kWhA - data[2].kWhA : 0;
                
                console.log('📈 Verificación de acumulación (Fase A):');
                console.log(`   Incremento 1: ${diff1.toFixed(6)} kWh`);
                if (data.length >= 3) {
                    console.log(`   Incremento 2: ${diff2.toFixed(6)} kWh`);
                }
                
                if (diff1 > 0) {
                    console.log('   ✅ Los valores están acumulando correctamente\n');
                } else if (Math.abs(diff1) < 0.000001) {
                    console.log('   ⚠️  Los valores NO están cambiando (puede ser normal si no hay carga)\n');
                } else {
                    console.log('   ❌ Los valores están disminuyendo (Photon se reinició o hay un problema)\n');
                }
            }
            
        } else if (minutesSinceLastData <= 10) {
            console.log('⚠️  POSIBLE PROBLEMA');
            console.log(`   Último dato recibido hace ${minutesSinceLastData} minutos`);
            console.log('   El Photon envía cada 1 minuto, debería haber datos más recientes');
            console.log('   Espera 2-3 minutos más y vuelve a verificar\n');
            
        } else if (minutesSinceLastData <= 60) {
            console.log('🔶 PHOTON PROBABLEMENTE OFFLINE');
            console.log(`   Último dato recibido hace ${minutesSinceLastData} minutos`);
            console.log('   El Photon no está enviando datos');
            console.log('\n   Posibles causas:');
            console.log('   - Se desconectó del WiFi');
            console.log('   - Perdió alimentación eléctrica');
            console.log('   - El código tiene un error y se bloqueó\n');
            
        } else {
            const hours = Math.floor(minutesSinceLastData / 60);
            const days = Math.floor(hours / 24);
            
            console.log('❌ PHOTON OFFLINE (DESCONECTADO)');
            if (days > 0) {
                console.log(`   Último dato recibido hace ${days} día${days > 1 ? 's' : ''}`);
            } else {
                console.log(`   Último dato recibido hace ${hours} hora${hours > 1 ? 's' : ''}`);
            }
            console.log('   El Photon NO está funcionando');
            console.log('\n   Requiere intervención física para:');
            console.log('   - Verificar alimentación eléctrica');
            console.log('   - Revisar conexión WiFi');
            console.log('   - Reiniciar el dispositivo\n');
        }

        console.log('===========================================\n');

        // Consejo según el estado
        if (minutesSinceLastData <= 2) {
            console.log('💡 RECOMENDACIÓN: Todo está funcionando bien.');
            console.log('   Si Particle Console dice "offline", ignóralo.');
            console.log('   Lo importante es que los datos lleguen al backend.\n');
        } else if (minutesSinceLastData <= 10) {
            console.log('💡 RECOMENDACIÓN: Espera 5 minutos y ejecuta este script de nuevo.');
            console.log('   Si sigue sin recibir datos, hay un problema.\n');
        } else {
            console.log('💡 RECOMENDACIÓN: Necesitas acceso físico al Photon para:');
            console.log('   1. Verificar que tiene alimentación (LED encendido)');
            console.log('   2. Ver el color del LED de estado');
            console.log('   3. Posiblemente reiniciarlo o reconfigurar WiFi\n');
            console.log('   Mientras tanto, los reportes usarán los datos antiguos.\n');
        }

    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

checkRecentData();
