/* ==========================================================
   Admin Dashboard — V3 Logistics
   (Varatharajan · Surya · Akash)
   Fleet Tracker · admin.js
   ========================================================== */

'use strict';

// ── Seed Data ──────────────────────────────────────────────

/** @type {Object.<string, {id:string, plate:string, model:string, type:string, source:string, driverId:string, status:string, speed:number, currentLocation:string, lat:number, lng:number, battery:number, accuracy:number, lastSeen:string, distanceToday:number, route:Array<[number,number]>}>} */
const vehicles = {
    v1: {
        id: 'v1',
        plate: 'TN 09 AB 1234',
        model: 'Tata Prima 4028.S',
        type: 'Truck 28T',
        source: 'app',
        driverId: 'd1',
        status: 'driving',
        speed: 58,
        currentLocation: 'NH 48, Sriperumbudur Logistics Hub',
        lat: 12.9818,
        lng: 79.9442,
        battery: 88,
        accuracy: 12,
        lastSeen: '8 s ago',
        distanceToday: 214.5,
        route: [
            [13.0694, 80.1948],
            [13.0450, 80.1500],
            [13.0400, 80.0800],
            [12.9818, 79.9442]
        ]
    },
    v2: {
        id: 'v2',
        plate: 'TN 22 CD 5678',
        model: 'Ashok Leyland 2820',
        type: 'Truck 28T',
        source: 'app',
        driverId: 'd2',
        status: 'driving',
        speed: 46,
        currentLocation: 'GST Road, Chengalpattu Toll Bay',
        lat: 12.7200,
        lng: 79.9800,
        battery: 74,
        accuracy: 15,
        lastSeen: '5 s ago',
        distanceToday: 168.0,
        route: [
            [13.0067, 80.2025],
            [12.9249, 80.1200],
            [12.8400, 80.0600],
            [12.7900, 80.0200],
            [12.7200, 79.9800]
        ]
    },
    v3: {
        id: 'v3',
        plate: 'KA 01 EF 9012',
        model: 'Eicher Pro 6028',
        type: 'Truck 28T',
        source: 'app',
        driverId: 'd3',
        status: 'driving',
        speed: 52,
        currentLocation: 'NH 48, Kanchipuram Freight Bypass',
        lat: 12.8450,
        lng: 79.7400,
        battery: 92,
        accuracy: 8,
        lastSeen: '3 s ago',
        distanceToday: 248.4,
        route: [
            [12.9818, 79.9442],
            [12.9150, 79.8400],
            [12.8450, 79.7400]
        ]
    },
    v4: {
        id: 'v4',
        plate: 'TN 38 GH 3456',
        model: 'Mahindra Furio 7',
        type: 'LCV 7T',
        source: 'sim',
        driverId: 'd4',
        status: 'halted',
        speed: 0,
        currentLocation: 'Madhavaram Freight Hub, Red Hills',
        lat: 13.1518,
        lng: 80.2000,
        battery: 65,
        accuracy: 20,
        lastSeen: 'Stopped · 2 min ago',
        distanceToday: 98.7,
        route: [
            [13.0694, 80.1948],
            [13.1000, 80.1600],
            [13.1400, 80.1800],
            [13.1518, 80.2000]
        ]
    },
    v5: {
        id: 'v5',
        plate: 'AP 39 JK 7788',
        model: 'BharatBenz 3128',
        type: 'Truck 28T',
        source: 'sim',
        driverId: 'd5',
        status: 'offline',
        speed: 0,
        currentLocation: 'NH 16, Minjur / Ponneri Junction',
        lat: 13.2500,
        lng: 80.2200,
        battery: 12,
        accuracy: 35,
        lastSeen: 'No signal · last seen 42 min ago',
        distanceToday: 187.3,
        route: [
            [13.1518, 80.2000],
            [13.2100, 80.2050],
            [13.2500, 80.2200]
        ]
    },
    v6: {
        id: 'v6',
        plate: 'TN 07 LM 2468',
        model: 'Tata Signa 4825',
        type: 'Truck 28T',
        source: 'app',
        driverId: 'd6',
        status: 'driving',
        speed: 34,
        currentLocation: 'Chennai Port Container Bay',
        lat: 13.0900,
        lng: 80.2900,
        battery: 81,
        accuracy: 14,
        lastSeen: '6 s ago',
        distanceToday: 76.5,
        route: [
            [13.2100, 80.3150],
            [13.1600, 80.2900],
            [13.0900, 80.2900]
        ]
    }
};

/** @type {Object.<string, {id:string, name:string, phone:string, phoneType:string, device:string, assignedVehicle:string, destination:string, licence:string, licenceExpiry:string, onDutySince:string}>} */
const drivers = {
    d1: {
        id: 'd1',
        name: 'Murugan K',
        phone: '+91 98401 23456',
        phoneType: 'smart',
        device: 'Samsung Galaxy M14 (App GPS)',
        assignedVehicle: 'v1',
        destination: 'Sriperumbudur Industrial Hub',
        licence: 'TN01 20210001234',
        licenceExpiry: '2027-03-15',
        onDutySince: '06:15'
    },
    d2: {
        id: 'd2',
        name: 'Selvam R',
        phone: '+91 98402 34567',
        phoneType: 'smart',
        device: 'Redmi Note 12 (App GPS)',
        assignedVehicle: 'v2',
        destination: 'Chengalpattu Logistics Bay',
        licence: 'TN22 20200005678',
        licenceExpiry: '2026-08-22',
        onDutySince: '06:30'
    },
    d3: {
        id: 'd3',
        name: 'Imran Pasha',
        phone: '+91 98403 45678',
        phoneType: 'smart',
        device: 'OnePlus Nord CE (App GPS)',
        assignedVehicle: 'v3',
        destination: 'Kanchipuram Freight Bypass',
        licence: 'KA01 20210009012',
        licenceExpiry: '2028-05-18',
        onDutySince: '05:00'
    },
    d4: {
        id: 'd4',
        name: 'Ravi Kumar',
        phone: '+91 98404 56789',
        phoneType: 'button',
        device: 'Nokia 105 (Keypad Phone · Airtel SIM)',
        assignedVehicle: 'v4',
        destination: 'Madhavaram Freight Hub',
        licence: 'TN38 20220003456',
        licenceExpiry: '2028-01-10',
        onDutySince: '07:10'
    },
    d5: {
        id: 'd5',
        name: 'Venkatesh P',
        phone: '+91 98405 67890',
        phoneType: 'button',
        device: 'Samsung Guru 1200 (Keypad · Jio SIM)',
        assignedVehicle: 'v5',
        destination: 'Minjur / Ponneri Freight Junction',
        licence: 'AP39 20210007788',
        licenceExpiry: '2029-06-15',
        onDutySince: '05:40'
    },
    d6: {
        id: 'd6',
        name: 'Anbu Selvan',
        phone: '+91 98406 78901',
        phoneType: 'smart',
        device: 'Vivo Y20 (App GPS)',
        assignedVehicle: 'v6',
        destination: 'Chennai Port Container Bay',
        licence: 'TN07 20200002468',
        licenceExpiry: '2027-11-20',
        onDutySince: '07:45'
    }
};

/** Trip counter for unique IDs */
let tripCounter = 0;

/** @type {Array<{id:number, vehicleId:string, plate:string, driverId:string, driverName:string, startTime:Date, startLocation:string, endTime:Date|null, endLocation:string, duration:string, avgSpeed:number, distanceKm:number, status:string, speed:number}>} */
const trips = [];

// ── Seed sample trips ──────────────────────────────────────

/**
 * Helper to create a Date object for today at a given time string (e.g., '06:12').
 * @param {string} timeStr - Time in 'HH:MM' 24-hour format
 * @returns {Date}
 */
function todayAt(timeStr) {
    const [h, m] = timeStr.split(':').map(Number);
    const d = new Date();
    d.setHours(h, m, 0, 0);
    return d;
}

// Trip 1: v1/d1 — Completed earlier today
tripCounter++;
trips.push({
    id: tripCounter,
    vehicleId: 'v1',
    plate: 'TN 09 AB 1234',
    driverId: 'd1',
    driverName: 'Murugan K',
    startTime: todayAt('06:12'),
    startLocation: 'Chennai Port',
    endTime: todayAt('08:45'),
    endLocation: 'Sriperumbudur Hub',
    duration: '2h 33m',
    haltSeconds: 900,
    haltReason: 'Food Break',
    avgSpeed: 52,
    distanceKm: 128.4,
    status: 'completed',
    speed: 0
});

// Trip 2: v2/d2 — Completed earlier today
tripCounter++;
trips.push({
    id: tripCounter,
    vehicleId: 'v2',
    plate: 'TN 22 CD 5678',
    driverId: 'd2',
    driverName: 'Selvam R',
    startTime: todayAt('06:40'),
    startLocation: 'Tambaram',
    endTime: todayAt('09:10'),
    endLocation: 'Chengalpattu Toll',
    duration: '2h 30m',
    haltSeconds: 480,
    haltReason: 'Toll Plaza',
    avgSpeed: 48,
    distanceKm: 112.6,
    status: 'completed',
    speed: 0
});

// Trip 3: v1/d1 — Active live trip
tripCounter++;
trips.push({
    id: tripCounter,
    vehicleId: 'v1',
    plate: 'TN 09 AB 1234',
    driverId: 'd1',
    driverName: 'Murugan K',
    startTime: todayAt('09:30'),
    startLocation: 'Chennai Central',
    endTime: null,
    endLocation: '',
    duration: '',
    haltSeconds: 0,
    haltReason: '',
    avgSpeed: 58,
    distanceKm: 42.5,
    status: 'active',
    speed: 58
});

// Trip 4: v2/d2 — Active live trip
tripCounter++;
trips.push({
    id: tripCounter,
    vehicleId: 'v2',
    plate: 'TN 22 CD 5678',
    driverId: 'd2',
    driverName: 'Selvam R',
    startTime: todayAt('09:45'),
    startLocation: 'Tambaram Depot',
    endTime: null,
    endLocation: '',
    duration: '',
    haltSeconds: 0,
    haltReason: '',
    avgSpeed: 46,
    distanceKm: 38.2,
    status: 'active',
    speed: 46
});

// Trip 5: v3/d3 — Active live trip
tripCounter++;
trips.push({
    id: tripCounter,
    vehicleId: 'v3',
    plate: 'KA 01 EF 9012',
    driverId: 'd3',
    driverName: 'Imran Pasha',
    startTime: todayAt('09:15'),
    startLocation: 'Sriperumbudur Gate',
    endTime: null,
    endLocation: '',
    duration: '',
    haltSeconds: 0,
    haltReason: '',
    avgSpeed: 52,
    distanceKm: 34.8,
    status: 'active',
    speed: 52
});

// Trip 6: v6/d6 — Active live trip
tripCounter++;
trips.push({
    id: tripCounter,
    vehicleId: 'v6',
    plate: 'TN 07 LM 2468',
    driverId: 'd6',
    driverName: 'Anbu Selvan',
    startTime: todayAt('10:00'),
    startLocation: 'Ennore Port',
    endTime: null,
    endLocation: '',
    duration: '',
    haltSeconds: 0,
    haltReason: '',
    avgSpeed: 34,
    distanceKm: 21.0,
    status: 'active',
    speed: 34
});

// ── DOM References ─────────────────────────────────────────

const $headerClock = document.getElementById('headerClock');
const $metricTotalVehicles = document.getElementById('metricTotalVehicles');
const $metricActiveTrips = document.getElementById('metricActiveTrips');
const $metricCompletedToday = document.getElementById('metricCompletedToday');
const $metricTotalDrivers = document.getElementById('metricTotalDrivers');
const $statusCards = document.getElementById('statusCards');
const $tripsTableBody = document.getElementById('tripsTableBody');
const $vehiclesTableBody = document.getElementById('vehiclesTableBody');
const $driversTableBody = document.getElementById('driversTableBody');
const $toastContainer = document.getElementById('toastContainer');

// ── Tab Navigation ─────────────────────────────────────────

const sidebarTabs = document.querySelectorAll('.sidebar-tab');
const tabPanels = document.querySelectorAll('.tab-panel');

sidebarTabs.forEach(tab => {
    tab.addEventListener('click', () => {
        const target = tab.dataset.tab;

        // Update active tab button
        sidebarTabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');

        // Show the matching panel
        tabPanels.forEach(p => p.classList.remove('active'));
        const panel = document.getElementById(`panel-${target}`);
        if (panel) {
            panel.classList.add('active');
        }

        // If dashboard tab, refresh Leaflet map sizing
        if (target === 'dashboard') {
            initOrRefreshFleetMap();
        }

        // Refresh the relevant panel
        refreshAll();
    });
});

// ── Clock ──────────────────────────────────────────────────

/**
 * Update the header clock display.
 */
function updateClock() {
    const now = new Date();
    const h = now.getHours();
    const m = String(now.getMinutes()).padStart(2, '0');
    const s = String(now.getSeconds()).padStart(2, '0');
    const ampm = h >= 12 ? 'PM' : 'AM';
    const h12 = h % 12 || 12;
    $headerClock.textContent = `${h12}:${m}:${s} ${ampm}`;
}

// ── Utility: Format time ──────────────────────────────────

/**
 * Safely parse any date value, ISO string, or time string (e.g. "06:12 AM" or "06:12").
 * @param {*} val
 * @returns {Date}
 */
function parseTimestamp(val) {
    if (!val) return new Date();
    if (val instanceof Date) return isNaN(val.getTime()) ? new Date() : val;
    const d = new Date(val);
    if (!isNaN(d.getTime())) return d;
    const match = String(val).match(/(\d+):(\d+)(?::(\d+))?\s*(AM|PM)?/i);
    if (match) {
        const now = new Date();
        let hours = parseInt(match[1], 10);
        const mins = parseInt(match[2], 10);
        const ampm = match[4];
        if (ampm && ampm.toUpperCase() === 'PM' && hours < 12) hours += 12;
        if (ampm && ampm.toUpperCase() === 'AM' && hours === 12) hours = 0;
        now.setHours(hours, mins, match[3] ? parseInt(match[3], 10) : 0, 0);
        return now;
    }
    return new Date();
}

/**
 * Format a Date object to a readable time string.
 * @param {Date|string} date
 * @returns {string} e.g., "06:12 AM"
 */
function fmtTime(date) {
    if (!date) return '—';
    const d = parseTimestamp(date);
    const h = d.getHours();
    const m = String(d.getMinutes()).padStart(2, '0');
    const ampm = h >= 12 ? 'PM' : 'AM';
    const h12 = h % 12 || 12;
    return `${h12}:${m} ${ampm}`;
}

/**
 * Calculate a human-readable duration between two dates.
 * @param {Date|string} start
 * @param {Date|string} end
 * @returns {string} e.g., "2h 33m"
 */
function calcDuration(start, end) {
    if (!start || !end) return '—';
    const s = parseTimestamp(start);
    const e = parseTimestamp(end);
    const diffMs = e.getTime() - s.getTime();
    if (diffMs < 0) return '0m';
    const totalMin = Math.floor(diffMs / 60000);
    const h = Math.floor(totalMin / 60);
    const m = totalMin % 60;
    if (h > 0) {
        return `${h}h ${m}m`;
    }
    return `${m}m`;
}

/**
 * Calculate running duration from start until now.
 * @param {Date|string} start
 * @returns {string}
 */
function runningDuration(start) {
    return calcDuration(start, new Date());
}

// ── Get driver / vehicle helpers ──────────────────────────

/**
 * Find the driver assigned to a vehicle.
 * @param {string} vehicleId
 * @returns {Object|null}
 */
function getDriverForVehicle(vehicleId) {
    const v = vehicles[vehicleId];
    if (!v || !v.driverId) return null;
    return drivers[v.driverId] || null;
}

/**
 * Find the active trip for a vehicle (if any).
 * @param {string} vehicleId
 * @returns {Object|null}
 */
function getActiveTripForVehicle(vehicleId) {
    return trips.find(t => t.vehicleId === vehicleId && t.status === 'active') || null;
}

/**
 * Find the last completed trip for a vehicle (if any).
 * @param {string} vehicleId
 * @returns {Object|null}
 */
function getLastCompletedTripForVehicle(vehicleId) {
    const completed = trips.filter(t => t.vehicleId === vehicleId && t.status === 'completed');
    return completed.length > 0 ? completed[completed.length - 1] : null;
}

// ── Phone type display ─────────────────────────────────────

/**
 * Format halt seconds as MM:SS or Hh Mm.
 * @param {number} totalSec
 * @returns {string}
 */
function formatHaltDuration(totalSec) {
    if (!totalSec || totalSec <= 0) return '00:00';
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    if (mins >= 60) {
        const hrs = Math.floor(mins / 60);
        const remMins = mins % 60;
        return `${hrs}h ${remMins}m`;
    }
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

/**
 * Return a display string for phone type.
 * @param {string} type - 'smart' or 'button'
 * @returns {string}
 */
function phoneTypeDisplay(type) {
    return type === 'smart' ? '📱 Smartphone' : '📞 Button Phone';
}

// ── Render: Dashboard Overview ─────────────────────────────

/**
 * Refresh the metrics ribbon counts.
 */
function refreshMetrics() {
    updateLiveMapKpis();

    const vehicleKeys = Object.keys(vehicles);
    const driverKeys = Object.keys(drivers);
    const activeTrips = trips.filter(t => t.status === 'active');
    const completedToday = trips.filter(t => {
        if (t.status !== 'completed' || !t.endTime) return false;
        const now = new Date();
        return t.endTime.toDateString() === now.toDateString();
    });
    const haltedCount = Object.values(vehicles).filter(v => v.status === 'driving' && (v.isHalted || v.speed === 0)).length;

    if ($metricTotalVehicles) $metricTotalVehicles.textContent = vehicleKeys.length;
    if ($metricActiveTrips) $metricActiveTrips.textContent = activeTrips.length;
    if ($metricCompletedToday) $metricCompletedToday.textContent = completedToday.length;
    if ($metricTotalDrivers) $metricTotalDrivers.textContent = driverKeys.length;
    const $metricHaltedCount = document.getElementById('metricHaltedCount');
    if ($metricHaltedCount) $metricHaltedCount.textContent = haltedCount;
}

/**
 * Render the live status cards for all vehicles.
 */
function renderStatusCards() {
    let html = '';

    Object.values(vehicles).forEach(v => {
        const driver = getDriverForVehicle(v.id);
        const activeTrip = getActiveTripForVehicle(v.id);
        const lastTrip = getLastCompletedTripForVehicle(v.id);

        // Determine status badge
        let badgeClass = '';
        let badgeText = '';
        const isCurrentlyHalted = (v.status === 'driving') && (v.isHalted || v.speed === 0);

        if (v.status === 'driving') {
            if (isCurrentlyHalted) {
                badgeClass = 'stopped';
                badgeText = '⏸️ Halted (Speed: 0)';
            } else {
                badgeClass = 'driving';
                badgeText = `🟢 Driving — ${v.speed} km/h`;
            }
        } else if (v.status === 'stopped') {
            badgeClass = 'stopped';
            badgeText = '🔴 Stopped';
        } else {
            badgeClass = 'no-trip';
            badgeText = '⚪ No Trip';
        }

        // Build body details
        let bodyHtml = '';

        // Driver info
        if (driver) {
            bodyHtml += `
                <div class="detail-row">
                    <span class="detail-label">Driver:</span>
                    <span class="detail-value" style="display:inline-flex; align-items:center;">
                        <strong>${escHtml(driver.name)}</strong>
                        <button type="button" class="btn-card-edit" onclick="openEditDriverModal('${driver.id}')" title="Edit Driver Details">✏️ Edit</button>
                    </span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Phone:</span>
                    <span class="detail-value">${phoneTypeDisplay(driver.phoneType)}</span>
                </div>
            `;
        } else {
            bodyHtml += `
                <div class="detail-row">
                    <span class="detail-label">Driver:</span>
                    <span class="detail-value" style="color:#94A3B8; display:inline-flex; align-items:center;">
                        Unassigned
                        <button type="button" class="btn-card-edit" onclick="openEditVehicleModal('${v.id}')" title="Assign Driver">➕ Assign</button>
                    </span>
                </div>
            `;
        }

        // If driving — show speed, halt time, start time, start location, running duration
        if (v.status === 'driving' && activeTrip) {
            const haltSec = (activeTrip && activeTrip.haltSeconds) || v.haltSeconds || 0;
            const haltDisplay = formatHaltDuration(haltSec);
            const haltReasonDisplay = (activeTrip && activeTrip.haltReason) || v.haltReason || '';

            bodyHtml += `
                <div class="detail-row">
                    <span class="detail-label">Speed:</span>
                    <span class="detail-value speed-highlight">${v.speed} km/h</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Halt Time:</span>
                    <span class="detail-value" style="color:${haltSec > 0 ? '#d97706' : '#16a34a'}; font-weight:600;">
                        ${haltDisplay} ${haltReasonDisplay ? `<span style="font-size:11px; color:#64748b;">(${escHtml(haltReasonDisplay)})</span>` : ''}
                    </span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Started:</span>
                    <span class="detail-value">${fmtTime(activeTrip.startTime)}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">From:</span>
                    <span class="detail-value">${escHtml(activeTrip.startLocation)}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Duration:</span>
                    <span class="detail-value speed-highlight">${runningDuration(activeTrip.startTime)}</span>
                </div>
            `;
            if (v.currentLocation && v.currentLocation !== activeTrip.startLocation) {
                bodyHtml += `
                    <div class="detail-row">
                        <span class="detail-label">Near:</span>
                        <span class="detail-value">${escHtml(v.currentLocation)}</span>
                    </div>
                `;
            }
        }

        // If stopped — show last trip end time, end location, trip halt
        if (v.status === 'stopped' && lastTrip) {
            const haltSec = lastTrip.haltSeconds || v.haltSeconds || 0;
            bodyHtml += `
                <div class="detail-row">
                    <span class="detail-label">Last Trip:</span>
                    <span class="detail-value">Ended ${fmtTime(lastTrip.endTime)}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">At:</span>
                    <span class="detail-value">${escHtml(lastTrip.endLocation)}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Trip Halt:</span>
                    <span class="detail-value" style="color:${haltSec > 0 ? '#d97706' : '#64748b'};">
                        ${formatHaltDuration(haltSec)} ${lastTrip.haltReason ? `<span style="font-size:11px; color:#64748b;">(${escHtml(lastTrip.haltReason)})</span>` : ''}
                    </span>
                </div>
            `;
        }

        // Tracking source badge
        const sourceBadge = v.source === 'sim'
            ? '<span class="source-badge sim">📶 Telecom SIM LBS</span>'
            : '<span class="source-badge app">📱 Driver App GPS</span>';

        // Action buttons (Admin controls SIM trips for button phone drivers)
        let actionsHtml = '';
        if (v.source === 'sim') {
            if (v.status !== 'driving') {
                actionsHtml = `
                    <div style="margin-top:12px; padding-top:10px; border-top:1px dashed #E2E8F0;">
                        <button class="btn btn-sm btn-primary" style="width:100%; justify-content:center;" onclick="adminStartSimTrip('${v.id}')">
                            ▶️ Admin: Start SIM Trip
                        </button>
                    </div>
                `;
            } else {
                actionsHtml = `
                    <div style="margin-top:12px; padding-top:10px; border-top:1px dashed #E2E8F0; display:flex; gap:6px;">
                        <button class="btn btn-sm btn-danger" style="flex:1; justify-content:center;" onclick="adminEndSimTrip('${v.id}')">
                            🛑 Admin: End Trip
                        </button>
                        <button class="btn btn-sm btn-outline" onclick="adminPingSim('${v.id}')">
                            📡 Ping Tower
                        </button>
                    </div>
                `;
            }
        } else {
            actionsHtml = `
                <div style="margin-top:10px; padding-top:8px; border-top:1px dashed #E2E8F0; font-size:11px; color:#64748B;">
                    🔒 Driver controls trip from Smartphone Mobile App
                </div>
            `;
        }

        html += `
            <div class="status-card" data-vehicle="${v.id}">
                <div class="status-card-header">
                    <div>
                        <span class="status-card-plate">${escHtml(v.plate)}</span>
                        <span class="status-card-model"> · ${escHtml(v.model)}</span>
                        <button type="button" class="btn-card-edit" onclick="openEditVehicleModal('${v.id}')" title="Edit Truck Details">✏️ Edit</button>
                        <div style="margin-top:4px;">${sourceBadge}</div>
                    </div>
                    <span class="status-badge ${badgeClass}">${badgeText}</span>
                </div>
                <div class="status-card-body">
                    ${bodyHtml}
                    ${actionsHtml}
                </div>
            </div>
        `;
    });

    if ($statusCards) {
        $statusCards.innerHTML = html;
    }
}

// ── Render: Trip History Table ─────────────────────────────

/**
 * Render the trips table with all trip data.
 */
function renderTripsTable() {
    if (trips.length === 0) {
        $tripsTableBody.innerHTML = `<tr class="empty-row"><td colspan="12">No trips recorded yet.</td></tr>`;
        return;
    }

    // Show trips in reverse order (newest first)
    const sorted = [...trips].reverse();

    let html = '';
    sorted.forEach(trip => {
        const isActive = trip.status === 'active';
        const duration = isActive ? runningDuration(trip.startTime) : trip.duration;
        const avgSpeed = isActive ? (trip.speed > 0 ? `${trip.speed} km/h` : '—') : (trip.avgSpeed > 0 ? `${trip.avgSpeed} km/h` : '—');
        const distance = trip.distanceKm > 0 ? `${trip.distanceKm.toFixed(2)} km` : '—';
        const statusHtml = isActive
            ? `<span class="cell-status-active">🟢 Active</span>`
            : `<span class="cell-status-completed">✅ Completed</span>`;

        const v = vehicles[trip.vehicleId];
        const isSim = (v && v.source === 'sim') || (trip.vehicleId === 'v3' || trip.vehicleId === 'v4');
        const trackingBadge = isSim
            ? `<span class="source-badge sim" style="font-size:10px; display:inline-block; margin-top:3px;">📞 SIM LBS</span>`
            : `<span class="source-badge app" style="font-size:10px; display:inline-block; margin-top:3px;">📱 Driver App</span>`;

        const haltSec = trip.haltSeconds || (v && v.haltSeconds) || 0;
        const haltDisplay = formatHaltDuration(haltSec);
        const haltReasonDisplay = trip.haltReason || (v && v.haltReason) || '';

        html += `
            <tr>
                <td>${trip.id}</td>
                <td class="cell-plate">
                    <div>${escHtml(trip.plate)}</div>
                    ${trackingBadge}
                </td>
                <td>${escHtml(trip.driverName)}</td>
                <td>${fmtTime(trip.startTime)}</td>
                <td>${escHtml(trip.startLocation)}</td>
                <td>${trip.endTime ? fmtTime(trip.endTime) : '—'}</td>
                <td>${trip.endLocation ? escHtml(trip.endLocation) : '—'}</td>
                <td>${duration}</td>
                <td>
                    <span style="color:${haltSec > 0 ? '#d97706' : '#64748b'}; font-weight:${haltSec > 0 ? '600' : 'normal'};">
                        ${haltDisplay}
                    </span>
                    ${haltReasonDisplay ? `<br><small style="color:#64748b; font-size:11px;">${escHtml(haltReasonDisplay)}</small>` : ''}
                </td>
                <td>${avgSpeed}</td>
                <td>${distance}</td>
                <td>${statusHtml}</td>
            </tr>
        `;
    });

    $tripsTableBody.innerHTML = html;
}

/**
 * Filter the trips table by search query
 * @param {string} query
 */
window.filterTripsTable = function(query) {
    const q = (query || '').toLowerCase().trim();
    const rows = document.querySelectorAll('#tripsTableBody tr');
    rows.forEach(r => {
        if (r.classList.contains('empty-row')) return;
        const text = r.textContent.toLowerCase();
        r.style.display = text.includes(q) ? '' : 'none';
    });
};

// ── Render: Vehicles Table ─────────────────────────────────

/**
 * Render the vehicles table.
 */
function renderVehiclesTable() {
    const vehicleList = Object.values(vehicles);

    if (vehicleList.length === 0) {
        $vehiclesTableBody.innerHTML = `<tr class="empty-row"><td colspan="7">No vehicles added.</td></tr>`;
        return;
    }

    let html = '';
    vehicleList.forEach(v => {
        let driverSelectHtml = `<select class="table-select" onchange="assignDriverToVehicle('${v.id}', this.value)">`;
        driverSelectHtml += `<option value="">-- Unassigned --</option>`;
        Object.values(drivers).forEach(d => {
            const isSelected = v.driverId === d.id ? 'selected' : '';
            driverSelectHtml += `<option value="${d.id}" ${isSelected}>${escHtml(d.name)} (${phoneTypeDisplay(d.phoneType)})</option>`;
        });
        driverSelectHtml += `</select>`;

        const sourceDisplay = v.source === 'app'
            ? '<span class="source-badge app">📱 Driver App GPS</span>'
            : '<span class="source-badge sim">📶 Telecom SIM LBS</span>';

        let statusHtml = '';
        if (v.status === 'driving') {
            statusHtml = `<span class="cell-status-active">🟢 Driving</span>`;
        } else if (v.status === 'stopped') {
            statusHtml = `<span style="color:#DC2626;font-weight:500;">🔴 Stopped</span>`;
        } else {
            statusHtml = `<span style="color:#94A3B8;">⚪ Idle</span>`;
        }

        html += `
            <tr>
                <td class="cell-plate">${escHtml(v.plate)}</td>
                <td>${escHtml(v.model)}</td>
                <td>${escHtml(v.type)}</td>
                <td>${sourceDisplay}</td>
                <td>${driverSelectHtml}</td>
                <td>${statusHtml}</td>
                <td style="white-space:nowrap;">
                    <button class="btn btn-sm btn-outline" style="padding:4px 8px; font-size:12px;" onclick="openEditVehicleModal('${v.id}')">✏️ Edit</button>
                    <button class="btn btn-sm btn-ghost" style="padding:4px 8px; font-size:12px; color:#DC2626;" onclick="deleteVehicle('${v.id}')" title="Delete Vehicle">🗑️</button>
                </td>
            </tr>
        `;
    });

    $vehiclesTableBody.innerHTML = html;
}

// ── Render: Drivers Table ──────────────────────────────────

/**
 * Render the drivers table.
 */
function renderDriversTable() {
    const driverList = Object.values(drivers);

    if (driverList.length === 0) {
        $driversTableBody.innerHTML = `<tr class="empty-row"><td colspan="9">No drivers added.</td></tr>`;
        return;
    }

    let html = '';
    driverList.forEach(d => {
        let vehicleSelectHtml = `<select class="table-select" onchange="assignTruckToDriver('${d.id}', this.value)">`;
        vehicleSelectHtml += `<option value="">-- No Truck Assigned --</option>`;
        Object.values(vehicles).forEach(v => {
            const isSelected = d.assignedVehicle === v.id ? 'selected' : '';
            vehicleSelectHtml += `<option value="${v.id}" ${isSelected}>${escHtml(v.plate)} (${escHtml(v.model)})</option>`;
        });
        vehicleSelectHtml += `</select>`;

        const phoneClass = d.phoneType === 'smart' ? 'cell-phone-smart' : 'cell-phone-button';
        const phoneLabel = phoneTypeDisplay(d.phoneType);

        const expiryDate = d.licenceExpiry || '—';

        html += `
            <tr>
                <td><strong>${escHtml(d.name)}</strong></td>
                <td>${escHtml(d.phone)}</td>
                <td class="${phoneClass}">${phoneLabel}</td>
                <td>${escHtml(d.device || '—')}</td>
                <td class="cell-plate">${vehicleSelectHtml}</td>
                <td>${escHtml(d.destination || 'Sriperumbudur Logistics Hub')}</td>
                <td>${escHtml(d.licence || '—')}</td>
                <td>${expiryDate}</td>
                <td style="white-space:nowrap;">
                    <button type="button" class="btn btn-sm btn-outline" style="padding:4px 8px; font-size:12px;" onclick="openEditDriverModal('${d.id}')">✏️ Edit</button>
                    <button type="button" class="btn btn-sm btn-ghost" style="padding:4px 8px; font-size:12px; color:#DC2626;" onclick="deleteDriver('${d.id}')" title="Delete Driver">🗑️</button>
                </td>
            </tr>
        `;
    });

    $driversTableBody.innerHTML = html;
}

/**
 * Assigns a truck to a driver with two-way sync
 * @param {string} driverId
 * @param {string} vehicleId
 */
window.assignTruckToDriver = function(driverId, vehicleId) {
    const driver = drivers[driverId];
    if (!driver) return;

    // Unassign old vehicle if any
    if (driver.assignedVehicle && vehicles[driver.assignedVehicle]) {
        vehicles[driver.assignedVehicle].driverId = '';
    }

    if (!vehicleId) {
        driver.assignedVehicle = '';
        showToast(`Truck unassigned from ${driver.name}.`, 'info');
        refreshAll();
        return;
    }

    const v = vehicles[vehicleId];
    if (!v) return;

    // Unassign previous driver of this vehicle if any
    if (v.driverId && drivers[v.driverId] && v.driverId !== driverId) {
        drivers[v.driverId].assignedVehicle = '';
    }

    driver.assignedVehicle = vehicleId;
    v.driverId = driverId;

    if (driver.phoneType === 'button') {
        v.source = 'sim';
    } else {
        v.source = 'app';
    }

    showToast(`🚛 Truck ${v.plate} successfully assigned to ${driver.name}!`, 'success');
    refreshAll();
};

/**
 * Assigns a driver to a vehicle with two-way sync
 * @param {string} vehicleId
 * @param {string} driverId
 */
window.assignDriverToVehicle = function(vehicleId, driverId) {
    const v = vehicles[vehicleId];
    if (!v) return;

    if (v.driverId && drivers[v.driverId]) {
        drivers[v.driverId].assignedVehicle = '';
    }

    if (!driverId) {
        v.driverId = '';
        showToast(`Driver unassigned from ${v.plate}.`, 'info');
        refreshAll();
        return;
    }

    const driver = drivers[driverId];
    if (!driver) return;

    if (driver.assignedVehicle && vehicles[driver.assignedVehicle] && driver.assignedVehicle !== vehicleId) {
        vehicles[driver.assignedVehicle].driverId = '';
    }

    v.driverId = driverId;
    driver.assignedVehicle = vehicleId;

    if (driver.phoneType === 'button') {
        v.source = 'sim';
    } else {
        v.source = 'app';
    }

    showToast(`👤 Driver ${driver.name} assigned to truck ${v.plate}!`, 'success');
    refreshAll();
};

/**
 * Populates the Missed Call simulator driver selector with all button phone drivers
 */
function populateSimDriverSelector() {
    const $select = document.getElementById('simDriverSelector');
    if (!$select) return;
    const buttonDrivers = Object.values(drivers).filter(d => d.phoneType === 'button');
    if (buttonDrivers.length === 0) {
        $select.innerHTML = '<option value="">No button phone drivers registered</option>';
        return;
    }
    const currentVal = $select.value;
    let html = '';
    buttonDrivers.forEach(d => {
        const v = d.assignedVehicle && vehicles[d.assignedVehicle] ? vehicles[d.assignedVehicle].plate : '⚠️ No Truck Assigned';
        html += `<option value="${d.id}">${escHtml(d.name)} (${escHtml(d.phone)} · ${v})</option>`;
    });
    $select.innerHTML = html;
    if (currentVal && drivers[currentVal]) {
        $select.value = currentVal;
    }
}

// ── Refresh All & LocalStorage Persistence ─────────────────

/**
 * Save current state to localStorage
 */
function saveStateToStorage() {
    try {
        localStorage.setItem('fleet_admin_vehicles_v5', JSON.stringify(vehicles));
        localStorage.setItem('fleet_admin_drivers_v5', JSON.stringify(drivers));
        localStorage.setItem('fleet_admin_trips_v5', JSON.stringify(trips));
    } catch (e) {
        console.warn('[Admin] Failed to save state to localStorage:', e);
    }
}

/**
 * Load state from localStorage if available
 */
function loadStateFromStorage() {
    try {
        // Clean up legacy storage versions
        ['v1', 'v2', 'v3', 'v4'].forEach(ver => {
            try {
                localStorage.removeItem(`fleet_admin_vehicles_${ver}`);
                localStorage.removeItem(`fleet_admin_drivers_${ver}`);
                localStorage.removeItem(`fleet_admin_trips_${ver}`);
            } catch (_) {}
        });

        const vRaw = localStorage.getItem('fleet_admin_vehicles_v5');
        const dRaw = localStorage.getItem('fleet_admin_drivers_v5');
        const tRaw = localStorage.getItem('fleet_admin_trips_v5');
        if (vRaw) {
            const parsed = JSON.parse(vRaw);
            Object.keys(parsed).forEach(k => {
                if (vehicles[k] && parsed[k]) {
                    // Only accept valid coordinates strictly inside regional freight map bounds
                    if (parsed[k].lat && parsed[k].lng &&
                        parsed[k].lat >= 12.60 && parsed[k].lat <= 13.40 &&
                        parsed[k].lng >= 79.60 && parsed[k].lng <= 80.40) {
                        vehicles[k].lat = parsed[k].lat;
                        vehicles[k].lng = parsed[k].lng;
                    }
                    if (parsed[k].status) vehicles[k].status = parsed[k].status;
                    if (parsed[k].speed !== undefined) vehicles[k].speed = parsed[k].speed;
                    if (parsed[k].driverId) vehicles[k].driverId = parsed[k].driverId;
                    if (parsed[k].battery !== undefined) vehicles[k].battery = parsed[k].battery;
                }
            });
        }
        if (dRaw) {
            const parsed = JSON.parse(dRaw);
            Object.assign(drivers, parsed);
        }
        if (tRaw) {
            const parsed = JSON.parse(tRaw);
            trips.length = 0;
            parsed.forEach(t => {
                if (t.startTime) t.startTime = new Date(t.startTime);
                if (t.endTime) t.endTime = new Date(t.endTime);
                trips.push(t);
            });
            const ids = trips.map(t => typeof t.id === 'number' ? t.id : parseInt(t.id, 10)).filter(n => !isNaN(n));
            if (ids.length > 0) tripCounter = Math.max(...ids);
        }
    } catch (e) {
        console.warn('[Admin] Failed to load state from localStorage:', e);
    }
}

/**
 * Refresh all dashboard panels and metrics.
 */
function refreshAll() {
    refreshMetrics();
    renderStatusCards();
    renderTripsTable();
    renderVehiclesTable();
    renderDriversTable();
    populateSimDriverSelector();
    updateLiveMapKpis();
    renderLiveFleetList();
    updateFleetMapMarkers();
    renderSelectedVehicleDetail();
    saveStateToStorage();
}

// ── HTML Escape ────────────────────────────────────────────

/**
 * Escape HTML special characters to prevent XSS.
 * @param {string} str
 * @returns {string}
 */
function escHtml(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}
const escapeHtml = escHtml;

// ── Add Vehicle Form ───────────────────────────────────────

const $formAddVehicle = document.getElementById('formAddVehicle');
const $btnAddVehicle = document.getElementById('btnAddVehicle');
const $btnSaveVehicle = document.getElementById('btnSaveVehicle');
const $btnCancelVehicle = document.getElementById('btnCancelVehicle');

$btnAddVehicle.addEventListener('click', () => {
    $formAddVehicle.classList.remove('hidden');
    $btnAddVehicle.style.display = 'none';

    const $drvSelect = document.getElementById('vAssignedDriver');
    if ($drvSelect) {
        let dHtml = '<option value="">-- No Driver Assigned --</option>';
        Object.values(drivers).forEach(d => {
            const currentTruck = d.assignedVehicle && vehicles[d.assignedVehicle] ? ` (${vehicles[d.assignedVehicle].plate})` : ' (Available)';
            dHtml += `<option value="${d.id}">${escHtml(d.name)} (${phoneTypeDisplay(d.phoneType)})${currentTruck}</option>`;
        });
        $drvSelect.innerHTML = dHtml;
    }
});

$btnCancelVehicle.addEventListener('click', () => {
    $formAddVehicle.classList.add('hidden');
    $btnAddVehicle.style.display = '';
    clearVehicleForm();
});

$btnSaveVehicle.addEventListener('click', () => {
    const plate = document.getElementById('vPlate').value.trim();
    const model = document.getElementById('vModel').value.trim();
    const type = document.getElementById('vType').value;
    const source = document.getElementById('vTracking').value;
    const assignedDriver = document.getElementById('vAssignedDriver') ? document.getElementById('vAssignedDriver').value : '';

    if (!plate) {
        showToast('Please enter a registration plate.', 'warning');
        return;
    }
    if (!model) {
        showToast('Please enter a vehicle model.', 'warning');
        return;
    }

    // Generate a new vehicle ID
    const existingIds = Object.keys(vehicles).map(k => parseInt(k.replace('v', ''), 10)).filter(n => !isNaN(n));
    const nextId = existingIds.length > 0 ? Math.max(...existingIds) + 1 : 1;
    const vid = `v${nextId}`;

    vehicles[vid] = {
        id: vid,
        plate: plate,
        model: model,
        type: type,
        source: source,
        driverId: assignedDriver,
        status: 'no-trip',
        speed: 0,
        currentLocation: '',
        lat: 0,
        lng: 0
    };

    if (assignedDriver && drivers[assignedDriver]) {
        drivers[assignedDriver].assignedVehicle = vid;
        if (drivers[assignedDriver].phoneType === 'button') {
            vehicles[vid].source = 'sim';
        }
    }

    showToast(`Vehicle ${plate} added successfully!`, 'success');
    clearVehicleForm();
    $formAddVehicle.classList.add('hidden');
    $btnAddVehicle.style.display = '';
    refreshAll();
});

function clearVehicleForm() {
    document.getElementById('vPlate').value = '';
    document.getElementById('vModel').value = '';
    document.getElementById('vType').selectedIndex = 0;
    document.getElementById('vTracking').selectedIndex = 0;
}

// ── Add Driver Form ────────────────────────────────────────

const $formAddDriver = document.getElementById('formAddDriver');
const $btnAddDriver = document.getElementById('btnAddDriver');
const $btnSaveDriver = document.getElementById('btnSaveDriver');
const $btnCancelDriver = document.getElementById('btnCancelDriver');

$btnAddDriver.addEventListener('click', () => {
    $formAddDriver.classList.remove('hidden');
    $btnAddDriver.style.display = 'none';

    const $vehSelect = document.getElementById('dAssignedVehicle');
    if ($vehSelect) {
        let vHtml = '<option value="">-- No Truck Assigned --</option>';
        Object.values(vehicles).forEach(v => {
            const currentDriver = v.driverId && drivers[v.driverId] ? ` (${drivers[v.driverId].name})` : ' (Available)';
            vHtml += `<option value="${v.id}">${escHtml(v.plate)} - ${escHtml(v.model)}${currentDriver}</option>`;
        });
        $vehSelect.innerHTML = vHtml;
    }
});

$btnCancelDriver.addEventListener('click', () => {
    $formAddDriver.classList.add('hidden');
    $btnAddDriver.style.display = '';
    clearDriverForm();
});

$btnSaveDriver.addEventListener('click', () => {
    const name = document.getElementById('dName').value.trim();
    const phone = document.getElementById('dPhone').value.trim();
    const phoneType = document.getElementById('dPhoneType').value;
    const device = document.getElementById('dDevice').value.trim();
    const destination = document.getElementById('dDestination') ? document.getElementById('dDestination').value.trim() : 'Sriperumbudur Logistics Hub';
    const licence = document.getElementById('dLicence').value.trim();
    const expiry = document.getElementById('dExpiry').value;
    const assignedVehicle = document.getElementById('dAssignedVehicle') ? document.getElementById('dAssignedVehicle').value : '';

    if (!name) {
        showToast('Please enter the driver name.', 'warning');
        return;
    }
    if (!phone) {
        showToast('Please enter a phone number.', 'warning');
        return;
    }

    // Generate a new driver ID
    const existingIds = Object.keys(drivers).map(k => parseInt(k.replace('d', ''), 10)).filter(n => !isNaN(n));
    const nextId = existingIds.length > 0 ? Math.max(...existingIds) + 1 : 1;
    const did = `d${nextId}`;

    drivers[did] = {
        id: did,
        name: name,
        phone: phone,
        phoneType: phoneType,
        device: device || (phoneType === 'button' ? 'Feature Keypad Phone' : 'Smartphone'),
        assignedVehicle: assignedVehicle,
        destination: destination || 'Sriperumbudur Logistics Hub',
        licence: licence || '—',
        licenceExpiry: expiry || '—'
    };

    if (assignedVehicle && vehicles[assignedVehicle]) {
        vehicles[assignedVehicle].driverId = did;
        if (phoneType === 'button') {
            vehicles[assignedVehicle].source = 'sim';
        }
    }

    showToast(`Driver ${name} added successfully! Toll-Free Missed Call SMS sent to ${phone}.`, 'success');
    clearDriverForm();
    $formAddDriver.classList.add('hidden');
    $btnAddDriver.style.display = '';
    refreshAll();

    // Automatically send SMS with vehicle number, destination, and 1800 number to driver
    if (phone) {
        sendDriverTollFreeSms(did);
    }
});

function clearDriverForm() {
    document.getElementById('dName').value = '';
    document.getElementById('dPhone').value = '';
    document.getElementById('dPhoneType').selectedIndex = 0;
    document.getElementById('dDevice').value = '';
    if (document.getElementById('dDestination')) document.getElementById('dDestination').value = 'Sriperumbudur Logistics Hub';
    document.getElementById('dLicence').value = '';
    document.getElementById('dExpiry').value = '';
}

// ── Edit & Delete Vehicle / Driver Modals ──────────────────

/**
 * Open the Edit Vehicle modal and populate inputs
 * @param {string} vid
 */
window.openEditVehicleModal = function(vid) {
    const v = vehicles[vid];
    if (!v) return;

    document.getElementById('editVehicleId').value = v.id;
    document.getElementById('editVehiclePlate').value = v.plate || '';
    document.getElementById('editVehicleModel').value = v.model || '';
    document.getElementById('editVehicleType').value = v.type || 'Truck 28T';
    document.getElementById('editVehicleTracking').value = v.source || 'app';

    const $driverSelect = document.getElementById('editVehicleDriver');
    if ($driverSelect) {
        let dHtml = '<option value="">-- No Driver Assigned --</option>';
        Object.values(drivers).forEach(d => {
            const isSel = v.driverId === d.id ? 'selected' : '';
            const currTruckNote = d.assignedVehicle && d.assignedVehicle !== v.id && vehicles[d.assignedVehicle]
                ? ` (${vehicles[d.assignedVehicle].plate})`
                : '';
            dHtml += `<option value="${d.id}" ${isSel}>${escHtml(d.name)} (${phoneTypeDisplay(d.phoneType)})${currTruckNote}</option>`;
        });
        $driverSelect.innerHTML = dHtml;
    }

    const modal = document.getElementById('modalEditVehicle');
    if (modal) {
        modal.classList.remove('hidden');
        modal.style.display = 'flex';
    }
};

/**
 * Close the Edit Vehicle modal
 */
function closeEditVehicleModal() {
    const modal = document.getElementById('modalEditVehicle');
    if (modal) {
        modal.classList.add('hidden');
        modal.style.display = 'none';
    }
}
window.closeEditVehicleModal = closeEditVehicleModal;

/**
 * Save updated vehicle details
 */
window.saveEditedVehicle = function() {
    const vid = document.getElementById('editVehicleId').value;
    const v = vehicles[vid];
    if (!v) return;

    const plate = document.getElementById('editVehiclePlate').value.trim();
    const model = document.getElementById('editVehicleModel').value.trim();
    const type = document.getElementById('editVehicleType').value;
    const source = document.getElementById('editVehicleTracking').value;
    const driverId = document.getElementById('editVehicleDriver').value;

    if (!plate) {
        showToast('Please enter registration plate.', 'warning');
        return;
    }
    if (!model) {
        showToast('Please enter vehicle model.', 'warning');
        return;
    }

    v.plate = plate;
    v.model = model;
    v.type = type;
    v.source = source;

    // Handle driver reassignment
    if (v.driverId && v.driverId !== driverId && drivers[v.driverId]) {
        drivers[v.driverId].assignedVehicle = '';
    }

    if (driverId && drivers[driverId]) {
        const d = drivers[driverId];
        if (d.assignedVehicle && d.assignedVehicle !== vid && vehicles[d.assignedVehicle]) {
            vehicles[d.assignedVehicle].driverId = '';
        }
        d.assignedVehicle = vid;
        v.driverId = driverId;
        if (d.phoneType === 'button') {
            v.source = 'sim';
        }
    } else {
        v.driverId = '';
    }

    // Update active trips if any
    trips.forEach(t => {
        if (t.vehicleId === vid && t.status === 'active') {
            t.plate = plate;
            if (v.driverId && drivers[v.driverId]) {
                t.driverId = v.driverId;
                t.driverName = drivers[v.driverId].name;
            }
        }
    });

    closeEditVehicleModal();
    showToast(`🚛 Vehicle ${plate} updated successfully!`, 'success');
    refreshAll();
};

/**
 * Delete a vehicle (Instant 1-click delete without annoying browser alert popups)
 * @param {string} vid
 */
window.deleteVehicle = function(vid) {
    const v = vehicles[vid];
    if (!v) return;

    if (v.status === 'driving') {
        showToast(`⚠️ Cannot delete ${v.plate} while trip is active! Please end trip first.`, 'warning');
        return;
    }

    const plate = v.plate;

    // Unassign driver if any
    if (v.driverId && drivers[v.driverId]) {
        drivers[v.driverId].assignedVehicle = '';
    }

    delete vehicles[vid];
    showToast(`🗑️ Vehicle ${plate} deleted successfully.`, 'info');
    refreshAll();
};

/**
 * Open the Edit Driver modal and populate inputs
 * @param {string} did
 */
window.openEditDriverModal = function(did) {
    const d = drivers[did];
    if (!d) return;

    document.getElementById('editDriverId').value = d.id;
    document.getElementById('editDriverName').value = d.name || '';
    document.getElementById('editDriverPhone').value = d.phone || '';
    document.getElementById('editDriverPhoneType').value = d.phoneType || 'smart';
    document.getElementById('editDriverDevice').value = d.device || '';
    if (document.getElementById('editDriverDestination')) {
        document.getElementById('editDriverDestination').value = d.destination || 'Sriperumbudur Logistics Hub';
    }
    document.getElementById('editDriverLicence').value = (d.licence && d.licence !== '—') ? d.licence : '';
    document.getElementById('editDriverExpiry').value = (d.licenceExpiry && d.licenceExpiry !== '—') ? d.licenceExpiry : '';

    const $vehSelect = document.getElementById('editDriverVehicle');
    if ($vehSelect) {
        let vHtml = '<option value="">-- No Truck Assigned --</option>';
        Object.values(vehicles).forEach(v => {
            const isSel = d.assignedVehicle === v.id ? 'selected' : '';
            const currDriverNote = v.driverId && v.driverId !== d.id && drivers[v.driverId]
                ? ` (${drivers[v.driverId].name})`
                : '';
            vHtml += `<option value="${v.id}" ${isSel}>${escHtml(v.plate)} - ${escHtml(v.model)}${currDriverNote}</option>`;
        });
        $vehSelect.innerHTML = vHtml;
    }

    const modal = document.getElementById('modalEditDriver');
    if (modal) {
        modal.classList.remove('hidden');
        modal.style.display = 'flex';
    }
};

/**
 * Close the Edit Driver modal
 */
function closeEditDriverModal() {
    const modal = document.getElementById('modalEditDriver');
    if (modal) {
        modal.classList.add('hidden');
        modal.style.display = 'none';
    }
}
window.closeEditDriverModal = closeEditDriverModal;

/**
 * Save updated driver details
 */
window.saveEditedDriver = function() {
    const did = document.getElementById('editDriverId').value;
    const d = drivers[did];
    if (!d) return;

    const name = document.getElementById('editDriverName').value.trim();
    const phone = document.getElementById('editDriverPhone').value.trim();
    const phoneType = document.getElementById('editDriverPhoneType').value;
    const device = document.getElementById('editDriverDevice').value.trim();
    const destination = document.getElementById('editDriverDestination') ? document.getElementById('editDriverDestination').value.trim() : '';
    const licence = document.getElementById('editDriverLicence').value.trim();
    const expiry = document.getElementById('editDriverExpiry').value;
    const assignedVehicle = document.getElementById('editDriverVehicle').value;

    if (!name) {
        showToast('Please enter driver name.', 'warning');
        return;
    }
    if (!phone) {
        showToast('Please enter phone number.', 'warning');
        return;
    }

    d.name = name;
    d.phone = phone;
    d.phoneType = phoneType;
    d.device = device || (phoneType === 'button' ? 'Feature Keypad Phone' : 'Smartphone');
    d.destination = destination || 'Sriperumbudur Logistics Hub';
    d.licence = licence || '—';
    d.licenceExpiry = expiry || '—';

    // Handle vehicle reassignment
    if (d.assignedVehicle && d.assignedVehicle !== assignedVehicle && vehicles[d.assignedVehicle]) {
        vehicles[d.assignedVehicle].driverId = '';
    }

    if (assignedVehicle && vehicles[assignedVehicle]) {
        const v = vehicles[assignedVehicle];
        if (v.driverId && v.driverId !== did && drivers[v.driverId]) {
            drivers[v.driverId].assignedVehicle = '';
        }
        d.assignedVehicle = assignedVehicle;
        v.driverId = did;
        if (phoneType === 'button') {
            v.source = 'sim';
        } else {
            v.source = 'app';
        }
    } else {
        d.assignedVehicle = '';
    }

    // Update active trips if any
    trips.forEach(t => {
        if (t.driverId === did && t.status === 'active') {
            t.driverName = name;
        }
    });

    closeEditDriverModal();
    showToast(`👤 Driver ${name} updated successfully!`, 'success');
    refreshAll();
};

/**
 * Delete a driver (Instant 1-click delete without annoying browser alert popups)
 * @param {string} did
 */
window.deleteDriver = function(did) {
    const d = drivers[did];
    if (!d) return;

    if (d.assignedVehicle && vehicles[d.assignedVehicle] && vehicles[d.assignedVehicle].status === 'driving') {
        showToast(`⚠️ Cannot delete ${d.name} while their truck (${vehicles[d.assignedVehicle].plate}) is on an active trip!`, 'warning');
        return;
    }

    const name = d.name;

    // Unassign from vehicle
    if (d.assignedVehicle && vehicles[d.assignedVehicle]) {
        vehicles[d.assignedVehicle].driverId = '';
    }

    delete drivers[did];
    showToast(`🗑️ Driver ${name} deleted successfully.`, 'info');
    refreshAll();
};

// ── Automated Driver Toll-Free SMS Dispatch (Background) ───

/**
 * Automatically dispatches the 1800-419-7890 Toll-Free missed call instructions to the driver via SMS (silent background)
 * @param {string} driverId
 */
window.sendDriverTollFreeSms = async function(driverId) {
    const d = drivers[driverId];
    if (!d || !d.phone) return;

    const truckPlate = (d.assignedVehicle && vehicles[d.assignedVehicle])
        ? `${vehicles[d.assignedVehicle].plate} (${vehicles[d.assignedVehicle].model})`
        : 'Assigned Truck';

    const destination = d.destination || 'Sriperumbudur Logistics Hub';

    try {
        await fetch('/api/send-driver-sms', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                driverName: d.name,
                phone: d.phone,
                truckPlate: truckPlate,
                destination: destination,
                tollFree: '1800-419-7890'
            })
        });

        d.smsSent = true;
        d.smsTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        saveStateToStorage();
    } catch (err) {
        console.warn('[SMS] Background dispatch handled:', err);
    }
};

// Close modals when clicking overlay backdrop or pressing Escape
document.addEventListener('click', (e) => {
    if (e.target && e.target.id === 'modalEditVehicle') closeEditVehicleModal();
    if (e.target && e.target.id === 'modalEditDriver') closeEditDriverModal();
});

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closeEditVehicleModal();
        closeEditDriverModal();
    }
});

// ── Export CSV ──────────────────────────────────────────────

document.getElementById('btnExportCSV').addEventListener('click', () => {
    if (trips.length === 0) {
        showToast('No trip data to export.', 'warning');
        return;
    }

    const headers = ['Trip #', 'Truck Plate', 'Driver Name', 'Start Time', 'Start Location', 'End Time', 'End Location', 'Duration', 'Halt Time', 'Halt Reason', 'Avg Speed (km/h)', 'Distance (km)', 'Status'];

    const rows = trips.map(t => {
        const isActive = t.status === 'active';
        const duration = isActive ? runningDuration(t.startTime) : t.duration;
        const avgSpeed = isActive ? t.speed : t.avgSpeed;
        const distance = t.distanceKm > 0 ? t.distanceKm.toFixed(2) : '';
        const status = isActive ? 'Active' : 'Completed';
        const haltTime = formatHaltDuration(t.haltSeconds || 0);
        const haltReason = t.haltReason || '';

        return [
            t.id,
            `"${t.plate}"`,
            `"${t.driverName}"`,
            `"${fmtTime(t.startTime)}"`,
            `"${t.startLocation}"`,
            t.endTime ? `"${fmtTime(t.endTime)}"` : '',
            t.endLocation ? `"${t.endLocation}"` : '',
            `"${duration}"`,
            `"${haltTime}"`,
            `"${haltReason}"`,
            avgSpeed || '',
            distance,
            status
        ].join(',');
    });

    const csv = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `trip_history_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();

    URL.revokeObjectURL(url);
    showToast('CSV exported successfully!', 'success');
});

// ── Toast Notifications ────────────────────────────────────

/**
 * Show a toast notification.
 * @param {string} message - The toast message
 * @param {'success'|'info'|'warning'} type - Toast type for styling
 */
function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    $toastContainer.appendChild(toast);

    // Remove after animation completes (4 seconds total)
    setTimeout(() => {
        if (toast.parentNode) {
            toast.parentNode.removeChild(toast);
        }
    }, 4100);
}

// ── BroadcastChannel: Real-Time Sync ───────────────────────

let syncChannel = null;

try {
    syncChannel = new BroadcastChannel('fleet-tracker-sync');

    syncChannel.onmessage = (event) => {
        const data = event.data;

        // Only handle DRIVER_ACTION messages
        if (!data || data.type !== 'DRIVER_ACTION') return;

        console.log('[Admin] Received sync message:', data.action, data);

        switch (data.action) {
            case 'START_TRIP':
                handleStartTrip(data);
                break;
            case 'END_TRIP':
                handleEndTrip(data);
                break;
            case 'SPEED_UPDATE':
                handleSpeedUpdate(data);
                break;
            case 'LOCATION_UPDATE':
                handleLocationUpdate(data);
                break;
            default:
                console.warn('[Admin] Unknown action:', data.action);
        }
    };

    console.log('[Admin] BroadcastChannel "fleet-tracker-sync" listening.');
} catch (err) {
    console.warn('[Admin] BroadcastChannel not supported:', err);
}

// Fallback: localStorage storage event listener for cross-tab sync
window.addEventListener('storage', (e) => {
    if (e.key && e.key.startsWith('fleet_driver_') && e.key.endsWith('_sync') && e.newValue) {
        try {
            const data = JSON.parse(e.newValue);
            if (data && data.type === 'DRIVER_ACTION') {
                console.log('[Admin] Received localStorage sync:', data.action);
                switch (data.action) {
                    case 'START_TRIP': handleStartTrip(data); break;
                    case 'END_TRIP': handleEndTrip(data); break;
                    case 'SPEED_UPDATE': handleSpeedUpdate(data); break;
                    case 'LOCATION_UPDATE': handleLocationUpdate(data); break;
                }
            }
        } catch (err) {
            console.warn('[Admin] Error parsing localStorage sync:', err);
        }
    }
});

/**
 * Handle START_TRIP from Driver Portal.
 * @param {Object} data - Payload with vehicleId, plate, driverName, startTime, startLocation, lat, lng
 */
function handleStartTrip(data) {
    const vehicleId = data.vehicleId;

    // Update vehicle status
    if (vehicles[vehicleId]) {
        vehicles[vehicleId].status = 'driving';
        vehicles[vehicleId].speed = 0;
        vehicles[vehicleId].currentLocation = data.startLocation || '';
        vehicles[vehicleId].lat = data.lat || 0;
        vehicles[vehicleId].lng = data.lng || 0;
    }

    // Create a new trip entry
    tripCounter++;
    const newTrip = {
        id: tripCounter,
        vehicleId: vehicleId,
        plate: data.plate || (vehicles[vehicleId] ? vehicles[vehicleId].plate : 'Unknown'),
        driverId: vehicles[vehicleId] ? vehicles[vehicleId].driverId : '',
        driverName: data.driverName || 'Unknown',
        startTime: parseTimestamp(data.timestamp || data.startTime),
        startLocation: data.startLocation || 'Unknown',
        endTime: null,
        endLocation: '',
        duration: '',
        avgSpeed: 0,
        distanceKm: 0,
        status: 'active',
        speed: 0
    };

    trips.push(newTrip);

    showToast(`🟢 Trip started: ${newTrip.plate} — ${newTrip.driverName} from ${newTrip.startLocation}`, 'success');
    refreshAll();
}

/**
 * Handle END_TRIP from Driver Portal.
 * @param {Object} data - Payload with vehicleId, plate, driverName, endTime, endLocation, lat, lng, distanceKm
 */
function handleEndTrip(data) {
    const vehicleId = data.vehicleId;

    // Find the active trip for this vehicle
    const trip = getActiveTripForVehicle(vehicleId);

    if (trip) {
        const endTime = parseTimestamp(data.timestamp || data.endTime);
        trip.endTime = endTime;
        trip.endLocation = data.endLocation || 'Unknown';
        trip.status = 'completed';
        trip.speed = 0;
        trip.distanceKm = data.distanceKm || trip.distanceKm || 0;
        if (data.haltSeconds !== undefined) trip.haltSeconds = data.haltSeconds;
        if (data.haltReason) trip.haltReason = data.haltReason;
        trip.duration = calcDuration(trip.startTime, trip.endTime);

        // Calculate average speed if we have distance and duration
        const durationHrs = (trip.endTime - trip.startTime) / 3600000;
        if (trip.distanceKm > 0 && durationHrs > 0) {
            trip.avgSpeed = Math.round(trip.distanceKm / durationHrs);
        }
    }

    // Update vehicle status
    if (vehicles[vehicleId]) {
        vehicles[vehicleId].status = 'stopped';
        vehicles[vehicleId].speed = 0;
        vehicles[vehicleId].isHalted = false;
        vehicles[vehicleId].currentLocation = data.endLocation || '';
        vehicles[vehicleId].lat = data.lat || 0;
        vehicles[vehicleId].lng = data.lng || 0;
        if (data.haltSeconds !== undefined) vehicles[vehicleId].haltSeconds = data.haltSeconds;
        if (data.haltReason) vehicles[vehicleId].haltReason = data.haltReason;
    }

    const plate = data.plate || (vehicles[vehicleId] ? vehicles[vehicleId].plate : 'Unknown');
    showToast(`🔴 Trip ended: ${plate} — arrived at ${data.endLocation || 'Unknown'}`, 'info');
    refreshAll();
}

/**
 * Handle SPEED_UPDATE from Driver Portal.
 * @param {Object} data - Payload with vehicleId, speed, kmToday
 */
function handleSpeedUpdate(data) {
    const vehicleId = data.vehicleId;

    if (vehicles[vehicleId]) {
        vehicles[vehicleId].speed = data.speed || 0;
        vehicles[vehicleId].isHalted = !!data.isHalted;
        if (data.haltSeconds !== undefined) vehicles[vehicleId].haltSeconds = data.haltSeconds;
        if (data.haltReason) vehicles[vehicleId].haltReason = data.haltReason;
    }

    // Also update the active trip's speed, distance & halt
    const trip = getActiveTripForVehicle(vehicleId);
    if (trip) {
        trip.speed = data.speed || 0;
        if (data.tripDistance !== undefined && data.tripDistance > 0) {
            trip.distanceKm = data.tripDistance;
        } else if (data.kmToday && data.kmToday > trip.distanceKm) {
            trip.distanceKm = data.kmToday;
        }
        if (data.haltSeconds !== undefined) trip.haltSeconds = data.haltSeconds;
        if (data.haltReason) trip.haltReason = data.haltReason;
    }

    // Refresh UI without toast (speed updates are frequent)
    refreshAll();
}

/**
 * Handle LOCATION_UPDATE from Driver Portal.
 * @param {Object} data - Payload with vehicleId, lat, lng, locationName
 */
function handleLocationUpdate(data) {
    const vehicleId = data.vehicleId;

    if (vehicles[vehicleId]) {
        vehicles[vehicleId].lat = data.lat || 0;
        vehicles[vehicleId].lng = data.lng || 0;
        if (data.locationName) {
            vehicles[vehicleId].currentLocation = data.locationName;
        }
    }

    // Refresh UI without toast (location updates are frequent)
    refreshAll();
}

// ── 2-Second Ticker ────────────────────────────────────────

/**
 * Ticker that runs every 2 seconds to:
 *  1. Update the header clock
 *  2. Recalculate running duration for active trips
 *  3. Re-render affected displays
 */
function tick() {
    updateClock();

    // Advance simulated speed/distance for active SIM trips
    Object.values(vehicles).forEach(v => {
        if (v.source === 'sim' && v.status === 'driving') {
            const delta = (Math.random() - 0.49) * 2;
            v.speed = Math.max(40, Math.min(65, Math.round(v.speed + delta)));
            const activeTrip = getActiveTripForVehicle(v.id);
            if (activeTrip) {
                activeTrip.speed = v.speed;
                activeTrip.distanceKm = +(activeTrip.distanceKm + 0.03).toFixed(2);
            }
        }

        // Slight live GPS advancement along corridor for any driving truck
        if (v.status === 'driving' && v.lat && v.lng) {
            const latDelta = (Math.random() * 0.0003) - 0.0001;
            const lngDelta = (Math.random() * 0.0003) - 0.0001;
            v.lat = +(v.lat + latDelta).toFixed(5);
            v.lng = +(v.lng + lngDelta).toFixed(5);
        }
    });

    // Check if there are active trips — if so, re-render to update durations
    const hasActiveTrips = trips.some(t => t.status === 'active');
    if (hasActiveTrips) {
        renderStatusCards();
        renderTripsTable();
        refreshMetrics();
        if (typeof fleetMap !== 'undefined' && fleetMap) {
            updateFleetMapMarkers();
        }
    }

    // Always update selected vehicle details in right panel (speed, halt timers, live duration)
    renderSelectedVehicleDetail();
}

// ── Admin Button Phone (SIM LBS) Actions ───────────────────

/**
 * Admin starts a trip on behalf of a button phone driver.
 * @param {string} vehicleId
 */
window.adminStartSimTrip = function(vehicleId) {
    const v = vehicles[vehicleId];
    if (!v) return;
    const driver = getDriverForVehicle(vehicleId);

    v.status = 'driving';
    v.speed = 52;
    v.currentLocation = 'Airtel Tower #4819 - Poonamallee Highway';

    tripCounter++;
    const now = new Date();
    const newTrip = {
        id: tripCounter,
        vehicleId: vehicleId,
        plate: v.plate,
        driverId: v.driverId,
        driverName: driver ? driver.name : 'Unknown Driver',
        startTime: now,
        startLocation: 'Airtel Tower #4819 - Poonamallee Highway',
        endTime: null,
        endLocation: '',
        duration: '',
        avgSpeed: 52,
        distanceKm: 0,
        status: 'active',
        speed: 52
    };

    trips.push(newTrip);

    showToast(`📶 Telecom SIM LBS Tracking active for ${v.plate}! Driver (${driver ? driver.name : ''}) notified via SMS.`, 'success');
    refreshAll();
};

/**
 * Admin ends a trip on behalf of a button phone driver.
 * @param {string} vehicleId
 */
window.adminEndSimTrip = function(vehicleId) {
    const v = vehicles[vehicleId];
    if (!v) return;

    const trip = getActiveTripForVehicle(vehicleId);
    if (trip) {
        const now = new Date();
        trip.endTime = now;
        trip.endLocation = 'Airtel Tower #7204 - Sriperumbudur Hub';
        trip.status = 'completed';
        trip.speed = 0;
        if (!trip.distanceKm || trip.distanceKm < 1) trip.distanceKm = 38.4;
        trip.duration = calcDuration(trip.startTime, trip.endTime);
        const durationHrs = (trip.endTime - trip.startTime) / 3600000;
        if (durationHrs > 0) {
            trip.avgSpeed = Math.round(trip.distanceKm / durationHrs) || 50;
        }
    }

    v.status = 'stopped';
    v.speed = 0;
    v.currentLocation = 'Airtel Tower #7204 - Sriperumbudur Hub';

    showToast(`🔴 SIM Trip ended for ${v.plate}. Logged in Trip History!`, 'info');
    refreshAll();
};

/**
 * Admin pings cell tower for immediate BTS signal and location.
 * @param {string} vehicleId
 */
window.adminPingSim = function(vehicleId) {
    const v = vehicles[vehicleId];
    if (!v) return;
    const towerIds = ['AIRTEL-SPR-4819', 'AIRTEL-KCH-9022', 'JIO-BTS-3312'];
    const randomTower = towerIds[Math.floor(Math.random() * towerIds.length)];
    const randomRssi = -(60 + Math.floor(Math.random() * 20));
    showToast(`📡 Cell Tower Ping: ${randomTower} (RSSI: ${randomRssi} dBm) · Lat: 12.9812, Lng: 79.9488 · Signal: Strong`, 'info');
};

// ── Automated Dispatch: Missed Call & Geofencing ───────────

/**
 * Method 1: Simulate Driver Missed Call to Toll-Free Number (1800-419-7890).
 * Zero admin manual intervention — system auto-starts or auto-ends trip by Caller-ID.
 */
window.simulateDriverMissedCall = function() {
    const driverSelect = document.getElementById('simDriverSelector');
    const driverId = driverSelect ? driverSelect.value : 'd3';
    const driver = drivers[driverId];
    if (!driver) return;

    const vehicleId = driver.assignedVehicle;
    const v = vehicles[vehicleId];
    if (!v) {
        showToast(`⚠️ ${driver.name}-க்கு லாரி எதுவும் அசைன் செய்யப்படவில்லை!\nகீழே உள்ள 'Drivers' டேபில் 'Assigned Truck' டிராப்டவுனில் உங்கள் லாரியைத் தேர்ந்தெடுக்கவும்.`, 'warning');
        return;
    }

    const activeTrip = getActiveTripForVehicle(vehicleId);

    if (!activeTrip) {
        // Driver gave missed call to START trip!
        v.status = 'driving';
        v.speed = 52;
        v.isHalted = false;
        v.haltSeconds = 0;
        v.haltReason = '';
        v.currentLocation = 'Airtel Tower #4819 - Poonamallee Highway';

        tripCounter++;
        const now = new Date();
        const newTrip = {
            id: tripCounter,
            vehicleId: vehicleId,
            plate: v.plate,
            driverId: driver.id,
            driverName: driver.name,
            startTime: now,
            startLocation: 'Airtel Tower #4819 - Poonamallee Highway',
            endTime: null,
            endLocation: '',
            duration: '',
            haltSeconds: 0,
            haltReason: '',
            avgSpeed: 52,
            distanceKm: 0,
            status: 'active',
            speed: 52
        };

        trips.push(newTrip);

        showToast(
            `📞 Incoming Missed Call from ${driver.name} (${driver.phone})!\nTrip #${newTrip.id} AUTO-STARTED for ${v.plate}! Status: 🟢 Driving via Telecom SIM LBS. (Zero Admin Work!)`,
            'success'
        );
        refreshAll();
    } else {
        // Driver gave missed call to END trip!
        const now = new Date();
        activeTrip.endTime = now;
        activeTrip.endLocation = 'Jio Tower #1204 - Sriperumbudur Hub';
        activeTrip.status = 'completed';
        activeTrip.speed = 0;
        if (!activeTrip.distanceKm || activeTrip.distanceKm < 1) {
            activeTrip.distanceKm = 42.8;
        }
        activeTrip.duration = calcDuration(activeTrip.startTime, activeTrip.endTime);
        const durationHrs = (activeTrip.endTime - activeTrip.startTime) / 3600000;
        if (durationHrs > 0) {
            activeTrip.avgSpeed = Math.round(activeTrip.distanceKm / durationHrs) || 50;
        }

        v.status = 'stopped';
        v.speed = 0;
        v.isHalted = false;
        v.currentLocation = 'Sriperumbudur Hub';

        showToast(
            `📞 Incoming Missed Call from ${driver.name} (${driver.phone})!\nTrip #${activeTrip.id} AUTO-COMPLETED! Duration: ${activeTrip.duration}, Distance: ${activeTrip.distanceKm} km. Logged in Trip History!`,
            'info'
        );
        refreshAll();
    }
};

/**
 * Method 2: Simulate Geofence Boundary Crossing (500m Depot Exit / Hub Entry).
 * 100% hands-free: neither driver nor admin presses any button.
 */
window.simulateGeofenceTrigger = function() {
    const driverSelect = document.getElementById('simDriverSelector');
    const driverId = driverSelect ? driverSelect.value : 'd3';
    const driver = drivers[driverId];
    if (!driver) return;

    const vehicleId = driver.assignedVehicle;
    const v = vehicles[vehicleId];
    if (!v) {
        showToast(`⚠️ ${driver.name}-க்கு லாரி எதுவும் அசைன் செய்யப்படவில்லை!\nகீழே உள்ள 'Drivers' டேபில் 'Assigned Truck' டிராப்டவுனில் உங்கள் லாரியைத் தேர்ந்தெடுக்கவும்.`, 'warning');
        return;
    }

    const activeTrip = getActiveTripForVehicle(vehicleId);

    if (!activeTrip) {
        // Vehicle exits 500m Depot Geofence (Madhavaram Depot) -> Auto-Starts Trip!
        v.status = 'driving';
        v.speed = 48;
        v.isHalted = false;
        v.haltSeconds = 0;
        v.haltReason = '';
        v.currentLocation = 'Madhavaram Depot Gate (Geofence Exit: Distance > 500m)';

        tripCounter++;
        const now = new Date();
        const newTrip = {
            id: tripCounter,
            vehicleId: vehicleId,
            plate: v.plate,
            driverId: driver.id,
            driverName: driver.name,
            startTime: now,
            startLocation: 'Madhavaram Logistics Depot (Gate Exit)',
            endTime: null,
            endLocation: '',
            duration: '',
            haltSeconds: 0,
            haltReason: '',
            avgSpeed: 48,
            distanceKm: 0,
            status: 'active',
            speed: 48
        };

        trips.push(newTrip);

        showToast(
            `🌐 GEOFENCE AUTO-START: ${v.plate} crossed 500m Depot boundary!\nTrip #${newTrip.id} started automatically. (Driver & Admin: 100% Hands-Free)`,
            'success'
        );
        refreshAll();
    } else {
        // Vehicle enters 500m Destination Hub Geofence (Sriperumbudur Hub) -> Auto-Ends Trip!
        const now = new Date();
        activeTrip.endTime = now;
        activeTrip.endLocation = 'Sriperumbudur Hub (Geofence Entry: Distance < 500m)';
        activeTrip.status = 'completed';
        activeTrip.speed = 0;
        if (!activeTrip.distanceKm || activeTrip.distanceKm < 1) {
            activeTrip.distanceKm = 56.2;
        }
        activeTrip.duration = calcDuration(activeTrip.startTime, activeTrip.endTime);
        const durationHrs = (activeTrip.endTime - activeTrip.startTime) / 3600000;
        if (durationHrs > 0) {
            activeTrip.avgSpeed = Math.round(activeTrip.distanceKm / durationHrs) || 52;
        }

        v.status = 'stopped';
        v.speed = 0;
        v.isHalted = false;
        v.currentLocation = 'Sriperumbudur Hub Gate';

        showToast(
            `🏁 GEOFENCE AUTO-END: ${v.plate} entered Sriperumbudur Hub 500m gate!\nTrip #${activeTrip.id} completed automatically! Duration: ${activeTrip.duration}, Distance: ${activeTrip.distanceKm} km.`,
            'info'
        );
        refreshAll();
    }
};

// ── Live Fleet Tracking (Screenshot Overview Match) ───────────

let fleetMap = null;
let satelliteGroup = null;
let streetsTileLayer = null;
let currentMapType = 'satellite'; // 'satellite' (Default Hybrid with town/place labels) | 'streets' (OSM)
let routeDisplayMode = 'all';      // 'all' | 'focus'
const fleetMarkers = {};
const fleetRouteLayers = {};
const fleetRouteCasings = {};
const fleetOriginMarkers = {};
const DEFAULT_MAP_CENTER = [12.985, 80.03]; // Exact regional centroid
const DEFAULT_MAP_ZOOM = 10;
let selectedVehicleId = 'v5';              // Default to AP 39 JK 7788 (matches screenshot)
let currentFleetFilter = 'all';
let currentSelectedTimeframe = 'today';
let showRouteOnMap = true;

/**
 * Toggle route display mode between 'all' (all 6 trucks) and 'focus' (selected truck only)
 */
window.toggleRouteFilterMode = function() {
    routeDisplayMode = (routeDisplayMode === 'all') ? 'focus' : 'all';
    const $btn = document.getElementById('btnToggleRouteFilter');
    const $icon = document.getElementById('routeFilterIcon');
    const $text = document.getElementById('routeFilterText');
    if ($btn && $text && $icon) {
        if (routeDisplayMode === 'focus') {
            $icon.textContent = '🎯';
            $text.textContent = 'Focused Route';
            $btn.classList.add('focused');
        } else {
            $icon.textContent = '🛣️';
            $text.textContent = 'All Routes';
            $btn.classList.remove('focused');
        }
    }
    drawAllVehicleRoutes();
};

/**
 * Fit map to show all 6 vehicles and their complete route polylines
 * @param {boolean} animate
 */
function fitMapToAllVehicles(animate = false) {
    if (!fleetMap || typeof L === 'undefined') return;
    const coords = [];
    Object.values(vehicles).forEach(v => {
        if (v.lat && v.lng && v.lat >= 12.60 && v.lat <= 13.40) {
            coords.push([v.lat, v.lng]);
        }
        if (v.route && Array.isArray(v.route)) {
            v.route.forEach(pt => {
                if (pt && pt.length >= 2 && pt[0] >= 12.60 && pt[0] <= 13.40) {
                    coords.push(pt);
                }
            });
        }
    });

    if (coords.length > 0) {
        fleetMap.fitBounds(coords, {
            padding: [45, 45],
            maxZoom: 10,
            animate: animate
        });
    } else {
        fleetMap.setView(DEFAULT_MAP_CENTER, DEFAULT_MAP_ZOOM);
    }
}

/**
 * Determine live vehicle status category: 'moving' | 'halt' | 'offline'
 * @param {Object} v - Vehicle object
 * @returns {string}
 */
function getVehicleStatusCategory(v) {
    if (!v) return 'offline';
    if (v.status === 'offline') return 'offline';
    if (v.status === 'driving' && v.speed > 0) return 'moving';
    if (v.status === 'halted' || (v.status === 'driving' && (v.speed === 0 || v.isHalted))) return 'halt';
    return 'offline';
}

/**
 * Initialize or resize the Leaflet interactive map on the Live Fleet Map tab.
 */
function initOrRefreshFleetMap() {
    const mapContainer = document.getElementById('fleetMap');
    if (!mapContainer || typeof L === 'undefined') return;

    if (!fleetMap) {
        // Default overview view matching user's requested screenshot
        fleetMap = L.map('fleetMap', {
            zoomControl: false,
            scrollWheelZoom: true,
            zoomSnap: 0.25,
            zoomDelta: 0.5
        }).setView(DEFAULT_MAP_CENTER, DEFAULT_MAP_ZOOM);

        // 1. Satellite Base Layer (ESRI World Imagery - Free High Res Aerial)
        const satelliteBase = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
            maxZoom: 19,
            zIndex: 1,
            attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP | V3 Logistics'
        });

        // 2. Satellite Road Network Overlay (Highways, bypass corridors, expressways)
        const satelliteRoads = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Transportation/MapServer/tile/{z}/{y}/{x}', {
            maxZoom: 19,
            zIndex: 2
        });

        // 3. Satellite Places & Towns Reference Layer (Town names: Chennai, Sriperumbudur, Kanchipuram, Chengalpattu, Minjur, etc.)
        const satellitePlaces = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}', {
            maxZoom: 19,
            zIndex: 3
        });

        // Bundle into Hybrid Satellite LayerGroup (Satellite imagery + Town/City Names)
        satelliteGroup = L.layerGroup([satelliteBase, satelliteRoads, satellitePlaces]);

        // 4. Detailed Street View (OpenStreetMap - Alternative option)
        streetsTileLayer = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors | V3 Logistics'
        });

        // Satellite Hybrid view with town names added as DEFAULT on startup!
        satelliteGroup.addTo(fleetMap);
    }

    // Refresh UI components
    updateLiveMapKpis();
    renderLiveFleetList();
    updateFleetMapMarkers();
    renderSelectedVehicleDetail();

    setTimeout(() => {
        if (fleetMap) {
            fleetMap.invalidateSize();
            fitMapToAllVehicles(false);
            drawAllVehicleRoutes();
        }
    }, 120);

    setTimeout(() => {
        if (fleetMap) {
            fleetMap.invalidateSize();
            fitMapToAllVehicles(false);
        }
    }, 450);
}

/**
 * Switch map tile layer between 'satellite' (Hybrid with town/place names) and 'streets' (detailed OSM)
 * @param {string} type - 'satellite' | 'streets'
 */
window.setMapType = function(type) {
    if (!fleetMap) return;
    currentMapType = type;

    if (satelliteGroup && fleetMap.hasLayer(satelliteGroup)) fleetMap.removeLayer(satelliteGroup);
    if (streetsTileLayer && fleetMap.hasLayer(streetsTileLayer)) fleetMap.removeLayer(streetsTileLayer);

    const $cardSat = document.getElementById('cardMapSatellite');
    const $cardStreets = document.getElementById('cardMapStreets');

    if ($cardSat) $cardSat.classList.remove('active');
    if ($cardStreets) $cardStreets.classList.remove('active');

    if (type === 'streets') {
        if (streetsTileLayer) streetsTileLayer.addTo(fleetMap);
        if ($cardStreets) $cardStreets.classList.add('active');
    } else {
        // 'satellite' (default)
        if (satelliteGroup) satelliteGroup.addTo(fleetMap);
        if ($cardSat) $cardSat.classList.add('active');
    }
};

/**
 * Dedicated zoom in handler
 */
window.zoomInMap = function() {
    if (fleetMap) fleetMap.zoomIn();
};

/**
 * Dedicated zoom out handler
 */
window.zoomOutMap = function() {
    if (fleetMap) fleetMap.zoomOut();
};

/**
 * Update Top 5 KPI Cards and Tab Filter Counts
 */
function updateLiveMapKpis() {
    const list = Object.values(vehicles);
    const total = list.length;
    let moving = 0;
    let halt = 0;
    let offline = 0;
    let totalDist = 0;

    list.forEach(v => {
        const cat = getVehicleStatusCategory(v);
        if (cat === 'moving') moving++;
        else if (cat === 'halt' || cat === 'idle') halt++;
        else offline++;
        totalDist += (v.distanceToday || 0);
    });

    const activeTrips = trips.filter(t => t.status === 'active').length || moving;
    const completedToday = trips.filter(t => {
        if (t.status !== 'completed' || !t.endTime) return false;
        const now = new Date();
        return t.endTime.toDateString() === now.toDateString();
    }).length;
    const haltedCount = list.filter(v => v.status === 'driving' && (v.isHalted || v.speed === 0)).length || halt;
    const totalDrivers = Object.keys(drivers).length;

    const $total = document.getElementById('kpiTotalVehicles');
    const $active = document.getElementById('kpiActiveTrips');
    const $halted = document.getElementById('kpiHaltedCount');
    const $completed = document.getElementById('kpiCompletedToday');
    const $dTotal = document.getElementById('kpiTotalDrivers');
    const $dist = document.getElementById('kpiFleetDistance');

    if ($total) $total.textContent = total;
    if ($active) $active.textContent = activeTrips;
    if ($halted) $halted.textContent = haltedCount;
    if ($completed) $completed.textContent = completedToday;
    if ($dTotal) $dTotal.textContent = totalDrivers;
    if ($dist) $dist.textContent = totalDist.toFixed(1);

    // Tab counts
    const $cAll = document.getElementById('countAll');
    const $cMov = document.getElementById('countMoving');
    const $cHalt = document.getElementById('countHalt') || document.getElementById('countIdle');
    const $cOff = document.getElementById('countOffline');

    if ($cAll) $cAll.textContent = total;
    if ($cMov) $cMov.textContent = moving;
    if ($cHalt) $cHalt.textContent = halt;
    if ($cOff) $cOff.textContent = offline;
}

/**
 * Render Left Sidebar Vehicle List
 */
function renderLiveFleetList() {
    const $container = document.getElementById('liveVehicleList');
    if (!$container) return;

    const list = Object.values(vehicles);
    let html = '';

    list.forEach(v => {
        try {
            const cat = getVehicleStatusCategory(v);
            if (currentFleetFilter !== 'all' && cat !== currentFleetFilter && !(currentFleetFilter === 'halt' && cat === 'idle')) {
                return;
            }

            const driver = getDriverForVehicle(v.id);
            const driverName = driver ? driver.name : 'Unassigned';
            const isSelected = (v.id === selectedVehicleId);

            let pillText = '● Moving';
            if (cat === 'halt' || cat === 'idle') pillText = '● Halt';
            else if (cat === 'offline') pillText = '● Offline';

            let subText = '';
            if (cat === 'moving') {
                subText = `${v.speed} km/h · ${v.lastSeen || '8 s ago'}`;
            } else if (cat === 'halt' || cat === 'idle') {
                subText = v.lastSeen || 'Halted · 2 min ago';
            } else {
                subText = v.lastSeen || 'No signal · last seen 42 min ago';
            }

            html += `
                <div class="live-vehicle-item ${isSelected ? 'selected' : ''}" onclick="selectVehicleOnLiveMap('${v.id}')">
                    <div class="item-left">
                        <span class="item-plate">${escHtml(v.plate)}</span>
                        <span class="item-driver">${escHtml(driverName)}</span>
                        <span class="item-sub">${escHtml(subText)}</span>
                    </div>
                    <span class="item-pill ${cat}">${pillText}</span>
                </div>
            `;
        } catch (itemErr) {
            console.error('[Admin] Error rendering vehicle item:', v, itemErr);
        }
    });

    if (html === '') {
        const filterName = currentFleetFilter === 'halt' ? 'Halt' : currentFleetFilter;
        html = `<div style="padding:24px; text-align:center; color:#94a3b8; font-size:12px;">No vehicles in "${filterName}" status.</div>`;
    }

    $container.innerHTML = html;
}

/**
 * Update Leaflet Map Markers for all vehicles
 */
function updateFleetMapMarkers() {
    if (!fleetMap || typeof L === 'undefined') return;

    Object.values(vehicles).forEach(v => {
        const cat = getVehicleStatusCategory(v);
        const isSelected = (v.id === selectedVehicleId);
        const lat = v.lat || 13.0827;
        const lng = v.lng || 80.2707;

        // Custom divIcon with pin pointer and high-contrast status dot
        const iconHtml = `
            <div class="custom-map-pin">
                <div class="map-pin-icon-circle ${cat} ${isSelected ? 'selected' : ''}">
                    <span>🚚</span>
                </div>
                <div class="map-pin-pointer"></div>
                <div class="map-pin-label">
                    <span class="pin-status-dot ${cat}"></span>
                    <span>${escHtml(v.plate)}</span>
                </div>
            </div>
        `;

        const customIcon = L.divIcon({
            html: iconHtml,
            className: 'truck-pin-wrapper',
            iconSize: [96, 64],
            iconAnchor: [48, 44],
            popupAnchor: [0, -44]
        });

        const zIndexVal = isSelected ? 3000 : 1500;

        if (fleetMarkers[v.id]) {
            fleetMarkers[v.id].setLatLng([lat, lng]);
            fleetMarkers[v.id].setIcon(customIcon);
            if (fleetMarkers[v.id].setZIndexOffset) {
                fleetMarkers[v.id].setZIndexOffset(zIndexVal);
            }
        } else {
            const marker = L.marker([lat, lng], {
                icon: customIcon,
                zIndexOffset: zIndexVal
            }).addTo(fleetMap);

            marker.on('click', () => {
                selectVehicleOnLiveMap(v.id);
            });
            fleetMarkers[v.id] = marker;
        }
    });

    // Remove obsolete markers
    Object.keys(fleetMarkers).forEach(vid => {
        if (!vehicles[vid]) {
            fleetMap.removeLayer(fleetMarkers[vid]);
            delete fleetMarkers[vid];
        }
    });
}

/**
 * Ensure vehicle markers always float cleanly on top of route polylines
 */
function updateFleetMarkerZIndex() {
    Object.keys(fleetMarkers).forEach(vid => {
        const marker = fleetMarkers[vid];
        if (marker && marker.setZIndexOffset) {
            marker.setZIndexOffset(vid === selectedVehicleId ? 3000 : 1500);
        }
    });
}

/**
 * Draw all fleet routes on the live map simultaneously.
 * The currently selected vehicle's route is highlighted with a bold solid Royal Blue stroke (#1d4ed8),
 * while all other fleet routes are rendered as crisp high-contrast dashed lines (#0284c7).
 * Each route features an underlay white casing line so routes never blend into background roads.
 * Each route also features an origin checkpoint dot showing dispatch origin.
 */
function drawAllVehicleRoutes() {
    if (!fleetMap || typeof L === 'undefined') return;

    // Remove existing route layers
    Object.keys(fleetRouteLayers).forEach(vid => {
        if (fleetRouteLayers[vid]) {
            fleetMap.removeLayer(fleetRouteLayers[vid]);
        }
    });
    for (let key in fleetRouteLayers) delete fleetRouteLayers[key];

    // Remove existing white casings
    Object.keys(fleetRouteCasings).forEach(vid => {
        if (fleetRouteCasings[vid]) {
            fleetMap.removeLayer(fleetRouteCasings[vid]);
        }
    });
    for (let key in fleetRouteCasings) delete fleetRouteCasings[key];

    // Remove existing origin checkpoint dots
    Object.keys(fleetOriginMarkers).forEach(vid => {
        if (fleetOriginMarkers[vid]) {
            fleetMap.removeLayer(fleetOriginMarkers[vid]);
        }
    });
    for (let key in fleetOriginMarkers) delete fleetOriginMarkers[key];

    if (!showRouteOnMap) return;

    // Sort to render non-selected first, selected last on top
    const vIds = Object.keys(vehicles);
    const sortedIds = vIds.sort((a, b) => (a === selectedVehicleId ? 1 : -1));

    sortedIds.forEach(vid => {
        const v = vehicles[vid];
        if (!v || !v.route || v.route.length < 2) return;

        const isSelected = (v.id === selectedVehicleId);
        // In focus mode, only show the selected vehicle's route for an ultra-clean uncluttered look
        if (routeDisplayMode === 'focus' && !isSelected) return;

        const routeColor = isSelected ? '#1d4ed8' : '#0284c7';
        const routeWeight = isSelected ? 5.5 : 3.5;
        const routeOpacity = isSelected ? 1.0 : 0.85;

        // 1. Underlay casing line (pure white halo) so polyline never blends into roads
        const casing = L.polyline(v.route, {
            color: '#ffffff',
            weight: isSelected ? 9 : 6.5,
            opacity: 0.95,
            lineCap: 'round',
            lineJoin: 'round'
        }).addTo(fleetMap);

        fleetRouteCasings[v.id] = casing;

        // 2. Main polyline
        const polyline = L.polyline(v.route, {
            color: routeColor,
            weight: routeWeight,
            opacity: routeOpacity,
            dashArray: isSelected ? null : '7, 9',
            lineCap: 'round',
            lineJoin: 'round'
        }).addTo(fleetMap);

        const driver = getDriverForVehicle(v.id);
        const driverName = driver ? driver.name : 'Unassigned';
        polyline.bindTooltip(`<b>${escHtml(v.plate)}</b> · ${escHtml(driverName)} · ${escHtml(v.model)}`, {
            sticky: true,
            direction: 'top',
            offset: [0, -10]
        });

        polyline.on('click', (e) => {
            if (L.DomEvent) L.DomEvent.stopPropagation(e);
            selectVehicleOnLiveMap(v.id);
        });

        fleetRouteLayers[v.id] = polyline;

        // Origin checkpoint dot marker
        const originCoord = v.route[0];
        if (originCoord && originCoord.length >= 2) {
            const originDot = L.circleMarker(originCoord, {
                radius: isSelected ? 5.5 : 4,
                color: routeColor,
                fillColor: '#ffffff',
                fillOpacity: 1.0,
                weight: 2.5
            }).addTo(fleetMap);

            originDot.bindTooltip(`📍 Origin: ${escHtml(v.plate)} dispatch point`, {
                direction: 'top',
                offset: [0, -6]
            });

            originDot.on('click', (e) => {
                if (L.DomEvent) L.DomEvent.stopPropagation(e);
                selectVehicleOnLiveMap(v.id);
            });

            fleetOriginMarkers[v.id] = originDot;
        }
    });

    // Bring selected vehicle's casing and route layer to front so it is crisp on top
    if (selectedVehicleId) {
        if (fleetRouteCasings[selectedVehicleId]) fleetRouteCasings[selectedVehicleId].bringToFront();
        if (fleetRouteLayers[selectedVehicleId]) fleetRouteLayers[selectedVehicleId].bringToFront();
    }

    // Ensure truck markers always float above route polylines
    updateFleetMarkerZIndex();
}

/**
 * Backward compatibility alias for drawAllVehicleRoutes
 * @param {string} vid
 */
function drawVehicleRoute(vid) {
    drawAllVehicleRoutes();
}

/**
 * Select a vehicle on the live map, pan to it, draw route, and update right panel
 * @param {string} vid
 */
window.selectVehicleOnLiveMap = function(vid) {
    selectedVehicleId = vid;
    const v = vehicles[vid];
    if (!v) return;

    // Show panel if it was closed
    const $panel = document.getElementById('liveVehicleDetailPanel');
    if ($panel) $panel.style.display = 'flex';

    // Update list selection highlight
    renderLiveFleetList();

    // Update marker halo
    updateFleetMapMarkers();

    // Pan map to vehicle
    if (fleetMap && v.lat && v.lng) {
        fleetMap.panTo([v.lat, v.lng], { animate: true, duration: 0.5 });
    }

    // Redraw all routes (selected route highlighted as solid, others dashed)
    drawAllVehicleRoutes();

    // Render details
    renderSelectedVehicleDetail();
};

/**
 * Render Right Side Vehicle Detail Panel
 */
function renderSelectedVehicleDetail() {
    if (!selectedVehicleId || !vehicles[selectedVehicleId]) return;

    const v = vehicles[selectedVehicleId];
    const driver = getDriverForVehicle(v.id);
    const cat = getVehicleStatusCategory(v);
    const activeTrip = getActiveTripForVehicle(v.id);
    const lastTrip = getLastCompletedTripForVehicle(v.id);

    // Plate & status
    const $plate = document.getElementById('detailPlate');
    const $pill = document.getElementById('detailStatusPill');
    const $model = document.getElementById('detailModel');
    const $sourceBadge = document.getElementById('detailSourceBadge');

    if ($plate) $plate.textContent = v.plate;
    if ($pill) {
        $pill.className = `detail-status-pill ${cat}`;
        $pill.textContent = cat === 'moving' ? '● Moving' : ((cat === 'halt' || cat === 'idle') ? '● Halt' : '● Offline');
    }
    if ($model) $model.textContent = `${v.model} · ${v.type}`;
    if ($sourceBadge) {
        $sourceBadge.className = `source-badge ${v.source}`;
        $sourceBadge.innerHTML = v.source === 'sim' ? '📶 Telecom SIM LBS' : '📱 Driver App GPS';
    }

    // Driver Card
    const $avatar = document.getElementById('detailDriverAvatar');
    const $dName = document.getElementById('detailDriverName');
    const $dStatus = document.getElementById('detailDriverStatus');
    const $dCall = document.getElementById('detailDriverCall');
    const $pType = document.getElementById('detailPhoneType');
    const $dPhone = document.getElementById('detailDriverPhone');

    const dName = driver ? driver.name : 'Unassigned';
    const initials = dName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || 'TR';

    if ($avatar) $avatar.textContent = initials;
    if ($dName) $dName.textContent = dName;
    if ($pType) $pType.textContent = driver ? phoneTypeDisplay(driver.phoneType) : 'Unassigned';
    if ($dPhone) $dPhone.textContent = driver ? `${driver.phone}` : 'No phone linked';
    if ($dStatus) {
        const onDuty = driver ? driver.onDutySince || '05:40' : '05:40';
        if (cat === 'moving') {
            $dStatus.textContent = `On duty since ${onDuty} · Moving ${v.speed} km/h`;
        } else if (cat === 'halt' || cat === 'idle') {
            $dStatus.textContent = `On duty since ${onDuty} · Halted / Stopped`;
        } else {
            $dStatus.textContent = `On duty since ${onDuty} · phone offline`;
        }
    }
    if ($dCall) {
        $dCall.href = `tel:${driver ? driver.phone : ''}`;
    }

    // Live Trip & Operational Halt Status Card
    const $tripCard = document.getElementById('detailTripCard');
    if ($tripCard) {
        let tripHtml = '';
        if (v.status === 'driving' && activeTrip) {
            const haltSec = (activeTrip && activeTrip.haltSeconds) || v.haltSeconds || 0;
            const haltDisplay = formatHaltDuration(haltSec);
            const haltReasonDisplay = (activeTrip && activeTrip.haltReason) || v.haltReason || '';
            const runDur = runningDuration(activeTrip.startTime);
            const dest = activeTrip.destination || (driver && driver.destination) || 'Sriperumbudur Logistics Hub';
            const fromLoc = activeTrip.startLocation || 'Krishnagiri Toll Plaza';
            tripHtml = `
                <div class="trip-status-header">
                    <span class="trip-badge active">🟢 Active Trip</span>
                    <span class="trip-duration-live">⏱️ ${runDur}</span>
                </div>
                <div class="trip-info-row">
                    <span class="t-label">Destination:</span>
                    <span class="t-val highlight">${escHtml(dest)}</span>
                </div>
                <div class="trip-info-row">
                    <span class="t-label">From:</span>
                    <span class="t-val">${escHtml(fromLoc)} (${fmtTime(activeTrip.startTime)})</span>
                </div>
                <div class="trip-info-row">
                    <span class="t-label">Trip Halt:</span>
                    <span class="t-val" style="color:${haltSec > 0 ? '#d97706' : '#16a34a'}; font-weight:600;">
                        ${haltDisplay} ${haltReasonDisplay ? `(${escHtml(haltReasonDisplay)})` : ''}
                    </span>
                </div>
            `;
        } else if (v.status === 'halted' || (v.status === 'driving' && v.speed === 0)) {
            const haltSec = (activeTrip && activeTrip.haltSeconds) || v.haltSeconds || 120;
            const dest = (driver && driver.destination) || 'Madhavaram Freight Hub';
            tripHtml = `
                <div class="trip-status-header">
                    <span class="trip-badge halt">⏸️ Halted (Speed 0)</span>
                    <span class="trip-duration-live" style="color:#d97706;">Stopped</span>
                </div>
                <div class="trip-info-row">
                    <span class="t-label">Halt Duration:</span>
                    <span class="t-val" style="color:#d97706; font-weight:700;">${formatHaltDuration(haltSec)} (Tea Break)</span>
                </div>
                <div class="trip-info-row">
                    <span class="t-label">Destination:</span>
                    <span class="t-val">${escHtml(dest)}</span>
                </div>
            `;
        } else if (lastTrip) {
            const haltSec = lastTrip.haltSeconds || 0;
            tripHtml = `
                <div class="trip-status-header">
                    <span class="trip-badge completed">🏁 Last Trip Completed</span>
                    <span class="trip-duration-live">Ended ${fmtTime(lastTrip.endTime)}</span>
                </div>
                <div class="trip-info-row">
                    <span class="t-label">At:</span>
                    <span class="t-val">${escHtml(lastTrip.endLocation || 'Chengalpattu')}</span>
                </div>
                <div class="trip-info-row">
                    <span class="t-label">Trip Halt:</span>
                    <span class="t-val">${formatHaltDuration(haltSec)}</span>
                </div>
            `;
        } else {
            tripHtml = `
                <div class="trip-status-header">
                    <span class="trip-badge available">⚪ Available / No Active Trip</span>
                </div>
                <div class="trip-info-row">
                    <span class="t-label">Status:</span>
                    <span class="t-val" style="color:#64748b;">Ready for dispatch</span>
                </div>
            `;
        }
        $tripCard.innerHTML = tripHtml;
    }

    // 2x2 stats grid
    const $speed = document.getElementById('detailSpeed');
    const $lastUp = document.getElementById('detailLastUpdate');
    const $batt = document.getElementById('detailBattery');
    const $acc = document.getElementById('detailAccuracy');

    if ($speed) $speed.textContent = (cat === 'moving') ? `${v.speed} km/h` : '—';
    if ($lastUp) $lastUp.textContent = v.lastSeen || (cat === 'offline' ? '42 min ago' : '8 s ago');
    if ($batt) $batt.textContent = `${v.battery || 85}%`;
    if ($acc) $acc.textContent = `${v.accuracy || 15} m`;

    // Distance covered with timeframe
    const $dist = document.getElementById('detailDistance');
    const $distSub = document.getElementById('detailDistanceSub');
    if ($dist) {
        let d = v.distanceToday || 187.3;
        if (currentSelectedTimeframe === 'week') d = +(d * 4.8).toFixed(1);
        else if (currentSelectedTimeframe === 'month') d = +(d * 19.5).toFixed(1);
        $dist.textContent = d;
    }
    if ($distSub) {
        const onDuty = driver ? driver.onDutySince || '05:40' : '05:40';
        $distSub.textContent = `Today · since ${onDuty}`;
    }

    // Last known location
    const $loc = document.getElementById('detailLocation');
    if ($loc) $loc.textContent = v.currentLocation || 'NH 16, Minjur / Ponneri Junction';

    // Freight Corridor & Route Progress Card
    const vehicleCorridorMap = {
        v1: { name: 'NH 48 Chennai-Bengaluru Highway', checkpoint: 'Sriperumbudur Toll Plaza', pct: 78 },
        v2: { name: 'NH 32 GST Road Expressway', checkpoint: 'Chengalpattu Toll Plaza', pct: 62 },
        v3: { name: 'NH 48 Kanchipuram Freight Bypass', checkpoint: 'Kanchipuram Toll Gate', pct: 85 },
        v4: { name: 'Madhavaram Freight Hub Bypass', checkpoint: 'Madhavaram Ring Gate', pct: 45 },
        v5: { name: 'NH 16 Chennai-Ponneri Freight Corridor', checkpoint: 'Minjur Toll Plaza', pct: 68 },
        v6: { name: 'Chennai Port Harbor Corridor', checkpoint: 'Port Gate 2 Terminal', pct: 54 }
    };
    const corridor = vehicleCorridorMap[v.id] || {
        name: v.currentLocation || 'State Freight Corridor',
        checkpoint: 'Logistics Checkpoint Hub',
        pct: 50
    };
    const $cTitle = document.getElementById('detailCorridorTitle');
    const $cPct = document.getElementById('detailCorridorPct');
    const $cFill = document.getElementById('detailCorridorFill');
    const $cCheck = document.getElementById('detailCheckpoint');
    if ($cTitle) $cTitle.textContent = corridor.name;
    if ($cPct) $cPct.textContent = `${corridor.pct}%`;
    if ($cFill) $cFill.style.width = `${corridor.pct}%`;
    if ($cCheck) $cCheck.textContent = corridor.checkpoint;

    // Fleet Telematics Diagnostics Card
    const $sig = document.getElementById('detailSignalText');
    const $bFill = document.getElementById('detailBatteryFill');
    const $bPct = document.getElementById('detailBatteryPctText');
    const $ign = document.getElementById('detailIgnitionText');

    if ($sig) {
        if (v.status === 'offline') {
            $sig.textContent = 'No Signal (Offline · 42m)';
            $sig.style.color = '#ef4444';
        } else if (v.status === 'stopped') {
            $sig.textContent = 'Standby (Cell Tower Linked)';
            $sig.style.color = '#64748b';
        } else if (v.source === 'sim') {
            $sig.textContent = 'BSNL SIM Tower LBS (Cell #4819)';
            $sig.style.color = '#2563eb';
        } else if (cat === 'moving') {
            $sig.textContent = 'Strong (4G LTE · -74 dBm)';
            $sig.style.color = '#16a34a';
        } else {
            $sig.textContent = 'Good (4G LTE · -82 dBm)';
            $sig.style.color = '#d97706';
        }
    }

    const batt = v.battery || 85;
    if ($bPct) $bPct.textContent = `${batt}%`;
    if ($bFill) {
        $bFill.style.width = `${batt}%`;
        if (batt < 20) {
            $bFill.style.background = '#ef4444';
        } else if (batt < 50) {
            $bFill.style.background = '#f59e0b';
        } else {
            $bFill.style.background = '#10b981';
        }
    }

    if ($ign) {
        if (cat === 'moving') {
            $ign.innerHTML = '<span style="color:#16a34a; font-weight:700;">🟢 Engine ON (Driving)</span>';
        } else if (cat === 'halt' || cat === 'idle') {
            $ign.innerHTML = '<span style="color:#d97706; font-weight:700;">🟡 Idling / Parked</span>';
        } else if (v.status === 'stopped') {
            $ign.innerHTML = '<span style="color:#64748b; font-weight:700;">⚪ Engine OFF (Trip Ended)</span>';
        } else {
            $ign.innerHTML = '<span style="color:#64748b; font-weight:700;">⚪ Engine OFF</span>';
        }
    }

    // SIM Dispatch & Trip Actions Box
    const $actionsBox = document.getElementById('detailActionsBox');
    if ($actionsBox) {
        if (v.source === 'sim') {
            if (v.status !== 'driving') {
                $actionsBox.innerHTML = `
                    <button class="btn btn-sm btn-primary" style="width:100%; justify-content:center; padding:7px 10px; font-weight:600;" onclick="adminStartSimTrip('${v.id}')">
                        ▶️ Admin: Start SIM Trip
                    </button>
                `;
            } else {
                $actionsBox.innerHTML = `
                    <div style="display:flex; gap:6px;">
                        <button class="btn btn-sm btn-danger" style="flex:1; justify-content:center; padding:7px 10px; font-weight:600;" onclick="adminEndSimTrip('${v.id}')">
                            🛑 Admin: End Trip
                        </button>
                        <button class="btn btn-sm btn-outline" style="padding:7px 10px; font-weight:600;" onclick="adminPingSim('${v.id}')">
                            📡 Ping Tower
                        </button>
                    </div>
                `;
            }
        } else {
            $actionsBox.innerHTML = `
                <div class="app-control-notice">
                    🔒 Driver controls trip via Smartphone Mobile App
                </div>
            `;
        }
    }

    // Route checkbox
    const $chk = document.getElementById('toggleRouteCheckbox');
    if ($chk) $chk.checked = showRouteOnMap;
}

/**
 * Filter live fleet by status: 'all' | 'moving' | 'halt' | 'offline'
 * @param {string} fType
 */
window.filterLiveFleet = function(fType) {
    currentFleetFilter = (fType === 'idle') ? 'halt' : fType;
    document.querySelectorAll('.live-filter-btn').forEach(btn => {
        const bFilter = btn.dataset.filter;
        if (bFilter === fType || (currentFleetFilter === 'halt' && (bFilter === 'halt' || bFilter === 'idle'))) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
    renderLiveFleetList();
};

/**
 * Fit map to show all 6 vehicles and all routes simultaneously with comfortable padding
 */
window.showAllVehiclesOnMap = function() {
    if (!fleetMap) return;
    fitMapToAllVehicles(true);
    drawAllVehicleRoutes();
};

/**
 * Close right vehicle detail panel
 */
window.closeVehicleDetailPanel = function() {
    const $panel = document.getElementById('liveVehicleDetailPanel');
    if ($panel) $panel.style.display = 'none';
};

/**
 * Set timeframe toggle in distance covered card
 * @param {string} tf - 'today' | 'week' | 'month'
 */
window.setTimeframe = function(tf) {
    currentSelectedTimeframe = tf;
    document.querySelectorAll('.timeframe-btn').forEach(btn => {
        if (btn.dataset.timeframe === tf) btn.classList.add('active');
        else btn.classList.remove('active');
    });
    renderSelectedVehicleDetail();
};

/**
 * Toggle route polyline visibility on map
 * @param {boolean} show
 */
window.toggleVehicleRoute = function(show) {
    showRouteOnMap = show;
    if (selectedVehicleId) {
        drawVehicleRoute(selectedVehicleId);
    }
};

/**
 * Open Change Driver modal for currently selected vehicle
 */
window.openChangeDriverForSelected = function() {
    if (selectedVehicleId) {
        openEditVehicleModal(selectedVehicleId);
    }
};

/**
 * Switch to Map tab, select vehicle, center map, and open details
 * @param {string} vid - Vehicle ID
 */
window.trackVehicleOnMap = function(vid) {
    const dashTab = document.querySelector('.sidebar-tab[data-tab="dashboard"]');
    if (dashTab) {
        dashTab.click();
    }
    setTimeout(() => {
        selectVehicleOnLiveMap(vid);
    }, 250);
};

// ── Initialization ─────────────────────────────────────────

/**
 * Initialize the admin dashboard.
 */
function init() {
    try {
        loadStateFromStorage();
    } catch (e) {
        console.warn('[Admin] loadStateFromStorage error:', e);
    }

    try {
        if (typeof closeEditVehicleModal === 'function') closeEditVehicleModal();
        if (typeof closeEditDriverModal === 'function') closeEditDriverModal();
    } catch (e) {
        console.warn('[Admin] close modals error:', e);
    }

    try {
        updateClock();
    } catch (e) {
        console.warn('[Admin] updateClock error:', e);
    }

    try {
        refreshAll();
    } catch (e) {
        console.warn('[Admin] refreshAll error:', e);
    }

    try {
        initOrRefreshFleetMap();
    } catch (e) {
        console.warn('[Admin] initOrRefreshFleetMap error:', e);
    }

    // Ensure Leaflet map tile layout recalculates on window events
    if (typeof window !== 'undefined') {
        window.addEventListener('load', () => {
            if (fleetMap) fleetMap.invalidateSize();
        });
        window.addEventListener('resize', () => {
            if (fleetMap) fleetMap.invalidateSize();
        });
    }

    // Start the 2-second ticker
    setInterval(tick, 2000);

    console.log('[Admin] Dashboard initialized successfully.');
    console.log(`[Admin] ${Object.keys(vehicles).length} vehicles, ${Object.keys(drivers).length} drivers, ${trips.length} trips loaded.`);
}

// Run on DOM ready
init();
