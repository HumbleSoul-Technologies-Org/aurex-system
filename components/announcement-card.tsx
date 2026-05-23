import React from "react";
import { Mail, MailOpen } from "lucide-react";

interface AnnouncementCardProps {
  announcement: {
    id: string;
    title?: string;
    message: string;
    sentAt?: string;
    readBy?: string[];
    isRead?: boolean;
    propertyId?: string;
  };
  onClick?: () => void;
}

export default function AnnouncementCard({
  announcement,
  onClick,
}: AnnouncementCardProps) {
  return (
    <div
      onClick={onClick}
      className={`p-3 border rounded-md cursor-pointer transition-colors ${
        announcement.isRead
          ? "bg-white border-gray-200 hover:bg-gray-50"
          : "bg-yellow-50 border-yellow-200"
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          {announcement.isRead ? (
            <MailOpen className="w-4 h-4 text-muted-foreground" />
          ) : (
            <Mail className="w-4 h-4 text-blue-600" />
          )}
          <div className="flex-1 min-w-0">
            <div className="font-medium text-sm truncate">
              {announcement.title || "Announcement"}
            </div>
            <div className="text-xs text-gray-700 truncate mt-1">
              {announcement.message.substring(0, 120)}
            </div>
          </div>
        </div>
      </div>
      <div className="text-xs text-gray-400 mt-1">
        {announcement.sentAt
          ? new Date(announcement.sentAt).toLocaleString()
          : ""}
      </div>
    </div>
  );
}
