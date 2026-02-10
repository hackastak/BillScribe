import { db } from "@/lib/db";
import { profiles } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import type { InvoiceTemplate } from "@/lib/db/schema/profiles";

export type Profile = {
  id: string;
  email: string;
  fullName: string | null;
  companyName: string | null;
  phone: string | null;
  address: string | null;
  logoUrl: string | null;
  invoiceTemplate: InvoiceTemplate | null;
};

export async function getProfile(userId: string): Promise<Profile | null> {
  const result = await db
    .select({
      id: profiles.id,
      email: profiles.email,
      fullName: profiles.fullName,
      companyName: profiles.companyName,
      phone: profiles.phone,
      address: profiles.address,
      logoUrl: profiles.logoUrl,
      invoiceTemplate: profiles.invoiceTemplate,
    })
    .from(profiles)
    .where(eq(profiles.id, userId))
    .limit(1);

  return result[0] || null;
}

export type UpdateProfileData = {
  fullName?: string;
  companyName?: string;
  phone?: string;
  address?: string;
  logoUrl?: string;
  invoiceTemplate?: InvoiceTemplate;
};

export async function updateProfile(
  userId: string,
  data: UpdateProfileData
): Promise<Profile | null> {
  const [result] = await db
    .update(profiles)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(eq(profiles.id, userId))
    .returning({
      id: profiles.id,
      email: profiles.email,
      fullName: profiles.fullName,
      companyName: profiles.companyName,
      phone: profiles.phone,
      address: profiles.address,
      logoUrl: profiles.logoUrl,
      invoiceTemplate: profiles.invoiceTemplate,
    });

  return result || null;
}
