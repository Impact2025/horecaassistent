import {
  pgTable, pgEnum, uuid, text, integer, boolean,
  timestamp, jsonb, index, uniqueIndex, primaryKey
} from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'
import type { AdapterAccountType } from 'next-auth/adapters'

// ─── Enums ────────────────────────────────────────────────────────────────────

export const planEnum = pgEnum('plan', ['starter', 'pro', 'enterprise'])
export const memberRoleEnum = pgEnum('member_role', ['owner', 'manager', 'keuken', 'kelner'])
export const orderStatusEnum = pgEnum('order_status', [
  'pending', 'confirmed', 'preparing', 'ready', 'delivered', 'cancelled'
])
export const paymentMethodEnum = pgEnum('payment_method', [
  'ideal', 'card', 'apple_pay', 'google_pay', 'tab'
])
export const vatRateEnum = pgEnum('vat_rate', ['0.09', '0.21', '0.00'])
export const videoSlotEnum = pgEnum('video_slot', [
  'ochtend', 'lunch', 'middag', 'avond', 'nacht'
])

// ─── Auth.js tabellen ─────────────────────────────────────────────────────────

export const users = pgTable('users', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text('name'),
  email: text('email').unique().notNull(),
  emailVerified: timestamp('email_verified', { withTimezone: true }),
  image: text('image'),
  passwordHash: text('password_hash'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
})

export const accounts = pgTable('accounts', {
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  type: text('type').$type<AdapterAccountType>().notNull(),
  provider: text('provider').notNull(),
  providerAccountId: text('provider_account_id').notNull(),
  refresh_token: text('refresh_token'),
  access_token: text('access_token'),
  expires_at: integer('expires_at'),
  token_type: text('token_type'),
  scope: text('scope'),
  id_token: text('id_token'),
  session_state: text('session_state'),
}, (t) => ({
  pk: primaryKey({ columns: [t.provider, t.providerAccountId] }),
  userIdx: index('accounts_user_idx').on(t.userId),
}))

export const sessions = pgTable('sessions', {
  sessionToken: text('session_token').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  expires: timestamp('expires', { withTimezone: true }).notNull(),
}, (t) => ({
  userIdx: index('sessions_user_idx').on(t.userId),
}))

export const verificationTokens = pgTable('verification_tokens', {
  identifier: text('identifier').notNull(),
  token: text('token').notNull(),
  expires: timestamp('expires', { withTimezone: true }).notNull(),
}, (t) => ({
  pk: primaryKey({ columns: [t.identifier, t.token] }),
}))

// ─── Restaurants (tenant root) ────────────────────────────────────────────────

export const restaurants = pgTable('restaurants', {
  id: uuid('id').primaryKey().defaultRandom(),
  slug: text('slug').unique().notNull(),

  // Branding
  name: text('name').notNull(),
  tagline: text('tagline'),
  logoUrl: text('logo_url'),
  primaryColor: text('primary_color').default('#003422'),

  // HeyGen
  heygenAvatarId: text('heygen_avatar_id'),
  heygenAvatarName: text('heygen_avatar_name'),

  // Stripe
  stripeAccountId: text('stripe_account_id'),
  stripeCustomerId: text('stripe_customer_id'),

  // Plan
  plan: planEnum('plan').default('starter').notNull(),
  planExpiresAt: timestamp('plan_expires_at', { withTimezone: true }),

  // Openingstijden
  isOpen: boolean('is_open').default(true).notNull(),
  timezone: text('timezone').default('Europe/Amsterdam').notNull(),
  openingHours: jsonb('opening_hours')
    .$type<Record<string, { open: string; close: string; closed: boolean }>>()
    .default({}),

  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (t) => ({
  slugIdx: uniqueIndex('restaurants_slug_idx').on(t.slug),
}))

// ─── Restaurant members ───────────────────────────────────────────────────────

export const restaurantMembers = pgTable('restaurant_members', {
  id: uuid('id').primaryKey().defaultRandom(),
  restaurantId: uuid('restaurant_id').references(() => restaurants.id, { onDelete: 'cascade' }).notNull(),
  userId: text('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  role: memberRoleEnum('role').default('kelner').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (t) => ({
  memberIdx: uniqueIndex('restaurant_members_unique').on(t.restaurantId, t.userId),
  restaurantIdx: index('restaurant_members_restaurant_idx').on(t.restaurantId),
  userIdx: index('restaurant_members_user_idx').on(t.userId),
}))

// ─── Menu categories ──────────────────────────────────────────────────────────

export const menuCategories = pgTable('menu_categories', {
  id: uuid('id').primaryKey().defaultRandom(),
  restaurantId: uuid('restaurant_id').references(() => restaurants.id, { onDelete: 'cascade' }).notNull(),
  name: text('name').notNull(),
  icon: text('icon'),
  sortOrder: integer('sort_order').default(0).notNull(),
  isVisible: boolean('is_visible').default(true).notNull(),
  visibleFrom: text('visible_from'),
  visibleUntil: text('visible_until'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (t) => ({
  restaurantIdx: index('menu_categories_restaurant_idx').on(t.restaurantId),
}))

// ─── Menu items ───────────────────────────────────────────────────────────────

export const menuItems = pgTable('menu_items', {
  id: uuid('id').primaryKey().defaultRandom(),
  restaurantId: uuid('restaurant_id').references(() => restaurants.id, { onDelete: 'cascade' }).notNull(),
  categoryId: uuid('category_id').references(() => menuCategories.id, { onDelete: 'set null' }),

  name: text('name').notNull(),
  description: text('description'),
  priceCents: integer('price_cents').notNull(),
  vatRate: vatRateEnum('vat_rate').default('0.09').notNull(),
  imageUrl: text('image_url'),

  allergens: text('allergens').array().default([]).notNull(),

  variants: jsonb('variants')
    .$type<Array<{
      group: string
      required: boolean
      multiSelect: boolean
      options: Array<{ name: string; priceOffsetCents: number }>
    }>>()
    .default([]).notNull(),

  upsellItemIds: uuid('upsell_item_ids').array().default([]).notNull(),

  isAvailable: boolean('is_available').default(true).notNull(),
  isSpecial: boolean('is_special').default(false).notNull(),
  availableFrom: timestamp('available_from', { withTimezone: true }),
  availableUntil: timestamp('available_until', { withTimezone: true }),

  sortOrder: integer('sort_order').default(0).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (t) => ({
  restaurantIdx: index('menu_items_restaurant_idx').on(t.restaurantId),
  categoryIdx: index('menu_items_category_idx').on(t.categoryId),
  availableIdx: index('menu_items_available_idx').on(t.restaurantId, t.isAvailable),
}))

// ─── Tables ───────────────────────────────────────────────────────────────────

export const tables = pgTable('tables', {
  id: uuid('id').primaryKey().defaultRandom(),
  restaurantId: uuid('restaurant_id').references(() => restaurants.id, { onDelete: 'cascade' }).notNull(),
  tableNumber: text('table_number').notNull(),
  qrCodeUrl: text('qr_code_url'),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (t) => ({
  restaurantIdx: index('tables_restaurant_idx').on(t.restaurantId),
}))

// ─── Orders ───────────────────────────────────────────────────────────────────

export const orders = pgTable('orders', {
  id: uuid('id').primaryKey().defaultRandom(),
  restaurantId: uuid('restaurant_id').references(() => restaurants.id, { onDelete: 'restrict' }).notNull(),
  tableId: uuid('table_id').references(() => tables.id, { onDelete: 'restrict' }).notNull(),

  items: jsonb('items')
    .$type<Array<{
      itemId: string
      name: string
      qty: number
      unitPriceCents: number
      selectedVariants: Record<string, string>
      note?: string
      isUpsell: boolean
    }>>()
    .notNull(),

  status: orderStatusEnum('status').default('pending').notNull(),

  subtotalCents: integer('subtotal_cents').notNull(),
  vatCents: integer('vat_cents').notNull(),
  tipCents: integer('tip_cents').default(0).notNull(),
  totalCents: integer('total_cents').notNull(),

  paymentMethod: paymentMethodEnum('payment_method'),
  stripePaymentIntentId: text('stripe_payment_intent_id'),
  paidAt: timestamp('paid_at', { withTimezone: true }),

  upsellShown: boolean('upsell_shown').default(false).notNull(),
  upsellAccepted: boolean('upsell_accepted').default(false).notNull(),
  videoWatchedSeconds: integer('video_watched_seconds').default(0).notNull(),

  guestEmail: text('guest_email'),

  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (t) => ({
  restaurantIdx: index('orders_restaurant_idx').on(t.restaurantId),
  tableIdx: index('orders_table_idx').on(t.tableId),
  statusIdx: index('orders_status_idx').on(t.restaurantId, t.status),
  createdAtIdx: index('orders_created_at_idx').on(t.restaurantId, t.createdAt),
}))

// ─── Video scripts ─────────────────────────────────────────────────────────────

export const videoScripts = pgTable('video_scripts', {
  id: uuid('id').primaryKey().defaultRandom(),
  restaurantId: uuid('restaurant_id').references(() => restaurants.id, { onDelete: 'cascade' }).notNull(),
  slot: videoSlotEnum('slot').notNull(),
  language: text('language').default('nl').notNull(),
  scriptText: text('script_text').notNull(),
  videoUrl: text('video_url'),
  heygenJobId: text('heygen_job_id'),
  isActive: boolean('is_active').default(false).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (t) => ({
  restaurantSlotIdx: uniqueIndex('video_scripts_restaurant_slot_lang').on(
    t.restaurantId, t.slot, t.language
  ),
}))

// ─── Relations ────────────────────────────────────────────────────────────────

export const usersRelations = relations(users, ({ many }) => ({
  accounts: many(accounts),
  sessions: many(sessions),
  memberships: many(restaurantMembers),
}))

export const restaurantsRelations = relations(restaurants, ({ many }) => ({
  members: many(restaurantMembers),
  categories: many(menuCategories),
  menuItems: many(menuItems),
  tables: many(tables),
  orders: many(orders),
  videoScripts: many(videoScripts),
}))

export const restaurantMembersRelations = relations(restaurantMembers, ({ one }) => ({
  restaurant: one(restaurants, { fields: [restaurantMembers.restaurantId], references: [restaurants.id] }),
  user: one(users, { fields: [restaurantMembers.userId], references: [users.id] }),
}))

export const menuCategoriesRelations = relations(menuCategories, ({ one, many }) => ({
  restaurant: one(restaurants, { fields: [menuCategories.restaurantId], references: [restaurants.id] }),
  items: many(menuItems),
}))

export const menuItemsRelations = relations(menuItems, ({ one }) => ({
  restaurant: one(restaurants, { fields: [menuItems.restaurantId], references: [restaurants.id] }),
  category: one(menuCategories, { fields: [menuItems.categoryId], references: [menuCategories.id] }),
}))

export const tablesRelations = relations(tables, ({ one, many }) => ({
  restaurant: one(restaurants, { fields: [tables.restaurantId], references: [restaurants.id] }),
  orders: many(orders),
}))

export const ordersRelations = relations(orders, ({ one }) => ({
  restaurant: one(restaurants, { fields: [orders.restaurantId], references: [restaurants.id] }),
  table: one(tables, { fields: [orders.tableId], references: [tables.id] }),
}))

// ─── Type exports ─────────────────────────────────────────────────────────────

export type User = typeof users.$inferSelect
export type Restaurant = typeof restaurants.$inferSelect
export type NewRestaurant = typeof restaurants.$inferInsert
export type RestaurantMember = typeof restaurantMembers.$inferSelect
export type MenuCategory = typeof menuCategories.$inferSelect
export type MenuItem = typeof menuItems.$inferSelect
export type NewMenuItem = typeof menuItems.$inferInsert
export type Table = typeof tables.$inferSelect
export type Order = typeof orders.$inferSelect
export type NewOrder = typeof orders.$inferInsert
export type VideoScript = typeof videoScripts.$inferSelect
