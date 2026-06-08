import { createClient } from '@supabase/supabase-js';
import { School, Agenda, ProgramKerja, Sekretariat, UserAccount, AboutMkks, GaleriKegiatan, DigitalFile } from './types';

// Extract and normalize the Supabase project configuration
const rawUrl = (((import.meta as any).env?.VITE_SUPABASE_URL) || 'https://tpbeoqkwdorahqsestbk.supabase.co/rest/v1/').trim();
const SUPABASE_URL = rawUrl.endsWith('/rest/v1/') ? rawUrl.slice(0, -9) : rawUrl.endsWith('/rest/v1') ? rawUrl.slice(0, -8) : rawUrl;
const SUPABASE_ANON_KEY = (((import.meta as any).env?.VITE_SUPABASE_ANON_KEY) || 'sb_publishable_f97QpPaEhcrnH1JuCQ08Pg_bPSoyprL').trim();

// Create the Supabase Client
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true
  }
});

/**
 * Checks connection to Supabase and tries to fetch tables.
 * Returns table existence status to help guide administrators on setting up their database schemas.
 */
export async function checkSupabaseConnection() {
  try {
    // Attempt schema inspection or basic auth call to confirm connectivity
    const { data: authTest, error: authError } = await supabase.from('schools').select('id').limit(1);

    if (authError) {
      // If the table 'schools' doesn't exist, it is still "connected" but shows table creation is required.
      if (authError.code === '42P01') {
        return {
          connected: true,
          tablesExist: false,
          error: 'Connected to Supabase, but some or all core tables (schools, users, etc.) have not been created yet.'
        };
      }
      return {
        connected: false,
        tablesExist: false,
        error: authError.message
      };
    }

    return {
      connected: true,
      tablesExist: true,
      error: null
    };
  } catch (err: any) {
    return {
      connected: false,
      tablesExist: false,
      error: err.message || 'Unknown network error occurred.'
    };
  }
}

/**
 * Bulk Schema generation query snippet content for the administrator dashboard console
 */
export const SUPABASE_SQL_SCHEMA = `-- COPY AND PASTE THIS INTO YOUR SUPABASE SQL EDITOR TO SETUP TABLE SCHEMAS INSTANTLY

-- 1. Table Kelembagaan SD (schools)
CREATE TABLE IF NOT EXISTS public.schools (
    id TEXT PRIMARY KEY,
    "namaSekolah" TEXT NOT NULL,
    npsn TEXT NOT NULL UNIQUE,
    "namaKS" TEXT NOT NULL,
    "nipKS" TEXT DEFAULT '',
    "statusKS" TEXT DEFAULT 'Definitif',
    "fotoKS" TEXT DEFAULT ''
);

-- Enable RLS/Bypass RLS for immediate access
ALTER TABLE public.schools ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read-write for ease" ON public.schools FOR ALL USING (true) WITH CHECK (true);

-- 2. Table Akun Anggota & Admin (users)
CREATE TABLE IF NOT EXISTS public.users (
    id TEXT PRIMARY KEY,
    nama TEXT NOT NULL,
    nip TEXT DEFAULT '',
    "namaSekolah" TEXT DEFAULT '',
    email TEXT NOT NULL UNIQUE,
    password TEXT DEFAULT '',
    "isActive" BOOLEAN DEFAULT true,
    "registrationType" TEXT DEFAULT 'self_registered'
);

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read-write users" ON public.users FOR ALL USING (true) WITH CHECK (true);

-- 3. Table Agenda Kegiatan (agendas)
CREATE TABLE IF NOT EXISTS public.agendas (
    id TEXT PRIMARY KEY,
    judul TEXT NOT NULL,
    waktu TEXT NOT NULL,
    tempat TEXT NOT NULL,
    dokumen TEXT DEFAULT '',
    "namaDokumen" TEXT DEFAULT ''
);

ALTER TABLE public.agendas ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read-write agendas" ON public.agendas FOR ALL USING (true) WITH CHECK (true);

-- 4. Table Program Kerja (programs)
CREATE TABLE IF NOT EXISTS public.programs (
    id TEXT PRIMARY KEY,
    "judulProgram" TEXT NOT NULL,
    "isiProgram" TEXT NOT NULL
);

ALTER TABLE public.programs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read-write programs" ON public.programs FOR ALL USING (true) WITH CHECK (true);

-- 5. Table Sekretariat (sekretariat)
CREATE TABLE IF NOT EXISTS public.sekretariat (
    id TEXT PRIMARY KEY DEFAULT 'primary',
    alamat TEXT NOT NULL,
    "noKontak" TEXT NOT NULL,
    email TEXT NOT NULL
);

ALTER TABLE public.sekretariat ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read-write sekretariat" ON public.sekretariat FOR ALL USING (true) WITH CHECK (true);
-- Insert initial record
INSERT INTO public.sekretariat (id, alamat, "noKontak", email) VALUES ('primary', 'Jl. Raya Pasirwangi No. 12, Kec. Pasirwangi, Garut', '08123456789', 'admin@mkks.com') ON CONFLICT DO NOTHING;

-- 6. Table About MKKS (about_info)
CREATE TABLE IF NOT EXISTS public.about_info (
    id TEXT PRIMARY KEY DEFAULT 'primary',
    deskripsi TEXT NOT NULL,
    visi TEXT NOT NULL,
    misi TEXT NOT NULL,
    foto TEXT DEFAULT ''
);

ALTER TABLE public.about_info ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read-write about_info" ON public.about_info FOR ALL USING (true) WITH CHECK (true);

-- 7. Table Galeri Kegiatan (galeri)
CREATE TABLE IF NOT EXISTS public.galeri (
    id TEXT PRIMARY KEY,
    judul TEXT NOT NULL,
    foto TEXT NOT NULL,
    tanggal TEXT DEFAULT ''
);

ALTER TABLE public.galeri ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read-write galeri" ON public.galeri FOR ALL USING (true) WITH CHECK (true);

-- 8. Table Digital Files / Administrasi (digital_files)
CREATE TABLE IF NOT EXISTS public.digital_files (
    id TEXT PRIMARY KEY,
    "namaFile" TEXT NOT NULL,
    "namaAsli" TEXT NOT NULL,
    "fileContent" TEXT NOT NULL,
    "dateAdded" TEXT NOT NULL,
    "fileSize" TEXT NOT NULL,
    "fileType" TEXT NOT NULL
);

ALTER TABLE public.digital_files ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read-write digital_files" ON public.digital_files FOR ALL USING (true) WITH CHECK (true);
`;

/**
 * GENERIC SYNCHRONIZER WRAPPERS
 */

export async function fetchFromSupabase<T>(table: string, fallback: T[]): Promise<T[]> {
  try {
    const { data, error } = await supabase.from(table).select('*');
    if (error) {
      console.warn(`Supabase: Failed to fetch table "${table}". Using local state fallback.`, error);
      return fallback;
    }
    return (data as T[]) || fallback;
  } catch (err) {
    console.warn(`Supabase Network Error for table "${table}":`, err);
    return fallback;
  }
}

export async function upsertToSupabase<T extends { id: string | number }>(table: string, item: T) {
  try {
    const { error } = await supabase.from(table).upsert(item);
    if (error) {
      console.error(`Supabase: Error upserting into table "${table}":`, error);
      return false;
    }
    return true;
  } catch (err) {
    console.error(`Supabase Network Error during upsert into "${table}":`, err);
    return false;
  }
}

export async function deleteFromSupabase(table: string, id: string | number) {
  try {
    const { error } = await supabase.from(table).delete().eq('id', id);
    if (error) {
      console.error(`Supabase: Error deleting from table "${table}" where id = ${id}:`, error);
      return false;
    }
    return true;
  } catch (err) {
    console.error(`Supabase Network Error during delete from "${table}":`, err);
    return false;
  }
}

// Special single-record handlers
export async function getSingleRecord<T>(table: string, id: string, fallback: T): Promise<T> {
  try {
    const { data, error } = await supabase.from(table).select('*').eq('id', id).single();
    if (error) {
      return fallback;
    }
    return (data as T) || fallback;
  } catch (err) {
    return fallback;
  }
}

export async function saveSingleRecord<T>(table: string, record: T) {
  try {
    const { error } = await supabase.from(table).upsert({ id: 'primary', ...record });
    return !error;
  } catch (err) {
    return false;
  }
}
