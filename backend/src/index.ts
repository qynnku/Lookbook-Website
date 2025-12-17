import express from 'express';
import type { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import multer from 'multer';
import path from 'path';
import bcrypt from 'bcrypt';

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT ? parseInt(process.env.PORT) : 4000;
const JWT_SECRET = process.env.JWT_SECRET || 'bonjour-secret';

// Simple in-memory cache with TTL
type CacheEntry = { data: any; expiry: number };
const cache = new Map<string, CacheEntry>();
function getCache(key: string) {
  const hit = cache.get(key);
  if (hit && hit.expiry > Date.now()) return hit.data;
  if (hit) cache.delete(key);
  return null;
}
function setCache(key: string, data: any, ttlMs = 120_000) {
  cache.set(key, { data, expiry: Date.now() + ttlMs });
}

// Multer config for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});
const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } });

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// --- Auth Middleware (extract brandId from token) ---
interface AuthRequest extends Request {
  brandId?: number;
}

function auth(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization'];
  if (!authHeader) return res.status(401).json({ error: 'No token' });
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    req.brandId = decoded.brandId;
    next();
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
}

// --- Signup ---
app.post('/api/signup', async (req: Request, res: Response) => {
  const { email, password, name } = req.body;
  if (!email || !password || !name) {
    return res.status(400).json({ error: 'Missing email, password, or name' });
  }
  
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return res.status(409).json({ error: 'Email already exists' });
  }
  
  // Create brand for new user
  const brand = await prisma.brand.create({
    data: {
      name: name,
      avatarUrl: '/images/default-avatar.png',
      likes: 0,
      followers: 0,
    },
  });
  
  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      name,
      role: 'user',
      brandId: brand.id,
    },
  });
  
  const token = jwt.sign({ email: user.email, role: user.role, brandId: brand.id }, JWT_SECRET, { expiresIn: '1d' });
  res.status(201).json({ token, user: { id: user.id, email: user.email, name: user.name, brandId: brand.id } });
});

// --- Login ---
app.post('/api/login', async (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Missing email or password' });
  }
  
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  
  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  
  const token = jwt.sign({ email: user.email, role: user.role, brandId: user.brandId }, JWT_SECRET, { expiresIn: '1d' });
  res.json({ token, user: { id: user.id, email: user.email, name: user.name, brandId: user.brandId } });
});

// --- Dashboard summary ---
app.get('/api/dashboard/summary', auth, async (req: AuthRequest, res: Response) => {
  const brandId = req.brandId;
  if (!brandId) return res.status(401).json({ error: 'Unauthorized' });
  
  const brand = await prisma.brand.findUnique({ where: { id: brandId } });
  const metric = await prisma.metricSnapshot.findFirst({
    where: { brandId },
    orderBy: { date: 'desc' },
  });
  if (!brand || !metric) return res.status(404).json({ error: 'No data' });
  res.json({
    newReach: { value: metric.newReach, changePercent: metric.changeVsYesterday },
    postViews: { value: metric.postViews, changePercent: metric.changeVsYesterday },
    pageVisits: { value: metric.pageVisits, changePercent: metric.changeVsYesterday },
    contentPerformanceScore: { value: metric.contentScore, changePercent: metric.changeVsYesterday },
  });
});

// --- Weekly plan ---
app.get('/api/dashboard/weekly-plan', auth, async (req: AuthRequest, res: Response) => {
  const brandId = req.brandId;
  if (!brandId) return res.status(401).json({ error: 'Unauthorized' });
  const tasks = await prisma.weeklyTask.findMany({ where: { brandId } });
  res.json(tasks);
});

app.patch('/api/dashboard/weekly-plan/:id', auth, async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const task = await prisma.weeklyTask.findUnique({ where: { id } });
  if (!task) return res.status(404).json({ error: 'Task not found' });
  
  const updated = await prisma.weeklyTask.update({
    where: { id },
    data: { completed: !task.completed },
  });
  res.json(updated);
});

// --- Channels ---
app.get('/api/dashboard/channels', auth, async (req: AuthRequest, res: Response) => {
  const brandId = req.brandId;
  if (!brandId) return res.status(401).json({ error: 'Unauthorized' });
  const channels = await prisma.channelConnection.findMany({ where: { brandId } });
  res.json(channels);
});

// --- Upload media ---
app.post('/api/upload', auth, upload.single('file'), (req: Request, res: Response) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  const base = process.env.PUBLIC_BASE_URL || `${req.protocol}://${req.get('host')}`;
  const url = new URL(`/uploads/${req.file.filename}`, base).toString();
  res.json({ url });
});

// --- Posts ---
app.get('/api/posts', auth, async (req: AuthRequest, res: Response) => {
  const brandId = req.brandId;
  if (!brandId) return res.status(401).json({ error: 'Unauthorized' });
  const { status, tag } = req.query;
  const where: any = { brandId };
  if (status) where.status = String(status).toUpperCase();
  if (tag) where.tags = { contains: String(tag) };
  const posts = await prisma.post.findMany({ where, orderBy: { updatedAt: 'desc' } });
  res.json(posts);
});

// Get unique tags
app.get('/api/posts/tags', auth, async (req: AuthRequest, res: Response) => {
  const brandId = req.brandId;
  if (!brandId) return res.status(401).json({ error: 'Unauthorized' });
  const posts = await prisma.post.findMany({ where: { brandId }, select: { tags: true } });
  const allTags = posts.map(p => p.tags).filter(Boolean).join(',').split(',').map(t => t.trim()).filter(Boolean);
  const uniqueTags = Array.from(new Set(allTags));
  res.json(uniqueTags);
});

app.post('/api/posts', auth, async (req: AuthRequest, res: Response) => {
  const brandId = req.brandId;
  if (!brandId) return res.status(401).json({ error: 'Unauthorized' });
  const { title, content, status = 'DRAFT', tags, media, scheduledAt, platforms } = req.body;
  if (!title || !content) return res.status(400).json({ error: 'Missing title or content' });
  const created = await prisma.post.create({
    data: {
      brandId,
      title,
      content,
      status,
      tags,
      media,
      scheduledAt: scheduledAt ? new Date(scheduledAt) : undefined,
      platforms,
    },
  });
  res.status(201).json(created);
});

app.put('/api/posts/:id', auth, async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const { title, content, status, tags, media, scheduledAt, platforms } = req.body;
  if (!title || !content) return res.status(400).json({ error: 'Missing title or content' });
  const existing = await prisma.post.findUnique({ where: { id } });
  if (!existing) return res.status(404).json({ error: 'Post not found' });
  const updated = await prisma.post.update({
    where: { id },
    data: {
      title,
      content,
      status: status || existing.status,
      tags,
      media,
      scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
      platforms,
    },
  });
  res.json(updated);
});

// --- Lookbooks ---
app.get('/api/lookbooks', auth, async (req: AuthRequest, res: Response) => {
  const brandId = req.brandId;
  if (!brandId) return res.status(401).json({ error: 'Unauthorized' });
  const lookbooks = await prisma.lookbook.findMany({ 
    where: { brandId },
    orderBy: { updatedAt: 'desc' }
  });
  res.json(lookbooks);
});

app.get('/api/lookbooks/:id', auth, async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const lookbook = await prisma.lookbook.findUnique({ where: { id } });
  if (!lookbook) return res.status(404).json({ error: 'Lookbook not found' });
  res.json(lookbook);
});

app.post('/api/lookbooks', auth, upload.fields([
  { name: 'image', maxCount: 1 },
  { name: 'banner', maxCount: 1 },
  { name: 'gallery', maxCount: 100 }
]), async (req: AuthRequest, res: Response) => {
  const brandId = req.brandId;
  if (!brandId) return res.status(401).json({ error: 'Unauthorized' });
  
  const { name, description, link } = req.body;
  if (!name) return res.status(400).json({ error: 'Name is required' });

  const files = req.files as { [fieldname: string]: Express.Multer.File[] };
  const base = process.env.PUBLIC_BASE_URL || `${req.protocol}://${req.get('host')}`;
  const imageUrl = files?.image?.[0] 
    ? new URL(`/uploads/${files.image[0].filename}`, base).toString() 
    : null;
  const bannerUrl = files?.banner?.[0] 
    ? new URL(`/uploads/${files.banner[0].filename}`, base).toString() 
    : null;
  const galleryImages = files?.gallery 
    ? files.gallery.map(f => new URL(`/uploads/${f.filename}`, base).toString()).join(',')
    : null;

  const created = await prisma.lookbook.create({
    data: {
      brandId,
      name,
      description: description || null,
      link: link || null,
      imageUrl,
      bannerUrl,
      imagesUrl: galleryImages,
    },
  });
  res.status(201).json(created);
});

app.put('/api/lookbooks/:id', auth, upload.fields([
  { name: 'image', maxCount: 1 },
  { name: 'banner', maxCount: 1 },
  { name: 'gallery', maxCount: 100 }
]), async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const existing = await prisma.lookbook.findUnique({ where: { id } });
  if (!existing) return res.status(404).json({ error: 'Lookbook not found' });

  const { name, description, link, removedGalleryImages } = req.body;
  const files = req.files as { [fieldname: string]: Express.Multer.File[] };
  const base = process.env.PUBLIC_BASE_URL || `${req.protocol}://${req.get('host')}`;
  
  const imageUrl = files?.image?.[0] 
    ? new URL(`/uploads/${files.image[0].filename}`, base).toString() 
    : existing.imageUrl;
  const bannerUrl = files?.banner?.[0] 
    ? new URL(`/uploads/${files.banner[0].filename}`, base).toString() 
    : existing.bannerUrl;

  // Handle gallery images
  let imagesUrl = existing.imagesUrl || '';
  
  // Remove deleted images
  if (removedGalleryImages) {
    try {
      const removedList = JSON.parse(removedGalleryImages);
      const currentImages = imagesUrl.split(',').filter(url => url.trim());
      imagesUrl = currentImages
        .filter(url => !removedList.includes(url))
        .join(',');
    } catch (e) {
      // If parsing fails, keep existing
    }
  }

  // Add new images
  if (files?.gallery) {
    const newImages = files.gallery.map(f => new URL(`/uploads/${f.filename}`, base).toString()).join(',');
    imagesUrl = imagesUrl 
      ? `${imagesUrl},${newImages}`
      : newImages;
  }

  const updated = await prisma.lookbook.update({
    where: { id },
    data: {
      name: name || existing.name,
      description: description !== undefined ? description : existing.description,
      link: link !== undefined ? link : existing.link,
      imageUrl,
      bannerUrl,
      imagesUrl: imagesUrl || null,
    },
  });
  res.json(updated);
});

app.delete('/api/lookbooks/:id', auth, async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const existing = await prisma.lookbook.findUnique({ where: { id } });
  if (!existing) return res.status(404).json({ error: 'Lookbook not found' });
  
  await prisma.lookbook.delete({ where: { id } });
  res.json({ message: 'Lookbook deleted successfully' });
});

// --- Statistics API ---

// Get analytics data (engagement metrics by month)
app.get('/api/statistics/analytics', auth, async (req: AuthRequest, res: Response) => {
  const brandId = req.brandId;
  if (!brandId) return res.status(401).json({ error: 'Unauthorized' });

  const { platform = 'all', timeRange = 'year', metric = 'views' } = req.query as any;

  const cacheKey = `analytics:${brandId}:${platform}:${timeRange}:${metric}`;
  const cached = getCache(cacheKey);
  if (cached) return res.json(cached);

  // Date range
  const now = new Date();
  let start = new Date(now);
  const rangeKey = String(timeRange);
  if (rangeKey === '7days') start.setDate(now.getDate() - 6);
  else if (rangeKey === '30days') start.setDate(now.getDate() - 29);
  else if (rangeKey === '3months') start = new Date(now.getFullYear(), now.getMonth() - 2, 1);
  else if (rangeKey === '6months') start = new Date(now.getFullYear(), now.getMonth() - 5, 1);
  else start = new Date(now.getFullYear(), now.getMonth() - 11, 1); // year

  const platforms = ['facebook', 'instagram', 'threads', 'tiktok', 'youtube'];
  const metricKey = String(metric) as keyof { views: number };

  // Helper: bucket label
  const fmtDay = (d: Date) => `${d.getMonth() + 1}/${d.getDate()}`;
  const fmtMonth = (d: Date) => d.toLocaleString('en-US', { month: 'short' }).toUpperCase();
  const isDaily = rangeKey === '7days' || rangeKey === '30days';

  // Build list of target platforms
  const targetPlatforms = platform === 'all' ? platforms : [String(platform)];

  // Fetch once for all platforms and aggregate in memory
  const all = await prisma.platformStat.findMany({
    where: { brandId, platform: { in: targetPlatforms }, date: { gte: start, lte: now } },
    orderBy: { date: 'asc' },
  });

  const result: any = {};
  for (const p of targetPlatforms) {
    const rows = all.filter(r => r.platform === p);
    const buckets: Record<string, number> = {};
    for (const r of rows) {
      const label = isDaily ? fmtDay(new Date(r.date)) : fmtMonth(new Date(r.date));
      const value = (r as any)[metricKey] ?? 0;
      buckets[label] = (buckets[label] || 0) + value;
    }
    // Map to array keeping chronological label order
    const labelsOrdered: string[] = [];
    if (isDaily) {
      const days = rangeKey === '7days' ? 7 : 30;
      for (let i = days - 1; i >= 0; i--) {
        const d = new Date(now);
        d.setDate(now.getDate() - i);
        labelsOrdered.push(fmtDay(d));
      }
    } else {
      const months = rangeKey === '3months' ? 3 : rangeKey === '6months' ? 6 : 12;
      for (let i = months - 1; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        labelsOrdered.push(fmtMonth(d));
      }
    }
    result[p] = labelsOrdered.map(l => ({ label: l, value: Math.round(buckets[l] || 0) }));
  }

  result.metric = metricKey;
  result.timeRange = rangeKey;
  setCache(cacheKey, result, 120_000);
  res.json(result);
});

// Get business performance data
app.get('/api/statistics/performance', auth, async (req: AuthRequest, res: Response) => {
  const brandId = req.brandId;
  if (!brandId) return res.status(401).json({ error: 'Unauthorized' });
  const { platform = 'all', months = '6', metric = 'engagementRate' } = req.query as any;

  const monthsNum = Math.max(1, Math.min(12, parseInt(String(months)) || 6));
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth() - (monthsNum - 1), 1);
  const platforms = ['facebook', 'instagram', 'threads', 'tiktok', 'youtube'];
  const targetPlatforms = platform === 'all' ? platforms : [String(platform)];

  const rows = await prisma.platformStat.findMany({
    where: { brandId, platform: { in: targetPlatforms }, date: { gte: start, lte: now } },
    orderBy: { date: 'asc' },
  });

  // Aggregate by month
  type Agg = { views: number; likes: number; comments: number; shares: number };
  const byMonth = new Map<string, Agg>();
  function monthKey(d: Date) { return `${d.getFullYear()}-${d.getMonth()+1}`; }
  function monthLabel(d: Date) { return d.toLocaleString('en-US', { month: 'short' }).toUpperCase(); }
  for (const r of rows) {
    const d = new Date(r.date);
    const key = monthKey(d);
    const acc = byMonth.get(key) || { views: 0, likes: 0, comments: 0, shares: 0 };
    acc.views += r.views;
    acc.likes += r.likes;
    acc.comments += r.comments;
    acc.shares += r.shares;
    byMonth.set(key, acc);
  }

  const labels: { key: string; date: Date }[] = [];
  for (let i = monthsNum - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    labels.push({ key: monthKey(d), date: d });
  }

  // Choose metric: engagementRate or views
  const monthlyData = labels.map(({ key, date }) => {
    const agg = byMonth.get(key) || { views: 0, likes: 0, comments: 0, shares: 0 };
    let value = 0;
    if (metric === 'views') value = agg.views;
    else {
      const engagement = agg.likes + agg.comments + agg.shares;
      value = agg.views > 0 ? (engagement / agg.views) * 100 : 0; // percentage
    }
    return { month: monthLabel(date), value: Math.round(value * 100) / 100 };
  });

  const last = monthlyData[monthlyData.length - 1]?.value || 0;
  const prev = monthlyData[monthlyData.length - 2]?.value || 0;
  const growth = prev ? ((last - prev) / prev) * 100 : 0;

  const data = {
    currentRate: Math.round(last * 100) / 100,
    growth: Math.round(growth * 10) / 10,
    metric,
    platform,
    monthlyData,
  };
  res.json(data);
});

// Get follower counts for all platforms
app.get('/api/statistics/followers', auth, async (req: AuthRequest, res: Response) => {
  const brandId = req.brandId;
  if (!brandId) return res.status(401).json({ error: 'Unauthorized' });
  const cacheKey = `followers:${brandId}`;
  const cached = getCache(cacheKey);
  if (cached) return res.json(cached);
  const platforms = ['facebook', 'instagram', 'threads', 'tiktok', 'youtube'];
  const data: any[] = [];
  for (const p of platforms) {
    const latest = await prisma.followerSnapshot.findFirst({ where: { brandId, platform: p }, orderBy: { date: 'desc' } });
    const prev = await prisma.followerSnapshot.findFirst({ where: { brandId, platform: p, date: { lt: latest?.date || new Date() } }, orderBy: { date: 'desc' } });
    const count = latest?.followers || 0;
    const growth = prev && prev.followers ? ((count - prev.followers) / prev.followers) * 100 : 0;
    data.push({ platform: p, count, growth: Math.round(growth * 10) / 10, label: 'Lượt theo dõi' });
  }
  setCache(cacheKey, data, 300_000);
  res.json(data);
});

// Get notifications
app.get('/api/statistics/notifications', auth, async (req: AuthRequest, res: Response) => {
  const data = [
    {
      id: 1,
      platform: 'instagram',
      users: ['Thảo Nguyên', '100 tài khoản khác'],
      action: 'đã bày tỏ cảm xúc về bài đăng của bạn',
      imageUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400',
      timestamp: new Date().toISOString(),
    },
    {
      id: 2,
      platform: 'facebook',
      users: ['Nguyenpham_01', 'unni035', '100 tài khoản khác'],
      action: 'đã bày tỏ cảm xúc về bài đăng của bạn',
      imageUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400',
      timestamp: new Date().toISOString(),
    },
  ];
  res.json(data);
});

// Get suggestions
app.get('/api/statistics/suggestions', auth, async (req: AuthRequest, res: Response) => {
  const data = [
    {
      id: 1,
      platform: 'instagram',
      title: 'Bạn muốn tiết kiệm thời gian và tăng lượng khách truy cập?',
      imageUrl: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=400',
      link: '#',
    },
  ];
  res.json(data);
});

// --- Orders ---
app.get('/api/orders', auth, async (req: AuthRequest, res: Response) => {
  const brandId = req.brandId;
  if (!brandId) return res.status(401).json({ error: 'Unauthorized' });
  const page = parseInt(String(req.query.page || '1')) || 1;
  const pageSize = Math.min(50, Math.max(5, parseInt(String(req.query.pageSize || '10')) || 10));
  const status = req.query.status ? String(req.query.status) : undefined;
  const q = req.query.q ? String(req.query.q).toLowerCase() : '';

  const where: any = { brandId };
  if (status && status !== 'all') where.status = status;
  if (q) {
    where.OR = [
      { code: { contains: q, mode: 'insensitive' } },
      { customer: { contains: q, mode: 'insensitive' } },
      { product: { contains: q, mode: 'insensitive' } },
      { channel: { contains: q, mode: 'insensitive' } },
    ];
  }

  const [total, items] = await Promise.all([
    prisma.order.count({ where }),
    prisma.order.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
  ]);

  res.json({ page, pageSize, total, items });
});

// Orders summary counts for current brand
app.get('/api/orders/summary', auth, async (req: AuthRequest, res: Response) => {
  const brandId = req.brandId;
  if (!brandId) return res.status(401).json({ error: 'Unauthorized' });

  const statuses = ['pending', 'processing', 'shipped', 'completed', 'cancelled'] as const;
  const totalPromise = prisma.order.count({ where: { brandId } });
  const countsPromises = statuses.map(s => prisma.order.count({ where: { brandId, status: s } }));
  const [total, ...statusCounts] = await Promise.all([totalPromise, ...countsPromises]);
  const out: any = { total };
  statuses.forEach((s, idx) => (out[s] = statusCounts[idx]));
  res.json(out);
});

// Get order by id
app.get('/api/orders/:id', auth, async (req: AuthRequest, res: Response) => {
  const brandId = req.brandId;
  const id = Number(req.params.id);
  if (!brandId) return res.status(401).json({ error: 'Unauthorized' });
  if (!Number.isFinite(id)) return res.status(400).json({ error: 'Invalid id' });
  const order = await prisma.order.findFirst({ where: { id, brandId } });
  if (!order) return res.status(404).json({ error: 'Order not found' });
  res.json(order);
});

// Get order by code
app.get('/api/orders/code/:code', auth, async (req: AuthRequest, res: Response) => {
  const brandId = req.brandId;
  const code = String(req.params.code);
  if (!brandId) return res.status(401).json({ error: 'Unauthorized' });
  const order = await prisma.order.findFirst({ where: { code, brandId } });
  if (!order) return res.status(404).json({ error: 'Order not found' });
  res.json(order);
});

// Allowed statuses
const ORDER_STATUSES = ['pending', 'processing', 'shipped', 'completed', 'cancelled'];
app.get('/api/orders/statuses', auth, (_req: AuthRequest, res: Response) => {
  res.json(ORDER_STATUSES);
});

// Create order (brand-scoped). If code missing, auto-generate unique code.
app.post('/api/orders', auth, async (req: AuthRequest, res: Response) => {
  const brandId = req.brandId;
  if (!brandId) return res.status(401).json({ error: 'Unauthorized' });
  const { code, customer, product, channel, status = 'pending', total, createdAt } = req.body || {};

  if (!customer || !product || !channel || typeof total !== 'number') {
    return res.status(400).json({ error: 'Missing customer, product, channel or total' });
  }
  if (!ORDER_STATUSES.includes(String(status))) {
    return res.status(400).json({ error: 'Invalid status' });
  }

  async function generateCode() {
    const rand = Math.floor(1000 + Math.random() * 9000);
    return `OD-${Date.now().toString().slice(-4)}${rand}`;
  }

  let finalCode = code && String(code).trim() ? String(code).trim() : '';
  if (!finalCode) {
    // try generating a unique code up to a few attempts
    for (let i = 0; i < 5; i++) {
      const c = await generateCode();
      const exists = await prisma.order.findUnique({ where: { code: c } }).catch(() => null);
      if (!exists) { finalCode = c; break; }
    }
  }
  if (!finalCode) return res.status(500).json({ error: 'Failed to generate order code' });

  try {
    const created = await prisma.order.create({
      data: {
        brandId,
        code: finalCode,
        customer,
        product,
        channel,
        status,
        total,
        createdAt: createdAt ? new Date(createdAt) : undefined,
      },
    });
    res.status(201).json(created);
  } catch (e: any) {
    if (String(e?.message || '').includes('Unique constraint')) {
      return res.status(409).json({ error: 'Order code already exists' });
    }
    res.status(500).json({ error: 'Failed to create order' });
  }
});

// Update order
app.patch('/api/orders/:id', auth, async (req: AuthRequest, res: Response) => {
  const brandId = req.brandId;
  const id = Number(req.params.id);
  if (!brandId) return res.status(401).json({ error: 'Unauthorized' });
  if (!Number.isFinite(id)) return res.status(400).json({ error: 'Invalid id' });

  const existing = await prisma.order.findUnique({ where: { id } });
  if (!existing || existing.brandId !== brandId) {
    return res.status(404).json({ error: 'Order not found' });
  }

  const { customer, product, channel, status, total } = req.body || {};
  if (status && !ORDER_STATUSES.includes(String(status))) {
    return res.status(400).json({ error: 'Invalid status' });
  }

  const updated = await prisma.order.update({
    where: { id },
    data: {
      customer: customer ?? existing.customer,
      product: product ?? existing.product,
      channel: channel ?? existing.channel,
      status: status ?? existing.status,
      total: typeof total === 'number' ? total : existing.total,
    },
  });
  res.json(updated);
});

// Delete order
app.delete('/api/orders/:id', auth, async (req: AuthRequest, res: Response) => {
  const brandId = req.brandId;
  const id = Number(req.params.id);
  if (!brandId) return res.status(401).json({ error: 'Unauthorized' });
  if (!Number.isFinite(id)) return res.status(400).json({ error: 'Invalid id' });

  const existing = await prisma.order.findUnique({ where: { id } });
  if (!existing || existing.brandId !== brandId) {
    return res.status(404).json({ error: 'Order not found' });
  }

  await prisma.order.delete({ where: { id } });
  res.json({ success: true });
});

app.listen(PORT, () => {
  const base = process.env.PUBLIC_BASE_URL || `http://localhost:${PORT}`;
  console.log(`Backend running. Public base: ${base}`);
});
