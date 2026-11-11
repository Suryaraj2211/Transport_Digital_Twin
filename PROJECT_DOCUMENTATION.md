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
   - Plate, Model, Category, Tracking Source, Assigned Driver (with 1-click reassign dropdown), Status, Actions.
   - **✏️ Edit**: Registration Plate, Model, Type, Tracking Source, Assigned Driver direct-ah edit pannalam.
   - **🗑️ Delete**: Unwanted vehicles delete pannalam (active trip-la irukkum pothu safe guard panni block pannum).
   - `+ Add Vehicle` inline form to register new trucks with driver assignment dropdown.
4. **Drivers Table (Tab 4):**
   - Name, Phone, Phone Type (Smartphone / Button Phone), Device Model, Assigned Truck (with 1-click reassign dropdown), Enga Ponum (Destination), Licence, Expiry, Actions.
   - **📲 Automated Toll-Free SMS Dispatch (Background & Silent)**:
     - Driver number add pannina udane automatic-ah driver phone-ku SMS dispatch aagum:
       `"Vanakkam [Name]! Ungal Vandi: [Plate] | Enga Ponum: [Destination]. Vandi start panradhuku munnadi intha number-ku oru missed call kuduthutu start pannunga: 1800-419-7890 (Trip automatic-ah start aagidum). Destination reach aana udane thirumba oru missed call kudunga. - V3 Logistics"`
     - Driver button phone-la antha SMS open panni 1800 number-ah single-click panni call pannittu vandi eduthutu kilambalaam.
     - Admin dashboard-la entha UI modal interruptions-um illama background-la silent-ah execute aagum.
     - Backend API: `POST /api/send-driver-sms`.
   - **✏️ Edit**: Name, Phone, Device, Truck, Destination (Enga Ponum), Licence, Expiry direct-ah popup modal-la edit pannalam.
   - **🗑️ Delete**: 1-click clean delete without annoying browser popups.
   - `+ Add Driver` inline form to add new drivers with truck assignment & destination.

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
4. **Button Phone SIM LBS Automated Dispatch (Zero Admin Work):**
   - **Method A: 📞 Toll-Free Missed Call Simulator (`1800-419-7890`):**
     - Admin dashboard-la top banner-la irukka **"📞 Simulate Missed Call"** button click pannunga.
     - System identifies incoming Caller ID (e.g. Ravi Kumar - Nokia 105), maps to his assigned truck, and **AUTOMATICALLY starts the trip**!
     - Destination reach aana udane marubadiyum **"📞 Simulate Missed Call"** click panna, trip **AUTOMATICALLY completes** and logs to Trip History!
   - **Method B: 🌐 Geofence Boundary Crossing (500m Gate Trigger):**
     - Click **"🌐 Simulate Geofence Gate Trigger"**.
     - Vandi Madhavaram Depot 500m geofence gate-ai thaandi veliya ponal (Exit) ➔ **Trip AUTO-STARTS (100% Hands-Free)**!
     - Destination Sriperumbudur Hub 500m boundary-kulla vanthal (Entry) ➔ **Trip AUTO-COMPLETES & logs duration & distance**!
   - Rendume Admin manual intervention illamal 100% automatic-aa operate aagum!
