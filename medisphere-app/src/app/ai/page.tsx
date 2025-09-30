// app/ai/page.tsx (Server Component)
import AIChatLoader from "../../components/ai/AIChatLoader";
import ImageAnalyzerLoader from "../../components/ai/ImageAnalyzerLoader";

export const metadata = { title: "AI Assistant" };

export default function AIPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-cyan-50 to-emerald-50">
      <div className="max-w-6xl mx-auto px-6 py-8 space-y-8">
        <div className="relative">
          <div className="absolute -inset-2 rounded-3xl bg-gradient-to-r from-cyan-100/60 via-teal-100/60 to-sky-100/60 blur-xl" />
          <div className="relative bg-white/90 backdrop-blur-sm border border-cyan-100 rounded-3xl px-6 py-6 shadow">
            <h1 className="text-2xl md:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-700 to-emerald-700">
              AI Assistant
            </h1>
            <p className="text-cyan-800/70">
              Chat with an AI that can analyze documents, medical images, and answer general questions. Educational use only—does not replace medical care.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <AIChatLoader />
          </div>
          <div className="space-y-6">
            <ImageAnalyzerLoader />
            
            {/* Feature Cards */}
            <div className="rounded-2xl border border-cyan-100 bg-white p-5 shadow-sm">
              <h3 className="text-lg font-semibold text-cyan-900 mb-3">Features</h3>
              <ul className="space-y-2 text-sm text-cyan-800/80">
                <li className="flex items-start gap-2">
                  <span className="text-cyan-600">💬</span>
                  <span>General conversation and Q&A</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-cyan-600">📄</span>
                  <span>Document analysis (PDF, TXT, DOC)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-cyan-600">📷</span>
                  <span>Medical image analysis</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-cyan-600">🔄</span>
                  <span>Context-aware responses</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}