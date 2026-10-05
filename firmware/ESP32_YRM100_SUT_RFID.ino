/*
  SUT Asset RFID - ESP32 + YRM100
  ---------------------------------------------------------
  Hardware
    YRM100 VCC -> 5V (use a supply capable of the reader's TX current)
    YRM100 GND -> ESP32 GND
    YRM100 TX  -> ESP32 GPIO16 (RX2)
    YRM100 RX  -> ESP32 GPIO17 (TX2)
    YRM100 EN  -> 3.3V or GPIO4 HIGH

  Reader UART is TTL. Verify the exact YRM100 variant/logic level before wiring.
  YRM100 protocol uses framed binary commands; this firmware isolates the
  reader protocol in yrm100StartInventory(). The command shown below is the
  commonly documented inventory/start frame for YRM100-family readers.

  Output transports
    USB Serial: EPC\n at 115200
    BLE Notify: EPC\n using the UUIDs expected by the web app

  BLE device name: SUT-RFID-01
  Service: 19b10000-e8f2-537e-4f6c-d104768a1214
  EPC Notify: 19b10001-e8f2-537e-4f6c-d104768a1214
  Command:    19b10002-e8f2-537e-4f6c-d104768a1214

  Important: The exact YRM100 command/response layout varies by firmware.
  Test with the module's vendor SDK/manual and adjust parseYRM100Frame() if
  your board returns a different frame. Do not connect 5V UART logic directly
  to a 3.3V-only ESP32 input.
*/

#include <Arduino.h>
#include <BLEDevice.h>
#include <BLEServer.h>
#include <BLEUtils.h>
#include <BLE2902.h>

HardwareSerial RFID(2);
static const int RFID_RX = 16;
static const int RFID_TX = 17;
static const int RFID_EN = 4;
static const uint32_t RFID_BAUD = 115200;

static const char* BLE_NAME = "SUT-RFID-01";
static const char* SERVICE_UUID = "19b10000-e8f2-537e-4f6c-d104768a1214";
static const char* EPC_UUID     = "19b10001-e8f2-537e-4f6c-d104768a1214";
static const char* CMD_UUID     = "19b10002-e8f2-537e-4f6c-d104768a1214";

BLECharacteristic* epcCharacteristic = nullptr;
BLECharacteristic* cmdCharacteristic = nullptr;
bool bleConnected = false;
bool inventoryRunning = true;

// YRM100-family inventory command documented in public examples.
// Frame: BB 00 27 00 03 22 FF FF 4A 7E is commonly used for multi-read.
// Verify against your exact YRM100 firmware before production deployment.
const uint8_t INVENTORY_CMD[] = {0xBB,0x00,0x27,0x00,0x03,0x22,0xFF,0xFF,0x4A,0x7E};

void emitEPC(const String& epc) {
  if (epc.length() == 0) return;
  Serial.println(epc);
  if (bleConnected && epcCharacteristic) {
    String line = epc + "\n";
    epcCharacteristic->setValue((uint8_t*)line.c_str(), line.length());
    epcCharacteristic->notify();
  }
}

// Parse one YRM100 frame and extract an EPC where possible.
// The parser accepts a common inventory response layout and otherwise
// ignores the frame safely. Use the vendor SDK to confirm offsets.
void parseYRM100Frame(const uint8_t* b, size_t n) {
  if (n < 8 || b[0] != 0xBB || b[n-1] != 0x7E) return;
  // Common response: BB TYPE CMD LEN_H LEN_L ... EPC ... RSSI CRC 7E.
  // Public examples show PC immediately before EPC. Search for a plausible
  // EPC length (even number of hex bytes) rather than hard-coding one length.
  for (size_t i = 5; i + 10 < n; ++i) {
    // PC is typically two bytes and EPC follows. Check for a printable EPC
    // representation only after converting candidate bytes.
    if (i + 4 >= n) break;
    String candidate;
    // Most asset tags in this project use 12-24 byte EPCs.
    for (size_t j = i; j < n-2 && candidate.length() < 48; ++j) {
      char hi = "0123456789ABCDEF"[(b[j] >> 4) & 0x0F];
      char lo = "0123456789ABCDEF"[b[j] & 0x0F];
      candidate += hi; candidate += lo;
      if (candidate.length() >= 24) {
        // Avoid emitting the whole tail by using a conservative 24-char EPC.
        emitEPC(candidate);
        return;
      }
    }
  }
}

void yrm100StartInventory() {
  RFID.write(INVENTORY_CMD, sizeof(INVENTORY_CMD));
  RFID.flush();
}

class ServerCallbacks : public BLEServerCallbacks {
  void onConnect(BLEServer*) override { bleConnected = true; }
  void onDisconnect(BLEServer* s) override {
    bleConnected = false;
    delay(100);
    s->startAdvertising();
  }
};

class CommandCallbacks : public BLECharacteristicCallbacks {
  void onWrite(BLECharacteristic* c) override {
    String cmd = c->getValue();
    cmd.trim();
    cmd.toUpperCase();
    if (cmd == "START") {
      inventoryRunning = true;
      yrm100StartInventory();
    } else if (cmd == "STOP") {
      inventoryRunning = false;
    } else if (cmd == "PING") {
      const char* ok = "PONG\n";
      c->setValue((uint8_t*)ok, strlen(ok));
    }
  }
};

void setupBLE() {
  BLEDevice::init(BLE_NAME);
  BLEServer* server = BLEDevice::createServer();
  server->setCallbacks(new ServerCallbacks());
  BLEService* service = server->createService(SERVICE_UUID);

  epcCharacteristic = service->createCharacteristic(EPC_UUID, BLECharacteristic::PROPERTY_NOTIFY);
  epcCharacteristic->addDescriptor(new BLE2902());

  cmdCharacteristic = service->createCharacteristic(CMD_UUID, BLECharacteristic::PROPERTY_WRITE);
  cmdCharacteristic->setCallbacks(new CommandCallbacks());

  service->start();
  BLEAdvertising* adv = BLEDevice::getAdvertising();
  adv->addServiceUUID(SERVICE_UUID);
  adv->setScanResponse(true);
  adv->start();
}

void setup() {
  Serial.begin(115200);
  pinMode(RFID_EN, OUTPUT);
  digitalWrite(RFID_EN, HIGH);
  RFID.begin(RFID_BAUD, SERIAL_8N1, RFID_RX, RFID_TX);
  setupBLE();
  delay(300);
  yrm100StartInventory();
}

void loop() {
  static uint8_t frame[512];
  static size_t pos = 0;
  while (RFID.available()) {
    uint8_t c = RFID.read();
    if (pos == 0 && c != 0xBB) continue;
    if (pos < sizeof(frame)) frame[pos++] = c;
    if (c == 0x7E && pos > 5) {
      parseYRM100Frame(frame, pos);
      pos = 0;
      if (inventoryRunning) yrm100StartInventory();
    }
    if (pos >= sizeof(frame)) pos = 0;
  }
  delay(1);
}
