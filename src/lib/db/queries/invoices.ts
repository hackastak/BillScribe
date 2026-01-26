import { db } from "@/lib/db";
import { invoices, invoiceItems, clients } from "@/lib/db/schema";
import { eq, desc, sql, and, like } from "drizzle-orm";

export type InvoiceStats = {
  totalInvoices: number;
  paidInvoices: number;
  pendingInvoices: number;
  totalRevenue: number;
};

export async function getInvoiceStats(userId: string): Promise<InvoiceStats> {
  const result = await db
    .select({
      totalInvoices: sql<number>`count(*)::int`,
      paidInvoices: sql<number>`count(*) filter (where ${invoices.status} = 'paid')::int`,
      pendingInvoices: sql<number>`count(*) filter (where ${invoices.status} in ('draft', 'sent'))::int`,
      totalRevenue: sql<number>`coalesce(sum(${invoices.total}) filter (where ${invoices.status} = 'paid'), 0)::numeric`,
    })
    .from(invoices)
    .where(eq(invoices.userId, userId));

  return {
    totalInvoices: result[0]?.totalInvoices ?? 0,
    paidInvoices: result[0]?.paidInvoices ?? 0,
    pendingInvoices: result[0]?.pendingInvoices ?? 0,
    totalRevenue: Number(result[0]?.totalRevenue ?? 0),
  };
}

export type RecentInvoice = {
  id: string;
  invoiceNumber: string;
  clientName: string | null;
  status: "draft" | "sent" | "paid" | "overdue" | "cancelled";
  issueDate: string;
  total: string;
};

export async function getRecentInvoices(
  userId: string,
  limit: number = 5
): Promise<RecentInvoice[]> {
  const result = await db
    .select({
      id: invoices.id,
      invoiceNumber: invoices.invoiceNumber,
      clientName: clients.name,
      status: invoices.status,
      issueDate: invoices.issueDate,
      total: invoices.total,
    })
    .from(invoices)
    .leftJoin(clients, eq(invoices.clientId, clients.id))
    .where(eq(invoices.userId, userId))
    .orderBy(desc(invoices.createdAt))
    .limit(limit);

  return result.map((row) => ({
    id: row.id,
    invoiceNumber: row.invoiceNumber,
    clientName: row.clientName,
    status: row.status,
    issueDate: row.issueDate,
    total: row.total ?? "0",
  }));
}

export async function getNextInvoiceNumber(userId: string): Promise<string> {
  const year = new Date().getFullYear();
  const prefix = `INV-${year}-`;

  const result = await db
    .select({ invoiceNumber: invoices.invoiceNumber })
    .from(invoices)
    .where(
      and(
        eq(invoices.userId, userId),
        like(invoices.invoiceNumber, `${prefix}%`)
      )
    )
    .orderBy(desc(invoices.invoiceNumber))
    .limit(1);

  if (result.length === 0) {
    return `${prefix}0001`;
  }

  const lastNumber = result[0]?.invoiceNumber;
  if (!lastNumber) {
    return `${prefix}0001`;
  }
  const lastSequence = parseInt(lastNumber.replace(prefix, ""), 10);
  const nextSequence = (lastSequence + 1).toString().padStart(4, "0");

  return `${prefix}${nextSequence}`;
}

export type CreateInvoiceData = {
  clientId?: string;
  invoiceNumber: string;
  issueDate: string;
  dueDate?: string;
  subtotal: string;
  taxRate?: string;
  taxAmount?: string;
  total: string;
  notes?: string;
  items: {
    description: string;
    quantity: string;
    unitPrice: string;
    amount: string;
  }[];
};

export async function createInvoice(
  userId: string,
  data: CreateInvoiceData
): Promise<{ id: string }> {
  return await db.transaction(async (tx) => {
    const result = await tx
      .insert(invoices)
      .values({
        userId,
        clientId: data.clientId || null,
        invoiceNumber: data.invoiceNumber,
        issueDate: data.issueDate,
        dueDate: data.dueDate || null,
        subtotal: data.subtotal,
        taxRate: data.taxRate || null,
        taxAmount: data.taxAmount || null,
        total: data.total,
        notes: data.notes || null,
      })
      .returning({ id: invoices.id });

    const invoice = result[0];
    if (!invoice) {
      throw new Error("Failed to create invoice");
    }

    if (data.items.length > 0) {
      await tx.insert(invoiceItems).values(
        data.items.map((item) => ({
          invoiceId: invoice.id,
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          amount: item.amount,
        }))
      );
    }

    return { id: invoice.id };
  });
}

export async function checkInvoiceNumberExists(
  userId: string,
  invoiceNumber: string
): Promise<boolean> {
  const result = await db
    .select({ id: invoices.id })
    .from(invoices)
    .where(
      and(
        eq(invoices.userId, userId),
        eq(invoices.invoiceNumber, invoiceNumber)
      )
    )
    .limit(1);

  return result.length > 0;
}

export type InvoiceItem = {
  id: string;
  description: string;
  quantity: string;
  unitPrice: string;
  amount: string;
};

export type InvoiceWithDetails = {
  id: string;
  invoiceNumber: string;
  status: "draft" | "sent" | "paid" | "overdue" | "cancelled";
  issueDate: string;
  dueDate: string | null;
  subtotal: string | null;
  taxRate: string | null;
  taxAmount: string | null;
  total: string;
  notes: string | null;
  client: {
    id: string;
    name: string;
    email: string | null;
    phone: string | null;
    company: string | null;
    address: string | null;
  } | null;
  items: InvoiceItem[];
};

export async function getInvoiceById(
  userId: string,
  invoiceId: string
): Promise<InvoiceWithDetails | null> {
  const invoiceResult = await db
    .select({
      id: invoices.id,
      invoiceNumber: invoices.invoiceNumber,
      status: invoices.status,
      issueDate: invoices.issueDate,
      dueDate: invoices.dueDate,
      subtotal: invoices.subtotal,
      taxRate: invoices.taxRate,
      taxAmount: invoices.taxAmount,
      total: invoices.total,
      notes: invoices.notes,
      clientId: clients.id,
      clientName: clients.name,
      clientEmail: clients.email,
      clientPhone: clients.phone,
      clientCompany: clients.company,
      clientAddress: clients.address,
    })
    .from(invoices)
    .leftJoin(clients, eq(invoices.clientId, clients.id))
    .where(and(eq(invoices.id, invoiceId), eq(invoices.userId, userId)))
    .limit(1);

  const invoice = invoiceResult[0];
  if (!invoice) {
    return null;
  }

  const itemsResult = await db
    .select({
      id: invoiceItems.id,
      description: invoiceItems.description,
      quantity: invoiceItems.quantity,
      unitPrice: invoiceItems.unitPrice,
      amount: invoiceItems.amount,
    })
    .from(invoiceItems)
    .where(eq(invoiceItems.invoiceId, invoiceId));

  return {
    id: invoice.id,
    invoiceNumber: invoice.invoiceNumber,
    status: invoice.status,
    issueDate: invoice.issueDate,
    dueDate: invoice.dueDate,
    subtotal: invoice.subtotal,
    taxRate: invoice.taxRate,
    taxAmount: invoice.taxAmount,
    total: invoice.total ?? "0",
    notes: invoice.notes,
    client: invoice.clientId
      ? {
          id: invoice.clientId,
          name: invoice.clientName!,
          email: invoice.clientEmail,
          phone: invoice.clientPhone,
          company: invoice.clientCompany,
          address: invoice.clientAddress,
        }
      : null,
    items: itemsResult.map((item) => ({
      id: item.id,
      description: item.description,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      amount: item.amount,
    })),
  };
}

export async function updateInvoiceStatus(
  userId: string,
  invoiceId: string,
  status: "draft" | "sent" | "paid" | "overdue" | "cancelled"
): Promise<void> {
  await db
    .update(invoices)
    .set({ status })
    .where(and(eq(invoices.id, invoiceId), eq(invoices.userId, userId)));
}
