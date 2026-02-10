import { pgTable, uuid, text, timestamp, pgEnum } from 'drizzle-orm/pg-core';

export const invoiceTemplateEnum = pgEnum('invoice_template', [
  'classic',
  'simple',
  'modern',
  'professional',
  'creative',
]);

export type InvoiceTemplate = 'classic' | 'simple' | 'modern' | 'professional' | 'creative';

export const profiles = pgTable('profiles', {
  id: uuid('id').primaryKey(),
  email: text('email').notNull(),
  fullName: text('full_name'),
  companyName: text('company_name'),
  phone: text('phone'),
  address: text('address'),
  logoUrl: text('logo_url'),
  invoiceTemplate: invoiceTemplateEnum('invoice_template').default('classic'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
