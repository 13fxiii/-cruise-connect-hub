import { db, ws, json, error } from '@appdeploy/sdk';

export async function notifySubscribers(entityType: string, entityId: string, payload: unknown, excludeConnectionId?: string) {
  const { items } = await db.list<any>('entity_subscriptions', { limit: 1000 });
  const ids = [...new Set(items.filter((x: any) => x.entity_type === entityType && x.entity_id === entityId && x.connection_id !== excludeConnectionId).map((x: any) => x.connection_id))];
  if (ids.length) await ws.send(ids, { v: 1, type: 'entity.update', payload: { entity_type: entityType, entity_id: entityId, data: payload } });
}

export const realtimeSubscriptionRoutes = {
  'POST /api/subscriptions': [async ({ body }: any) => {
    const { entity_type, entity_id, connection_id } = body || {};
    if (!entity_type || !entity_id || !connection_id) return error('entity_type, entity_id, connection_id are required');
    await db.add('entity_subscriptions', [{ entity_type, entity_id, connection_id, created_at: Date.now() }]);
    return json({ ok: true });
  }],
  'POST /api/subscriptions/remove': [async ({ body }: any) => {
    const { entity_type, entity_id, connection_id } = body || {};
    if (!entity_type || !entity_id || !connection_id) return error('entity_type, entity_id, connection_id are required');
    const { items } = await db.list<any>('entity_subscriptions', { limit: 1000 });
    const ids = items.filter((x: any) => x.entity_type === entity_type && x.entity_id === entity_id && x.connection_id === connection_id).map((x: any) => x.id);
    if (ids.length) await db.delete('entity_subscriptions', ids);
    return json({ ok: true });
  }]
};
