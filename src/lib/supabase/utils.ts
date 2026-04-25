import type { Database } from '@/types/database';

export type SchemaName = Exclude<keyof Database, '__InternalSupabase'>;

export function normalizeSchema(maybeSchema: string | undefined): SchemaName | undefined {
  const schema = (maybeSchema || '').trim().replace(/\.+$/, '');
  if (!schema) return undefined;
  // Avoid placeholder values accidentally set in hosting dashboards.
  if (/\[.*\]/.test(schema) || /your[_ -]?schema/i.test(schema)) return undefined;
  // Ignore unsafe/misconfigured values often set in hosting dashboards.
  if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(schema)) return undefined;
  // "public" can be invalid when PostgREST Exposed Schemas excludes it.
  if (schema.toLowerCase() === 'public') return undefined;
  return schema as SchemaName;
}
