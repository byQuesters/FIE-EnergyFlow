/**
 * Photon Energy Monitor - VERSIÓN FINAL CORREGIDA
 * 
 * CAMBIOS EN ESTA VERSIÓN:
 * 1. ✅ Fórmula kWh CORREGIDA: (P*60/3600)/1000 en lugar de (P*2.0/3600)/1000
 * 2. ✅ Cálculo de potencia CORREGIDO: Promedio correcto de las muestras
 * 3. ✅ Formato JSON ORIGINAL mantenido (compatible con proxy existente)
 * 4. ✅ Envío cada 60 segundos
 * 5. ✅ Debug logs agregados
 */

#include "Particle.h"
#include "math.h"

SYSTEM_THREAD(ENABLED);

int led1 = D7;

double I_RMSA, I_RMSB, I_RMSC;
double V_RMSA, V_RMSB, V_RMSC;
double V_RMSAB, V_RMSBC, V_RMSCA;
double kWhA = 0, kWhB = 0, kWhC = 0;
double PPROM_A, PPROM_B, PPROM_C;

TCPClient client;

const char* host = "148.213.117.98";  
const int httpPort = 3300;

void setup() {
    pinMode(led1, OUTPUT);
    digitalWrite(led1, LOW);
    Serial.begin(9600);
    
    Serial.println("===========================================");
    Serial.println("Photon Energy Monitor - VERSIÓN CORREGIDA");
    Serial.println("Fórmula kWh: (P*60/3600)/1000");
    Serial.println("Intervalo: 60 segundos");
    Serial.println("===========================================");
}

void loop() {
    Serial.println("\n>>> NUEVA LECTURA <<<");
    readSensors();
    sendToProxy();
    delay(60000); // 1 minuto
}

void readSensors() {
    float IrmsA=0, IrmsB=0, IrmsC=0;
    float VrmsA=0, VrmsB=0, VrmsC=0;
    float VrmsAB=0, VrmsBC=0, VrmsCA=0;
    
    // CORREGIDO: Acumuladores sin dividir en el loop
    float sumPower_a=0, sumPower_b=0, sumPower_c=0;

    // Tomar 100 muestras
    for(int i=0; i<100; i++) {
        float Ia = ((analogRead(A3)/4096.0)*3.3 - 1.65) * 49.23;
        float Ib = ((analogRead(A4)/4096.0)*3.3 - 1.65) * 49.23;
        float Ic = ((analogRead(A5)/4096.0)*3.3 - 1.65) * 38.6;

        float Va = ((analogRead(A0)/4096.0)*3.3 - 1.65) * 817.7;
        float Vb = ((analogRead(A1)/4096.0)*3.3 - 1.65) * 817.7;
        float Vc = ((analogRead(A2)/4096.0)*3.3 - 1.65) * 817.7;

        IrmsA += pow(Ia,2);
        IrmsB += pow(Ib,2);
        IrmsC += pow(Ic,2);

        VrmsA += pow(Va,2);
        VrmsB += pow(Vb,2);
        VrmsC += pow(Vc,2);

        VrmsAB += pow(Va-Vb,2);
        VrmsBC += pow(Vb-Vc,2);
        VrmsCA += pow(Vc-Va,2);

        // CORREGIDO: Acumular sin dividir
        sumPower_a += Va*Ia;
        sumPower_b += Vb*Ib;
        sumPower_c += Vc*Ic;

        delay(1);
    }

    // Calcular RMS
    I_RMSA = sqrt(IrmsA/100);
    I_RMSB = sqrt(IrmsB/100);
    I_RMSC = sqrt(IrmsC/100);

    V_RMSA = sqrt(VrmsA/100);
    V_RMSB = sqrt(VrmsB/100);
    V_RMSC = sqrt(VrmsC/100);

    V_RMSAB = sqrt(VrmsAB/100);
    V_RMSBC = sqrt(VrmsBC/100);
    V_RMSCA = sqrt(VrmsCA/100);

    // CORREGIDO: Dividir la suma total entre 100
    PPROM_A = sumPower_a / 100.0;
    PPROM_B = sumPower_b / 100.0;
    PPROM_C = sumPower_c / 100.0;

    // ========================================================================
    // FÓRMULA kWh CORREGIDA
    // ========================================================================
    // ANTES (INCORRECTO): kWhA += (Pprom_a*2.0/3600)/1000;
    // AHORA (CORRECTO):   kWhA += (Pprom_a*60/3600)/1000;
    // 
    // Explicación:
    // - Delay es 60000 ms = 60 segundos
    // - Tiempo en horas = 60 segundos / 3600 segundos/hora = 1/60 hora
    // - kWh = Potencia_Watts × Tiempo_Horas / 1000
    // - kWh = Pprom × (60/3600) / 1000 = Pprom × 0.01667 / 1000
    // ========================================================================
    
    kWhA += (PPROM_A * 60.0 / 3600.0) / 1000.0;
    kWhB += (PPROM_B * 60.0 / 3600.0) / 1000.0;
    kWhC += (PPROM_C * 60.0 / 3600.0) / 1000.0;
    
    // Debug: Mostrar valores calculados
    Serial.println("--- Valores Calculados ---");
    Serial.print("Corriente A: "); Serial.print(I_RMSA, 3); Serial.println(" A");
    Serial.print("Corriente B: "); Serial.print(I_RMSB, 3); Serial.println(" A");
    Serial.print("Corriente C: "); Serial.print(I_RMSC, 3); Serial.println(" A");
    
    Serial.print("Voltaje A: "); Serial.print(V_RMSA, 3); Serial.println(" V");
    Serial.print("Voltaje B: "); Serial.print(V_RMSB, 3); Serial.println(" V");
    Serial.print("Voltaje C: "); Serial.print(V_RMSC, 3); Serial.println(" V");
    
    Serial.print("Potencia A: "); Serial.print(PPROM_A, 3); Serial.println(" W");
    Serial.print("Potencia B: "); Serial.print(PPROM_B, 3); Serial.println(" W");
    Serial.print("Potencia C: "); Serial.print(PPROM_C, 3); Serial.println(" W");
    
    Serial.print("kWh A (acumulado): "); Serial.print(kWhA, 6); Serial.println(" kWh");
    Serial.print("kWh B (acumulado): "); Serial.print(kWhB, 6); Serial.println(" kWh");
    Serial.print("kWh C (acumulado): "); Serial.print(kWhC, 6); Serial.println(" kWh");
    
    // Verificación del incremento
    float incremento = (PPROM_A * 60.0 / 3600.0) / 1000.0;
    Serial.print("Incremento kWh esta lectura: "); Serial.print(incremento, 6); Serial.println(" kWh");
}

void sendToProxy() {
    // ========================================================================
    // FORMATO JSON ORIGINAL (Compatible con proxy existente)
    // ========================================================================
    // Mantiene los nombres de campos originales que el proxy espera
    // ========================================================================
    
    char body[512];
    snprintf(body, sizeof(body),
        "{\"I_RMSA\":%.3f,\"I_RMSB\":%.3f,\"I_RMSC\":%.3f,"
        "\"V_RMSA\":%.3f,\"V_RMSB\":%.3f,\"V_RMSC\":%.3f,"
        "\"V_RMSAB\":%.3f,\"V_RMSBC\":%.3f,\"V_RMSCA\":%.3f,"
        "\"kWhA\":%.6f,\"kWhB\":%.6f,\"kWhC\":%.6f,"
        "\"PPROM_A\":%.3f,\"PPROM_B\":%.3f,\"PPROM_C\":%.3f}",
        I_RMSA, I_RMSB, I_RMSC,
        V_RMSA, V_RMSB, V_RMSC,
        V_RMSAB, V_RMSBC, V_RMSCA,
        kWhA, kWhB, kWhC,
        PPROM_A, PPROM_B, PPROM_C
    );

    Serial.println("\n===========================================");
    Serial.println("ENVIANDO DATOS AL PROXY");
    Serial.println("===========================================");
    Serial.print("JSON: ");
    Serial.println(body);
    Serial.print("Destino: ");
    Serial.print(host);
    Serial.print(":");
    Serial.println(httpPort);

    if (!client.connect(host, httpPort)) {
        Serial.println("❌ ERROR: No se pudo conectar al proxy");
        Serial.println("Posibles causas:");
        Serial.println("  - Proxy caído o inaccesible");
        Serial.println("  - WiFi desconectado");
        Serial.println("  - Firewall bloqueando puerto 3300");
        return;
    }

    Serial.println("✅ Conexión TCP establecida con el proxy");

    client.print("POST /api/data HTTP/1.1\r\n");
    client.print("Host: "); client.print(host); client.print("\r\n");
    client.print("Content-Type: application/json\r\n");
    client.print("Content-Length: "); client.print(strlen(body)); client.print("\r\n");
    client.print("Connection: close\r\n\r\n");
    client.print(body);

    Serial.println("📤 Request HTTP enviado");

    String response = "";
    unsigned long timeout = millis();
    while(client.connected() || client.available()) {
        if(client.available()) {
            char c = client.read();
            response += c;
        }
        // Timeout de 5 segundos
        if(millis() - timeout > 5000) {
            Serial.println("⏱️ Timeout esperando respuesta del proxy");
            break;
        }
    }
    client.stop();

    Serial.println("\n📥 Respuesta del proxy:");
    Serial.println("-------------------------------------------");
    Serial.println(response);
    Serial.println("-------------------------------------------");
    
    // Analizar respuesta
    if(response.indexOf("200 OK") > 0 || response.indexOf("201") > 0) {
        Serial.println("✅ Datos guardados exitosamente en Supabase");
        
        // Parpadear LED para confirmar éxito
        digitalWrite(led1, HIGH);
        delay(200);
        digitalWrite(led1, LOW);
    } else if(response.indexOf("400") > 0 || response.indexOf("500") > 0) {
        Serial.println("❌ Error del servidor al guardar datos");
    } else if(response.length() == 0) {
        Serial.println("⚠️ Sin respuesta del proxy (posible timeout)");
    }
    
    Serial.println("===========================================\n");
}
