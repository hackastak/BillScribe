"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { clientSchema } from "@/lib/validations/invoice";
import {
  createClient as createDbClient,
  updateClient as updateDbClient,
  toggleClientStatus as toggleDbClientStatus,
  getClientById,
} from "@/lib/db/queries/clients";
import {
  getClientInvoiceStats,
  type ClientInvoiceStats,
} from "@/lib/db/queries/invoices";
import { canCreateClient } from "@/lib/subscriptions/usage";
import type { ClientStatus } from "@/lib/db/schema/clients";

export type ClientActionState = {
  error?: string;
  success?: boolean;
  client?: {
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
  fieldErrors?: Record<string, string[]>;
};

export async function createClientAction(
  prevState: ClientActionState,
  formData: FormData
): Promise<ClientActionState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You must be logged in to create a client" };
  }

  // Check subscription limits
  const limitCheck = await canCreateClient(user.id);
  if (!limitCheck.allowed) {
    return { error: limitCheck.reason };
  }

  const rawData = {
    name: formData.get("name")?.toString() || "",
    email: formData.get("email")?.toString() || "",
    phone: formData.get("phone")?.toString() || "",
    company: formData.get("company")?.toString() || "",
    address: formData.get("address")?.toString() || "",
  };

  const validated = clientSchema.safeParse(rawData);
  if (!validated.success) {
    return {
      fieldErrors: validated.error.flatten().fieldErrors as Record<
        string,
        string[]
      >,
    };
  }

  try {
    const client = await createDbClient(user.id, {
      name: validated.data.name,
      email: validated.data.email || undefined,
      phone: validated.data.phone || undefined,
      company: validated.data.company || undefined,
      address: validated.data.address || undefined,
    });

    revalidatePath("/clients");
    return { success: true, client };
  } catch (error) {
    console.error("Error creating client:", error);
    return { error: "Failed to create client. Please try again." };
  }
}

export async function updateClientAction(
  prevState: ClientActionState,
  formData: FormData
): Promise<ClientActionState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You must be logged in to update a client" };
  }

  const clientId = formData.get("clientId")?.toString();
  if (!clientId) {
    return { error: "Client ID is required" };
  }

  const rawData = {
    name: formData.get("name")?.toString() || "",
    email: formData.get("email")?.toString() || "",
    phone: formData.get("phone")?.toString() || "",
    company: formData.get("company")?.toString() || "",
    address: formData.get("address")?.toString() || "",
    notes: formData.get("notes")?.toString() || "",
  };

  const validated = clientSchema.safeParse(rawData);
  if (!validated.success) {
    return {
      fieldErrors: validated.error.flatten().fieldErrors as Record<
        string,
        string[]
      >,
    };
  }

  try {
    const client = await updateDbClient(user.id, clientId, {
      name: validated.data.name,
      email: validated.data.email || undefined,
      phone: validated.data.phone || undefined,
      company: validated.data.company || undefined,
      address: validated.data.address || undefined,
      notes: rawData.notes || undefined,
    });

    revalidatePath("/clients");
    revalidatePath(`/clients/${clientId}/edit`);
    return { success: true, client };
  } catch (error) {
    console.error("Error updating client:", error);
    return { error: "Failed to update client. Please try again." };
  }
}

export async function toggleClientStatusAction(
  clientId: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "You must be logged in" };
  }

  try {
    // Check current status to determine if we're activating
    const client = await getClientById(user.id, clientId);
    if (!client) {
      return { success: false, error: "Client not found" };
    }

    // If reactivating an inactive client, check subscription limits
    if (client.status === "inactive") {
      const limitCheck = await canCreateClient(user.id);
      if (!limitCheck.allowed) {
        return { success: false, error: limitCheck.reason };
      }
    }

    await toggleDbClientStatus(user.id, clientId);
    revalidatePath("/clients");
    return { success: true };
  } catch (error) {
    console.error("Error toggling client status:", error);
    return { success: false, error: "Failed to update client status" };
  }
}

export async function getClientInvoiceStatsAction(
  clientId: string
): Promise<ClientInvoiceStats | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  try {
    const stats = await getClientInvoiceStats(user.id, clientId);
    return stats;
  } catch (error) {
    console.error("Error fetching client invoice stats:", error);
    return null;
  }
}
