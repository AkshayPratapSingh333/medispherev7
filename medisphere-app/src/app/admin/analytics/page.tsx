import SystemHealth from "../../../components/admin/SystemHealth";
import AuditLog from "../../../components/admin/ActivityLog";

export default function AdminAnalyticsPage() {
  return (
    <div className="space-y-4 p-4 sm:p-6 lg:p-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Admin Analytics</h1>
        <p className="text-sm text-slate-600">Monitor platform health, alerts, and audit events.</p>
      </div>
      <SystemHealth />
      <AuditLog />
    </div>
  );
}
