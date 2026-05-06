-- Migration: Restructure aturan_pakar for Admin Linter V3.0
ALTER TABLE aturan_pakar ADD COLUMN kode_aturan TEXT;
ALTER TABLE aturan_pakar ADD COLUMN nama_modul TEXT;
ALTER TABLE aturan_pakar ADD COLUMN tipe_aksi TEXT DEFAULT 'info';
