-- Seed Expert Linter Rules V3.0
INSERT INTO aturan_pakar (id, kode_aturan, nama_modul, kondisi_tag, rekomendasi, tipe_aksi, bobot, aktif)
VALUES 
('LINT001', 'VAL-001', 'TechStackConflictValidator', 
'{"operator": "AND", "rules": [{"type": "has_tag", "value": "React"}, {"type": "has_tag", "value": "Vue"}], "exempt_if_content_has": "migrasi"}', 
'Konflik arsitektur terdeteksi. Anda memasukkan dua teknologi kompetitor (React & Vue). Pastikan deskripsi menjelaskan alasan teknis penggunaan keduanya.', 
'warning', 100, 1),

('LINT002', 'SEC-001', 'CredentialLeakScanner', 
'{"type": "regex", "value": "ey[A-Za-z0-9_-]{10,}\\.[A-Za-z0-9_-]{10,}\\.[A-Za-z0-9_-]{10,}|sk_live_|ghp_"}', 
'BAHAYA: Deteksi kemungkinan kebocoran API Key atau Token (JWT/Github Token). Hapus string rahasia sebelum menyimpan.', 
'error', 100, 1),

('LINT003', 'ARC-001', 'ArchitectureDepthScorer', 
'{"operator": "AND", "rules": [{"type": "has_tag", "value": "Cloudflare Workers"}, {"type": "word_count_less_than", "value": 150}]}', 
'Proyek dengan arsitektur tingkat lanjut butuh dokumentasi mendalam. Pertimbangkan untuk menambahkan paragraf mengenai pola desain atau tantangan teknis.', 
'info', 50, 1),

('LINT004', 'SEO-001', 'TechnicalSEOGuard', 
'{"type": "seo_title_length", "value": 60}', 
'Judul SEO terlalu panjang (maksimal 60 karakter). Sesuaikan agar lebih optimal untuk mesin pencari.', 
'warning', 30, 1),

('LINT005', 'PERF-001', 'AssetPerformanceEvaluator', 
'{"type": "image_format_raw"}', 
'Format gambar statis (PNG/JPG). Manfaatkan jalur Cloudflare Image Resizing (parameter format=avif) untuk efisiensi bandwidth.', 
'info', 20, 1),

('LINT006', 'REPO-001', 'RepositoryHealthChecker', 
'{"type": "repo_platform_invalid"}', 
'Tautan repositori tidak menggunakan platform standar (GitHub/GitLab). Pastikan tautan aman dan dapat diakses publik.', 
'warning', 10, 1),

('LINT007', 'FIN-001', 'FinOpsBudgetAssessor', 
'{"type": "missing_keywords_if_tags", "tags": ["AWS", "GCP", "Cloudflare"], "keywords": ["biaya", "cost", "efisiensi", "latency", "penghematan"]}', 
'Anda menggunakan infrastruktur Cloud. Disarankan menambahkan metrik efisiensi operasional (contoh: "Menurunkan latensi 30%").', 
'info', 40, 1);
