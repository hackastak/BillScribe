"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { invoiceSchema } from "@/lib/validations/invoice";
import {
  createInvoice as createDbInvoice,
  updateInvoice as updateDbInvoice,
  checkInvoiceNumberExists,
  updateInvoiceStatus,
  deleteInvoice,
} from "@/lib/db/queries/invoices";
import { updateProfile } from "@/lib/db/queries/profiles";
import { canCreateInvoice } from "@/lib/subscriptions/usage";

export type InvoiceActionState = {
  error?: string;
  success?: boolean;
  invoiceId?: string;
  fieldErrors?: Record<string, string[]>;
};

export async function createInvoiceAction(
  prevState: InvoiceActionState,
  formData: FormData
): Promise<InvoiceActionState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You must be logged in to create an invoice" };
  }

  // Check subscription limits
  const limitCheck = await canCreateInvoice(user.id);
  if (!limitCheck.allowed) {
    return { error: limitCheck.reason };
  }

  const itemsJson = formData.get("items")?.toString() || "[]";
  let items;
  try {
    items = JSON.parse(itemsJson);
  } catch {
    return { error: "Invalid line items data" };
  }

  const rawData = {
    clientId: formData.get("clientId")?.toString() || undefined,
    invoiceNumber: formData.get("invoiceNumber")?.toString() || "",
    issueDate: formData.get("issueDate")?.toString() || "",
    dueDate: formData.get("dueDate")?.toString() || undefined,
    taxRate: formData.get("taxRate")?.toString() || undefined,
    notes: formData.get("notes")?.toString() || undefined,
    items,
  };

  const validated = invoiceSchema.safeParse(rawData);
  if (!validated.success) {
    return {
      fieldErrors: validated.error.flatten().fieldErrors as Record<
        string,
        string[]
      >,
    };
  }

  const exists = await checkInvoiceNumberExists(
    user.id,
    validated.data.invoiceNumber
  );
  if (exists) {
    return {
      fieldErrors: {
        invoiceNumber: ["This invoice number already exists"],
      },
    };
  }

  const subtotal = validated.data.items.reduce(
    (sum, item) => sum + parseFloat(item.amount),
    0
  );
  const taxRate = validated.data.taxRate
    ? parseFloat(validated.data.taxRate)
    : 0;
  const taxAmount = subtotal * (taxRate / 100);
  const total = subtotal + taxAmount;

  try {
    const { id } = await createDbInvoice(user.id, {
      clientId: validated.data.clientId,
      invoiceNumber: validated.data.invoiceNumber,
      issueDate: validated.data.issueDate,
      dueDate: validated.data.dueDate,
      subtotal: subtotal.toFixed(2),
      taxRate: validated.data.taxRate,
      taxAmount: taxAmount.toFixed(2),
      total: total.toFixed(2),
      notes: validated.data.notes,
      items: validated.data.items.map((item) => ({
        description: item.description,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        amount: item.amount,
      })),
    });

    return { success: true, invoiceId: id };
  } catch (error) {
    console.error("Error creating invoice:", error);
    return { error: "Failed to create invoice. Please try again." };
  }
}

export async function updateInvoiceAction(
  invoiceId: string,
  prevState: InvoiceActionState,
  formData: FormData
): Promise<InvoiceActionState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You must be logged in to update an invoice" };
  }

  const itemsJson = formData.get("items")?.toString() || "[]";
  let items;
  try {
    items = JSON.parse(itemsJson);
  } catch {
    return { error: "Invalid line items data" };
  }

  const rawData = {
    clientId: formData.get("clientId")?.toString() || undefined,
    invoiceNumber: formData.get("invoiceNumber")?.toString() || "",
    issueDate: formData.get("issueDate")?.toString() || "",
    dueDate: formData.get("dueDate")?.toString() || undefined,
    taxRate: formData.get("taxRate")?.toString() || undefined,
    notes: formData.get("notes")?.toString() || undefined,
    items,
  };

  const validated = invoiceSchema.safeParse(rawData);
  if (!validated.success) {
    return {
      fieldErrors: validated.error.flatten().fieldErrors as Record<
        string,
        string[]
      >,
    };
  }

  const exists = await checkInvoiceNumberExists(
    user.id,
    validated.data.invoiceNumber,
    invoiceId
  );
  if (exists) {
    return {
      fieldErrors: {
        invoiceNumber: ["This invoice number already exists"],
      },
    };
  }

  const subtotal = validated.data.items.reduce(
    (sum, item) => sum + parseFloat(item.amount),
    0
  );
  const taxRate = validated.data.taxRate
    ? parseFloat(validated.data.taxRate)
    : 0;
  const taxAmount = subtotal * (taxRate / 100);
  const total = subtotal + taxAmount;

  try {
    await updateDbInvoice(user.id, invoiceId, {
      clientId: validated.data.clientId,
      invoiceNumber: validated.data.invoiceNumber,
      issueDate: validated.data.issueDate,
      dueDate: validated.data.dueDate,
      subtotal: subtotal.toFixed(2),
      taxRate: validated.data.taxRate,
      taxAmount: taxAmount.toFixed(2),
      total: total.toFixed(2),
      notes: validated.data.notes,
      items: validated.data.items.map((item) => ({
        description: item.description,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        amount: item.amount,
      })),
    });

    revalidatePath("/invoices");
    revalidatePath(`/invoices/${invoiceId}`);
    return { success: true, invoiceId };
  } catch (error) {
    console.error("Error updating invoice:", error);
    return { error: "Failed to update invoice. Please try again." };
  }
}

export type LogoUploadState = {
  error?: string;
  success?: boolean;
  logoUrl?: string;
};

export async function uploadLogoAction(
  prevState: LogoUploadState,
  formData: FormData
): Promise<LogoUploadState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You must be logged in to upload a logo" };
  }

  const file = formData.get("logo") as File;
  if (!file || file.size === 0) {
    return { error: "Please select a file to upload" };
  }

  const maxSize = 2 * 1024 * 1024;
  if (file.size > maxSize) {
    return { error: "File size must be less than 2MB" };
  }

  const allowedTypes = ["image/png", "image/jpeg", "image/jpg", "image/webp"];
  if (!allowedTypes.includes(file.type)) {
    return { error: "Only PNG, JPEG, and WebP images are allowed" };
  }

  const ext = file.name.split(".").pop() || "png";
  const filePath = `logos/${user.id}/logo.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from("assets")
    .upload(filePath, file, { upsert: true });

  if (uploadError) {
    console.error("Error uploading logo:", uploadError);
    return { error: "Failed to upload logo. Please try again." };
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from("assets").getPublicUrl(filePath);

  try {
    await updateProfile(user.id, { logoUrl: publicUrl });
    return { success: true, logoUrl: publicUrl };
  } catch (error) {
    console.error("Error updating profile:", error);
    return { error: "Failed to save logo. Please try again." };
  }
}

export async function updateInvoiceStatusAction(
  invoiceId: string,
  status: "draft" | "sent" | "paid" | "overdue" | "cancelled"
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("You must be logged in to update an invoice");
  }

  try {
    await updateInvoiceStatus(user.id, invoiceId, status);
    revalidatePath("/dashboard");
    revalidatePath("/invoices");
    revalidatePath(`/invoices/${invoiceId}`);
    return { success: true };
  } catch (error) {
    console.error("Error updating invoice status:", error);
    return { error: "Failed to update invoice status" };
  }
}

export async function deleteInvoiceAction(invoiceId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You must be logged in to delete an invoice" };
  }

  try {
    const result = await deleteInvoice(user.id, invoiceId);

    if (!result.success) {
      return { error: result.error };
    }

    revalidatePath("/dashboard");
    revalidatePath("/invoices");
    return { success: true };
  } catch (error) {
    console.error("Error deleting invoice:", error);
    return { error: "Failed to delete invoice. Please try again." };
  }
}
