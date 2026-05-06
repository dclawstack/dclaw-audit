"use client";

import { useState } from "react";
import { ScanLine } from "lucide-react";
import { api, AuditTrail } from "@/lib/api";

export default function DashboardPage() {
  const [systemName, setSystemName] = useState("");
  const [result, setResult] = useState<AuditTrail | null>(null);
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    if (!systemName.trim()) return;
    setLoading(true);
    try {
      const data = await api<AuditTrail>("/trails", {
        method: "POST",
        body: JSON.stringify({ system_name: systemName }),
      });
      setResult(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen px-6 py-12 max-w-3xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <ScanLine className="w-8 h-8 text-brand" />
        <h1 className="text-2xl font-bold text-brand">DClaw Audit Dashboard</h1>
      </div>

      <div className="bg-white rounded-xl shadow p-6 mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          System name
        </label>
        <input
          type="text"
          value={systemName}
          onChange={(e) => setSystemName(e.target.value)}
          placeholder="e.g. production-api"
          className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-brand mb-4"
        />
        <button
          onClick={handleGenerate}
          disabled={loading || !systemName.trim()}
          className="inline-flex items-center px-5 py-2.5 rounded-lg text-white bg-brand hover:bg-pink-600 disabled:opacity-50 transition-colors"
        >
          {loading ? "Generating..." : "Generate Audit Trail"}
        </button>
      </div>

      {result && (
        <div className="bg-white rounded-xl shadow p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-800">Audit Trail Result</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-500 uppercase">Events captured</p>
              <p className="text-xl font-bold text-gray-900">{result.events_captured}</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-500 uppercase">Anomalies detected</p>
              <p className="text-xl font-bold text-gray-900">{result.anomalies_detected}</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-500 uppercase">Compliance status</p>
              <p className="text-xl font-bold text-gray-900 capitalize">{result.compliance_status}</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-500 uppercase">Created at</p>
              <p className="text-sm font-medium text-gray-900">{new Date(result.created_at).toLocaleString()}</p>
            </div>
          </div>
          <button
            onClick={() => alert("Export report feature coming soon!")}
            className="w-full mt-2 inline-flex items-center justify-center px-5 py-2.5 rounded-lg border border-brand text-brand hover:bg-brand hover:text-white transition-colors"
          >
            Export report
          </button>
        </div>
      )}
    </main>
  );
}
