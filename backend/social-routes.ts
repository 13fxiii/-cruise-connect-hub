import { json, error, requireAuth, db, notifications, secrets } from '@appdeploy/sdk';
import { notifySubscribers } from './realtime-subscribers';

export const socialRoutes = {
  'GET /api/social/feed': [requireAuth(), async (ctx: any) => {
    const { items } = await db.list<any>('community_posts', { limit: 100 });
    const { items: likes } = await db.list<any>('social_likes', { limit: 5000 });
    const { items: comments } = await db.list<any>('social_comments', { limit: 5000 });
    const posts = items.map((p: any) => ({ ...p, likes: likes.filter((x: any) => x.postId === p.id && !x.inactive).length, comments: comments.filter((x: any) => x.postId === p.id).length })).sort((a: any, b: any) => Number(b.createdAt) - Number(a.createdAt));
    return json({ posts: posts.slice(0, 80) });
  }],
  'POST /api/social/posts': [requireAuth(), async (ctx: any) => {
    const b = (ctx.body || {}) as any; const text = String(b.text || '').trim().slice(0, 1000); if (!text) return error('Post text is required', 400);
    let xStatus = 'not_configured', xUrl = null;
    const names = await secrets.listSecretNames();
    if (names.includes('X_OFFICIAL_ACCESS_TOKEN')) { try { const token = await secrets.readSecret('X_OFFICIAL_ACCESS_TOKEN'); const r = await fetch('https://api.x.com/2/tweets', { method: 'POST', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ text }) }); const d = await r.json(); if (r.ok && d?.data?.id) { xStatus = 'published'; xUrl = `https://x.com/BCHub_/status/${d.data.id}`; } else xStatus = 'publish_failed'; } catch { xStatus = 'publish_failed'; } }
    const [id] = await db.add('community_posts', [{ userId: ctx.user!.userId, name: ctx.user!.name || 'Cruiser', text, source: 'bch', xStatus, xUrl, createdAt: Date.now() }]);
    if (!id) return error('Unable to publish post', 500);
    await notifications.sendToTopic({ topic: 'big-cruise-community', notification: { title: 'New BIG CRUISE post', body: `${ctx.user!.name || 'A cruiser'} just posted in BCH〽️.` }, data: { kind: 'community_post' } }).catch(() => {});
    await notifySubscribers('social-feed', 'global', { kind: 'post', postId: id });
    return json({ ok: true, id, xStatus, xUrl }, 201);
  }],
  'POST /api/social/like': [requireAuth(), async (ctx: any) => {
    const b = (ctx.body || {}) as any; const postId = String(b.postId || ''); const [post] = await db.get<any>('community_posts', [postId]); if (!post) return error('Post not found', 404);
    const { items } = await db.list<any>('social_likes', { limit: 5000 }); const existing = items.find((x: any) => x.postId === postId && x.userId === ctx.user!.userId && !x.inactive);
    if (existing) await db.update('social_likes', [{ id: existing.id, record: { ...existing, inactive: true } }]); else await db.add('social_likes', [{ postId, userId: ctx.user!.userId, createdAt: Date.now(), inactive: false }]);
    const latest = await db.list<any>('social_likes', { limit: 5000 }); const count = latest.items.filter((x: any) => x.postId === postId && !x.inactive).length;
    await notifySubscribers('social-feed', 'global', { kind: 'like', postId }); return json({ ok: true, liked: !existing, likes: count });
  }],
  'POST /api/social/comment': [requireAuth(), async (ctx: any) => {
    const b = (ctx.body || {}) as any; const postId = String(b.postId || ''), text = String(b.text || '').trim().slice(0, 500); const [post] = await db.get<any>('community_posts', [postId]); if (!post) return error('Post not found', 404); if (!text) return error('Comment is required', 400);
    const [id] = await db.add('social_comments', [{ postId, userId: ctx.user!.userId, name: ctx.user!.name || 'Cruiser', text, createdAt: Date.now() }]); if (!id) return error('Unable to add comment', 500);
    await notifySubscribers('social-feed', 'global', { kind: 'comment', postId }); return json({ ok: true, id }, 201);
  }],
  'POST /api/social/follow': [requireAuth(), async (ctx: any) => {
    const b = (ctx.body || {}) as any; const followingId = String(b.userId || ''); if (!followingId || followingId === ctx.user!.userId) return error('Invalid user to follow', 400);
    const { items } = await db.list<any>('social_follows', { limit: 5000 }); const existing = items.find((x: any) => x.followerId === ctx.user!.userId && x.followingId === followingId);
    if (existing) await db.delete('social_follows', [existing.id]); else await db.add('social_follows', [{ followerId: ctx.user!.userId, followingId, createdAt: Date.now() }]);
    return json({ ok: true, following: !existing });
  }],
  'GET /api/social/notifications': [requireAuth(), async (ctx: any) => { const { items } = await db.list<any>('social_notifications', { limit: 1000 }); return json({ notifications: items.filter((x: any) => x.userId === ctx.user!.userId).sort((a: any, b: any) => Number(b.createdAt) - Number(a.createdAt)).slice(0, 100) }); }],
  'POST /api/social/notifications/read': [requireAuth(), async (ctx: any) => { const b = (ctx.body || {}) as any; const [n] = await db.get<any>('social_notifications', [String(b.notificationId || '')]); if (!n || n.userId !== ctx.user!.userId) return error('Notification not found', 404); await db.update('social_notifications', [{ id: n.id, record: { ...n, read: true } }]); return json({ ok: true }); }],
  'GET /api/social/messages': [requireAuth(), async (ctx: any) => { const target = String(ctx.query.userId || ''); const { items } = await db.list<any>('direct_messages', { limit: 5000 }); const messages = items.filter((m: any) => target ? ((m.fromUserId === ctx.user!.userId && m.toUserId === target) || (m.fromUserId === target && m.toUserId === ctx.user!.userId)) : (m.fromUserId === ctx.user!.userId || m.toUserId === ctx.user!.userId)).sort((a: any, b: any) => Number(a.createdAt) - Number(b.createdAt)); return json({ messages: target ? messages.slice(-100) : messages.slice(-200) }); }],
  'POST /api/social/messages': [requireAuth(), async (ctx: any) => { const b = (ctx.body || {}) as any; const toUserId = String(b.toUserId || ''), text = String(b.text || '').trim().slice(0, 1000); if (!toUserId || !text) return error('Recipient and message are required', 400); const [id] = await db.add('direct_messages', [{ fromUserId: ctx.user!.userId, toUserId, text, createdAt: Date.now() }]); if (!id) return error('Unable to send message', 500); await db.add('social_notifications', [{ userId: toUserId, title: 'New message 〽️', body: `${ctx.user!.name || 'A cruiser'} sent you a message.`, createdAt: Date.now(), read: false }]); return json({ ok: true, id }, 201); }]
};
