import { db } from "@/lib/db";
import { invoices, invoiceItems, clients } from "@/lib/db/schema";
import { eq, desc, asc, sql, and, like, ilike, or, inArray } from "drizzle-orm";

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

export async function updateInvoice(
  userId: string,
  invoiceId: string,
  data: CreateInvoiceData
): Promise<void> {
  await db.transaction(async (tx) => {
    // Verify ownership
    const existing = await tx
      .select({ id: invoices.id })
      .from(invoices)
      .where(and(eq(invoices.id, invoiceId), eq(invoices.userId, userId)))
      .limit(1);

    if (existing.length === 0) {
      throw new Error("Invoice not found");
    }

    // Update invoice
    await tx
      .update(invoices)
      .set({
        clientId: data.clientId || null,
        invoiceNumber: data.invoiceNumber,
        issueDate: data.issueDate,
        dueDate: data.dueDate || null,
        subtotal: data.subtotal,
        taxRate: data.taxRate || null,
        taxAmount: data.taxAmount || null,
        total: data.total,
        notes: data.notes || null,
        updatedAt: new Date(),
      })
      .where(eq(invoices.id, invoiceId));

    // Replace items
    await tx.delete(invoiceItems).where(eq(invoiceItems.invoiceId, invoiceId));

    if (data.items.length > 0) {
      await tx.insert(invoiceItems).values(
        data.items.map((item) => ({
          invoiceId: invoiceId,
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          amount: item.amount,
        }))
      );
    }
  });
}

export async function checkInvoiceNumberExists(
  userId: string,
  invoiceNumber: string,
  excludeId?: string
): Promise<boolean> {
  const conditions = [
    eq(invoices.userId, userId),
    eq(invoices.invoiceNumber, invoiceNumber),
  ];

  if (excludeId) {
    conditions.push(sql`${invoices.id} != ${excludeId}`);
  }

  const result = await db
    .select({ id: invoices.id })
    .from(invoices)
    .where(and(...conditions))
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

export async function deleteInvoice(
  userId: string,
  invoiceId: string
): Promise<{ success: boolean; error?: string }> {
  // Verify ownership and check status
  const existing = await db
    .select({ id: invoices.id, status: invoices.status })
    .from(invoices)
    .where(and(eq(invoices.id, invoiceId), eq(invoices.userId, userId)))
    .limit(1);

  if (existing.length === 0) {
    return { success: false, error: "Invoice not found" };
  }

  if (existing[0]?.status !== "draft") {
    return {
      success: false,
      error: "Only draft invoices can be deleted",
    };
  }

  // Delete invoice (invoice_items will be cascade deleted due to foreign key constraint)
  await db
    .delete(invoices)
    .where(and(eq(invoices.id, invoiceId), eq(invoices.userId, userId)));

  return { success: true };
}

export type InvoiceFilterParams = {
  query?: string;
  status?: string;
  sort?: string; // "date-asc", "date-desc", "amount-asc", "amount-desc"
  page?: number;
  pageSize?: number;
};

export type PaginatedInvoices = {
  data: InvoiceWithDetails[];
  metadata: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  };
};

export async function getInvoices(
  userId: string,
  params: InvoiceFilterParams
): Promise<PaginatedInvoices> {
  const page = params.page || 1;
  const pageSize = params.pageSize || 10;
  const offset = (page - 1) * pageSize;

  const conditions = [eq(invoices.userId, userId)];

  if (params.status && params.status !== "all") {
    conditions.push(eq(invoices.status, params.status as any));
  }

  if (params.query) {
    const search = `%${params.query}%`;
    const searchCondition = or(
      ilike(invoices.invoiceNumber, search),
      ilike(clients.name, search),
      ilike(clients.company, search)
    );
    if (searchCondition) {
      conditions.push(searchCondition);
    }
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  // Get total count
  const countResult = await db
    .select({ count: sql<number>`count(*)` })
    .from(invoices)
    .leftJoin(clients, eq(invoices.clientId, clients.id))
    .where(whereClause);

  const total = Number(countResult[0]?.count || 0);
  const totalPages = Math.ceil(total / pageSize);

  // Build sort order
  let orderBy;
  switch (params.sort) {
    case "date-asc":
      orderBy = asc(invoices.issueDate);
      break;
    case "date-desc":
      orderBy = desc(invoices.issueDate);
      break;
    case "amount-asc":
      orderBy = asc(invoices.total);
      break;
    case "amount-desc":
      orderBy = desc(invoices.total);
      break;
    default:
      orderBy = desc(invoices.issueDate);
  }

  // Get data
  const result = await db
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
    .where(whereClause)
    .orderBy(orderBy)
    .limit(pageSize)
    .offset(offset);

  // Fetch items for these invoices
  // Note: For a list view, we might not need items, but the InvoiceWithDetails type includes them.
  // To avoid N+1, we can fetch all items for these invoice IDs and map them.
  // However, for just the table view, we usually don't need items.
  // But since the "Preview" needs them, we might as well fetch them if it's not too heavy,
  // or we can make items optional in a new type.
  // For now, to reuse types, I'll fetch them.

  const invoiceIds = result.map((inv) => inv.id);

  const data = result.map((row) => {
    // Find items for this invoice
    // Note: This is in-memory matching, which is fine for page size 10-50.
    // We need to match invoiceId.
    // Wait, 'allItems' in my previous query logic doesn't have invoiceId in the generic map.
    // I need to make sure I can access invoiceId from the query result.

    // Let's refine the items fetching logic slightly.
    // I'll re-query items including invoiceId to match them.

    return {
      id: row.id,
      invoiceNumber: row.invoiceNumber,
      status: row.status,
      issueDate: row.issueDate,
      dueDate: row.dueDate,
      subtotal: row.subtotal,
      taxRate: row.taxRate,
      taxAmount: row.taxAmount,
      total: row.total ?? "0",
      notes: row.notes,
      client: row.clientId
        ? {
            id: row.clientId,
            name: row.clientName!,
            email: row.clientEmail,
            phone: row.clientPhone,
            company: row.clientCompany,
            address: row.clientAddress,
          }
        : null,
      items: [] as InvoiceItem[],
    };
  });

  // Correct approach for items:
  if (invoiceIds.length > 0) {
    const itemsResult = await db
      .select({
        id: invoiceItems.id,
        invoiceId: invoiceItems.invoiceId,
        description: invoiceItems.description,
        quantity: invoiceItems.quantity,
        unitPrice: invoiceItems.unitPrice,
        amount: invoiceItems.amount,
      })
      .from(invoiceItems)
      .where(inArray(invoiceItems.invoiceId, invoiceIds));

    const itemsByInvoice: Record<string, InvoiceItem[]> = {};
    itemsResult.forEach((item) => {
      if (!itemsByInvoice[item.invoiceId]) {
        itemsByInvoice[item.invoiceId] = [];
      }
      itemsByInvoice[item.invoiceId]?.push({
        id: item.id,
        description: item.description,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        amount: item.amount,
      });
    });

    data.forEach((inv) => {
      inv.items = itemsByInvoice[inv.id] || [];
    });
  }

  return {
    data,
    metadata: {
      total,
      page,
      pageSize,
      totalPages,
    },
  };
}

export async function getMonthlyInvoiceCount(userId: string): Promise<number> {
  // Get start of current calendar month
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const result = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(invoices)
    .where(
      and(
        eq(invoices.userId, userId),
        sql`${invoices.createdAt} >= ${startOfMonth}`
      )
    );

  return result[0]?.count ?? 0;
}

export type ClientInvoiceStats = {
  totalInvoices: number;
  paidAmount: number;
  pendingAmount: number;
  overdueAmount: number;
};

export async function getClientInvoiceStats(
  userId: string,
  clientId: string
): Promise<ClientInvoiceStats> {
  const result = await db
    .select({
      totalInvoices: sql<number>`count(*)::int`,
      paidAmount: sql<number>`coalesce(sum(${invoices.total}) filter (where ${invoices.status} = 'paid'), 0)::numeric`,
      pendingAmount: sql<number>`coalesce(sum(${invoices.total}) filter (where ${invoices.status} in ('draft', 'sent')), 0)::numeric`,
      overdueAmount: sql<number>`coalesce(sum(${invoices.total}) filter (where ${invoices.status} = 'overdue'), 0)::numeric`,
    })
    .from(invoices)
    .where(and(eq(invoices.userId, userId), eq(invoices.clientId, clientId)));

  return {
    totalInvoices: result[0]?.totalInvoices ?? 0,
    paidAmount: Number(result[0]?.paidAmount ?? 0),
    pendingAmount: Number(result[0]?.pendingAmount ?? 0),
    overdueAmount: Number(result[0]?.overdueAmount ?? 0),
  };
}
