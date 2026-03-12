# ESP32 Beacon Setup

## 1. Create the test student

Run the backend user seed first if `student@test.com` does not exist:

```bash
cd backend
npm.cmd run seed:users
```

## 2. Create the test beacon

Run these SQL files in Supabase SQL editor in this order:

1. `backend/src/db/migrations/add_beacons.sql`
2. `backend/src/db/seeds/seed_test_beacon.sql`

The default local-development device credentials are:

- Device ID: `ESP32_BEACON_1`
- Device key: `change-me-beacon-key`

## 3. Flash the ESP32 sketch

Open [`esp32/AuroraBeacon/AuroraBeacon.ino`](C:/Users/jeetp/aurora-sentinel%20(10)/aurora-sentinel/esp32/AuroraBeacon/AuroraBeacon.ino) in Arduino IDE.

Update these constants before flashing:

- `WIFI_SSID`
- `WIFI_PASSWORD`
- `SOS_ENDPOINT`
- `DEVICE_ID`
- `DEVICE_KEY`
- `BUTTON_PIN`

## 4. Start the backend

```bash
cd backend
npm.cmd run dev
```

## 5. Test the flow

1. Open the security dashboard.
2. Power the ESP32.
3. Press the button.
4. Check backend logs for `POST /api/beacon/sos`.
5. Confirm a new SOS appears in the dashboard.

## Notes

- The beacon route is `POST /api/beacon/sos`.
- Auth headers are `x-device-id` and `x-device-key`.
- The sketch retries failed requests up to 3 times.
- For production, replace the default device key and regenerate the bcrypt hash.
