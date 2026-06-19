"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Search,
  MessageSquare,
  BookOpen,
  Play,
  Mail,
  Phone,
  ChevronDown,
  Plus,
  ExternalLink,
  Send,
  CheckCircle,
} from "lucide-react";
import { apiRequest } from "@/lib/query-client";

export default function HelpPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [expandedFaq, setExpandedFaq] = useState<number | null>(0);
  const [contactFormStatus, setContactFormStatus] = useState<
    "idle" | "submitting" | "success" | "error"
  >("idle");

  const faqs = [
    {
      question: "How do exchange rates get updated?",
      answer: (
        <>
          Exchange rates are refreshed automatically on a schedule. Admins can
          manually trigger a refresh from the Help page via the Exchange Refresh
          API or the Refresh Exchange Rates button in settings. Learn more:{" "}
          <a
            href="/help/docs/finance#exchange-rates--currencies"
            className="text-primary underline"
          >
            Exchange Rates
          </a>
          .
        </>
      ),
    },
    {
      question: "How do I add a new property?",
      answer: (
        <>
          To add a new property, navigate to the Properties section and click
          the "Add Property" button. Fill in the property details including
          address, number of units, rent amount, and other relevant information.
          See the full steps in the Admin guide{" "}
          <a
            href="/help/admin#add-a-property"
            className="text-primary underline"
          >
            (Add a Property)
          </a>
          .
        </>
      ),
    },
    {
      question: "How can I invite tenants to the portal?",
      answer: (
        <>
          Go to the Tenant Portal section, click "Send New Invitation", enter
          the tenant's email address, and they will receive an invitation to
          access the portal where they can pay rent and submit maintenance
          requests. See more:{" "}
          <a
            href="/help/admin#invite-tenants-and-staff"
            className="text-primary underline"
          >
            Inviting tenants
          </a>
          .
        </>
      ),
    },
    {
      question: "What payment methods do tenants have access to?",
      answer: (
        <>
          Tenants can pay rent through credit/debit cards, bank transfers, and
          digital wallets. All payments are processed securely through our
          payment gateway. See accepted methods and setup:{" "}
          <a
            href="/help/docs/finance#payment-methods"
            className="text-primary underline"
          >
            Payment Methods
          </a>
          .
        </>
      ),
    },
    {
      question: "How do I generate financial reports?",
      answer: (
        <>
          Visit the Reports section, select your desired report type (Income,
          Expense, Tax Preparation, or Occupancy), choose the time period, and
          click "Generate Report" or "Export" to download. See reporting tips:{" "}
          <a
            href="/help/docs/COMPLETE_IMPLEMENTATION_SUMMARY#reports"
            className="text-primary underline"
          >
            Reports
          </a>
          .
        </>
      ),
    },
    {
      question: "Can I set up automatic rent reminders?",
      answer: (
        <>
          Yes, in Settings you can enable automatic rent reminders for tenants.
          You can customize the reminder dates and messages to send to your
          tenants. See Settings → Communications for details.
        </>
      ),
    },
    {
      question: "How do I track maintenance requests?",
      answer: (
        <>
          All maintenance requests appear in the Maintenance section. You can
          track requests through stages: Requested, Assigned, In Progress, and
          Completed. For submitting requests as a tenant, see:{" "}
          <a
            href="/help/tenant#submit-a-maintenance-request"
            className="text-primary underline"
          >
            Submit a Maintenance Request
          </a>
          .
        </>
      ),
    },
  ];

  const resources = [
    {
      icon: BookOpen,
      title: "Knowledge Base",
      description: "Browse our comprehensive documentation and guides",
      link: "/help",
    },
    {
      icon: Play,
      title: "Video Tutorials",
      description: "Watch step-by-step video guides for all features",
      link: "#",
    },
    {
      icon: Mail,
      title: "Email Support",
      description: "Reach out to our support team via email",
      link: "mailto:support@aurexpropmanager.io",
    },
    {
      icon: Phone,
      title: "Phone Support",
      description: "Call us at +256 7XX-XXX-XXX",
      link: "tel:+15551234567",
    },
  ];

  const filteredFaqs = faqs.filter((faq) =>
    faq.question.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const submitContactForm = async (e: React.FormEvent) => {
    e.preventDefault();
    setContactFormStatus("submitting");
    try {
      //validation
      if (!name || !email || !subject || !message) {
        alert("Please fill in all fields.");
        setContactFormStatus("error");
        return;
      }
      const payload = {
        name: name + "(Aurex Prop Manager User)",
        email,
        subject,
        message,
        type: "inquiry",
      };
      await apiRequest("POST", "/messages/inquiry", payload);

      setName("");
      setEmail("");
      setSubject("");
      setMessage("");
    } catch (error) {
      console.error("Error submitting contact form:", error);
    } finally {
      setContactFormStatus("success");
      setTimeout(() => setContactFormStatus("idle"), 3000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-4">
        <h1 className="text-3xl md:text-4xl font-bold text-foreground">
          Help & Support
        </h1>
        <p className="text-muted-foreground">
          Find answers and get support from our team
        </p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
        <Input
          placeholder="Search for help..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 border-border bg-background text-foreground"
        />
      </div>

      {/* Support Resources */}
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-4">Get Support</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {resources.map((resource) => {
            const Icon = resource.icon;
            return (
              <a
                key={resource.title}
                href={resource.title !== "Phone Support" ? resource.link : "#"}
                target="_blank"
                rel="noreferrer"
              >
                <Card className="border border-border p-4 md:p-6 hover:border-primary/50 cursor-pointer transition-all h-full">
                  <Icon className="w-8 h-8 text-primary mb-3" />
                  <h3 className="font-bold text-foreground text-sm md:text-base">
                    {resource.title}
                  </h3>
                  <p className="text-xs md:text-sm text-muted-foreground mt-2">
                    {resource.description}
                  </p>
                  <ExternalLink className="w-4 h-4 text-primary mt-4" />
                </Card>
              </a>
            );
          })}
        </div>
      </div>

      {/* FAQ */}
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-4">
          Frequently Asked Questions
        </h2>
        <div className="space-y-3">
          {filteredFaqs.length > 0 ? (
            filteredFaqs.map((faq, idx) => (
              <Card
                key={idx}
                className="border border-border p-0 overflow-hidden"
              >
                <button
                  onClick={() =>
                    setExpandedFaq(expandedFaq === idx ? null : idx)
                  }
                  className="w-full flex items-center justify-between p-4 md:p-6 hover:bg-secondary transition-colors"
                >
                  <h3 className="font-medium text-foreground text-left text-sm md:text-base">
                    {faq.question}
                  </h3>
                  <ChevronDown
                    className={`w-5 h-5 text-muted-foreground flex-shrink-0 ml-4 transition-transform ${
                      expandedFaq === idx ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {expandedFaq === idx && (
                  <div className="px-4 md:px-6 pb-4 md:pb-6 border-t border-border">
                    <p className="text-muted-foreground text-sm md:text-base">
                      {faq.answer}
                    </p>
                  </div>
                )}
              </Card>
            ))
          ) : (
            <Card className="border border-border p-6 text-center">
              <p className="text-muted-foreground">
                No results found. Try a different search.
              </p>
            </Card>
          )}
        </div>
      </div>

      {/* Contact Form */}
      <Card className="border border-border p-4 md:p-6">
        <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-primary" />
          Contact Our Team
        </h3>
        <form className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-foreground block mb-2">
                Name
              </label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                className="border-border bg-background text-foreground"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground block mb-2">
                Email
              </label>
              <Input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                placeholder="your@email.com"
                className="border-border bg-background text-foreground"
              />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-foreground block mb-2">
              Subject
            </label>
            <select
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground text-sm"
            >
              <option>General Inquiry</option>
              <option>Technical Issue</option>
              <option>Feature Request</option>
              <option>Billing Question</option>
              <option>Other</option>
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-foreground block mb-2">
              Message
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Tell us how we can help..."
              rows={4}
              className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground text-sm resize-none"
            />
          </div>
          <Button
            onClick={submitContactForm}
            className={`${contactFormStatus === "success" ? "bg-green-500 hover:bg-green-600" : "bg-primary hover:bg-primary/90"} text-white w-full md:w-auto ${
              contactFormStatus === "submitting" ? "cursor-not-allowed" : ""
            }`}
            disabled={contactFormStatus === "submitting"}
          >
            {contactFormStatus === "submitting" ? (
              <>
                Submitting... <Send className="w-4 h-4 ml-2 animate-bounce" />
              </>
            ) : contactFormStatus === "success" ? (
              <span className="text-white flex items-center gap-2">
                Submitted!
                <CheckCircle className="w-4 h-4" />
              </span>
            ) : (
              "Submit"
            )}
          </Button>
        </form>
      </Card>

      {/* Quick Links */}
      <Card className="border border-border p-4 md:p-6">
        <h3 className="text-lg font-bold text-foreground mb-4">Quick Links</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            { label: "Getting Started Guide", link: "/help/docs/USER_GUIDE" },
            { label: "Feature Documentation", link: "/help/admin" },
            {
              label: "API Reference",
              link: "/help/docs/COMPLETE_IMPLEMENTATION_SUMMARY",
            },
            { label: "System Status", link: "#" },
            { label: "Security Center", link: "#" },
            { label: "Terms & Privacy", link: "/terms" },
          ].map((item) => (
            <a
              key={item.label}
              href={item.link}
              className="flex items-center gap-2 text-primary hover:text-primary/80 font-medium text-sm"
            >
              <ExternalLink className="w-4 h-4" />
              {item.label}
            </a>
          ))}
        </div>
      </Card>
    </div>
  );
}
