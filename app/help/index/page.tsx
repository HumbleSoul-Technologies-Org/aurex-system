import Link from "next/link";

export default function HelpIndexPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Knowledge Base</h1>
      <p className="text-muted-foreground">Choose a guide to get started.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link href="/help/admin" className="p-4 border rounded hover:shadow">
          <h2 className="font-semibold">Admin Guide</h2>
          <p className="text-sm text-muted-foreground">
            Step-by-step admin workflows and settings.
          </p>
        </Link>
        <Link href="/help/tenant" className="p-4 border rounded hover:shadow">
          <h2 className="font-semibold">Tenant Guide</h2>
          <p className="text-sm text-muted-foreground">
            How tenants use the portal: payments, maintenance, documents.
          </p>
        </Link>
        <Link
          href="/help/docs/finance"
          className="p-4 border rounded hover:shadow"
        >
          <h2 className="font-semibold">Finance</h2>
          <p className="text-sm text-muted-foreground">
            Invoices, payments, exchange rates.
          </p>
        </Link>
        <Link
          href="/help/docs/maintenance"
          className="p-4 border rounded hover:shadow"
        >
          <h2 className="font-semibold">Maintenance</h2>
          <p className="text-sm text-muted-foreground">
            Submit and manage maintenance requests.
          </p>
        </Link>
      </div>
    </div>
  );
}
