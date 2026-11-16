export interface SendSmsPayload {
  driverName: string;
  phone: string;
  truckPlate: string;
  destination: string;
  tollFree?: string;
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

