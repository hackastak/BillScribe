import { z } from "zod";

export const lineItemSchema = z.object({
  id: z.string(),
  description: z.string().min(1, "Description is required"),
  quantity: z
    .string()
    .min(1, "Quantity is required")
    .refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0, {
      message: "Quantity must be a positive number",
    }),
  unitPrice: z
    .string()
    .min(1, "Unit price is required")
    .refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) >= 0, {
      message: "Unit price must be a non-negative number",
    }),
  amount: z.string(),
});

export const invoiceSchema = z
  .object({
    clientId: z.string().optional(),
    invoiceNumber: z.string().min(1, "Invoice number is required"),
    issueDate: z.string().min(1, "Issue date is required"),
    dueDate: z.string().optional(),
    taxRate: z
      .string()
      .optional()
      .refine(
        (val) => !val || (!isNaN(parseFloat(val)) && parseFloat(val) >= 0),
        { message: "Tax rate must be a non-negative number" }
      ),
    notes: z.string().optional(),
    items: z
      .array(lineItemSchema)
      .min(1, "At least one line item is required"),
  })
  .refine(
    (data) => {
      if (data.dueDate && data.issueDate) {
        return new Date(data.dueDate) >= new Date(data.issueDate);
      }
      return true;
    },
    {
      message: "Due date must be on or after issue date",
      path: ["dueDate"],
    }
  );

export const clientSchema = z.object({
  name: z.string().min(1, "Client name is required"),
  email: z.string().email("Invalid email address").optional().or(z.literal("")),
  phone: z.string().optional(),
  company: z.string().optional(),
  address: z.string().optional(),
});

export type LineItemInput = z.infer<typeof lineItemSchema>;
export type InvoiceInput = z.infer<typeof invoiceSchema>;
export type ClientInput = z.infer<typeof clientSchema>;
