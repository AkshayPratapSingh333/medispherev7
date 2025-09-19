import AdminStats from "../../components/admin/AdminStats";

export default function AdminHome() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>
      <AdminStats />
    </div>
  );
}
