/**
 * Script para limpiar datos antiguos (incorrectos) de la base de datos
 * 
 * ADVERTENCIA: Este script ELIMINARÁ todos los datos anteriores a hoy
 * Solo ejecutar si estás seguro de que quieres empezar desde cero
 * 
 * Uso: node clear_old_data.js
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Error: Faltan variables de entorno de Supabase');
    console.error('Necesitas NEXT_PUBLIC_SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function clearOldData() {
    console.log('===========================================');
    console.log('LIMPIEZA DE DATOS ANTIGUOS (INCORRECTOS)');
    console.log('===========================================\n');

    try {
        // Obtener fecha y hora actual
        const now = new Date();
        const cutoffDate = now.toISOString();
        
        console.log(`📅 Fecha de corte: ${now.toLocaleString('es-MX')}`);
        console.log(`🗑️  Se eliminarán TODOS los datos anteriores a esta fecha\n`);

        // Primero, contar cuántos registros hay
        const { count: totalCount, error: countError } = await supabase
            .from('energy_data')
            .select('*', { count: 'exact', head: true });

        if (countError) {
            throw new Error(`Error contando registros: ${countError.message}`);
        }

        console.log(`📊 Total de registros actuales: ${totalCount}`);

        // Contar registros antiguos (antes de hoy)
        const { count: oldCount, error: oldCountError } = await supabase
            .from('energy_data')
            .select('*', { count: 'exact', head: true })
            .lt('timestamp', cutoffDate);

        if (oldCountError) {
            throw new Error(`Error contando registros antiguos: ${oldCountError.message}`);
        }

        console.log(`🗑️  Registros a eliminar: ${oldCount}`);
        console.log(`✅ Registros que se mantendrán: ${totalCount - oldCount}\n`);

        if (oldCount === 0) {
            console.log('✨ No hay datos antiguos que eliminar. ¡Todo está limpio!');
            return;
        }

        // Confirmar antes de eliminar
        console.log('⚠️  ADVERTENCIA: Esta acción NO se puede deshacer');
        console.log('⚠️  Se eliminarán', oldCount, 'registros permanentemente');
        console.log('\n🔄 Esperando 5 segundos antes de continuar...');
        console.log('    Presiona Ctrl+C para cancelar\n');

        await new Promise(resolve => setTimeout(resolve, 5000));

        console.log('🗑️  Eliminando datos antiguos...\n');

        // Eliminar registros antiguos
        const { error: deleteError } = await supabase
            .from('energy_data')
            .delete()
            .lt('timestamp', cutoffDate);

        if (deleteError) {
            throw new Error(`Error eliminando datos: ${deleteError.message}`);
        }

        console.log('✅ ¡Datos antiguos eliminados exitosamente!');
        
        // Verificar cuántos registros quedan
        const { count: remainingCount, error: finalCountError } = await supabase
            .from('energy_data')
            .select('*', { count: 'exact', head: true });

        if (finalCountError) {
            throw new Error(`Error verificando registros restantes: ${finalCountError.message}`);
        }

        console.log(`\n📊 Registros restantes: ${remainingCount}`);
        console.log('\n===========================================');
        console.log('RESUMEN:');
        console.log('===========================================');
        console.log(`Total original:     ${totalCount}`);
        console.log(`Eliminados:         ${oldCount}`);
        console.log(`Restantes:          ${remainingCount}`);
        console.log('===========================================');
        console.log('\n✨ ¡Listo! Ahora actualiza tu Photon con el firmware corregido');
        console.log('   y los nuevos datos serán correctos desde el inicio.\n');

    } catch (error) {
        console.error('\n❌ Error durante la limpieza:', error.message);
        process.exit(1);
    }
}

// Ejecutar
clearOldData();
