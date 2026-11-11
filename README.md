# 🚛 V3 Logistics — Fleet Operations & Trip Tracking Platform

> **Created by: Varatharajan · Surya · Akash (V3 Team)**  
> **Real-time digital twin & fleet tracking system designed for commercial road transport in India.**  
> Features a central Admin Operations Dashboard, One-Tap Driver Mobile Portal, and Dual-Mode Smartphone GPS + Feature Phone SIM LBS tracking.

---

## 🌟 Key Highlights

- **⚡ Zero External Dependencies:** Built with pure vanilla JavaScript, HTML5, modern CSS, and a native Node.js HTTP server. Runs instantly without heavy `node_modules` or complex build pipelines.
- **📱 One-Tap Driver Mobile Portal:** Drivers tap **"🟢 START TRIP"** to begin and **"🛑 END TRIP"** when finished. Automatic GPS lock, live speedometer, overspeed alerts (>60 km/h), and halt idle detection.
- **🏢 Central Admin Operations Dashboard:** Real-time multi-vehicle monitoring cards, second-by-second trip duration ticker, live speed & location sync, trip history ledger table, and single-click CSV export.
- **🔄 Dual-Mode Tracking Architecture:**
  1. **Smartphone GPS Tracking:** High-precision browser Geolocation API with live route simulation.
  2. **Feature Phone / SIM LBS Tracking:** Remote cellular tower triangulation simulation for basic keypad phone drivers (Nokia 105, Samsung Guru) with admin-initiated ping.
- **📡 Real-Time Cross-Tab Synchronization:** Uses the browser `BroadcastChannel` API with `localStorage` fallback for instantaneous multi-window event synchronization.

---

## 📁 Repository Structure

```text
├── admin/                         # 🏢 Admin Fleet Operations Dashboard
│   ├── index.html                 # Responsive admin UI, vehicle cards & trip ledger
│   ├── admin.css                  # IBM Plex design system, dark-accented modern styles
│   └── admin.js                   # Cross-tab event listener, live ticker, CSV exporter
│
├── driver/                        # 🚚 Driver Smartphone Portal
│   ├── index.html                 # Mobile-first one-tap start/stop tracking interface
│   ├── driver.css                 # Touch-friendly layout with high contrast UI
│   └── driver.js                  # Geolocation handler, speedometer & halt detector
│
├── server.js                      # ⚡ Native Node.js HTTP static server (Port 5000)
├── package.json                   # Project scripts and configuration
├── PROJECT_DOCUMENTATION.md       # Comprehensive feature documentation & test guide
└── README.md                      # Project overview & quick-start guide
```

---

## 🚀 Quick Start

### 1. Prerequisites
- [Node.js](https://nodejs.org/) (version 16 or newer recommended)

### 2. Run the Server
Clone the repository and launch the server:

```bash
# Start server using npm
npm start

# Or directly with node
node server.js
```

The server will start on **Port 5000**:
```text
==================================================
  FLEET TRACKER PRO — SERVER RUNNING
==================================================
  Admin Dashboard : http://localhost:5000/admin/
  Driver Portal   : http://localhost:5000/driver/
==================================================
```

---

## 🖥️ Live Portals & Usage

| Portal | URL | Description |
|---|---|---|
| **Admin Dashboard** | `http://localhost:5000/admin/` | Monitor live vehicles, start SIM LBS tracking, inspect trip history, export CSV reports |
| **Driver Portal** | `http://localhost:5000/driver/` | Mobile interface for smartphone drivers with automatic GPS lock & one-tap trip tracking |

### Testing Real-Time Tracking:
1. Open the **Admin Dashboard** in one browser window: `http://localhost:5000/admin/`
2. Open the **Driver Portal** in another window or on mobile: `http://localhost:5000/driver/`
3. Click **"🟢 START TRIP"** in the Driver Portal.
4. Watch the Admin Dashboard instantly receive the trip start event and begin ticking live duration and distance!
5. Click **"🛑 END TRIP"** to conclude the journey and generate the complete trip ledger entry with Start/End coordinates, total duration, distance, and average speed.

---

## 📄 License
ISC License © 2026 V3 Logistics (Varatharajan · Surya · Akash).
