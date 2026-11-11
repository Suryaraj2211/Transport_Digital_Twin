/* ==========================================================
   Admin Dashboard — Bharath Swift Logistics
   Fleet Tracker · admin.js
   ========================================================== */

'use strict';

// ── Seed Data ──────────────────────────────────────────────

/** @type {Object.<string, {id:string, plate:string, model:string, type:string, source:string, driverId:string, status:string, speed:number, currentLocation:string, lat:number, lng:number}>} */
const vehicles = {
    v1: {
        id: 'v1',
        plate: 'TN 09 AB 1234',
        model: 'Tata Prima 4028.S',
        type: 'Truck 28T',
        source: 'app',
        driverId: 'd1',
        status: 'no-trip',    // 'driving' | 'stopped' | 'no-trip'
        speed: 0,
        currentLocation: '',
        lat: 0,
        lng: 0
    },
    v2: {
        id: 'v2',
        plate: 'TN 22 CD 5678',
        model: 'Ashok Leyland 2820',
        type: 'Truck 28T',
        source: 'app',
        driverId: 'd2',
        status: 'no-trip',
        speed: 0,
        currentLocation: '',
        lat: 0,
        lng: 0
    },
    v3: {
        id: 'v3',
        plate: 'TN 38 GH 3456',
        model: 'Mahindra Furio 7',
        type: 'LCV 7T',
        source: 'sim',        // 📶 Telecom SIM LBS (Button Phone)
        driverId: 'd3',
        status: 'no-trip',
        speed: 0,
        currentLocation: 'Ambattur Industrial Hub',
        lat: 13.0878,
        lng: 80.1456
    },
    v4: {
        id: 'v4',
        plate: 'AP 39 JK 7788',
        model: 'BharatBenz 3128',
        type: 'Truck 28T',
        source: 'sim',        // 📶 Telecom SIM LBS (Button Phone)
        driverId: 'd4',
        status: 'no-trip',
        speed: 0,
        currentLocation: 'Chennai Port Container Bay',
        lat: 13.0900,
        lng: 80.2900
    }
};

/** @type {Object.<string, {id:string, name:string, phone:string, phoneType:string, device:string, assignedVehicle:string, licence:string, licenceExpiry:string}>} */
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
        licenceExpiry: '2027-03-15'
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
        licenceExpiry: '2026-08-22'
    },
    d3: {
        id: 'd3',
        name: 'Ravi Kumar',
        phone: '+91 98404 56789',
        phoneType: 'button',
        device: 'Nokia 105 (Keypad Phone · Airtel SIM)',
        assignedVehicle: 'v3',
        destination: 'Krishnagiri Highway Depot',
        licence: 'TN38 20220003456',
        licenceExpiry: '2028-01-10'
    },
    d4: {
        id: 'd4',
        name: 'Venkatesh P',
        phone: '+91 98405 67890',
        phoneType: 'button',
        device: 'Samsung Guru 1200 (Keypad · Jio SIM)',
        assignedVehicle: 'v4',
        destination: 'Chennai Port Container Terminal',
        licence: 'AP39 20210007788',
        licenceExpiry: '2029-06-15'
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

// Trip 1: v1/d1 — Completed
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
    endLocation: 'Sriperumbudur',
    duration: '2h 33m',
    haltSeconds: 900,
    haltReason: 'Food Break',
    avgSpeed: 52,
    distanceKm: 128.4,
    status: 'completed',
    speed: 0
});
vehicles.v1.status = 'stopped';
vehicles.v1.currentLocation = 'Sriperumbudur';
vehicles.v1.haltSeconds = 900;
vehicles.v1.haltReason = 'Food Break';

// Trip 2: v2/d2 — Completed
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
    endLocation: 'Chengalpattu',
    duration: '2h 30m',
    haltSeconds: 480,
    haltReason: 'Toll Plaza',
    avgSpeed: 48,
    distanceKm: 112.6,
    status: 'completed',
    speed: 0
});
vehicles.v2.status = 'stopped';
vehicles.v2.currentLocation = 'Chengalpattu';
vehicles.v2.haltSeconds = 480;
vehicles.v2.haltReason = 'Toll Plaza';

// Trip 3: v3/d3 — Active (still driving)
tripCounter++;
trips.push({
    id: tripCounter,
    vehicleId: 'v3',
    plate: 'TN 38 EF 9012',
    driverId: 'd3',
    driverName: 'Ravi Kumar',
    startTime: todayAt('05:55'),
    startLocation: 'Krishnagiri Toll Plaza',
    endTime: null,
    endLocation: '',
    duration: '',
    haltSeconds: 0,
    haltReason: '',
    avgSpeed: 0,
    distanceKm: 0,
    status: 'active',
    speed: 58
});
vehicles.v3.status = 'driving';
vehicles.v3.speed = 58;
vehicles.v3.currentLocation = 'Krishnagiri';
vehicles.v3.haltSeconds = 0;
vehicles.v3.haltReason = '';

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
    const vehicleKeys = Object.keys(vehicles);
    const driverKeys = Object.keys(drivers);
    const activeTrips = trips.filter(t => t.status === 'active');
    const completedToday = trips.filter(t => {
        if (t.status !== 'completed' || !t.endTime) return false;
        const now = new Date();
        return t.endTime.toDateString() === now.toDateString();
    });
    const haltedCount = Object.values(vehicles).filter(v => v.status === 'driving' && (v.isHalted || v.speed === 0)).length;

    $metricTotalVehicles.textContent = vehicleKeys.length;
    $metricActiveTrips.textContent = activeTrips.length;
    $metricCompletedToday.textContent = completedToday.length;
    $metricTotalDrivers.textContent = driverKeys.length;
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

    $statusCards.innerHTML = html;
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
        localStorage.setItem('fleet_admin_vehicles', JSON.stringify(vehicles));
        localStorage.setItem('fleet_admin_drivers', JSON.stringify(drivers));
        localStorage.setItem('fleet_admin_trips', JSON.stringify(trips));
    } catch (e) {
        console.warn('[Admin] Failed to save state to localStorage:', e);
    }
}

/**
 * Load state from localStorage if available
 */
function loadStateFromStorage() {
    try {
        const vRaw = localStorage.getItem('fleet_admin_vehicles');
        const dRaw = localStorage.getItem('fleet_admin_drivers');
        const tRaw = localStorage.getItem('fleet_admin_trips');
        if (vRaw) {
            const parsed = JSON.parse(vRaw);
            Object.keys(vehicles).forEach(k => delete vehicles[k]);
            Object.assign(vehicles, parsed);
        }
        if (dRaw) {
            const parsed = JSON.parse(dRaw);
            Object.keys(drivers).forEach(k => delete drivers[k]);
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
window.closeEditVehicleModal = function() {
    const modal = document.getElementById('modalEditVehicle');
    if (modal) {
        modal.classList.add('hidden');
        modal.style.display = 'none';
    }
};

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
window.closeEditDriverModal = function() {
    const modal = document.getElementById('modalEditDriver');
    if (modal) {
        modal.classList.add('hidden');
        modal.style.display = 'none';
    }
};

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
    });

    // Check if there are active trips — if so, re-render to update durations
    const hasActiveTrips = trips.some(t => t.status === 'active');
    if (hasActiveTrips) {
        renderStatusCards();
        renderTripsTable();
        refreshMetrics();
    }
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

// ── Initialization ─────────────────────────────────────────

/**
 * Initialize the admin dashboard.
 */
function init() {
    // Load persisted state if exists
    loadStateFromStorage();

    // Ensure both modals are closed on startup
    closeEditVehicleModal();
    closeEditDriverModal();

    // Initial clock update
    updateClock();

    // Initial render
    refreshAll();

    // Start the 2-second ticker
    setInterval(tick, 2000);

    console.log('[Admin] Dashboard initialized.');
    console.log(`[Admin] ${Object.keys(vehicles).length} vehicles, ${Object.keys(drivers).length} drivers, ${trips.length} trips loaded.`);
}

// Run on DOM ready
init();
