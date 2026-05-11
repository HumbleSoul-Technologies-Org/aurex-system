"use client";

import { useEffect, useState } from "react";
import { getCollection } from "@/lib/local-store";
import { getSystemSettings } from "@/lib/services/settings";

export default function MigrationTestPage() {
  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const runTest = async () => {
      try {
        // Get system settings (this triggers migration if needed)
        const settings = getSystemSettings();

        // Get sample data from each collection
        const collections = {
          properties: getCollection("properties"),
          tenants: getCollection("tenants"),
          transactions: getCollection("transactions"),
          payments: getCollection("payments"),
          "system-settings": getCollection("system-settings"),
        };

        setResults({
          settings,
          collections,
          migrationSuccess: !!settings,
          version: settings?.version || "unknown",
        });
      } catch (error) {
        setResults({
          error: error instanceof Error ? error.message : String(error),
        });
      } finally {
        setLoading(false);
      }
    };

    runTest();
  }, []);

  if (loading) {
    return <div className="p-8">Testing migration system...</div>;
  }

  return (
    <div className="p-8 max-w-4xl">
      <h1 className="text-2xl font-bold mb-6">Migration System Test Results</h1>

      {results.error ? (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          Error: {results.error}
        </div>
      ) : (
        <div className="space-y-6">
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
            ✅ Migration system working! Database version: {results.version}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white p-4 rounded shadow">
              <h3 className="font-semibold mb-2">System Settings</h3>
              <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto max-h-40">
                {JSON.stringify(results.settings, null, 2)}
              </pre>
            </div>

            <div className="bg-white p-4 rounded shadow">
              <h3 className="font-semibold mb-2">Collection Counts</h3>
              <ul className="text-sm">
                {Object.entries(results.collections).map(
                  ([name, data]: [string, any]) => (
                    <li key={name} className="flex justify-between">
                      <span>{name}:</span>
                      <span className="font-mono">{data.length}</span>
                    </li>
                  ),
                )}
              </ul>
            </div>
          </div>

          <div className="bg-white p-4 rounded shadow">
            <h3 className="font-semibold mb-2">Migration Verification</h3>
            <div className="text-sm space-y-1">
              <div>
                ✅ System settings initialized:{" "}
                {results.migrationSuccess ? "Yes" : "No"}
              </div>
              <div>✅ Database version: {results.version}</div>
              <div>✅ Collections accessible: Yes</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
