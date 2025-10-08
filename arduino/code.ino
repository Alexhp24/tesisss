#include <WiFi.h>
#include <HTTPClient.h>
#include "DHT.h"

#define DHTPIN 14
#define DHTTYPE DHT22
#define FAN_PIN 18
#define HEATER_PIN 19

DHT dht(DHTPIN, DHTTYPE);

//WiFi de Wokwi
const char* ssid = "Wokwi-GUEST";
const char* password = "";

//URL del servidor de Render 
const char* serverName = "https://tesisss.onrender.com/api/datos";

void setup() {
  Serial.begin(115200);
  dht.begin();

  pinMode(FAN_PIN, OUTPUT);
  pinMode(HEATER_PIN, OUTPUT);

  Serial.print("🔌 Conectando a WiFi");
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\n✅ Conectado a WiFi exitosamente");
}

void loop() {
  float temperatura = dht.readTemperature();
  String estado;

  if (isnan(temperatura)) {
    Serial.println("⚠️ Error leyendo el sensor DHT!");
    return;
  }

  //  Control de ventilador Y calefactor
  if (temperatura > 30) {
    digitalWrite(FAN_PIN, HIGH);
    digitalWrite(HEATER_PIN, LOW);
    estado = "Ventilador encendido - Calor detectado";
  } 
  else if (temperatura < 20) {
    digitalWrite(FAN_PIN, LOW);
    digitalWrite(HEATER_PIN, HIGH);
    estado = "Calefactor encendido - Frio detectado";
  } 
  else {
    digitalWrite(FAN_PIN, LOW);
    digitalWrite(HEATER_PIN, LOW);
    estado = "Temperatura normal - Todo apagado";
  }

  Serial.print("🌡️ Temperatura: ");
  Serial.print(temperatura);
  Serial.print(" °C | Estado: ");
  Serial.println(estado);

  //  Enviar datos al backend de index.js
  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    http.begin(serverName);
    http.addHeader("Content-Type", "application/json");

    String payload = "{\"temperatura\":" + String(temperatura) + ",\"estado\":\"" + estado + "\"}";
    int httpResponseCode = http.POST(payload);

    Serial.print("📡 Respuesta del servidor: ");
    Serial.println(httpResponseCode);

    http.end();
  } else {
    Serial.println("❌ WiFi desconectado, no se pudo enviar datos");
  }

  delay(500); 
}
