import Link from "next/link";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background text-foreground py-12 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl space-y-8">
        <div className="rounded-3xl border border-border bg-card p-8 shadow-sm">
          <h1 className="text-4xl font-bold">Terms & Conditions</h1>
          <p className="mt-4 text-muted-foreground">
            These Terms & Conditions govern your access to and use of
            PropManager. By using the service, you agree to these terms.
          </p>
        </div>

        <section className="rounded-3xl border border-border bg-card p-8 shadow-sm">
          <h2 className="text-2xl font-semibold">1. Acceptance of Terms</h2>
          <p className="mt-3 text-muted-foreground">
            Use of PropManager means you accept and agree to be bound by these
            Terms & Conditions, as well as any additional terms or policies
            referenced herein.
          </p>
        </section>

        <section className="rounded-3xl border border-border bg-card p-8 shadow-sm">
          <h2 className="text-2xl font-semibold">2. Service Description</h2>
          <p className="mt-3 text-muted-foreground">
            PropManager is a property management platform that supports property
            administration, tenant communication, maintenance requests,
            payments, and reporting.
          </p>
        </section>

        <section className="rounded-3xl border border-border bg-card p-8 shadow-sm">
          <h2 className="text-2xl font-semibold">3. User Accounts</h2>
          <p className="mt-3 text-muted-foreground">
            You are responsible for maintaining the security of your account and
            all activity that occurs under your account.
          </p>
          <p className="mt-3 text-muted-foreground">
            Admin and property manager accounts are granted access to management
            functions and must comply with applicable rules and policies.
          </p>
        </section>

        <section className="rounded-3xl border border-border bg-card p-8 shadow-sm">
          <h2 className="text-2xl font-semibold">4. Permitted Use</h2>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-muted-foreground">
            <li>
              Use the service only for lawful property management purposes.
            </li>
            <li>Avoid unauthorized access, misuse, or abusive activity.</li>
            <li>Respect the privacy and rights of other users.</li>
          </ul>
        </section>

        <section className="rounded-3xl border border-border bg-card p-8 shadow-sm">
          <h2 className="text-2xl font-semibold">5. Data and Privacy</h2>
          <p className="mt-3 text-muted-foreground">
            User data is collected and processed in accordance with the Privacy
            Policy. Do not submit information you are not authorized to share.
          </p>
        </section>

        <section className="rounded-3xl border border-border bg-card p-8 shadow-sm">
          <h2 className="text-2xl font-semibold">
            6. Liability and Disclaimers
          </h2>
          <p className="mt-3 text-muted-foreground">
            The service is provided “as is” and “as available.” We are not
            liable for indirect, incidental, or consequential damages.
          </p>
        </section>

        <section className="rounded-3xl border border-border bg-card p-8 shadow-sm">
          <h2 className="text-2xl font-semibold">7. Termination</h2>
          <p className="mt-3 text-muted-foreground">
            We may suspend or terminate accounts for breach of these terms or
            misuse of the service.
          </p>
        </section>

        <section className="rounded-3xl border border-border bg-card p-8 shadow-sm">
          <h2 className="text-2xl font-semibold">8. Contact</h2>
          <p className="mt-3 text-muted-foreground">
            For questions about these terms, please contact us through the
            application support channels.
          </p>
          <div className="mt-4">
            <Link
              href="/dashboard/help"
              className="text-primary hover:text-primary/80 font-medium"
            >
              Visit support
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
