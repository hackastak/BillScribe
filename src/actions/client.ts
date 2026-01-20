"use server";

import { createClient } from "@/lib/supabase/server";
import { clientSchema } from "@/lib/validations/invoice";
import { createClient as createDbClient } from "@/lib/db/queries/clients";

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

    return { success: true, client };
  } catch (error) {
    console.error("Error creating client:", error);
    return { error: "Failed to create client. Please try again." };
  }
}
