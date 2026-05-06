export interface AuditTrail {
  id: string;
  system_name: string;
  events_captured: number;
  anomalies_detected: number;
  compliance_status: string;
  created_at: string;
}

export interface AuditEvent {
  id: string;
  trail_id: string;
  event_type: string;
  description: string;
  severity: string;
  timestamp: string;
}

export async function api<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `/api/v1${endpoint}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });
  if (!res.ok) {
    throw new Error(`API error: ${res.status} ${res.statusText}`);
  }
  return res.json() as Promise<T>;
}
