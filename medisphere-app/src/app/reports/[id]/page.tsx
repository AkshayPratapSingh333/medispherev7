// app/reports/[id]/page.tsx
import prisma from "../../../lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "../../api/auth/[...nextauth]/route";

export default async function ReportViewPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return <div className="min-h-[50vh] grid place-items-center text-cyan-800">Please sign in</div>;

  const report = await prisma.report.findUnique({
    where: { id: params.id },
    include: { patient: { select: { userId: true } } },
  });
  if (!report) return <div className="min-h-[50vh] grid place-items-center text-cyan-800">Report not found</div>;

  const isOwner = report.patient.userId === session.user.id;
  const isAdmin = (session.user as any).role === "ADMIN";
  if (!(isOwner || isAdmin)) return <div className="min-h-[50vh] grid place-items-center text-cyan-800">Forbidden</div>;

  const isImage = report.fileType.startsWith("image/");
  const isPdf = report.fileType === "application/pdf";

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-cyan-50 to-emerald-50">
      <div className="max-w-5xl mx-auto px-6 py-8 space-y-4">
        <div className="relative">
          <div className="absolute -inset-2 rounded-3xl bg-gradient-to-r from-cyan-100/60 via-teal-100/60 to-sky-100/60 blur-xl" />
          <div className="relative bg-white/90 backdrop-blur-sm border border-cyan-100 rounded-3xl px-6 py-6 shadow flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-700 to-emerald-700">
                {report.fileName}
              </h1>
              <p className="text-cyan-800/70">
                {report.fileType} • {(report.fileSize / 1024).toFixed(1)} KB • Uploaded {new Date(report.uploadedAt).toLocaleString("en-IN")}
              </p>
              {report.description ? <p className="mt-1 text-cyan-900">{report.description}</p> : null}
            </div>
            <a
              href={`/api/reports/${report.id}/file`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center rounded-lg bg-gradient-to-r from-cyan-500 to-emerald-500 px-4 py-2 text-white font-medium hover:from-cyan-600 hover:to-emerald-600"
            >
              Open in new tab
            </a>
          </div>
        </div>

        <div className="rounded-2xl border border-cyan-100 bg-white shadow-sm p-4">
          {isImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={`/api/reports/${report.id}/file`}
              alt={report.fileName}
              className="max-h-[75vh] w-auto mx-auto rounded-xl"
            />
          ) : isPdf ? (
            <iframe
              title={report.fileName}
              src={`/api/reports/${report.id}/file`}
              className="w-full h-[80vh] rounded-xl"
            />
          ) : (
            <div className="text-cyan-800">Preview not available for this file type. Use “Open in new tab”.</div>
          )}
        </div>
      </div>
    </div>
  );
}
