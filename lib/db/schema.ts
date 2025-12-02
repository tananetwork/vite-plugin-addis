/**
 * Schema definition for Tana DB
 *
 * Drizzle-style declarative schema with full TypeScript inference.
 */

// Column type brands for type inference
declare const ColumnBrand: unique symbol
type ColumnBrand<T> = { [ColumnBrand]: T }

// Base column type
export interface Column<T = unknown, TName extends string = string> {
  readonly _type: T
  readonly _name: TName
  readonly _notNull: boolean
  readonly _hasDefault: boolean
  readonly _isPrimaryKey: boolean
  readonly columnType: string
  readonly columnName: string
  readonly references?: () => Column<unknown, string>
  readonly defaultValue?: unknown
}

// Column builder for fluent API
export class ColumnBuilder<
  T,
  TName extends string,
  TNotNull extends boolean = false,
  THasDefault extends boolean = false,
  TIsPrimaryKey extends boolean = false
> {
  readonly _type!: T
  readonly _name!: TName
  readonly _notNull!: TNotNull
  readonly _hasDefault!: THasDefault
  readonly _isPrimaryKey!: TIsPrimaryKey

  constructor(
    public readonly columnType: string,
    public readonly columnName: TName,
    private _references?: () => Column<unknown, string>,
    private _defaultValue?: unknown,
    private _notNullFlag: boolean = false,
    private _hasDefaultFlag: boolean = false,
    private _isPrimaryKeyFlag: boolean = false
  ) {}

  get defaultValue() {
    return this._defaultValue
  }

  getReferences() {
    return this._references
  }

  notNull(): ColumnBuilder<T, TName, true, THasDefault, TIsPrimaryKey> {
    return new ColumnBuilder(
      this.columnType,
      this.columnName,
      this._references,
      this._defaultValue,
      true,
      this._hasDefaultFlag,
      this._isPrimaryKeyFlag
    )
  }

  default<TDefault extends T>(
    value: TDefault
  ): ColumnBuilder<T, TName, TNotNull, true, TIsPrimaryKey> {
    return new ColumnBuilder(
      this.columnType,
      this.columnName,
      this._references,
      value,
      this._notNullFlag,
      true,
      this._isPrimaryKeyFlag
    )
  }

  defaultNow(): ColumnBuilder<T, TName, TNotNull, true, TIsPrimaryKey> {
    return new ColumnBuilder(
      this.columnType,
      this.columnName,
      this._references,
      { __defaultNow: true },
      this._notNullFlag,
      true,
      this._isPrimaryKeyFlag
    )
  }

  defaultRandom(): ColumnBuilder<T, TName, TNotNull, true, TIsPrimaryKey> {
    return new ColumnBuilder(
      this.columnType,
      this.columnName,
      this._references,
      { __defaultRandom: true },
      this._notNullFlag,
      true,
      this._isPrimaryKeyFlag
    )
  }

  primaryKey(): ColumnBuilder<T, TName, true, THasDefault, true> {
    return new ColumnBuilder(
      this.columnType,
      this.columnName,
      this._references,
      this._defaultValue,
      true, // Primary keys are implicitly NOT NULL
      this._hasDefaultFlag,
      true
    )
  }

  references<TRef extends Column<unknown, string>>(
    ref: () => TRef
  ): ColumnBuilder<T, TName, TNotNull, THasDefault, TIsPrimaryKey> {
    return new ColumnBuilder(
      this.columnType,
      this.columnName,
      ref as () => Column<unknown, string>,
      this._defaultValue,
      this._notNullFlag,
      this._hasDefaultFlag,
      this._isPrimaryKeyFlag
    )
  }

  // Internal: Get column metadata for SQL generation
  _getMeta() {
    return {
      type: this.columnType,
      name: this.columnName,
      notNull: this._notNullFlag,
      hasDefault: this._hasDefaultFlag,
      isPrimaryKey: this._isPrimaryKeyFlag,
      defaultValue: this._defaultValue,
      references: this._references,
    }
  }
}

// Column type constructors
export function text<TName extends string>(
  name: TName
): ColumnBuilder<string, TName> {
  return new ColumnBuilder('text', name)
}

export function varchar<TName extends string>(
  name: TName,
  config?: { length?: number }
): ColumnBuilder<string, TName> {
  return new ColumnBuilder(config?.length ? `varchar(${config.length})` : 'varchar', name)
}

export function integer<TName extends string>(
  name: TName
): ColumnBuilder<number, TName> {
  return new ColumnBuilder('integer', name)
}

export function bigint<TName extends string>(
  name: TName
): ColumnBuilder<bigint, TName> {
  return new ColumnBuilder('bigint', name)
}

export function serial<TName extends string>(
  name: TName
): ColumnBuilder<number, TName, false, true> {
  return new ColumnBuilder('serial', name, undefined, undefined, false, true)
}

export function boolean<TName extends string>(
  name: TName
): ColumnBuilder<boolean, TName> {
  return new ColumnBuilder('boolean', name)
}

export function uuid<TName extends string>(
  name: TName
): ColumnBuilder<string, TName> {
  return new ColumnBuilder('uuid', name)
}

export function timestamp<TName extends string>(
  name: TName,
  config?: { withTimezone?: boolean }
): ColumnBuilder<Date, TName> {
  const type = config?.withTimezone ? 'timestamptz' : 'timestamp'
  return new ColumnBuilder(type, name)
}

export function date<TName extends string>(
  name: TName
): ColumnBuilder<Date, TName> {
  return new ColumnBuilder('date', name)
}

export function json<TName extends string, TData = unknown>(
  name: TName
): ColumnBuilder<TData, TName> {
  return new ColumnBuilder('json', name)
}

export function jsonb<TName extends string, TData = unknown>(
  name: TName
): ColumnBuilder<TData, TName> {
  return new ColumnBuilder('jsonb', name)
}

export function numeric<TName extends string>(
  name: TName,
  config?: { precision?: number; scale?: number }
): ColumnBuilder<string, TName> {
  let type = 'numeric'
  if (config?.precision) {
    type = config.scale
      ? `numeric(${config.precision}, ${config.scale})`
      : `numeric(${config.precision})`
  }
  return new ColumnBuilder(type, name)
}

export function real<TName extends string>(
  name: TName
): ColumnBuilder<number, TName> {
  return new ColumnBuilder('real', name)
}

export function doublePrecision<TName extends string>(
  name: TName
): ColumnBuilder<number, TName> {
  return new ColumnBuilder('double precision', name)
}

// Table type inference helpers
type InferColumnSelect<T> = T extends ColumnBuilder<infer U, string, infer N, infer D, infer P>
  ? N extends true
    ? U
    : D extends true
    ? U
    : U | null
  : never

type InferColumnInsert<T> = T extends ColumnBuilder<infer U, string, infer N, infer D, infer P>
  ? N extends true
    ? D extends true
      ? U | undefined
      : U
    : U | null | undefined
  : never

// Table definition
export interface TableDefinition<
  TName extends string = string,
  TColumns extends Record<string, ColumnBuilder<unknown, string, boolean, boolean, boolean>> = Record<string, ColumnBuilder<unknown, string, boolean, boolean, boolean>>
> {
  readonly _name: TName
  readonly _columns: TColumns
  readonly tableName: string
  readonly columns: TColumns

  // Type inference helpers (Drizzle-compatible)
  readonly $inferSelect: { [K in keyof TColumns]: InferColumnSelect<TColumns[K]> }
  readonly $inferInsert: { [K in keyof TColumns]: InferColumnInsert<TColumns[K]> }
}

class Table<
  TName extends string,
  TColumns extends Record<string, ColumnBuilder<unknown, string, boolean, boolean, boolean>>
> implements TableDefinition<TName, TColumns> {
  readonly _name!: TName
  readonly _columns!: TColumns
  readonly $inferSelect!: { [K in keyof TColumns]: InferColumnSelect<TColumns[K]> }
  readonly $inferInsert!: { [K in keyof TColumns]: InferColumnInsert<TColumns[K]> }

  constructor(
    public readonly tableName: TName,
    public readonly columns: TColumns
  ) {}

  // Get column by property name
  getColumn<K extends keyof TColumns>(key: K): TColumns[K] {
    return this.columns[key]
  }

  // Get all column metadata for SQL generation
  _getColumnsMeta() {
    return Object.entries(this.columns).map(([key, col]) => ({
      propertyName: key,
      ...(col as ColumnBuilder<unknown, string, boolean, boolean, boolean>)._getMeta(),
    }))
  }
}

// Main table() function
export function table<
  TName extends string,
  TColumns extends Record<string, ColumnBuilder<unknown, string, boolean, boolean, boolean>>
>(name: TName, columns: TColumns): Table<TName, TColumns> & TColumns {
  const tbl = new Table(name, columns)

  // Create a proxy that allows accessing columns directly on the table
  // e.g., posts.id, posts.title
  return new Proxy(tbl, {
    get(target, prop) {
      if (prop in target) {
        return (target as unknown as Record<string | symbol, unknown>)[prop]
      }
      if (prop in target.columns) {
        return target.columns[prop as keyof TColumns]
      }
      return undefined
    },
  }) as Table<TName, TColumns> & TColumns
}

// Re-export types for external use
export type { Table }
export type InferSelectModel<T extends TableDefinition> = T['$inferSelect']
export type InferInsertModel<T extends TableDefinition> = T['$inferInsert']
