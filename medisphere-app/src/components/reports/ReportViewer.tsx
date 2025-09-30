// components/reports/ReportViewer.tsx
export default function ReportViewer({ report }: { report: any }) {
  const isImage = report.fileType?.startsWith("image/");
  const isPdf = report.fileType === "application/pdf";
  const fileSrc = `/api/reports/${report.id}/file`;

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-cyan-100 bg-white p-5 shadow-sm">
        <h3 className="text-xl font-semibold text-cyan-900">{report.fileName}</h3>
        <p className="text-sm text-cyan-800/80">
          {report.fileType} • {(report.fileSize / 1024).toFixed(1)} KB •{" "}
          {new Date(report.uploadedAt).toLocaleString("en-IN")}
        </p>
        {report.description ? (
          <p className="mt-1 text-cyan-900">{report.description}</p>
        ) : null}

        <div className="mt-3 flex items-center gap-2">
          <a
            href={`/api/reports/${report.id}/download`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center rounded-lg bg-emerald-600/10 px-3 py-1.5 text-sm font-medium text-emerald-800 ring-1 ring-emerald-200 hover:bg-emerald-600/15"
          >
            Download
          </a>
          <a
            href={fileSrc}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center rounded-lg bg-cyan-600/10 px-3 py-1.5 text-sm font-medium text-cyan-800 ring-1 ring-cyan-200 hover:bg-cyan-600/15"
          >
            Open in new tab
          </a>
        </div>
      </div>

      <div className="rounded-2xl border border-cyan-100 bg-white shadow-sm p-4">
        {isImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={fileSrc} alt={report.fileName} className="max-h-[75vh] w-auto mx-auto rounded-xl" />
        ) : isPdf ? (
          <iframe title={report.fileName} src={fileSrc} className="w-full h-[80vh] rounded-xl" />
        ) : (
          <div className="text-cyan-800">Preview not available. Use “Open in new tab”.</div>
        )}
      </div>

      {report.aiAnalysis ? (
        <div className="rounded-2xl border border-cyan-100 bg-white shadow-sm p-4">
          <div className="text-sm text-cyan-700/70">AI Analysis</div>
          <div className="mt-1 text-cyan-900 whitespace-pre-line">{report.aiAnalysis}</div>
        </div>
      ) : null}
    </div>
  );
}
