import Link from "next/link";

type InfoSection = {
  heading: string;
  body: string;
};

type InfoPageProps = {
  title: string;
  subtitle: string;
  sections: InfoSection[];
};

export default function InfoPage({ title, subtitle, sections }: InfoPageProps) {
  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="rounded-2xl border border-cyan-100 bg-white/90 p-6 shadow-sm sm:p-8">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">{title}</h1>
        <p className="mt-3 text-sm leading-relaxed text-slate-600">{subtitle}</p>

        <div className="mt-8 space-y-6">
          {sections.map((section) => (
            <section key={section.heading} className="rounded-xl border border-slate-100 bg-slate-50/70 p-4">
              <h2 className="text-lg font-semibold text-slate-800">{section.heading}</h2>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">{section.body}</p>
            </section>
          ))}
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/"
            className="rounded-lg bg-cyan-600 px-4 py-2 text-sm font-semibold text-white hover:bg-cyan-700"
          >
            Back to Home
          </Link>
          <Link
            href="/contact"
            className="rounded-lg border border-cyan-200 px-4 py-2 text-sm font-medium text-cyan-700 hover:bg-cyan-50"
          >
            Contact Support
          </Link>
        </div>
      </div>
    </main>
  );
}
