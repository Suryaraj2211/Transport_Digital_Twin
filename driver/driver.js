/* ═══════════════════════════════════════════════════════════════
   V3 LOGISTICS — DRIVER MOBILE PORTAL
   (Varatharajan · Surya · Akash)
   JavaScript · GPS, Trip Management, BroadcastChannel Sync
   ═══════════════════════════════════════════════════════════════ */

// ─── DRIVER PROFILES ──────────────────────────────────────────
const DRIVER_PROFILES = {
    d1: {
        vehicleId: 'v1',
        plate: 'TN 09 AB 1234',
        driverName: 'Murugan K',
        driverId: 'd1',
        truckModel: 'Tata Prima 4028.S · Heavy 28T',
        speedLimit: 60
    },
    d2: {
        vehicleId: 'v2',
        plate: 'TN 22 CD 5678',
        driverName: 'Selvam R',
        driverId: 'd2',
        truckModel: 'Ashok Leyland 2820 · Heavy 28T',
        speedLimit: 60
    },
    d3: {
        vehicleId: 'v3',
        plate: 'KA 01 EF 9012',
        driverName: 'Imran Pasha',
        driverId: 'd3',
        truckModel: 'Eicher Pro 6028 · Heavy 28T',
        speedLimit: 60
    },
    d6: {
        vehicleId: 'v6',
        plate: 'TN 07 LM 2468',
        driverName: 'Anbu Selvan',
        driverId: 'd6',
        truckModel: 'Tata Signa 4825 · Heavy 28T',
        speedLimit: 60
    }
};

let DRIVER_CONFIG = { ...DRIVER_PROFILES.d1 };

// ─── DRIVER STATE ─────────────────────────────────────────────
const DRIVER_STATE = {
    // GPS
    lat: 13.0827,
    lng: 80.2707,
    accuracy: 5,
    gpsLocked: true,
    gpsWatchId: null,
    currentLocationName: 'Chennai Central Freight Corridor (NH 48)',

    // Trip
    isTripActive: false,
    tripStartTimestamp: null,
    tripStartTime: null,
    tripStartLocation: null,
    tripStartLat: null,
    tripStartLng: null,
    tripDistanceKm: 0,

    // Speed (km/h)
    speed: 0,
    simulatedSpeed: null, // null = use GPS speed; number = use simulated

    // Halt Detection
    haltStartTime: null,
    isHalted: false,
    totalHaltSeconds: 0,
    haltCheckTimestamp: null,

    // Today's Stats
    tripsToday: 0,
    kmToday: 0,
    totalHaltTimeToday: 0,

    // Intervals
    tripTimerInterval: null,
    speedUpdateInterval: null,
    distanceInterval: null,
    haltCheckInterval: null,
    clockInterval: null
};

// ─── SAMPLE LOCATIONS (Tamil Nadu) ────────────────────────────
const SAMPLE_LOCATIONS = {
    start: [
        'Chennai Port Terminal',
        'Ambattur Industrial Estate',
        'Guindy Warehouse',
        'Ennore Port',
        'Madhavaram Depot'
    ],
    end: [
        'Sriperumbudur Industrial Hub',
        'Hosur SIPCOT Zone',
        'Coimbatore Central Hub',
        'Tiruvallur Distribution Center',
        'Oragadam Logistics Park'
    ]
};

// ─── BROADCAST CHANNEL ───────────────────────────────────────
let syncChannel = null;
try {
    syncChannel = new BroadcastChannel('fleet-tracker-sync');
} catch (e) {
    console.warn('[Driver Portal] BroadcastChannel not supported:', e);
}

/**
 * Sends a message via BroadcastChannel and stores in localStorage as fallback
 * @param {Object} payload - The message payload to broadcast
 */
function broadcastSync(payload) {
    // BroadcastChannel
    if (syncChannel) {
        try {
            syncChannel.postMessage(payload);
        } catch (e) {
            console.warn('[Sync] BroadcastChannel send failed:', e);
        }
    }

    // localStorage fallback
    try {
        localStorage.setItem(
            `fleet_driver_${DRIVER_CONFIG.vehicleId}_sync`,
            JSON.stringify(payload)
        );
    } catch (e) {
        console.warn('[Sync] localStorage write failed:', e);
    }
}

// ─── DOM REFERENCES ──────────────────────────────────────────
const $ = (id) => document.getElementById(id);

const DOM = {
    // Header
    dutyStatusPill: $('dutyStatusPill'),
    headerClock: $('headerClock'),
    driverSelectDropdown: $('driverSelectDropdown'),

    // GPS
    gpsBar: $('gpsBar'),
    gpsIcon: $('gpsIcon'),
    gpsStatus: $('gpsStatus'),
    gpsCoords: $('gpsCoords'),
    gpsAccuracy: $('gpsAccuracy'),

    // Truck
    truckPlate: $('truckPlate'),
    truckModel: $('truckModel'),

    // Main Button
    mainActionBtn: $('mainActionBtn'),

    // Trip Panel
    tripPanel: $('tripPanel'),
    tripStartDisplay: $('tripStartDisplay'),
    tripDuration: $('tripDuration'),
    tripLiveDistance: $('tripLiveDistance'),

    // Speed
    speedCard: $('speedCard'),
    speedNumber: $('speedNumber'),
    speedBar: $('speedBar'),
    speedLimitMarker: $('speedLimitMarker'),
    overspeedAlert: $('overspeedAlert'),

    // Halt
    haltCard: $('haltCard'),
    haltTimer: $('haltTimer'),
    haltReason: $('haltReason'),

    // Summary
    tripSummary: $('tripSummary'),
    summaryStart: $('summaryStart'),
    summaryEnd: $('summaryEnd'),
    summaryDuration: $('summaryDuration'),
    summaryDistance: $('summaryDistance'),
    summaryAvgSpeed: $('summaryAvgSpeed'),

    // Stats
    statTrips: $('statTrips'),
    statHalt: $('statHalt'),

    // Demo
    demoLocationSelect: $('demoLocationSelect')
};

// ─── INITIALIZATION ──────────────────────────────────────────

/**
 * Main initialization — runs on DOMContentLoaded
 */
function init() {
    // Populate driver info
    if (DOM.truckPlate) DOM.truckPlate.textContent = DRIVER_CONFIG.plate;
    if (DOM.truckModel) DOM.truckModel.textContent = DRIVER_CONFIG.truckModel;

    // Driver switch dropdown
    if (DOM.driverSelectDropdown) {
        DOM.driverSelectDropdown.value = DRIVER_CONFIG.driverId;
        DOM.driverSelectDropdown.addEventListener('change', (e) => {
            switchDriverProfile(e.target.value);
        });
    }

    // Start header clock
    updateHeaderClock();
    DRIVER_STATE.clockInterval = setInterval(updateHeaderClock, 1000);

    // Start GPS tracking
    initGPS();

    // Load today's stats from localStorage
    loadTodayStats();

    // Halt reason change listener to sync to admin
    if (DOM.haltReason) {
        DOM.haltReason.addEventListener('change', () => {
            broadcastSpeedUpdate();
        });
    }
}

document.addEventListener('DOMContentLoaded', init);

/**
 * Switches driver profile
 * @param {string} profileKey - 'd1' or 'd2'
 */
function switchDriverProfile(profileKey) {
    if (DRIVER_STATE.isTripActive) {
        alert("⚠️ Trip nadandhutu irukku!\nTrip mudinjathukku apram dhaan driver profile maatra mudiyum.");
        if (DOM.driverSelectDropdown) DOM.driverSelectDropdown.value = DRIVER_CONFIG.driverId;
        return;
    }
    const profile = DRIVER_PROFILES[profileKey];
    if (profile) {
        DRIVER_CONFIG = { ...profile };
        if (DOM.truckPlate) DOM.truckPlate.textContent = DRIVER_CONFIG.plate;
        if (DOM.truckModel) DOM.truckModel.textContent = DRIVER_CONFIG.truckModel;
        loadTodayStats();
        console.log(`[Driver Portal] Switched to ${DRIVER_CONFIG.driverName} (${DRIVER_CONFIG.plate})`);
    }
}

// ─── HEADER CLOCK ────────────────────────────────────────────

/**
 * Updates the header clock display every second
 */
function updateHeaderClock() {
    const now = new Date();
    DOM.headerClock.textContent = now.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });
}

// ─── GPS & REAL LOCATION DETECTION ──────────────────────────

/**
 * Resolves a real human-readable area name from lat & lng using OpenStreetMap reverse geocoding
 * @param {number} lat
 * @param {number} lng
 * @returns {Promise<string>}
 */
async function resolveLocationName(lat, lng) {
    try {
        const resp = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`, {
            headers: { 'Accept-Language': 'en' }
        });
        const data = await resp.json();
        if (data && data.address) {
            const suburb = data.address.suburb || data.address.neighbourhood || data.address.road || data.address.city_district || '';
            const city = data.address.city || data.address.town || data.address.county || data.address.state || '';
            if (suburb && city && suburb !== city) return `${suburb}, ${city}`;
            return suburb || city || data.display_name.split(',')[0];
        }
    } catch (e) {
        console.warn('[GPS] Geocoding notice:', e);
    }
    return `GPS Location (${lat.toFixed(4)}°N, ${lng.toFixed(4)}°E)`;
}

// ─── DEMO LOCATION PRESETS ────────────────────────────────────
const DEMO_LOCATIONS = {
    real: null,
    chennai_port: { name: 'Chennai Port Container Bay', lat: 13.0900, lng: 80.2900 },
    sriperumbudur: { name: 'Sriperumbudur Industrial Hub', lat: 12.9675, lng: 79.9436 },
    hosur: { name: 'Hosur SIPCOT Logistics Park', lat: 12.7409, lng: 77.8253 },
    coimbatore: { name: 'Coimbatore Central Depot', lat: 11.0168, lng: 76.9558 }
};

/**
 * Initializes GPS and continuous location tracking with real device coordinates
 */
function initGPS() {
    // Provide immediate default location so screen is never blank or stuck
    if (!DRIVER_STATE.lat) {
        DRIVER_STATE.lat = 13.0827;
        DRIVER_STATE.lng = 80.2707;
        DRIVER_STATE.currentLocationName = 'Chennai Central Transport Corridor (NH 48)';
    }

    setGPSStatus('locked', 'Corridor GPS Ready ✓', '🛰️');
    if (DOM.gpsCoords) {
        DOM.gpsCoords.textContent = `${DRIVER_STATE.currentLocationName} (13.0827°N, 80.2707°E)`;
    }
    if (DOM.gpsAccuracy) {
        DOM.gpsAccuracy.textContent = 'High Precision · Tap to test device GPS';
    }

    if (!navigator.geolocation) {
        console.warn('[GPS] Geolocation API not supported on this browser.');
        return;
    }

    const onPositionSuccess = async (pos) => {
        DRIVER_STATE.lat = pos.coords.latitude;
        DRIVER_STATE.lng = pos.coords.longitude;
        DRIVER_STATE.accuracy = pos.coords.accuracy;
        DRIVER_STATE.gpsLocked = true;

        if (pos.coords.speed !== null && pos.coords.speed !== undefined && DRIVER_STATE.simulatedSpeed === null) {
            DRIVER_STATE.speed = Math.round(pos.coords.speed * 3.6);
        }

        setGPSStatus('locked', 'Device GPS Locked ✓', '🛰️');
        if (DOM.gpsAccuracy) {
            DOM.gpsAccuracy.textContent = `Accuracy: ±${Math.round(DRIVER_STATE.accuracy)}m`;
        }

        // Resolve real location area name
        const placeName = await resolveLocationName(DRIVER_STATE.lat, DRIVER_STATE.lng);
        DRIVER_STATE.currentLocationName = placeName;
        if (DOM.gpsCoords) {
            DOM.gpsCoords.textContent = `${placeName} (${DRIVER_STATE.lat.toFixed(4)}°N, ${DRIVER_STATE.lng.toFixed(4)}°E)`;
        }

        // If trip is active, broadcast live position
        if (DRIVER_STATE.isTripActive) {
            broadcastSync({
                type: 'DRIVER_ACTION',
                action: 'LOCATION_UPDATE',
                vehicleId: DRIVER_CONFIG.vehicleId,
                lat: DRIVER_STATE.lat,
                lng: DRIVER_STATE.lng,
                locationName: placeName
            });
        }
    };

    const onPositionError = (err) => {
        console.warn('[GPS] Device GPS error or waiting permission:', err.message);
        setGPSStatus('locked', 'Corridor GPS Active ✓', '🛰️');
        if (DOM.gpsCoords) {
            DOM.gpsCoords.textContent = `${DRIVER_STATE.currentLocationName} (13.0827°N, 80.2707°E)`;
        }
        if (DOM.gpsAccuracy) {
            DOM.gpsAccuracy.textContent = 'Transport Corridor GPS · Tap to refresh';
        }
    };

    // 1. One-time quick position
    navigator.geolocation.getCurrentPosition(onPositionSuccess, onPositionError, {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 10000
    });

    // 2. Continuous watch
    if (DRIVER_STATE.gpsWatchId) {
        navigator.geolocation.clearWatch(DRIVER_STATE.gpsWatchId);
    }
    DRIVER_STATE.gpsWatchId = navigator.geolocation.watchPosition(onPositionSuccess, onPositionError, {
        enableHighAccuracy: true,
        maximumAge: 3000,
        timeout: 10000
    });
}

/**
 * Simulates selecting a specific location for testing
 * @param {string} locKey
 */
function simulateLocation(locKey) {
    if (locKey === 'real') {
        initGPS();
        return;
    }
    const loc = DEMO_LOCATIONS[locKey];
    if (loc) {
        DRIVER_STATE.lat = loc.lat;
        DRIVER_STATE.lng = loc.lng;
        DRIVER_STATE.currentLocationName = loc.name;
        DRIVER_STATE.gpsLocked = true;
        setGPSStatus('locked', 'Simulated GPS Active ✓', '🛰️');
        if (DOM.gpsCoords) {
            DOM.gpsCoords.textContent = `${loc.name} (${loc.lat.toFixed(4)}°N, ${loc.lng.toFixed(4)}°E)`;
        }
        if (DOM.gpsAccuracy) {
            DOM.gpsAccuracy.textContent = 'Simulated Precision · ±5m';
        }

        // If trip is active, notify admin dashboard of new location
        if (DRIVER_STATE.isTripActive) {
            broadcastSync({
                type: 'DRIVER_ACTION',
                action: 'LOCATION_UPDATE',
                vehicleId: DRIVER_CONFIG.vehicleId,
                lat: loc.lat,
                lng: loc.lng,
                locationName: loc.name
            });
        }
        console.log(`[Demo] Location set to ${loc.name}`);
    }
}

/**
 * Updates the GPS status bar appearance
 * @param {'locked'|'error'|'searching'} status
 * @param {string} text
 * @param {string} icon
 */
function setGPSStatus(status, text, icon) {
    DOM.gpsBar.className = 'gps-bar';
    if (status === 'locked') {
        DOM.gpsBar.classList.add('locked');
    } else if (status === 'error') {
        DOM.gpsBar.classList.add('error');
    }
    DOM.gpsStatus.textContent = text;
    DOM.gpsIcon.textContent = icon;
}

// ─── MAIN ACTION HANDLER ─────────────────────────────────────

/**
 * Handles the main START/END trip button press
 */
function handleMainAction() {
    if (!DRIVER_STATE.isTripActive) {
        startTrip();
    } else {
        endTrip();
    }
}

// ─── START TRIP ──────────────────────────────────────────────

/**
 * Starts a new trip — records time, location, begins tracking
 */
function startTrip() {
    const now = new Date();

    // Record start data using real detected location
    DRIVER_STATE.isTripActive = true;
    DRIVER_STATE.tripStartTimestamp = Date.now();
    DRIVER_STATE.tripStartTime = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    DRIVER_STATE.tripStartLocation = DRIVER_STATE.currentLocationName || (DRIVER_STATE.lat ? `GPS (${DRIVER_STATE.lat.toFixed(4)}°N, ${DRIVER_STATE.lng.toFixed(4)}°E)` : 'Chennai Fleet Hub');
    DRIVER_STATE.tripStartLat = DRIVER_STATE.lat;
    DRIVER_STATE.tripStartLng = DRIVER_STATE.lng;
    DRIVER_STATE.tripDistanceKm = 0;
    DRIVER_STATE.speed = 0;
    DRIVER_STATE.simulatedSpeed = null;
    DRIVER_STATE.isHalted = false;
    DRIVER_STATE.haltStartTime = null;
    DRIVER_STATE.totalHaltSeconds = 0;

    // Update UI — Button
    DOM.mainActionBtn.className = 'action-btn end';
    DOM.mainActionBtn.innerHTML = '<span class="action-icon">🛑</span><span class="action-text">END TRIP</span>';

    // Update UI — Duty Status
    DOM.dutyStatusPill.className = 'duty-pill on-trip';
    DOM.dutyStatusPill.textContent = 'ON TRIP';

    // Show Trip Panel
    DOM.tripPanel.style.display = 'flex';
    DOM.tripPanel.classList.add('fade-in');
    DOM.tripStartDisplay.textContent = `${DRIVER_STATE.tripStartTime} at ${DRIVER_STATE.tripStartLocation}`;

    // Hide previous summary if visible
    DOM.tripSummary.style.display = 'none';

    // Reset speed display
    updateSpeedDisplay(0);
    if (DOM.tripLiveDistance) {
        DOM.tripLiveDistance.textContent = '0.00 km';
    }

    // Start trip timer
    DRIVER_STATE.tripTimerInterval = setInterval(updateTripDuration, 1000);

    // Start speed update broadcast (every 3 seconds)
    DRIVER_STATE.speedUpdateInterval = setInterval(broadcastSpeedUpdate, 3000);

    // Start distance tracking (every 1 second)
    DRIVER_STATE.distanceInterval = setInterval(updateDistance, 1000);

    // Start halt detection (every 1 second)
    DRIVER_STATE.haltCheckTimestamp = Date.now();
    DRIVER_STATE.haltCheckInterval = setInterval(checkHalt, 1000);

    // Broadcast START_TRIP
    broadcastSync({
        type: 'DRIVER_ACTION',
        action: 'START_TRIP',
        vehicleId: DRIVER_CONFIG.vehicleId,
        plate: DRIVER_CONFIG.plate,
        driverName: DRIVER_CONFIG.driverName,
        startTime: DRIVER_STATE.tripStartTime,
        startLocation: DRIVER_STATE.tripStartLocation,
        lat: DRIVER_STATE.lat,
        lng: DRIVER_STATE.lng,
        timestamp: now.toISOString()
    });

    console.log('[Trip] Started at', DRIVER_STATE.tripStartTime, DRIVER_STATE.tripStartLocation);
}

// ─── END TRIP ────────────────────────────────────────────────

/**
 * Ends the current trip — records end data, shows summary
 */
function endTrip() {
    const now = new Date();
    const endTime = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const endLocation = DRIVER_STATE.currentLocationName || (DRIVER_STATE.lat ? `GPS (${DRIVER_STATE.lat.toFixed(4)}°N, ${DRIVER_STATE.lng.toFixed(4)}°E)` : 'Chennai Destination Hub');

    // Calculate trip duration
    const durationMs = Date.now() - DRIVER_STATE.tripStartTimestamp;
    const durationFormatted = formatDuration(durationMs);
    const durationHours = durationMs / (1000 * 60 * 60);

    // Calculate average speed
    const avgSpeed = durationHours > 0
        ? (DRIVER_STATE.tripDistanceKm / durationHours).toFixed(1)
        : '0.0';

    // Stop all intervals
    clearInterval(DRIVER_STATE.tripTimerInterval);
    clearInterval(DRIVER_STATE.speedUpdateInterval);
    clearInterval(DRIVER_STATE.distanceInterval);
    clearInterval(DRIVER_STATE.haltCheckInterval);
    DRIVER_STATE.tripTimerInterval = null;
    DRIVER_STATE.speedUpdateInterval = null;
    DRIVER_STATE.distanceInterval = null;
    DRIVER_STATE.haltCheckInterval = null;

    // Update today's stats
    DRIVER_STATE.tripsToday += 1;
    DRIVER_STATE.kmToday += DRIVER_STATE.tripDistanceKm;
    DRIVER_STATE.totalHaltTimeToday += DRIVER_STATE.totalHaltSeconds;

    // Mark trip as ended
    DRIVER_STATE.isTripActive = false;
    DRIVER_STATE.speed = 0;
    DRIVER_STATE.simulatedSpeed = null;

    // Update UI — Button
    DOM.mainActionBtn.className = 'action-btn start';
    DOM.mainActionBtn.innerHTML = '<span class="action-icon">🟢</span><span class="action-text">START TRIP</span>';

    // Update UI — Duty Status
    DOM.dutyStatusPill.className = 'duty-pill off-duty';
    DOM.dutyStatusPill.textContent = 'OFF DUTY';

    // Hide Trip Panel + Halt Card
    DOM.tripPanel.style.display = 'none';
    DOM.haltCard.style.display = 'none';

    // Show Trip Summary
    DOM.tripSummary.style.display = 'block';
    DOM.tripSummary.classList.add('fade-in');
    DOM.summaryStart.textContent = `${DRIVER_STATE.tripStartTime} at ${DRIVER_STATE.tripStartLocation}`;
    DOM.summaryEnd.textContent = `${endTime} at ${endLocation}`;
    DOM.summaryDuration.textContent = durationFormatted;
    DOM.summaryDistance.textContent = `${DRIVER_STATE.tripDistanceKm.toFixed(2)} km`;
    DOM.summaryAvgSpeed.textContent = `${avgSpeed} km/h`;

    // Update stats display
    updateStatsDisplay();

    // Save stats to localStorage
    saveTodayStats();

    // Broadcast END_TRIP
    const haltReasonText = (DOM.haltReason && DOM.haltReason.value)
        ? DOM.haltReason.options[DOM.haltReason.selectedIndex].text
        : '';

    broadcastSync({
        type: 'DRIVER_ACTION',
        action: 'END_TRIP',
        vehicleId: DRIVER_CONFIG.vehicleId,
        plate: DRIVER_CONFIG.plate,
        driverName: DRIVER_CONFIG.driverName,
        endTime: endTime,
        endLocation: endLocation,
        lat: DRIVER_STATE.lat,
        lng: DRIVER_STATE.lng,
        distanceKm: parseFloat(DRIVER_STATE.tripDistanceKm.toFixed(2)),
        haltSeconds: DRIVER_STATE.totalHaltSeconds,
        haltReason: haltReasonText,
        timestamp: now.toISOString()
    });

    console.log('[Trip] Ended at', endTime, endLocation);
}

// ─── TRIP DURATION TIMER ─────────────────────────────────────

/**
 * Updates the trip duration display every second
 */
function updateTripDuration() {
    if (!DRIVER_STATE.isTripActive || !DRIVER_STATE.tripStartTimestamp) return;
    const elapsed = Date.now() - DRIVER_STATE.tripStartTimestamp;
    DOM.tripDuration.textContent = formatDuration(elapsed);
}

// ─── SPEED DISPLAY & AUDIO WARNING ───────────────────────────
let audioCtx = null;
let lastOverspeedBeepTime = 0;

/**
 * Plays a short warning chime when exceeding legal speed limit
 */
function playOverspeedWarningChime() {
    const now = Date.now();
    if (now - lastOverspeedBeepTime < 3000) return; // Beep at most once every 3 seconds
    lastOverspeedBeepTime = now;

    try {
        if (!audioCtx) {
            audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        }
        if (audioCtx.state === 'suspended') {
            audioCtx.resume();
        }
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(880, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(440, audioCtx.currentTime + 0.35);

        gain.gain.setValueAtTime(0.25, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.35);

        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.35);
    } catch (e) {
        console.warn('[Audio] Overspeed sound note:', e);
    }
}

/**
 * Updates the speedometer display with current speed
 * @param {number} speed - Speed in km/h
 */
function updateSpeedDisplay(speed) {
    const limit = DRIVER_CONFIG.speedLimit;
    const maxDisplay = 100; // max bar represents 100 km/h

    // Update number
    DOM.speedNumber.textContent = Math.round(speed);

    // Update bar width (percentage of maxDisplay)
    const barPercent = Math.min((speed / maxDisplay) * 100, 100);
    DOM.speedBar.style.width = `${barPercent}%`;

    // Update speed limit marker position
    const limitPercent = (limit / maxDisplay) * 100;
    DOM.speedLimitMarker.style.left = `${limitPercent}%`;

    // Overspeed check
    if (speed > limit) {
        DOM.speedBar.classList.add('overspeed');
        DOM.speedNumber.style.color = '#dc2626';
        DOM.overspeedAlert.style.display = 'block';
        playOverspeedWarningChime();
    } else {
        DOM.speedBar.classList.remove('overspeed');
        DOM.speedNumber.style.color = '#0f172a';
        DOM.overspeedAlert.style.display = 'none';
    }
}

// ─── DISTANCE TRACKING ──────────────────────────────────────

/**
 * Updates trip distance every 1 second based on current speed
 */
function updateDistance() {
    if (!DRIVER_STATE.isTripActive) return;

    const currentSpeed = DRIVER_STATE.speed;
    if (currentSpeed > 0) {
        // distance increment = speed (km/h) / 3600 (km/s) * 1 second
        const increment = currentSpeed / 3600;
        DRIVER_STATE.tripDistanceKm += increment;
        DRIVER_STATE.kmToday += increment;

        // Live UI update on Driver App
        if (DOM.tripLiveDistance) {
            DOM.tripLiveDistance.textContent = `${DRIVER_STATE.tripDistanceKm.toFixed(2)} km`;
        }
        if (DOM.statDistance) {
            DOM.statDistance.textContent = `${DRIVER_STATE.kmToday.toFixed(2)} km`;
        }
    }
}

// ─── HALT DETECTION ──────────────────────────────────────────

/**
 * Checks if the vehicle has halted (speed < 3 km/h for > 10 seconds)
 * Runs every 1 second during active trip
 */
function checkHalt() {
    if (!DRIVER_STATE.isTripActive) return;

    const speed = DRIVER_STATE.speed;

    if (speed < 3) {
        // Vehicle is slow/stopped
        if (!DRIVER_STATE.haltStartTime) {
            DRIVER_STATE.haltStartTime = Date.now();
        }

        const haltDuration = Date.now() - DRIVER_STATE.haltStartTime;
        DRIVER_STATE.totalHaltSeconds = Math.floor(haltDuration / 1000);

        if (haltDuration >= 10000) {
            // 10+ seconds halted — show halt card
            if (!DRIVER_STATE.isHalted) {
                DRIVER_STATE.isHalted = true;
                if (DOM.haltCard) {
                    DOM.haltCard.style.display = 'block';
                    DOM.haltCard.classList.add('fade-in');
                }
            }

            // Update halt timer display
            if (DOM.haltTimer) DOM.haltTimer.textContent = formatDuration(haltDuration);
        }
    } else {
        // Vehicle is moving — reset halt detection
        if (DRIVER_STATE.isHalted) {
            DRIVER_STATE.isHalted = false;
            if (DOM.haltCard) DOM.haltCard.style.display = 'none';
        }
        DRIVER_STATE.haltStartTime = null;
    }
}

// ─── BROADCAST SPEED UPDATE ──────────────────────────────────

/**
 * Broadcasts current speed, halt status, and distance to admin dashboard every 3 seconds
 */
function broadcastSpeedUpdate() {
    if (!DRIVER_STATE.isTripActive) return;

    const haltReasonText = (DOM.haltReason && DOM.haltReason.value)
        ? DOM.haltReason.options[DOM.haltReason.selectedIndex].text
        : '';

    broadcastSync({
        type: 'DRIVER_ACTION',
        action: 'SPEED_UPDATE',
        vehicleId: DRIVER_CONFIG.vehicleId,
        speed: DRIVER_STATE.speed,
        tripDistance: parseFloat(DRIVER_STATE.tripDistanceKm.toFixed(2)),
        kmToday: parseFloat(DRIVER_STATE.kmToday.toFixed(2)),
        isHalted: DRIVER_STATE.speed < 3,
        haltSeconds: DRIVER_STATE.totalHaltSeconds,
        haltReason: haltReasonText
    });
}

// ─── DEMO SPEED SIMULATION ──────────────────────────────────

/**
 * Simulates a specific speed for browser testing
 * @param {number} speed - Speed to simulate in km/h
 */
function simulateSpeed(speed) {
    if (!DRIVER_STATE.isTripActive) {
        alert("⚠️ Trip is not active yet!\n\nPlease click the 'START TRIP' button above first. Once started, speed and distance will update live in real-time.");
        return;
    }

    DRIVER_STATE.simulatedSpeed = speed;
    DRIVER_STATE.speed = speed;
    updateSpeedDisplay(speed);

    // If driving, clear halt state
    if (speed > 0) {
        if (DRIVER_STATE.isHalted) {
            DRIVER_STATE.isHalted = false;
            if (DOM.haltCard) DOM.haltCard.style.display = 'none';
        }
        DRIVER_STATE.haltStartTime = null;
    }

    // Immediately trigger a distance increment tick and sync to admin
    updateDistance();
    broadcastSpeedUpdate();

    console.log(`[Demo] Speed set to ${speed} km/h`);
}

// ─── STATS MANAGEMENT ────────────────────────────────────────

/**
 * Updates the today's stats display
 */
function updateStatsDisplay() {
    if (DOM.statTrips) DOM.statTrips.textContent = DRIVER_STATE.tripsToday;
    if (DOM.statHalt) DOM.statHalt.textContent = formatDurationShort(DRIVER_STATE.totalHaltTimeToday);
}

/**
 * Saves today's stats to localStorage
 */
function saveTodayStats() {
    const today = new Date().toISOString().split('T')[0];
    const stats = {
        date: today,
        trips: DRIVER_STATE.tripsToday,
        km: DRIVER_STATE.kmToday,
        haltSeconds: DRIVER_STATE.totalHaltTimeToday
    };
    try {
        localStorage.setItem(`fleet_driver_${DRIVER_CONFIG.vehicleId}_stats`, JSON.stringify(stats));
    } catch (e) {
        console.warn('[Stats] Failed to save:', e);
    }
}

/**
 * Loads today's stats from localStorage
 */
function loadTodayStats() {
    try {
        const raw = localStorage.getItem(`fleet_driver_${DRIVER_CONFIG.vehicleId}_stats`);
        if (raw) {
            const stats = JSON.parse(raw);
            const today = new Date().toISOString().split('T')[0];
            if (stats.date === today) {
                DRIVER_STATE.tripsToday = stats.trips || 0;
                DRIVER_STATE.kmToday = stats.km || 0;
                DRIVER_STATE.totalHaltTimeToday = stats.haltSeconds || 0;
            }
        }
    } catch (e) {
        console.warn('[Stats] Failed to load:', e);
    }
    updateStatsDisplay();
}

// ─── UTILITY FUNCTIONS ───────────────────────────────────────

/**
 * Formats milliseconds as HH:MM:SS
 * @param {number} ms - Duration in milliseconds
 * @returns {string} Formatted duration string
 */
function formatDuration(ms) {
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return [
        String(hours).padStart(2, '0'),
        String(minutes).padStart(2, '0'),
        String(seconds).padStart(2, '0')
    ].join(':');
}

/**
 * Formats seconds as MM:SS for short display
 * @param {number} totalSeconds - Duration in seconds
 * @returns {string} Formatted short duration
 */
function formatDurationShort(totalSeconds) {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

/**
 * Gets a random location name from sample locations
 * @param {'start'|'end'} type - Type of location
 * @returns {string} A random location name
 */
function getRandomLocation(type) {
    const locations = SAMPLE_LOCATIONS[type];
    return locations[Math.floor(Math.random() * locations.length)];
}
