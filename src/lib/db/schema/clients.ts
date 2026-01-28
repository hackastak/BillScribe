import { pgTable, uuid, text, timestamp } from 'drizzle-orm/pg-core';
import { profiles } from './profiles';

export const clientStatusEnum = ['active', 'inactive'] as const;
export type ClientStatus = typeof clientStatusEnum[number];

export const clients = pgTable('clients', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .references(() => profiles.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  email: text('email'),
  phone: text('phone'),
  company: text('company'),
  address: text('address'),
  notes: text('notes'),
  status: text('status').$type<ClientStatus>().default('active').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
