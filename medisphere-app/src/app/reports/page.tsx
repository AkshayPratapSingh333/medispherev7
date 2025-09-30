import Link from "next/link";
import ReportList from "../../components/reports/ReportList";

export const metadata = { title: "My Reports" };

export default function ReportsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-cyan-50 to-emerald-50">
      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Header card */}
        <div className="relative mb-6">
          <div className="absolute -inset-2 rounded-3xl bg-gradient-to-r from-cyan-100/60 via-teal-100/60 to-sky-100/60 blur-xl" />
          <div className="relative bg-white/90 backdrop-blur-sm border border-cyan-100 rounded-3xl px-6 py-6 shadow flex items-center justify-between">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-700 to-emerald-700">
                Reports
              </h1>
              <p className="text-cyan-800/70">
                Upload lab results and view PDFs or images securely in one place.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Link
                href="/reports/upload"
                className="inline-flex items-center rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 px-4 py-2 text-white font-medium shadow hover:from-cyan-600 hover:to-emerald-600"
              >
                Upload Report
              </Link>
            </div>
          </div>
        </div>

        {/* Content card */}
        <div className="rounded-2xl border border-cyan-100 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <div className="text-cyan-900 font-semibold">My Files</div>
            <div className="text-sm text-cyan-700/70">
              PDFs, PNGs, JPEGs &amp; WEBP up to 10&nbsp;MB
            </div>
          </div>

          {/* Your existing list component (supports View / Download / Delete per our earlier refactor) */}
          <ReportList />
        </div>
      </div>
    </div>
  );
}