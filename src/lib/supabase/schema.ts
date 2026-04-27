import type { Database } from '@/types/database';

export type SchemaName = Exclude<keyof Database, '__InternalSupabase'>;

export function normalizeSchema(maybeSchema: string | undefined): SchemaName | undefined {
  const schema = (maybeSchema || '').trim().replace(/\.+$/, '');
  if (!schema) return undefined;
  if (/\[.*\]/.test(schema) || /your[_ -]?schema/i.test(schema)) return undefined;
  if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(schema)) return undefined;
  if (schema.toLowerCase() === 'public') return undefined;
  return schema as SchemaName;
}
