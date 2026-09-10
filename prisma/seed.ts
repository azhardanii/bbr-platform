import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const targetEmail = "syauqiazhardanii@gmail.com";
  console.log(`[Seed] Provisioning user: ${targetEmail}...`);

  const user = await prisma.user.upsert({
    where: { email: targetEmail },
    create: {
      email: targetEmail,
      nama_lengkap: "Syauqi Azhar Danii",
      tier: "summit",
      onboarding_completed: true,
      jenjang: "S1",
      jurusan: "Teknik Informatika",
      universitas: "Universitas Indonesia",
      punya_judul: true,
      judul_skripsi: "Rancang Bangun Sistem Pendamping Penyusunan Tugas Akhir Terintegrasi AI",
    },
    update: {
      tier: "summit",
    },
  });

  console.log(`[Seed] User configured: ${user.email} (ID: ${user.id}, Tier: ${user.tier})`);

  // Ensure default document exists
  let document = await prisma.document.findFirst({
    where: { user_id: user.id },
  });

  if (!document) {
    document = await prisma.document.create({
      data: {
        user_id: user.id,
        title: user.judul_skripsi || "Naskah Skripsi",
        type: "skripsi",
      },
    });

    // Seed standard chapters
    const chapters = [
      { order: 0, title: "BAB I PENDAHULUAN" },
      { order: 1, title: "BAB II TINJAUAN PUSTAKA" },
      { order: 2, title: "BAB III METODOLOGI PENELITIAN" },
      { order: 3, title: "BAB IV HASIL DAN PEMBAHASAN" },
      { order: 4, title: "BAB V KESIMPULAN DAN SARAN" },
    ];

    for (const chap of chapters) {
      await prisma.outline.create({
        data: {
          document_id: document.id,
          title: chap.title,
          order: chap.order,
          content: `<p>Mulai menulis draf ${chap.title.toLowerCase()} di sini...</p>`,
        },
      });
    }
    console.log(`[Seed] Document & chapters created for user.`);
  }

  // Ensure progress initialized
  for (let b = 1; b <= 5; b++) {
    await prisma.babProgress.upsert({
      where: {
        user_id_bab: {
          user_id: user.id,
          bab: b,
        },
      },
      create: {
        user_id: user.id,
        bab: b,
        percentage: 0,
      },
      update: {},
    });
  }

  console.log(`[Seed] Success! Database seeding finished.`);
}

main()
  .catch((e) => {
    console.error("[Seed] Error during seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
