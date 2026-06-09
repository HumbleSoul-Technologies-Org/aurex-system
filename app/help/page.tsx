import Link from "next/link";
import {
  BookOpen,
  Users,
  DollarSign,
  Wrench,
  FileText,
  ArrowRight,
} from "lucide-react";

export default function HelpIndexPage() {
  const guides = [
    {
      href: "/help/admin",
      title: "Admin Guide",
      description: "Step-by-step admin workflows and settings.",
      icon: BookOpen,
      color: "from-blue-500 to-blue-600",
    },
    {
      href: "/help/tenant",
      title: "Tenant Guide",
      description:
        "How tenants use the portal: payments, maintenance, documents.",
      icon: Users,
      color: "from-purple-500 to-purple-600",
    },
    {
      href: "/help/docs/finance",
      title: "Finance",
      description: "Invoices, payments, exchange rates.",
      icon: DollarSign,
      color: "from-green-500 to-emerald-600",
    },
    {
      href: "/help/docs/maintenance",
      title: "Maintenance",
      description: "Submit and manage maintenance requests.",
      icon: Wrench,
      color: "from-orange-500 to-red-600",
    },
    {
      href: "/help/docs/USER_GUIDE",
      title: "Getting Started",
      description: "Quick start guide and essential features.",
      icon: FileText,
      color: "from-pink-500 to-rose-600",
    },
  ];

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header Section */}
      <div className="mb-12">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-gradient-to-r from-blue-600 via-purple-500 to-cyan-500 rounded-full flex items-center justify-center">
            <span className="text-2xl">❓</span>
          </div>
          <h1 className="text-4xl font-bold text-foreground">Knowledge Base</h1>
        </div>
        <p className="text-lg text-muted-foreground max-w-2xl">
          Find answers, learn best practices, and master PropManager with our
          comprehensive guides and documentation.
        </p>
      </div>

      {/* Search Card */}
      <div className="mb-12 bg-secondary rounded-xl border border-border p-6">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🔍</span>
          <div>
            <h3 className="font-semibold text-foreground">Quick Access</h3>
            <p className="text-sm text-muted-foreground">
              Select a guide below or browse documentation using the sidebar
            </p>
          </div>
        </div>
      </div>

      {/* Guide Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {guides.map((guide) => {
          const Icon = guide.icon;
          return (
            <Link key={guide.href} href={guide.href}>
              <div className="h-full bg-card rounded-xl border border-border shadow-sm hover:shadow-lg hover:border-primary/50 transition-all duration-300 p-6 group cursor-pointer">
                <div className="flex items-start justify-between mb-4">
                  <div
                    className={`bg-gradient-to-br ${guide.color} p-3 rounded-lg text-white transform group-hover:scale-110 transition-transform duration-300`}
                  >
                    <Icon className="w-6 h-6" />
                  </div>
                  <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all duration-300" />
                </div>
                <h3 className="text-lg font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
                  {guide.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {guide.description}
                </p>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Quick Tips Section */}
      <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-secondary rounded-xl border border-border p-6">
          <div className="text-3xl mb-3">💡</div>
          <h4 className="font-semibold text-foreground mb-2">Pro Tips</h4>
          <p className="text-sm text-muted-foreground">
            Check each guide for helpful tips and best practices to maximize
            your productivity.
          </p>
        </div>
        <div className="bg-secondary rounded-xl border border-border p-6">
          <div className="text-3xl mb-3">🎯</div>
          <h4 className="font-semibold text-foreground mb-2">Common Tasks</h4>
          <p className="text-sm text-muted-foreground">
            Most guides are organized by task, making it easy to find what you
            need.
          </p>
        </div>
        <div className="bg-secondary rounded-xl border border-border p-6">
          <div className="text-3xl mb-3">⚡</div>
          <h4 className="font-semibold text-foreground mb-2">
            Quick Reference
          </h4>
          <p className="text-sm text-muted-foreground">
            Use the table of contents to quickly jump to sections you need.
          </p>
        </div>
      </div>
    </div>
  );
}
