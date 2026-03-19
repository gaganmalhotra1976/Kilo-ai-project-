import { redirect } from "next/navigation";
import Link from "next/link";

export default function PortalLoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-emerald-600 text-white py-4 px-6 shadow-lg">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link href="/portal/login" className="flex items-center gap-2">
            <span className="text-2xl">🐼</span>
            <span className="font-bold text-lg">The Vaccine Panda</span>
          </Link>
          <span className="text-sm bg-emerald-700 px-3 py-1 rounded-full">
            Customer Portal
          </span>
        </div>
      </header>
      <main className="max-w-4xl mx-auto p-6">
        {children}
      </main>
    </div>
  );
}
