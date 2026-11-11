# Fleet Tracker Pro — Clean Logistics & Trip Tracking System

> **Simple Admin Dashboard + One-Tap Driver Mobile Portal with Real-Time Start/End Trip Tracking**

---

## 1. Project Overview & Architecture

Neenga ketta requirement-ku erpa:
1. **App irukkura drivers-ku first clean requirement mudichittom**:
   - Driver app open pannina udane GPS automatic-ah on aagidum (`navigator.geolocation`).
   - Driver **"🟢 START TRIP"** click pannum pothu mattum thaan tracking start aagum (Start Time + Start Location record aagum).
   - Trip mudiyum pothu **"🛑 END TRIP"** click pannina tracking stop aagi End Time, End Location, Duration, Distance, Avg Speed calculate aagidum.
2. **Admin Dashboard romba simple table-based design**:
   - Driver details & Truck details list.
   - **Trip History Table**: Eppo start aachu, enga start aachu, eppo end aachu, enga end aachu, evlo neram aachu, evlo km, speed ellam clear-ah row-by-row irukkum.
   - **Live Status Cards**: Yararu eppo vandi otturanga, evlo speed-la poranga, running duration evlo ellam live-ah kaattum.
   - Excel CSV download option.

---

## 2. Folder Structure

```
Truck_Project/
├── admin/                         <-- 🏢 Admin Dashboard
│   ├── index.html                 <-- Clean overview, tables & trip ledger
│   ├── admin.css                  <-- Professional IBM Plex styling
│   └── admin.js                   <-- Real-time sync, trip history, 2s ticker
│
├── driver/                        <-- 🚚 Driver Mobile Portal
│   ├── index.html                 <-- Big start/end button, speedometer, stats
│   ├── driver.css                 <-- Mobile-first clean layout
│   └── driver.js                  <-- Auto GPS, one-tap start/stop, BroadcastChannel
│
├── server.js                      <-- ⚡ Node.js HTTP Server (Port 5000)
└── PROJECT_DOCUMENTATION.md
```

---

## 3. How It Works (Step-by-Step)

### A. Driver Mobile Portal (`http://localhost:5000/driver/`)

1. **Auto GPS On Page Load:**
   - Driver browser-la app open pannina udane GPS coordinates automatic-ah lock aagum.
   - GPS Locked ✓ banner kaattum.
2. **Trip Start ("🟢 START TRIP"):**
   - Driver vandi start pannum pothu big green button-ah click pannuvanga.
   - App udane:
     - **Start Time** (e.g. `10:14 AM`)
     - **Start Location** (e.g. `Chennai Port Terminal`)
     - GPS Lat/Lng
     register panni Admin Dashboard-ku message anuppidum.
   - Button **"🛑 END TRIP"**-nu red colour-la maaridum.
   - Status **"ON TRIP"**-nu aagidum.
   - **Live Speedometer** & **Trip Duration Timer** (HH:MM:SS) start aagum.
   - Speed 60 km/h mela pona **⚠️ OVERSPEED ALERT** kaattum.
   - Vandi 30 seconds-ku mela 0 km/h-la ninna **Halt Timer** + Reason dropdown open aagum (Toll, Food, Loading, Fuel).
3. **Trip End ("🛑 END TRIP"):**
   - Destination poi serndhavudan red button-ah click pannuvanga.
   - App udane:
     - **End Time** (e.g. `10:45 AM`)
     - **End Location** (e.g. `Sriperumbudur Industrial Hub`)
     - Total Duration, Distance (km), Avg Speed
     calculate panni **Trip Summary Card** kaattum.
   - Tracking stop aagi Admin Dashboard-ku `END_TRIP` status update aagidum.

---

### B. Admin Dashboard (`http://localhost:5000/admin/`)

1. **Dashboard Overview (Tab 1):**
   - **Top Metrics Ribbon**: Total Vehicles (4), Active Trips (1), Completed Today (2), Total Drivers (4).
   - **Live Vehicle Cards**: Ovvoru truck-kum separate card:
     - Truck Plate & Model
     - Assigned Driver & Phone
     - Status: `🟢 Driving (58 km/h)` or `🔴 Stopped` or `⚪ No Trip`
     - Started Time, From Location, Running Duration (seconds-by-seconds live update!)
2. **Trip History (Tab 2):**
   - Complete ledger table:
     | Trip # | Truck Plate | Driver Name | Start Time | Start Location | End Time | End Location | Duration | Avg Speed | Distance | Status |
   - Active trips `🟢 Active` status-oda live duration kaattum.
   - Completed trips `✅ Completed` status-oda total duration, distance, avg speed kaattum.
   - **"📥 Export CSV"** click panna Excel sheet download aagum.
3. **Vehicles Table (Tab 3):**
   - Plate, Model, Category, Tracking Source, Driver, Status.
   - `+ Add Vehicle` inline form to register new trucks.
4. **Drivers Table (Tab 4):**
   - Name, Phone, Phone Type, Device Model, Assigned Truck, Licence, Expiry.
   - `+ Add Driver` inline form to add new drivers.

---

## 4. Real-Time Sync (Cross-Tab Communication)

- Driver portal-um Admin dashboard-um **`BroadcastChannel('fleet-tracker-sync')`** moolama real-time-la communicate pannum.
- `localStorage` fallback-um irukku — oru tab-la start pannina, innoru tab refresh pannama direct-ah update aagum!
- Events supported:
  - `START_TRIP` ➔ Admin creates new live trip, status becomes `driving`.
  - `END_TRIP` ➔ Admin completes trip, records end time & location.
  - `SPEED_UPDATE` ➔ Admin updates live speed & odometer.
  - `LOCATION_UPDATE` ➔ Admin updates current location name.

---

## 5. How to Run & Test

Server already running on port 5000!

Terminal command (if needed to restart):
```powershell
node server.js
```

Browser-la open pannunga:
1. **Admin Dashboard:**
   👉 [http://localhost:5000/admin/](http://localhost:5000/admin/)
2. **Driver Portal:**
   👉 [http://localhost:5000/driver/](http://localhost:5000/driver/)

### Quick Test Scenario:
1. Left side tab-la Admin Dashboard open pannikonga: [http://localhost:5000/admin/](http://localhost:5000/admin/)
2. Right side tab-la Driver Portal open pannikonga: [http://localhost:5000/driver/](http://localhost:5000/driver/) (Tip: Browser cache clear aaga `Ctrl + Shift + R` hard refresh pannavum).
3. **Smartphone App Driver Test (Murugan K / Selvam R):**
   - Driver screen-la **"🟢 START TRIP"** click pannunga.
   - Admin-la udane toast notification varum: `🟢 Trip started: TN 09 AB 1234 — Murugan K from Chennai Central Transport Corridor`
   - Active Trips count increase aagum!
   - Driver screen-la **"🚗 Drive 55 km/h"** or **"⚡ Overspeed 72 km/h"** click pannunga — live-aa distance `0.02 km`, `0.04 km`, `0.06 km` second-by-second increase aagum!
   - "📍 Simulated Location" dropdown-la location maathina, Admin card-layum new area name sync aagum!
   - Trip mudiyumpothu **"🛑 END TRIP"** click pannunga — full trip summary (Start/End location & time, Duration, Distance, Avg speed) calculate aagidum!
4. **Button Phone SIM LBS Driver Test (Ravi Kumar - Nokia 105 / Venkatesh P - Samsung Guru):**
   - Button phone-la app install panna mudiyadhadhaala, Admin Dashboard-la `v3` / `v4` card-la irukka **"▶ Start SIM Trip"** button-ai click pannunga.
   - Admin initiates telecom cellular tower triangulation ping; vehicle status `Driving` aagum, live duration and speed variation automatically update aagum!
   - Trip mudiyumpothu Admin card-la **"⏹ End Trip"** click panni trip complete pannalaam.
