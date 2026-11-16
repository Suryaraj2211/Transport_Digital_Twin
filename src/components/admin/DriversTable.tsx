import React, { useState } from 'react';
import { useFleet } from '../../context/FleetContext';
import { Driver, PhoneType } from '../../types/fleet';

export const DriversTable: React.FC = () => {
  const { drivers, vehicles, addDriver, editDriver, deleteDriver, editVehicle, addToast } = useFleet();

  const [showAddForm, setShowAddForm] = useState<boolean>(false);
  const [editingDriver, setEditingDriver] = useState<Driver | null>(null);

  // Add form fields
  const [dName, setDName] = useState<string>('');
  const [dPhone, setDPhone] = useState<string>('');
  const [dPhoneType, setDPhoneType] = useState<PhoneType>('smart');
  const [dDevice, setDDevice] = useState<string>('');
  const [dAssignedVehicle, setDAssignedVehicle] = useState<string>('');
  const [dDestination, setDDestination] = useState<string>('Sriperumbudur Logistics Hub');
  const [dLicence, setDLicence] = useState<string>('');
  const [dExpiry, setDExpiry] = useState<string>('2028-12-31');

  // Edit modal fields
  const [editName, setEditName] = useState<string>('');
  const [editPhone, setEditPhone] = useState<string>('');
  const [editPhoneType, setEditPhoneType] = useState<PhoneType>('smart');
  const [editDevice, setEditDevice] = useState<string>('');
  const [editVehicleId, setEditVehicleId] = useState<string>('');
  const [editDestination, setEditDestination] = useState<string>('');
  const [editLicence, setEditLicence] = useState<string>('');
  const [editExpiry, setEditExpiry] = useState<string>('');

  const handleOpenAddForm = () => {
    setDName('');
    setDPhone('');
    setDPhoneType('smart');
    setDDevice('');
    setDAssignedVehicle('');
    setDDestination('Sriperumbudur Logistics Hub');
    setDLicence('');
    setDExpiry('2028-12-31');
    setShowAddForm(true);
  };

  const handleSaveAddDriver = async () => {
    if (!dName.trim() || !dPhone.trim()) {
      alert('Please enter Driver Name and Phone Number');
      return;
    }
    await addDriver({
      name: dName,
      phone: dPhone,
      phoneType: dPhoneType,
      device: dDevice,
      assignedVehicle: dAssignedVehicle,
      destination: dDestination,
      licence: dLicence,
      licenceExpiry: dExpiry,
    });
    setShowAddForm(false);
  };

  const handleQuickAssignTruck = (driverId: string, newVehicleId: string) => {
    editDriver(driverId, { assignedVehicle: newVehicleId });
    if (newVehicleId) {
      editVehicle(newVehicleId, { driverId });
      const truck = vehicles[newVehicleId];
      addToast(`🚛 Truck ${truck ? truck.plate : ''} assigned to driver!`, 'success');
    } else {
      addToast('Truck unassigned from driver.', 'info');
    }
  };

  const handleOpenEdit = (d: Driver) => {
    setEditingDriver(d);
    setEditName(d.name);
    setEditPhone(d.phone);
    setEditPhoneType(d.phoneType);
    setEditDevice(d.device);
    setEditVehicleId(d.assignedVehicle || '');
    setEditDestination(d.destination);
    setEditLicence(d.licence);
    setEditExpiry(d.licenceExpiry);
  };

  const handleSaveEdit = () => {
    if (!editingDriver) return;
    editDriver(editingDriver.id, {
      name: editName,
      phone: editPhone,
      phoneType: editPhoneType,
      device: editDevice,
      assignedVehicle: editVehicleId,
      destination: editDestination,
      licence: editLicence,
      licenceExpiry: editExpiry,
    });
    setEditingDriver(null);
  };

  const driverList = Object.values(drivers);
  const vehicleList = Object.values(vehicles);

  return (
    <section className="tab-panel active" id="panel-drivers">
      <div className="panel-header-row">
        <h2 className="panel-title">Drivers</h2>
        <button className="btn btn-primary" id="btnAddDriver" type="button" onClick={handleOpenAddForm}>
          + Add Driver
        </button>
      </div>

      {/* Add Driver Inline Form */}
      {showAddForm && (
        <div className="inline-form" id="formAddDriver">
          <h4 className="form-heading">Add New Driver</h4>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="dName">Full Name</label>
              <input
                type="text"
                id="dName"
                placeholder="Driver Name"
                value={dName}
                onChange={(e) => setDName(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label htmlFor="dPhone">Phone Number</label>
              <input
                type="text"
                id="dPhone"
                placeholder="+91 98401 23456"
                value={dPhone}
                onChange={(e) => setDPhone(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label htmlFor="dPhoneType">Phone Type</label>
              <select
                id="dPhoneType"
                value={dPhoneType}
                onChange={(e) => setDPhoneType(e.target.value as PhoneType)}
              >
                <option value="smart">📱 Smartphone</option>
                <option value="button">📞 Button Phone</option>
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="dDevice">Device Model (Optional)</label>
              <input
                type="text"
                id="dDevice"
                placeholder="e.g. Nokia 105, Samsung Galaxy"
                value={dDevice}
                onChange={(e) => setDDevice(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label htmlFor="dAssignedVehicle">Assign Truck</label>
              <select
                id="dAssignedVehicle"
                value={dAssignedVehicle}
                onChange={(e) => setDAssignedVehicle(e.target.value)}
              >
                <option value="">-- No Truck Assigned --</option>
                {vehicleList.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.plate} ({v.model})
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="dDestination">Trip Destination</label>
              <input
                type="text"
                id="dDestination"
                placeholder="e.g. Sriperumbudur Hub, Coimbatore Depot"
                value={dDestination}
                onChange={(e) => setDDestination(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label htmlFor="dLicence">Licence Number</label>
              <input
                type="text"
                id="dLicence"
                placeholder="TN01 20210001234"
                value={dLicence}
                onChange={(e) => setDLicence(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label htmlFor="dExpiry">Licence Expiry</label>
              <input
                type="date"
                id="dExpiry"
                value={dExpiry}
                onChange={(e) => setDExpiry(e.target.value)}
              />
            </div>
          </div>
          <div className="form-actions">
            <button className="btn btn-primary" id="btnSaveDriver" type="button" onClick={handleSaveAddDriver}>
              Save Driver
            </button>
            <button
              className="btn btn-ghost"
              id="btnCancelDriver"
              type="button"
              onClick={() => setShowAddForm(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Drivers Table */}
      <div className="table-wrapper">
        <table className="data-table" id="driversTable">
          <thead>
            <tr>
              <th>Name</th>
              <th>Phone Number</th>
              <th>Phone Type</th>
              <th>Device</th>
              <th>Assigned Truck</th>
              <th>Destination</th>
              <th>Licence</th>
              <th>Expiry</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody id="driversTableBody">
            {driverList.map((d) => {
              const phoneClass = d.phoneType === 'smart' ? 'cell-phone-smart' : 'cell-phone-button';
              const phoneLabel = d.phoneType === 'smart' ? '📱 Smartphone' : '📞 Button Phone';

              return (
                <tr key={d.id}>
                  <td>
                    <strong>{d.name}</strong>
                  </td>
                  <td>{d.phone}</td>
                  <td className={phoneClass}>{phoneLabel}</td>
                  <td>{d.device || '—'}</td>
                  <td className="cell-plate">
                    {/* 1-Click Interactive Truck Dropdown */}
                    <select
                      className="table-select"
                      value={d.assignedVehicle || ''}
                      onChange={(e) => handleQuickAssignTruck(d.id, e.target.value)}
                    >
                      <option value="">-- No Truck Assigned --</option>
                      {vehicleList.map((v) => (
                        <option key={v.id} value={v.id}>
                          {v.plate} ({v.model})
                        </option>
                      ))}
                    </select>
                  </td>
                  <td>{d.destination || 'Sriperumbudur Logistics Hub'}</td>
                  <td>{d.licence || '—'}</td>
                  <td>{d.licenceExpiry || '—'}</td>
                  <td style={{ whiteSpace: 'nowrap' }}>
                    <button
                      type="button"
                      className="btn btn-sm btn-outline"
                      style={{ padding: '4px 8px', fontSize: '12px', marginRight: '6px' }}
                      onClick={() => handleOpenEdit(d)}
                    >
                      ✏️ Edit
                    </button>
                    <button
                      type="button"
                      className="btn btn-sm btn-ghost"
                      style={{ padding: '4px 8px', fontSize: '12px', color: '#DC2626' }}
                      onClick={() => deleteDriver(d.id)}
                      title="Delete Driver"
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

      {/* Edit Driver Modal */}
      {editingDriver && (
        <div className="modal-overlay" id="modalEditDriver" style={{ display: 'flex' }}>
          <div className="modal-card">
            <div className="modal-header">
              <h3>✏️ Edit Driver Details</h3>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setEditingDriver(null)}
              >
                &times;
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label htmlFor="editDriverName">Full Name</label>
                <input
                  type="text"
                  id="editDriverName"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label htmlFor="editDriverPhone">Phone Number</label>
                <input
                  type="text"
                  id="editDriverPhone"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label htmlFor="editDriverPhoneType">Phone Type</label>
                <select
                  id="editDriverPhoneType"
                  value={editPhoneType}
                  onChange={(e) => setEditPhoneType(e.target.value as PhoneType)}
                >
                  <option value="smart">📱 Smartphone</option>
                  <option value="button">📞 Button Phone</option>
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="editDriverDevice">Device Model (Optional)</label>
                <input
                  type="text"
                  id="editDriverDevice"
                  value={editDevice}
                  onChange={(e) => setEditDevice(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label htmlFor="editDriverVehicle">Assigned Truck</label>
                <select
                  id="editDriverVehicle"
                  value={editVehicleId}
                  onChange={(e) => setEditVehicleId(e.target.value)}
                >
                  <option value="">-- No Truck Assigned --</option>
                  {vehicleList.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.plate} ({v.model})
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="editDriverDestination">Trip Destination</label>
                <input
                  type="text"
                  id="editDriverDestination"
                  value={editDestination}
                  onChange={(e) => setEditDestination(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label htmlFor="editDriverLicence">Licence Number</label>
                <input
                  type="text"
                  id="editDriverLicence"
                  value={editLicence}
                  onChange={(e) => setEditLicence(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label htmlFor="editDriverExpiry">Licence Expiry</label>
                <input
                  type="date"
                  id="editDriverExpiry"
                  value={editExpiry}
                  onChange={(e) => setEditExpiry(e.target.value)}
                />
              </div>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => setEditingDriver(null)}
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
