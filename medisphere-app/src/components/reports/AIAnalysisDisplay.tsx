export default function AIAnalysisDisplay({ analysis }: { analysis: string }) {
  return (
    <div className="p-3 bg-gray-100 border rounded">
      <h4 className="font-semibold">AI Analysis</h4>
      <p>{analysis || "No AI analysis available"}</p>
    </div>
  );
}
