/**
 * tana/db - Tana Database Module
 *
 * Type-safe database layer with fluent query building and ActiveRecord-style models.
 */

// ============ Schema Definition ============

export interface Column<T = unknown, TName extends string = string> {
  readonly _type: T
  readonly _name: TName
  readonly _notNull: boolean
  readonly _hasDefault: boolean
  readonly _isPrimaryKey: boolean
  readonly columnType: string
  readonly columnName: string
}

export class ColumnBuilder<
  T,
  TName extends string,
  TNotNull extends boolean = false,
  THasDefault extends boolean = false,
  TIsPrimaryKey extends boolean = false
> {
  readonly _type: T
  readonly _name: TName
  readonly _notNull: TNotNull
  readonly _hasDefault: THasDefault
  readonly _isPrimaryKey: TIsPrimaryKey
  readonly columnType: string
  readonly columnName: TName

  notNull(): ColumnBuilder<T, TName, true, THasDefault, TIsPrimaryKey>
  default<TDefault extends T>(value: TDefault): ColumnBuilder<T, TName, TNotNull, true, TIsPrimaryKey>
  defaultNow(): ColumnBuilder<T, TName, TNotNull, true, TIsPrimaryKey>
  defaultRandom(): ColumnBuilder<T, TName, TNotNull, true, TIsPrimaryKey>
  primaryKey(): ColumnBuilder<T, TName, true, THasDefault, true>
  references<TRef extends Column<unknown, string>>(ref: () => TRef): ColumnBuilder<T, TName, TNotNull, THasDefault, TIsPrimaryKey>
}

export interface TableDefinition<
  TName extends string = string,
  TColumns extends Record<string, ColumnBuilder<unknown, string, boolean, boolean, boolean>> = Record<string, ColumnBuilder<unknown, string, boolean, boolean, boolean>>
> {
  readonly _name: TName
  readonly _columns: TColumns
  readonly tableName: string
  readonly columns: TColumns
  readonly $inferSelect: { [K in keyof TColumns]: InferColumnSelect<TColumns[K]> }
  readonly $inferInsert: { [K in keyof TColumns]: InferColumnInsert<TColumns[K]> }
}

type InferColumnSelect<T> = T extends ColumnBuilder<infer U, string, infer N, infer D, infer P>
  ? N extends true ? U : D extends true ? U : U | null
  : never

type InferColumnInsert<T> = T extends ColumnBuilder<infer U, string, infer N, infer D, infer P>
  ? N extends true
    ? D extends true ? U | undefined : U
    : U | null | undefined
  : never

export type Table<
  TName extends string = string,
  TColumns extends Record<string, ColumnBuilder<unknown, string, boolean, boolean, boolean>> = Record<string, ColumnBuilder<unknown, string, boolean, boolean, boolean>>
> = TableDefinition<TName, TColumns> & TColumns

export type InferSelectModel<T extends TableDefinition> = T['$inferSelect']
export type InferInsertModel<T extends TableDefinition> = T['$inferInsert']

// Column type constructors
export function table<
  TName extends string,
  TColumns extends Record<string, ColumnBuilder<unknown, string, boolean, boolean, boolean>>
>(name: TName, columns: TColumns): Table<TName, TColumns>

export function text<TName extends string>(name: TName): ColumnBuilder<string, TName>
export function varchar<TName extends string>(name: TName, config?: { length?: number }): ColumnBuilder<string, TName>
export function integer<TName extends string>(name: TName): ColumnBuilder<number, TName>
export function bigint<TName extends string>(name: TName): ColumnBuilder<bigint, TName>
export function serial<TName extends string>(name: TName): ColumnBuilder<number, TName, false, true>
export function boolean<TName extends string>(name: TName): ColumnBuilder<boolean, TName>
export function uuid<TName extends string>(name: TName): ColumnBuilder<string, TName>
export function timestamp<TName extends string>(name: TName, config?: { withTimezone?: boolean }): ColumnBuilder<Date, TName>
export function date<TName extends string>(name: TName): ColumnBuilder<Date, TName>
export function json<TName extends string, TData = unknown>(name: TName): ColumnBuilder<TData, TName>
export function jsonb<TName extends string, TData = unknown>(name: TName): ColumnBuilder<TData, TName>
export function numeric<TName extends string>(name: TName, config?: { precision?: number; scale?: number }): ColumnBuilder<string, TName>
export function real<TName extends string>(name: TName): ColumnBuilder<number, TName>
export function doublePrecision<TName extends string>(name: TName): ColumnBuilder<number, TName>

// ============ Query Builder ============

export type SQLValue = string | number | boolean | null | Date | bigint
export type SQLParam = SQLValue | SQLValue[]

export interface SQLCondition {
  readonly _type: 'condition'
  toSQL(paramIndex: number): { sql: string; params: SQLParam[]; nextIndex: number }
}

// Comparison operators
export function eq<T>(column: ColumnBuilder<T, string, boolean, boolean, boolean>, value: T): SQLCondition
export function ne<T>(column: ColumnBuilder<T, string, boolean, boolean, boolean>, value: T): SQLCondition
export function gt<T>(column: ColumnBuilder<T, string, boolean, boolean, boolean>, value: T): SQLCondition
export function gte<T>(column: ColumnBuilder<T, string, boolean, boolean, boolean>, value: T): SQLCondition
export function lt<T>(column: ColumnBuilder<T, string, boolean, boolean, boolean>, value: T): SQLCondition
export function lte<T>(column: ColumnBuilder<T, string, boolean, boolean, boolean>, value: T): SQLCondition
export function like(column: ColumnBuilder<string, string, boolean, boolean, boolean>, pattern: string): SQLCondition
export function ilike(column: ColumnBuilder<string, string, boolean, boolean, boolean>, pattern: string): SQLCondition
export function inArray<T>(column: ColumnBuilder<T, string, boolean, boolean, boolean>, values: T[]): SQLCondition
export function notInArray<T>(column: ColumnBuilder<T, string, boolean, boolean, boolean>, values: T[]): SQLCondition
export function isNull(column: ColumnBuilder<unknown, string, boolean, boolean, boolean>): SQLCondition
export function isNotNull(column: ColumnBuilder<unknown, string, boolean, boolean, boolean>): SQLCondition
export function between<T>(column: ColumnBuilder<T, string, boolean, boolean, boolean>, min: T, max: T): SQLCondition

// Logical operators
export function and(...conditions: SQLCondition[]): SQLCondition
export function or(...conditions: SQLCondition[]): SQLCondition
export function not(condition: SQLCondition): SQLCondition

// Ordering
export function asc(column: ColumnBuilder<unknown, string, boolean, boolean, boolean>): { column: ColumnBuilder<unknown, string, boolean, boolean, boolean>; direction: 'ASC' }
export function desc(column: ColumnBuilder<unknown, string, boolean, boolean, boolean>): { column: ColumnBuilder<unknown, string, boolean, boolean, boolean>; direction: 'DESC' }

// Aggregates
export function count(column?: ColumnBuilder<unknown, string, boolean, boolean, boolean>): { _aggregate: 'count'; column?: ColumnBuilder<unknown, string, boolean, boolean, boolean> }
export function sum(column: ColumnBuilder<number, string, boolean, boolean, boolean>): { _aggregate: 'sum'; column: ColumnBuilder<number, string, boolean, boolean, boolean> }
export function avg(column: ColumnBuilder<number, string, boolean, boolean, boolean>): { _aggregate: 'avg'; column: ColumnBuilder<number, string, boolean, boolean, boolean> }
export function min<T>(column: ColumnBuilder<T, string, boolean, boolean, boolean>): { _aggregate: 'min'; column: ColumnBuilder<T, string, boolean, boolean, boolean> }
export function max<T>(column: ColumnBuilder<T, string, boolean, boolean, boolean>): { _aggregate: 'max'; column: ColumnBuilder<T, string, boolean, boolean, boolean> }

// Query builders
export class SelectQueryBuilder<T extends TableDefinition, TResult = T['$inferSelect']> implements PromiseLike<TResult[]> {
  from<TTable extends TableDefinition>(table: TTable): SelectQueryBuilder<TTable, TTable['$inferSelect']>
  select(): SelectQueryBuilder<T, T['$inferSelect']>
  select<TSelection extends Partial<{ [K in keyof T['columns']]: T['columns'][K] }>>(
    selection: TSelection
  ): SelectQueryBuilder<T, { [K in keyof TSelection]: InferColumnSelect<TSelection[K]> }>
  where(condition: SQLCondition): SelectQueryBuilder<T, TResult>
  orderBy(...orders: Array<{ column: ColumnBuilder<unknown, string, boolean, boolean, boolean>; direction: 'ASC' | 'DESC' }>): SelectQueryBuilder<T, TResult>
  limit(count: number): SelectQueryBuilder<T, TResult>
  offset(count: number): SelectQueryBuilder<T, TResult>
  execute(): Promise<TResult[]>
  then<TRes, TRej = never>(
    onfulfilled?: ((value: TResult[]) => TRes | PromiseLike<TRes>) | null,
    onrejected?: ((reason: unknown) => TRej | PromiseLike<TRej>) | null
  ): Promise<TRes | TRej>
}

export class InsertQueryBuilder<T extends TableDefinition> implements PromiseLike<T['$inferSelect'][]> {
  values(data: T['$inferInsert'] | T['$inferInsert'][]): InsertQueryBuilder<T>
  returning(): InsertQueryBuilder<T>
  execute(): Promise<T['$inferSelect'][]>
  then<TRes, TRej = never>(
    onfulfilled?: ((value: T['$inferSelect'][]) => TRes | PromiseLike<TRes>) | null,
    onrejected?: ((reason: unknown) => TRej | PromiseLike<TRej>) | null
  ): Promise<TRes | TRej>
}

export class UpdateQueryBuilder<T extends TableDefinition> implements PromiseLike<T['$inferSelect'][]> {
  set(data: Partial<T['$inferInsert']>): UpdateQueryBuilder<T>
  where(condition: SQLCondition): UpdateQueryBuilder<T>
  returning(): UpdateQueryBuilder<T>
  execute(): Promise<T['$inferSelect'][]>
  then<TRes, TRej = never>(
    onfulfilled?: ((value: T['$inferSelect'][]) => TRes | PromiseLike<TRes>) | null,
    onrejected?: ((reason: unknown) => TRej | PromiseLike<TRej>) | null
  ): Promise<TRes | TRej>
}

export class DeleteQueryBuilder<T extends TableDefinition> implements PromiseLike<T['$inferSelect'][]> {
  where(condition: SQLCondition): DeleteQueryBuilder<T>
  returning(): DeleteQueryBuilder<T>
  execute(): Promise<T['$inferSelect'][]>
  then<TRes, TRej = never>(
    onfulfilled?: ((value: T['$inferSelect'][]) => TRes | PromiseLike<TRes>) | null,
    onrejected?: ((reason: unknown) => TRej | PromiseLike<TRej>) | null
  ): Promise<TRes | TRej>
}

// Main db object
export const db: {
  select(): SelectQueryBuilder<TableDefinition>
  select<T extends TableDefinition, TSelection extends Partial<{ [K in keyof T['columns']]: T['columns'][K] }>>(
    selection: TSelection
  ): SelectQueryBuilder<T, { [K in keyof TSelection]: InferColumnSelect<TSelection[K]> }>
  insert<T extends TableDefinition>(table: T): InsertQueryBuilder<T>
  update<T extends TableDefinition>(table: T): UpdateQueryBuilder<T>
  delete<T extends TableDefinition>(table: T): DeleteQueryBuilder<T>
}

// ============ ActiveRecord-style Model ============

export interface ModelInstance<T extends TableDefinition> {
  save(): Promise<void>
  update(data: Partial<T['$inferInsert']>): Promise<void>
  delete(): Promise<void>
  reload(): Promise<void>
}

export interface Model<T extends TableDefinition> {
  find(id: unknown): Promise<(T['$inferSelect'] & ModelInstance<T>) | null>
  findBy(column: keyof T['$inferSelect'], value: unknown): Promise<(T['$inferSelect'] & ModelInstance<T>) | null>
  where(conditions: Partial<T['$inferSelect']> | SQLCondition): QueryChain<T>
  all(): Promise<(T['$inferSelect'] & ModelInstance<T>)[]>
  first(): Promise<(T['$inferSelect'] & ModelInstance<T>) | null>
  last(): Promise<(T['$inferSelect'] & ModelInstance<T>) | null>
  count(): Promise<number>
  create(data: T['$inferInsert']): Promise<T['$inferSelect'] & ModelInstance<T>>
  updateAll(conditions: Partial<T['$inferSelect']>, data: Partial<T['$inferInsert']>): Promise<number>
  deleteAll(conditions?: Partial<T['$inferSelect']>): Promise<number>
}

export class QueryChain<T extends TableDefinition> {
  where(conditions: Partial<T['$inferSelect']> | SQLCondition): QueryChain<T>
  order(column: keyof T['$inferSelect'], direction?: 'ASC' | 'DESC'): QueryChain<T>
  limit(count: number): QueryChain<T>
  offset(count: number): QueryChain<T>
  select<K extends keyof T['$inferSelect']>(...columns: K[]): QueryChain<T>
  count(): Promise<number>
  execute(): Promise<(T['$inferSelect'] & ModelInstance<T>)[]>
  then<TRes, TRej = never>(
    onfulfilled?: ((value: (T['$inferSelect'] & ModelInstance<T>)[]) => TRes | PromiseLike<TRes>) | null,
    onrejected?: ((reason: unknown) => TRej | PromiseLike<TRej>) | null
  ): Promise<TRes | TRej>
}

export function model<T extends TableDefinition>(table: T): Model<T>
