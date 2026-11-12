# 🚛 V3 Logistics — Fleet Operations & Trip Tracking Platform

> **Created by: Varatharajan · Surya · Akash (V3 Team)**  
> **Enterprise-grade real-time digital twin & commercial road fleet telematics platform designed for Indian freight logistics.**  
> Built with zero external dependencies using pure vanilla JavaScript, HTML5, Leaflet.js, and a native Node.js HTTP server. Features Dual-Mode tracking (Smartphone GPS + Feature Phone SIM LBS), Forest & Ghat Dead-Zone Telematics, and an end-to-end synchronized 4-module operations pipeline.

---

## 🌟 Key Highlights & Architectural Overview

- **⚡ Zero External Dependencies:** Pure vanilla JavaScript (ES6+), HTML5, custom CSS design system, Leaflet.js, and a native Node.js server. No heavy `node_modules` or complex build pipelines required.
- **🔄 Dual-Mode Tracking Architecture:**
  1. **Smartphone GPS Tracking (Driver App):** High-precision browser Geolocation API with live route breadcrumb logging, digital speedometer, overspeed warnings (>60 km/h), automated halt idle detection, and trip lifecycle controls.
  2. **Feature Phone / Telecom SIM LBS Tracking (Admin Control):** Remote cellular tower triangulation simulation for basic keypad phone drivers (Nokia 105, Samsung Guru) with an interactive ~850m radius coverage visualizer (`📡`) and admin-initiated dispatch.
- **🌲 Forest & Remote Dead-Zone Resilience (No Network / Ghat Roads):**
  - **Satellite GPS Offline BlackBox:** Hardware GPS chips communicate directly with orbital satellite constellations (US GPS & Indian NavIC/IRNSS) requiring **zero cellular data**. Caches breadcrumbs every 5s in offline memory and auto-syncs (**Burst Sync**) upon network return.
  - **Dead Reckoning (DR) & Corridor Projection:** When cellular SIM tracking loses signal in remote valleys or forests, the system interpolates vehicle position along the road corridor based on the last known BTS tower, timestamp, and average transit speed.
- **🗺️ High-Contrast Dual-Layer Map Dock:**
  - 🛰️ **Satellite Hybrid (Default):** High-resolution ESRI Aerial Satellite Imagery integrated with crisp town, city, district, and regional highway labels.
  - 🗺️ **Streets View:** OpenStreetMap detailed road network.
- **🛣️ Dynamic Route Generation:** Trucks dynamically draw their route polylines behind them as they move along actual Tamil Nadu regional freight corridors (NH 48, GST Road, NH 716, Ennore Port Expressway, Chennai Bypass).
- **🏢 Central Operations Dashboard:** 6 real-time KPI ribbon cards, second-by-second trip duration ticker, live speed & location sync, trip history ledger table, and single-click RFC-compliant CSV export.
- **📡 Real-Time Cross-Tab Synchronization:** Uses the browser `BroadcastChannel` API with `localStorage` fallback for instantaneous multi-window event synchronization.

---

## 🌲 Forest & Low-Network Tracking Architecture (No Network / Dead Zone)

Commercial freight in India frequently crosses dense forests, ghats, and rural corridors (e.g., Western Ghats, Jawadhu Hills, Sathyamangalam forest roads) where mobile cellular signals drop completely. V3 Logistics solves this through a multi-tier resilience architecture:

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│              FOREST & DEAD-ZONE TELEMATICS RESILIENCE ENGINE                     │
└──────────────────────────────────────────────────────────────────────────────────┘

 ┌──────────────────────────────────────┐     ┌────────────────────────────────────┐
 │     SMARTPHONE DRIVER APP (GPS)      │     │    FEATURE PHONE (SIM LBS / 2G)    │
 └──────────────────┬───────────────────┘     └─────────────────┬──────────────────┘
                    │                                           │
  🛰️ Direct MEO Satellite Constellation               📶 High-Penetration 2G GSM
     (US GPS + Indian NavIC/IRNSS)                       (900 MHz BSNL / Airtel)
     *Zero Mobile Internet Required*                     *Extended 15-20 km Range*
                    │                                           │
                    ▼                                           ▼
  💾 Offline "Store-and-Forward" Caching              🧭 Dead Reckoning & Corridor
     Every 5s: Lat/Lng, Speed, Odometer                  Projection (DR Algorithm)
     Buffered in IndexedDB / LocalStorage                Projects position via Last Known
                    │                                    BTS Tower, Time & Transit Speed
                    ▼                                           │
  ⚡ Network Re-Acquisition (Burst Sync)                        ▼
     Auto-dispatches accumulated breadcrumbs          🏢 Forest Checkpost & FASTag RFID
     Server draws complete gapless route                 Scanned at forest gate entry/exit
```

### 1. Smartphone GPS Mode (Direct Satellite + Offline BlackBox)
1. **Direct Satellite Reception:** Hardware GPS chips communicate directly with orbital satellites (US GPS + India's NavIC). **Mobile data is NOT required to determine coordinates and speed.**
2. **Store-and-Forward Caching:** When internet connectivity is lost in a forest dead-zone, the app continues logging timestamped coordinates, speed, and odometer increments every 5 seconds into local offline memory (`IndexedDB` / `localStorage`).
3. **Burst Synchronization:** As soon as the truck exits the forest and connects to a 2G/4G tower, the backlog of points is uploaded to the server in a single burst, rendering the complete route without missing a single turn.

### 2. Feature Phone SIM LBS Mode (2G Penetration + Dead Reckoning)
1. **Long-Range 2G Frequency (900 MHz):** 4G/5G signals attenuate rapidly through dense tree canopies. Basic 2G GSM operating at 900 MHz penetrates up to 15–20 km into forest peripheries.
2. **Dead Reckoning (DR) Algorithm:** If the cellular link drops, the system uses the last known BTS tower checkpoint, departure time, and typical truck cruising speed (40–45 km/h) to project the vehicle's position along the designated corridor.
3. **Status Alerts:** The admin UI marks the vehicle with `📶 Standby / Forest Dead Zone (Dead Reckoning Active)` with a projected breadcrumb trail until the next cell tower handshake.
4. **Forest Checkposts & FASTag RFID:** Integration with forest gate checkposts and toll plazas provides verified arrival/departure timestamps even in zero-network regions.

---

## 🚗 Fleet Inventory & Tracking Mode Assignment

The platform comes pre-seeded with 6 commercial vehicles and 6 verified professional drivers mapped to actual Tamil Nadu freight corridors:

| Vehicle ID | Registration Plate | Truck Model & Type | Assigned Driver | Device & Telecom Mode | Starting Location & Dedicated Corridor |
|---|---|---|---|---|---|
| **v1** | `TN 09 AB 1234` | Tata Prima 4028.S (28T) | Murugan K | 📱 Android · **Driver App GPS** | Sriperumbudur Hub ➔ NH 48 Logistics Corridor |
| **v2** | `TN 22 CD 5678` | Ashok Leyland 2820 (20T) | Selvam R | 📱 Android · **Driver App GPS** | Chengalpattu ➔ GST Road Industrial Bay |
| **v3** | `KA 01 EF 9012` | Eicher Pro 6028 (28T) | Imran Pasha | 📱 Android · **Driver App GPS** | Kanchipuram ➔ NH 48 Freight Bypass |
| **v4** | `TN 38 GH 3456` | Mahindra Furio 7 (7T LCV) | Ravi Kumar | 📞 Nokia 105 · **Telecom SIM LBS** (Airtel) | Tiruvallur Hub ➔ NH 716 Industrial Corridor |
| **v5** | `AP 39 JK 7788` | BharatBenz 3128 (28T) | Venkatesh P | 📞 Samsung Guru · **Telecom SIM LBS** (Jio) | Minjur / Ennore North Port Expressway |
| **v6** | `TN 07 LM 2468` | Tata Signa 4825.TK (35T) | Anbu Selvan | 📱 Android · **Driver App GPS** | Ambattur North Bay ➔ Chennai Bypass Corridor |

---

## 🏢 Central Admin Operations Dashboard (`/admin/`)

The Admin Dashboard provides complete, real-time command over the entire fleet through 4 specialized operational modules:

### 1. Dashboard Overview & Interactive Live Map
- **Top Metric Cards:**
  - `TOTAL VEHICLES` (6 active commercial carriers)
  - `ACTIVE TRIPS` (Real-time live trips currently in transit)
  - `VEHICLES HALTED` (Vehicles stopped for rest/loading)
  - `COMPLETED TODAY` (Trips concluded within the current shift)
  - `TOTAL DRIVERS` (Registered crew members)
  - `FLEET DISTANCE TODAY` (Cumulative kilometers logged)
- **Interactive Leaflet Map Dock:**
  - **Map Type Switcher:** Instant toggle between 🛰️ **Satellite Hybrid** (Aerial imagery with town/place labels) and 🗺️ **Streets** (OpenStreetMap).
  - **Route Filter Toggle:** Switch between `🛣️ All Routes` (displays all active vehicle routes simultaneously) and `🎯 Focused Route` (isolates the selected truck).
  - **Show All Vehicles Button:** Auto-pans and bounds the viewport to fit all 6 fleet vehicles with comfortable padding.
  - **Dynamic Route Drawing:** Trucks dynamically generate route polylines behind them as they advance along realistic highway waypoints.
  - **High-Contrast Route Styling:** Selected vehicle is highlighted with a bold solid Royal Blue line (`#1d4ed8`), while all other vehicles feature high-contrast dashed cyan polylines (`#0284c7`) with white underlay casing lines.
- **Left Fleet Quick-Filter Sidebar:**
  - Quick filter tabs: `All 6`, `Moving 3`, `Halt 1`, `Offline 2`.
  - Vehicle cards showing registration plate, assigned driver, live speed, and status indicator dots. Clicking any card instantly centers the map on that vehicle.
- **Right Detailed Vehicle Inspection Panel:**
  - **Vehicle Info:** Registration number, truck model, category, and source badge (`📶 Telecom SIM LBS` vs `📱 Driver App GPS`).
  - **Driver Profile Card:** Initials avatar, duty status, phone number, and click-to-call link.
  - **Live Trip Card:** Live elapsed duration (ticking second-by-second), starting location, destination, and current speed.
  - **Halt Management:** Live halt timer with driver-selected halt reasons (e.g. Tea Break, Toll Gate, Tyre Check, Food/Rest).
  - **Telematics Diagnostics:** Dedicated freight corridor name with progress percentage bar (%), cellular signal status (Carrier, Cell ID, RSSI in dBm), battery gauge, and ignition status.
  - **SIM Dispatch Controls:** Direct admin buttons for keypad phone drivers (`▶️ Admin: Start SIM Trip`, `🛑 Admin: End Trip`, `📡 Ping Tower`).
  - **Cell Tower Triangulation Visualizer:** Clicking "📡 Ping Tower" renders an authentic ~850m radius LBS circle with a pulsing cellular antenna pin (`📡`) on the live map.

### 2. Vehicles Fleet Table
- Tabular ledger of all vehicles in the fleet.
- Columns: Registration Plate, Model & Capacity, Category, Tracking Source, Assigned Driver (with 1-click reassign dropdown), Status Badge (`🟢 Driving`, `🟠 Halted`, `⚪ Offline`, `🔴 Stopped`), and Actions.
- **Add Vehicle:** Modal form to register new vehicles with truck type and driver assignment.
- **Edit Vehicle:** In-place modal to modify plate, model, capacity, and tracking mode.
- **Delete Protection:** Safeguard prevents deleting vehicles that currently have an active trip.

### 3. Drivers Management Table
- Tabular ledger of all crew members.
- Columns: Driver Name, Contact Number, Phone Classification (`📱 Smartphone (Android)` vs `📞 Button Phone (Keypad)`), Device Model, Assigned Truck (with 1-click reassign dropdown), Destination Hub, Driving Licence Number, Licence Expiry Date, and Dispatch Actions.
- **Automated Toll-Free SMS Dispatch:** Background integration sends driver assignment details and toll-free instructions via SMS (`POST /api/send-driver-sms`).
- **Add / Edit Driver Modals:** Easily onboard new drivers or update licence details.

### 4. Trip History Ledger Table
- Complete operational audit trail of all historical and active journeys.
- Columns: Trip ID, Truck Plate & Model, Driver Name, Start Time & Location, End Time & Location, Total Duration, Halt Duration & Reason, Distance Covered (km), Average Speed (km/h), Trip Status (`🟢 Active` vs `✅ Completed`), and Tracking Source Badge.
- **Export CSV Button:** One-click instant download of an RFC-compliant `.csv` report formatted for Microsoft Excel, Google Sheets, and enterprise accounting audits.

---

## 🚚 Driver Smartphone Portal (`/driver/`)

The Driver Portal is an ultra-clean, mobile-first interface optimized for smartphone-equipped truck drivers on the road:

- **Automatic GPS Lock:** Uses `navigator.geolocation` on page load to automatically acquire high-precision satellite coordinates without requiring manual configuration.
- **Driver Switcher Dropdown:** Fast switching between registered smartphone driver profiles (`d1`: Murugan K, `d2`: Selvam R, `d3`: Imran Pasha, `d6`: Anbu Selvan) with truck plate, model, and destination details.
- **One-Tap Trip Management:**
  - Big prominent **"🟢 START TRIP"** button locks initial coordinates, timestamps the departure, and switches to active transit mode.
  - Switches to **"🛑 END TRIP"** upon departure. Tapping it concludes the journey, generates a trip summary card, and archives the journey.
- **🗺️ Live Highway Corridor Navigation Mini-Map:**
  - **Route Corridor Card:** Displays `🟢 START: [Origin Hub]` ➔ `🏁 DESTINATION: [Destination Hub]` with live highway name.
  - **Start & Destination Visual Pins:** Prominent `🟢 START` origin pin and `🏁 DESTINATION` checkered arrival pin.
  - **Road-Snapped Navigation Ribbon:** Real NH 48 / GST Road dual-layer route line with directional chevrons (`➤`) indicating the heading toward destination.
  - **Recenter Control (🎯):** Instantly bounds map view to the truck and active highway corridor.
- **⚡ Compact 3-Column Cockpit Telematics:**
  - `⏱️ Trip Duration` (hh:mm:ss real-time ticker).
  - `⚡ Current Speed` (Digital speed in km/h + legal 60 km/h speed limit pill + 4px dynamic color-coded progress bar: Emerald `<45`, Amber `45-60`, Red `>60`).
  - `🛣️ Odometer Distance` (real-time km).
  - **Audio & Visual Overspeed Warning:** Triggers an alert banner and triangle acoustic chime when exceeding 60 km/h.
- **Automated Halt Idle Detection:**
  - If the vehicle remains stationary (0 km/h) for more than 10 seconds, the halt detection panel activates.
  - **Touch-Friendly Quick Reason Chips:** 🚧 Toll Plaza, 📦 Loading / Unloading, ☕ Tea Break, 🍱 Food Break, ⛽ Fuel Stop, 🚦 Traffic Jam, 🔧 Tyre / Mechanical.
  - Selected reason is synchronized in real time to the Admin Live Inspection Panel and Trip History!
- **Demo Simulation Controls:**
  - `🚗 Drive 55 km/h` — Simulates normal highway cruising speed.
  - `⚡ Overspeed 72 km/h` — Simulates overspeed conditions to test safety alerts.
  - `🛑 Stop 0 km/h` — Simulates vehicle coming to a complete stop.
  - **Simulated Location Dropdown:** Fast-switch coordinates across key Tamil Nadu freight terminals (Koyambedu Wholesale Market, Poonamallee Freight Bay, Sriperumbudur Logistics Park, Chengalpattu Toll Plaza, Kanchipuram Freight Bypass, etc.).
- **Shift Performance Metric Cards:**
  - `Trips Today`
  - `Distance Today (km)`
  - `Driving Time (hrs)`

---

## 📞 Automated Hands-Free SIM LBS Dispatch (Zero Admin Work)

For commercial drivers using basic keypad phones (feature phones like Nokia 105, Samsung Guru) without screens or data plans, V3 Logistics supports two automated dispatch workflows:

### Method 1: Toll-Free Missed Call Dispatch (`1800-419-7890`)
1. Before starting the journey, the driver dials the toll-free number from their registered keypad phone and disconnects (missed call).
2. The telematics backend matches the incoming **Caller-ID** to the driver's registered record and assigned truck.
3. The trip **automatically starts** (`🟢 Driving via Telecom SIM LBS`), initializes the route, and alerts the admin.
4. Upon reaching the destination, the driver gives another missed call to the same number.
5. The trip **automatically completes**, logs distance, duration, and average speed, and enters the Trip History ledger.

### Method 2: Geofence Boundary Crossing (500m Depot Exit / Hub Entry)
1. **Departure Geofence Exit:** When the vehicle physically moves past the 500m geofence perimeter of the Madhavaram Logistics Depot, the trip **automatically starts** without driver or admin intervention.
2. **Arrival Geofence Entry:** When the vehicle enters the 500m geofence perimeter of the destination logistics hub (e.g., Sriperumbudur Hub), the trip **automatically concludes** and archives.

---

## 📡 Cross-Tab Synchronization Protocol

The Driver Portal and Admin Dashboard run independently in separate browser tabs, windows, or mobile devices, communicating through a zero-latency real-time event bus:

```
┌─────────────────────────┐                            ┌─────────────────────────┐
│  DRIVER MOBILE PORTAL   │                            │ ADMIN OPERATIONS BOARD  │
└────────────┬────────────┘                            └────────────▲────────────┘
             │                                                      │
             │        BroadcastChannel('fleet-tracker-sync')        │
             ├──────────────────────────────────────────────────────┤
             │              (Instantaneous Event Bus)               │
             │                                                      │
             │  Events:                                             │
             │    • START_TRIP     ➔ Creates live trip & ticker     │
             │    • END_TRIP       ➔ Calculates totals & archives   │
             │    • SPEED_UPDATE   ➔ Syncs odometer & speedometer   │
             │    • LOCATION_UPDATE➔ Updates corridor checkpoint    │
             │                                                      │
             │        LocalStorage Fallback ('fleet_admin_v9')      │
             └──────────────────────────────────────────────────────┘
```

---

## 📁 Repository Structure & Codebase Map

```text
c:\Users\T Varatharajan\OneDrive\Documents\Vanish\Project\Truck_Project\
├── admin/                         # 🏢 Admin Fleet Operations Dashboard
│   ├── index.html                 # Leaflet map container, map-type dock, vehicle cards & modals
│   ├── admin.css                  # IBM Plex typography, high-contrast dark accents, BTS pulse CSS
│   └── admin.js                   # Map engine, SIM LBS triangulation, 2s ticker, CSV exporter
│
├── driver/                        # 🚚 Driver Smartphone Portal
│   ├── index.html                 # Mobile-first one-tap tracking interface, speedometer gauge
│   ├── driver.css                 # Touch-friendly mobile styling, overspeed warning animations
│   └── driver.js                  # Geolocation handler, speedometer & halt idle detector
│
├── server.js                      # ⚡ Native Node.js static HTTP server + Fast2SMS gateway (Port 5000)
├── package.json                   # Project metadata, npm start script
├── PROJECT_DOCUMENTATION.md       # Tamil & English operational guide and testing instructions
└── README.md                      # Comprehensive enterprise platform documentation
```

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- [Node.js](https://nodejs.org/) (version 16 or newer recommended)
- Modern web browser (Chrome, Edge, Firefox, or Safari)

### 2. Launch Server
Clone or navigate to the project directory and run:

```bash
# Using npm
npm start

# Or directly with Node
node server.js
```

The server binds to **Port 5000**:
```text
==================================================
  FLEET TRACKER PRO — SERVER RUNNING
==================================================
  Admin Dashboard : http://localhost:5000/admin/
  Driver Portal   : http://localhost:5000/driver/
==================================================
```

---

## 🖥️ Portals & Endpoints

| Service | Access URL | Description |
|---|---|---|
| **Admin Operations Dashboard** | `http://localhost:5000/admin/` | Central dispatch board, satellite map, SIM LBS controls, trip history, CSV export |
| **Driver Smartphone Portal** | `http://localhost:5000/driver/` | Mobile one-tap trip portal with auto GPS lock, digital speedometer, halt reason logger |
| **SMS Gateway API Endpoint** | `http://localhost:5000/api/send-driver-sms` | Backend endpoint for physical Indian mobile SMS delivery via Fast2SMS |

---

## 🧪 Step-by-Step Testing & Verification Workflows

### Scenario 1: Testing Smartphone GPS Driver Tracking
1. Open the **Admin Dashboard** in one tab: `http://localhost:5000/admin/`
2. Open the **Driver Portal** in another tab or mobile device: `http://localhost:5000/driver/`
3. In Driver Portal, select **Murugan K** (`TN 09 AB 1234`).
4. Click **"🟢 START TRIP"**.
5. Observe the Admin Dashboard immediately show a toast notification and create the active trip.
6. In Driver Portal, click **"🚗 Drive 55 km/h"** or **"⚡ Overspeed 72 km/h"**.
7. In Admin Dashboard, watch `TN 09 AB 1234` advance along its highway corridor, dynamically drawing its polyline route behind it.
8. In Driver Portal, click **"🛑 Stop 0 km/h"** and select a Halt Reason (e.g. `☕ Tea Break`).
9. Notice the Admin Dashboard inspection panel immediately update to `🟠 Halted` with the live halt duration and `Tea Break` reason.
10. Click **"🛑 END TRIP"** to complete the journey and archive it into the **Trip History** table.

### Scenario 2: Testing Feature Phone SIM LBS Tracking (Admin Control)
1. On the Admin Dashboard, click on **`TN 38 GH 3456`** (Ravi Kumar · Airtel SIM) or **`AP 39 JK 7788`** (Venkatesh P · Jio SIM).
2. In the right inspection panel or the Vehicles table, click **"▶️ Admin: Start SIM Trip"**.
3. Status switches to `🟢 Driving via Telecom SIM LBS` and the vehicle begins moving along its dedicated corridor with real-time speed simulation.
4. Click **"📡 Ping Tower"**:
   - The map animates an authentic **LBS Cell Tower Triangulation Circle** (~850m radius) with a pulsing cellular antenna (`📡`).
   - A detailed toast displays the cellular carrier (Airtel/Jio), Cell ID (e.g. `AIRTEL-BTS-4819`), RSSI signal strength (-72 dBm), and coordinates.
5. Click **"🛑 Admin: End Trip"** to complete the trip and record it in the ledger.

### Scenario 3: Testing Automated Hands-Free SIM Dispatch
- **📞 Toll-Free Missed Call (`1800-419-7890`):**
  - Drivers of basic keypad phones dial the toll-free number and hang up.
  - The system detects the incoming Caller-ID, looks up the assigned truck, and **automatically starts the trip** with zero admin manual intervention.
  - When the driver dials again at destination, the trip is **automatically ended** and logged.
- **🌐 500m Geofence Gate Trigger:**
  - When a truck exits the 500m Madhavaram Depot boundary, the trip **auto-starts**.
  - When it enters the destination hub (500m boundary), the trip **auto-completes**.

---

## 📄 License & Attribution
ISC License © 2026 V3 Logistics (Varatharajan · Surya · Akash).  
Designed and built for Indian commercial road transportation and logistics operations.
