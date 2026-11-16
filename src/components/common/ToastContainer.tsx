import React from 'react';
import { useFleet } from '../../context/FleetContext';

export const ToastContainer: React.FC = () => {
  const { toasts } = useFleet();

  return (
    <div className="toast-container" id="toastContainer">
      {toasts.map((toast) => (
        <div key={toast.id} className={`toast toast-${toast.type}`}>
          {toast.text}
        </div>
      ))}
    </div>
  );
};

