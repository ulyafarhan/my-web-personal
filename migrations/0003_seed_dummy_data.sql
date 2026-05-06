-- Clean up existing data first to avoid duplicates
DELETE FROM proyek_tag;
DELETE FROM tag;
DELETE FROM proyek;
DELETE FROM pengalaman;
DELETE FROM sertifikat;

-- SEED TAGS
INSERT INTO tag (id, nama, slug) VALUES 
('TAG001', 'PHP', 'php'),
('TAG002', 'Laravel', 'laravel'),
('TAG003', 'Next.js', 'nextjs'),
('TAG004', 'Vue.js', 'vuejs'),
('TAG005', 'Docker', 'docker'),
('TAG006', 'PostgreSQL', 'postgresql'),
('TAG007', 'Cloudflare', 'cloudflare'),
('TAG008', 'React', 'react');

-- SEED PROYEK (15 data)
INSERT INTO proyek (id, judul, slug, ringkasan, konten_html, status_publikasi, dipublikasikan_pada) VALUES 
('PRJ001', 'High Performance PHP Server', 'high-perf-php', 'Sistem server non-blocking menggunakan PHP Fiber.', '<p>Detail riset arsitektur server PHP...</p>', 1, '2024-04-20 10:00:00'),
('PRJ002', 'AI Chatbot Integration', 'ai-chatbot', 'Chatbot pintar menggunakan Groq API.', '<p>Integrasi AI untuk customer support...</p>', 1, '2024-04-18 12:00:00'),
('PRJ003', 'Microservices Orchestrator', 'micro-orch', 'Platform manajemen microservices berbasis Docker.', '<p>Manajemen kontainer otomatis...</p>', 1, '2024-04-15 09:00:00'),
('PRJ004', 'Real-time Stock Monitor', 'stock-monitor', 'Monitoring saham real-time dengan WebSockets.', '<p>Dashboard saham interaktif...</p>', 1, '2024-04-10 15:00:00'),
('PRJ005', 'Secure Auth Library', 'secure-auth', 'Library autentikasi biometrik untuk web.', '<p>Implementasi WebAuthn standar baru...</p>', 1, '2024-04-05 08:30:00'),
('PRJ006', 'Database Migration Tool', 'db-migrator', 'Alat migrasi database antar platform.', '<p>Sinkronisasi data tanpa downtime...</p>', 1, '2024-03-28 11:00:00'),
('PRJ007', 'E-commerce API Engine', 'ecom-api', 'Engine API skala besar untuk retail.', '<p>Infrastruktur backend e-commerce...</p>', 1, '2024-03-20 14:00:00'),
('PRJ008', 'Serverless Image Processor', 'img-processor', 'Pemroses gambar otomatis di edge server.', '<p>Optimasi gambar real-time...</p>', 1, '2024-03-15 16:00:00'),
('PRJ009', 'Blockchain Traceability', 'trace-block', 'Sistem pelacakan logistik berbasis blockchain.', '<p>Keamanan rantai pasok transparan...</p>', 1, '2024-03-05 10:00:00'),
('PRJ010', 'Smart IoT Dashboard', 'iot-dash', 'Dashboard monitoring perangkat IoT.', '<p>Visualisasi data sensor cerdas...</p>', 1, '2024-02-28 09:00:00'),
('PRJ011', 'LMS Backend Architecture', 'lms-backend', 'Infrastruktur backend untuk platform edukasi.', '<p>Skalabilitas sistem pembelajaran...</p>', 1, '2024-02-20 13:00:00'),
('PRJ012', 'Automated QA Suite', 'qa-suite', 'Framework testing otomatis untuk sistem kritis.', '<p>Pengujian integrasi end-to-end...</p>', 1, '2024-02-15 11:30:00'),
('PRJ013', 'Log Analytics Platform', 'log-analytics', 'Platform analisis log server skala besar.', '<p>Deteksi anomali pada log sistem...</p>', 1, '2024-02-05 08:00:00'),
('PRJ014', 'Multi-tenant CRM', 'multi-crm', 'Sistem CRM untuk berbagai skala bisnis.', '<p>Arsitektur data multi-tenant aman...</p>', 1, '2024-01-25 15:00:00'),
('PRJ015', 'Financial Risk Engine', 'risk-engine', 'Engine perhitungan risiko finansial otomatis.', '<p>Analisis data risiko keuangan...</p>', 1, '2024-01-15 10:00:00');

-- SEED PROYEK_TAG
INSERT INTO proyek_tag (proyek_id, tag_id) VALUES 
('PRJ001', 'TAG001'), ('PRJ001', 'TAG005'),
('PRJ002', 'TAG003'), ('PRJ002', 'TAG007'),
('PRJ003', 'TAG005'), ('PRJ003', 'TAG006'),
('PRJ004', 'TAG001'), ('PRJ004', 'TAG004'),
('PRJ005', 'TAG002'), ('PRJ005', 'TAG008'),
('PRJ006', 'TAG001'), ('PRJ006', 'TAG006'),
('PRJ007', 'TAG002'), ('PRJ007', 'TAG006'),
('PRJ008', 'TAG007'), ('PRJ008', 'TAG003'),
('PRJ009', 'TAG001'), ('PRJ009', 'TAG002'),
('PRJ010', 'TAG004'), ('PRJ010', 'TAG005'),
('PRJ011', 'TAG002'), ('PRJ011', 'TAG006'),
('PRJ012', 'TAG001'), ('PRJ012', 'TAG005'),
('PRJ013', 'TAG001'), ('PRJ013', 'TAG006'),
('PRJ014', 'TAG002'), ('PRJ014', 'TAG004'),
('PRJ015', 'TAG001'), ('PRJ015', 'TAG006');

-- SEED PENGALAMAN (15 data)
INSERT INTO pengalaman (id, peran, organisasi, periode, deskripsi, urutan) VALUES 
('EXP001', 'Independent Researcher', 'PHP Non-blocking Architecture', 'Jan 2024 - Sekarang', 'Fokus meneliti implementasi PHP Fiber.', 1),
('EXP002', 'Lead Backend Engineer', 'Sistem Informasi Akademik', 'Jun 2023 - Des 2023', 'Merancang ulang arsitektur micro-services.', 2),
('EXP003', 'Database Optimization', 'E-commerce Lokal', 'Feb 2023 - Mei 2023', 'Mendesain ulang skema database MySQL.', 3),
('EXP004', 'API Developer', 'Payment Gateway Integration', 'Okt 2022 - Jan 2023', 'Membangun RESTful API layer yang aman.', 4),
('EXP005', 'Infrastructure Admin', 'Proyek Mandiri Cloud', 'Agt 2022 - Okt 2022', 'Setup dan pemeliharaan Linux VPS.', 5),
('EXP006', 'Fullstack Developer', 'Aplikasi Inventaris', 'Mei 2022 - Jul 2022', 'Mengembangkan sistem inventaris real-time.', 6),
('EXP007', 'Security Auditor', 'Sistem HRD Internal', 'Mar 2022 - Apr 2022', 'Melakukan penetration testing dasar.', 7),
('EXP008', 'DevOps Enthusiast', 'CI/CD Pipeline Setup', 'Jan 2022 - Feb 2022', 'Membangun pipeline otomatis GitHub Actions.', 8),
('EXP009', 'Backend Developer', 'Pemesanan Tiket Online', 'Okt 2021 - Des 2021', 'Optimasi concurrency handling sistem.', 9),
('EXP010', 'Performance Engineer', 'Optimasi Web App', 'Agt 2021 - Sep 2021', 'Meningkatkan skor Lighthouse Web.', 10),
('EXP011', 'Open Source Contributor', 'Laravel Framework', 'Jun 2021 - Agt 2021', 'Kontribusi pada repositori Laravel.', 11),
('EXP012', 'System Analyst', 'Migrasi Data SQL', 'Mar 2021 - Mei 2021', 'Merancang skrip migrasi data ETL.', 12),
('EXP013', 'Mentor Pemrograman', 'Komunitas Developer', 'Jan 2021 - Mar 2021', 'Mengajarkan fundamental PHP modern.', 13),
('EXP014', 'Junior Web Developer', 'Web Company Profile', 'Nov 2020 - Jan 2021', 'Membuat website company profile SEO.', 14),
('EXP015', 'Peserta Bootcamp', 'Backend Mastery', 'Agt 2020 - Nov 2020', 'Menyelesaikan 5 proyek backend.', 15);

-- SEED SERTIFIKAT (15 data)
INSERT INTO sertifikat (id, nama, penerbit, tahun, url_kredensial, urutan) VALUES
('CRT001', 'Architecting on AWS', 'Amazon', '2024', '#', 1),
('CRT002', 'Backend Expert', 'Dicoding', '2023', '#', 2),
('CRT003', 'Laravel Certified', 'Laravel', '2023', '#', 3),
('CRT004', 'Advanced Database', 'Coursera', '2023', '#', 4),
('CRT005', 'Linux Server Admin', 'Red Hat', '2022', '#', 5),
('CRT006', 'Docker for Devs', 'Udemy', '2022', '#', 6),
('CRT007', 'Vue.js Mastery', 'Vue Mastery', '2022', '#', 7),
('CRT008', 'Web Security', 'OWASP', '2021', '#', 8),
('CRT009', 'Redis Specialist', 'Redis Univ', '2021', '#', 9),
('CRT010', 'Git Mastery', 'Codecademy', '2021', '#', 10),
('CRT011', 'API Design', 'Pluralsight', '2021', '#', 11),
('CRT012', 'TypeScript Pro', 'Frontend Masters', '2020', '#', 12),
('CRT013', 'Solid Patterns', 'Udemy', '2020', '#', 13),
('CRT014', 'PHP Unit Testing', 'TestDriven.io', '2020', '#', 14),
('CRT015', 'SQL Fundamental', 'HackerRank', '2020', '#', 15);
