// app/api/ai/process-document/route.ts
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_BYTES = Number(process.env.DOC_MAX_BYTES || 10 * 1024 * 1024);
const ALLOWED_EXT = [".pdf", ".docx", ".txt"];
const ALLOWED_MIME = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain",
];

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });

    const fileName = (file.name || "document").trim();
    const lower = fileName.toLowerCase();
    const ext = getExt(lower);
    const mime = file.type || "";

    if (!ALLOWED_EXT.includes(ext) || !ALLOWED_MIME.includes(mime)) {
      return NextResponse.json(
        { error: "Unsupported file type. Allowed: PDF (.pdf), DOCX (.docx), TXT (.txt)." },
        { status: 400 }
      );
    }
    if (file.size > MAX_BYTES) {
      return NextResponse.json(
        { error: `File too large. Max ${Math.floor(MAX_BYTES / (1024 * 1024))} MB.` },
        { status: 413 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    let extractedText = "";
    if (ext === ".pdf") {
      // ---------- Attempt 1: pdf-parse (fast path) ----------
      try {
        const { default: pdfParse } = await import("pdf-parse");
        const data = await pdfParse(buffer);
        extractedText = data.text || "";
      } catch (err: any) {
        const msg = String(err?.message || err);
        const details = String((err as any)?.details || "");

        // Heuristics: typical pdf.js structural failures
        const isXrefFailure =
          /bad XRef entry|XRef|xref|FormatError/i.test(msg) ||
          /bad XRef entry|FormatError/i.test(details);

        if (!isXrefFailure) {
          // Non-structural failure: bubble up as generic PDF parse error
          console.error("PDF parsing error (non-xref):", err);
          return NextResponse.json(
            { error: "Failed to parse PDF. It may be corrupted or password-protected." },
            { status: 400 }
          );
        }

        // ---------- Attempt 2: direct pdfjs-dist page-by-page ----------
        try {
          // Note: use legacy build in Node to avoid worker issues
          const pdfjs = await import("pdfjs-dist");
          const loadingTask = pdfjs.getDocument({
            data: buffer,
            // tolerate some issues; don't use eval
            isEvalSupported: false,
            stopAtErrors: false, // try to keep going
          });
          const doc = await loadingTask.promise;

          let pagesText: string[] = [];
          const numPages = doc.numPages;

          for (let i = 1; i <= numPages; i++) {
            try {
              const page = await doc.getPage(i);
              const content = await page.getTextContent();
              const strings = content.items
                .map((it: any) => ("str" in it ? it.str : ""))
                .filter(Boolean);
              pagesText.push(strings.join(" "));
            } catch (pageErr) {
              // If a single page fails, continue with others
              console.warn(`pdf.js failed on page ${i}:`, pageErr);
            }
          }

          extractedText = pagesText.join("\n\n").trim();
        } catch (fallbackErr: any) {
          console.error("pdfjs-dist fallback failed:", fallbackErr);
          // Return specific guidance for broken xref cases
          return NextResponse.json(
            {
              error:
                "The PDF appears to be structurally corrupted (bad cross-reference table). " +
                "Please re-save/repair the file and try again.",
              advice: [
                "Open the PDF in Chrome/Edge/Preview and 'Print → Save as PDF'.",
                "Or repair with qpdf: qpdf --linearize input.pdf output.pdf",
                "If the PDF is a scanned image, export as a fresh PDF or upload the image and enable OCR.",
              ],
              code: "PDF_XREF_CORRUPT",
            },
            { status: 422 }
          );
        }
      }
    } else if (ext === ".docx") {
      const mammoth = await import("mammoth");
      try {
        const result = await mammoth.extractRawText({ buffer });
        extractedText = result.value || "";
      } catch (e) {
        console.error("DOCX parsing error:", e);
        return NextResponse.json({ error: "Failed to parse DOCX." }, { status: 400 });
      }
    } else if (ext === ".txt") {
      extractedText = buffer.toString("utf-8");
    }

    const cleaned = sanitizeText(extractedText);
    if (!cleaned.trim()) {
      return NextResponse.json(
        {
          error:
            "No text could be extracted. The document may be empty, image-based (scanned), or corrupted.",
          advice: [
            "If it's a scan, enable OCR before uploading.",
            "Try re-saving the PDF via 'Print to PDF' and upload again.",
          ],
          code: "NO_TEXT_EXTRACTED",
        },
        { status: 400 }
      );
    }

    const MAX_CHARS = Number(process.env.DOC_MAX_CHARS || 200_000);
    const text = cleaned.length > MAX_CHARS ? cleaned.slice(0, MAX_CHARS) : cleaned;

    return NextResponse.json({
      fileName,
      mimeType: mime,
      length: text.length,
      text,
      preview: text.slice(0, 800),
      truncated: cleaned.length > text.length,
    });
  } catch (err) {
    console.error("Document processing error:", err);
    return NextResponse.json({ error: "Failed to process document" }, { status: 500 });
  }
}

function getExt(name: string) {
  const i = name.lastIndexOf(".");
  return i >= 0 ? name.slice(i) : "";
}

function sanitizeText(input: string) {
  // collapse spaces, strip control chars (except \n\t), normalize newlines
  const withoutControls = input.replace(/[^\S\r\n\t]+/g, " ");
  const normalized = withoutControls.replace(/\u0000/g, "");
  return normalized.replace(/\r\n?/g, "\n").trim();
}
