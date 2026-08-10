import { router, json, error, requireAuth, db } from '@appdeploy/sdk';
import { notifySubscribers, realtimeSubscriptionRoutes } from './realtime-subscribers';

const games = ['Cruise or Cap', 'Spin Am', 'Draw Am', 'Who Dey Lie?', 'Cruise Cards'];
const bots = ['Cruise Bot 〽️', 'Cruise Bot 2〽️', 'Cruise Bot 3〽️', 'Cruise Bot 4〽️'];
const cruiseId = (id: string) => `BC-${id.replace(/-/g, '').slice(0, 10).toUpperCase()}`;
const roomCode = () => Math.random().toString(36).slice(2, 7).toUpperCase();
const isBot = (id: string) => id.startsWith('bot:');
const fillBots = (room: any, target = 3) => {
  const ids = [...(room.playerIds || [])], names = [...(room.playerNames || [])], ready = [...(room.readyIds || [])], botIds = [...(room.botIds || [])];
  while (ids.length < target) { const i = botIds.length; const id = `bot:${room.id}:${i}`; botIds.push(id); ids.push(id); names.push(bots[i % bots.length]); ready.push(id); }
  const uniqueReady = [...new Set(ready)];
  return { ...room, playerIds: ids, playerNames: names, botIds, readyIds: uniqueReady, readyCount: uniqueReady.length, playerCount: ids.length, targetPlayers: target };
};

export const handler = router({
  ...realtimeSubscriptionRoutes,
  'GET /api/_healthcheck': [async () => json({ message: 'Success', service: 'BCH', backend: 'AppDeploy' })],
  'GET /api/profile': [requireAuth(), async (ctx) => {
    const { items } = await db.list<any>('profiles', { limit: 1000 });
    const own = items.find(x => x.userId === ctx.user!.userId);
    if (own) return json(own);
    const record = { userId: ctx.user!.userId, cruiseId: cruiseId(ctx.user!.userId), name: ctx.user!.name || 'BIG CRUISE User', email: ctx.user!.email || null, picture: ctx.user!.picture || null, provider: 'x' };
    const [id] = await db.add('profiles', [record]);
    return id ? json({ ...record, id }, 201) : error('Unable to create profile', 500);
  }],
  'POST /api/profile/sync': [requireAuth(), async (ctx) => {
    const b = (ctx.body || {}) as any;
    const { items } = await db.list<any>('profiles', { limit: 1000 });
    const own = items.find(x => x.userId === ctx.user!.userId);
    const record = { ...(own || {}), userId: ctx.user!.userId, cruiseId: own?.cruiseId || cruiseId(ctx.user!.userId), name: String(b.name || ctx.user!.name || own?.name || 'BIG CRUISE User'), email: ctx.user!.email || own?.email || null, picture: String(b.picture || ctx.user!.picture || own?.picture || '') || null, provider: 'x' };
    if (own) { await db.update('profiles', [{ id: own.id, record }]); return json({ ...record, id: own.id }); }
    const [id] = await db.add('profiles', [record]);
    return id ? json({ ...record, id }, 201) : error('Unable to sync profile', 500);
  }],
  'POST /api/game-rooms': [requireAuth(), async (ctx) => {
    const b = (ctx.body || {}) as any;
    const game = games.includes(b.game) ? b.game : 'Cruise or Cap';
    const target = Math.max(3, Math.min(12, Number(b.targetPlayers) || 3));
    let room: any = { game, mode: b.mode === 'Explicit' ? 'Explicit' : 'Clean', playMode: ['solo', 'bots', 'players'].includes(b.playMode) ? b.playMode : 'players', targetPlayers: target, code: roomCode(), status: 'waiting', hostId: ctx.user!.userId, playerIds: [ctx.user!.userId], playerNames: [b.name || ctx.user!.name || 'Cruiser'], readyIds: [], readyCount: 0, playerCount: 1, round: 1, createdAt: Date.now() };
    const [id] = await db.add('game_rooms', [room]);
    if (!id) return error('Unable to create room', 500);
    room.id = id;
    if (room.playMode !== 'players') { room = fillBots(room, target); await db.update('game_rooms', [{ id, record: room }]); }
    return json(room, 201);
  }],
  'POST /api/game-rooms/join': [requireAuth(), async (ctx) => {
    const b = (ctx.body || {}) as any;
    const { items } = await db.list<any>('game_rooms', { limit: 1000 });
    const room = items.find(x => x.code === String(b.code || '').toUpperCase() && x.status === 'waiting');
    if (!room) return error('Room not found', 404);
    const ids = [...(room.playerIds || [])];
    if (!ids.includes(ctx.user!.userId)) {
      if (ids.length >= Number(room.targetPlayers || 12)) return error('This lobby is full', 409);
      ids.push(ctx.user!.userId);
      room.playerIds = ids;
      room.playerNames = [...(room.playerNames || []), b.name || ctx.user!.name || 'Cruiser'];
      room.playerCount = ids.length;
      await db.update('game_rooms', [{ id: room.id, record: room }]);
      await notifySubscribers('room', room.id, room);
    }
    return json(room);
  }],
  'POST /api/game-rooms/fill-bots': [requireAuth(), async (ctx) => {
    const b = (ctx.body || {}) as any;
    const [room] = await db.get<any>('game_rooms', [String(b.roomId)]);
    if (!room) return error('Room not found', 404);
    if (room.hostId !== ctx.user!.userId) return error('Only the host can add bots', 403);
    const filled = fillBots({ ...room, id: String(b.roomId) }, Number(b.targetPlayers || room.targetPlayers || 3));
    await db.update('game_rooms', [{ id: String(b.roomId), record: filled }]);
    await notifySubscribers('room', String(b.roomId), filled);
    return json(filled);
  }],
  'POST /api/game-rooms/ready': [requireAuth(), async (ctx) => {
    const b = (ctx.body || {}) as any;
    const [room] = await db.get<any>('game_rooms', [String(b.roomId)]);
    if (!room) return error('Room not found', 404);
    const uid = ctx.user!.userId;
    const readyIds = (room.readyIds || []).filter((x: string) => x !== uid);
    if (b.ready) readyIds.push(uid);
    const updated = { ...room, readyIds, readyCount: readyIds.length };
    await db.update('game_rooms', [{ id: String(b.roomId), record: updated }]);
    await notifySubscribers('room', String(b.roomId), updated);
    return json(updated);
  }],
  'POST /api/game-rooms/comment': [requireAuth(), async (ctx) => {
    const b = (ctx.body || {}) as any;
    const roomId = String(b.roomId || ''), text = String(b.text || '').trim().slice(0, 240);
    if (!roomId || !text) return error('Room and comment are required', 400);
    const [id] = await db.add('game_comments', [{ roomId, userId: ctx.user!.userId, name: ctx.user!.name || 'Cruiser', text, createdAt: Date.now() }]);
    if (!id) return error('Unable to add comment', 500);
    const comment = { id, roomId, userId: ctx.user!.userId, name: ctx.user!.name || 'Cruiser', text, createdAt: Date.now() };
    await notifySubscribers('room-comments', roomId, comment);
    return json(comment, 201);
  }],
  'GET /api/game-rooms/comments': [requireAuth(), async (ctx) => {
    const roomId = String(ctx.query.roomId || '');
    const { items } = await db.list<any>('game_comments', { limit: 500 });
    return json({ comments: items.filter(x => x.roomId === roomId).sort((a, b) => Number(a.createdAt) - Number(b.createdAt)).slice(-80) });
  }],
  'GET /api/game-rooms/role': [requireAuth(), async (ctx) => {
    const [room] = await db.get<any>('game_rooms', [String(ctx.query.roomId || '')]);
    const role = room?.roleMap?.[ctx.user!.userId];
    return role ? json({ role }) : error('Role not assigned', 404);
  }],
  'GET /api/game-rooms/team': [requireAuth(), async (ctx) => {
    const [room] = await db.get<any>('game_rooms', [String(ctx.query.roomId || '')]);
    const role = room?.roleMap?.[ctx.user!.userId];
    if (!role) return error('Role not assigned', 404);
    const ids = role === 'LIAR' ? Object.keys(room.roleMap || {}).filter(id => room.roleMap[id] === 'LIAR' && id !== ctx.user!.userId) : [];
    return json({ role, teammates: ids.map(id => ({ userId: id, name: room.playerNames?.[room.playerIds?.indexOf(id)] || 'Cruiser', role: 'LIAR' })) });
  }]
});
