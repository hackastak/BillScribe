import { db } from "@/lib/db";
import { clients } from "@/lib/db/schema";
import { eq, and, or, ilike, sql, desc, asc } from "drizzle-orm";
import type { ClientStatus } from "@/lib/db/schema/clients";

export type Client = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  company: string | null;
  address: string | null;
  notes: string | null;
  status: ClientStatus;
  createdAt: Date;
  updatedAt: Date;
};

export type ClientFilterParams = {
  query?: string;
  status?: string;
  sort?: string;
  page?: number;
  pageSize?: number;
};

export type PaginatedClients = {
  data: Client[];
  metadata: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  };
};

export async function getClients(userId: string): Promise<Client[]> {
  const result = await db
    .select({
      id: clients.id,
      name: clients.name,
      email: clients.email,
      phone: clients.phone,
      company: clients.company,
      address: clients.address,
      notes: clients.notes,
      status: clients.status,
      createdAt: clients.createdAt,
      updatedAt: clients.updatedAt,
    })
    .from(clients)
    .where(eq(clients.userId, userId))
    .orderBy(clients.name);

  return result;
}

export async function getActiveClients(userId: string): Promise<Client[]> {
  const result = await db
    .select({
      id: clients.id,
      name: clients.name,
      email: clients.email,
      phone: clients.phone,
      company: clients.company,
      address: clients.address,
      notes: clients.notes,
      status: clients.status,
      createdAt: clients.createdAt,
      updatedAt: clients.updatedAt,
    })
    .from(clients)
    .where(and(eq(clients.userId, userId), eq(clients.status, "active")))
    .orderBy(clients.name);

  return result;
}

export async function getClientsPaginated(
  userId: string,
  params: ClientFilterParams
): Promise<PaginatedClients> {
  const page = params.page || 1;
  const pageSize = params.pageSize || 10;
  const offset = (page - 1) * pageSize;

  // Build conditions
  const conditions = [eq(clients.userId, userId)];

  if (params.status && params.status !== "all") {
    conditions.push(eq(clients.status, params.status as ClientStatus));
  }

  if (params.query) {
    const search = `%${params.query}%`;
    conditions.push(
      or(
        ilike(clients.name, search),
        ilike(clients.email, search),
        ilike(clients.company, search)
      )!
    );
  }

  // Count total
  const countResult = await db
    .select({ count: sql<number>`count(*)` })
    .from(clients)
    .where(and(...conditions));

  const total = Number(countResult[0]?.count || 0);
  const totalPages = Math.ceil(total / pageSize);

  // Determine sort order
  let orderBy;
  switch (params.sort) {
    case "name-asc":
      orderBy = asc(clients.name);
      break;
    case "name-desc":
      orderBy = desc(clients.name);
      break;
    case "created-asc":
      orderBy = asc(clients.createdAt);
      break;
    case "created-desc":
      orderBy = desc(clients.createdAt);
      break;
    default:
      orderBy = asc(clients.name);
  }

  // Fetch data
  const result = await db
    .select({
      id: clients.id,
      name: clients.name,
      email: clients.email,
      phone: clients.phone,
      company: clients.company,
      address: clients.address,
      notes: clients.notes,
      status: clients.status,
      createdAt: clients.createdAt,
      updatedAt: clients.updatedAt,
    })
    .from(clients)
    .where(and(...conditions))
    .orderBy(orderBy)
    .limit(pageSize)
    .offset(offset);

  return {
    data: result,
    metadata: {
      total,
      page,
      pageSize,
      totalPages,
    },
  };
}

export async function getClientById(
  userId: string,
  clientId: string
): Promise<Client | null> {
  const result = await db
    .select({
      id: clients.id,
      name: clients.name,
      email: clients.email,
      phone: clients.phone,
      company: clients.company,
      address: clients.address,
      notes: clients.notes,
      status: clients.status,
      createdAt: clients.createdAt,
      updatedAt: clients.updatedAt,
    })
    .from(clients)
    .where(and(eq(clients.id, clientId), eq(clients.userId, userId)));

  return result[0] || null;
}

export type CreateClientData = {
  name: string;
  email?: string;
  phone?: string;
  company?: string;
  address?: string;
  notes?: string;
};

export async function createClient(
  userId: string,
  data: CreateClientData
): Promise<Client> {
  const result = await db
    .insert(clients)
    .values({
      userId,
      name: data.name,
      email: data.email || null,
      phone: data.phone || null,
      company: data.company || null,
      address: data.address || null,
      notes: data.notes || null,
      status: "active",
    })
    .returning({
      id: clients.id,
      name: clients.name,
      email: clients.email,
      phone: clients.phone,
      company: clients.company,
      address: clients.address,
      notes: clients.notes,
      status: clients.status,
      createdAt: clients.createdAt,
      updatedAt: clients.updatedAt,
    });

  if (!result[0]) {
    throw new Error("Failed to create client");
  }

  return result[0];
}

export type UpdateClientData = Partial<CreateClientData>;

export async function updateClient(
  userId: string,
  clientId: string,
  data: UpdateClientData
): Promise<Client> {
  const result = await db
    .update(clients)
    .set({
      ...(data.name !== undefined && { name: data.name }),
      ...(data.email !== undefined && { email: data.email || null }),
      ...(data.phone !== undefined && { phone: data.phone || null }),
      ...(data.company !== undefined && { company: data.company || null }),
      ...(data.address !== undefined && { address: data.address || null }),
      ...(data.notes !== undefined && { notes: data.notes || null }),
      updatedAt: new Date(),
    })
    .where(and(eq(clients.id, clientId), eq(clients.userId, userId)))
    .returning({
      id: clients.id,
      name: clients.name,
      email: clients.email,
      phone: clients.phone,
      company: clients.company,
      address: clients.address,
      notes: clients.notes,
      status: clients.status,
      createdAt: clients.createdAt,
      updatedAt: clients.updatedAt,
    });

  if (!result[0]) {
    throw new Error("Client not found or unauthorized");
  }

  return result[0];
}

export async function getActiveClientCount(userId: string): Promise<number> {
  const result = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(clients)
    .where(and(eq(clients.userId, userId), eq(clients.status, "active")));

  return result[0]?.count ?? 0;
}

export async function toggleClientStatus(
  userId: string,
  clientId: string
): Promise<Client> {
  // First get the current status
  const current = await getClientById(userId, clientId);
  if (!current) {
    throw new Error("Client not found or unauthorized");
  }

  const newStatus: ClientStatus = current.status === "active" ? "inactive" : "active";

  const result = await db
    .update(clients)
    .set({
      status: newStatus,
      updatedAt: new Date(),
    })
    .where(and(eq(clients.id, clientId), eq(clients.userId, userId)))
    .returning({
      id: clients.id,
      name: clients.name,
      email: clients.email,
      phone: clients.phone,
      company: clients.company,
      address: clients.address,
      notes: clients.notes,
      status: clients.status,
      createdAt: clients.createdAt,
      updatedAt: clients.updatedAt,
    });

  if (!result[0]) {
    throw new Error("Failed to update client status");
  }

  return result[0];
}
