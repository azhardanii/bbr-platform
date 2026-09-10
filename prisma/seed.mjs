import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const ADMIN_USERS = [
  {
    email: "syauqiazhardanii@gmail.com",
    nama_lengkap: "Syauqi Azhar Danii",
    universitas: "Universitas Indonesia",
    jurusan: "Teknik Informatika",
    judul_skripsi: "Rancang Bangun Sistem Pendamping Penyusunan Tugas Akhir Terintegrasi AI",
  },
  {
    email: "krisnoadiputra@gmail.com",
    nama_lengkap: "Krisno Adi Putra",
    universitas: "Universitas Brawijaya",
    jurusan: "Sistem Informasi",
    judul_skripsi: "Optimasi Alur Pengerjaan Skripsi dengan Dukungan Asisten AI Cerdas",
  },
  {
    email: "linirose6@gmail.com",
    nama_lengkap: "Lini Rose",
    universitas: "Universitas Gadjah Mada",
    jurusan: "Ilmu Komunikasi",
    judul_skripsi: "Analisis Efektivitas Pendampingan Belajar Digital Berbasis AI",
  },
];

async function main() {
  console.log("[Seed] Provisioning Admin Users...");

  for (const admin of ADMIN_USERS) {
    console.log(`[Seed] Provisioning admin user: ${admin.email}...`);

    const user = await prisma.user.upsert({
      where: { email: admin.email },
      create: {
        email: admin.email,
        nama_lengkap: admin.nama_lengkap,
        tier: "summit",
        role: "admin",
        onboarding_completed: true,
        jenjang: "S1",
        jurusan: admin.jurusan,
        universitas: admin.universitas,
        punya_judul: true,
        judul_skripsi: admin.judul_skripsi,
      },
      update: {
        tier: "summit",
        role: "admin",
        onboarding_completed: true,
      },
    });

    console.log(`[Seed] Configured: ${user.email} (ID: ${user.id}, Role: ${user.role}, Tier: ${user.tier})`);

    // Ensure document & default chapters exist for workspace
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
    }

    // Ensure babProgress exists
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
  }

  console.log("[Seed] Success! All admin users and initial data seeded.");
}

main()
  .catch((e) => {
    console.error("[Seed] Error during seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
