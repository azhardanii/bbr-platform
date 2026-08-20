1. PENDAHULUAN & LATAR BELAKANG STRATEGIS
Dokumen ini disusun untuk merinci spesifikasi fungsional dan teknis terkait perubahan ruang lingkup (scope adjustments) pada pengembangan Minimum Viable Product (MVP). Berdasarkan hasil review teknis dan operasional, beberapa perubahan fitur utama dilakukan untuk mempercepat waktu peluncuran (launching), memangkas kompleksitas pengembangan perangkat lunak dari estimasi 1-2 minggu menjadi pengerjaan yang lebih efisien, serta menekan biaya operasional API kecerdasan buatan (HPP). Fokus utama dokumen ini adalah memberikan panduan implementasi yang presisi bagi tim pengembang mengenai fitur-fitur yang diperbarui, fitur-fitur yang dipertahankan, serta ketergantungan teknisnya.

2. DETAIL SPESIFIKASI FITUR YANG DIPERBARUI (UPDATED FEATURES)
2.1. Sistem Pengunggahan Draf Per Bab (Peralihan dari Editor Teks Internal)
Latar Belakang: Rencana awal untuk membangun text editor internal (WYSIWYG mini word-processor terintegrasi) ditunda karena kompleksitas integrasi database dan sinkronisasi real-time yang memakan waktu pengembangan sekitar 1-2 minggu.
Deskripsi Fitur: Mahasiswa tidak mengetik langsung di dalam platform. Sebagai gantinya, mereka menulis di aplikasi lokal (Microsoft Word/Google Docs) lalu mengunggah file draf mentah mereka per bab (Bab 1, Bab 2, dst.) ke dalam platform. Platform akan mengekstrak teks, merapikan format, mengelola sitasi, dan mengekspor kompilasi akhir dokumen.
Alur Pengguna (User Flow):
Pengguna masuk ke dashboard proyek naskah mereka.
Pengguna memilih bab yang ingin diunggah (misal: "Unggah Bab 1").
Pengguna mengunggah berkas mentah (format .docx atau teks terkompresi).
Sistem membaca naskah, melakukan ekstraksi konten, dan menjalankan analisis bibliometrik/asisten penulisan secara latar belakang.
Pengguna dapat melihat ringkasan hasil parsing teks dan mengunduh berkas hasil penataan otomatis.
Batasan: Pengguna menyusun halaman judul pertama (cover) dan lembar pengesahan secara mandiri di luar platform. Platform hanya fokus memproses isi naskah teks utama dan lampiran opsional.
Kebutuhan Fungsional:
Sistem pengarsipan dan penamaan file unggahan yang rapi agar tidak tercecer (mencegah kebiasaan mahasiswa membuat folder lokal berantakan).
Fungsi kompilasi dokumen yang menggabungkan seluruh file bab terunggah menjadi satu dokumen utuh (.pdf/.docx) saat diunduh.
2.2. Sistem Margin & Pemformatan Desain Halaman Otomatis
Deskripsi Fitur: Otomatisasi pengaturan margin, spasi, tipe font, dan ukuran halaman sesuai dengan aturan pedoman akademik kampus pengguna. Mahasiswa tidak perlu melakukan pengaturan format secara manual yang sering membingungkan atau rawan salah.
Alur Pengguna (User Flow):
Pengguna mengunggah file template pedoman penulisan kampus mereka, ATAU memilih nama universitas mereka dari daftar template kampus standar yang disediakan platform.
Sistem menerapkan format margin (misalnya aturan 4-4-3-3), spasi baris, dan ukuran font secara dinamis ke dokumen bab yang diunggah.
Pengguna dapat melakukan kustomisasi parameter format (margin, font, spasi) secara manual jika terdapat aturan khusus dari program studi.
Kebutuhan Fungsional:
Mesin pemformat dokumen (.docx/.pdf rendering engine) yang menerapkan aturan CSS/formatting styles secara konsisten pada hasil unduhan dokumen.
2.3. Struktur Bab Dinamis
Deskripsi Fitur: Fleksibilitas pengaturan bab penulisan naskah. Platform tidak membatasi struktur dokumen hanya pada skema standar 5 bab, melainkan menyesuaikan dengan kebutuhan kurikulum yang bervariasi.
Alur Pengguna (User Flow):
Saat inisiasi proyek, sistem menyajikan kerangka bab default (standar 5 bab).
Pengguna dapat menekan tombol "Tambah Bab" untuk menambahkan bab baru (misalnya struktur 6 atau 7 bab yang biasa digunakan di kampus tertentu).
Pengguna dapat menghapus bab yang tidak diperlukan atau merubah urutan serta judul bab secara dinamis.
Kebutuhan Fungsional:
Database skema dokumen yang dinamis untuk menyimpan jumlah bab, judul bab, dan status progres masing-masing bab per pengguna secara independen.
2.4. Preferensi Bahasa Login & Fitur Penerjemah Draf
Deskripsi Fitur: Penyediaan antarmuka multi-bahasa sejak awal penggunaan aplikasi serta asisten penerjemah draf akademis terintegrasi untuk membantu mahasiswa yang menulis naskah dalam Bahasa Inggris.
Alur Pengguna (User Flow):
Pada halaman login awal, terdapat pilihan preferensi bahasa antarmuka: Bahasa Indonesia atau Bahasa Inggris.
Di dalam modul penulisan, disediakan tombol "Terjemahkan Draf".
Mahasiswa mengunggah draf bab berbahasa Indonesia, lalu sistem secara otomatis menerjemahkan draf tersebut ke Bahasa Inggris dengan struktur tata bahasa akademis yang formal.
Kebutuhan Fungsional:
Integrasi dengan API penerjemah/LLM yang dikonfigurasi khusus untuk mempertahankan gaya penulisan ilmiah (scholarly translation), bukan sekadar terjemahan harfiah.
2.5. Simulasi Sidang Akademis dengan Fitur Suara (Voice Integration)
Deskripsi Fitur: Peningkatan fitur simulasi sidang pertahanan tesis/skripsi dari yang semula hanya obrolan teks menjadi simulasi interaktif berbasis suara dua arah (voice-to-voice simulation).
Alur Pengguna (User Flow):
Pengguna memilih tingkat keparahan/karakter dosen penguji (persona dosen: dari dosen yang ramah membimbing hingga dosen "frontal/galak" yang melontarkan kritik tajam seperti "Model penelitian kamu jelek!").
Sistem memunculkan teks pertanyaan sidang di layar dan membacakannya menggunakan fitur Text-to-Speech (TTS).
Pengguna merespons pertanyaan dosen dengan menekan tombol mikrofon dan berbicara secara langsung (Voice Input/Speech-to-Text).
Sistem melakukan konversi suara pengguna ke teks, memproses jawaban menggunakan LLM, lalu menghasilkan respons balasan berupa teks dan suara penguji berikutnya.
Kebutuhan Fungsional:
Integrasi Web Speech API (atau library Speech-to-Text & Text-to-Speech sejenis) dengan latensi rendah.
Penyimpanan log percakapan teks untuk dievaluasi oleh pengguna setelah sesi simulasi berakhir.
2.6. Panduan Pengguna Interaktif (Interactive Guide) & FAQ Melayang
Deskripsi Fitur: Sistem orientasi pengguna baru (onboarding) untuk mencegah kebingungan pengguna pemula (beginner) saat pertama kali mengakses aplikasi, dilengkapi pusat bantuan cepat yang selalu siaga.
Alur Pengguna (User Flow):
Saat pengguna pertama kali masuk ke halaman utama (Beranda), sistem secara otomatis menjalankan panduan interaktif langkah-demi-langkah (interactive guide / tour guide overlay) yang menjelaskan fungsi menu utama secara runtut. Pengguna diberi opsi untuk melewati panduan (skip guide).
Di sudut kanan bawah layar, dipasang sebuah ikon FAQ melayang (floating icon). Jika diklik, akan muncul jendela pop-up berisi daftar pertanyaan yang sering diajukan dan panduan cepat penggunaan fitur utama platform.
2.7. Sistem Notifikasi WhatsApp (WA Gateway Integration)
Deskripsi Fitur: Penyediaan jalur komunikasi instan kepada dosen pembimbing akademis untuk memantau progres mahasiswa secara lebih responsif dibandingkan jalur email konvensional.
Alur Kerja Sistem:
Sistem memantau pencapaian milestone mahasiswa.
Ketika mahasiswa menyelesaikan bab atau draf penting, sistem secara otomatis mengirimkan notifikasi perkembangan ke WhatsApp dosen pembimbing menggunakan nomor admin resmi platform.
Notifikasi memuat tautan cepat bagi dosen untuk memberikan komentar atau persetujuan draf.
3. FITUR-FITUR MVP YANG DIPERTAHANKAN (MAINTAINED FEATURES)
Fitur-fitur inti ini merupakan fondasi utama platform dan tetap dikembangkan sesuai rencana awal tanpa ada perubahan fungsionalitas:

Template & Outline Builder: Penyediaan kerangka kerja outline bab standar sesuai pedoman penulisan universitas.
Manajer Sitasi Pintar (Citation Manager):
Reference Library: Repositori penyimpanan referensi (jurnal, buku, situs web) yang terpisah dari dokumen draf naskah utama.
Search & Fetch Metadata: Pencarian dan penambahan metadata referensi secara otomatis menggunakan nomor DOI atau judul jurnal via integrasi API eksternal.
In-text Citation Engine: Menyisipkan kode atau penanda sitasi di draf tulisan secara real-time.
Bibliography Generator: Penyusunan daftar pustaka otomatis yang disaring cerdas hanya menampilkan referensi yang benar-benar dikutip (cited) di dalam teks naskah.
Style Switching Engine & Custom Formatting: Sistem menyediakan pilihan template gaya penulisan daftar pustaka standar (APA, MLA, Chicago, IEEE, dll.) secara instan. Selain itu, terdapat fitur bagi pengguna untuk mengatur/memodifikasi secara kustom (custom format) tampilan daftar pustaka sesuai dengan pedoman spesifik kampus jika ada perbedaan detail dari standar umum.
Consistency Checker: Validasi silang otomatis antara sitasi aktif di dalam teks dengan daftar pustaka di bagian akhir.
Progress Tracker & Milestone Generator:
Ceklis progres penulisan bab.
Auto-Milestone Generator: Memecah tugas besar menulis bab menjadi tugas-tugas kecil berskala 10% agar tidak terasa berat bagi mahasiswa.
Timeline Pre-planning & Reminder: Penjadwalan tanggal deadline sidang akhir mahasiswa dan penyesuaian tenggat tugas dinamis. Jika progres selesai lebih cepat, linimasa berikutnya otomatis dimajukan ke depan.
Activity Lock: Perekaman data analitik pola kerja menulis (misalnya jumlah kata per sesi menulis) agar mahasiswa memahami produktivitas mereka sendiri.
AI Writing Assistant (Asisten Penulisan AI):
Pemeriksa tata bahasa (grammar checker) Bahasa Indonesia secara real-time.
Asisten parafrase akademis untuk mengubah struktur kalimat bahasa sehari-hari mahasiswa menjadi bahasa akademis formal yang logis dan objektif.
Kolaborasi Pembimbing (Komentar & Anotasi):
Dosen pembimbing dapat memberikan catatan revisi atau anotasi langsung pada draf draf mahasiswa.
Batasan MVP: Hak akses sementara disimulasikan di bawah kendali pemilik platform untuk mempermudah operasional awal.
4. FITUR KOMPLEKS YANG DITUNDA (DEFERRED FEATURES)
Untuk memastikan MVP dapat segera dirilis ke pasar tanpa hambatan teknis, fitur berikut ditunda pengembangannya ke fase pasca-MVP:

Integrasi SPSS / mesin analisis data statistik lanjutan.
Generator slide presentasi otomatis dari draf naskah.
Forum komunitas interaktif skala luas untuk alumni dan mahasiswa lintas kampus.
Modul manajemen publikasi jurnal ilmiah tingkat tinggi (seperti integrasi indeks Sinta untuk mahasiswa jenjang S2/S3).
5. KETERGANTUNGAN TEKNIS (TECHNICAL DEPENDENCIES)
Untuk mempercepat waktu rekayasa perangkat lunak, tim pengembang disarankan mengintegrasikan teknologi dan library open-source berikut:

Metadata Fetching: Menggunakan Crossref API (akses gratis dan terbuka) untuk otomatisasi pengisian metadata sitasi berdasarkan judul atau DOI.
Citation Styling: Menggunakan CSL (Citation Style Language) standar terbuka (mirip mesin yang digunakan Zotero dan Mendeley) untuk melakukan render otomatis pada gaya daftar pustaka, sehingga tim tidak perlu menulis kode pemformatan gaya sitasi dari nol.
AI Processing & Paraphrase: Integrasi dengan API model bahasa besar (LLM) seperti Gemini API atau Claude API yang dikonfigurasi dengan batasan prompt ketat (system instruction) untuk menjaga gaya bahasa akademis formal dan meminimalkan biaya token per panggilan (cost per generate).