-- Migration: 0008_add_keahlian_table
-- Created at: 2026-05-05

CREATE TABLE keahlian (
    id TEXT PRIMARY KEY,
    nama TEXT NOT NULL,
    persentase INTEGER NOT NULL DEFAULT 0,
    kategori TEXT,
    warna TEXT,
    urutan INTEGER DEFAULT 0,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TRIGGER trg_keahlian_updated_at
AFTER UPDATE ON keahlian
FOR EACH ROW
BEGIN
    UPDATE keahlian SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;
