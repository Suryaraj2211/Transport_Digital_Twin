import React, { useState, useEffect } from 'react';
import { useFleet } from '../../context/FleetContext';

export const DriverPhoneSimDrawer: React.FC = () => {
  const {
    activeSimDrawerVehicleId,
    closeSimDrawer,
    vehicles,
    drivers,
    updateSimConsentStatus,
    pingSimLbs,
  } = useFleet();

  const [replySent, setReplySent] = useState<'YES' | 'NO' | null>(null);
  const [currentTime, setCurrentTime] = useState<string>('');

  useEffect(() => {
    if (activeSimDrawerVehicleId) {
      setReplySent(null);
      setCurrentTime(
        new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      );
    }
  }, [activeSimDrawerVehicleId]);

  if (!activeSimDrawerVehicleId) return null;

  const vehicle = vehicles[activeSimDrawerVehicleId];
  if (!vehicle) return null;

  const driver = drivers[vehicle.driverId];
  const carrier =
    driver && driver.device && driver.device.toLowerCase().includes('jio')
      ? 'Jio 4G'
      : 'Airtel 4G';

  const handleReply = (reply: 'YES' | 'NO') => {
    setReplySent(reply);
    setTimeout(() => {
      if (reply === 'YES') {
        updateSimConsentStatus(vehicle.id, 'approved');
        pingSimLbs(vehicle.id);
      } else {
        updateSimConsentStatus(vehicle.id, 'denied');
      }
      setTimeout(() => {
        closeSimDrawer();
      }, 1200);
    }, 600);
  };

  return (
    <div
      className="driver-phone-sim-drawer"
      id="driverPhoneSimDrawer"
      role="dialog"
      aria-labelledby="phoneSimTitle"
    >
      <div className="sim-drawer-header">
        <div className="sim-drawer-title" id="phoneSimTitle">
          <span className="phone-screen-dot"></span>
          <span>📱 Driver Handset · Feature Phone (Nokia 105)</span>
        </div>
        <button
          type="button"
          className="btn-close-sim-drawer"
          onClick={closeSimDrawer}
          title="Close Phone Simulator"
        >
          ✕
        </button>
      </div>

      <div className="phone-screen-body">
        <div className="phone-status-bar">
          <span id="phoneSimCarrier">📶 {carrier}</span>
          <span id="phoneSimTime">{currentTime || '12:15 PM'}</span>
          <span>🔋 85%</span>
        </div>

        <div className="phone-sms-bubble">
          <div className="sms-sender-row">
            <span className="sms-sender">💬 56161 (DoT Consent Gateway)</span>
            <span className="sms-time">Just now</span>
          </div>
          <div className="sms-body-text" id="phoneSimSmsText">
            "Vanakkam! V3 Logistics requests consent to track mobile {vehicle.simPhone || 'for your SIM'} for vehicle {vehicle.plate}. Reply YES to 56161 to approve."
          </div>
        </div>

        {!replySent ? (
          <div className="phone-actions-prompt" id="phoneSimActionsPrompt">
            <div className="phone-actions-title">Driver Action: Send Reply SMS</div>
            <div className="phone-reply-buttons">
              <button
                type="button"
                className="btn-reply-yes"
                onClick={() => handleReply('YES')}
              >
                🟢 Send Reply "YES" (Approve)
              </button>
              <button
                type="button"
                className="btn-reply-no"
                onClick={() => handleReply('NO')}
              >
                🔴 Send Reply "NO" (Decline)
              </button>
            </div>
          </div>
        ) : (
          <div
            className="phone-reply-sent-note"
            id="phoneSimReplySentNote"
            style={{
              background: replySent === 'YES' ? '#14532d' : '#7f1d1d',
              color: replySent === 'YES' ? '#bbf7d0' : '#fecaca',
            }}
          >
            {replySent === 'YES' ? (
              <>
                ✅ Outgoing SMS: Sent <strong>"YES"</strong> to 56161.
                <br />
                <small style={{ opacity: 0.85 }}>
                  Telecom Consent registered with DoT.
                </small>
              </>
            ) : (
              <>
                🛑 Outgoing SMS: Sent <strong>"NO"</strong> to 56161.
                <br />
                <small style={{ opacity: 0.85 }}>
                  Consent Declined. Triangulation blocked.
                </small>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
