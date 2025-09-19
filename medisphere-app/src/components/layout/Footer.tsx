// components/layout/Footer.tsx
export default function Footer() {
  return (
    <footer className="border-t mt-6">
      <div className="max-w-6xl mx-auto px-4 py-4 text-sm text-gray-600">
        © {new Date().getFullYear()} Telemed — Built with care.
      </div>
    </footer>
  );
}
