import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";

type OpenFDAMedicine = {
  id: string;
  name: string;
  genericName?: string;
  manufacturer?: string;
  route?: string;
  purpose?: string;
  indications?: string;
  warnings?: string;
  labelUrl?: string;
};

type MedlineTopic = {
  id: string;
  title: string;
  summary?: string;
  url?: string;
};

type OpenFDALabelEntry = {
  openfda?: Record<string, unknown>;
  purpose?: unknown;
  indications_and_usage?: unknown;
  warnings?: unknown;
};

function firstText(value: unknown): string | undefined {
  if (Array.isArray(value) && value.length > 0) {
    return String(value[0]);
  }
  if (typeof value === "string") {
    return value;
  }
  return undefined;
}

function decodeHtmlEntities(value: string): string {
  return value
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ");
}

function cleanText(value: string): string {
  const decoded = decodeHtmlEntities(value);
  return decoded
    .replace(/<!\[CDATA\[|\]\]>/g, "")
    .replace(/<\/p>|<\/li>|<br\s*\/?\s*>/gi, " ")
    .replace(/<li>/gi, " ")
    .replace(/<\/ul>|<ul>/gi, " ")
    .replace(/<span[^>]*>/gi, "")
    .replace(/<\/span>/gi, "")
    .replace(/<[^>]+>/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function pickContent(documentXml: string, name: string): string | undefined {
  const regex = new RegExp(
    `<content[^>]*name=["']${name}["'][^>]*>([\\s\\S]*?)<\\/content>`,
    "i",
  );
  const match = documentXml.match(regex);
  if (!match?.[1]) {
    return undefined;
  }
  const text = cleanText(match[1]);
  return text || undefined;
}

async function fetchOpenFDAMedicines(term: string): Promise<OpenFDAMedicine[]> {
  const endpoint = new URL("https://api.fda.gov/drug/label.json");
  const openfdaApiKey = process.env.OPENFDA_API_KEY?.trim();

  endpoint.searchParams.set(
    "search",
    `(openfda.brand_name:${term}*+openfda.generic_name:${term}*+openfda.substance_name:${term}*+indications_and_usage:${term}*)`,
  );
  endpoint.searchParams.set("limit", "6");
  if (openfdaApiKey) {
    endpoint.searchParams.set("api_key", openfdaApiKey);
  }

  const response = await fetch(endpoint.toString(), {
    headers: { Accept: "application/json" },
    cache: "no-store",
  });

  if (!response.ok) {
    return [];
  }

  const payload = await response.json();
  const payloadObject = payload as { results?: OpenFDALabelEntry[] };
  const results = Array.isArray(payloadObject.results) ? payloadObject.results : [];

  return results.map((entry: OpenFDALabelEntry, index: number) => {
    const openfda = entry?.openfda || {};
    const setId = firstText(openfda.set_id) || firstText(openfda.product_ndc) || `med-${index}`;

    return {
      id: setId,
      name: firstText(openfda.brand_name) || firstText(openfda.generic_name) || "Unknown medicine",
      genericName: firstText(openfda.generic_name),
      manufacturer: firstText(openfda.manufacturer_name),
      route: firstText(openfda.route),
      purpose: firstText(entry?.purpose),
      indications: firstText(entry?.indications_and_usage),
      warnings: firstText(entry?.warnings),
      labelUrl: `https://dailymed.nlm.nih.gov/dailymed/search.cfm?query=${encodeURIComponent(
        firstText(openfda.brand_name) || firstText(openfda.generic_name) || term,
      )}`,
    } satisfies OpenFDAMedicine;
  });
}

async function fetchMedlineTopics(term: string): Promise<MedlineTopic[]> {
  const endpoint = new URL("https://wsearch.nlm.nih.gov/ws/query");
  endpoint.searchParams.set("db", "healthTopics");
  endpoint.searchParams.set("term", term);
  endpoint.searchParams.set("retmax", "6");

  const response = await fetch(endpoint.toString(), {
    headers: { Accept: "application/xml" },
    cache: "no-store",
  });

  if (!response.ok) {
    return [];
  }

  const xml = await response.text();
  const documents = [...xml.matchAll(/<document\b[\s\S]*?<\/document>/gi)].map((m) => m[0]);

  return documents.map((documentXml, index) => {
    const title = pickContent(documentXml, "title") || "Health topic";
    const summary = pickContent(documentXml, "FullSummary") || pickContent(documentXml, "GroupName");
    const url = pickContent(documentXml, "url");

    return {
      id: `${title}-${index}`,
      title,
      summary,
      url,
    } satisfies MedlineTopic;
  });
}

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.trim() || "";

  if (q.length < 2) {
    return NextResponse.json(
      { error: "Please enter at least 2 characters" },
      { status: 400 },
    );
  }

  const [medicines, diseases] = await Promise.all([
    fetchOpenFDAMedicines(q),
    fetchMedlineTopics(q),
  ]);

  return NextResponse.json({
    query: q,
    medicines,
    diseases,
    sources: {
      medicines: "openFDA drug label API",
      diseases: "MedlinePlus Health Topics API",
    },
  });
}