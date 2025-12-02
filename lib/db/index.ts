/**
 * tana/db - Tana Database Module
 *
 * Type-safe database layer with fluent query building and ActiveRecord-style models.
 * Bundled into tana contracts at build time, runtime provided by tana-edge.
 */

// Schema definition
export {
  table,
  text,
  varchar,
  integer,
  bigint,
  serial,
  boolean,
  uuid,
  timestamp,
  date,
  json,
  jsonb,
  numeric,
  real,
  doublePrecision,
  ColumnBuilder,
  type Table,
  type TableDefinition,
  type Column,
  type InferSelectModel,
  type InferInsertModel,
} from './schema.js'

// Query builder
export {
  db,
  eq,
  ne,
  gt,
  gte,
  lt,
  lte,
  like,
  ilike,
  inArray,
  notInArray,
  isNull,
  isNotNull,
  between,
  and,
  or,
  not,
  asc,
  desc,
  count,
  sum,
  avg,
  min,
  max,
  SelectQueryBuilder,
  InsertQueryBuilder,
  UpdateQueryBuilder,
  DeleteQueryBuilder,
  type SQLCondition,
  type SQLValue,
  type SQLParam,
} from './query.js'

// ActiveRecord-style model
export {
  model,
  QueryChain,
  type Model,
  type ModelInstance,
} from './model.js'
