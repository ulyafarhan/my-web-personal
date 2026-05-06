-- Seed pengaturan publik tanpa menimpa nilai yang sudah ada.
INSERT OR IGNORE INTO pengaturan_situs (kunci, nilai, grup) VALUES
('nama_pemilik', 'Farhan', 'profil'),
('profesi', 'Full-Stack Developer', 'profil'),
('hero_badge', 'Tersedia untuk proyek, riset, dan kolaborasi teknologi', 'publik'),
('hero_title', 'Membangun produk digital yang cepat, aman, dan siap berkembang.', 'publik'),
('hero_desc', 'Saya membantu merancang dan membangun aplikasi web modern, backend API, integrasi cloud, dan pengalaman antarmuka yang rapi untuk kebutuhan bisnis maupun eksperimen teknis.', 'publik'),
('ringkasan_diri', 'Farhan adalah pengembang web yang berfokus pada backend, arsitektur aplikasi, integrasi cloud, dan antarmuka yang nyaman digunakan.', 'profil'),
('cta_primary', 'Diskusikan Proyek', 'publik'),
('cta_secondary', 'Lihat Karya Saya', 'publik'),
('email_kontak', 'hello@example.com', 'kontak'),
('github_url', 'https://github.com/', 'kontak'),
('linkedin_url', 'https://linkedin.com/', 'kontak'),
('stat_1_label', 'Proyek dan riset teknis', 'publik'),
('stat_1_value', '30+', 'publik'),
('stat_2_label', 'Teknologi yang dieksplorasi', 'publik'),
('stat_2_value', '20+', 'publik'),
('stat_3_label', 'Fokus kualitas dan performa', 'publik'),
('stat_3_value', '99%', 'publik');
