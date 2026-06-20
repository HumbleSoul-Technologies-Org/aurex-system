import React, { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Save,
  Check,
  User,
  Mail,
  Phone,
  Camera,
  ImagePlus,
  Loader,
  CheckCircle,
} from "lucide-react";
import ImageUploadModal from "./ImageUploadModal";

interface BioValue {
  firstName?: string;
  lastName?: string;
  name?: string;
  email?: string;
  phone?: string;
  coSigner?: string;
  emergencyContactPhone?: string;
  pets?: string;
  vehicles?: string;
  businessInfo?: string;
  businessContacts?: string;
  financialInfo?: string;
  image?: { url: string; public_id: string };
  preferredContactMethod?: "email" | "phone" | "sms";
}

interface Props {
  value: BioValue;
  onChange: (patch: Partial<BioValue>) => void;
  onSave: () => void;
  onImageUpload?: (image: { url: string; public_id: string }) => void;
  isSaving?: boolean;
}

export default function BioSection({
  value,
  onChange,
  onSave,
  onImageUpload,
  isSaving,
}: Props) {
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [saveState, setSaveState] = useState("");

  const firstName = value.firstName ?? value.name?.split(" ")[0] ?? "";
  const lastName =
    value.lastName ?? value.name?.split(" ").slice(1).join(" ") ?? "";
  const displayName =
    value.name || [value.firstName, value.lastName].filter(Boolean).join(" ");

  const initials =
    (value?.image
      ? ""
      : (displayName || "")
          .split(" ")
          .map((p) => p[0])
          .slice(0, 2)
          .join("")
          .toUpperCase()) || "TN";

  const handleImageUpload = (image: { url: string; public_id: string }) => {
    onChange({ image });
    onImageUpload?.(image);
    setIsImageModalOpen(false);
  };

  const handleSave = async () => {
    await onSave();
    setSaveState("saved");
    setTimeout(() => setSaveState(""), 3000);
  };

  return (
    <Card className="border border-border p-4 md:p-6">
      <div className="flex items-start gap-4 md:gap-6 mb-6 pb-6 border-b border-border">
        <div className="relative">
          <div className="w-20 relative h-20  md:w-24 md:h-24 rounded-full bg-transparent shadow-lg flex items-center justify-center text-primary text-2xl md:text-3xl">
            {value?.image?.url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={value.image.url}
                alt="Avatar"
                className="w-full h-full object-cover rounded-full"
              />
            ) : (
              initials
            )}

            <Camera
              onClick={() => setIsImageModalOpen(true)}
              className="absolute right-0 bottom-0 text-background bg-primary rounded-full p-1 cursor-pointer hover:bg-primary/90"
            />
          </div>
        </div>
        <div className="flex-1">
          <h2 className="text-xl md:text-2xl font-bold text-foreground mb-1">
            Profile
          </h2>
          <p className="text-sm text-muted-foreground">
            Update your basic tenant profile details.
          </p>
        </div>
      </div>

      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">
              First Name
            </label>
            <div className="relative">
              <User className="absolute left-3 top-3 text-muted-foreground" />
              <input
                value={firstName}
                onChange={(e) =>
                  onChange({
                    firstName: e.target.value,
                    name: `${e.target.value} ${lastName}`.trim(),
                  })
                }
                className="w-full pl-10 px-4 py-3 border border-border rounded-lg bg-background text-foreground text-sm"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">
              Last Name
            </label>
            <div className="relative">
              <User className="absolute left-3 top-3 text-muted-foreground" />
              <input
                value={lastName}
                onChange={(e) =>
                  onChange({
                    lastName: e.target.value,
                    name: `${firstName} ${e.target.value}`.trim(),
                  })
                }
                className="w-full pl-10 px-4 py-3 border border-border rounded-lg bg-background text-foreground text-sm"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 text-muted-foreground" />
              <input
                type="email"
                value={value.email || ""}
                onChange={(e) => onChange({ email: e.target.value })}
                className="w-full pl-10 px-4 py-3 border border-border rounded-lg bg-background text-foreground text-sm"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">
              Phone
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-3 text-muted-foreground" />
              <input
                type="tel"
                value={value.phone || ""}
                onChange={(e) => onChange({ phone: e.target.value })}
                className="w-full pl-10 px-4 py-3 border border-border rounded-lg bg-background text-foreground text-sm"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">
              Co-Signer
            </label>
            <input
              type="text"
              value={value.coSigner || ""}
              onChange={(e) => onChange({ coSigner: e.target.value })}
              className="w-full px-4 py-3 border border-border rounded-lg bg-background text-foreground text-sm"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">
              Emergency Number
            </label>
            <input
              type="tel"
              value={value.emergencyContactPhone || ""}
              onChange={(e) =>
                onChange({ emergencyContactPhone: e.target.value })
              }
              className="w-full px-4 py-3 border border-border rounded-lg bg-background text-foreground text-sm"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">
              Pets
            </label>
            <input
              type="text"
              value={value.pets || ""}
              onChange={(e) => onChange({ pets: e.target.value })}
              className="w-full px-4 py-3 border border-border rounded-lg bg-background text-foreground text-sm"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">
              Vehicles
            </label>
            <input
              type="text"
              value={value.vehicles || ""}
              onChange={(e) => onChange({ vehicles: e.target.value })}
              className="w-full px-4 py-3 border border-border rounded-lg bg-background text-foreground text-sm"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">
              Preferred Contact Method
            </label>
            <select
              value={value.preferredContactMethod || "email"}
              onChange={(e) =>
                onChange({ preferredContactMethod: e.target.value as any })
              }
              className="w-full px-4 py-3 border border-border rounded-lg bg-background text-foreground text-sm"
            >
              <option value="email">Email</option>
              <option value="phone">Phone</option>
              <option value="sms">SMS</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4">
          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">
              Business Information
            </label>
            <textarea
              rows={3}
              value={value.businessInfo || ""}
              onChange={(e) => onChange({ businessInfo: e.target.value })}
              className="w-full px-4 py-3 border border-border rounded-lg bg-background text-foreground text-sm resize-none"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">
              Business Contacts
            </label>
            <textarea
              rows={3}
              value={value.businessContacts || ""}
              onChange={(e) => onChange({ businessContacts: e.target.value })}
              className="w-full px-4 py-3 border border-border rounded-lg bg-background text-foreground text-sm resize-none"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">
              Financial Information
            </label>
            <textarea
              rows={3}
              value={value.financialInfo || ""}
              onChange={(e) => onChange({ financialInfo: e.target.value })}
              className="w-full px-4 py-3 border border-border rounded-lg bg-background text-foreground text-sm resize-none"
            />
          </div>
        </div>
      </div>

      <div className="pt-6 border-t border-border mt-6 flex flex-col sm:flex-row items-start gap-3">
        <Button
          disabled={isSaving || saveState === "saved"}
          onClick={handleSave}
          className={`${saveState === "saved" ? "bg-green-500 hover:bg-green-500/90" : "bg-primary hover:bg-primary/90"} text-white gap-2`}
        >
          {saveState === "saved" ? (
            <>
              <CheckCircle className="w-4 h-4" />
              Saved
            </>
          ) : isSaving ? (
            <>
              Saving...
              <Loader className="animate-spin w-4 h-4" />
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              Save Profile
            </>
          )}
        </Button>
        {/* <div className="text-sm text-muted-foreground">
          Updates are saved to your tenant profile immediately.
        </div> */}
      </div>

      <ImageUploadModal
        isOpen={isImageModalOpen}
        onClose={() => setIsImageModalOpen(false)}
        onImageUpload={handleImageUpload}
        title="Upload Profile Image"
        description="Choose an image to use as your profile picture"
      />
    </Card>
  );
}
function timeout(arg0: () => void, arg1: number) {
  throw new Error("Function not implemented.");
}
