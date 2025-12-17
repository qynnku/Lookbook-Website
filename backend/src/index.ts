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
  const url = `http://localhost:${PORT}/uploads/${req.file.filename}`;
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
  const imageUrl = files?.image?.[0] 
    ? `http://localhost:${PORT}/uploads/${files.image[0].filename}` 
    : null;
  const bannerUrl = files?.banner?.[0] 
    ? `http://localhost:${PORT}/uploads/${files.banner[0].filename}` 
    : null;
  const galleryImages = files?.gallery 
    ? files.gallery.map(f => `http://localhost:${PORT}/uploads/${f.filename}`).join(',')
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
  
  const imageUrl = files?.image?.[0] 
    ? `http://localhost:${PORT}/uploads/${files.image[0].filename}` 
    : existing.imageUrl;
  const bannerUrl = files?.banner?.[0] 
    ? `http://localhost:${PORT}/uploads/${files.banner[0].filename}` 
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
    const newImages = files.gallery.map(f => `http://localhost:${PORT}/uploads/${f.filename}`).join(',');
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
  const { platform = 'all', timeRange = 'year', metric = 'views' } = req.query;
  
  // Generate mock data based on filters
  const generateData = (platform: string, multiplier: number) => {
    const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
    
    // Adjust data points based on time range
    let dataPoints = months;
    if (timeRange === '7days') {
      dataPoints = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    } else if (timeRange === '30days') {
      dataPoints = Array.from({ length: 30 }, (_, i) => `${i + 1}`);
    } else if (timeRange === '3months') {
      dataPoints = months.slice(0, 3);
    } else if (timeRange === '6months') {
      dataPoints = months.slice(0, 6);
    }
    
    return dataPoints.map((label) => ({
      label,
      value: Math.floor(Math.random() * 2000 * multiplier) + 500,
    }));
  };

  let data: any = {};

  if (platform === 'all') {
    data = {
      facebook: generateData('facebook', 1.2),
      instagram: generateData('instagram', 1.5),
      threads: generateData('threads', 0.8),
      tiktok: generateData('tiktok', 2.0),
      youtube: generateData('youtube', 1.0),
    };
  } else {
    data = {
      [platform as string]: generateData(platform as string, 1.0),
    };
  }

  data.metric = metric;
  data.timeRange = timeRange;
  
  res.json(data);
});

// Get business performance data
app.get('/api/statistics/performance', auth, async (req: AuthRequest, res: Response) => {
  const data = {
    currentRate: 8.06,
    growth: 1.2,
    monthlyData: [
      { month: 'JAN', value: 68.574 },
      { month: 'FEB', value: 116.119 },
      { month: 'MAR', value: 91.433 },
      { month: 'APR', value: 139.892 },
      { month: 'MAY', value: 104.233 },
      { month: 'JUN', value: 66.746 },
    ],
  };
  res.json(data);
});

// Get follower counts for all platforms
app.get('/api/statistics/followers', auth, async (req: AuthRequest, res: Response) => {
  const data = [
    {
      platform: 'facebook',
      count: 11100,
      growth: 1.2,
      label: 'Lượt theo dõi',
    },
    {
      platform: 'threads',
      count: 11100,
      growth: 1.2,
      label: 'Lượt theo dõi',
    },
    {
      platform: 'instagram',
      count: 11100,
      growth: 1.2,
      label: 'Lượt theo dõi',
    },
  ];
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

app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});
