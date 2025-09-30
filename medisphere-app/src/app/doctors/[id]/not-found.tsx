export default function NotFound() {
  return (
    <div className="min-h-[50vh] grid place-items-center">
      <div className="text-center">
        <h1 className="text-xl font-semibold text-cyan-800">Doctor not found</h1>
        <a href="/doctors" className="mt-3 inline-block px-4 py-2 rounded-lg bg-cyan-600/10 text-cyan-800 ring-1 ring-cyan-200">
          Back to Doctors
        </a>
      </div>
    </div>
  );
}
