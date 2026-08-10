import { router, json, error, requireAuth, db } from '@appdeploy/sdk';
import { notifySubscribers, realtimeSubscriptionRoutes } from './realtime-subscribers';

const games = ['Cruise or Cap', 'Spin Am', 'Draw Am', 'Who Dey Lie?', 'Cruise Cards'];
const bots = ['Cruise Bot 〽️', 'Cruise Bot 2〽️', 'Cruise Bot 3〽️', 'Cruise Bot 4〽️'];
const cruiseId = (id: string) => `BC-${id.replace(/-/g, '').slice(0, 10).toUpperCase()}`;
const roomCode = () => Math.random().toString(36).slice(2, 7).toUpperCase();
const fillBots = (room: any, target = 3) => {
  const ids = [...(room.playerIds || [])], names = [...(room.playerNames || [])], ready = [...(room.readyIds || [])], botIds = [...(room.botIds || [])];
  while (ids.length < target) { const i = botIds.length; const id = `bot:${room.id}:${i}`; botIds.push(id); ids.push(id); names.push(bots[i % bots.length]); ready.push(id); }
  const uniqueReady = [...new Set(ready)];
  return { ...room, playerIds: ids, playerNames: names, botIds, readyIds: uniqueReady, readyCount: uniqueReady.length, playerCount: ids.length, targetPlayers: target };
};
const userId = (ctx: any) => ctx.user!.userId;
const now = () => Date.now();

export const handler = router({
  ...realtimeSubscriptionRoutes,
  'GET /api/_healthcheck': [async () => json({ message: 'Success', service: 'BCH', backend: 'AppDeploy' })],
  'GET /api/profile': [requireAuth(), async (ctx) => {
    const { items } = await db.list<any>('profiles', { limit: 1000 });
    const own = items.find(x => x.userId === userId(ctx));
    if (own) return json(own);
    const record = { userId: userId(ctx), cruiseId: cruiseId(userId(ctx)), name: ctx.user!.name || 'BIG CRUISE User', email: ctx.user!.email || null, picture: ctx.user!.picture || null, provider: 'x' };
    const [id] = await db.add('profiles', [record]);
    return id ? json({ ...record, id }, 201) : error('Unable to create profile', 500);
  }],
  'POST /api/profile/sync': [requireAuth(), async (ctx) => {
    const b = (ctx.body || {}) as any;
    const { items } = await db.list<any>('profiles', { limit: 1000 });
    const own = items.find(x => x.userId === userId(ctx));
    const record = { ...(own || {}), userId: userId(ctx), cruiseId: own?.cruiseId || cruiseId(userId(ctx)), name: String(b.name || ctx.user!.name || own?.name || 'BIG CRUISE User'), email: ctx.user!.email || own?.email || null, picture: String(b.picture || ctx.user!.picture || own?.picture || '') || null, provider: 'x' };
    if (own) { await db.update('profiles', [{ id: own.id, record }]); return json({ ...record, id: own.id }); }
    const [id] = await db.add('profiles', [record]);
    return id ? json({ ...record, id }, 201) : error('Unable to sync profile', 500);
  }],
  'POST /api/game-rooms': [requireAuth(), async (ctx) => {
    const b = (ctx.body || {}) as any;
    const game = games.includes(b.game) ? b.game : 'Cruise or Cap';
    const target = Math.max(1, Math.min(12, Number(b.targetPlayers) || 3));
    let room: any = { game, mode: b.mode === 'Explicit' ? 'Explicit' : 'Clean', playMode: ['solo', 'bots', 'players'].includes(b.playMode) ? b.playMode : 'players', targetPlayers: target, code: roomCode(), status: 'waiting', hostId: userId(ctx), playerIds: [userId(ctx)], playerNames: [b.name || ctx.user!.name || 'Cruiser'], readyIds: [], readyCount: 0, playerCount: 1, round: 1, createdAt: now() };
    const [id] = await db.add('game_rooms', [room]);
    if (!id) return error('Unable to create room', 500);
    room.id = id;
    if (room.playMode !== 'players' || target === 1) { room = fillBots(room, target); await db.update('game_rooms', [{ id, record: room }]); }
    return json(room, 201);
  }],
  'POST /api/game-rooms/join': [requireAuth(), async (ctx) => {
    const b = (ctx.body || {}) as any;
    const { items } = await db.list<any>('game_rooms', { limit: 1000 });
    const room = items.find(x => x.code === String(b.code || '').toUpperCase() && x.status === 'waiting');
    if (!room) return error('Room not found', 404);
    const ids = [...(room.playerIds || [])];
    if (!ids.includes(userId(ctx))) {
      if (ids.length >= Number(room.targetPlayers || 12)) return error('This lobby is full', 409);
      ids.push(userId(ctx)); room.playerIds = ids; room.playerNames = [...(room.playerNames || []), b.name || ctx.user!.name || 'Cruiser']; room.playerCount = ids.length;
      await db.update('game_rooms', [{ id: room.id, record: room }]); await notifySubscribers('room', room.id, room);
    }
    return json(room);
  }],
  'POST /api/game-rooms/fill-bots': [requireAuth(), async (ctx) => {
    const b = (ctx.body || {}) as any; const [room] = await db.get<any>('game_rooms', [String(b.roomId)]);
    if (!room) return error('Room not found', 404); if (room.hostId !== userId(ctx)) return error('Only the host can add bots', 403);
    const filled = fillBots({ ...room, id: String(b.roomId) }, Number(b.targetPlayers || room.targetPlayers || 3));
    await db.update('game_rooms', [{ id: String(b.roomId), record: filled }]); await notifySubscribers('room', String(b.roomId), filled); return json(filled);
  }],
  'POST /api/game-rooms/ready': [requireAuth(), async (ctx) => {
    const b = (ctx.body || {}) as any; const [room] = await db.get<any>('game_rooms', [String(b.roomId)]);
    if (!room) return error('Room not found', 404); const uid = userId(ctx); const readyIds = (room.readyIds || []).filter((x: string) => x !== uid); if (b.ready) readyIds.push(uid);
    const updated = { ...room, readyIds, readyCount: readyIds.length }; await db.update('game_rooms', [{ id: String(b.roomId), record: updated }]); await notifySubscribers('room', String(b.roomId), updated); return json(updated);
  }],
  'POST /api/game-rooms/comment': [requireAuth(), async (ctx) => {
    const b = (ctx.body || {}) as any; const roomId = String(b.roomId || ''), text = String(b.text || '').trim().slice(0, 240); if (!roomId || !text) return error('Room and comment are required', 400);
    const comment = { roomId, userId: userId(ctx), name: ctx.user!.name || 'Cruiser', text, createdAt: now() }; const [id] = await db.add('game_comments', [comment]); if (!id) return error('Unable to add comment', 500);
    const saved = { ...comment, id }; await notifySubscribers('room-comments', roomId, saved); return json(saved, 201);
  }],
  'GET /api/game-rooms/comments': [requireAuth(), async (ctx) => { const roomId = String(ctx.query.roomId || ''); const { items } = await db.list<any>('game_comments', { limit: 500 }); return json({ comments: items.filter(x => x.roomId === roomId).sort((a, b) => Number(a.createdAt) - Number(b.createdAt)).slice(-80) }); }],
  'GET /api/game-rooms/role': [requireAuth(), async (ctx) => { const [room] = await db.get<any>('game_rooms', [String(ctx.query.roomId || '')]); const role = room?.roleMap?.[userId(ctx)]; return role ? json({ role }) : error('Role not assigned', 404); }],
  'GET /api/game-rooms/team': [requireAuth(), async (ctx) => { const [room] = await db.get<any>('game_rooms', [String(ctx.query.roomId || '')]); const role = room?.roleMap?.[userId(ctx)]; if (!role) return error('Role not assigned', 404); const ids = role === 'LIAR' ? Object.keys(room.roleMap || {}).filter(id => room.roleMap[id] === 'LIAR' && id !== userId(ctx)) : []; return json({ role, teammates: ids.map(id => ({ userId: id, name: room.playerNames?.[room.playerIds?.indexOf(id)] || 'Cruiser', role: 'LIAR' })) }); }],
  'GET /api/posts': [requireAuth(), async () => { const { items } = await db.list<any>('posts', { limit: 200 }); return json({ posts: items.sort((a, b) => Number(b.createdAt || 0) - Number(a.createdAt || 0)) }); }],
  'POST /api/posts': [requireAuth(), async (ctx) => { const b = (ctx.body || {}) as any; const content = String(b.content || '').trim().slice(0, 500); if (!content) return error('Post content is required', 400); const post = { authorId: userId(ctx), authorName: ctx.user!.name || 'Cruiser', authorPicture: ctx.user!.picture || null, content, likesCount: 0, commentsCount: 0, createdAt: now() }; const [id] = await db.add('posts', [post]); if (!id) return error('Unable to create post', 500); const saved = { ...post, id }; await notifySubscribers('feed', 'global', saved); return json(saved, 201); }],
  'POST /api/posts/:id/like': [requireAuth(), async (ctx) => { const id = String(ctx.params.id); const { items } = await db.list<any>('post_likes', { limit: 1000 }); const existing = items.find(x => x.postId === id && x.userId === userId(ctx)); if (existing) return json({ liked: true }); const [likeId] = await db.add('post_likes', [{ postId: id, userId: userId(ctx), createdAt: now() }]); if (!likeId) return error('Unable to like post', 500); return json({ liked: true }); }],
  'DELETE /api/posts/:id/like': [requireAuth(), async (ctx) => { const id = String(ctx.params.id); const { items } = await db.list<any>('post_likes', { limit: 1000 }); const existing = items.find(x => x.postId === id && x.userId === userId(ctx)); if (existing) await db.delete('post_likes', [existing.id]); return json({ liked: false }); }],
  'GET /api/posts/:id/comments': [requireAuth(), async (ctx) => { const postId = String(ctx.params.id); const { items } = await db.list<any>('post_comments', { limit: 500 }); return json({ comments: items.filter(x => x.postId === postId).sort((a, b) => Number(a.createdAt) - Number(b.createdAt)) }); }],
  'POST /api/posts/:id/comments': [requireAuth(), async (ctx) => { const postId = String(ctx.params.id); const b = (ctx.body || {}) as any; const text = String(b.text || '').trim().slice(0, 240); if (!text) return error('Comment is required', 400); const comment = { postId, userId: userId(ctx), name: ctx.user!.name || 'Cruiser', picture: ctx.user!.picture || null, text, createdAt: now() }; const [id] = await db.add('post_comments', [comment]); if (!id) return error('Unable to comment', 500); const saved = { ...comment, id }; await notifySubscribers('feed-comments', postId, saved); return json(saved, 201); }],
  'POST /api/follows/:targetUserId': [requireAuth(), async (ctx) => { const target = String(ctx.params.targetUserId); if (target === userId(ctx)) return error('Cannot follow yourself', 400); const { items } = await db.list<any>('follows', { limit: 1000 }); if (!items.some(x => x.followerId === userId(ctx) && x.followingId === target)) await db.add('follows', [{ followerId: userId(ctx), followingId: target, createdAt: now() }]); return json({ following: true }); }],
  'DELETE /api/follows/:targetUserId': [requireAuth(), async (ctx) => { const target = String(ctx.params.targetUserId); const { items } = await db.list<any>('follows', { limit: 1000 }); const existing = items.find(x => x.followerId === userId(ctx) && x.followingId === target); if (existing) await db.delete('follows', [existing.id]); return json({ following: false }); }],
  'GET /api/notifications': [requireAuth(), async (ctx) => { const { items } = await db.list<any>('notifications', { limit: 200 }); return json({ notifications: items.filter(x => x.userId === userId(ctx)).sort((a, b) => Number(b.createdAt || 0) - Number(a.createdAt || 0)) }); }],
  'POST /api/notifications/read': [requireAuth(), async (ctx) => { const b = (ctx.body || {}) as any; const { items } = await db.list<any>('notifications', { limit: 500 }); const own = items.filter(x => x.userId === userId(ctx) && (!b.id || x.id === b.id)); for (const n of own) await db.update('notifications', [{ id: n.id, record: { ...n, read: true } }]); return json({ ok: true }); }],
  'GET /api/messages': [requireAuth(), async (ctx) => { const { items } = await db.list<any>('messages', { limit: 500 }); const uid = userId(ctx); return json({ messages: items.filter(x => x.senderId === uid || x.recipientId === uid).sort((a, b) => Number(a.createdAt || 0) - Number(b.createdAt || 0)) }); }],
  'POST /api/messages': [requireAuth(), async (ctx) => { const b = (ctx.body || {}) as any; const recipientId = String(b.recipientId || ''); const text = String(b.text || '').trim().slice(0, 1000); if (!recipientId || !text) return error('Recipient and message are required', 400); const message = { senderId: userId(ctx), senderName: ctx.user!.name || 'Cruiser', senderPicture: ctx.user!.picture || null, recipientId, text, createdAt: now(), read: false }; const [id] = await db.add('messages', [message]); if (!id) return error('Unable to send message', 500); const saved = { ...message, id }; await db.add('notifications', [{ userId: recipientId, type: 'message', text: `${ctx.user!.name || 'Someone'} sent you a message`, createdAt: now(), read: false }]); await notifySubscribers('messages', recipientId, saved); return json(saved, 201); }]
});
