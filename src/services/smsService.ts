export interface SendSmsPayload {
  driverName?: string;
  phone?: string;
  driverPhone?: string;
  truckPlate?: string;
  plate?: string;
  destination?: string;
  tollFree?: string;
  type?: 'dispatch' | 'sim_consent' | 'driver_link';
  customMessage?: string;
  vehicleId?: string;
}

export async function sendDriverSms(payload: SendSmsPayload): Promise<{ success: boolean; message?: string }> {
  try {
    const res = await fetch('/api/send-driver-sms', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      return { success: false, message: `Server error: ${res.status}` };
    }
    const data = await res.json();
    return { success: data.success, message: data.message };
  } catch (err: any) {
    console.warn('SMS dispatch failed or running in offline mode:', err.message);
    return { success: false, message: err.message };
  }
}

