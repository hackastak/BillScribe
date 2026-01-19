import {
  pgTable,
  uuid,
  text,
  timestamp,
  date,
  numeric,
  pgEnum,
} from 'drizzle-orm/pg-core';
import { profiles } from './profiles';
import { clients } from './clients';

export const invoiceStatusEnum = pgEnum('invoice_status', [
  'draft',
  'sent',
  'paid',
  'overdue',
  'cancelled',
]);

export const invoices = pgTable('invoices', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .references(() => profiles.id, { onDelete: 'cascade' }),
  clientId: uuid('client_id').references(() => clients.id, {
    onDelete: 'set null',
  }),
  invoiceNumber: text('invoice_number').notNull().unique(),
  status: invoiceStatusEnum('status').default('draft').notNull(),
  issueDate: date('issue_date').notNull(),
  dueDate: date('due_date'),
  subtotal: numeric('subtotal', { precision: 10, scale: 2 }),
  taxRate: numeric('tax_rate', { precision: 5, scale: 2 }),
  taxAmount: numeric('tax_amount', { precision: 10, scale: 2 }),
  total: numeric('total', { precision: 10, scale: 2 }).notNull(),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
