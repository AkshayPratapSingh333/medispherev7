export default function ReportViewer({ report }: { report: any }) {
  return (
    <div className="border p-4 rounded">
      <h3 className="font-semibold">{report.fileName}</h3>
      <p>Type: {report.fileType}</p>
      <p>Uploaded: {new Date(report.uploadedAt).toLocaleString()}</p>
      {report.aiAnalysis && (
        <div className="mt-2">
          <h4 className="font-semibold">AI Analysis</h4>
          <p>{report.aiAnalysis}</p>
        </div>
      )}
    </div>
  );
}
