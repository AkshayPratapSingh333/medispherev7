import SystemHealth from '../../../components/admin/SystemHealth';
import AuditLog from "../../../components/admin/ActivityLog";

export default function AdminAnalyticsPage() {
  return (
    <div className="p-6 space-y-4">
      <SystemHealth />
      <AuditLog />
    </div>
  );
}
