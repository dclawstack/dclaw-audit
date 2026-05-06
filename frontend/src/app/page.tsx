import Link from "next/link";
import { ScanLine } from "lucide-react";

export default function HomePage() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen px-4">
      <ScanLine className="w-16 h-16 text-brand mb-6" />
      <h1 className="text-4xl font-bold text-brand mb-4">DClaw Audit</h1>
      <p className="text-lg text-gray-600 mb-8">Automated audit trails</p>
      <Link
        href="/dashboard"
        className="inline-flex items-center px-6 py-3 rounded-lg text-white bg-brand hover:bg-pink-600 transition-colors"
      >
        Go to Dashboard
      </Link>
    </main>
  );
}
