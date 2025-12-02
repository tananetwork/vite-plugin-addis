/**
 * Database Schema Definition
 *
 * Define your tables using tana/db's Drizzle-style builders.
 * Generate migrations with: npm run db:generate
 *
 * @example
 * ```typescript
 * // In your API handlers, you can query using:
 *
 * // 1. Raw SQL via tana/db
 * import { query } from 'tana/db'
 * const users = await query('SELECT * FROM posts WHERE published = $1', [true])
 *
 * // 2. Type-safe Drizzle-style queries
 * import { db, eq } from 'tana/db'
 * import { posts } from './schema'
 * const results = await db.select().from(posts).where(eq(posts.published, true))
 *
 * // 3. Rails-style models
 * import { model } from 'tana/db'
 * import { posts } from './schema'
 * const Post = model(posts)
 * const published = await Post.where({ published: true }).limit(10)
 * ```
 */

// Uncomment to use tana/db schema builders:
//
// import { table, text, uuid, timestamp, boolean } from 'tana/db'
//
// export const posts = table('posts', {
//   id: uuid('id').primaryKey().defaultRandom(),
//   title: text('title').notNull(),
//   content: text('content'),
//   published: boolean('published').default(false),
//   createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
//   updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
// })
//
// export const comments = table('comments', {
//   id: uuid('id').primaryKey().defaultRandom(),
//   postId: uuid('post_id').notNull().references(() => posts.id),
//   author: text('author').notNull(),
//   content: text('content').notNull(),
//   createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
// })
