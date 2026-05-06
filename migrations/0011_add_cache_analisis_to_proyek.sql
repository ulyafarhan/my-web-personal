-- Migration: Add cache_analisis to proyek for expert system memoization
ALTER TABLE proyek ADD COLUMN cache_analisis TEXT;
