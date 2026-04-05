"use client";

export default function PageTransition({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative w-full soft-fade-up">
      {children}
    </div>
  );
}
