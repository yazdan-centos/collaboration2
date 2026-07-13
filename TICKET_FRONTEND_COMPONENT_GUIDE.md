# Ticket React Component Integration Guide

This guide describes how frontend developers should design React components that interact with the ticket APIs.

Base API path examples assume the backend runs at `http://localhost:8080`.

## Authentication

All ticket endpoints require an authenticated user except public auth endpoints.

Send the JWT with each request:

```http
Authorization: Bearer <jwt>
```

Recommended frontend shape:

```ts
type AuthSession = {
  token: string;
  userId: number;
  roles: Array<"CUSTOMER" | "TEAM_MEMBER" | "TEAM_MANAGER">;
};
```

## Ticket Endpoints

| Use case | Method | Path | Roles |
| --- | --- | --- | --- |
| Create ticket | `POST` | `/api/tickets` | `CUSTOMER`, `TEAM_MANAGER` |
| List ticket summaries | `GET` | `/api/tickets` | `TEAM_MEMBER`, `TEAM_MANAGER` |
| Get full ticket | `GET` | `/api/tickets/{ticketId}` | `CUSTOMER`, `TEAM_MEMBER`, `TEAM_MANAGER` |
| Update ticket | `PUT` | `/api/tickets/{ticketId}` | `TEAM_MEMBER`, `TEAM_MANAGER` |
| Search tickets | `POST` | `/api/tickets/search?page=0&size=10&sortBy=createdAt&order=DESC` | authenticated |
| List ticket messages | `GET` | `/api/tickets/{ticketId}/messages` | `CUSTOMER`, `TEAM_MEMBER`, `TEAM_MANAGER` |
| Add ticket message, generic | `POST` | `/api/tickets/{ticketId}/messages` | `CUSTOMER`, `TEAM_MEMBER`, `TEAM_MANAGER` |
| Upload attachment, generic | `POST` | `/api/tickets/{ticketId}/attachments` | `CUSTOMER`, `TEAM_MEMBER`, `TEAM_MANAGER` |
| Delete attachment | `DELETE` | `/api/tickets/attachments/{attachmentId}` | `CUSTOMER`, `TEAM_MEMBER`, `TEAM_MANAGER` |
| Create message as team member | `POST` | `/api/team-members/tickets/{ticketId}/messages` | `TEAM_MEMBER` |
| Upload attachment as customer | `POST` | `/api/customers/tickets/{ticketId}/attachments` | `CUSTOMER` |

Prefer the role-specific endpoints for UI flows where the role is known:

| UI flow | Preferred endpoint |
| --- | --- |
| Team member replies to a ticket | `POST /api/team-members/tickets/{ticketId}/messages` |
| Customer uploads a file to their own ticket | `POST /api/customers/tickets/{ticketId}/attachments` |

The generic endpoints are still available for backward compatibility.

## Data Contracts

### TicketCreateRequest

```ts
type TicketCreateRequest = {
  title: string;
  description: string;
  customerId: number;
  slaContractId?: number | null;
  assignedMemberId?: number | null;
};
```

Example:

```json
{
  "title": "Cannot access dashboard",
  "description": "The dashboard shows a blank page after login.",
  "customerId": 15,
  "slaContractId": 3,
  "assignedMemberId": null
}
```

### TicketUpdateRequest

```ts
type TicketStatus =
  | "UNALLOCATED"
  | "ASSIGNED"
  | "IN_PROGRESS"
  | "CLOSED"
  | "RESOLVED";

type TicketUpdateRequest = {
  title?: string;
  description?: string;
  slaContractId?: number | null;
  assignedMemberId?: number | null;
  status?: TicketStatus;
  statusNote?: string;
};
```

### TicketResponse

```ts
type TicketResponse = {
  id: number;
  title: string;
  description: string;
  status: TicketStatus;
  customerId: number;
  slaContractId: number | null;
  assignedMemberId: number | null;
  createdAt: string;
  updatedAt: string;
  messages: TicketMessageResponse[];
  attachments: TicketAttachmentResponse[];
  statusHistory: TicketStatusHistoryResponse[];
};
```

### TicketSummaryResponse

```ts
type TicketSummaryResponse = {
  id: number;
  title: string;
  status: TicketStatus;
  customerId: number;
  assignedMemberId: number | null;
  createdAt: string;
};
```

### TicketMessageCreateRequest

```ts
type TicketMessageCreateRequest = {
  message: string;
};
```

### TicketMessageResponse

```ts
type TicketMessageResponse = {
  id: number;
  senderId: number;
  senderName: string;
  message: string;
  sentAt: string;
};
```

### TicketAttachmentResponse

```ts
type TicketAttachmentResponse = {
  id: number;
  ticketId: number;
  fileName: string;
  contentType: string | null;
  size: number;
  filePath: string;
  uploadedById: number;
  uploadedAt: string;
};
```

### TicketStatusHistoryResponse

```ts
type TicketStatusHistoryResponse = {
  id: number;
  oldStatus: TicketStatus | null;
  newStatus: TicketStatus;
  changedById: number;
  changedByName: string;
  note: string | null;
  changedAt: string;
};
```

### TicketSearchRequestDto

```ts
type UserType = "CUSTOMER" | "TEAM_MEMBER" | "TEAM_MANAGER";

type TicketSearchRequestDto = {
  title?: string;
  status?: TicketStatus;
  priority?: string;
  customerId?: number;
  assignedToId?: number;
  teamId?: number;
  createdFrom?: string;
  createdTo?: string;
  userType?: UserType;
  userId?: number;
};
```

The search endpoint returns a Spring `Page`.

```ts
type Page<T> = {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
  first: boolean;
  last: boolean;
};
```

For customers, search content is shaped like:

```ts
type CustomerTicketDto = {
  id: number;
  title: string;
  description: string;
  status: string;
  priority: string | null;
  createdAt: string;
  updatedAt: string;
};
```

For team users, search content is shaped like:

```ts
type TeamTicketDto = {
  id: number;
  title: string;
  description: string;
  status: string;
  priority: string | null;
  customerName: string | null;
  assignedToName: string | null;
  teamName: string | null;
  createdAt: string;
  updatedAt: string;
};
```

## API Client

Create a small API client module instead of calling `fetch` directly inside components.

```ts
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8080";

async function apiFetch<T>(
  path: string,
  token: string,
  init: RequestInit = {}
): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      ...(init.body instanceof FormData ? {} : { "Content-Type": "application/json" }),
      ...init.headers,
    },
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || `Request failed with status ${response.status}`);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}
```

### Ticket API Functions

```ts
export function getTicket(ticketId: number, token: string) {
  return apiFetch<TicketResponse>(`/api/tickets/${ticketId}`, token);
}

export function searchTickets(
  request: TicketSearchRequestDto,
  token: string,
  page = 0,
  size = 10,
  sortBy = "createdAt",
  order: "ASC" | "DESC" = "DESC"
) {
  const params = new URLSearchParams({
    page: String(page),
    size: String(size),
    sortBy,
    order,
  });

  return apiFetch<Page<CustomerTicketDto | TeamTicketDto>>(
    `/api/tickets/search?${params.toString()}`,
    token,
    {
      method: "POST",
      body: JSON.stringify(request),
    }
  );
}

export function createTicket(request: TicketCreateRequest, token: string) {
  return apiFetch<TicketResponse>("/api/tickets", token, {
    method: "POST",
    body: JSON.stringify(request),
  });
}

export function updateTicket(
  ticketId: number,
  request: TicketUpdateRequest,
  token: string
) {
  return apiFetch<TicketResponse>(`/api/tickets/${ticketId}`, token, {
    method: "PUT",
    body: JSON.stringify(request),
  });
}

export function createTeamMemberTicketMessage(
  ticketId: number,
  request: TicketMessageCreateRequest,
  token: string
) {
  return apiFetch<TicketMessageResponse>(
    `/api/team-members/tickets/${ticketId}/messages`,
    token,
    {
      method: "POST",
      body: JSON.stringify(request),
    }
  );
}

export function uploadCustomerTicketAttachment(
  ticketId: number,
  file: File,
  token: string
) {
  const formData = new FormData();
  formData.append("file", file);

  return apiFetch<TicketAttachmentResponse>(
    `/api/customers/tickets/${ticketId}/attachments`,
    token,
    {
      method: "POST",
      body: formData,
    }
  );
}
```

Do not set `Content-Type` manually for file upload. The browser must set the multipart boundary.

## Recommended Component Structure

Use role-aware containers and small leaf components.

```text
src/features/tickets/
  api/ticketsApi.ts
  components/TicketList.tsx
  components/TicketSearchBar.tsx
  components/TicketDetail.tsx
  components/TicketMessageThread.tsx
  components/TeamMemberReplyComposer.tsx
  components/CustomerAttachmentUploader.tsx
  components/TicketStatusEditor.tsx
  hooks/useTicket.ts
  hooks/useTicketSearch.ts
```

### `TicketList`

Responsibilities:

- Render paginated search results.
- Support filters for title, status, customer, assignee, and created date range.
- Navigate to a ticket detail view.
- Do not fetch message bodies for every row; use summary/search data.

### `TicketDetail`

Responsibilities:

- Fetch `GET /api/tickets/{ticketId}`.
- Render title, description, status, customer, assignee, SLA, messages, attachments, and status history.
- Choose child actions based on user role.

Role behavior:

| Role | Visible actions |
| --- | --- |
| `CUSTOMER` | upload attachment, view messages, optionally create generic message if UI supports it |
| `TEAM_MEMBER` | create team-member reply, update ticket if allowed by product flow |
| `TEAM_MANAGER` | assign/update ticket, view all details |

### `TeamMemberReplyComposer`

Use this component for the required team-member message flow.

Behavior:

- Show only for users with `TEAM_MEMBER`.
- Disable submit while request is pending.
- Trim message client-side and block empty messages.
- On success, append the returned `TicketMessageResponse` to the thread or refetch the ticket.

Example:

```tsx
function TeamMemberReplyComposer({
  ticketId,
  token,
  onCreated,
}: {
  ticketId: number;
  token: string;
  onCreated: (message: TicketMessageResponse) => void;
}) {
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    const trimmed = message.trim();
    if (!trimmed) {
      return;
    }

    setIsSubmitting(true);
    try {
      const created = await createTeamMemberTicketMessage(
        ticketId,
        { message: trimmed },
        token
      );
      setMessage("");
      onCreated(created);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <textarea
        value={message}
        onChange={(event) => setMessage(event.target.value)}
        placeholder="Write a reply to the customer"
      />
      <button type="submit" disabled={isSubmitting || !message.trim()}>
        {isSubmitting ? "Sending..." : "Send reply"}
      </button>
    </form>
  );
}
```

### `CustomerAttachmentUploader`

Use this component for the required customer upload flow.

Behavior:

- Show only for users with `CUSTOMER`.
- Use a single `file` field in `FormData`.
- Validate file presence client-side.
- Consider enforcing frontend size/type limits if product requirements define them.
- On success, append the returned `TicketAttachmentResponse` or refetch the ticket.

Example:

```tsx
function CustomerAttachmentUploader({
  ticketId,
  token,
  onUploaded,
}: {
  ticketId: number;
  token: string;
  onUploaded: (attachment: TicketAttachmentResponse) => void;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    if (!file) {
      return;
    }

    setIsUploading(true);
    try {
      const uploaded = await uploadCustomerTicketAttachment(ticketId, file, token);
      setFile(null);
      onUploaded(uploaded);
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="file"
        onChange={(event) => setFile(event.currentTarget.files?.[0] ?? null)}
      />
      <button type="submit" disabled={isUploading || !file}>
        {isUploading ? "Uploading..." : "Upload file"}
      </button>
    </form>
  );
}
```

## State Management Guidance

For a small app, local component state plus custom hooks is enough.

Recommended hooks:

```ts
function useTicket(ticketId: number, token: string) {
  // GET /api/tickets/{ticketId}
}

function useTicketSearch(filters: TicketSearchRequestDto, token: string) {
  // POST /api/tickets/search
}
```

If the app already uses TanStack Query, model these operations as:

| Operation | Query key or mutation |
| --- | --- |
| Ticket detail | `["ticket", ticketId]` |
| Ticket search | `["tickets", filters, page, size, sortBy, order]` |
| Create team-member message | mutation invalidates `["ticket", ticketId]` |
| Upload customer attachment | mutation invalidates `["ticket", ticketId]` |
| Update ticket | mutation invalidates ticket detail and list/search queries |

## Error Handling

Common status codes:

| Status | Meaning | UI behavior |
| --- | --- | --- |
| `400` | Validation error or invalid request | Show field-level or form-level error |
| `401` | Missing or expired token | Redirect to login or refresh session |
| `403` | Authenticated but wrong role or not owner | Show "You do not have access to this action" |
| `404` | Ticket, sender, uploader, or attachment not found | Show not-found state |
| `500` | Server error, including storage failure | Show retry option |

For customer uploads, a `403` can mean the authenticated customer tried to upload to a ticket they do not own.

For team-member message creation, a `403` can mean the authenticated user is not a team member.

## UX Requirements

Recommended behavior:

- Disable submit buttons while requests are pending.
- Optimistically append messages only if the app can roll back on failure; otherwise refetch after success.
- Show uploaded file name, size, content type, and upload time.
- Format dates from ISO strings using the user's locale.
- Preserve search filters in URL query params for shareable list views.
- Keep role-specific actions hidden if the role does not match.

## Minimal Screen Flows

### Customer Uploads File

1. Customer opens `TicketDetail`.
2. UI fetches `GET /api/tickets/{ticketId}`.
3. UI shows `CustomerAttachmentUploader`.
4. Customer selects a file.
5. UI sends `POST /api/customers/tickets/{ticketId}/attachments` with multipart `file`.
6. UI appends the returned attachment or refetches the ticket.

### Team Member Creates Message

1. Team member opens `TicketDetail`.
2. UI fetches `GET /api/tickets/{ticketId}`.
3. UI shows `TeamMemberReplyComposer`.
4. Team member enters a non-empty message.
5. UI sends `POST /api/team-members/tickets/{ticketId}/messages`.
6. UI appends the returned message or refetches the ticket.

## Manual Test Checklist

- Customer can upload a file to their own ticket.
- Customer gets a `403` when uploading to another customer's ticket.
- Team member can create a message using the team-member endpoint.
- Customer cannot call the team-member message endpoint.
- Empty message is blocked by the UI and rejected by backend validation.
- Empty file upload is blocked by the UI and rejected by backend validation.
- Ticket detail updates after successful message or attachment creation.
