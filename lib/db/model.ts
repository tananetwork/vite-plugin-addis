/**
 * Rails-style Model for Tana DB
 *
 * Provides ActiveRecord-like methods: find(), findBy(), where(), create(), etc.
 */

import type { TableDefinition, ColumnBuilder } from './schema.js'
import { db, eq, and, type SQLCondition, type SQLParam } from './query.js'

// Query chain for building queries
export class QueryChain<T extends TableDefinition, TResult = T['$inferSelect']> {
  private _table: T
  private _conditions: SQLCondition[] = []
  private _orderByList: Array<{ column: string; direction: 'asc' | 'desc' }> = []
  private _limitValue?: number
  private _offsetValue?: number

  constructor(table: T) {
    this._table = table
  }

  // Add conditions
  where(conditions: Partial<T['$inferSelect']>): QueryChain<T, TResult> {
    const chain = new QueryChain<T, TResult>(this._table)
    chain._conditions = [...this._conditions]
    chain._orderByList = [...this._orderByList]
    chain._limitValue = this._limitValue
    chain._offsetValue = this._offsetValue

    // Convert object conditions to SQL conditions
    for (const [key, value] of Object.entries(conditions)) {
      const column = this._table.columns[key as keyof typeof this._table.columns]
      if (column) {
        chain._conditions.push(eq(column as ColumnBuilder<unknown, string, boolean, boolean, boolean>, value))
      }
    }

    return chain
  }

  // Order by
  orderBy(column: keyof T['$inferSelect'], direction: 'asc' | 'desc' = 'asc'): QueryChain<T, TResult> {
    const chain = new QueryChain<T, TResult>(this._table)
    chain._conditions = [...this._conditions]
    chain._orderByList = [...this._orderByList, { column: String(column), direction }]
    chain._limitValue = this._limitValue
    chain._offsetValue = this._offsetValue
    return chain
  }

  // Limit
  limit(n: number): QueryChain<T, TResult> {
    const chain = new QueryChain<T, TResult>(this._table)
    chain._conditions = [...this._conditions]
    chain._orderByList = [...this._orderByList]
    chain._limitValue = n
    chain._offsetValue = this._offsetValue
    return chain
  }

  // Offset
  offset(n: number): QueryChain<T, TResult> {
    const chain = new QueryChain<T, TResult>(this._table)
    chain._conditions = [...this._conditions]
    chain._orderByList = [...this._orderByList]
    chain._limitValue = this._limitValue
    chain._offsetValue = n
    return chain
  }

  // Build SQL
  toSQL(): { sql: string; params: SQLParam[] } {
    const parts: string[] = []
    const params: SQLParam[] = []
    let paramIndex = 1

    parts.push(`SELECT * FROM "${this._table.tableName}"`)

    if (this._conditions.length > 0) {
      const combined = this._conditions.length === 1
        ? this._conditions[0]
        : and(...this._conditions)
      const result = combined.toSQL(paramIndex)
      parts.push(`WHERE ${result.sql}`)
      params.push(...result.params)
      paramIndex = result.nextIndex
    }

    if (this._orderByList.length > 0) {
      const tableColumns = this._table.columns as Record<string, { columnName: string }>
      const orderCols = this._orderByList
        .map((o) => {
          // Map TypeScript property name to database column name
          const column = tableColumns[o.column]
          const dbColumnName = column?.columnName || o.column
          return `"${dbColumnName}" ${o.direction.toUpperCase()}`
        })
        .join(', ')
      parts.push(`ORDER BY ${orderCols}`)
    }

    if (this._limitValue !== undefined) {
      parts.push(`LIMIT ${this._limitValue}`)
    }

    if (this._offsetValue !== undefined) {
      parts.push(`OFFSET ${this._offsetValue}`)
    }

    return { sql: parts.join(' '), params }
  }

  // Execute and return all results
  async all(): Promise<TResult[]> {
    const { sql, params } = this.toSQL()
    const runtime = (globalThis as unknown as { __tanaDb?: { query: (sql: string, params: SQLParam[]) => Promise<unknown[]> } }).__tanaDb
    if (!runtime) {
      throw new Error('Tana DB runtime not initialized')
    }
    return runtime.query(sql, params) as Promise<TResult[]>
  }

  // Execute and return first result
  async first(): Promise<TResult | null> {
    const results = await this.limit(1).all()
    return results[0] ?? null
  }

  // Count matching records
  async count(): Promise<number> {
    const parts: string[] = []
    const params: SQLParam[] = []
    let paramIndex = 1

    parts.push(`SELECT COUNT(*) as count FROM "${this._table.tableName}"`)

    if (this._conditions.length > 0) {
      const combined = this._conditions.length === 1
        ? this._conditions[0]
        : and(...this._conditions)
      const result = combined.toSQL(paramIndex)
      parts.push(`WHERE ${result.sql}`)
      params.push(...result.params)
    }

    const runtime = (globalThis as unknown as { __tanaDb?: { query: (sql: string, params: SQLParam[]) => Promise<unknown[]> } }).__tanaDb
    if (!runtime) {
      throw new Error('Tana DB runtime not initialized')
    }
    const results = await runtime.query(parts.join(' '), params) as Array<{ count: string | number }>
    return Number(results[0]?.count ?? 0)
  }

  // Check if any records exist
  async exists(): Promise<boolean> {
    const count = await this.count()
    return count > 0
  }

  // Make it thenable for await syntax
  then<TReturn>(
    onfulfilled?: ((value: TResult[]) => TReturn | PromiseLike<TReturn>) | null,
    onrejected?: ((reason: unknown) => TReturn | PromiseLike<TReturn>) | null
  ): Promise<TReturn> {
    return this.all().then(onfulfilled, onrejected)
  }
}

// Model instance type
export interface ModelInstance<T extends TableDefinition> {
  _attributes: T['$inferSelect']
  _table: T
  _persisted: boolean

  // Get attribute value
  get<K extends keyof T['$inferSelect']>(key: K): T['$inferSelect'][K]

  // Update attributes and save
  update(attrs: Partial<T['$inferInsert']>): Promise<this>

  // Delete this record
  destroy(): Promise<void>

  // Reload from database
  reload(): Promise<this>

  // Save changes
  save(): Promise<this>

  // Convert to plain object
  toJSON(): T['$inferSelect']
}

// Create a model instance
function createInstance<T extends TableDefinition>(
  table: T,
  attributes: T['$inferSelect'],
  persisted: boolean = true
): ModelInstance<T> & T['$inferSelect'] {
  const instance: ModelInstance<T> = {
    _attributes: { ...attributes },
    _table: table,
    _persisted: persisted,

    get<K extends keyof T['$inferSelect']>(key: K): T['$inferSelect'][K] {
      return this._attributes[key]
    },

    async update(attrs: Partial<T['$inferInsert']>): Promise<ModelInstance<T> & T['$inferSelect']> {
      // Find the primary key column
      const columns = table.columns
      let pkColumn: string | undefined
      let pkValue: unknown

      for (const [key, col] of Object.entries(columns)) {
        const meta = (col as ColumnBuilder<unknown, string, boolean, boolean, boolean>)._getMeta()
        if (meta.isPrimaryKey) {
          pkColumn = key
          pkValue = this._attributes[key as keyof T['$inferSelect']]
          break
        }
      }

      if (!pkColumn) {
        throw new Error('Cannot update: no primary key defined')
      }

      const pkColumnBuilder = columns[pkColumn as keyof typeof columns] as ColumnBuilder<unknown, string, boolean, boolean, boolean>

      const query = db.update(table).set(attrs).where(eq(pkColumnBuilder, pkValue)).returning()
      const results = await query.execute()

      if (results.length > 0) {
        this._attributes = results[0] as T['$inferSelect']
      }

      return this as unknown as ModelInstance<T> & T['$inferSelect']
    },

    async destroy(): Promise<void> {
      const columns = table.columns
      let pkColumn: string | undefined
      let pkValue: unknown

      for (const [key, col] of Object.entries(columns)) {
        const meta = (col as ColumnBuilder<unknown, string, boolean, boolean, boolean>)._getMeta()
        if (meta.isPrimaryKey) {
          pkColumn = key
          pkValue = this._attributes[key as keyof T['$inferSelect']]
          break
        }
      }

      if (!pkColumn) {
        throw new Error('Cannot delete: no primary key defined')
      }

      const pkColumnBuilder = columns[pkColumn as keyof typeof columns] as ColumnBuilder<unknown, string, boolean, boolean, boolean>

      await db.delete(table).where(eq(pkColumnBuilder, pkValue)).execute()
      this._persisted = false
    },

    async reload(): Promise<ModelInstance<T> & T['$inferSelect']> {
      const columns = table.columns
      let pkColumn: string | undefined
      let pkValue: unknown

      for (const [key, col] of Object.entries(columns)) {
        const meta = (col as ColumnBuilder<unknown, string, boolean, boolean, boolean>)._getMeta()
        if (meta.isPrimaryKey) {
          pkColumn = key
          pkValue = this._attributes[key as keyof T['$inferSelect']]
          break
        }
      }

      if (!pkColumn) {
        throw new Error('Cannot reload: no primary key defined')
      }

      const pkColumnBuilder = columns[pkColumn as keyof typeof columns] as ColumnBuilder<unknown, string, boolean, boolean, boolean>

      const results = await db.select().from(table).where(eq(pkColumnBuilder, pkValue)).execute()

      if (results.length === 0) {
        throw new Error('Record not found')
      }

      this._attributes = results[0] as T['$inferSelect']
      return this as unknown as ModelInstance<T> & T['$inferSelect']
    },

    async save(): Promise<ModelInstance<T> & T['$inferSelect']> {
      if (this._persisted) {
        // Update existing record
        const columns = table.columns
        let pkColumn: string | undefined

        for (const [key, col] of Object.entries(columns)) {
          const meta = (col as ColumnBuilder<unknown, string, boolean, boolean, boolean>)._getMeta()
          if (meta.isPrimaryKey) {
            pkColumn = key
            break
          }
        }

        if (pkColumn) {
          const updateAttrs = { ...this._attributes }
          delete (updateAttrs as Record<string, unknown>)[pkColumn]
          await this.update(updateAttrs as Partial<T['$inferInsert']>)
        }
      } else {
        // Insert new record
        const results = await db.insert(table).values(this._attributes as T['$inferInsert']).returning().execute()
        if (results.length > 0) {
          this._attributes = results[0] as T['$inferSelect']
          this._persisted = true
        }
      }
      return this as unknown as ModelInstance<T> & T['$inferSelect']
    },

    toJSON(): T['$inferSelect'] {
      return { ...this._attributes }
    },
  }

  // Create proxy to expose attributes directly
  return new Proxy(instance, {
    get(target, prop) {
      if (prop in target) {
        return (target as unknown as Record<string | symbol, unknown>)[prop]
      }
      if (prop in target._attributes) {
        return target._attributes[prop as keyof T['$inferSelect']]
      }
      return undefined
    },
    set(target, prop, value) {
      if (prop in target._attributes) {
        (target._attributes as Record<string | symbol, unknown>)[prop] = value
        return true
      }
      return false
    },
  }) as ModelInstance<T> & T['$inferSelect']
}

// Model class type
export interface Model<T extends TableDefinition> {
  // Class methods (static)
  table: T

  // Find by primary key
  find(id: unknown): Promise<(ModelInstance<T> & T['$inferSelect']) | null>

  // Find by attributes
  findBy(attrs: Partial<T['$inferSelect']>): Promise<(ModelInstance<T> & T['$inferSelect']) | null>

  // Query chain
  where(attrs: Partial<T['$inferSelect']>): QueryChain<T, ModelInstance<T> & T['$inferSelect']>

  // Get all records
  all(): Promise<Array<ModelInstance<T> & T['$inferSelect']>>

  // Create a new record
  create(attrs: T['$inferInsert']): Promise<ModelInstance<T> & T['$inferSelect']>

  // Count records
  count(attrs?: Partial<T['$inferSelect']>): Promise<number>

  // Check if any records exist
  exists(attrs?: Partial<T['$inferSelect']>): Promise<boolean>

  // Build a new instance (not persisted)
  build(attrs: Partial<T['$inferInsert']>): ModelInstance<T> & T['$inferSelect']
}

// Create a model class for a table
export function model<T extends TableDefinition>(table: T): Model<T> {
  // Find the primary key column
  let pkColumn: string | undefined
  for (const [key, col] of Object.entries(table.columns)) {
    const meta = (col as ColumnBuilder<unknown, string, boolean, boolean, boolean>)._getMeta()
    if (meta.isPrimaryKey) {
      pkColumn = key
      break
    }
  }

  return {
    table,

    async find(id: unknown): Promise<(ModelInstance<T> & T['$inferSelect']) | null> {
      if (!pkColumn) {
        throw new Error('Cannot find: no primary key defined')
      }

      const pkColumnBuilder = table.columns[pkColumn as keyof typeof table.columns] as ColumnBuilder<unknown, string, boolean, boolean, boolean>

      const results = await db.select().from(table).where(eq(pkColumnBuilder, id)).execute()

      if (results.length === 0) {
        return null
      }

      return createInstance(table, results[0] as T['$inferSelect'])
    },

    async findBy(attrs: Partial<T['$inferSelect']>): Promise<(ModelInstance<T> & T['$inferSelect']) | null> {
      const chain = new QueryChain<T>(table)
      const result = await chain.where(attrs).first()
      if (!result) return null
      return createInstance(table, result as T['$inferSelect'])
    },

    where(attrs: Partial<T['$inferSelect']>): QueryChain<T, ModelInstance<T> & T['$inferSelect']> {
      return new QueryChain<T, ModelInstance<T> & T['$inferSelect']>(table).where(attrs)
    },

    async all(): Promise<Array<ModelInstance<T> & T['$inferSelect']>> {
      const results = await db.select().from(table).execute()
      return results.map((r) => createInstance(table, r as T['$inferSelect']))
    },

    async create(attrs: T['$inferInsert']): Promise<ModelInstance<T> & T['$inferSelect']> {
      const results = await db.insert(table).values(attrs).returning().execute()
      if (results.length === 0) {
        throw new Error('Insert failed')
      }
      return createInstance(table, results[0] as T['$inferSelect'])
    },

    async count(attrs?: Partial<T['$inferSelect']>): Promise<number> {
      const chain = new QueryChain<T>(table)
      if (attrs) {
        return chain.where(attrs).count()
      }
      return chain.count()
    },

    async exists(attrs?: Partial<T['$inferSelect']>): Promise<boolean> {
      const count = await this.count(attrs)
      return count > 0
    },

    build(attrs: Partial<T['$inferInsert']>): ModelInstance<T> & T['$inferSelect'] {
      return createInstance(table, attrs as T['$inferSelect'], false)
    },
  }
}
