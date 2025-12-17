import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
const prisma = new PrismaClient();

async function main() {
  // Clear existing data
  await prisma.post.deleteMany();
  await prisma.lookbook.deleteMany();
  await prisma.metricSnapshot.deleteMany();
  await prisma.weeklyTask.deleteMany();
  await prisma.channelConnection.deleteMany();
  // New stats tables
  try { await prisma.platformStat.deleteMany(); } catch {}
  try { await prisma.followerSnapshot.deleteMany(); } catch {}
  await prisma.user.deleteMany();
  await prisma.brand.deleteMany();

  // Seed Brand
  const brand = await prisma.brand.create({
    data: {
      name: 'Dottie',
      avatarUrl: '/images/dottie-avatar.png',
      likes: 100000,
      followers: 150000,
    },
  });

  // Seed User with hashed password
  const hashedPassword = await bcrypt.hash('bonjour123', 10);
  await prisma.user.create({
    data: {
      name: 'Admin',
      email: 'admin@dottie.vn',
      password: hashedPassword,
      role: 'admin',
      brandId: brand.id,
    },
  });

  // Seed MetricSnapshot
  await prisma.metricSnapshot.create({
    data: {
      brandId: brand.id,
      date: new Date(),
      newReach: 6650,
      postViews: 3174,
      pageVisits: 3174,
      contentScore: 14321,
      changeVsYesterday: 14.0,
    },
  });

  // Seed Weekly Tasks
  await prisma.weeklyTask.createMany({
    data: [
      { brandId: brand.id, title: 'Đăng 1 story lên Facebook', channel: 'facebook', completed: false },
      { brandId: brand.id, title: 'Đăng 1 bài viết lên Thread', channel: 'thread', completed: true },
      { brandId: brand.id, title: 'Đăng 1 bài lên Instagram', channel: 'instagram', completed: true },
    ],
  });

  // Seed Channels
  await prisma.channelConnection.createMany({
    data: [
      { brandId: brand.id, type: 'facebook', status: 'connected' },
      { brandId: brand.id, type: 'instagram', status: 'connected' },
      { brandId: brand.id, type: 'thread', status: 'connected' },
    ],
  });

  // Seed Posts (mock database for create-post page)
  await prisma.post.createMany({
    data: [
      {
        brandId: brand.id,
        title: 'BST Thu Đông - bài nháp 1',
        content: 'Ý tưởng lookbook mới cho BST Thu Đông.',
        status: 'DRAFT',
        tags: 'lookbook,thu-dong',
      },
      {
        brandId: brand.id,
        title: 'Mini game cuối tuần',
        content: 'Chuẩn bị minigame tương tác trên Facebook.',
        status: 'DRAFT',
        tags: 'facebook,mini-game',
      },
      {
        brandId: brand.id,
        title: 'Story Instagram thứ 4',
        content: 'Đẩy story kèm mã giảm giá 10%.',
        status: 'SCHEDULED',
        scheduledAt: new Date(Date.now() + 1000 * 60 * 60 * 24),
        tags: 'instagram,story',
      },
      {
        brandId: brand.id,
        title: 'Livestream chủ nhật',
        content: 'Kịch bản và CTA livestream.',
        status: 'SCHEDULED',
        scheduledAt: new Date(Date.now() + 1000 * 60 * 60 * 48),
        tags: 'livestream,script',
      },
      {
        brandId: brand.id,
        title: 'Bài recap event',
        content: 'Recap sự kiện workshop tuần trước.',
        status: 'PUBLISHED',
        tags: 'recap,event',
      },
      {
        brandId: brand.id,
        title: 'Thread update lookbook',
        content: 'Thông báo cập nhật lookbook trên thread.',
        status: 'PUBLISHED',
        tags: 'thread,update',
      },
    ],
  });

  // Seed Lookbook 1
  await prisma.lookbook.create({
    data: {
      brandId: brand.id,
      name: 'Lookbook 1',
      description: 'Bộ sưu tập thời trang mùa thu đông',
      link: 'https://example.com/lookbook-1',
      bannerUrl: 'https://www.figma.com/api/mcp/asset/08f08cdf-b0b7-4be4-8716-78676eeec441',
      imageUrl: 'https://www.figma.com/api/mcp/asset/08f08cdf-b0b7-4be4-8716-78676eeec441',
      // Statistics
      totalViewers: 12450,
      facebookViews: 6200,
      threadViews: 3100,
      instagramViews: 3150,
      newCustomerReach: 5640,
      postViews: 8920,
      pageVisits: 7340,
      contentScore: 8950,
    },
  });

  // Seed Platform daily stats (last 365 days)
  const platforms = ['facebook', 'instagram', 'threads', 'tiktok', 'youtube'];
  const today = new Date();
  const days = 365;
  const statsData: any[] = [];

  // Base multipliers per platform for realism
  const base: Record<string, number> = {
    facebook: 1.2,
    instagram: 1.5,
    threads: 0.8,
    tiktok: 2.1,
    youtube: 1.0,
  };

  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dayOfWeek = d.getDay(); // 0 Sun .. 6 Sat

    // Light weekend dip
    const weekendFactor = (dayOfWeek === 0 || dayOfWeek === 6) ? 0.85 : 1;

    for (const p of platforms) {
      const m = base[p];
      // Core signals with some correlation
      const views = Math.floor((800 + Math.random() * 1200) * m * weekendFactor);
      const reach = Math.floor(views * (0.65 + Math.random() * 0.25));
      const likes = Math.floor(views * (0.05 + Math.random() * 0.05));
      const comments = Math.floor(likes * (0.15 + Math.random() * 0.25));
      const shares = Math.floor(likes * (0.1 + Math.random() * 0.2));
      const follows = Math.floor((likes + shares) * (0.02 + Math.random() * 0.06));
      const engagement = likes + comments + shares;

      // Spikes on days with scheduled/published posts (from the small mock set)
      let spike = 1;
      if (i % 30 === 0 || i % 45 === 0) spike = 1.35 + Math.random() * 0.4;

      statsData.push({
        brandId: brand.id,
        platform: p,
        date: d,
        views: Math.floor(views * spike),
        likes: Math.floor(likes * spike),
        comments: Math.floor(comments * spike),
        shares: Math.floor(shares * spike),
        follows: Math.floor(follows * spike),
        engagement: Math.floor(engagement * spike),
        reach: Math.floor(reach * spike),
      });
    }
  }

  // Bulk insert in chunks to avoid parameter limits
  const chunkSize = 1000;
  for (let i = 0; i < statsData.length; i += chunkSize) {
    await prisma.platformStat.createMany({ data: statsData.slice(i, i + chunkSize) });
  }

  // Seed follower snapshots (monthly, last 12 months)
  const followerData: any[] = [];
  for (let mIdx = 11; mIdx >= 0; mIdx--) {
    const monthDate = new Date(today.getFullYear(), today.getMonth() - mIdx, 1);
    for (const p of platforms) {
      const baseStart: Record<string, number> = {
        facebook: 9000,
        instagram: 11000,
        threads: 6000,
        tiktok: 13000,
        youtube: 8000,
      };
      const growthPerMonth: Record<string, number> = {
        facebook: 250,
        instagram: 380,
        threads: 120,
        tiktok: 500,
        youtube: 180,
      };
      const followers = Math.floor(baseStart[p] + growthPerMonth[p] * (12 - mIdx) * (0.9 + Math.random() * 0.2));
      followerData.push({ brandId: brand.id, platform: p, date: monthDate, followers });
    }
  }
  await prisma.followerSnapshot.createMany({ data: followerData });

  console.log('Seeding completed successfully!');
  console.log('Brand:', brand);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
}).finally(() => prisma.$disconnect());
