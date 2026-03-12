#include <WiFi.h>
#include <HTTPClient.h>

const char* WIFI_SSID = "Nityanand";
const char* WIFI_PASSWORD = "siddhi7737";
const char* SOS_ENDPOINT = "http://192.168.0.102:3001/api/beacon/sos";
const char* DEVICE_ID = "ESP32_BEACON_1";
const char* DEVICE_KEY = "change-me-beacon-key";

const int BUTTON_PIN = 0;
const int BUZZER_PIN = 2;

const unsigned long DEBOUNCE_MS = 250;
const unsigned long WIFI_CONNECT_TIMEOUT_MS = 20000;
const int MAX_RETRIES = 3;

bool lastButtonState = HIGH;
unsigned long lastButtonChangeMs = 0;

void beep(int durationMs) {
  digitalWrite(BUZZER_PIN, HIGH);
  delay(durationMs);
  digitalWrite(BUZZER_PIN, LOW);
}

void beepSuccess() {
for(int i = 0; i < 3; i++) {

    // S (dot dot dot)
    beep(100);
    delay(100);
    beep(100);
    delay(100);
    beep(100);
    delay(300);

    // O (dash dash dash)
    beep(300);
    delay(100);
    beep(300);
    delay(100);
    beep(300);
    delay(300);

    // S (dot dot dot)
    beep(100);
    delay(100);
    beep(100);
    delay(100);
    beep(100);

    delay(700); // gap before repeating SOS
  }
}

void beepFailure() {
  beep(500);
}

void ensureWiFiConnected() {
  if (WiFi.status() == WL_CONNECTED) {
    return;
  }

  Serial.println("WiFi disconnected. Reconnecting...");
  WiFi.mode(WIFI_STA);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);

  unsigned long startedAt = millis();
  while (WiFi.status() != WL_CONNECTED && millis() - startedAt < WIFI_CONNECT_TIMEOUT_MS) {
    delay(500);
    Serial.print(".");
  }

  Serial.println();
  if (WiFi.status() == WL_CONNECTED) {
    Serial.print("Connected. IP: ");
    Serial.println(WiFi.localIP());
  } else {
    Serial.println("WiFi connection timed out");
  }
}

String buildSOSPayload() {
  return String("{") +
    "\"source\":\"beacon\"," +
    "\"type\":\"manual_sos\"," +
    "\"beacon_id\":\"" + String(DEVICE_ID) + "\"," +
    "\"pressed_at\":\"" + String(millis()) + "\"," +
    "\"firmware_version\":\"1.0.0\"," +
    "\"battery_level\":100" +
  "}";
}

bool sendSOS() {
  ensureWiFiConnected();

  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("Cannot send SOS: no WiFi");
    return false;
  }

  HTTPClient http;
  WiFiClient client;
  http.begin(client, SOS_ENDPOINT);
  http.addHeader("Content-Type", "application/json");
  http.addHeader("x-device-id", DEVICE_ID);
  http.addHeader("x-device-key", DEVICE_KEY);

  String payload = buildSOSPayload();
  Serial.println("Sending SOS payload:");
  Serial.println(payload);

  int httpResponseCode = http.POST(payload);
  String responseBody = http.getString();

  Serial.print("HTTP Response Code: ");
  Serial.println(httpResponseCode);
  Serial.print("Response Body: ");
  Serial.println(responseBody);

  http.end();
  return httpResponseCode >= 200 && httpResponseCode < 300;
}

void sendSOSWithRetry() {
  for (int attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    Serial.print("SOS attempt ");
    Serial.print(attempt);
    Serial.print(" of ");
    Serial.println(MAX_RETRIES);

    if (sendSOS()) {
      Serial.println("SOS sent successfully");
      beepSuccess();
      return;
    }

    if (attempt < MAX_RETRIES) {
      unsigned long backoffMs = attempt * 2000;
      Serial.print("Retrying in ");
      Serial.print(backoffMs);
      Serial.println(" ms");
      delay(backoffMs);
    }
  }

  Serial.println("Failed to send SOS after all retries");
  beepFailure();
}

void setup() {
  Serial.begin(115200);

  pinMode(BUTTON_PIN, INPUT_PULLUP);
  pinMode(BUZZER_PIN, OUTPUT);
  digitalWrite(BUZZER_PIN, LOW);

  delay(1000);
  Serial.println("Aurora Beacon starting...");

  beep(100);
  ensureWiFiConnected();
}

void loop() {
  if (WiFi.status() != WL_CONNECTED) {
    ensureWiFiConnected();
  }

  bool currentButtonState = digitalRead(BUTTON_PIN);

  if (currentButtonState != lastButtonState) {
    lastButtonChangeMs = millis();
    lastButtonState = currentButtonState;
  }

  if (currentButtonState == LOW && millis() - lastButtonChangeMs > DEBOUNCE_MS) {
    Serial.println("SOS button pressed");
    beep(150);
    sendSOSWithRetry();

    while (digitalRead(BUTTON_PIN) == LOW) {
      delay(20);
    }

    lastButtonState = HIGH;
    lastButtonChangeMs = millis();
  }

  delay(20);
}
