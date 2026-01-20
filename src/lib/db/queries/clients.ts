import { db } from "@/lib/db";
import { clients } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export type Client = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  company: string | null;
  address: string | null;
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
    })
    .from(clients)
    .where(eq(clients.userId, userId))
    .orderBy(clients.name);

  return result;
}

export type CreateClientData = {
  name: string;
  email?: string;
  phone?: string;
  company?: string;
  address?: string;
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
    })
    .returning({
      id: clients.id,
      name: clients.name,
      email: clients.email,
      phone: clients.phone,
      company: clients.company,
      address: clients.address,
    });

  if (!result[0]) {
    throw new Error("Failed to create client");
  }

  return result[0];
}
