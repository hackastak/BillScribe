"use server";

import { createClient } from "@/lib/supabase/server";
import { updateProfile } from "@/lib/db/queries/profiles";
import { canUseTemplate } from "@/lib/subscriptions/usage";
import { z } from "zod";
import type { InvoiceTemplate } from "@/lib/db/schema/profiles";

const profileSchema = z.object({
  fullName: z.string().optional(),
  companyName: z.string().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
});

const validTemplates = ["default", "classic", "simple", "modern", "professional", "creative"] as const;

export type ProfileActionState = {
  error?: string;
  success?: boolean;
  fieldErrors?: Record<string, string[]>;
};

export async function updateProfileAction(
  prevState: ProfileActionState,
  formData: FormData
): Promise<ProfileActionState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You must be logged in to update your profile" };
  }

  const rawData = {
    fullName: formData.get("fullName")?.toString() || "",
    companyName: formData.get("companyName")?.toString() || "",
    phone: formData.get("phone")?.toString() || "",
    address: formData.get("address")?.toString() || "",
  };

  const validated = profileSchema.safeParse(rawData);
  if (!validated.success) {
    return {
      fieldErrors: validated.error.flatten().fieldErrors as Record<
        string,
        string[]
      >,
    };
  }

  try {
    await updateProfile(user.id, {
      fullName: validated.data.fullName || undefined,
      companyName: validated.data.companyName || undefined,
      phone: validated.data.phone || undefined,
      address: validated.data.address || undefined,
    });

    return { success: true };
  } catch (error) {
    console.error("Error updating profile:", error);
    return { error: "Failed to update profile. Please try again." };
  }
}

export type TemplateActionState = {
  error?: string;
  success?: boolean;
};

export async function updateInvoiceTemplateAction(
  template: InvoiceTemplate
): Promise<TemplateActionState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You must be logged in to update your template" };
  }

  if (!validTemplates.includes(template)) {
    return { error: "Invalid template selected" };
  }

  // Check if user has access to this template
  const accessCheck = await canUseTemplate(user.id, template);
  if (!accessCheck.allowed) {
    return { error: accessCheck.reason || "You don't have access to this template" };
  }

  try {
    await updateProfile(user.id, {
      invoiceTemplate: template,
    });

    return { success: true };
  } catch (error) {
    console.error("Error updating invoice template:", error);
    return { error: "Failed to update template. Please try again." };
  }
}
