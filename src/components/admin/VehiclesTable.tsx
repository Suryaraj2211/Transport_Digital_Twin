import React, { useState } from 'react';
import { useFleet } from '../../context/FleetContext';
import { Vehicle, VehicleType, TrackingSource } from '../../types/fleet';

export const VehiclesTable: React.FC = () => {
  const { vehicles, drivers, addVehicle, editVehicle, deleteVehicle, addToast } = useFleet();

  const [showAddForm, setShowAddForm] = useState<boolean>(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);

  // Add form fields
  const [vPlate, setVPlate] = useState<string>('');
  const [vModel, setVModel] = useState<string>('');
  const [vType, setVType] = useState<VehicleType>('Truck 28T');
  const [vTracking, setVTracking] = useState<TrackingSource>('app');
  const [vSimPhone, setVSimPhone] = useState<string>('');
  const [vAssignedDriver, setVAssignedDriver] = useState<string>('');

  // Edit modal fields
  const [editPlate, setEditPlate] = useState<string>('');
  const [editModel, setEditModel] = useState<string>('');
  const [editType, setEditType] = useState<VehicleType>('Truck 28T');
  const [editTracking, setEditTracking] = useState<TrackingSource>('app');
  const [editSimPhone, setEditSimPhone] = useState<string>('');
  const [editDriverId, setEditDriverId] = useState<string>('');

  const handleOpenAddForm = () => {
    setVPlate('');
    setVModel('');
    setVType('Truck 28T');
    setVTracking('app');
    setVSimPhone('');
    setVAssignedDriver('');
    setShowAddForm(true);
  };

  const handleSaveAddVehicle = () => {
    if (!vPlate.trim()) {
      alert('Please enter a Registration Plate (e.g., TN 09 AB 1234)');
      return;
    }
    addVehicle({
      plate: vPlate,
      model: vModel || 'Heavy Hauler',
      type: vType,
      source: vTracking,
      driverId: vAssignedDriver,
      simPhone: vSimPhone.trim(),
    });
    setShowAddForm(false);
  };

  const handleQuickAssignDriver = (vehicleId: string, newDriverId: string) => {
    editVehicle(vehicleId, { driverId: newDriverId });
    const driver = drivers[newDriverId];
    if (driver) {
      addToast(`🚛 Truck successfully assigned to ${driver.name}!`, 'success');
    } else {
      addToast('Driver unassigned from truck.', 'info');
    }
  };

  const handleOpenEdit = (v: Vehicle) => {
    setEditingVehicle(v);
    setEditPlate(v.plate);
    setEditModel(v.model);
    setEditType(v.type);
    setEditTracking(v.source);
    setEditSimPhone(v.simPhone || '');
    setEditDriverId(v.driverId || '');
  };

  const handleSaveEdit = () => {
    if (!editingVehicle) return;
    editVehicle(editingVehicle.id, {
      plate: editPlate,
      model: editModel,
      type: editType,
      source: editTracking,
      simPhone: editSimPhone.trim(),
      driverId: editDriverId,
    });
    setEditingVehicle(null);
  };

  const vehicleList = Object.values(vehicles);
  const driverList = Object.values(drivers);

  return (
    <section className="tab-panel active" id="panel-vehicles">
      <div className="panel-header-row">
        <h2 className="panel-title">Vehicles</h2>
        <button className="btn btn-primary" id="btnAddVehicle" type="button" onClick={handleOpenAddForm}>
          + Add Vehicle
        </button>
      </div>

      {/* Add Vehicle Inline Form */}
      {showAddForm && (
        <div className="inline-form" id="formAddVehicle">
          <h4 className="form-heading">Add New Vehicle</h4>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="vPlate">Registration Plate</label>
              <input
                type="text"
                id="vPlate"
                placeholder="TN 00 XX 0000"
                value={vPlate}
                onChange={(e) => setVPlate(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label htmlFor="vModel">Model</label>
              <input
                type="text"
                id="vModel"
                placeholder="Tata Prima 4028.S"
                value={vModel}
                onChange={(e) => setVModel(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label htmlFor="vType">Type</label>
              <select id="vType" value={vType} onChange={(e) => setVType(e.target.value as VehicleType)}>
                <option value="Truck 28T">Truck 28T</option>
                <option value="Truck 16T">Truck 16T</option>
                <option value="LCV 7T">LCV 7T</option>
                <option value="LCV 3.5T">LCV 3.5T</option>
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="vTracking">Tracking Method</label>
              <select
                id="vTracking"
                value={vTracking}
                onChange={(e) => setVTracking(e.target.value as TrackingSource)}
              >
                <option value="app">App (Smartphone)</option>
                <option value="sim">SIM LBS (Button Phone)</option>
                <option value="gps">GPS Device</option>
              </select>
            </div>
            {vTracking === 'sim' && (
              <div className="form-group">
                <label htmlFor="vSimPhone">SIM Mobile Number</label>
                <input
                  type="tel"
                  id="vSimPhone"
                  placeholder="+91 9840X XXXXX"
                  value={vSimPhone}
                  onChange={(e) => setVSimPhone(e.target.value)}
                />
              </div>
            )}
            <div className="form-group">
              <label htmlFor="vAssignedDriver">Assign Driver</label>
              <select
                id="vAssignedDriver"
                value={vAssignedDriver}
                onChange={(e) => setVAssignedDriver(e.target.value)}
              >
                <option value="">-- No Driver Assigned --</option>
                {driverList.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name} ({d.phone})
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="form-actions">
            <button className="btn btn-primary" id="btnSaveVehicle" type="button" onClick={handleSaveAddVehicle}>
              Save Vehicle
            </button>
            <button
              className="btn btn-ghost"
              id="btnCancelVehicle"
              type="button"
              onClick={() => setShowAddForm(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Vehicles Table */}
      <div className="table-wrapper">
        <table className="data-table" id="vehiclesTable">
          <thead>
            <tr>
              <th>Registration Plate</th>
              <th>Model</th>
              <th>Type</th>
              <th>Tracking Source</th>
              <th>Assigned Driver</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody id="vehiclesTableBody">
            {vehicleList.map((v) => {
              let sourceDisplay = <span className="source-badge app">📱 Driver App GPS</span>;
              if (v.source === 'gps') {
                sourceDisplay = <span className="source-badge gps">🛰️ GPS Device</span>;
              } else if (v.source === 'sim') {
                const consentDot =
                  v.simConsentStatus === 'approved' ? (
                    <span style={{ color: '#059669', fontWeight: 700 }}>🟢</span>
                  ) : v.simConsentStatus === 'pending' ? (
                    <span style={{ color: '#d97706', fontWeight: 700 }}>🟡</span>
                  ) : (
                    <span style={{ color: '#64748b', fontWeight: 700 }}>⚪</span>
                  );
                sourceDisplay = (
                  <div style={{ display: 'inline-flex', flexDirection: 'column', gap: '2px', alignItems: 'flex-start' }}>
                    <span
                      className="source-badge sim"
                      title={`Consent: ${v.simConsentStatus || 'none'}`}
                    >
                      📶 SIM LBS {consentDot}
                    </span>
                    {v.simPhone && (
                      <span style={{ fontSize: '11px', color: '#64748b', fontFamily: 'monospace' }}>
                        {v.simPhone}
                      </span>
                    )}
                  </div>
                );
              }

              let statusHtml = (
                <span style={{ color: '#ef4444', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                  🔴 Stopped
                </span>
              );

              if (v.status === 'driving') {
                statusHtml = <span className="cell-status-active">🟢 Driving</span>;
              } else if (v.status === 'halted') {
                statusHtml = (
                  <span style={{ color: '#d97706', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    🟠 Halted
                  </span>
                );
              } else if (v.status === 'offline') {
                statusHtml = (
                  <span style={{ color: '#64748b', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    ⚪ Offline
                  </span>
                );
              }

              return (
                <tr key={v.id}>
                  <td className="cell-plate">{v.plate}</td>
                  <td>{v.model}</td>
                  <td>{v.type}</td>
                  <td>{sourceDisplay}</td>
                  <td>
                    {/* 1-Click Interactive Reassign Dropdown */}
                    <select
                      className="table-select"
                      value={v.driverId || ''}
                      onChange={(e) => handleQuickAssignDriver(v.id, e.target.value)}
                    >
                      <option value="">-- Unassigned --</option>
                      {driverList.map((d) => (
                        <option key={d.id} value={d.id}>
                          {d.name} ({d.phoneType === 'smart' ? 'Smartphone' : 'Button Phone'})
                        </option>
                      ))}
                    </select>
                  </td>
                  <td>{statusHtml}</td>
                  <td style={{ whiteSpace: 'nowrap' }}>
                    <button
                      type="button"
                      className="btn btn-sm btn-outline"
                      style={{ padding: '4px 8px', fontSize: '12px', marginRight: '6px' }}
                      onClick={() => handleOpenEdit(v)}
                    >
                      ✏️ Edit
                    </button>
                    <button
                      type="button"
                      className="btn btn-sm btn-ghost"
                      style={{ padding: '4px 8px', fontSize: '12px', color: '#DC2626' }}
                      onClick={() => deleteVehicle(v.id)}
                      title="Delete Vehicle"
                    >
                      🗑️
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Edit Vehicle Modal */}
      {editingVehicle && (
        <div className="modal-overlay" id="modalEditVehicle" style={{ display: 'flex' }}>
          <div className="modal-card">
            <div className="modal-header">
              <h3>✏️ Edit Vehicle Details</h3>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setEditingVehicle(null)}
              >
                &times;
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label htmlFor="editVehiclePlate">Registration Plate</label>
                <input
                  type="text"
                  id="editVehiclePlate"
                  value={editPlate}
                  onChange={(e) => setEditPlate(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label htmlFor="editVehicleModel">Model</label>
                <input
                  type="text"
                  id="editVehicleModel"
                  value={editModel}
                  onChange={(e) => setEditModel(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label htmlFor="editVehicleType">Type</label>
                <select
                  id="editVehicleType"
                  value={editType}
                  onChange={(e) => setEditType(e.target.value as VehicleType)}
                >
                  <option value="Truck 28T">Truck 28T</option>
                  <option value="Truck 16T">Truck 16T</option>
                  <option value="LCV 7T">LCV 7T</option>
                  <option value="LCV 3.5T">LCV 3.5T</option>
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="editVehicleTracking">Tracking Method</label>
                <select
                  id="editVehicleTracking"
                  value={editTracking}
                  onChange={(e) => setEditTracking(e.target.value as TrackingSource)}
                >
                  <option value="app">App (Smartphone)</option>
                  <option value="sim">SIM LBS (Button Phone)</option>
                  <option value="gps">GPS Device</option>
                </select>
              </div>
              {editTracking === 'sim' && (
                <div className="form-group">
                  <label htmlFor="editSimPhone">SIM Mobile Number</label>
                  <input
                    type="tel"
                    id="editSimPhone"
                    placeholder="+91 9840X XXXXX"
                    value={editSimPhone}
                    onChange={(e) => setEditSimPhone(e.target.value)}
                  />
                </div>
              )}
              <div className="form-group">
                <label htmlFor="editVehicleDriver">Assigned Driver</label>
                <select
                  id="editVehicleDriver"
                  value={editDriverId}
                  onChange={(e) => setEditDriverId(e.target.value)}
                >
                  <option value="">-- No Driver Assigned --</option>
                  {driverList.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name} ({d.phone})
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => setEditingVehicle(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleSaveEdit}
              >
                💾 Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
