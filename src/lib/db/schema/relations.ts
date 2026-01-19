import { relations } from 'drizzle-orm';
import { profiles } from './profiles';
import { clients } from './clients';
import { invoices } from './invoices';
import { invoiceItems } from './invoice-items';

export const profilesRelations = relations(profiles, ({ many }) => ({
  clients: many(clients),
  invoices: many(invoices),
}));

export const clientsRelations = relations(clients, ({ one, many }) => ({
  user: one(profiles, {
    fields: [clients.userId],
    references: [profiles.id],
  }),
  invoices: many(invoices),
}));

export const invoicesRelations = relations(invoices, ({ one, many }) => ({
  user: one(profiles, {
    fields: [invoices.userId],
    references: [profiles.id],
  }),
  client: one(clients, {
    fields: [invoices.clientId],
    references: [clients.id],
  }),
  items: many(invoiceItems),
}));

export const invoiceItemsRelations = relations(invoiceItems, ({ one }) => ({
  invoice: one(invoices, {
    fields: [invoiceItems.invoiceId],
    references: [invoices.id],
  }),
}));
