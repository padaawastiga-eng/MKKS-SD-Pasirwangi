/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { School, Agenda, ProgramKerja, Sekretariat, UserAccount, AboutMkks, GaleriKegiatan, DigitalFile } from './types';

export const initialSchools: School[] = [
  {
    id: 's-1',
    namaSekolah: 'SDN 1 Pasirwangi',
    npsn: '20224101',
    namaKS: 'H. Jajang, S.Pd., M.M.',
    nipKS: '196805121991031002',
    statusKS: 'Definitif',
    fotoKS: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&auto=format&fit=crop&q=60&ixlib=rb-4.0.3'
  },
  {
    id: 's-2',
    namaSekolah: 'SDN 2 Pasirwangi',
    npsn: '20224102',
    namaKS: 'Drs. Agus Mulyana',
    nipKS: '197108231996041001',
    statusKS: 'Definitif',
    fotoKS: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=60&ixlib=rb-4.0.3'
  },
  {
    id: 's-3',
    namaSekolah: 'SDN 1 Sarimukti',
    npsn: '20224103',
    namaKS: 'Hj. Endah Rohaeti, S.Pd.',
    nipKS: '197511042000122002',
    statusKS: 'Definitif',
    fotoKS: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=60&ixlib=rb-4.0.3'
  },
  {
    id: 's-4',
    namaSekolah: 'SDN 2 Sarimukti',
    npsn: '20224104',
    namaKS: 'Ade Sukmana, S.Pd.',
    nipKS: '197804152006041005',
    statusKS: 'PLT',
    fotoKS: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=60&ixlib=rb-4.0.3'
  },
  {
    id: 's-5',
    namaSekolah: 'SDN 1 Padaawas',
    npsn: '20224105',
    namaKS: 'Dadan Hamdani, M.Pd.',
    nipKS: '197003181993071001',
    statusKS: 'Definitif',
    fotoKS: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=60&ixlib=rb-4.0.3'
  },
  {
    id: 's-6',
    namaSekolah: 'SDN 2 Padaawas',
    npsn: '20224106',
    namaKS: 'Endang Setiawan, S.Pd.',
    nipKS: '198002012009031003',
    statusKS: 'Definitif',
    fotoKS: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=60&ixlib=rb-4.0.3'
  },
  {
    id: 's-7',
    namaSekolah: 'SDN 1 Karyamekar',
    npsn: '20224107',
    namaKS: 'Hj. Siti Aminah, S.Pd.SD.',
    nipKS: '196901151992112001',
    statusKS: 'Definitif',
    fotoKS: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=60&ixlib=rb-4.0.3'
  },
  {
    id: 's-8',
    namaSekolah: 'SDN 2 Karyamekar',
    npsn: '20224108',
    namaKS: 'Sulaeman, S.Pd.',
    nipKS: '198212102010011004',
    statusKS: 'PLT',
    fotoKS: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=60&ixlib=rb-4.0.3'
  },
  {
    id: 's-9',
    namaSekolah: 'SDN 1 Talaga',
    npsn: '20224109',
    namaKS: 'Yayan Ruhian, M.M.Pd.',
    nipKS: '197305141998031003',
    statusKS: 'Definitif',
    fotoKS: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=60&ixlib=rb-4.0.3'
  },
  {
    id: 's-10',
    namaSekolah: 'SDN 2 Talaga',
    npsn: '20224110',
    namaKS: 'Asep Saepuloh, S.Pd.',
    nipKS: '197609202005011008',
    statusKS: 'Definitif',
    fotoKS: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=60&ixlib=rb-4.0.3'
  },
  {
    id: 's-11',
    namaSekolah: 'SDN 3 Padaawas',
    npsn: '20224111',
    namaKS: 'Sri Mulyati, S.Pd.',
    nipKS: '197910112008012012',
    statusKS: 'Definitif',
    fotoKS: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=60&ixlib=rb-4.0.3'
  },
  {
    id: 's-12',
    namaSekolah: 'SDN 3 Pasirwangi',
    npsn: '20224112',
    namaKS: 'H. Tatang Supriatna, S.Pd.',
    nipKS: '196706051992031005',
    statusKS: 'Definitif',
    fotoKS: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=60&ixlib=rb-4.0.3'
  }
];

export const initialAgendas: Agenda[] = [
  {
    id: 'a-1',
    judul: 'Rapat Koordinasi Persiapan Penilaian Akhir Semester (PAS)',
    waktu: '2026-06-15T09:00',
    tempat: 'Aula SDN 1 Pasirwangi',
    namaDokumen: 'Surat_Undangan_PAS.pdf',
    dokumen: 'data:application/pdf;base64,JVBERi0xLjQKJ...[Undangan Rapat]'
  },
  {
    id: 'a-2',
    judul: 'Sosialisasi dan Pendampingan Juknis BOSP Tahun Anggaran 2026',
    waktu: '2026-06-22T10:00',
    tempat: 'Gedung PGRI Kecamatan Pasirwangi',
    namaDokumen: 'Panduan_Teknis_BOSP_2026.pdf',
    dokumen: 'data:application/pdf;base64,JVBERi0xLjQKJ...[Panduan BOSP]'
  },
  {
    id: 'a-3',
    judul: 'Workshop Peningkatan Kompetensi Guru dalam Implementasi Kurikulum Merdeka',
    waktu: '2026-07-05T08:30',
    tempat: 'SDN 1 Padaawas',
    namaDokumen: 'Panduan_Workshop_IKM.pdf',
    dokumen: 'data:application/pdf;base64,JVBERi0xLjQKJ...[Workshop IKM]'
  }
];

export const initialProgramKerja: ProgramKerja[] = [
  {
    id: 'p-1',
    judulProgram: 'Peningkatan Kompetensi Profesional Kepala Sekolah',
    isiProgram: 'Melaksanakan workshop kepemimpinan, pelatihan pengelolaan administrasi sekolah berbasis digital (BOSP, ARKAS, PMM), dan studi komparasi antar gugus sekolah di Garut.'
  },
  {
    id: 'p-2',
    judulProgram: 'Standardisasi Manajemen Mutu Lulusan',
    isiProgram: 'Penyelarasan kisi-kisi dan instrumen penilaian sumatif tingkat kecamatan, pembinaan kegiatan ekstrakurikuler (GSI, FLS2N, O2SN, OSN) tingkat rayon SD.'
  },
  {
    id: 'p-3',
    judulProgram: 'Optimalisasi Sarana dan Pendanaan Pendidikan',
    isiProgram: 'Mengadakan pendampingan berkelanjutan tentang pelaporan dana BOSP, asistensi inventarisasi aset sekolah, serta kerja sama dengan instansi terkait untuk bantuan renovasi fisik.'
  }
];

export const initialSekretariat: Sekretariat = {
  alamat: 'Jl. Raya Pasirwangi No. 124, Kec. Pasirwangi, Kabupaten Garut, Jawa Barat 44161 (Kompleks Kantor Korwil Pendidikan)',
  noKontak: '0812-3456-7890',
  email: 'mkks.sd.pasirwangi@gmail.com'
};

export const initialAboutMkks: AboutMkks = {
  deskripsi: 'Musyawarah Kerja Kepala Sekolah (MKKS) Sekolah Dasar Kecamatan Pasirwangi merupakan wadah perkumpulan, komunikasi, dan koordinasi Kepala Sekolah Dasar di wilayah Kecamatan Pasirwangi. Organisasi ini dibentuk untuk meningkatkan profesionalisme Kepala Sekolah guna mewujudkan pendidikan berkualitas unggul, religius, dan berkarakter di Pasirwangi.',
  visi: 'Mewujudkan kepemimpinan sekolah dasar yang profesional, kolaboratif, dan inovatif dalam mensukseskan Merdeka Belajar di Kecamatan Pasirwangi.',
  misi: 'Meningkatkan kompetensi pedagogik, manajerial, kewirausahaan, supervisi, dan sosial para kepala sekolah dasar.\nMemfasilitasi koordinasi program dinas pendidikan pusat dan daerah.\nMengembangkan jaringan kemitraan pendidikan untuk meningkatkan sarana dan mutu pembelajaran.\nMendorong inovasi digital untuk kemudahan tata kelola administrasi sekolah dasar se-kecamatan.',
  foto: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=600&auto=format&fit=crop&q=80'
};

export const initialUsers: UserAccount[] = [
  {
    id: 'u-admin',
    nama: 'Admin Utama',
    email: 'admin@mkks.com',
    isActive: true,
    registrationType: 'admin_forced'
  },
  {
    id: 'u-1',
    nama: 'Ahmad Sodikin, S.Pd.',
    nip: '197410022005011004',
    namaSekolah: 'SDN 1 Sarimukti',
    email: 'ahmad.sarimukti@gmail.com',
    password: 'password123',
    isActive: true,
    registrationType: 'self_registered'
  },
  {
    id: 'u-2',
    nama: 'Dewi Lestari, M.Pd.',
    nip: '198105152009042001',
    namaSekolah: 'SDN 2 Pasirwangi',
    email: 'dewi.pasirwangi@gmail.com',
    password: 'password123',
    isActive: true,
    registrationType: 'admin_forced'
  }
];

export const initialGaleri: GaleriKegiatan[] = [
  {
    id: 'g-1',
    judul: 'Rapat Pleno Kerja Pengurus MKKS Kec. Pasirwangi',
    foto: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800&auto=format&fit=crop&q=80',
    tanggal: '2026-05-12'
  },
  {
    id: 'g-2',
    judul: 'Workshop Peningkatan Kompetensi Implementasi Kurikulum Merdeka',
    foto: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=800&auto=format&fit=crop&q=80',
    tanggal: '2026-05-20'
  },
  {
    id: 'g-3',
    judul: 'Seleksi Festival & Lomba Seni Siswa Nasional (FLS2N)',
    foto: 'https://images.unsplash.com/photo-1511556532299-8f662fc26c06?w=800&auto=format&fit=crop&q=80',
    tanggal: '2026-05-28'
  },
  {
    id: 'g-4',
    judul: 'Rapat Koordinasi & Evaluasi Penggunaan Sistem Informasi RKAS',
    foto: 'https://images.unsplash.com/photo-1577896851231-70ef18881754?w=800&auto=format&fit=crop&q=80',
    tanggal: '2026-06-02'
  }
];

export const initialDigitalFiles: DigitalFile[] = [
  {
    id: 'f-1',
    namaFile: 'Template RKAS BOSP 2026 (Format Excel)',
    namaAsli: 'Template_RKAS_BOSP_2026_Kecamatan.xlsx',
    fileContent: 'data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64,mockSheetData...',
    dateAdded: '2026-06-01',
    fileSize: '320 KB',
    fileType: 'Excel Spreadsheet'
  },
  {
    id: 'f-2',
    namaFile: 'Format Blangko Daftar Hadir Guru & Komite Sekolah',
    namaAsli: 'Blangko_Daftar_Hadir_Rapat_Komite.pdf',
    fileContent: 'data:application/pdf;base64,mockPdfData...',
    dateAdded: '2026-06-04',
    fileSize: '180 KB',
    fileType: 'Portable Document Format'
  },
  {
    id: 'f-3',
    namaFile: 'Panduan Penyusunan LJK Sekolah Standar Rayon Pasirwangi',
    namaAsli: 'Pedoman_LJK_Pasirwangi.docx',
    fileContent: 'data:application/vnd.openxmlformats-officedocument.wordprocessingml.document;base64,mockWordData...',
    dateAdded: '2026-06-07',
    fileSize: '540 KB',
    fileType: 'Word Document'
  }
];


