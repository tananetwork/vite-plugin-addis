/**
 * Query Builder for Tana DB
 *
 * Drizzle-style type-safe query builder that compiles to parameterized SQL.
 */

import type { TableDefinition, ColumnBuilder, Table } from './schema.js'

// SQL expression types
export type SQLValue = string | number | boolean | null | Date | bigint
export type SQLParam = SQLValue | SQLValue[]

// SQL condition representation
export interface SQLCondition {
  readonly _type: 'condition'
  toSQL(paramIndex: number): { sql: string; params: SQLParam[]; nextIndex: number }
}

// SQL operator expressions
class ComparisonExpr implements SQLCondition {
  readonly _type = 'condition' as const

  constructor(
    private column: ColumnBuilder<unknown, string, boolean, boolean, boolean>,
    private op: string,
    private value: SQLValue
  ) {}

  toSQL(paramIndex: number) {
    return {
      sql: `"${this.column.columnName}" ${this.op} $${paramIndex}`,
      params: [this.value],
      nextIndex: paramIndex + 1,
    }
  }
}

class InExpr implements SQLCondition {
  readonly _type = 'condition' as const

  constructor(
    private column: ColumnBuilder<unknown, string, boolean, boolean, boolean>,
    private values: SQLValue[]
  ) {}

  toSQL(paramIndex: number) {
    const placeholders = this.values.map((_, i) => `$${paramIndex + i}`).join(', ')
    return {
      sql: `"${this.column.columnName}" IN (${placeholders})`,
      params: this.values,
      nextIndex: paramIndex + this.values.length,
    }
  }
}

class NotInExpr implements SQLCondition {
  readonly _type = 'condition' as const

  constructor(
    private column: ColumnBuilder<unknown, string, boolean, boolean, boolean>,
    private values: SQLValue[]
  ) {}

  toSQL(paramIndex: number) {
    const placeholders = this.values.map((_, i) => `$${paramIndex + i}`).join(', ')
    return {
      sql: `"${this.column.columnName}" NOT IN (${placeholders})`,
      params: this.values,
      nextIndex: paramIndex + this.values.length,
    }
  }
}

class IsNullExpr implements SQLCondition {
  readonly _type = 'condition' as const

  constructor(private column: ColumnBuilder<unknown, string, boolean, boolean, boolean>) {}

  toSQL(paramIndex: number) {
    return {
      sql: `"${this.column.columnName}" IS NULL`,
      params: [],
      nextIndex: paramIndex,
    }
  }
}

class IsNotNullExpr implements SQLCondition {
  readonly _type = 'condition' as const

  constructor(private column: ColumnBuilder<unknown, string, boolean, boolean, boolean>) {}

  toSQL(paramIndex: number) {
    return {
      sql: `"${this.column.columnName}" IS NOT NULL`,
      params: [],
      nextIndex: paramIndex,
    }
  }
}

class BetweenExpr implements SQLCondition {
  readonly _type = 'condition' as const

  constructor(
    private column: ColumnBuilder<unknown, string, boolean, boolean, boolean>,
    private min: SQLValue,
    private max: SQLValue
  ) {}

  toSQL(paramIndex: number) {
    return {
      sql: `"${this.column.columnName}" BETWEEN $${paramIndex} AND $${paramIndex + 1}`,
      params: [this.min, this.max],
      nextIndex: paramIndex + 2,
    }
  }
}

class AndExpr implements SQLCondition {
  readonly _type = 'condition' as const

  constructor(private conditions: SQLCondition[]) {}

  toSQL(paramIndex: number) {
    const parts: string[] = []
    const params: SQLParam[] = []
    let idx = paramIndex

    for (const cond of this.conditions) {
      const result = cond.toSQL(idx)
      parts.push(result.sql)
      params.push(...result.params)
      idx = result.nextIndex
    }

    return {
      sql: `(${parts.join(' AND ')})`,
      params,
      nextIndex: idx,
    }
  }
}

class OrExpr implements SQLCondition {
  readonly _type = 'condition' as const

  constructor(private conditions: SQLCondition[]) {}

  toSQL(paramIndex: number) {
    const parts: string[] = []
    const params: SQLParam[] = []
    let idx = paramIndex

    for (const cond of this.conditions) {
      const result = cond.toSQL(idx)
      parts.push(result.sql)
      params.push(...result.params)
      idx = result.nextIndex
    }

    return {
      sql: `(${parts.join(' OR ')})`,
      params,
      nextIndex: idx,
    }
  }
}

class NotExpr implements SQLCondition {
  readonly _type = 'condition' as const

  constructor(private condition: SQLCondition) {}

  toSQL(paramIndex: number) {
    const result = this.condition.toSQL(paramIndex)
    return {
      sql: `NOT ${result.sql}`,
      params: result.params,
      nextIndex: result.nextIndex,
    }
  }
}

// Operator functions (Drizzle-compatible)
export function eq<T>(
  column: ColumnBuilder<T, string, boolean, boolean, boolean>,
  value: T
): SQLCondition {
  return new ComparisonExpr(column, '=', value as SQLValue)
}

export function ne<T>(
  column: ColumnBuilder<T, string, boolean, boolean, boolean>,
  value: T
): SQLCondition {
  return new ComparisonExpr(column, '<>', value as SQLValue)
}

export function gt<T>(
  column: ColumnBuilder<T, string, boolean, boolean, boolean>,
  value: T
): SQLCondition {
  return new ComparisonExpr(column, '>', value as SQLValue)
}

export function gte<T>(
  column: ColumnBuilder<T, string, boolean, boolean, boolean>,
  value: T
): SQLCondition {
  return new ComparisonExpr(column, '>=', value as SQLValue)
}

export function lt<T>(
  column: ColumnBuilder<T, string, boolean, boolean, boolean>,
  value: T
): SQLCondition {
  return new ComparisonExpr(column, '<', value as SQLValue)
}

export function lte<T>(
  column: ColumnBuilder<T, string, boolean, boolean, boolean>,
  value: T
): SQLCondition {
  return new ComparisonExpr(column, '<=', value as SQLValue)
}

export function like(
  column: ColumnBuilder<string, string, boolean, boolean, boolean>,
  pattern: string
): SQLCondition {
  return new ComparisonExpr(column, 'LIKE', pattern)
}

export function ilike(
  column: ColumnBuilder<string, string, boolean, boolean, boolean>,
  pattern: string
): SQLCondition {
  return new ComparisonExpr(column, 'ILIKE', pattern)
}

export function inArray<T>(
  column: ColumnBuilder<T, string, boolean, boolean, boolean>,
  values: T[]
): SQLCondition {
  return new InExpr(column, values as SQLValue[])
}

export function notInArray<T>(
  column: ColumnBuilder<T, string, boolean, boolean, boolean>,
  values: T[]
): SQLCondition {
  return new NotInExpr(column, values as SQLValue[])
}

export function isNull(
  column: ColumnBuilder<unknown, string, boolean, boolean, boolean>
): SQLCondition {
  return new IsNullExpr(column)
}

export function isNotNull(
  column: ColumnBuilder<unknown, string, boolean, boolean, boolean>
): SQLCondition {
  return new IsNotNullExpr(column)
}

export function between<T>(
  column: ColumnBuilder<T, string, boolean, boolean, boolean>,
  min: T,
  max: T
): SQLCondition {
  return new BetweenExpr(column, min as SQLValue, max as SQLValue)
}

export function and(...conditions: SQLCondition[]): SQLCondition {
  return new AndExpr(conditions)
}

export function or(...conditions: SQLCondition[]): SQLCondition {
  return new OrExpr(conditions)
}

export function not(condition: SQLCondition): SQLCondition {
  return new NotExpr(condition)
}

// Order by direction
export type OrderDirection = 'asc' | 'desc'

export function asc(
  column: ColumnBuilder<unknown, string, boolean, boolean, boolean>
): { column: ColumnBuilder<unknown, string, boolean, boolean, boolean>; direction: 'asc' } {
  return { column, direction: 'asc' }
}

export function desc(
  column: ColumnBuilder<unknown, string, boolean, boolean, boolean>
): { column: ColumnBuilder<unknown, string, boolean, boolean, boolean>; direction: 'desc' } {
  return { column, direction: 'desc' }
}

// Aggregate functions
export function count(
  column?: ColumnBuilder<unknown, string, boolean, boolean, boolean>
): { _type: 'aggregate'; fn: 'count'; column?: ColumnBuilder<unknown, string, boolean, boolean, boolean> } {
  return { _type: 'aggregate', fn: 'count', column }
}

export function sum(
  column: ColumnBuilder<number, string, boolean, boolean, boolean>
): { _type: 'aggregate'; fn: 'sum'; column: ColumnBuilder<unknown, string, boolean, boolean, boolean> } {
  return { _type: 'aggregate', fn: 'sum', column }
}

export function avg(
  column: ColumnBuilder<number, string, boolean, boolean, boolean>
): { _type: 'aggregate'; fn: 'avg'; column: ColumnBuilder<unknown, string, boolean, boolean, boolean> } {
  return { _type: 'aggregate', fn: 'avg', column }
}

export function min<T>(
  column: ColumnBuilder<T, string, boolean, boolean, boolean>
): { _type: 'aggregate'; fn: 'min'; column: ColumnBuilder<unknown, string, boolean, boolean, boolean> } {
  return { _type: 'aggregate', fn: 'min', column }
}

export function max<T>(
  column: ColumnBuilder<T, string, boolean, boolean, boolean>
): { _type: 'aggregate'; fn: 'max'; column: ColumnBuilder<unknown, string, boolean, boolean, boolean> } {
  return { _type: 'aggregate', fn: 'max', column }
}

// Join types
type JoinType = 'inner' | 'left' | 'right' | 'full'

interface JoinClause {
  type: JoinType
  table: TableDefinition
  on: SQLCondition
}

// Query builder types
type SelectColumns<T extends TableDefinition> = Partial<{
  [K in keyof T['columns']]: T['columns'][K]
}> | '*'

// Select query builder
export class SelectQueryBuilder<TResult = unknown> {
  private _from?: TableDefinition
  private _select: Record<string, unknown> | '*' = '*'
  private _where?: SQLCondition
  private _joins: JoinClause[] = []
  private _orderBy: Array<{ column: ColumnBuilder<unknown, string, boolean, boolean, boolean>; direction: OrderDirection }> = []
  private _groupBy: ColumnBuilder<unknown, string, boolean, boolean, boolean>[] = []
  private _limit?: number
  private _offset?: number

  select<T extends Record<string, unknown>>(columns?: T): SelectQueryBuilder<T> {
    const builder = new SelectQueryBuilder<T>()
    builder._select = columns || '*'
    builder._from = this._from
    builder._where = this._where
    builder._joins = this._joins
    builder._orderBy = this._orderBy
    builder._groupBy = this._groupBy
    builder._limit = this._limit
    builder._offset = this._offset
    return builder
  }

  from<T extends TableDefinition>(table: T): SelectQueryBuilder<T['$inferSelect']> {
    const builder = new SelectQueryBuilder<T['$inferSelect']>()
    builder._from = table
    builder._select = this._select
    builder._where = this._where
    builder._joins = this._joins
    builder._orderBy = this._orderBy
    builder._groupBy = this._groupBy
    builder._limit = this._limit
    builder._offset = this._offset
    return builder
  }

  where(condition: SQLCondition): SelectQueryBuilder<TResult> {
    const builder = new SelectQueryBuilder<TResult>()
    builder._from = this._from
    builder._select = this._select
    builder._where = condition
    builder._joins = this._joins
    builder._orderBy = this._orderBy
    builder._groupBy = this._groupBy
    builder._limit = this._limit
    builder._offset = this._offset
    return builder
  }

  innerJoin<T extends TableDefinition>(
    table: T,
    on: SQLCondition
  ): SelectQueryBuilder<TResult> {
    const builder = new SelectQueryBuilder<TResult>()
    builder._from = this._from
    builder._select = this._select
    builder._where = this._where
    builder._joins = [...this._joins, { type: 'inner', table, on }]
    builder._orderBy = this._orderBy
    builder._groupBy = this._groupBy
    builder._limit = this._limit
    builder._offset = this._offset
    return builder
  }

  leftJoin<T extends TableDefinition>(
    table: T,
    on: SQLCondition
  ): SelectQueryBuilder<TResult> {
    const builder = new SelectQueryBuilder<TResult>()
    builder._from = this._from
    builder._select = this._select
    builder._where = this._where
    builder._joins = [...this._joins, { type: 'left', table, on }]
    builder._orderBy = this._orderBy
    builder._groupBy = this._groupBy
    builder._limit = this._limit
    builder._offset = this._offset
    return builder
  }

  rightJoin<T extends TableDefinition>(
    table: T,
    on: SQLCondition
  ): SelectQueryBuilder<TResult> {
    const builder = new SelectQueryBuilder<TResult>()
    builder._from = this._from
    builder._select = this._select
    builder._where = this._where
    builder._joins = [...this._joins, { type: 'right', table, on }]
    builder._orderBy = this._orderBy
    builder._groupBy = this._groupBy
    builder._limit = this._limit
    builder._offset = this._offset
    return builder
  }

  orderBy(
    ...orders: Array<
      | { column: ColumnBuilder<unknown, string, boolean, boolean, boolean>; direction: OrderDirection }
      | ColumnBuilder<unknown, string, boolean, boolean, boolean>
    >
  ): SelectQueryBuilder<TResult> {
    const builder = new SelectQueryBuilder<TResult>()
    builder._from = this._from
    builder._select = this._select
    builder._where = this._where
    builder._joins = this._joins
    builder._orderBy = orders.map((o) =>
      'direction' in o ? o : { column: o, direction: 'asc' as const }
    )
    builder._groupBy = this._groupBy
    builder._limit = this._limit
    builder._offset = this._offset
    return builder
  }

  groupBy(
    ...columns: ColumnBuilder<unknown, string, boolean, boolean, boolean>[]
  ): SelectQueryBuilder<TResult> {
    const builder = new SelectQueryBuilder<TResult>()
    builder._from = this._from
    builder._select = this._select
    builder._where = this._where
    builder._joins = this._joins
    builder._orderBy = this._orderBy
    builder._groupBy = columns
    builder._limit = this._limit
    builder._offset = this._offset
    return builder
  }

  limit(n: number): SelectQueryBuilder<TResult> {
    const builder = new SelectQueryBuilder<TResult>()
    builder._from = this._from
    builder._select = this._select
    builder._where = this._where
    builder._joins = this._joins
    builder._orderBy = this._orderBy
    builder._groupBy = this._groupBy
    builder._limit = n
    builder._offset = this._offset
    return builder
  }

  offset(n: number): SelectQueryBuilder<TResult> {
    const builder = new SelectQueryBuilder<TResult>()
    builder._from = this._from
    builder._select = this._select
    builder._where = this._where
    builder._joins = this._joins
    builder._orderBy = this._orderBy
    builder._groupBy = this._groupBy
    builder._limit = this._limit
    builder._offset = n
    return builder
  }

  // Compile to SQL
  toSQL(): { sql: string; params: SQLParam[] } {
    if (!this._from) {
      throw new Error('FROM clause is required')
    }

    const parts: string[] = []
    const params: SQLParam[] = []
    let paramIndex = 1

    // SELECT clause
    if (this._select === '*') {
      parts.push(`SELECT * FROM "${this._from.tableName}"`)
    } else {
      const columns = Object.entries(this._select)
        .map(([alias, col]) => {
          if (col && typeof col === 'object' && '_type' in col && col._type === 'aggregate') {
            const agg = col as unknown as { fn: string; column?: ColumnBuilder<unknown, string, boolean, boolean, boolean> }
            if (agg.column) {
              return `${agg.fn.toUpperCase()}("${agg.column.columnName}") AS "${alias}"`
            }
            return `${agg.fn.toUpperCase()}(*) AS "${alias}"`
          }
          if (col && typeof col === 'object' && 'columnName' in col) {
            return `"${(col as ColumnBuilder<unknown, string, boolean, boolean, boolean>).columnName}" AS "${alias}"`
          }
          return `"${alias}"`
        })
        .join(', ')
      parts.push(`SELECT ${columns} FROM "${this._from.tableName}"`)
    }

    // JOIN clauses
    for (const join of this._joins) {
      const joinType = join.type.toUpperCase()
      const onResult = join.on.toSQL(paramIndex)
      parts.push(`${joinType} JOIN "${join.table.tableName}" ON ${onResult.sql}`)
      params.push(...onResult.params)
      paramIndex = onResult.nextIndex
    }

    // WHERE clause
    if (this._where) {
      const whereResult = this._where.toSQL(paramIndex)
      parts.push(`WHERE ${whereResult.sql}`)
      params.push(...whereResult.params)
      paramIndex = whereResult.nextIndex
    }

    // GROUP BY clause
    if (this._groupBy.length > 0) {
      const groupCols = this._groupBy.map((c) => `"${c.columnName}"`).join(', ')
      parts.push(`GROUP BY ${groupCols}`)
    }

    // ORDER BY clause
    if (this._orderBy.length > 0) {
      const orderCols = this._orderBy
        .map((o) => `"${o.column.columnName}" ${o.direction.toUpperCase()}`)
        .join(', ')
      parts.push(`ORDER BY ${orderCols}`)
    }

    // LIMIT clause
    if (this._limit !== undefined) {
      parts.push(`LIMIT ${this._limit}`)
    }

    // OFFSET clause
    if (this._offset !== undefined) {
      parts.push(`OFFSET ${this._offset}`)
    }

    return { sql: parts.join(' '), params }
  }

  // Execute query (requires runtime)
  async execute(): Promise<TResult[]> {
    const { sql, params } = this.toSQL()
    // This will be implemented when we add the tana-edge runtime
    const runtime = (globalThis as unknown as { __tanaDb?: { query: (sql: string, params: SQLParam[]) => Promise<unknown[]> } }).__tanaDb
    if (!runtime) {
      throw new Error('Tana DB runtime not initialized. Are you running inside tana-edge?')
    }
    return runtime.query(sql, params) as Promise<TResult[]>
  }

  // Alias for execute
  then<TReturn>(
    onfulfilled?: ((value: TResult[]) => TReturn | PromiseLike<TReturn>) | null,
    onrejected?: ((reason: unknown) => TReturn | PromiseLike<TReturn>) | null
  ): Promise<TReturn> {
    return this.execute().then(onfulfilled, onrejected)
  }
}

// Insert query builder
export class InsertQueryBuilder<T extends TableDefinition> {
  private _table: T
  private _values: Array<Partial<T['$inferInsert']>> = []
  private _returning: boolean = false

  constructor(table: T) {
    this._table = table
  }

  values(data: T['$inferInsert'] | T['$inferInsert'][]): InsertQueryBuilder<T> {
    const builder = new InsertQueryBuilder(this._table)
    builder._values = Array.isArray(data) ? data : [data]
    builder._returning = this._returning
    return builder
  }

  returning(): InsertQueryBuilder<T> {
    const builder = new InsertQueryBuilder(this._table)
    builder._values = this._values
    builder._returning = true
    return builder
  }

  toSQL(): { sql: string; params: SQLParam[] } {
    if (this._values.length === 0) {
      throw new Error('No values to insert')
    }

    const params: SQLParam[] = []
    let paramIndex = 1

    // Get TypeScript property names from first value
    const propNames = Object.keys(this._values[0])

    // Map property names to actual database column names
    // e.g., 'readTime' -> 'read_time' using the table schema
    const tableColumns = this._table.columns as Record<string, { columnName: string }>
    const dbColumnNames = propNames.map((prop) => {
      const column = tableColumns[prop]
      // Use the actual DB column name if defined in schema, otherwise use property name as-is
      return column?.columnName || prop
    })
    const columnList = dbColumnNames.map((c) => `"${c}"`).join(', ')

    // Build value placeholders
    const valueLists = this._values.map((row) => {
      const placeholders = propNames.map((prop) => {
        const value = (row as Record<string, unknown>)[prop]
        params.push(value as SQLParam)
        return `$${paramIndex++}`
      })
      return `(${placeholders.join(', ')})`
    })

    let sql = `INSERT INTO "${this._table.tableName}" (${columnList}) VALUES ${valueLists.join(', ')}`

    if (this._returning) {
      sql += ' RETURNING *'
    }

    return { sql, params }
  }

  async execute(): Promise<T['$inferSelect'][]> {
    const { sql, params } = this.toSQL()
    const runtime = (globalThis as unknown as {
      __tanaDb?: {
        query: (sql: string, params: SQLParam[]) => Promise<unknown[]>
        execute: (sql: string, params: SQLParam[]) => Promise<{ rowsAffected: number }>
        executeReturning: (sql: string, params: SQLParam[]) => Promise<unknown[]>
      }
    }).__tanaDb
    if (!runtime) {
      throw new Error('Tana DB runtime not initialized')
    }
    // Use executeReturning for INSERT with RETURNING, execute for plain INSERT
    if (this._returning) {
      return runtime.executeReturning(sql, params) as Promise<T['$inferSelect'][]>
    }
    // For non-RETURNING insert, just execute and return empty array
    await runtime.execute(sql, params)
    return [] as T['$inferSelect'][]
  }

  then<TReturn>(
    onfulfilled?: ((value: T['$inferSelect'][]) => TReturn | PromiseLike<TReturn>) | null,
    onrejected?: ((reason: unknown) => TReturn | PromiseLike<TReturn>) | null
  ): Promise<TReturn> {
    return this.execute().then(onfulfilled, onrejected)
  }
}

// Update query builder
export class UpdateQueryBuilder<T extends TableDefinition> {
  private _table: T
  private _set: Partial<T['$inferInsert']> = {}
  private _where?: SQLCondition
  private _returning: boolean = false

  constructor(table: T) {
    this._table = table
  }

  set(data: Partial<T['$inferInsert']>): UpdateQueryBuilder<T> {
    const builder = new UpdateQueryBuilder(this._table)
    builder._set = data
    builder._where = this._where
    builder._returning = this._returning
    return builder
  }

  where(condition: SQLCondition): UpdateQueryBuilder<T> {
    const builder = new UpdateQueryBuilder(this._table)
    builder._set = this._set
    builder._where = condition
    builder._returning = this._returning
    return builder
  }

  returning(): UpdateQueryBuilder<T> {
    const builder = new UpdateQueryBuilder(this._table)
    builder._set = this._set
    builder._where = this._where
    builder._returning = true
    return builder
  }

  toSQL(): { sql: string; params: SQLParam[] } {
    const propNames = Object.keys(this._set)
    if (propNames.length === 0) {
      throw new Error('No columns to update')
    }

    const params: SQLParam[] = []
    let paramIndex = 1

    // Map property names to actual database column names
    const tableColumns = this._table.columns as Record<string, { columnName: string }>
    const setClause = propNames
      .map((prop) => {
        const value = (this._set as Record<string, unknown>)[prop]
        params.push(value as SQLParam)
        // Use the actual DB column name if defined in schema
        const dbColumnName = tableColumns[prop]?.columnName || prop
        return `"${dbColumnName}" = $${paramIndex++}`
      })
      .join(', ')

    let sql = `UPDATE "${this._table.tableName}" SET ${setClause}`

    if (this._where) {
      const whereResult = this._where.toSQL(paramIndex)
      sql += ` WHERE ${whereResult.sql}`
      params.push(...whereResult.params)
    }

    if (this._returning) {
      sql += ' RETURNING *'
    }

    return { sql, params }
  }

  async execute(): Promise<T['$inferSelect'][]> {
    const { sql, params } = this.toSQL()
    const runtime = (globalThis as unknown as {
      __tanaDb?: {
        query: (sql: string, params: SQLParam[]) => Promise<unknown[]>
        execute: (sql: string, params: SQLParam[]) => Promise<{ rowsAffected: number }>
        executeReturning: (sql: string, params: SQLParam[]) => Promise<unknown[]>
      }
    }).__tanaDb
    if (!runtime) {
      throw new Error('Tana DB runtime not initialized')
    }
    // Use executeReturning for UPDATE with RETURNING, execute for plain UPDATE
    if (this._returning) {
      return runtime.executeReturning(sql, params) as Promise<T['$inferSelect'][]>
    }
    await runtime.execute(sql, params)
    return [] as T['$inferSelect'][]
  }

  then<TReturn>(
    onfulfilled?: ((value: T['$inferSelect'][]) => TReturn | PromiseLike<TReturn>) | null,
    onrejected?: ((reason: unknown) => TReturn | PromiseLike<TReturn>) | null
  ): Promise<TReturn> {
    return this.execute().then(onfulfilled, onrejected)
  }
}

// Delete query builder
export class DeleteQueryBuilder<T extends TableDefinition> {
  private _table: T
  private _where?: SQLCondition
  private _returning: boolean = false

  constructor(table: T) {
    this._table = table
  }

  where(condition: SQLCondition): DeleteQueryBuilder<T> {
    const builder = new DeleteQueryBuilder(this._table)
    builder._where = condition
    builder._returning = this._returning
    return builder
  }

  returning(): DeleteQueryBuilder<T> {
    const builder = new DeleteQueryBuilder(this._table)
    builder._where = this._where
    builder._returning = true
    return builder
  }

  toSQL(): { sql: string; params: SQLParam[] } {
    const params: SQLParam[] = []
    let paramIndex = 1

    let sql = `DELETE FROM "${this._table.tableName}"`

    if (this._where) {
      const whereResult = this._where.toSQL(paramIndex)
      sql += ` WHERE ${whereResult.sql}`
      params.push(...whereResult.params)
    }

    if (this._returning) {
      sql += ' RETURNING *'
    }

    return { sql, params }
  }

  async execute(): Promise<T['$inferSelect'][]> {
    const { sql, params } = this.toSQL()
    const runtime = (globalThis as unknown as {
      __tanaDb?: {
        query: (sql: string, params: SQLParam[]) => Promise<unknown[]>
        execute: (sql: string, params: SQLParam[]) => Promise<{ rowsAffected: number }>
        executeReturning: (sql: string, params: SQLParam[]) => Promise<unknown[]>
      }
    }).__tanaDb
    if (!runtime) {
      throw new Error('Tana DB runtime not initialized')
    }
    // Use executeReturning for DELETE with RETURNING, execute for plain DELETE
    if (this._returning) {
      return runtime.executeReturning(sql, params) as Promise<T['$inferSelect'][]>
    }
    await runtime.execute(sql, params)
    return [] as T['$inferSelect'][]
  }

  then<TReturn>(
    onfulfilled?: ((value: T['$inferSelect'][]) => TReturn | PromiseLike<TReturn>) | null,
    onrejected?: ((reason: unknown) => TReturn | PromiseLike<TReturn>) | null
  ): Promise<TReturn> {
    return this.execute().then(onfulfilled, onrejected)
  }
}

// Main db object (Drizzle-style entry point)
export const db = {
  select<T extends Record<string, unknown>>(columns?: T) {
    return new SelectQueryBuilder<T>().select(columns)
  },

  insert<T extends TableDefinition>(table: T) {
    return new InsertQueryBuilder(table)
  },

  update<T extends TableDefinition>(table: T) {
    return new UpdateQueryBuilder(table)
  },

  delete<T extends TableDefinition>(table: T) {
    return new DeleteQueryBuilder(table)
  },
}
