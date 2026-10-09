import { sqliteTable, text, integer, uniqueIndex, index } from 'drizzle-orm/sqlite-core';
export const parcels = sqliteTable('parcels', {
 id: text('id').primaryKey(), x: integer('x').notNull(), y: integer('y').notNull(), level: integer('level').notNull(),
 title: text('title').notNull(), sender: text('sender').notNull(), recipient: text('recipient').notNull(),
 message: text('message').notNull(), color: text('color').notNull(), photo: text('photo'), caption: text('caption').notNull(),
 decorations: text('decorations').notNull(), created: integer('created').notNull(), ipHash: text('ip_hash').notNull()
}, t => [uniqueIndex('spot').on(t.x,t.y,t.level), index('region').on(t.level,t.x,t.y), index('rate').on(t.ipHash,t.created)]);
