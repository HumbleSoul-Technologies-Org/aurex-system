"use client";

import { useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Bell,
  Lock,
  Mail,
  User,
  LogOut,
  Save,
  Check,
  MapPin,
  Phone,
  CalendarDays,
  ClipboardCheck,
} from "lucide-react";
import { currentTenant } from "@/app/lib/tenant-data";
import { TenantRecord, updateTenantApi } from "@/lib/services/tenants";
import { getTenantTypeConfig } from "@/lib/services/settings";

const tabItems = [
  { id: "profile", label: "Profile" },
  { id: "notifications", label: "Notifications" },
  { id: "emergency", label: "Emergency Contact" },
  { id: "moveout", label: "Move-Out Notice" },
  { id: "security", label: "Security" },
  { id: "documents", label: "Document Delivery" },
] as const;

type TabId = (typeof tabItems)[number]["id"];

type NotificationType =
  | "overdue"
  | "leaseEnd"
  | "maintenance"
  | "profileChanges"
  | "messages";

type NotificationPreferences = Record<
  NotificationType,
  { email: boolean; sms: boolean }
>;

const defaultNotificationPreferences: NotificationPreferences = {
  overdue: { email: true, sms: false },
  leaseEnd: { email: true, sms: false },
  maintenance: { email: true, sms: false },
  profileChanges: { email: true, sms: false },
  messages: { email: true, sms: false },
};

const moveOutReasons = [
  { value: "end_of_lease", label: "End of Lease" },
  { value: "relocation", label: "Job Relocation" },
  { value: "personal", label: "Personal Reasons" },
  { value: "other", label: "Other" },
];

const documentDeliveryOptions = [
  { value: "email", label: "Email Only" },
  { value: "in-app", label: "In-App Only" },
  { value: "both", label: "Email & In-App" },
];

export default function TenantSettingsPage() {
  const tenant = currentTenant as TenantRecord | null;

  const [activeTab, setActiveTab] = useState<TabId>("profile");
  const [saveStatus, setSaveStatus] = useState<Record<TabId, boolean>>({
    profile: false,
    notifications: false,
    emergency: false,
    moveout: false,
    security: false,
    documents: false,
  });

  // Load tenant type configuration for defaults
  const tenantTypeConfig = tenant?.tenantType
    ? getTenantTypeConfig(tenant.tenantType)
    : null;

  const [profile, setProfile] = useState({
    name: tenant?.name || "",
    email: tenant?.email || "",
    phone: tenant?.phone || "",
    address: tenant?.address || "",
    city: tenant?.city || "",
    postalCode: tenant?.postalCode || "",
    country: tenant?.country || "",
    image: tenant?.image || "",
    preferredContactMethod:
      tenant?.preferredContactMethod ||
      tenantTypeConfig?.defaultSettings?.preferredContactMethod ||
      "email",
  });

  const [notificationPreferences, setNotificationPreferences] =
    useState<NotificationPreferences>(
      tenant?.notificationPreferences ?? defaultNotificationPreferences,
    );

  const [emergencyContact, setEmergencyContact] = useState({
    name: tenant?.emergencyContactName || "",
    phone: tenant?.emergencyContactPhone || "",
    email: tenant?.emergencyContactEmail || "",
  });

  const [moveOutNotice, setMoveOutNotice] = useState({
    noticeDate: tenant?.moveOutNotice?.noticeDate || "",
    reason: tenant?.moveOutNotice?.reason || "end_of_lease",
    forwardingAddress: tenant?.moveOutNotice?.forwardingAddress || "",
    additionalNotes: tenant?.moveOutNotice?.additionalNotes || "",
    status: tenant?.moveOutNotice?.status || "draft",
  });

  const [passwordState, setPasswordState] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
    error: "",
  });

  const [documentDelivery, setDocumentDelivery] = useState<
    TenantRecord["documentDelivery"]
  >(tenant?.documentDelivery || "email");

  const avatarInitials = useMemo(() => {
    if (!profile.name) return "TN";
    return profile.name
      .split(" ")
      .map((part) => part[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  }, [profile.name]);

  const backFilledEmail = profile.email || tenant?.email || "";

  const handleSave = async (section: TabId, patch: Partial<TenantRecord>) => {
    if (!tenant) return;
    const fullPatch = {
      ...patch,
      preferredContactMethod: profile.preferredContactMethod,
    };
    try {
      await updateTenantApi(tenant.id, fullPatch);
      setSaveStatus((prev) => ({ ...prev, [section]: true }));
      window.setTimeout(
        () => setSaveStatus((prev) => ({ ...prev, [section]: false })),
        2000,
      );
    } catch (error) {
      console.error("Failed to save tenant settings", error);
    }
  };

  const handlePasswordSave = async () => {
    if (!tenant) return;
    if (passwordState.currentPassword !== tenant.password) {
      setPasswordState((prev) => ({
        ...prev,
        error: "Current password is incorrect.",
      }));
      return;
    }
    if (!passwordState.newPassword || passwordState.newPassword.length < 6) {
      setPasswordState((prev) => ({
        ...prev,
        error: "New password must be at least 6 characters.",
      }));
      return;
    }
    if (passwordState.newPassword !== passwordState.confirmPassword) {
      setPasswordState((prev) => ({
        ...prev,
        error: "Passwords do not match.",
      }));
      return;
    }

    try {
      await updateTenantApi(tenant.id, { password: passwordState.newPassword });
      setPasswordState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
        error: "",
      });
      setSaveStatus((prev) => ({ ...prev, security: true }));
      window.setTimeout(
        () => setSaveStatus((prev) => ({ ...prev, security: false })),
        2000,
      );
    } catch (error) {
      console.error("Failed to update tenant password", error);
      setPasswordState((prev) => ({
        ...prev,
        error: "Unable to update password. Please try again.",
      }));
    }
  };

  if (!tenant) {
    return (
      <div className="p-6 text-center text-muted-foreground">
        Tenant profile not available. Please log in again.
      </div>
    );
  }

  return (
    <div className="space-y-6 md:space-y-8 max-w-6xl">
      <div>
        <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
          Tenant Settings
        </h1>
        <p className="text-sm md:text-base text-muted-foreground max-w-2xl">
          Configure your profile, notification preferences, move-out notice,
          emergency contact details, password, and document delivery options.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-[220px_1fr]">
        <div className="space-y-2 rounded-lg border border-border bg-background p-3">
          {tabItems.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`w-full rounded-lg px-4 py-3 text-left text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? "bg-primary text-white"
                  : "hover:bg-secondary text-foreground"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="space-y-6">
          {activeTab === "profile" && (
            <Card className="border border-border p-4 md:p-6">
              <div className="flex items-start gap-4 md:gap-6 mb-6 pb-6 border-b border-border">
                <div className="relative">
                  <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-primary flex items-center justify-center text-white text-2xl md:text-3xl">
                    {profile.image ? (
                      <img
                        src={profile.image}
                        alt="Avatar"
                        className="w-full h-full object-cover rounded-full"
                      />
                    ) : (
                      avatarInitials
                    )}
                  </div>
                </div>
                <div className="flex-1">
                  <h2 className="text-xl md:text-2xl font-bold text-foreground mb-1">
                    Profile
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Update your contact information and preferred address.
                  </p>
                </div>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">
                      Full Name
                    </label>
                    <input
                      value={profile.name}
                      onChange={(e) =>
                        setProfile({ ...profile, name: e.target.value })
                      }
                      className="w-full px-4 py-3 border border-border rounded-lg bg-background text-foreground text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">
                      Email
                    </label>
                    <input
                      type="email"
                      value={profile.email}
                      onChange={(e) =>
                        setProfile({ ...profile, email: e.target.value })
                      }
                      className="w-full px-4 py-3 border border-border rounded-lg bg-background text-foreground text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">
                      Phone
                    </label>
                    <input
                      type="tel"
                      value={profile.phone}
                      onChange={(e) =>
                        setProfile({ ...profile, phone: e.target.value })
                      }
                      className="w-full px-4 py-3 border border-border rounded-lg bg-background text-foreground text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">
                      Preferred Contact Method
                    </label>
                    <select
                      value={profile.preferredContactMethod}
                      onChange={(e) =>
                        setProfile({
                          ...profile,
                          preferredContactMethod: e.target.value as
                            | "email"
                            | "phone"
                            | "sms",
                        })
                      }
                      className="w-full px-4 py-3 border border-border rounded-lg bg-background text-foreground text-sm"
                    >
                      <option value="email">Email</option>
                      <option value="phone">Phone</option>
                      <option value="sms">SMS</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">
                      Street Address
                    </label>
                    <input
                      value={profile.address}
                      onChange={(e) =>
                        setProfile({ ...profile, address: e.target.value })
                      }
                      className="w-full px-4 py-3 border border-border rounded-lg bg-background text-foreground text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">
                      City
                    </label>
                    <input
                      value={profile.city}
                      onChange={(e) =>
                        setProfile({ ...profile, city: e.target.value })
                      }
                      className="w-full px-4 py-3 border border-border rounded-lg bg-background text-foreground text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">
                      Postal Code
                    </label>
                    <input
                      value={profile.postalCode}
                      onChange={(e) =>
                        setProfile({ ...profile, postalCode: e.target.value })
                      }
                      className="w-full px-4 py-3 border border-border rounded-lg bg-background text-foreground text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">
                      Country
                    </label>
                    <input
                      value={profile.country}
                      onChange={(e) =>
                        setProfile({ ...profile, country: e.target.value })
                      }
                      className="w-full px-4 py-3 border border-border rounded-lg bg-background text-foreground text-sm"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-border mt-6 flex flex-col sm:flex-row items-start gap-3">
                <Button
                  onClick={() =>
                    handleSave("profile", {
                      name: profile.name,
                      email: profile.email,
                      phone: profile.phone,
                      address: profile.address,
                      city: profile.city,
                      postalCode: profile.postalCode,
                      country: profile.country,
                      image: profile.image,
                    })
                  }
                  className="bg-primary hover:bg-primary/90 text-white gap-2"
                >
                  {saveStatus.profile ? (
                    <>
                      <Check className="w-4 h-4" />
                      Saved
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      Save Profile
                    </>
                  )}
                </Button>
                <div className="text-sm text-muted-foreground">
                  Updates are saved to your tenant profile immediately.
                </div>
              </div>
            </Card>
          )}

          {activeTab === "notifications" && (
            <Card className="border border-border p-4 md:p-6">
              <div className="flex items-start gap-4 mb-6 pb-6 border-b border-border">
                <div className="rounded-lg bg-primary/10 p-3 text-primary">
                  <Bell className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-xl md:text-2xl font-bold text-foreground mb-1">
                    Notification Preferences
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Control which notifications you receive and how you receive
                    them.
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                {[
                  {
                    key: "overdue" as NotificationType,
                    label: "Rent Overdue Alerts",
                    description: "Notify me when rent payment is overdue",
                  },
                  {
                    key: "leaseEnd" as NotificationType,
                    label: "Lease End Reminders",
                    description: "Notify me before your lease expires",
                  },
                  {
                    key: "maintenance" as NotificationType,
                    label: "Maintenance Scheduled",
                    description:
                      "Notify me when a maintenance visit is scheduled",
                  },
                  {
                    key: "profileChanges" as NotificationType,
                    label: "Profile Updates",
                    description: "Notify me when admin updates my profile",
                  },
                  {
                    key: "messages" as NotificationType,
                    label: "Messages & Announcements",
                    description:
                      "Notify me of new messages when I am logged out",
                  },
                ].map((item) => (
                  <div
                    key={item.key}
                    className="rounded-2xl border border-border p-4 bg-background"
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="font-semibold text-foreground">
                          {item.label}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {item.description}
                        </p>
                      </div>
                      <div className="grid grid-cols-2 gap-2 sm:grid-cols-2">
                        <label className="flex items-center gap-2 rounded-lg border border-border px-3 py-2">
                          <input
                            type="checkbox"
                            checked={notificationPreferences[item.key].email}
                            onChange={(e) =>
                              setNotificationPreferences((prev) => ({
                                ...prev,
                                [item.key]: {
                                  ...prev[item.key],
                                  email: e.target.checked,
                                },
                              }))
                            }
                            className="w-4 h-4 rounded border-border"
                          />
                          <span className="text-sm text-foreground">Email</span>
                        </label>
                        <label className="flex items-center gap-2 rounded-lg border border-border px-3 py-2">
                          <input
                            type="checkbox"
                            checked={notificationPreferences[item.key].sms}
                            onChange={(e) =>
                              setNotificationPreferences((prev) => ({
                                ...prev,
                                [item.key]: {
                                  ...prev[item.key],
                                  sms: e.target.checked,
                                },
                              }))
                            }
                            className="w-4 h-4 rounded border-border"
                          />
                          <span className="text-sm text-foreground">SMS</span>
                        </label>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-6 border-t border-border mt-6">
                <Button
                  onClick={() =>
                    handleSave("notifications", { notificationPreferences })
                  }
                  className="bg-primary hover:bg-primary/90 text-white gap-2"
                >
                  {saveStatus.notifications ? (
                    <>
                      <Check className="w-4 h-4" />
                      Saved
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      Save Notification Settings
                    </>
                  )}
                </Button>
              </div>
            </Card>
          )}

          {activeTab === "emergency" && (
            <Card className="border border-border p-4 md:p-6">
              <div className="flex items-start gap-4 mb-6 pb-6 border-b border-border">
                <div className="rounded-lg bg-primary/10 p-3 text-primary">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-xl md:text-2xl font-bold text-foreground mb-1">
                    Emergency Contact
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Add someone we can reach if there is an urgent issue at your
                    unit.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    Contact Name
                  </label>
                  <input
                    value={emergencyContact.name}
                    onChange={(e) =>
                      setEmergencyContact({
                        ...emergencyContact,
                        name: e.target.value,
                      })
                    }
                    className="w-full px-4 py-3 border border-border rounded-lg bg-background text-foreground text-sm"
                    placeholder="Full name"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    Phone
                  </label>
                  <input
                    value={emergencyContact.phone}
                    onChange={(e) =>
                      setEmergencyContact({
                        ...emergencyContact,
                        phone: e.target.value,
                      })
                    }
                    className="w-full px-4 py-3 border border-border rounded-lg bg-background text-foreground text-sm"
                    placeholder="(123) 456-7890"
                  />
                </div>
                <div className="lg:col-span-2">
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    Email
                  </label>
                  <input
                    type="email"
                    value={emergencyContact.email}
                    onChange={(e) =>
                      setEmergencyContact({
                        ...emergencyContact,
                        email: e.target.value,
                      })
                    }
                    className="w-full px-4 py-3 border border-border rounded-lg bg-background text-foreground text-sm"
                    placeholder="email@example.com"
                  />
                </div>
              </div>

              <div className="pt-6 border-t border-border mt-6">
                <Button
                  onClick={() =>
                    handleSave("emergency", {
                      emergencyContactName: emergencyContact.name,
                      emergencyContactPhone: emergencyContact.phone,
                      emergencyContactEmail: emergencyContact.email,
                    })
                  }
                  className="bg-primary hover:bg-primary/90 text-white gap-2"
                >
                  {saveStatus.emergency ? (
                    <>
                      <Check className="w-4 h-4" />
                      Saved
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      Save Emergency Contact
                    </>
                  )}
                </Button>
              </div>
            </Card>
          )}

          {activeTab === "moveout" && (
            <Card className="border border-border p-4 md:p-6">
              <div className="flex items-start gap-4 mb-6 pb-6 border-b border-border">
                <div className="rounded-lg bg-primary/10 p-3 text-primary">
                  <CalendarDays className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-xl md:text-2xl font-bold text-foreground mb-1">
                    Move-Out Notice
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Submit your planned move-out notice so your landlord can
                    prepare for your departure.
                  </p>
                </div>
              </div>

              {moveOutNotice.status === "submitted" ? (
                <div className="space-y-4 rounded-2xl border border-primary/20 bg-primary/5 p-4">
                  <p className="font-semibold text-foreground">
                    Notice Submitted
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Your move-out notice has been submitted and cannot be
                    edited.
                  </p>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <p className="text-xs text-muted-foreground">
                        Notice Date
                      </p>
                      <p className="font-medium text-foreground">
                        {moveOutNotice.noticeDate || "—"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Reason</p>
                      <p className="font-medium text-foreground">
                        {moveOutReasons.find(
                          (item) => item.value === moveOutNotice.reason,
                        )?.label || "—"}
                      </p>
                    </div>
                    <div className="sm:col-span-2">
                      <p className="text-xs text-muted-foreground">
                        Forwarding Address
                      </p>
                      <p className="font-medium text-foreground">
                        {moveOutNotice.forwardingAddress || "—"}
                      </p>
                    </div>
                    <div className="sm:col-span-2">
                      <p className="text-xs text-muted-foreground">
                        Additional Notes
                      </p>
                      <p className="font-medium text-foreground">
                        {moveOutNotice.additionalNotes || "—"}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-foreground mb-2 block">
                        Notice Date
                      </label>
                      <input
                        type="date"
                        value={moveOutNotice.noticeDate}
                        onChange={(e) =>
                          setMoveOutNotice({
                            ...moveOutNotice,
                            noticeDate: e.target.value,
                          })
                        }
                        className="w-full px-4 py-3 border border-border rounded-lg bg-background text-foreground text-sm"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-foreground mb-2 block">
                        Reason
                      </label>
                      <select
                        value={moveOutNotice.reason}
                        onChange={(e) =>
                          setMoveOutNotice({
                            ...moveOutNotice,
                            reason: e.target.value,
                          })
                        }
                        className="w-full px-4 py-3 border border-border rounded-lg bg-background text-foreground text-sm"
                      >
                        {moveOutReasons.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">
                      Forwarding Address
                    </label>
                    <textarea
                      value={moveOutNotice.forwardingAddress}
                      onChange={(e) =>
                        setMoveOutNotice({
                          ...moveOutNotice,
                          forwardingAddress: e.target.value,
                        })
                      }
                      rows={4}
                      className="w-full px-4 py-3 border border-border rounded-lg bg-background text-foreground text-sm"
                      placeholder="Address where we can send deposit details and final paperwork"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">
                      Additional Notes
                    </label>
                    <textarea
                      value={moveOutNotice.additionalNotes}
                      onChange={(e) =>
                        setMoveOutNotice({
                          ...moveOutNotice,
                          additionalNotes: e.target.value,
                        })
                      }
                      rows={3}
                      className="w-full px-4 py-3 border border-border rounded-lg bg-background text-foreground text-sm"
                      placeholder="Optional details for your landlord"
                    />
                  </div>

                  <div className="rounded-2xl border border-yellow-200 bg-yellow-50 p-4 text-sm text-foreground">
                    Sending this notice will notify your landlord of your
                    planned move-out date. After submission, it will become
                    read-only.
                  </div>

                  <div className="pt-6 border-t border-border mt-6">
                    <Button
                      onClick={() => {
                        setMoveOutNotice((prev) => ({
                          ...prev,
                          status: "submitted",
                        }));
                        handleSave("moveout", {
                          moveOutNotice: {
                            ...moveOutNotice,
                            status: "submitted",
                          },
                        });
                      }}
                      className="bg-primary hover:bg-primary/90 text-white gap-2"
                    >
                      {saveStatus.moveout ? (
                        <>
                          <Check className="w-4 h-4" />
                          Submitted
                        </>
                      ) : (
                        <>
                          <ClipboardCheck className="w-4 h-4" />
                          Submit Move-Out Notice
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </Card>
          )}

          {activeTab === "security" && (
            <Card className="border border-border p-4 md:p-6">
              <div className="flex items-start gap-4 mb-6 pb-6 border-b border-border">
                <div className="rounded-lg bg-primary/10 p-3 text-primary">
                  <Lock className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-xl md:text-2xl font-bold text-foreground mb-1">
                    Security
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Change your password and keep your account secure.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    Current Password
                  </label>
                  <input
                    type="password"
                    value={passwordState.currentPassword}
                    onChange={(e) =>
                      setPasswordState({
                        ...passwordState,
                        currentPassword: e.target.value,
                        error: "",
                      })
                    }
                    className="w-full px-4 py-3 border border-border rounded-lg bg-background text-foreground text-sm"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    New Password
                  </label>
                  <input
                    type="password"
                    value={passwordState.newPassword}
                    onChange={(e) =>
                      setPasswordState({
                        ...passwordState,
                        newPassword: e.target.value,
                        error: "",
                      })
                    }
                    className="w-full px-4 py-3 border border-border rounded-lg bg-background text-foreground text-sm"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    value={passwordState.confirmPassword}
                    onChange={(e) =>
                      setPasswordState({
                        ...passwordState,
                        confirmPassword: e.target.value,
                        error: "",
                      })
                    }
                    className="w-full px-4 py-3 border border-border rounded-lg bg-background text-foreground text-sm"
                  />
                </div>
              </div>

              {passwordState.error && (
                <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                  {passwordState.error}
                </div>
              )}

              <div className="pt-6 border-t border-border mt-6">
                <Button
                  onClick={handlePasswordSave}
                  className="bg-primary hover:bg-primary/90 text-white gap-2"
                >
                  {saveStatus.security ? (
                    <>
                      <Check className="w-4 h-4" />
                      Password Updated
                    </>
                  ) : (
                    <>
                      <Lock className="w-4 h-4" />
                      Update Password
                    </>
                  )}
                </Button>
              </div>
            </Card>
          )}

          {activeTab === "documents" && (
            <Card className="border border-border p-4 md:p-6">
              <div className="flex items-start gap-4 mb-6 pb-6 border-b border-border">
                <div className="rounded-lg bg-primary/10 p-3 text-primary">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-xl md:text-2xl font-bold text-foreground mb-1">
                    Document Delivery
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Choose how you receive lease agreements, invoices, and
                    notifications.
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                {documentDeliveryOptions.map((option) => (
                  <label
                    key={option.value}
                    className="flex items-center gap-3 rounded-lg border border-border p-4 hover:bg-secondary cursor-pointer"
                  >
                    <input
                      type="radio"
                      name="documentDelivery"
                      value={option.value}
                      checked={documentDelivery === option.value}
                      onChange={() =>
                        setDocumentDelivery(
                          option.value as TenantRecord["documentDelivery"],
                        )
                      }
                      className="h-4 w-4 border-border"
                    />
                    <div>
                      <p className="font-medium text-foreground">
                        {option.label}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {option.value === "email"
                          ? "Receive documents only by email."
                          : option.value === "in-app"
                            ? "Receive documents only inside the tenant portal."
                            : "Receive documents both by email and in the portal."}
                      </p>
                    </div>
                  </label>
                ))}
              </div>

              <div className="pt-6 border-t border-border mt-6">
                <Button
                  onClick={() => handleSave("documents", { documentDelivery })}
                  className="bg-primary hover:bg-primary/90 text-white gap-2"
                >
                  {saveStatus.documents ? (
                    <>
                      <Check className="w-4 h-4" />
                      Saved
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      Save Delivery Preference
                    </>
                  )}
                </Button>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
