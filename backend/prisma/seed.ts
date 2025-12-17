import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  // Clear existing data
  await prisma.post.deleteMany();
  await prisma.lookbook.deleteMany();
  await prisma.metricSnapshot.deleteMany();
  await prisma.weeklyTask.deleteMany();
  await prisma.channelConnection.deleteMany();
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

  // Seed User
  await prisma.user.create({
    data: {
      name: 'Admin',
      email: 'admin@dottie.vn',
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

  console.log('Seeding completed successfully!');
  console.log('Brand:', brand);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
}).finally(() => prisma.$disconnect());
