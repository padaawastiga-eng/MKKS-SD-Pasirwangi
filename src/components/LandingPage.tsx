/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef } from 'react';
import { School, Agenda, UserAccount, AboutMkks, ProgramKerja, Sekretariat, GaleriKegiatan } from '../types';
import { 
  School as SchoolIcon, Users, Calendar, ArrowRight, Award, BookOpen, 
  Sparkles, Search, MapPin, Phone, Mail, Download, CheckCircle2, 
  ChevronRight, CalendarDays, Compass, HelpCircle, GraduationCap, Building2,
  ChevronLeft, X, Image as ImageIcon
} from 'lucide-react';

interface LandingPageProps {
  schools: School[];
  agendas: Agenda[];
  users: UserAccount[];
  aboutInfo: AboutMkks;
  programs: ProgramKerja[];
  sekretariat: Sekretariat;
  galeri?: GaleriKegiatan[];
  onNavigate: (page: string) => void;
}

export default function LandingPage({ 
  schools, 
  agendas, 
  users, 
  aboutInfo, 
  programs, 
  sekretariat, 
  galeri = [],
  onNavigate 
}: LandingPageProps) {
  const activeUsersCount = users.filter(u => u.isActive).length;

  // Search & Filter State for Schools
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'Semua' | 'Definitif' | 'PLT'>('Semua');
  const [selectedSchool, setSelectedSchool] = useState<School | null>(null);
  const [selectedGalleryItem, setSelectedGalleryItem] = useState<GaleriKegiatan | null>(null);

  // Scroll Ref for Schools Directory Carousel
  const directoryScrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  // Check scroll positions
  const checkScroll = () => {
    if (directoryScrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = directoryScrollRef.current;
      setCanScrollLeft(scrollLeft > 5);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 5);
    }
  };

  const handleScrollLeft = () => {
    if (directoryScrollRef.current) {
      directoryScrollRef.current.scrollBy({ left: -300, behavior: 'smooth' });
      // Minor timeout to check scroll as smooth scroll isn't instant
      setTimeout(checkScroll, 350);
    }
  };

  const handleScrollRight = () => {
    if (directoryScrollRef.current) {
      directoryScrollRef.current.scrollBy({ left: 300, behavior: 'smooth' });
      setTimeout(checkScroll, 350);
    }
  };

  useEffect(() => {
    checkScroll();
    if (directoryScrollRef.current) {
      directoryScrollRef.current.scrollTo({ left: 0 });
    }
  }, [searchQuery, statusFilter, schools]);

  // Filter computation
  const filteredSchools = schools.filter(school => {
    const matchesSearch = 
      school.namaSekolah.toLowerCase().includes(searchQuery.toLowerCase()) ||
      school.npsn.includes(searchQuery) ||
      school.namaKS.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (statusFilter === 'Semua') return matchesSearch;
    return matchesSearch && school.statusKS === statusFilter;
  });

  // Helper to format iso datetime string
  const formatDateTime = (dateTimeStr: string) => {
    try {
      if (!dateTimeStr) return '';
      const date = new Date(dateTimeStr);
      const options: Intl.DateTimeFormatOptions = { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric', 
        hour: '2-digit', 
        minute: '2-digit' 
      };
      return date.toLocaleDateString('id-ID', options) + ' WIB';
    } catch (e) {
      return dateTimeStr;
    }
  };

  // Handler for dynamic PDF document download/view simulation
  const handleDownloadDoc = (agenda: Agenda) => {
    if (agenda.dokumen) {
      // Create a blob link and trigger download for natural, authentic experience!
      const link = document.createElement('a');
      link.href = agenda.dokumen;
      link.download = agenda.namaDokumen || `Undangan_Kegiatan_${agenda.id}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      alert(`Pratinjau dokumen tidak tersedia untuk "${agenda.judul}"`);
    }
  };

  // Handler to display the PDF in a new tab (Browser Preview)
  const handleViewPdf = (agenda: Agenda) => {
    if (!agenda.dokumen) {
      alert(`Pratinjau dokumen tidak tersedia untuk "${agenda.judul}"`);
      return;
    }

    try {
      // Check if it's a base64 string
      if (agenda.dokumen.startsWith('data:application/pdf;base64,')) {
        const base64Data = agenda.dokumen.split(',')[1];
        
        // Check if it's a mock/simulated base64
        const isFake = base64Data.includes('...') || base64Data.length < 100;
        
        if (isFake) {
          // Open a beautifully styled official letter preview in a new window/tab
          const newWindow = window.open('', '_blank');
          if (newWindow) {
            newWindow.document.write(`
              <!DOCTYPE html>
              <html lang="id">
              <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Pratinjau Dokumen - ${agenda.judul}</title>
                <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&family=JetBrains+Mono&display=swap" rel="stylesheet">
                <script src="https://cdn.tailwindcss.com"></script>
                <style>
                  body { font-family: 'Inter', sans-serif; }
                  @media print {
                    .no-print { display: none !important; }
                    body { background: white !important; }
                  }
                </style>
              </head>
              <body class="bg-slate-100 text-slate-800 min-h-screen py-10 px-4">
                
                <!-- Action bar -->
                <div class="max-w-4xl mx-auto mb-6 flex justify-between items-center bg-white p-4 rounded-xl border border-slate-200 shadow-sm no-print">
                  <div class="flex items-center gap-3">
                    <div class="bg-indigo-600 text-white p-2.5 rounded-xl font-bold text-xs">PDF PREVIEW</div>
                    <div>
                      <h4 class="font-bold text-xs text-slate-900">${agenda.namaDokumen || 'Dokumen_Resmi.pdf'}</h4>
                      <p class="text-[10px] text-slate-500">Pratinjau Dokumen Cetak Resmi Online</p>
                    </div>
                  </div>
                  <div class="flex items-center gap-2">
                    <button onclick="window.print()" class="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg transition active:scale-95">
                      Cetak / Simpan PDF
                    </button>
                    <button onclick="window.close()" class="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-750 text-slate-700 text-xs font-bold rounded-lg transition active:scale-95">
                      Tutup
                    </button>
                  </div>
                </div>

                <!-- Main Official Letter Style -->
                <main class="max-w-4xl mx-auto bg-white border border-slate-300 shadow-xl rounded-2xl p-10 sm:p-16 relative min-h-[1050px] flex flex-col justify-between">
                  <div>
                    <!-- Kop Surat Resmi -->
                    <div class="text-center border-b-[3px] border-slate-900 pb-5 mb-8">
                      <h2 class="text-base font-extrabold tracking-wide uppercase text-slate-950 leading-tight">PEMERINTAH KABUPATEN GARUT</h2>
                      <h1 class="text-lg sm:text-xl font-black tracking-widest uppercase text-slate-950 leading-tight mt-1">DINAS PENDIDIKAN KECAMATAN PASIRWANGI</h1>
                      <h3 class="text-xs sm:text-sm font-semibold tracking-wider uppercase text-slate-900 mt-1">MUSYAWARAH KERJA KEPALA SEKOLAH (MKKS-SD)</h3>
                      <p class="text-[10px] text-slate-500 font-mono mt-1.5">
                        Sekretariat Bersama: ${sekretariat.alamat || 'Jl. Raya Pasirwangi No. 124, Kec. Pasirwangi, Kab. Garut, Kode Pos 44161'}
                      </p>
                    </div>

                    <!-- Meta Surat -->
                    <div class="flex flex-col sm:flex-row justify-between text-xs text-slate-700 mb-8 leading-relaxed">
                      <div class="space-y-0.5">
                        <div><strong>Nomor :</strong> 037/MKKS-SD/PWG/${new Date(agenda.waktu).getFullYear()}</div>
                        <div><strong>Lampiran :</strong> 1 (Satu) berkas</div>
                        <div><strong>Perihal :</strong> Undangan Rapat Kerja & Koordinasi Terpadu</div>
                      </div>
                      <div class="text-left sm:text-right mt-3 sm:mt-0">
                        <div>Pasirwangi, ${new Date(agenda.waktu).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
                        <div class="mt-2 text-left">
                          <strong>Kepada Yth.</strong><br>
                          <span>Bapak/Ibu Kepala Sekolah Dasar <br>Se-Kecamatan Pasirwangi</span><br>
                          <span class="italic text-[11px] text-slate-500">di Tempat</span>
                        </div>
                      </div>
                    </div>

                    <!-- Isi Surat -->
                    <div class="text-xs sm:text-sm text-slate-800 space-y-4 leading-relaxed font-sans text-justify pt-4">
                      <p>Dengan hormat,</p>
                      
                      <p>
                        Sehubungan dengan agenda rutin bulanan serta menindaklanjuti arahan dari Koordinator Wilayah Bidang Pendidikan Kecamatan Pasirwangi mengenai koordinasi program kerja semester baru, bersama ini kami mengundang Bapak/Ibu Kepala Sekolah Dasar (baik Definitif maupun Pelaksana Tugas/PLT) untuk hadir dalam kegiatan musyawarah kerja terpadu yang bertajuk:
                      </p>

                      <p class="font-bold text-center bg-indigo-50/50 py-3 rounded-xl border border-indigo-100 text-indigo-900 text-xs sm:text-sm my-4">
                        "${agenda.judul}"
                      </p>

                      <p>Adapun rangkaian agenda penting tersebut akan diselenggarakan pada:</p>

                      <table class="w-full text-xs sm:text-sm border-collapse my-3">
                        <tbody>
                          <tr class="border-b border-slate-100">
                            <td class="w-32 font-bold py-2 align-top">Hari / Tanggal</td>
                            <td class="w-4 py-2 align-top">:</td>
                            <td class="py-2 align-top font-semibold text-slate-900">
                              ${new Date(agenda.waktu).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                            </td>
                          </tr>
                          <tr class="border-b border-slate-100">
                            <td class="font-bold py-2 align-top">Waktu kegiatan</td>
                            <td class="py-2 align-top">:</td>
                            <td class="py-2 align-top font-mono font-bold text-indigo-600">
                              ${new Date(agenda.waktu).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB s.d. Selesai
                            </td>
                          </tr>
                          <tr class="border-b border-slate-100">
                            <td class="font-bold py-2 align-top">Tempat</td>
                            <td class="py-2 align-top">:</td>
                            <td class="py-2 align-top font-semibold text-slate-900">
                              ${agenda.tempat}
                            </td>
                          </tr>
                          <tr>
                            <td class="font-bold py-2 align-top">Agenda Rapat</td>
                            <td class="py-2 align-top">:</td>
                            <td class="py-2 align-top text-slate-700">
                              Pembahasan program kerja komite sekolah, penyelarasan juknis BOSP nasional, serta evaluasi administrasi ARKAS/BOSP di tingkat rayon.
                            </td>
                          </tr>
                        </tbody>
                      </table>

                      <p class="pt-2">
                        Meningkatnya tantangan pengelolaan sekolah menuntut koordinasi program ini dilakukan demi kemajuan seluruh lembaga pendidikan dasar se-Kecamatan Pasirwangi. Oleh karena itu, kehadiran Bapak/Ibu Kepala Sekolah sangat kami harapkan tepat waktu.
                      </p>

                      <p>Demikian surat undangan resmi ini kami sampaikan, atas sinergi, perhatian dan kehadiran Bapak/Ibu sekalian, kami mengucapkan terima kasih.</p>
                    </div>
                  </div>

                  <!-- Penutup & Tanda Tangan -->
                  <div class="flex justify-end text-xs pt-12">
                    <div class="text-center w-64 space-y-16">
                      <div>
                        <strong class="block uppercase text-slate-900">Musyawarah Kerja Kepala Sekolah</strong>
                        <span class="block">Kecamatan Pasirwangi</span>
                      </div>
                      <div class="space-y-0.5">
                        <strong class="block underline font-bold text-slate-900">PENGURUS MKKS PASIRWANGI</strong>
                        <span class="text-[10px] text-slate-400 font-mono">Dinas Pendidikan Kabupaten Garut</span>
                      </div>
                    </div>
                  </div>

                </main>
              </body>
              </html>
            `);
            newWindow.document.close();
          }
        } else {
          // If it is a real fully encoded base64 string, let's decode to binary and show using a Blob URL in browser view!
          const byteCharacters = atob(base64Data);
          const byteNumbers = new Array(byteCharacters.length);
          for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
          }
          const byteArray = new Uint8Array(byteNumbers);
          const blob = new Blob([byteArray], { type: 'application/pdf' });
          const fileURL = URL.createObjectURL(blob);
          window.open(fileURL, '_blank');
        }
      } else {
        // If it starts directly with http or other path
        window.open(agenda.dokumen, '_blank');
      }
    } catch (e) {
      console.error(e);
      // Fallback in case of pop up blocker issues is downloading directly
      handleDownloadDoc(agenda);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans text-slate-800 scroll-smooth">
      
      {/* Navbar Portal */}
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-4 py-3.5 sm:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-tr from-sky-500 to-indigo-600 p-2.5 rounded-xl shadow-md shadow-indigo-150 text-white">
              <SchoolIcon className="w-6 h-6" />
            </div>
            <div>
              <span className="font-bold text-lg leading-tight tracking-tight text-slate-900 block">MKKS SD Pasirwangi</span>
              <span className="text-[10px] sm:text-xs text-indigo-600 font-bold tracking-wider uppercase block">Kecamatan Pasirwangi, Garut</span>
            </div>
          </div>
          <div className="flex items-center gap-2.5 sm:gap-4">
            <a 
              href="#school-directory"
              className="hidden lg:inline-block text-slate-650 hover:text-indigo-600 font-semibold text-xs transition px-2"
            >
              Direktori Sekolah
            </a>
            <a 
              href="#agenda-section"
              className="hidden lg:inline-block text-slate-650 hover:text-indigo-600 font-semibold text-xs transition px-2"
            >
              Agenda Kegiatan
            </a>
            <a 
              href="#galeri-section"
              className="hidden lg:inline-block text-slate-650 hover:text-indigo-600 font-semibold text-xs transition px-2"
            >
              Galeri Kegiatan
            </a>
            <button
              onClick={() => onNavigate('login')}
              className="group flex items-center gap-2 bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-600 hover:to-indigo-700 text-white font-bold px-4 sm:px-5 py-2.5 rounded-xl transition-all duration-300 shadow-md shadow-indigo-100 hover:shadow-lg hover:shadow-indigo-200 active:scale-95 text-xs sm:text-sm cursor-pointer"
            >
              <span>Login Sistem</span>
              <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="relative py-16 px-4 sm:px-8 md:py-24 bg-gradient-to-b from-indigo-900 via-indigo-950 to-slate-900 text-white overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-sky-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/15 text-sky-300 text-[10px] sm:text-xs font-semibold uppercase mb-6 tracking-wider animate-pulse">
            <Sparkles className="w-4 h-4 text-sky-300" />
            <span>Portal Resmi Organisasi Kependidikan - Kec. Pasirwangi</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight sm:leading-none text-transparent bg-clip-text bg-gradient-to-r from-white via-sky-300 via-white via-indigo-200 via-white to-sky-100 bg-[length:260%_auto] animate-shimmer mb-6 font-sans drop-shadow-xl">
            MKKS SD <br className="hidden sm:inline" /> Kecamatan Pasirwangi
          </h1>
          <p className="text-sm sm:text-base md:text-lg text-slate-300 max-w-2xl mx-auto mb-10 leading-relaxed font-normal">
            Sinergi dan kolaborasi Kepala Sekolah Dasar se-Kecamatan Pasirwangi untuk mewujudkan kepemimpinan sekolah yang profesional, kualitas lulusan unggul, dan tata kelola pendidikan modern yang transparan.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => onNavigate('login')}
              className="w-full sm:w-auto bg-gradient-to-r from-sky-450 to-indigo-505 bg-sky-500 hover:bg-indigo-600 text-white font-bold px-8 py-3.5 rounded-xl transition-all duration-300 shadow-lg shadow-sky-950/40 text-sm hover:-translate-y-0.5"
            >
              Masuk ke Dashboard Sistem
            </button>
            <a
              href="#about-section"
              className="w-full sm:w-auto bg-white/10 hover:bg-white/15 text-slate-200 border border-white/20 font-semibold px-8 py-3.5 rounded-xl transition-all duration-300 text-sm"
            >
              Tentang Kami
            </a>
          </div>
        </div>
      </header>

      {/* Metrics Section (Dynamic Counts from Real Data) */}
      <section className="relative z-20 max-w-7xl mx-auto px-4 sm:px-8 -mt-10 w-full">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {/* Card Total Sekolah - Sky Theme */}
          <div className="bg-gradient-to-br from-white via-white to-sky-50/40 rounded-3xl p-6 border border-slate-100 hover:border-sky-300 shadow-[0_10px_25px_-5px_rgba(14,165,233,0.08)] hover:shadow-[0_20px_35px_-5px_rgba(14,165,233,0.15)] flex items-center gap-4 hover:translate-y-[-6px] transition-all duration-300 group">
            <div className="p-3 bg-sky-50 rounded-2xl text-sky-600 shrink-0 group-hover:scale-110 group-hover:bg-sky-100/85 transition-all duration-300 shadow-sm shadow-sky-100">
              <SchoolIcon className="w-5 h-5 sm:w-6 h-6" />
            </div>
            <div>
              <span className="block text-[9px] text-slate-400 font-extrabold uppercase tracking-widest">Total Sekolah</span>
              <span className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight block mt-0.5">{schools.length}</span>
              <span className="text-[10px] text-sky-650 font-bold block mt-0.5">SD Negeri/Swasta</span>
            </div>
          </div>

          {/* Card Kepala Sekolah - Indigo Theme */}
          <div className="bg-gradient-to-br from-white via-white to-indigo-50/40 rounded-3xl p-6 border border-slate-100 hover:border-indigo-300 shadow-[0_10px_25px_-5px_rgba(99,102,241,0.08)] hover:shadow-[0_20px_35px_-5px_rgba(99,102,241,0.15)] flex items-center gap-4 hover:translate-y-[-6px] transition-all duration-300 group">
            <div className="p-3 bg-indigo-50 rounded-2xl text-indigo-600 shrink-0 group-hover:scale-110 group-hover:bg-indigo-100/85 transition-all duration-300 shadow-sm shadow-indigo-100">
              <GraduationCap className="w-5 h-5 sm:w-6 h-6" />
            </div>
            <div>
              <span className="block text-[9px] text-slate-400 font-extrabold uppercase tracking-widest">Kepala Sekolah</span>
              <span className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight block mt-0.5">
                {schools.filter(s => s.namaKS && s.namaKS.trim() !== '').length}
              </span>
              <span className="text-[10px] text-indigo-650 font-bold block mt-0.5">Guru Pembina</span>
            </div>
          </div>

          {/* Card Anggota Aktif - Emerald Theme */}
          <div className="bg-gradient-to-br from-white via-white to-emerald-50/40 rounded-3xl p-6 border border-slate-100 hover:border-emerald-300 shadow-[0_10px_25px_-5px_rgba(16,185,129,0.08)] hover:shadow-[0_20px_35px_-5px_rgba(16,185,129,0.15)] flex items-center gap-4 hover:translate-y-[-6px] transition-all duration-300 group">
            <div className="p-3 bg-emerald-50 rounded-2xl text-emerald-600 shrink-0 group-hover:scale-110 group-hover:bg-emerald-100/85 transition-all duration-300 shadow-sm shadow-emerald-100">
              <Users className="w-5 h-5 sm:w-6 h-6" />
            </div>
            <div>
              <span className="block text-[9px] text-slate-400 font-extrabold uppercase tracking-widest">Anggota Aktif</span>
              <span className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight block mt-0.5">{activeUsersCount}</span>
              <span className="text-[10px] text-emerald-650 text-emerald-600 font-bold block mt-0.5">Pengurus Akun</span>
            </div>
          </div>

          {/* Card Total Agenda - Amber Theme */}
          <div className="bg-gradient-to-br from-white via-white to-amber-50/40 rounded-3xl p-6 border border-slate-100 hover:border-amber-300 shadow-[0_10px_25px_-5px_rgba(245,158,11,0.08)] hover:shadow-[0_20px_35px_-5px_rgba(245,158,11,0.15)] flex items-center gap-4 hover:translate-y-[-6px] transition-all duration-300 group">
            <div className="p-3 bg-amber-50 rounded-2xl text-amber-500 shrink-0 group-hover:scale-110 group-hover:bg-amber-100/85 transition-all duration-300 shadow-sm shadow-amber-100">
              <Calendar className="w-5 h-5 sm:w-6 h-6" />
            </div>
            <div>
              <span className="block text-[9px] text-slate-400 font-extrabold uppercase tracking-widest">Total Agenda</span>
              <span className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight block mt-0.5">{agendas.length}</span>
              <span className="text-[10px] text-amber-600 font-bold block mt-0.5">Jadwal Rapat</span>
            </div>
          </div>
        </div>
      </section>

      {/* About Section with required background GIF but fully responsive visual card */}
      <section
        id="about-section"
        className="relative py-20 px-4 sm:px-8 mt-12 bg-cover bg-center overflow-hidden"
        style={{
          backgroundImage: `linear-gradient(rgba(15, 23, 42, 0.90), rgba(15, 23, 42, 0.95)), url('https://i.pinimg.com/originals/7f/26/98/7f2698c08e414c0222c86195ebdfd274.gif')`,
          backgroundAttachment: 'fixed',
        }}
      >
        <div className="max-w-6xl mx-auto text-white">
          <div className="flex flex-col gap-8">
            <div>
              <div className="inline-block bg-sky-500/20 px-3.5 py-1.5 rounded-lg border border-sky-500/30 text-sky-400 text-xs font-bold uppercase mb-4 tracking-wider">
                Tentang MKKS
              </div>
              <h2 className="text-2xl sm:text-4xl font-extrabold mb-6 tracking-tight text-white leading-tight">
                Membangun Sinergi <br className="hidden sm:inline" /> Kepala Sekolah Berprestasi
              </h2>
              <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
                {aboutInfo.deskripsi || "Musyawarah Kerja Kepala Sekolah (MKKS) Sekolah Dasar Kecamatan Pasirwangi merupakan wadah perkumpulan, komunikasi, dan koordinasi Kepala Sekolah Dasar di wilayah Kecamatan Pasirwangi."}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4 items-stretch">
              {/* Visi Card - Custom styled dark glass panel with glowing left sky border */}
              <div className="relative overflow-hidden bg-slate-900/60 border border-white/10 rounded-2xl p-6 backdrop-blur-md hover:border-sky-500/30 hover:bg-slate-900/80 transition-all duration-300 shadow-xl group border-l-4 border-l-sky-400 flex flex-col justify-between h-full">
                <div className="absolute top-0 right-0 w-24 h-24 bg-sky-500/5 rounded-full blur-2xl pointer-events-none group-hover:scale-150 transition-all duration-500"></div>
                <div>
                  <div className="flex items-center gap-3 text-sky-400 mb-4 font-extrabold text-sm sm:text-base tracking-wide">
                    <div className="p-1.5 bg-sky-500/10 rounded-lg">
                      <Award className="w-5 h-5 text-sky-400" />
                    </div>
                    <span>VISI KAMI</span>
                  </div>
                  <p className="text-slate-200 text-xs sm:text-sm leading-relaxed whitespace-pre-line font-medium opacity-90 text-justify">
                    {aboutInfo.visi}
                  </p>
                </div>
              </div>

              {/* Misi Card - Custom styled dark glass panel with glowing left indigo border */}
              <div className="relative overflow-hidden bg-slate-900/60 border border-white/10 rounded-2xl p-6 backdrop-blur-md hover:border-indigo-500/30 hover:bg-slate-900/80 transition-all duration-300 shadow-xl group border-l-4 border-l-indigo-500 flex flex-col justify-between h-full">
                <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-full blur-2xl pointer-events-none group-hover:scale-150 transition-all duration-500"></div>
                <div>
                  <div className="flex items-center gap-3 text-indigo-400 mb-4 font-extrabold text-sm sm:text-base tracking-wide font-sans">
                    <div className="p-1.5 bg-indigo-500/10 rounded-lg">
                      <BookOpen className="w-5 h-5 text-indigo-400" />
                    </div>
                    <span>MISI KAMI</span>
                  </div>
                  <p className="text-slate-200 text-xs sm:text-sm leading-relaxed whitespace-pre-line font-medium opacity-90 text-justify">
                    {aboutInfo.misi}
                  </p>
                </div>
              </div>

              {/* Photo Column - Fully responsive and matches height of other cards */}
              <div className="relative group p-1 bg-gradient-to-tr from-sky-400 to-indigo-500 rounded-2xl shadow-2xl overflow-hidden h-full min-h-[300px] md:min-h-0 flex flex-col">
                <div className="relative w-full h-full rounded-xl overflow-hidden flex-1 flex flex-col">
                  <img
                    className="w-full h-full min-h-[292px] md:absolute md:inset-0 object-cover transition-transform duration-500 scale-[1.001] group-hover:scale-105"
                    src={aboutInfo.foto || "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=520&auto=format"}
                    alt="Sekretariat MKKS SD Pasirwangi"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent flex items-end p-5">
                    <div>
                      <span className="block font-black text-xs sm:text-sm tracking-wide text-white leading-tight">Musyawarah & Upaya Mutu</span>
                      <span className="text-[10px] text-sky-305 text-sky-300 tracking-wider font-bold uppercase mt-1 block">Sekretariat Bersama MKKS SD Kecamatan Pasirwangi</span>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* HERO GALERI KEGIATAN SECTION (DAPAT DIATUR ADMIN) */}
      <section id="galeri-section" className="py-20 px-4 sm:px-8 bg-gradient-to-b from-slate-900 via-slate-950 to-indigo-950 text-white w-full border-b border-indigo-950 relative overflow-hidden">
        {/* Background ambient lighting */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-sky-500/5 rounded-full blur-3xl pointer-events-none"></div>

        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-xs text-sky-300 font-extrabold uppercase tracking-widest mb-3.5 mx-auto w-fit">
              <ImageIcon className="w-3.5 h-3.5" />
              <span>Dokumentasi Kegiatan</span>
            </span>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight leading-tight">
              Galeri Kegiatan Terkini
            </h2>
            <p className="text-slate-300/90 text-xs sm:text-sm mt-3 leading-relaxed max-w-xl mx-auto text-center font-medium">
              Sinergi, rapat kerja, koordinasi program, dan inovasi pendidikan dasar se-Kecamatan Pasirwangi yang terekam secara nyata dan kolaboratif.
            </p>
          </div>

          {galeri.length === 0 ? (
            <div className="text-center py-16 bg-white/5 border border-white/10 rounded-3xl p-8 text-slate-400 max-w-md mx-auto">
              <ImageIcon className="w-12 h-12 text-slate-400 mx-auto mb-3 opacity-60" />
              <p className="text-sm font-semibold">Dokumentasi kegiatan belum dimasukkan oleh pengurus.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {galeri.map((item) => (
                <div 
                  key={item.id}
                  onClick={() => setSelectedGalleryItem(item)}
                  className="group relative cursor-pointer overflow-hidden rounded-2xl border border-white/10 bg-slate-900/40 p-2.5 transition-all duration-300 hover:border-indigo-400/60 hover:-translate-y-1 shadow-lg hover:shadow-indigo-505 hover:shadow-[0_20px_35px_rgba(99,102,241,0.15)] flex flex-col"
                >
                  <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl bg-slate-950">
                    <img 
                      referrerPolicy="no-referrer"
                      src={item.foto} 
                      alt={item.judul}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                      <span className="text-[10px] bg-indigo-600 text-white font-extrabold uppercase tracking-wider px-2.5 py-1 rounded shadow-sm border border-indigo-505 border-indigo-500/30">
                        Klik Lihat Detail
                      </span>
                    </div>
                  </div>
                  <div className="p-3 flex-1 flex flex-col justify-between mt-1">
                    <h3 className="line-clamp-2 text-xs font-bold text-slate-100 leading-snug group-hover:text-white transition-colors text-justify">
                      {item.judul}
                    </h3>
                    {item.tanggal && (
                      <span className="block text-[9px] font-mono font-bold text-sky-455 text-sky-400 uppercase tracking-widest mt-2">
                        📅 {item.tanggal}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Program Highlight Area (100% Dynamic from Admin Programs Input) */}
      <section className="py-20 px-4 sm:px-8 max-w-7xl mx-auto w-full border-b border-slate-250">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs text-indigo-600 font-bold uppercase tracking-widest block mb-2">Pilar Program Kerja</span>
          <h2 className="text-3xl font-extrabold text-slate-100/50 text-slate-950 tracking-tight">Rencana & Program Kerja Pengurus</h2>
          <p className="text-slate-500 text-sm sm:text-base mt-2 leading-relaxed">
            Rangkaian aksi nyata kependidikan se-Kecamatan Pasirwangi yang diputuskan dalam musyawarah bersama.
          </p>
        </div>

        {programs.length === 0 ? (
          <div className="text-center py-10 text-slate-400 bg-white border border-slate-200 rounded-2xl p-6">
            Rencana program kerja belum dimasukkan oleh pengurus.
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {programs.map((prog, index) => {
              // Dynamic themes to cycle through
              const themes = [
                {
                  accent: 'bg-gradient-to-b from-sky-500 to-teal-400',
                  bg: 'bg-gradient-to-br from-white via-white to-sky-50/20',
                  iconBg: 'bg-sky-50 text-sky-600 border border-sky-100/50',
                  hoverBorder: 'hover:border-sky-300',
                  shadowHover: 'hover:shadow-[0_20px_35px_-5px_rgba(14,165,233,0.12)]',
                  badgeText: 'Kategori Pendidikan'
                },
                {
                  accent: 'bg-gradient-to-b from-indigo-600 to-violet-500',
                  bg: 'bg-gradient-to-br from-white via-white to-indigo-50/20',
                  iconBg: 'bg-indigo-50 text-indigo-600 border border-indigo-100/50',
                  hoverBorder: 'hover:border-indigo-300',
                  shadowHover: 'hover:shadow-[0_20px_35px_-5px_rgba(99,102,241,0.12)]',
                  badgeText: 'Kategori Keanggotaan'
                },
                {
                  accent: 'bg-gradient-to-b from-amber-500 to-orange-400',
                  bg: 'bg-gradient-to-br from-white via-white to-amber-50/20',
                  iconBg: 'bg-amber-50 text-amber-600 border border-amber-100/50',
                  hoverBorder: 'hover:border-amber-300',
                  shadowHover: 'hover:shadow-[0_20px_35px_-5px_rgba(245,158,11,0.12)]',
                  badgeText: 'Kategori Koordinasi'
                },
                {
                  accent: 'bg-gradient-to-b from-emerald-500 to-teal-400',
                  bg: 'bg-gradient-to-br from-white via-white to-emerald-50/20',
                  iconBg: 'bg-emerald-50 text-emerald-600 border border-emerald-100/50',
                  hoverBorder: 'hover:border-emerald-300',
                  shadowHover: 'hover:shadow-[0_20px_35px_-5px_rgba(16,185,129,0.12)]',
                  badgeText: 'Kategori Standardisasi'
                }
              ];
              const theme = themes[index % themes.length];
              return (
                <div 
                  key={prog.id} 
                  className={`relative overflow-hidden p-6 sm:p-8 rounded-3xl border border-slate-200/80 ${theme.bg} ${theme.hoverBorder} ${theme.shadowHover} transition-all duration-300 hover:-translate-y-1.5 flex flex-col justify-between`}
                >
                  <div className={`absolute top-0 left-0 w-2 h-full ${theme.accent}`}></div>
                  <div>
                    {/* Badge */}
                    <span className="block text-[9px] font-extrabold tracking-widest text-slate-400 uppercase mb-4">
                      {theme.badgeText}
                    </span>
                    <div className="flex items-center justify-between mb-6">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-extrabold text-xs tracking-wider ${theme.iconBg} shadow-sm`}>
                        {String(index + 1).padStart(2, '0')}
                      </div>
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-300 animate-pulse"></span>
                    </div>
                    <h3 className="text-sm sm:text-base font-extrabold text-slate-900 leading-snug mb-3 tracking-tight">
                      {prog.judulProgram}
                    </h3>
                    <p className="text-slate-600 text-xs sm:text-sm leading-relaxed whitespace-pre-line font-medium opacity-90 text-justify">
                      {prog.isiProgram}
                    </p>
                  </div>
                  <div className="mt-6 pt-4 border-t border-slate-100 flex items-center gap-1 text-[10px] text-indigo-600 font-extrabold">
                    <span>Program Unggulan</span>
                    <span className="animate-pulse">✨</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* DYNAMIC INTEGRATED SECTION: School Directory & Headmasters */}
      <section id="school-directory" className="py-20 px-4 sm:px-8 bg-slate-100/50 w-full border-b border-slate-200">
        <div className="max-w-7xl mx-auto">
          
          <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-6 mb-12">
            <div>
              <span className="text-xs text-indigo-650 text-indigo-600 font-extrabold uppercase tracking-widest block mb-1.5">Database Kependidikan</span>
              <h2 className="text-2xl sm:text-3.5xl font-black text-slate-900 tracking-tight leading-none">Direktori Resmi Sekolah & Kepala Sekolah</h2>
              <p className="text-slate-500 text-xs sm:text-sm mt-2 max-w-xl">
                Daftar lengkap lembaga pendidikan dasar di bawah naungan MKKS Kecamatan Pasirwangi beserta profil Kepala Sekolah yang bertugas.
              </p>
            </div>

            {/* Filter Pills */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs text-slate-500 mr-1 font-semibold">Status Tugas:</span>
              {(['Semua', 'Definitif', 'PLT'] as const).map(status => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                    statusFilter === status 
                      ? 'bg-indigo-650 bg-indigo-600 text-white shadow-md' 
                      : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>

          {/* Search bar specifically for Directory */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-sm max-w-xl mb-8">
            <label className="block text-slate-500 font-bold text-xs uppercase tracking-wide mb-1.5">Pencarian Cepat</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Search className="w-4.5 h-4.5 text-slate-400" />
              </span>
              <input 
                type="text"
                placeholder="Masukkan Nama Sekolah, NPSN, atau Nama Kepala Sekolah..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-indigo-500 focus:bg-white text-xs outline-none transition"
              />
            </div>
          </div>

          {/* Records Carousel */}
          {filteredSchools.length === 0 ? (
            <div className="text-center py-16 bg-white border border-slate-200 rounded-2xl text-slate-400 p-8 space-y-2">
              <Building2 className="w-12 h-12 text-slate-300 mx-auto" />
              <p className="font-bold text-sm">Tidak ditemukan sekolah dasar yang sesuai</p>
              <p className="text-xs">Coba periksa kembali kata kunci pencarian atau filter status yang Anda pilih.</p>
            </div>
          ) : (
            <div className="relative group">
              {/* Navigation controls overlay in-header placement */}
              <div className="absolute -top-16 right-0 flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleScrollLeft}
                  disabled={!canScrollLeft}
                  className={`w-9 h-9 rounded-full border flex items-center justify-center transition active:scale-95 ${
                    canScrollLeft 
                      ? 'border-indigo-200 text-indigo-600 bg-white hover:bg-slate-50 hover:border-indigo-300 shadow-sm cursor-pointer' 
                      : 'border-slate-100 text-slate-300 bg-slate-50/50 cursor-not-allowed'
                  }`}
                  title="Geser ke Kiri"
                >
                  <ChevronLeft className="w-4.5 h-4.5" />
                </button>
                <button
                  type="button"
                  onClick={handleScrollRight}
                  disabled={!canScrollRight}
                  className={`w-9 h-9 rounded-full border flex items-center justify-center transition active:scale-95 ${
                    canScrollRight 
                      ? 'border-indigo-200 text-indigo-600 bg-white hover:bg-slate-50 hover:border-indigo-300 shadow-sm cursor-pointer' 
                      : 'border-slate-100 text-slate-300 bg-slate-50/50 cursor-not-allowed'
                  }`}
                  title="Geser ke Kanan"
                >
                  <ChevronRight className="w-4.5 h-4.5" />
                </button>
              </div>

              {/* Scrollable Carousel Track with snap alignments */}
              <div 
                ref={directoryScrollRef}
                onScroll={checkScroll}
                className="flex gap-5 overflow-x-auto snap-x snap-mandatory scroll-smooth pb-4 pt-1 px-1 -mx-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
              >
                {filteredSchools.map((school) => {
                  const initials = school.namaKS ? school.namaKS.split(' ').map(n => n[0]).filter(Boolean).slice(0,2).join('').toUpperCase() : 'KS';
                  const isDefinitif = school.statusKS === 'Definitif';
                  
                  return (
                    <div 
                      key={school.id} 
                      onClick={() => setSelectedSchool(school)}
                      className="w-[280px] sm:w-[320px] shrink-0 snap-start bg-gradient-to-b from-white to-slate-50 border border-slate-200/90 rounded-3xl overflow-hidden shadow-[0_6px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_15px_35px_rgba(99,102,241,0.12)] hover:border-indigo-300/80 hover:scale-[1.02] active:scale-[0.99] cursor-pointer transition-all duration-300 flex flex-col group relative"
                    >
                      {/* Decorative background grid pattern for top area */}
                      <div className="absolute top-0 right-0 w-20 h-20 bg-radial from-slate-200/20 to-transparent rounded-full pointer-events-none"></div>

                      {/* Visual Card Heading */}
                      <div className={`p-5 border-b flex items-start justify-between min-h-[84px] transition-colors ${
                        isDefinitif 
                          ? 'bg-gradient-to-r from-emerald-500/5 via-teal-500/5 to-transparent border-emerald-100/40' 
                          : 'bg-gradient-to-r from-amber-500/5 via-orange-500/5 to-transparent border-amber-100/40'
                      }`}>
                        <div className="min-w-0 pr-2">
                          <h3 className="font-extrabold text-slate-800 text-xs sm:text-sm tracking-tight leading-snug group-hover:text-indigo-650 transition-colors line-clamp-2" title={school.namaSekolah}>
                            {school.namaSekolah}
                          </h3>
                          <span className="text-[9px] text-slate-400 font-bold font-mono block mt-1 tracking-wider uppercase">NPSN: {school.npsn}</span>
                        </div>
                        <span className={`px-2.5 py-0.5 rounded-full text-[8px] font-extrabold uppercase tracking-widest shrink-0 whitespace-nowrap shadow-sm ${
                          isDefinitif 
                            ? 'bg-emerald-500 text-white border border-emerald-400' 
                            : 'bg-amber-500 text-white border border-amber-400'
                        }`}>
                          {school.statusKS}
                        </span>
                      </div>

                      {/* Principal details with specialized styled avatar framework */}
                      <div className="p-5 flex-grow flex items-center gap-3.5 relative">
                        {school.fotoKS ? (
                          <div className={`relative shrink-0 w-14 h-14 rounded-full p-0.5 shadow-md transition-transform duration-300 group-hover:scale-110 ${
                            isDefinitif ? 'bg-gradient-to-tr from-emerald-400 to-teal-500' : 'bg-gradient-to-tr from-amber-400 to-orange-500'
                          }`}>
                            <div className="w-full h-full rounded-full overflow-hidden border-2 border-white">
                              <img 
                                referrerPolicy="no-referrer"
                                src={school.fotoKS} 
                                alt={school.namaKS}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          </div>
                        ) : (
                          <div className={`w-14 h-14 rounded-full text-white font-black text-sm flex items-center justify-center shrink-0 shadow-inner uppercase transition-transform duration-300 group-hover:scale-110 ${
                            isDefinitif 
                              ? 'bg-gradient-to-tr from-emerald-500 to-teal-400 shadow-emerald-100' 
                              : 'bg-gradient-to-tr from-amber-500 to-amber-400 shadow-amber-100'
                          }`}>
                            {initials}
                          </div>
                        )}
                        <div className="min-w-0 flex-1">
                          <span className={`text-[8px] block font-extrabold uppercase tracking-widest ${
                            isDefinitif ? 'text-emerald-700' : 'text-amber-700'
                          }`}>Kepala Sekolah</span>
                          <div className="font-extrabold text-slate-800 text-xs leading-snug truncate mt-0.5" title={school.namaKS}>
                            {school.namaKS || 'Belum Ditunjuk / Kosong'}
                          </div>
                          <span className="text-[9px] text-slate-400 font-semibold font-mono block leading-none mt-1">
                            {school.nipKS && school.nipKS.trim() !== '' ? `NIP: ${school.nipKS}` : 'NIP: -'}
                          </span>
                        </div>
                      </div>

                      {/* Card Footer with explicit actions styling */}
                      <div className="px-5 py-3.5 bg-slate-50/60 border-t border-slate-100 text-[9px] text-slate-500 font-bold flex items-center justify-between group-hover:bg-indigo-50/50 transition-colors">
                        <span className="text-slate-750 font-extrabold flex items-center gap-1.5 text-indigo-600">
                          <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                          </span>
                          <span>Lihat Profil Detail</span>
                        </span>
                        <span className="flex items-center gap-0.5 text-[8px] uppercase tracking-wider bg-indigo-50 text-indigo-700 px-2.5 py-0.5 rounded-full font-extrabold font-mono shadow-sm group-hover:bg-indigo-100">
                          Profil <ChevronRight className="w-3 h-3 text-indigo-650 group-hover:translate-x-0.5 transition-all" />
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Slider Meta Guidance Info */}
              <div className="mt-2 text-slate-400 text-[10px] flex items-center justify-between px-1">
                <span className="flex items-center gap-1.5 font-medium opacity-80">
                  📱 <span className="italic">Geser layar atau gunakan tombol navigasi</span>
                </span>
                <span className="bg-slate-200/60 text-slate-700 px-2 py-0.5 rounded-full font-bold font-mono text-[9px]">
                  {filteredSchools.length} Sekolah Ditampilkan
                </span>
              </div>
            </div>
          )}

        </div>
      </section>

      {/* DYNAMIC INTEGRATED SECTION: Scheduled Activities & Official Invitations */}
      <section id="agenda-section" className="py-20 px-4 sm:px-8 bg-white w-full border-b border-slate-200">
        <div className="max-w-7xl mx-auto">
          
          <div className="max-w-2xl mb-12">
            <span className="text-xs text-indigo-600 font-bold uppercase tracking-widest block mb-2">Penjadwalan Organisasi</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-tight">
              Agenda Penting & Pengumuman Surat Edaran
            </h2>
            <p className="text-slate-500 text-xs sm:text-sm mt-2 leading-relaxed">
              Jadwal pelaksanaan rapat kerja koor, pembinaan kelompok kerja guru, serta surat resmi yang dikeluarkan oleh MKKS untuk diunggah mandiri.
            </p>
          </div>

          {agendas.length === 0 ? (
            <div className="text-center py-12 text-slate-400 bg-slate-50 border border-slate-200 rounded-2xl p-6">
              Belum ada info jadwal kegiatan atau edaran resmi untuk saat ini.
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {agendas.map((agenda) => {
                let dateDay = '--';
                let dateMonth = 'BLN';
                try {
                  if (agenda.waktu) {
                    const dateObj = new Date(agenda.waktu);
                    dateDay = String(dateObj.getDate());
                    dateMonth = dateObj.toLocaleDateString('id-ID', { month: 'short' }).toUpperCase();
                  }
                } catch(e) {}

                return (
                  <div 
                    key={agenda.id} 
                    className="bg-gradient-to-br from-white via-white to-slate-50/30 rounded-3xl border border-slate-200/95 shadow-sm hover:shadow-[0_15px_30px_rgba(99,102,241,0.08)] flex flex-col justify-between overflow-hidden hover:border-indigo-300 transition-all duration-300 group relative"
                  >
                    {/* Top gradient underline accent */}
                    <div className="h-1 w-full bg-gradient-to-r from-indigo-500 to-sky-400"></div>

                    <div className="p-5 sm:p-6 space-y-5">
                      {/* Integrated Event Header with stylized Calendar Leaf Badge */}
                      <div className="flex items-start gap-4">
                        <div className="bg-gradient-to-b from-indigo-650 to-indigo-600 bg-indigo-600 text-white rounded-2xl p-2.5 flex flex-col items-center justify-center min-w-[54px] shadow-md shadow-indigo-100 select-none group-hover:scale-105 transition-transform duration-300">
                          <span className="text-lg font-black leading-none">{dateDay}</span>
                          <span className="text-[9px] font-extrabold tracking-wider mt-1 uppercase text-sky-200">{dateMonth}</span>
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5 bg-indigo-50/60 text-indigo-700 font-extrabold py-1 px-3.5 rounded-full text-[9px] w-fit border border-indigo-100/50">
                            <CalendarDays className="w-3 h-3 text-indigo-500 animate-pulse" />
                            <span>RAGAM KEGIATAN</span>
                          </div>
                          <h3 className="text-xs sm:text-sm font-extrabold text-slate-800 leading-snug mt-2 line-clamp-2 pr-1" title={agenda.judul}>
                            {agenda.judul}
                          </h3>
                        </div>
                      </div>

                      {/* Detail points inside visual cards */}
                      <div className="space-y-3.5 pt-3.5 border-t border-slate-100 text-[11px] text-slate-500">
                        <div className="bg-slate-50/85 p-3 rounded-xl border border-slate-100">
                          <strong className="text-slate-500 block text-[9px] uppercase font-bold tracking-wider mb-1">Informasi Waktu</strong>
                          <span className="text-slate-700 font-medium">{formatDateTime(agenda.waktu)}</span>
                        </div>
                        <div className="bg-slate-50/85 p-3 rounded-xl border border-slate-100">
                          <strong className="text-slate-500 block text-[9px] uppercase font-bold tracking-wider mb-1 font-sans">Lokasi Pertemuan / Tempat</strong>
                          <span className="text-slate-700 font-medium">{agenda.tempat}</span>
                        </div>
                      </div>
                    </div>

                    {/* Highly finished interactive Attachment strip */}
                    <div className="bg-slate-50/80 px-5 py-3.5 border-t border-slate-150/80 flex items-center justify-between text-xs sm:px-6">
                      <span className="text-[10px] text-slate-400 font-bold truncate max-w-[130px] inline-block font-mono tracking-wide" title={agenda.namaDokumen || 'Dokumen_Lampiran.pdf'}>
                        📁 {agenda.namaDokumen || 'Lampiran.pdf'}
                      </span>
                      <button
                        onClick={() => handleViewPdf(agenda)}
                        className="flex items-center gap-1.5 font-extrabold hover:text-white hover:bg-indigo-600 hover:border-indigo-600 text-indigo-600 transition duration-200 text-[10px] uppercase tracking-wider cursor-pointer bg-white py-1.5 px-3 rounded-xl border border-indigo-200 shadow-sm"
                      >
                        <BookOpen className="w-3.5 h-3.5" />
                        <span>Pratinjau Surat</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

        </div>
      </section>

      {/* DYNAMIC INTEGRATED CONTACT SECTION (Informasi Sekretariat) */}
      <section className="bg-slate-900 text-white py-16 px-4 sm:px-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-sky-500/5 rounded-full blur-3xl pointer-events-none"></div>

        <div className="max-w-4xl mx-auto relative z-10 text-center flex flex-col items-center space-y-5">
          <span className="inline-block bg-sky-500/10 px-3.5 py-1.5 rounded-lg border border-sky-500/20 text-sky-400 text-xs font-bold uppercase tracking-wider">
            Layanan Administrasi
          </span>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight leading-tight max-w-2xl">
            Pusat Pelayanan Jaringan Informasi & Sekretariat Bersama
          </h2>
          <p className="text-slate-400 text-xs sm:text-sm leading-relaxed max-w-xl">
            Butuh konsultasi, registrasi akun pengurus baru, koordinasi persuratan resmi, atau pelaporan kendala teknis ARKAS/BOSP? Tim pengurus sekretariat kecamatan siap melayani Anda secara sinergis.
          </p>

          <div className="grid sm:grid-cols-2 gap-4 pt-4 text-xs w-full text-left">
            <div className="bg-white/5 border border-white/10 rounded-xl p-4 flex items-start gap-3">
              <MapPin className="w-5 h-5 text-sky-450 text-sky-400 shrink-0 mt-0.5" />
              <div>
                <strong className="block text-slate-200 text-[10px] uppercase font-bold mb-1">Kantor Sekretariat</strong>
                <span className="text-slate-400 text-[11px] leading-normal font-sans block">
                  {sekretariat.alamat || 'Jl. Raya Pasirwangi No. 124, Kec. Pasirwangi'}
                </span>
              </div>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-xl p-4 flex items-start gap-3">
              <Phone className="w-5 h-5 text-sky-450 text-sky-400 shrink-0 mt-0.5" />
              <div>
                <strong className="block text-slate-200 text-[10px] uppercase font-bold mb-1">Narahubung Resmi</strong>
                <a 
                  href={`https://wa.me/${sekretariat.noKontak ? sekretariat.noKontak.replace(/[^0-9]/g, '') : ''}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-slate-400 hover:text-sky-305 text-[11px] font-mono hover:underline inline-block mt-0.5 transition-colors"
                >
                  {sekretariat.noKontak || '0812-3456-7890'} (WhatsApp Link)
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto bg-slate-950 text-white border-t border-slate-900 text-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 py-12">
          <div className="grid md:grid-cols-3 gap-10">
            <div>
              <div className="flex items-center gap-2.5 text-white mb-4">
                <div className="bg-indigo-600 p-2 rounded-lg text-white">
                  <SchoolIcon className="w-5 h-5" />
                </div>
                <span className="font-bold text-lg tracking-tight">MKKS SD Pasirwangi</span>
              </div>
              <p className="text-white/80 leading-relaxed text-xs">
                Portal komunikasi resmi para pimpinan institusi pendidikan dasar di wilayah Kecamatan Pasirwangi, Kabupaten Garut. Data terus diperbarui secara dinamis dari portal.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-4 text-xs tracking-wider uppercase">Sekretariat Resmi</h4>
              <ul className="space-y-3 text-xs text-white/90">
                <li className="leading-relaxed flex items-start gap-1.5">
                  <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                  <span>{sekretariat.alamat || 'Jl. Raya Pasirwangi No. 124'}</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                  <span>{sekretariat.noKontak || '0812-3456-7890'}</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                  <span className="hover:text-sky-300 transition-colors">{sekretariat.email || 'mkks.sd.pasirwangi@gmail.com'}</span>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-4 text-xs tracking-wider uppercase">Tautan Penjelajah</h4>
              <div className="flex flex-col gap-2.5 text-xs">
                <a
                  href="#school-directory"
                  className="text-left text-white/80 hover:text-sky-300 transition-colors cursor-pointer"
                >
                  Direktori & Profil Kepala Sekolah
                </a>
                <a
                  href="#agenda-section"
                  className="text-left text-white/80 hover:text-sky-300 transition-colors cursor-pointer"
                >
                  Kelompok Kerja & Penjadwalan Rapat
                </a>
                <a
                  href="#galeri-section"
                  className="text-left text-white/80 hover:text-sky-300 transition-colors cursor-pointer"
                >
                  Dokumentasi & Galeri Kegiatan MKKS
                </a>
                <button
                  onClick={() => onNavigate('login')}
                  className="text-left text-white/80 hover:text-sky-300 transition-colors cursor-pointer block bg-transparent border-0"
                >
                  Registrasi Mandiri Anggota
                </button>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-900 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 text-center sm:text-left">
            <span className="text-white/70">&copy; {new Date().getFullYear()} MKKS SD Kecamatan Pasirwangi, Kabupaten Garut. All Rights Reserved.</span>
            <span className="mt-2 sm:mt-0 font-medium text-white/90">Terbuka • Modern • Kolaboratif</span>
          </div>
        </div>
      </footer>

      {/* Modal Detail Profil Sekolah & Kepala Sekolah (Ukuran Besar) */}
      {selectedSchool && (
        <div 
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-xl z-50 flex items-center justify-center p-4 overflow-y-auto"
          onClick={() => setSelectedSchool(null)}
        >
          <div 
            className="relative bg-white rounded-3xl overflow-hidden max-w-2xl w-full border border-slate-100 shadow-2xl animate-in fade-in zoom-in-95 duration-200 my-8"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header Banner with modern grid background and dynamic status-based gradient */}
            <div className={`p-6 sm:p-8 text-white relative overflow-hidden ${
              selectedSchool.statusKS === 'Definitif' 
                ? 'bg-gradient-to-br from-indigo-900 via-indigo-700 to-emerald-600' 
                : 'bg-gradient-to-br from-indigo-900 via-indigo-700 to-amber-600'
            }`}>
              {/* Abstract decorative pattern */}
              <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff10_1px,transparent_1px),linear-gradient(to_bottom,#ffffff10_1px,transparent_1px)] bg-[size:16px_16px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none"></div>
              
              {/* Absolute Close Button */}
              <button 
                type="button"
                onClick={() => setSelectedSchool(null)}
                className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition-all duration-200 border border-white/10 cursor-pointer active:scale-90"
                title="Tutup Detil"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="relative flex flex-col sm:flex-row items-center gap-5 sm:gap-6 pt-3">
                {/* Big Avatar Frame with Dynamic Ring */}
                {selectedSchool.fotoKS ? (
                  <div className={`relative shrink-0 w-24 h-24 sm:w-28 sm:h-28 rounded-full p-1 shadow-lg bg-white/20 backdrop-blur-sm`}>
                    <div className="w-full h-full rounded-full overflow-hidden border-4 border-white">
                      <img 
                        referrerPolicy="no-referrer"
                        src={selectedSchool.fotoKS} 
                        alt={selectedSchool.namaKS}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                ) : (
                  <div className={`w-24 h-24 sm:w-28 sm:h-28 rounded-full text-indigo-700 bg-white font-black text-3xl flex items-center justify-center shrink-0 shadow-lg border-4 border-white`}>
                    {selectedSchool.namaKS ? selectedSchool.namaKS.split(' ').map(n => n[0]).filter(Boolean).slice(0,2).join('').toUpperCase() : 'KS'}
                  </div>
                )}

                <div className="text-center sm:text-left min-w-0 flex-1">
                  <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest bg-white shadow-sm inline-block mb-2.5 ${
                    selectedSchool.statusKS === 'Definitif' ? 'text-emerald-700' : 'text-amber-700'
                  }`}>
                    {selectedSchool.statusKS === 'Definitif' ? '✍️ Kepala Sekolah Definitif' : '⚡ Pelaksana Tugas (PLT)'}
                  </span>
                  <h3 className="text-lg sm:text-xl font-black leading-tight tracking-tight drop-shadow-sm uppercase">
                    {selectedSchool.namaSekolah}
                  </h3>
                  <p className="text-xs text-indigo-100 font-mono mt-1 font-bold tracking-wider opacity-95 uppercase">
                    NPSN INSTALASI: {selectedSchool.npsn}
                  </p>
                </div>
              </div>
            </div>

            {/* Modal Body with tidy detail cards */}
            <div className="p-6 sm:p-8 space-y-6">
              
              {/* Detail grids */}
              <div className="grid sm:grid-cols-2 gap-5">
                {/* School Profile Card */}
                <div className="bg-slate-50/80 rounded-2xl p-5 border border-slate-100 space-y-3.5 shadow-inner">
                  <h4 className="font-extrabold text-slate-805 text-slate-800 text-[10px] sm:text-xs uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-200/60 pb-2">
                    <SchoolIcon className="w-4 h-4 text-indigo-600" />
                    <span>PROFIL INSTITUSI</span>
                  </h4>
                  <div className="space-y-3 text-xs text-slate-650">
                    <div>
                      <span className="block text-[9px] text-slate-400 font-bold uppercase tracking-wider mb-0.5">Nama Satuan Pendidikan</span>
                      <strong className="text-slate-800 font-extrabold">{selectedSchool.namaSekolah}</strong>
                    </div>
                    <div>
                      <span className="block text-[9px] text-slate-400 font-bold uppercase tracking-wider mb-0.5">Nomor Pokok Sekolah Nasional (NPSN)</span>
                      <strong className="text-slate-800 font-extrabold font-mono text-[11px] bg-slate-200/60 px-1.5 py-0.5 rounded">{selectedSchool.npsn}</strong>
                    </div>
                    <div>
                      <span className="block text-[9px] text-slate-400 font-bold uppercase tracking-wider mb-0.5">Kabupaten / Kecamatan</span>
                      <span className="text-slate-700 font-bold block">Pasirwangi, Kabupaten Garut</span>
                    </div>
                  </div>
                </div>

                {/* Principal Leadership Card */}
                <div className="bg-slate-50/80 rounded-2xl p-5 border border-slate-100 space-y-3.5 shadow-inner">
                  <h4 className="font-extrabold text-slate-805 text-slate-800 text-[10px] sm:text-xs uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-200/60 pb-2">
                    <Users className="w-4 h-4 text-emerald-600" />
                    <span>DOKUMEN KEPEMIMPINAN</span>
                  </h4>
                  <div className="space-y-3 text-xs text-slate-650">
                    <div>
                      <span className="block text-[9px] text-slate-400 font-bold uppercase tracking-wider mb-0.5">Kepala Sekolah</span>
                      <strong className="text-slate-800 font-extrabold text-[12px] block text-indigo-950">{selectedSchool.namaKS || 'Belum Ditunjuk / Kosong'}</strong>
                    </div>
                    <div>
                      <span className="block text-[9px] text-slate-400 font-bold uppercase tracking-wider mb-0.5">NIP (Nomor Induk Pegawai)</span>
                      <strong className="text-slate-700 font-mono text-[11px] block mt-0.5">
                        {selectedSchool.nipKS && selectedSchool.nipKS.trim() !== '' ? selectedSchool.nipKS : 'Belum Tercatat / -'}
                      </strong>
                    </div>
                    <div>
                      <span className="block text-[9px] text-slate-400 font-bold uppercase tracking-wider mb-0.5">Masa Jabatan & Penugasan</span>
                      <span className="text-slate-700 font-bold flex items-center gap-1.5 block">
                        <span className={`w-1.5 h-1.5 rounded-full inline-block animate-ping ${
                          selectedSchool.statusKS === 'Definitif' ? 'bg-emerald-500' : 'bg-amber-500'
                        }`}></span>
                        <span>Aktif Periode Berjalan ({selectedSchool.statusKS})</span>
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Verified Sinergis Banner */}
              <div className="bg-emerald-50/50 border border-emerald-100/75 rounded-2xl p-4 flex items-start gap-3.5">
                <div className="p-2 bg-emerald-100/80 rounded-xl text-emerald-700 shrink-0 mt-0.5">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div className="text-xs">
                  <h5 className="font-extrabold text-emerald-900 uppercase text-[10px] tracking-wider mb-0.5">SATUAN PENDIDIKAN SINERGIS & TERDAFTAR</h5>
                  <p className="text-slate-600 text-[11px] leading-relaxed text-justify">
                    Sistem Dapodik & ARKAS institusi dinyatakan sinkron 100% dalam Kelompok Kerja Kepala Sekolah (MKKS) Kecamatan Pasirwangi untuk pelaporan dana BOSP, koordinasi kegiatan kurikulum baru, sertifikasi, serta rapat koordinasi.
                  </p>
                </div>
              </div>
            </div>

            {/* Modal actions close segment */}
            <div className="bg-slate-50/80 px-6 py-4.5 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                🛡️ Terdaftar Resmi Dapodik / BOSP
              </span>
              <button
                type="button"
                onClick={() => setSelectedSchool(null)}
                className="text-slate-600 hover:bg-slate-100 hover:text-slate-800 text-xs font-extrabold py-2 px-5 rounded-xl border border-slate-200 transition duration-200 uppercase tracking-wide cursor-pointer bg-white"
              >
                Tutup Kembali
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lightbox Modal Detail Foto Kegiatan (Ukuran Besar) */}
      {selectedGalleryItem && (
        <div 
          className="fixed inset-0 bg-slate-950/90 backdrop-blur-2xl z-50 flex items-center justify-center p-4 overflow-y-auto"
          onClick={() => setSelectedGalleryItem(null)}
        >
          <div 
            className="relative bg-slate-900 rounded-3xl overflow-hidden max-w-4xl w-full border border-white/10 shadow-2xl animate-in fade-in zoom-in-95 duration-200 my-8 text-white"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header Area */}
            <div className="p-5 border-b border-white/10 flex items-center justify-between bg-slate-950/60">
              <div className="flex items-center gap-2.5">
                <ImageIcon className="w-5 h-5 text-indigo-400" />
                <span className="text-[11px] font-black uppercase tracking-widest text-slate-300">
                  Detail Dokumentasi Kegiatan MKKS SD
                </span>
              </div>
              <button 
                type="button"
                onClick={() => setSelectedGalleryItem(null)}
                className="p-1.5 hover:bg-white/10 text-slate-400 hover:text-white rounded-full transition-all duration-200 cursor-pointer active:scale-90"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Img Area & Title */}
            <div className="p-6 md:p-8 space-y-6">
              <div className="relative aspect-video w-full overflow-hidden rounded-2xl bg-black border border-white/5 shadow-inner">
                <img 
                  referrerPolicy="no-referrer"
                  src={selectedGalleryItem.foto} 
                  alt={selectedGalleryItem.judul}
                  className="h-full w-full object-contain"
                />
              </div>

              <div className="bg-slate-950/40 p-5 rounded-2xl border border-white/5 space-y-3">
                {selectedGalleryItem.tanggal && (
                  <span className="inline-flex items-center gap-1.5 text-[10px] font-mono font-bold text-sky-450 bg-sky-950/50 border border-sky-900/40 px-3 py-1 rounded-full uppercase tracking-wider">
                    📅 Tanggal Pelaksanaan: {selectedGalleryItem.tanggal}
                  </span>
                )}
                <h3 className="text-lg md:text-xl font-extrabold text-white leading-snug tracking-tight text-justify">
                  {selectedGalleryItem.judul}
                </h3>
              </div>
            </div>

            {/* Footer Area */}
            <div className="p-5 border-t border-white/10 flex items-center justify-between bg-slate-950/60">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                📍 MKKS SD Kecamatan Pasirwangi • Garut
              </span>
              <button
                type="button"
                onClick={() => setSelectedGalleryItem(null)}
                className="bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold py-2 px-6 rounded-xl transition duration-200 text-xs uppercase tracking-wide cursor-pointer active:scale-95"
              >
                Tutup Galeri
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
