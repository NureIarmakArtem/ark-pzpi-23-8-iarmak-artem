#include <Arduino.h>
#include <WiFi.h>
#include <HTTPClient.h>
#include <Preferences.h>

// --- НАЛАШТУВАННЯ ---
const char* ssid = "Wokwi-GUEST"; 
const char* password = "";
const char* serverUrl = "http://192.168.0.104:3000/api"; 

String loginData = "{\"login\":\"courier3\",\"password\":\"123\"}";

Preferences preferences;

String token = "";
// Маршрут
float route[][2] = {
  {49.9935, 36.2304}, {49.9942, 36.2310}, {49.9950, 36.2315},
  {49.9958, 36.2321}, {49.9965, 36.2328}, {49.9972, 36.2334},
  {49.9980, 36.2340}, {49.9988, 36.2345}, {49.9995, 36.2351},
  {50.0003, 36.2356}
};
int routeLen = 10;
int currentIdx = 0;

#define BTN_PIN 15

void connectWiFi() {
  Serial.print("Connecting to WiFi");
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println(" Connected!");
}

void login() {
  if(WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    http.begin(String(serverUrl) + "/auth/login");
    http.addHeader("Content-Type", "application/json");
    
    Serial.println("Logging in...");
    int code = http.POST(loginData);
    
    if (code == 200) {
      String payload = http.getString();
      int start = payload.indexOf("token") + 8; 
      int end = payload.indexOf("\"", start);
      token = payload.substring(start, end);
      
      Serial.println("Auth Success! Token received.");
      
      preferences.begin("my-app", false);
      preferences.putString("token", token);
      preferences.end();
      Serial.println("[MEMORY] Token saved to Flash memory.");
      
    } else {
      Serial.print("Login Failed: ");
      Serial.println(code);
    }
    http.end();
  }
}

void loadToken() {
  preferences.begin("my-app", true);
  token = preferences.getString("token", "");
  preferences.end();
  
  if (token != "") {
    Serial.println("[MEMORY] Token restored from Flash memory!");
  } else {
    Serial.println("[MEMORY] No saved token found.");
  }
}

void factoryReset() {
  Serial.println("\n--- FACTORY RESET STARTED ---");
  
  preferences.begin("my-app", false);
  preferences.clear();
  preferences.end();
  
  Serial.println("[MEMORY] All settings wiped.");
  Serial.println("Rebooting system...");
  delay(1000);
  
  ESP.restart();
}

void sendTelemetry() {
  if (token == "") {
    login();
    if (token == "") return;
  }
  
  HTTPClient http;
  http.begin(String(serverUrl) + "/location");
  http.addHeader("Content-Type", "application/json");
  http.addHeader("Authorization", "Bearer " + token);
  
  String lat = String(route[currentIdx][0], 4);
  String lon = String(route[currentIdx][1], 4);
  String json = "{\"coordinates\": {\"lat\":" + lat + ",\"lon\":" + lon + "}}";
  
  Serial.print("Sending: ");
  Serial.println(json);
  
  int code = http.POST(json);

  if (code == 401) {
    Serial.println("Token expired. Clearing memory...");
    token = "";
    preferences.begin("my-app", false);
    preferences.clear();
    preferences.end();
  }
  
  Serial.print("Status: ");
  Serial.println(code); 
  http.end();

  currentIdx = (currentIdx + 1) % routeLen;
}

void setup() {
  Serial.begin(115200);
  pinMode(BTN_PIN, INPUT_PULLUP);
  
  connectWiFi();

  loadToken();

  if (token == "") {
    login();
  }
}

void loop() {
  if (digitalRead(BTN_PIN) == LOW) {
    factoryReset();
  }
  
  sendTelemetry();
  delay(5000); 
}