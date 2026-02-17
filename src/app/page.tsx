import fs from "fs";
import path from "path";
import { Dashboard } from "@/components/dashboard";
import type { DashboardData } from "@/lib/types";

export default function Page() {
  const filePath = path.join(process.cwd(), "public/data/dashboard.json");

  let data: DashboardData | null = null;

  try {
    const raw = fs.readFileSync(filePath, "utf-8");
    data = JSON.parse(raw);
  } catch {
    // File doesn't exist yet — show placeholder
  }

  if (!data) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p className="text-zinc-500">
          Dashboard data not available. Run the export script to generate data.
        </p>
      </main>
    );
  }

  return <Dashboard data={data} />;
}
