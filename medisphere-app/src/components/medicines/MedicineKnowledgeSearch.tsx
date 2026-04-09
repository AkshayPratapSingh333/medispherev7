"use client";

import { FormEvent, useState } from "react";

type MedicineResult = {
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

type DiseaseResult = {
  id: string;
  title: string;
  summary?: string;
  url?: string;
};

const PREBUILT_TOPICS = [
  "Diabetes",
  "Hypertension",
  "Asthma",
  "Migraine",
  "Thyroid disorder",
  "Arthritis",
  "Anemia",
  "Fever",
  "Paracetamol",
  "Ibuprofen",
  "Metformin",
  "Insulin",
  "Amoxicillin",
  "Omeprazole",
  "Atorvastatin",
];

const RELATED_TOPICS: Record<string, string[]> = {
  diabetes: ["Type 1 diabetes", "Type 2 diabetes", "Insulin", "Metformin", "Prediabetes"],
  hypertension: ["High blood pressure", "Low sodium diet", "ACE inhibitors", "Amlodipine"],
  asthma: ["Asthma triggers", "Inhaler", "Albuterol", "Breathing exercises"],
  fever: ["Paracetamol", "Ibuprofen", "Viral fever", "Hydration"],
  pain: ["Ibuprofen", "Paracetamol", "Pain management", "Muscle pain"],
};

function levenshteinDistance(a: string, b: string): number {
  const matrix = Array.from({ length: a.length + 1 }, () => new Array<number>(b.length + 1).fill(0));

  for (let i = 0; i <= a.length; i += 1) matrix[i][0] = i;
  for (let j = 0; j <= b.length; j += 1) matrix[0][j] = j;

  for (let i = 1; i <= a.length; i += 1) {
    for (let j = 1; j <= b.length; j += 1) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost,
      );
    }
  }

  return matrix[a.length][b.length];
}

function normalizeTerm(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ").trim();
}

function getDidYouMean(term: string): string | null {
  const normalized = normalizeTerm(term);
  if (normalized.length < 3) return null;

  if (PREBUILT_TOPICS.some((topic) => normalizeTerm(topic) === normalized)) {
    return null;
  }

  let best: { topic: string; score: number } | null = null;

  // Fast prefix/contains checks before edit-distance scoring.
  for (const topic of PREBUILT_TOPICS) {
    const normalizedTopic = normalizeTerm(topic);
    if (normalizedTopic.startsWith(normalized) || normalized.includes(normalizedTopic)) {
      return topic;
    }
  }

  for (const topic of PREBUILT_TOPICS) {
    const normalizedTopic = normalizeTerm(topic);
    const distance = levenshteinDistance(normalized, normalizedTopic);
    if (!best || distance < best.score) {
      best = { topic, score: distance };
    }
  }

  if (!best) return null;

  const maxAllowedDistance = normalized.length <= 5 ? 1 : normalized.length <= 9 ? 2 : 3;
  return best.score <= maxAllowedDistance ? best.topic : null;
}

async function fetchSpellingSuggestion(term: string): Promise<string | null> {
  try {
    const endpoint = `https://api.datamuse.com/sug?s=${encodeURIComponent(term)}&max=5`;
    const res = await fetch(endpoint);
    if (!res.ok) return null;

    const payload = (await res.json()) as Array<{ word?: string }>;
    const first = payload.find((item) => typeof item.word === "string" && item.word.length >= 3);
    if (!first?.word) return null;

    return first.word
      .split(" ")
      .map((w) => (w ? w[0].toUpperCase() + w.slice(1) : w))
      .join(" ");
  } catch {
    return null;
  }
}

function ExpandableText({ text, limit = 280 }: { text: string; limit?: number }) {
  const [expanded, setExpanded] = useState(false);
  const shouldTruncate = text.length > limit;
  const visibleText = !shouldTruncate || expanded ? text : `${text.slice(0, limit).trim()}...`;

  return (
    <div>
      <p className="mt-1 whitespace-pre-line text-sm leading-6 text-stone-600">{visibleText}</p>
      {shouldTruncate && (
        <button
          type="button"
          className="mt-1 text-xs font-medium text-emerald-700 hover:text-emerald-800 transition"
          onClick={() => setExpanded((v) => !v)}
        >
          {expanded ? "Show less" : "Show more"}
        </button>
      )}
    </div>
  );
}

export default function MedicineKnowledgeSearch() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searched, setSearched] = useState(false);
  const [lastQuery, setLastQuery] = useState("");
  const [didYouMean, setDidYouMean] = useState<string | null>(null);
  const [medicines, setMedicines] = useState<MedicineResult[]>([]);
  const [diseases, setDiseases] = useState<DiseaseResult[]>([]);

  const getFollowUpSuggestions = (term: string, diseaseItems: DiseaseResult[], medicineItems: MedicineResult[]) => {
    const suggestions = new Set<string>();
    const base = term.toLowerCase();

    (RELATED_TOPICS[base] || []).forEach((item) => suggestions.add(item));

    diseaseItems
      .slice(0, 3)
      .map((item) => item.title)
      .forEach((title) => suggestions.add(title));

    medicineItems
      .slice(0, 3)
      .map((item) => item.genericName || item.name)
      .forEach((name) => {
        if (name) suggestions.add(name);
      });

    suggestions.delete(term);
    return Array.from(suggestions).slice(0, 8);
  };

  const [followUps, setFollowUps] = useState<string[]>([]);

  async function executeSearch(raw: string) {
    const value = raw.trim();
    if (value.length < 2) {
      setError("Enter at least 2 characters to search.");
      return;
    }

    setLoading(true);
    setSearched(true);
    setLastQuery(value);
    setDidYouMean(null);
    setError("");

    try {
      const res = await fetch(`/api/medicines/search?q=${encodeURIComponent(value)}`);
      const data = await res.json();

      if (!res.ok) {
        setMedicines([]);
        setDiseases([]);
        setFollowUps([]);
        setError(data?.error || "Could not fetch search results.");
        return;
      }

      const medicineItems = Array.isArray(data?.medicines) ? data.medicines : [];
      const diseaseItems = Array.isArray(data?.diseases) ? data.diseases : [];

      setMedicines(medicineItems);
      setDiseases(diseaseItems);
      setFollowUps(getFollowUpSuggestions(value, diseaseItems, medicineItems));

      if (medicineItems.length === 0 && diseaseItems.length === 0) {
        const localSuggestion = getDidYouMean(value);
        const remoteSuggestion = localSuggestion ? null : await fetchSpellingSuggestion(value);
        setDidYouMean(localSuggestion || remoteSuggestion);
      }
    } catch {
      setError("Network error while searching. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function onSearch(e: FormEvent) {
    e.preventDefault();
    await executeSearch(query);
  }

  return (
    <section className="mt-10 w-full rounded-2xl bg-gradient-to-br from-white/60 via-stone-50/60 to-emerald-50/50 border border-amber-200/50 p-6 shadow-2xl shadow-amber-500/10 backdrop-blur-sm md:p-8">
      <header className="border-b border-amber-200/40 pb-5">
        <h2 className="text-2xl font-semibold tracking-tight text-stone-900">
          Personal Health Knowledge Center
        </h2>
        <p className="mt-2 text-sm leading-6 text-stone-600">
          Read clear, trusted medicine and disease guidance from openFDA and MedlinePlus in an easy article view.
        </p>

        <div className="mt-4">
          <label className="mb-1 block text-sm font-medium text-stone-800">
            Quick select (prebuilt topics)
          </label>
          <select
            defaultValue=""
            className="w-full rounded-lg border border-amber-200/40 bg-white/60 backdrop-blur-sm p-2.5 text-sm text-stone-900 outline-none ring-emerald-400/50 focus:ring-2 transition"
            onChange={(e) => {
              const selected = e.target.value;
              if (!selected) return;
              setQuery(selected);
              executeSearch(selected);
            }}
          >
            <option value="" className="bg-stone-100">Select a disease or medicine...</option>
            {PREBUILT_TOPICS.map((topic) => (
              <option key={topic} value={topic} className="bg-stone-100">
                {topic}
              </option>
            ))}
          </select>
        </div>

        <form onSubmit={onSearch} className="mt-4 flex flex-col gap-2 sm:flex-row">
          <input
            list="health-topic-options"
            className="flex-1 rounded-lg border border-amber-200/40 bg-white/60 backdrop-blur-sm p-2.5 text-stone-900 outline-none ring-emerald-400/50 placeholder:text-stone-400 focus:ring-2 transition"
            placeholder="Search by medicine or disease, for example: diabetes, asthma, paracetamol"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <datalist id="health-topic-options">
            {PREBUILT_TOPICS.map((topic) => (
              <option key={topic} value={topic} />
            ))}
          </datalist>
          <button
            type="submit"
            disabled={loading}
            className="rounded-lg bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 px-4 py-2.5 font-medium text-white shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 disabled:cursor-not-allowed disabled:opacity-60 transition"
          >
            {loading ? "Searching..." : "Search"}
          </button>
        </form>

        {error && <p className="mt-3 text-sm text-orange-700 bg-orange-100/40 border border-orange-200/50 rounded-lg px-3 py-2">{error}</p>}

        {searched && followUps.length > 0 && (
          <div className="mt-4">
            <p className="text-sm font-medium text-stone-900">Suggested follow-up topics</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {followUps.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => {
                    setQuery(item);
                    executeSearch(item);
                  }}
                  className="rounded-full border border-emerald-400/50 bg-emerald-500/10 px-3 py-1.5 text-xs font-medium text-emerald-700 hover:bg-emerald-500/20 transition"
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
        )}

        {searched && didYouMean && (
          <div className="mt-3 rounded-lg border border-amber-400/30 bg-amber-100/30 backdrop-blur-sm p-3 text-sm text-amber-900">
            Did you mean{" "}
            <button
              type="button"
              className="font-semibold underline underline-offset-2 hover:text-amber-800"
              onClick={() => {
                setQuery(didYouMean);
                executeSearch(didYouMean);
              }}
            >
              {didYouMean}
            </button>
            ?
          </div>
        )}
      </header>

      {!searched && (
        <p className="mt-6 rounded-xl border border-amber-200/40 bg-white/50 backdrop-blur-sm p-4 text-sm text-stone-600">
          Start with a keyword to read disease explanations and medicine details in a clean article view.
        </p>
      )}

      {searched && diseases.length > 0 && (
        <article className="mt-8">
          <h3 className="text-lg font-semibold text-stone-900">
            Disease and Health Topic Articles{lastQuery ? ` for "${lastQuery}"` : ""}
          </h3>
          <div className="mt-3 space-y-4">
            {diseases.map((item) => (
              <section key={item.id} className="rounded-xl border border-amber-200/40 bg-white/50 backdrop-blur-sm p-5 hover:bg-white/70 transition">
                <h4 className="text-base font-semibold leading-7 text-stone-900">{item.title}</h4>
                {item.summary && <ExpandableText text={item.summary} limit={900} />}
                {item.url && (
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-3 inline-block text-sm font-medium text-emerald-700 hover:text-emerald-800 transition"
                  >
                    Read full article on MedlinePlus →
                  </a>
                )}
              </section>
            ))}
          </div>
        </article>
      )}

      {searched && medicines.length > 0 && (
        <article className="mt-8">
          <h3 className="text-lg font-semibold text-stone-900">Medicine Reference</h3>
          <div className="mt-3 space-y-4">
            {medicines.map((item) => (
              <section key={item.id} className="rounded-xl border border-amber-200/40 bg-white/50 backdrop-blur-sm p-5 hover:bg-white/70 transition">
                <h4 className="text-base font-semibold leading-7 text-stone-900">{item.name}</h4>
                {item.genericName && (
                  <p className="mt-1 text-sm text-stone-600">
                    <span className="font-medium text-emerald-700">Generic name:</span> {item.genericName}
                  </p>
                )}
                {item.manufacturer && (
                  <p className="mt-1 text-sm text-stone-600">
                    <span className="font-medium text-emerald-700">Manufacturer:</span> {item.manufacturer}
                  </p>
                )}
                {item.route && (
                  <p className="mt-1 text-sm text-stone-600">
                    <span className="font-medium text-emerald-700">Route:</span> {item.route}
                  </p>
                )}
                {item.indications && <ExpandableText text={item.indications} limit={700} />}
                {item.labelUrl && (
                  <a
                    href={item.labelUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-3 inline-block text-sm font-medium text-emerald-700 hover:text-emerald-800 transition"
                  >
                    Open drug label details →
                  </a>
                )}
              </section>
            ))}
          </div>
        </article>
      )}

      {searched && medicines.length === 0 && diseases.length === 0 && !error && (
        <p className="mt-6 rounded-xl border border-amber-200/40 bg-white/50 backdrop-blur-sm p-4 text-sm text-stone-600">
          No results found for this keyword. Try a broader term like fever, pain, diabetes, or hypertension.
        </p>
      )}
    </section>
  );
}