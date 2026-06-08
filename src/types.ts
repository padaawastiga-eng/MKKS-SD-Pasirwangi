/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface School {
  id: string;
  namaSekolah: string;
  npsn: string;
  namaKS: string;
  nipKS: string;
  statusKS: 'Definitif' | 'PLT';
  fotoKS?: string; // base64 representation or placeholder
}

export interface Agenda {
  id: string;
  judul: string;
  waktu: string;
  tempat: string;
  dokumen?: string; // base64 or placeholder pdf string
  namaDokumen?: string;
}

export interface ProgramKerja {
  id: string;
  judulProgram: string;
  isiProgram: string;
}

export interface Sekretariat {
  alamat: string;
  noKontak: string;
  email: string;
}

export interface UserAccount {
  id: string;
  nama: string;
  nip?: string;
  namaSekolah?: string;
  email: string;
  password?: string;
  isActive: boolean;
  registrationType: 'admin_forced' | 'self_registered';
}

export interface AboutMkks {
  deskripsi: string;
  visi: string;
  misi: string;
  foto?: string;
}

export interface GaleriKegiatan {
  id: string;
  judul: string;
  foto: string;
  tanggal?: string;
}

export interface AdminProfile {
  nama: string;
  foto: string;
}

export interface DigitalFile {
  id: string;
  namaFile: string;
  namaAsli: string;
  fileContent: string; // Base64 content or simulation string
  dateAdded: string; // "DD-MM-YYYY" or custom string
  fileSize: string; // "450 KB", etc.
  fileType: string; // File classification
}
