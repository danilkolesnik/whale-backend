import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Default rewards for places 1..10 (tools)
  const defaultRewards: { place: number; reward: number }[] = [
    { place: 1, reward: 10000 },
    { place: 2, reward: 9000 },
    { place: 3, reward: 8000 },
    { place: 4, reward: 7000 },
    { place: 5, reward: 6000 },
    { place: 6, reward: 5000 },
    { place: 7, reward: 4000 },
    { place: 8, reward: 3000 },
    { place: 9, reward: 2000 },
    { place: 10, reward: 1000 },
  ];

  for (const r of defaultRewards) {
    await prisma.ratingReward.upsert({
      where: { place: r.place },
      update: { reward: r.reward },
      create: { place: r.place, reward: r.reward },
    });
  }

  console.log('Seeded RatingReward defaults');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });


