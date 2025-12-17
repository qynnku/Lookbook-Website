import express from 'express';
import type { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import multer from 'multer';
import path from 'path';

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

// --- Auth Middleware ---
function auth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization'];
  if (!authHeader) return res.status(401).json({ error: 'No token' });
  const token = authHeader.split(' ')[1];
  try {
    jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
}

// --- Login (fake) ---
app.post('/api/login', async (req: Request, res: Response) => {
  const { email, password } = req.body;
  // Only one seeded user
  if (email === 'admin@dottie.vn' && password === 'bonjour123') {
    const token = jwt.sign({ email, role: 'admin' }, JWT_SECRET, { expiresIn: '1d' });
    return res.json({ token });
  }
  res.status(401).json({ error: 'Invalid credentials' });
});

// --- Dashboard summary ---
app.get('/api/dashboard/summary', auth, async (req: Request, res: Response) => {
  const brand = await prisma.brand.findFirst();
  const metric = await prisma.metricSnapshot.findFirst({
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
app.get('/api/dashboard/weekly-plan', auth, async (req: Request, res: Response) => {
  const brand = await prisma.brand.findFirst();
  if (!brand) return res.status(404).json({ error: 'No brand' });
  const tasks = await prisma.weeklyTask.findMany({ where: { brandId: brand.id } });
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
app.get('/api/dashboard/channels', auth, async (req: Request, res: Response) => {
  const brand = await prisma.brand.findFirst();
  if (!brand) return res.status(404).json({ error: 'No brand' });
  const channels = await prisma.channelConnection.findMany({ where: { brandId: brand.id } });
  res.json(channels);
});

// --- Upload media ---
app.post('/api/upload', auth, upload.single('file'), (req: Request, res: Response) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  const url = `http://localhost:${PORT}/uploads/${req.file.filename}`;
  res.json({ url });
});

// --- Posts ---
app.get('/api/posts', auth, async (req: Request, res: Response) => {
  const brand = await prisma.brand.findFirst();
  if (!brand) return res.status(404).json({ error: 'No brand' });
  const { status, tag } = req.query;
  const where: any = { brandId: brand.id };
  if (status) where.status = String(status).toUpperCase();
  if (tag) where.tags = { contains: String(tag) };
  const posts = await prisma.post.findMany({ where, orderBy: { updatedAt: 'desc' } });
  res.json(posts);
});

// Get unique tags
app.get('/api/posts/tags', auth, async (req: Request, res: Response) => {
  const brand = await prisma.brand.findFirst();
  if (!brand) return res.status(404).json({ error: 'No brand' });
  const posts = await prisma.post.findMany({ where: { brandId: brand.id }, select: { tags: true } });
  const allTags = posts.map(p => p.tags).filter(Boolean).join(',').split(',').map(t => t.trim()).filter(Boolean);
  const uniqueTags = Array.from(new Set(allTags));
  res.json(uniqueTags);
});

app.post('/api/posts', auth, async (req: Request, res: Response) => {
  const brand = await prisma.brand.findFirst();
  if (!brand) return res.status(404).json({ error: 'No brand' });
  const { title, content, status = 'DRAFT', tags, media, scheduledAt, platforms } = req.body;
  if (!title || !content) return res.status(400).json({ error: 'Missing title or content' });
  const created = await prisma.post.create({
    data: {
      brandId: brand.id,
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
app.get('/api/lookbooks', auth, async (req: Request, res: Response) => {
  const brand = await prisma.brand.findFirst();
  if (!brand) return res.status(404).json({ error: 'No brand' });
  const lookbooks = await prisma.lookbook.findMany({ 
    where: { brandId: brand.id },
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
]), async (req: Request, res: Response) => {
  const brand = await prisma.brand.findFirst();
  if (!brand) return res.status(404).json({ error: 'No brand' });
  
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
      brandId: brand.id,
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

app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});
