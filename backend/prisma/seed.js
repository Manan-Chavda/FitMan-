const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const exercises = [
  {
    id: "bench-press",
    name: "Bench Press",
    muscle_groups: ["chest", "arms"],
    demo_video_url: "https://example.com/bench-press"
  },
  {
    id: "squat",
    name: "Squat",
    muscle_groups: ["legs", "core"],
    demo_video_url: "https://example.com/squat"
  },
  {
    id: "deadlift",
    name: "Deadlift",
    muscle_groups: ["back", "legs"],
    demo_video_url: "https://example.com/deadlift"
  },
  {
    id: "shoulder-press",
    name: "Shoulder Press",
    muscle_groups: ["shoulders", "arms"],
    demo_video_url: "https://example.com/shoulder-press"
  },
  {
    id: "barbell-row",
    name: "Barbell Row",
    muscle_groups: ["back", "arms"],
    demo_video_url: "https://example.com/barbell-row"
  }
];

async function main() {
  for (const exercise of exercises) {
    await prisma.exercise.upsert({
      where: { id: exercise.id },
      update: exercise,
      create: exercise
    });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
