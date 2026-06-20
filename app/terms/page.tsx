import Link from "next/link";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background text-foreground py-12 px-4 sm:px-6 lg:px-8">
      <Link
        href="/auth/signup"
        className="text-primary hover:text-primary/80 font-medium mb-8 inline-block"
      >
        &larr; Back to Home
      </Link>
      <div className="mx-auto max-w-5xl space-y-8">
        <div className="rounded-3xl border border-border bg-card p-8 shadow-sm">
          <h1 className="text-4xl font-bold">Terms & Conditions</h1>
          <p className="mt-4 text-muted-foreground">
            These Terms & Conditions govern your access to and use of Aurex
            Property Management system. By using the service, you agree to these
            terms.
          </p>
        </div>

        <section className="rounded-3xl border border-border bg-card p-8 shadow-sm">
          <h2 className="text-2xl font-semibold">1. Acceptance of Terms</h2>
          <p className="mt-3 text-muted-foreground">
            By accessing or using the Aurex Property Management system, you
            acknowledge that you have read, understood, and agree to be bound by
            these Terms & Conditions. If you do not agree to these terms, you
            may not use the service.
          </p>
        </section>

        <section className="rounded-3xl border border-border bg-card p-8 shadow-sm">
          <h2 className="text-2xl font-semibold">2. Service Description</h2>
          <p className="mt-3 text-muted-foreground">
            Aurex Property Management system is a SaaS property management
            platform that supports property administration and tenant
            management.
          </p>
        </section>

        <section className="rounded-3xl border border-border bg-card p-8 shadow-sm">
          <h2 className="text-2xl font-semibold">3. User Accounts</h2>
          <p className="mt-3 text-muted-foreground">
            Users must create an account to access the service. You are
            responsible for maintaining the confidentiality of your account
            credentials and for all activities that occur under your account.
          </p>
          <p className="mt-3 text-muted-foreground">
            Users are categorized into different roles, including Admin,
            Property Manager, Tenant, and Security. Each role has specific
            access rights and responsibilities within the system.
          </p>
          <p className="mt-3 text-muted-foreground">
            You agree to provide accurate and complete information when creating
            your account and to update your information as necessary. You may
            not share your account credentials with others or allow unauthorized
            access to your account.
          </p>
          <p className="mt-3 text-muted-foreground">
            You are responsible for any activity that occurs under your account,
            and you agree to notify us immediately of any unauthorized use of
            your account or any other breach of security.
          </p>
          <p className="mt-3 text-muted-foreground">
            You are responsible for whoever you grant access to the system/ your
            account in particular and any unlawful handling of data will be
            dealt with in accordance to data protection laws of the state and
            can result in termination of the account and legal action. Users are
            responsible for ensuring that their use of the service complies with
            all applicable laws and regulations.
          </p>

          <p className="mt-3 text-muted-foreground">
            Users are responsible for ensuring that their use of the service
            complies with all applicable laws and regulations.
          </p>
          <p className="mt-3 text-muted-foreground">
            We reserve the right to suspend or terminate accounts that violate
            these Terms & Conditions or engage in suspicious or abusive
            activity.
          </p>
        </section>

        <section className="rounded-3xl border border-border bg-card p-8 shadow-sm">
          <h2 className="text-2xl font-semibold">4. Permitted Use</h2>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-muted-foreground">
            <li>
              Use the service only for lawful property and tenant management
              purposes. Any suspicious account activities detected may lead to
              account ban or even deletion.
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
          <p className="mt-3 text-muted-foreground">
            We are not responsible for the accuracy or legality of
            user-submitted data. Users are responsible for ensuring compliance
            with applicable laws and regulations.
          </p>
          <p className="mt-3 text-muted-foreground">
            We may collect usage data and analytics to improve the service, but
            we will not share personal information with third parties without
            consent, except as required by law.
          </p>
        </section>

        <section className="rounded-3xl border border-border bg-card p-8 shadow-sm">
          <h2 className="text-2xl font-semibold">
            6. Liability and Disclaimers
          </h2>
          <p className="mt-3 text-muted-foreground">
            The service is provided "as is" and we disclaim all warranties,
            express or implied. We are not liable for any damages arising from
            the use or inability to use the service, including data loss,
            business interruption, or other consequential damages.
          </p>
          <p className="mt-3 text-muted-foreground">
            In no event shall we be liable for any indirect, incidental,
            special, or consequential damages arising out of or in connection
            with the use of the service.
          </p>
        </section>

        <section className="rounded-3xl border border-border bg-card p-8 shadow-sm">
          <h2 className="text-2xl font-semibold">7. Termination</h2>
          <p className="mt-3 text-muted-foreground">
            We reserve the right to suspend or terminate your account for
            violations of these Terms & Conditions, misuse of the service, or
            any other reason deemed necessary. Upon termination, your access to
            the service will be revoked, and any data associated with your
            account may be deleted.
          </p>
          <p className="mt-3 text-muted-foreground">
            You may terminate your account at any time by following the account
            deletion process in the application. Upon termination, you will lose
            access to your account and any associated data. This action is
            irreversible, and we are not responsible for any data loss resulting
            from account termination.
          </p>
        </section>

        <section className="rounded-3xl border border-border bg-card p-8 shadow-sm">
          <h2 className="text-2xl font-semibold">8. Contact</h2>
          <p className="mt-3 text-muted-foreground">
            For questions or concerns regarding these Terms & Conditions, please
            contact our support team at{" "}
            <Link
              href="mailto:support@aurexpropmanager.io"
              className="text-primary hover:text-primary/80 font-medium"
            >
              support@aurexpropmanager.io
            </Link>
          </p>
          {/* <div className="mt-4">
            <Link
              href="/dashboard/help"
              className="text-primary hover:text-primary/80 font-medium"
            >
              Visit support
            </Link>
          </div> */}
        </section>
      </div>
    </div>
  );
}
