"use server";

import { createClient } from "@/lib/supabase/server";
import { updateProfile } from "@/lib/db/queries/profiles";
import { z } from "zod";

const profileSchema = z.object({
  fullName: z.string().optional(),
  companyName: z.string().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
});

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
