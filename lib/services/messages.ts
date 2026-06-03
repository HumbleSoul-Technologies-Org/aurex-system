import { apiRequest } from "@/lib/query-client";
import type { TenantMessage } from "@/lib/tenant-context-types";

/**
 * Message nested schema (for new Conversation structure)
 */
export interface ConversationMessage {
  _id?: string;
  id?: string;
  category: "message" | "announcement";
  fromUserId: string;
  toUserId: string;
  toUserName?: string;
  message: string;
  sentAt: string;
  seenBy: string[]; // array of user IDs who have seen this
  replies: ConversationReply[];
}

export interface ConversationReply {
  _id?: string;
  id?: string;
  messageId: string;
  fromUserId: string;
  toUserId: string;
  message: string;
  sentAt: string;
}

export interface PropertyInfo {
  _id?: string;
  id?: string;
  name?: string;
  address?: string;
  [key: string]: any;
}

export type UserReference =
  | string
  | {
      _id?: string;
      id?: string;
      name?: string;
      email?: string;
      [key: string]: any;
    };

export type PropertyReference = string | PropertyInfo;

export interface PropertyConversation {
  _id?: string;
  id?: string;
  propertyId: PropertyReference;
  messages: ConversationMessage[];
}

export interface Conversation {
  _id?: string;
  id?: string;
  ownerId: string;
  propertyId: PropertyReference;
  participants: string[];
  conversations: PropertyConversation[];
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Legacy MessageRecord for backward compatibility
 */
export interface MessageRecord {
  id: string;
  fromUserId?: string;
  toUserId?: string;
  tenantId?: string;
  propertyId?: string;
  to?: string;
  subject?: string;
  message: string;
  seen?: boolean;
  replyId?: string;
  createdBy?: string;
  createdAt?: string;
  updatedAt?: string;
}

// ============ NEW NESTED CONVERSATION ENDPOINTS ============

function getPropertyRefId(propertyId: PropertyReference | undefined): string {
  if (!propertyId) return "";
  return typeof propertyId === "string"
    ? propertyId
    : propertyId.id || propertyId._id || "";
}

function getMessageRecipientName(userRef: any): string {
  if (!userRef) return "";
  if (typeof userRef === "string") return "";
  return userRef.name || userRef.email || userRef.id || userRef._id || "";
}

function getSingleMessageRecipientId(message: any): string {
  if (!message) return "";
  if (Array.isArray(message.toUserId)) {
    const first = message.toUserId.find((item: any) => !!item);
    return getUserRefId(first);
  }
  return getUserRefId(message.toUserId);
}

export async function getTenantPropertyMessages(
  tenantId: string,
  ownerId: string,
  propertyId: string,
  token?: string | null,
): Promise<ConversationMessage[]> {
  try {
    const tenantConversations = await getConversationsByTenant(tenantId, token);
    const filteredTenantConversations = tenantConversations.filter(
      (conv) => getPropertyRefId(conv.propertyId) === propertyId,
    );

    if (filteredTenantConversations.length > 0) {
      return (
        filteredTenantConversations.flatMap((conv) =>
          conv.conversations.flatMap(
            (propertyConv) => propertyConv?.messages || [],
          ),
        ) || []
      );
    }
  } catch (err) {
    console.debug(
      "getTenantPropertyMessages: tenant-level fetch failed, falling back",
      err,
    );
  }

  try {
    const conversation = await getConversationByProperty(
      ownerId,
      propertyId,
      token,
    );

    if (!conversation) {
      console.debug(`No conversation found for property ${propertyId}`);
      return [];
    }

    const filteredConversationsByProperty = conversation.conversations.filter(
      (conv) => getPropertyRefId(conv.propertyId) === propertyId,
    );

    return (
      filteredConversationsByProperty.flatMap((conv) => conv?.messages) || []
    );
  } catch (err) {
    console.debug(
      "getTenantPropertyMessages: property fetch failed, falling back",
      err,
    );
    return [];
  }
}

/**
 * Helper: fetch tenant-scoped messages for a property and map to a UI-friendly shape.
 * Returns an array of plain objects suitable for the tenant messages UI.
 */
export async function getTenantPropertyMessagesForUI(
  tenantId: string,
  ownerId: string,
  propertyId: string,
  token?: string | null,
): Promise<TenantMessage[]> {
  const convMessages = await getTenantPropertyMessages(
    tenantId,
    ownerId,
    propertyId,
    token,
  );
  return (convMessages || []).map((msg: any) => {
    const fromUserId = getUserRefId(msg.fromUserId);
    const toUserId = getSingleMessageRecipientId(msg);
    const toUserName = getMessageRecipientName(msg.toUserId);
    const isTenantSender = fromUserId === tenantId;
    const senderType: "tenant" | "manager" = isTenantSender
      ? "tenant"
      : "manager";
    const isRead = Array.isArray(msg.seenBy)
      ? msg.seenBy.includes(tenantId)
      : false;

    return {
      id: msg._id || msg.id || "",
      sender: fromUserId,
      fromUserId,
      toUserId,
      toUserName,
      senderType,
      content: msg.message || "",
      timestamp: msg.sentAt || "",
      isRead,
      sent: isTenantSender,
      replied: Array.isArray(msg.replies) ? msg.replies.length > 0 : false,
      subject: msg.category === "announcement" ? "Announcement" : undefined,
      isStarred: false,
      isArchived: false,
      type: msg.category === "announcement" ? "announcement" : "message",
      originalId: msg._id || msg.id,
      propertyId: msg.propertyId || "",
    };
  });
}

function getUserRefId(userRef: UserReference | undefined): string {
  if (!userRef) return "";
  return typeof userRef === "string"
    ? userRef
    : userRef.id || userRef._id || "";
}

function normalizeConversationReply(reply: any): ConversationReply {
  return {
    ...reply,
    messageId: reply.messageId || reply.id || "",
    fromUserId: getUserRefId(reply.fromUserId),
    toUserId: getUserRefId(reply.toUserId),
    message: reply.message || "",
    sentAt: reply.sentAt || "",
  };
}

function normalizeConversationMessage(message: any): ConversationMessage {
  const fromUserId = getUserRefId(message.fromUserId);
  const toUserId = getSingleMessageRecipientId(message);
  const toUserName = getMessageRecipientName(message.toUserId);
  const seenBy = Array.isArray(message.seenBy)
    ? message.seenBy.map(getUserRefId).filter(Boolean)
    : [];

  return {
    ...message,
    fromUserId,
    toUserId,
    toUserName,
    seenBy,
    replies: Array.isArray(message.replies)
      ? message.replies.map(normalizeConversationReply)
      : [],
    message: message.message || "",
    sentAt: message.sentAt || "",
  };
}

function normalizeConversation(conv: any): Conversation {
  const normalizedPropertyId: PropertyReference = conv.propertyId
    ? typeof conv.propertyId === "string"
      ? conv.propertyId
      : {
          ...conv.propertyId,
          id: conv.propertyId.id || conv.propertyId._id || undefined,
        }
    : "";

  const participants = Array.isArray(conv.participants)
    ? conv.participants
        .map((participant: any) =>
          typeof participant === "string"
            ? participant
            : participant?.id || participant?._id || "",
        )
        .filter(Boolean)
    : [];

  const conversations = Array.isArray(conv.conversations)
    ? conv.conversations.map((conversation: any) => ({
        ...conversation,
        propertyId: conversation.propertyId
          ? typeof conversation.propertyId === "string"
            ? conversation.propertyId
            : {
                ...conversation.propertyId,
                id:
                  conversation.propertyId.id ||
                  conversation.propertyId._id ||
                  undefined,
              }
          : "",
        messages: Array.isArray(conversation.messages)
          ? conversation.messages.map(normalizeConversationMessage)
          : [],
      }))
    : [];

  return {
    ...conv,
    propertyId: normalizedPropertyId,
    participants,
    conversations,
  };
}

function normalizeConversationResponse(response: any): Conversation[] {
  if (!response) return [];
  const list = Array.isArray(response) ? response : [response];
  return list.map(normalizeConversation);
}

/**
 * Get all conversations for an owner (admin)
 */
export async function getConversationsByOwner(
  ownerId: string,
  token?: string | null,
) {
  const res = await apiRequest(
    "GET",
    `/messages/owner/${ownerId}/all`,
    undefined,
    token ?? undefined,
  );
  const json = await res.json();
  return normalizeConversationResponse(json);
}

export async function getConversationsByTenant(
  tenantId: string,
  token?: string | null,
) {
  const res = await apiRequest(
    "GET",
    `/messages/tenant/${tenantId}/conversations`,
    undefined,
    token ?? undefined,
  );
  const json = await res.json();
  return normalizeConversationResponse(json);
}

/**
 * Get conversation for a specific property
 */
export async function getConversationByProperty(
  ownerId: string,
  propertyId: string,
  token?: string | null,
) {
  // Try to reuse the owner's conversations list first to avoid duplicate
  // requests when the caller already needs the full set.
  try {
    const ownerConvs = await getConversationsByOwner(ownerId, token);
    const match = ownerConvs.find(
      (c) => getPropertyRefId(c.propertyId) === propertyId,
    );
    if (match) return match;
  } catch (err) {
    // If owner-level fetch fails, fall back to the single-property endpoint.
    // Do not rethrow here â€” we'll attempt the direct fetch below.
    // eslint-disable-next-line no-console
    console.debug(
      "getConversationByProperty: owner fetch failed, falling back",
      err,
    );
  }

  const res = await apiRequest(
    "GET",
    `/messages/owner/${ownerId}/property/${propertyId}`,
    undefined,
    token ?? undefined,
  );
  const json = await res.json();
  console.debug("getConversationByProperty: fetched conversation", json);
  const convs = normalizeConversationResponse(json);
  return convs[0] ?? null;
}

/**
 * Create a message in a property conversation
 */
export async function createConversationMessage(
  ownerId: string,
  propertyId: string,
  payload: {
    category?: "message" | "announcement";
    fromUserId: string;
    toUserId: string;
    message: string;
  },
  token?: string | null,
) {
  const res = await apiRequest(
    "POST",
    `/messages/owner/${ownerId}/property/${propertyId}/create`,
    payload,
    token ?? undefined,
  );
  const json = await res.json();
  return json;
}

/**
 * Create a reply to a message
 */
export async function createConversationReply(
  ownerId: string,
  propertyId: string,
  messageId: string,
  payload: {
    fromUserId: string;
    toUserId: string;
    message: string;
  },
  token?: string | null,
) {
  const res = await apiRequest(
    "POST",
    `/messages/owner/${ownerId}/property/${propertyId}/${messageId}/reply`,
    payload,
    token ?? undefined,
  );
  const json = await res.json();
  return json;
}

/**
 * Mark a message as seen by a user
 */
export async function markConversationMessageSeen(
  ownerId: string,
  propertyId: string,
  messageId: string,
  userId: string,
  token?: string | null,
) {
  const res = await apiRequest(
    "PUT",
    `/messages/owner/${ownerId}/property/${propertyId}/${messageId}/seen`,
    { userId },
    token ?? undefined,
  );
  const json = await res.json();
  return json;
}

/**
 * Delete a message from a conversation
 */
export async function deleteConversationMessage(
  ownerId: string,
  propertyId: string,
  messageId: string,
  token?: string | null,
) {
  const res = await apiRequest(
    "DELETE",
    `/messages/owner/${ownerId}/property/${propertyId}/${messageId}`,
    undefined,
    token ?? undefined,
  );
  const json = await res.json();
  return json;
}

/**
 * Delete a reply from a message
 */
export async function deleteConversationReply(
  ownerId: string,
  propertyId: string,
  messageId: string,
  replyId: string,
  token?: string | null,
) {
  const res = await apiRequest(
    "DELETE",
    `/messages/owner/${ownerId}/property/${propertyId}/${messageId}/reply/${replyId}`,
    undefined,
    token ?? undefined,
  );
  const json = await res.json();
  return json;
}

// ============ LEGACY ENDPOINTS (BACKWARD COMPATIBILITY) ============

/**
 * Legacy: Get all messages for a tenant
 */
export async function getMessagesByTenant(
  tenantId: string,
  token?: string | null,
) {
  const res = await apiRequest(
    "GET",
    `/messages/tenant/${tenantId}/all`,
    undefined,
    token ?? undefined,
  );
  const json = await res.json();
  return (json || []).map((m: any) => ({
    ...m,
    id: m.id || m._id,
    fromUserId: getUserRefId(m.fromUserId),
    toUserId: Array.isArray(m.toUserId)
      ? getSingleMessageRecipientId(m)
      : getUserRefId(m.toUserId),
    seenBy: Array.isArray(m.seenBy)
      ? m.seenBy.map(getUserRefId).filter(Boolean)
      : [],
  })) as ConversationMessage[];
}

/**
 * Legacy: Create message (deprecated; use createConversationMessage)
 */
export async function createMessageApi(
  payload: Partial<MessageRecord>,
  token?: string | null,
) {
  // Map legacy payload to new structure if needed
  const newPayload = {
    category: "message" as const,
    fromUserId: payload.fromUserId || "",
    toUserId: payload.toUserId || "",
    message: payload.message || "",
  };
  // This will fail without ownerId and propertyId; recommend using createConversationMessage instead
  console.warn(
    "createMessageApi is deprecated; use createConversationMessage instead",
  );
  return newPayload;
}

/**
 * Legacy: Get single message by ID
 */
export async function getMessageById(id: string, token?: string | null) {
  console.warn(
    "getMessageById is deprecated; use getConversationByProperty instead",
  );
  return null as any;
}

/**
 * Legacy: Update message
 */
export async function updateMessageApi(
  id: string,
  patch: Partial<MessageRecord>,
  token?: string | null,
) {
  console.warn(
    "updateMessageApi is deprecated; use markConversationMessageSeen instead",
  );
  return null as any;
}

/**
 * Legacy: Delete message
 */
export async function deleteMessageApi(id: string, token?: string | null) {
  console.warn(
    "deleteMessageApi is deprecated; use deleteConversationMessage instead",
  );
  return null as any;
}

/**
 * Legacy: Create reply
 */
export async function createReplyApi(
  messageId: string,
  payload: { reply: string; createdBy?: string },
  token?: string | null,
) {
  console.warn(
    "createReplyApi is deprecated; use createConversationReply instead",
  );
  return null as any;
}

/**
 * Legacy: Get replies for message
 */
export async function getRepliesForMessage(
  messageId: string,
  token?: string | null,
) {
  console.warn(
    "getRepliesForMessage is deprecated; replies are embedded in messages",
  );
  return [] as ConversationReply[];
}
