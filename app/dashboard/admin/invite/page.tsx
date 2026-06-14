"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  Mail,
  Loader2,
  AlertCircle,
  CheckCircle,
  Copy,
  RefreshCw,
  Trash2,
} from "lucide-react";
import {
  createInvite,
  listInvites,
  resendInvite,
  deleteInvite,
} from "@/lib/services/adminApi";
import { addAuditLog } from "@/lib/services/audit";

interface Invite {
  id: string;
  email: string;
  role: string;
  status: "pending" | "accepted" | "expired";
  message?: string;
  resendCount?: number;
  createdAt: string;
  expiresAt: string;
  inviteLink?: string;
}

export default function AdminInvitePage() {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("tenant");
  const [message, setMessage] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [generatedLink, setGeneratedLink] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [invites, setInvites] = useState<Invite[]>([]);
  const [inviteListLoading, setInviteListLoading] = useState(false);

  const refreshInvites = async () => {
    setInviteListLoading(true);
    try {
      const response = await listInvites();
      if (response.success && Array.isArray(response.data)) {
        setInvites(response.data);
      }
    } catch (err) {
      console.error("Failed to refresh invites", err);
    } finally {
      setInviteListLoading(false);
    }
  };

  useEffect(() => {
    void refreshInvites();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setLoading(true);

    try {
      if (!email) {
        setError("Please enter an email address");
        setLoading(false);
        return;
      }

      const response = await createInvite({
        email,
        role,
        message: message || undefined,
      });

      if (response.success) {
        setSuccess(true);
        if (response.data && "inviteLink" in response.data) {
          setGeneratedLink((response.data as any).inviteLink);
        }
        await addAuditLog({
          action: "Invite created",
          actor: "admin",
          details: `Created invite for ${email} with role ${role}`,
          resourceType: "invite",
          resourceId: (response.data as any)?.id,
        });
        await refreshInvites();

        // Reset form
        setEmail("");
        setRole("tenant");
        setMessage("");

        // Clear success message after 5 seconds
        setTimeout(() => {
          setSuccess(false);
        }, 5000);
      } else {
        setError(response.error || "Failed to create invite");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleCopyLink = () => {
    if (generatedLink) {
      navigator.clipboard.writeText(generatedLink);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const handleResendInvite = async (inviteId: string) => {
    setLoading(true);
    try {
      const response = await resendInvite(inviteId);
      if (response.success) {
        await refreshInvites();
        await addAuditLog({
          action: "Invite resent",
          actor: "admin",
          details: `Resent invite ${inviteId}`,
          resourceType: "invite",
          resourceId: inviteId,
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to resend invite");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteInvite = async (inviteId: string) => {
    setLoading(true);
    try {
      const response = await deleteInvite(inviteId);
      if (response.success) {
        await refreshInvites();
        await addAuditLog({
          action: "Invite deleted",
          actor: "admin",
          details: `Deleted invite ${inviteId}`,
          resourceType: "invite",
          resourceId: inviteId,
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete invite");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-1">
          Send Invites
        </h1>
        <p className="text-muted-foreground">
          Invite users to join your organization
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Invite Form */}
        <Card className="lg:col-span-1 p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">
            New Invite
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Error Message */}
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md flex gap-2 text-red-700 text-sm">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <p>{error}</p>
              </div>
            )}

            {/* Success Message */}
            {success && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-md flex gap-2 text-green-700 text-sm">
                <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <p>Invite sent successfully!</p>
              </div>
            )}

            {/* Email */}
            <div>
              <Label htmlFor="email">Email Address *</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="user@example.com"
                required
                disabled={loading}
              />
            </div>

            {/* Role */}
            <div>
              <Label htmlFor="role">Role *</Label>
              <Select value={role} onValueChange={setRole} disabled={loading}>
                <SelectTrigger id="role">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="property_manager">
                    Property Manager
                  </SelectItem>
                  <SelectItem value="tenant">Tenant</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Message */}
            <div>
              <Label htmlFor="message">Message (Optional)</Label>
              <Textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Add a personal message to the invite..."
                rows={3}
                disabled={loading}
              />
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full bg-primary hover:bg-primary/90"
              disabled={loading}
            >
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {loading ? "Sending..." : "Send Invite"}
            </Button>
          </form>

          {/* Info */}
          <div className="mt-6 p-3 bg-blue-50 border border-blue-200 rounded-md space-y-2">
            <p className="text-xs text-blue-700 font-medium">About Invites</p>
            <ul className="text-xs text-blue-600 space-y-1">
              <li>• Invites expire after 7 days</li>
              <li>• Users receive email with invite link</li>
              <li>• Can resend or cancel invites</li>
              <li>• Track pending and accepted invites</li>
            </ul>
          </div>
        </Card>

        {/* Generated Link Display */}
        {generatedLink && (
          <Card className="lg:col-span-2 p-6 bg-blue-50 border-blue-200">
            <div className="flex items-start gap-3">
              <Mail className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-semibold text-blue-900 mb-2">
                  Invite Link Generated
                </h3>
                <p className="text-sm text-blue-800 mb-4">
                  Share this link with the user or send them the email
                  invitation:
                </p>

                <div className="bg-white p-3 rounded-md border border-blue-200 mb-4">
                  <p className="font-mono text-xs text-foreground break-all">
                    {generatedLink}
                  </p>
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={handleCopyLink}
                    variant="outline"
                    size="sm"
                    className="border-blue-300"
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    {copiedLink ? "Copied!" : "Copy Link"}
                  </Button>
                </div>

                <p className="text-xs text-blue-700 mt-4 font-medium">
                  ℹ️ This link expires in 7 days. Save it somewhere safe or
                  resend the invite if needed.
                </p>
              </div>
            </div>
          </Card>
        )}
      </div>

      <Card className="p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <h2 className="text-lg font-semibold text-foreground mb-1">
              Invite Tracking
            </h2>
            <p className="text-sm text-muted-foreground">
              Manage emailed invitations, resend pending invites, or cancel
              outdated invites.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={refreshInvites}
            disabled={inviteListLoading}
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            {inviteListLoading ? "Refreshing..." : "Refresh List"}
          </Button>
        </div>

        {inviteListLoading ? (
          <div className="text-sm text-muted-foreground">
            Loading invites...
          </div>
        ) : invites.length === 0 ? (
          <div className="text-sm text-muted-foreground">
            No invites have been created yet.
          </div>
        ) : (
          <div className="space-y-4">
            {invites.map((invite) => (
              <div
                key={invite.id}
                className="border border-slate-200 rounded-md p-4 bg-slate-50"
              >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {invite.email}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Role: {invite.role} • Status: {invite.status} • Sent:{" "}
                      {new Date(invite.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleResendInvite(invite.id)}
                      disabled={loading}
                    >
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Resend
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDeleteInvite(invite.id)}
                      disabled={loading}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Cancel
                    </Button>
                  </div>
                </div>
                {invite.inviteLink && (
                  <div className="mt-3 bg-white border border-slate-200 rounded-md p-3 text-xs text-slate-600 break-all">
                    <strong>Invite Link:</strong> {invite.inviteLink}
                  </div>
                )}
                <div className="mt-3 text-xs text-muted-foreground">
                  Expires on {new Date(invite.expiresAt).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
