/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { School, Agenda, ProgramKerja, Sekretariat, UserAccount, AboutMkks, DigitalFile } from '../types';
import HelpDeskChat from './HelpDeskChat';
import { 
  School as SchoolIcon, Users, Calendar as CalendarIcon, FileText, Info, MapPin, 
  Eye, Search, LogOut, Camera, Download, HelpCircle, X, ChevronLeft, ChevronRight, BookOpen, Clock, FolderOpen
} from 'lucide-react';

interface UserDashboardProps {
  currentUser: UserAccount;
  schools: School[];
  agendas: Agenda[];
  programs: ProgramKerja[];
  sekretariat: Sekretariat;
  aboutInfo: AboutMkks;
  digitalFiles: DigitalFile[];
  onLogout: () => void;
}

export default function UserDashboard({
  currentUser, schools, agendas, programs, sekretariat, aboutInfo, digitalFiles, onLogout
}: UserDashboardProps) {

  const [activeTab, setActiveTab] = useState<'dashboard' | 'agenda' | 'program' | 'sekretariat' | 'helpdesk' | 'files'>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Profile Edit modal
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [userProfileName, setUserProfileName] = useState(currentUser.nama);
  const [userProfileSchool, setUserProfileSchool] = useState(currentUser.namaSekolah || '');
  const [userProfileNip, setUserProfileNip] = useState(currentUser.nip || '');

  // View Details Modal (similar to Admin for reading handouts / files)
  const [viewDetailsOpen, setViewDetailsOpen] = useState(false);
  const [selectedAgenda, setSelectedAgenda] = useState<Agenda | null>(null);
  const [previewHandoutOpen, setPreviewHandoutOpen] = useState(false);

  // Digital File user preview modal state
  const [viewUserFileModalOpen, setViewUserFileModalOpen] = useState(false);
  const [selectedUserFile, setSelectedUserFile] = useState<DigitalFile | null>(null);
  const [fileSearch, setFileSearch] = useState('');

  const handleViewFileInNewTab = (fileItem: DigitalFile) => {
    const newTab = window.open('', '_blank');
    if (newTab) {
      const isPdf = fileItem.fileType.toLowerCase().includes('pdf') || fileItem.namaAsli.toLowerCase().endsWith('.pdf');
      
      if (isPdf) {
        try {
          let blob: Blob;
          const content = fileItem.fileContent;
          const isMock = content.includes('mockPdfData') || !content.startsWith('data:application/pdf;base64,');
          
          if (isMock) {
            // Generate a valid minimal PDF containing info about the file
            const pdfText = `%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>
endobj
4 0 obj
<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>
endobj
5 0 obj
<< /Length 500 >>
stream
BT
/F1 18 Tf
50 780 Td
(MKKS SD KECAMATAN PASIRWANGI, GARUT) Tj
0 -40 Td
/F1 12 Tf
(PRATINJAU DOKUMEN RESMI DIGITAL) Tj
0 -30 Td
(Judul Dokumen: ${fileItem.namaFile}) Tj
0 -20 Td
(Nama Fail Asli: ${fileItem.namaAsli}) Tj
0 -20 Td
(Tanggal Unggah: ${fileItem.dateAdded}) Tj
0 -20 Td
(Ukuran Berkas: ${fileItem.fileSize}) Tj
0 -45 Td
(Status Pratinjau: Berkas PDF Aktif) Tj
0 -20 Td
(Dokumen ini berhasil diproses oleh sistem peramban bawaan.) Tj
0 -20 Td
(Gunakan tombol simpan/unduh di toolbar PDF browser Anda untuk menyimpan.) Tj
ET
endstream
endobj
xref
0 6
0000000000 65535 f 
0000000009 00000 n 
0000000056 00000 n 
0000000111 00000 n 
0000000250 00000 n 
0000000324 00000 n 
trailer
<< /Size 6 /Root 1 0 R >>
startxref
865
%%EOF`;
            const encoder = new TextEncoder();
            const pdfBytes = encoder.encode(pdfText);
            blob = new Blob([pdfBytes], { type: 'application/pdf' });
          } else {
            const base64Parts = content.split(';base64,');
            const b64Data = base64Parts[1];
            const sliceSize = 512;
            const byteCharacters = window.atob(b64Data);
            const byteArrays: Uint8Array[] = [];
            
            for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
              const slice = byteCharacters.slice(offset, offset + sliceSize);
              const byteNumbers = new Array(slice.length);
              for (let i = 0; i < slice.length; i++) {
                byteNumbers[i] = slice.charCodeAt(i);
              }
              const byteArray = new Uint8Array(byteNumbers);
              byteArrays.push(byteArray);
            }
            blob = new Blob(byteArrays, { type: 'application/pdf' });
          }
          
          const blobURL = URL.createObjectURL(blob);
          newTab.location.replace(blobURL);
        } catch (err) {
          console.error(err);
          newTab.location.href = fileItem.fileContent;
        }
        return;
      }

      newTab.document.title = fileItem.namaFile + " | MKKS Pasirwangi";
      
      newTab.document.body.style.margin = "0";
      newTab.document.body.style.padding = "0";
      newTab.document.body.style.fontFamily = "'Inter', system-ui, sans-serif";
      newTab.document.body.style.backgroundColor = "#0f172a";
      newTab.document.body.style.color = "#f8fafc";
      newTab.document.body.style.display = "flex";
      newTab.document.body.style.flexDirection = "column";
      newTab.document.body.style.minHeight = "100vh";
      
      const styleTag = newTab.document.createElement('style');
      styleTag.innerHTML = `
        .header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          background-color: #1e293b;
          border-bottom: 1px solid #334155;
          padding: 16px 24px;
        }
        .app-title {
          font-weight: 800;
          font-size: 14px;
          color: #38bdf8;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        .file-title {
          font-weight: 700;
          font-size: 16px;
          color: #ffffff;
          margin-top: 4px;
        }
        .content-container {
          flex: 1;
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 40px 20px;
        }
        .card {
          background-color: #1e293b;
          border: 1px solid #334155;
          border-radius: 16px;
          width: 100%;
          max-width: 640px;
          padding: 32px;
          box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.3);
          text-align: center;
        }
        .file-icon {
          font-size: 56px;
          margin-bottom: 20px;
        }
        .metadata-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
          margin: 24px 0;
          border-top: 1px dashed #334155;
          border-bottom: 1px dashed #334155;
          padding: 20px 0;
          text-align: left;
        }
        .meta-label {
          color: #94a3b8;
          font-size: 11px;
          text-transform: uppercase;
          font-weight: 700;
          letter-spacing: 0.05em;
        }
        .meta-value {
          color: #e2e8f0;
          font-size: 13px;
          font-weight: 600;
          margin-top: 2px;
          word-break: break-all;
        }
        .btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 10px 24px;
          font-weight: 750;
          font-size: 13px;
          border-radius: 10px;
          transition: all 0.15s ease-in-out;
          text-decoration: none;
          cursor: pointer;
        }
        .btn-primary {
          background-color: #4f46e5;
          color: #ffffff;
        }
        .btn-primary:hover {
          background-color: #4338ca;
        }
        .btn-secondary {
          background-color: #334155;
          color: #cbd5e1;
          border: 1px solid #475569;
          margin-left: 12px;
        }
        .btn-secondary:hover {
          background-color: #475569;
          color: #f1f5f9;
        }
        .preview-pane {
          width: 100%;
          height: 380px;
          border: none;
          border-radius: 12px;
          background: #ffffff;
          margin-top: 20px;
          box-shadow: inset 0 2px 4px rgba(0,0,0,0.06);
        }
      `;
      newTab.document.head.appendChild(styleTag);
      
      let fileIcon = "📁";
      if (fileItem.fileType.toLowerCase().includes('excel') || fileItem.namaAsli.endsWith('.xlsx')) fileIcon = "📊";
      else if (fileItem.fileType.toLowerCase().includes('word') || fileItem.namaAsli.endsWith('.docx')) fileIcon = "📝";
      else if (fileItem.fileType.toLowerCase().includes('pdf') || fileItem.namaAsli.endsWith('.pdf')) fileIcon = "📕";
      else if (fileItem.fileType.toLowerCase().includes('gambar') || fileItem.fileType.toLowerCase().includes('image')) fileIcon = "🖼️";

      let previewSection = '';
      if (fileItem.fileContent.startsWith('data:image/')) {
        previewSection = `<img src="${fileItem.fileContent}" style="max-width: 100%; max-height: 350px; border-radius: 12px; margin-top: 15px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);" />`;
      } else if (fileItem.fileContent.startsWith('data:application/pdf;base64,mockPdfData') || fileItem.fileContent.includes('mockPdfData')) {
        previewSection = `
          <div style="background: #0f172a; border-radius: 12px; padding: 24px; border: 1px solid #334155; margin-top: 20px; text-align: center;">
            <div style="font-size: 24px; margin-bottom: 8px;">📕</div>
            <p style="font-size: 13px; color: #f8fafc; font-weight: 700; margin: 0 0 4px 0;">Sistem Pratinjau Dokumen PDF</p>
            <p style="font-size: 11px; color: #94a3b8; margin: 0;">Silakan klik tombol unduh di bawah ini untuk mengunduh dokumen secara lengkap.</p>
          </div>
        `;
      } else if (fileItem.fileContent.startsWith('data:application/pdf;base64')) {
        previewSection = `<iframe src="${fileItem.fileContent}" class="preview-pane"></iframe>`;
      } else {
        previewSection = `
          <div style="background: #0f172a; border-radius: 12px; padding: 24px; border: 1px solid #334155; margin-top: 20px; text-align: center;">
            <p style="font-size: 13px; color: #f8fafc; font-weight: 700; margin: 0 0 4px 0;">Berkas Siap Diunduh</p>
            <p style="font-size: 11px; color: #94a3b8; margin: 0;">Berkas ini bertipe ${fileItem.fileType}. Gunakan tombol di bawah untuk menyimpannya.</p>
          </div>
        `;
      }

      newTab.document.body.innerHTML = `
        <div class="header">
          <div>
            <div class="app-title">MKKS Kecamatan Pasirwangi • Browser Viewer</div>
            <div class="file-title">${fileItem.namaFile}</div>
          </div>
          <div>
            <button onclick="window.close()" class="btn btn-secondary" style="margin: 0; padding: 8px 16px; font-size: 12px;">Tutup</button>
          </div>
        </div>
        <div class="content-container">
          <div class="card">
            <div class="file-icon">${fileIcon}</div>
            <h2 style="font-size: 18px; font-weight: 800; color: #ffffff; margin: 0 0 10px 0;">${fileItem.namaFile}</h2>
            <p style="font-size: 12px; color: #94a3b8; margin: 0;">Sumber Daya Digital MKKS SD Kecamatan Pasirwangi</p>
            
            <div class="metadata-grid">
              <div>
                <div class="meta-label">Nama Asli Fail</div>
                <div class="meta-value">${fileItem.namaAsli}</div>
              </div>
              <div>
                <div class="meta-label">Tipe Berkas</div>
                <div class="meta-value">${fileItem.fileType}</div>
              </div>
              <div>
                <div class="meta-label">Tanggal Terbit</div>
                <div class="meta-value">${fileItem.dateAdded}</div>
              </div>
              <div>
                <div class="meta-label">Ukuran Berkas</div>
                <div class="meta-value">${fileItem.fileSize}</div>
              </div>
            </div>

            ${previewSection}
            
            <div style="margin-top: 32px; display: flex; justify-content: center;">
              <a id="downloadBtn" class="btn btn-primary">
                📥 Unduh Berkas Resmi (${fileItem.fileSize})
              </a>
              <button onclick="window.close()" class="btn btn-secondary">
                Keluar
              </button>
            </div>
          </div>
        </div>
      `;

      const dlBtn = newTab.document.getElementById('downloadBtn');
      if (dlBtn) {
        dlBtn.onclick = () => {
          const l = newTab.document.createElement('a');
          l.href = fileItem.fileContent;
          l.download = fileItem.namaAsli;
          newTab.document.body.appendChild(l);
          l.click();
          newTab.document.body.removeChild(l);
        };
      }
    } else {
      alert("Popup bloker menahan akses halaman ini. Silakan berikan izin pop-up.");
    }
  };

  // Handle Local Handout Downloads
  const downloadHandoutMock = (agenda: Agenda) => {
    alert(`Mengunduh berkas surat: ${agenda.namaDokumen || 'Undangan_Rapat.pdf'}\nPidato & Undantasan berhasil diunduh ke komputer Anda.`);
  };

  // Find nearby agenda
  const nextAgenda = agendas.length > 0 ? agendas[0] : null;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-800">
      
      {/* Top Navbar */}
      <nav className="fixed top-0 left-0 right-0 h-16 bg-gradient-to-r from-sky-600 to-indigo-700 text-white flex items-center justify-between px-4 sm:px-6 shadow-md z-40">
        <div className="flex items-center gap-2.5">
          <button 
            type="button"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 block"
          >
            <ChevronLeft className={`w-5 h-5 transition-transform ${sidebarOpen ? '' : 'rotate-180'}`} />
          </button>
          <div className="flex items-center gap-2">
            <SchoolIcon className="w-5 h-5 text-sky-200" />
            <span className="font-extrabold tracking-tight text-sm sm:text-base">Portal Kepala Sekolah SD</span>
          </div>
        </div>

        {/* User Profile display & Logout button */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setProfileModalOpen(true)}
              className="flex items-center gap-2 p-1 px-3 bg-white/10 hover:bg-white/15 rounded-full transition text-xs font-semibold hover:border-white/35 border border-transparent cursor-pointer"
            >
              <div className="w-7 h-7 bg-indigo-500 rounded-full flex items-center justify-center text-white font-black border border-white/20">
                {currentUser.nama.charAt(0)}
              </div>
              <span className="hidden sm:inline text-white truncate max-w-28">{currentUser.nama}</span>
            </button>
          </div>
          
          <button
            onClick={onLogout}
            className="flex items-center gap-1.5 py-1.5 px-3 bg-red-500 hover:bg-red-600 active:scale-95 text-xs text-white rounded-lg transition font-bold cursor-pointer"
            title="Keluar"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </nav>

      <div className="pt-16 flex flex-1">
        
        {/* Left Sidebar */}
        <aside className={`fixed left-0 bottom-0 top-16 w-64 bg-slate-900 text-slate-300 border-r border-slate-800 transition-all duration-300 z-30 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <div className="p-4 flex flex-col justify-between h-full overflow-y-auto">
            <div className="space-y-1.5">
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block px-3 mb-2">Navigasi Anggota</span>
              
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all font-medium text-xs text-left cursor-pointer ${activeTab === 'dashboard' ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/10 font-bold' : 'hover:bg-slate-800 text-slate-300'}`}
              >
                <FileText className="w-4 h-4" />
                <span>Dashboard & Memo</span>
              </button>

              <button
                onClick={() => setActiveTab('agenda')}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all font-medium text-xs text-left cursor-pointer ${activeTab === 'agenda' ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/10 font-bold' : 'hover:bg-slate-800 text-slate-300'}`}
              >
                <CalendarIcon className="w-4 h-4" />
                <span>Agenda / Surat Undangan</span>
              </button>

              <button
                onClick={() => setActiveTab('program')}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all font-medium text-xs text-left cursor-pointer ${activeTab === 'program' ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/10 font-bold' : 'hover:bg-slate-800 text-slate-300'}`}
              >
                <BookOpen className="w-4 h-4" />
                <span>Program Kerja</span>
              </button>

              <button
                onClick={() => setActiveTab('helpdesk')}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all font-medium text-xs text-left cursor-pointer ${activeTab === 'helpdesk' ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/10 font-bold' : 'hover:bg-slate-800 text-slate-300'}`}
              >
                <HelpCircle className="w-4 h-4 text-emerald-400" />
                <span className="font-extrabold text-emerald-200">Help Desk</span>
              </button>

              <button
                onClick={() => setActiveTab('files')}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all font-medium text-xs text-left cursor-pointer ${activeTab === 'files' ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/10 font-bold' : 'hover:bg-slate-800 text-slate-300'}`}
              >
                <FolderOpen className="w-4 h-4 text-sky-400" />
                <span className="font-extrabold text-sky-200">File Digital</span>
              </button>
            </div>

            <div className="pt-4 border-t border-slate-800">
              <div className="p-3 bg-slate-950/20 rounded-xl space-y-1 text-[11px] text-slate-400">
                <span className="block font-bold text-slate-300">Asal Instansi Sekolah:</span>
                <span className="block font-mono text-indigo-400 font-bold truncate">{currentUser.namaSekolah || 'Sekolah Dasar'}</span>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Area */}
        <main className={`flex-1 min-w-0 transition-all duration-300 p-4 sm:p-6 ${sidebarOpen ? 'pl-4 sm:pl-6 bg-slate-50 md:ml-64' : 'ml-0'}`}>
          
          {/* TAB 1: USER DASHBOARD OVERVIEW */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-sky-500/10 to-indigo-500/10 border border-indigo-200/50 rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="space-y-1">
                  <h1 className="text-lg sm:text-xl font-black text-slate-900 leading-tight">Selamat Datang, {currentUser.nama}!</h1>
                  <p className="text-xs text-slate-500">Anda masuk sebagai Kepala Sekolah <span className="text-indigo-600 font-bold">{currentUser.namaSekolah}</span></p>
                </div>
                <div className="bg-white px-3.5 py-1.5 text-xs rounded-xl font-bold text-indigo-600 border border-slate-200 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Akses Anggota Aktif</span>
                </div>
              </div>

              {/* Requirement Cards: Jadwal Rapat Terdekat & Dokumen Edaran Terbaru */}
              <div className="grid md:grid-cols-2 gap-6">
                
                {/* Card A: Jadwal Rapat Terdekat */}
                <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
                  <div className="flex items-center gap-2 text-indigo-600">
                    <CalendarIcon className="w-5 h-5" />
                    <h3 className="font-extrabold text-sm text-slate-800">Jadwal Rapat Terdekat</h3>
                  </div>

                  {nextAgenda ? (
                    <div className="space-y-3.5 bg-indigo-50/50 p-4 rounded-xl border border-indigo-100">
                      <h4 className="font-bold text-xs sm:text-sm text-slate-900 leading-snug">{nextAgenda.judul}</h4>
                      <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600">
                        <div>
                          <strong>Waktu:</strong>
                          <span className="block text-slate-800">{new Date(nextAgenda.waktu).toLocaleString('id-ID')}</span>
                        </div>
                        <div>
                          <strong>Tempat:</strong>
                          <span className="block text-slate-800">{nextAgenda.tempat}</span>
                        </div>
                      </div>
                      
                      <div className="pt-2 border-t border-indigo-100/50 flex gap-2">
                        <button
                          onClick={() => {
                            setSelectedAgenda(nextAgenda);
                            setViewDetailsOpen(true);
                            setPreviewHandoutOpen(false);
                          }}
                          className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold active:scale-95 transition cursor-pointer"
                        >
                          Lihat Surat Undangan
                        </button>
                        {nextAgenda.namaDokumen && (
                          <button
                            onClick={() => downloadHandoutMock(nextAgenda)}
                            className="p-1 px-2.5 bg-white border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 text-xs font-bold active:scale-95 transition cursor-pointer"
                            title="Unduh Surat"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  ) : (
                    <p className="text-slate-400 text-xs font-semibold">Tidak ada jadwal rapat terdekat dalam waktu dekat.</p>
                  )}
                </div>

                {/* Card B: Dokumen & Edaran Terbaru (Notulen, Panduan BOSP, dsb) */}
                <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
                  <div className="flex items-center gap-2 text-emerald-600">
                    <FileText className="w-5 h-5" />
                    <h3 className="font-extrabold text-sm text-slate-800">Sumber Daya & Unduhan Panduan</h3>
                  </div>

                  <div className="space-y-3 text-xs font-medium">
                    <div className="flex items-center justify-between p-2.5 bg-slate-50 hover:bg-slate-100/50 rounded-xl border border-slate-200/50 transition duration-300">
                      <div>
                        <span className="block font-bold text-slate-800">Panduan Penggunaan Dana BOSP 2026</span>
                        <span className="text-[10px] text-slate-400">Juknis dan Pedoman Pelaporan ARKAS</span>
                      </div>
                      <button
                        onClick={() => alert('Unduh Berkas: Panduan_BOSP_2026.pdf sukses!')}
                        className="p-1.5 hover:bg-emerald-50 text-emerald-600 rounded-lg transition"
                        title="Unduh Juknis BOSP"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="flex items-center justify-between p-2.5 bg-slate-50 hover:bg-slate-100/50 rounded-xl border border-slate-200/50 transition duration-300">
                      <div>
                        <span className="block font-bold text-slate-800">Notulen Rapat Bulanan MKKS (Mei 25)</span>
                        <span className="text-[10px] text-slate-400">Risalah kesepakatan koordinasi sekolah dasar</span>
                      </div>
                      <button
                        onClick={() => alert('Unduh Berkas: Notulen_MKKS_Mei.pdf sukses!')}
                        className="p-1.5 hover:bg-emerald-50 text-emerald-600 rounded-lg transition"
                        title="Unduh Notulen"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* General list/table of downloadable info for Principal */}
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
                <span className="text-xs uppercase font-bold text-slate-500 tracking-wider">Arsip Surat Keputusan & Dokumen Rayon Pasirwangi</span>
                <div className="overflow-x-auto text-xs">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 text-slate-700 font-extrabold border-b border-slate-200">
                        <th className="py-2.5 px-4 w-12">No</th>
                        <th className="py-2.5 px-4">Nama Dokumen Formal</th>
                        <th className="py-2.5 px-4">Kategori / Klasifikasi</th>
                        <th className="py-2.5 px-4 text-right">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-600">
                      <tr className="hover:bg-slate-50/50">
                        <td className="py-3 px-4 text-slate-400 font-bold">1</td>
                        <td className="py-3 px-4 font-bold text-slate-800">SK Susunan Kepengurusan MKKS SD Pasirwangi 2025-2028</td>
                        <td className="py-3 px-4"><span className="px-2 py-0.5 rounded-full bg-indigo-50 border border-indigo-150 text-[10px] text-indigo-700 font-bold">SK Formal</span></td>
                        <td className="py-3 px-4 text-right">
                          <button onClick={() => alert('Unduh Berkas SK sukses!')} className="p-1 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-bold rounded-lg transition">Unduh Berkas</button>
                        </td>
                      </tr>
                      <tr className="hover:bg-slate-50/50">
                        <td className="py-3 px-4 text-slate-400 font-bold">2</td>
                        <td className="py-3 px-4 font-bold text-slate-800">Standard Operasional Kelulusan Ujian Akhir Kelas VI</td>
                        <td className="py-3 px-4"><span className="px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-150 text-[10px] text-emerald-700 font-bold">POS Kelulusan</span></td>
                        <td className="py-3 px-4 text-right">
                          <button onClick={() => alert('Unduh Berkas POS sukses!')} className="p-1 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-bold rounded-lg transition">Unduh Berkas</button>
                        </td>
                      </tr>
                      <tr className="hover:bg-slate-50/50">
                        <td className="py-3 px-4 text-slate-400 font-bold">3</td>
                        <td className="py-3 px-4 font-bold text-slate-800">Kalender Pendidikan Rayon Kecamatan Tahun Pelajaran 2025/2026</td>
                        <td className="py-3 px-4"><span className="px-2 py-0.5 rounded-full bg-amber-50 border border-amber-150 text-[10px] text-amber-700 font-bold">Kaldik</span></td>
                        <td className="py-3 px-4 text-right">
                          <button onClick={() => alert('Unduh Berkas Kaldik sukses!')} className="p-1 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-bold rounded-lg transition">Unduh Berkas</button>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: ALL AGENDAS LIST */}
          {activeTab === 'agenda' && (
            <div className="space-y-6">
              <div className="border-b border-slate-200 pb-3">
                <h1 className="text-xl font-black text-slate-900 tracking-tight">Daftar Agenda Kegiatan & Rapat</h1>
                <p className="text-xs text-slate-500">Lihat rincian agenda dinas, rapat mufakat, beserta dokumen formal surat kependidikan</p>
              </div>

              <div className="bg-white border border-slate-200 rounded-2xl shadow-sm text-xs overflow-hidden">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-100 text-slate-700 font-extrabold border-b border-slate-200">
                      <th className="py-3 px-4 w-12">#</th>
                      <th className="py-3 px-4">Judul Kegiatan & Detil Surat</th>
                      <th className="py-3 px-4">Lokasi Rapat</th>
                      <th className="py-3 px-4">Waktu Mulai</th>
                      <th className="py-3 px-4 text-right">Lihat / Unduh</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {agendas.map((ag, index) => (
                      <tr key={ag.id} className="hover:bg-slate-50/50">
                        <td className="py-3 px-4 font-bold text-slate-400">{index + 1}</td>
                        <td className="py-3 px-4">
                          <span className="block font-bold text-slate-800 leading-snug">{ag.judul}</span>
                          {ag.namaDokumen && (
                            <span className="text-[10px] text-teal-600 bg-teal-50 border border-teal-100 px-1.5 py-0.5 rounded inline-block mt-0.5">Surat: {ag.namaDokumen}</span>
                          )}
                        </td>
                        <td className="py-3 px-4 font-semibold text-slate-700">{ag.tempat}</td>
                        <td className="py-3 px-4 text-slate-500">{new Date(ag.waktu).toLocaleString('id-ID')}</td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex justify-end gap-1.5">
                            <button
                              onClick={() => {
                                setSelectedAgenda(ag);
                                setViewDetailsOpen(true);
                                setPreviewHandoutOpen(false);
                              }}
                              className="p-1 px-3 bg-slate-100 hover:bg-slate-200 font-semibold text-slate-700 rounded-lg transition active:scale-95"
                            >
                              Detail
                            </button>
                            {ag.namaDokumen && (
                              <button
                                onClick={() => downloadHandoutMock(ag)}
                                className="p-1.5 hover:bg-teal-50 text-teal-600 rounded-lg border border-slate-200"
                              >
                                <Download className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: PROGRAM KERJA LIST */}
          {activeTab === 'program' && (
            <div className="space-y-6">
              <div className="border-b border-slate-200 pb-3">
                <h1 className="text-xl font-black text-slate-900 tracking-tight">Rencana Program Kerja Rayon</h1>
                <p className="text-xs text-slate-500">Pernyataan pilar program pengembangan institusi MKKS Kecamatan Pasirwangi</p>
              </div>

              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {programs.map((p, index) => (
                  <div key={p.id} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4 hover:shadow-md transition">
                    <div className="w-10 h-10 bg-indigo-50 border border-indigo-150 rounded-xl flex items-center justify-center font-extrabold text-indigo-600">
                      0{index + 1}
                    </div>
                    <div className="space-y-2 text-xs">
                      <h3 className="font-extrabold text-slate-905">{p.judulProgram}</h3>
                      <p className="text-slate-500 leading-relaxed max-w-sm whitespace-pre-wrap">{p.isiProgram}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: HELP DESK WORKSPACE */}
          {activeTab === 'helpdesk' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="border-b border-slate-200 pb-3">
                <h1 className="text-xl font-black text-slate-900 tracking-tight">Help Desk Konsultasi Virtual</h1>
                <p className="text-xs text-slate-500">Hubungi tim pengurus dan asisten cerdas virtual MKKS SD Kecamatan Pasirwangi secara langsung</p>
              </div>

              <HelpDeskChat />
            </div>
          )}

          {/* TAB 5: FILE DIGITAL USER READ-ONLY ACCESS */}
          {activeTab === 'files' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="border-b border-slate-200 pb-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 text-indigo-700">
                    <FolderOpen className="w-5 h-5 text-indigo-600" />
                    <h1 className="text-xl font-black text-slate-900 tracking-tight">Pusat File & Dokumen Digital</h1>
                  </div>
                  <p className="text-xs text-slate-500">
                    Unduh blangko administrasi dinas, format laporan dana BOS, instrumen akreditasi, dan fail keputusan rapat rayon.
                  </p>
                </div>
              </div>

              {/* Search Bar */}
              <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-sm flex items-center gap-3">
                <Search className="w-4 h-4 text-slate-400 shrink-0" />
                <input
                  type="text"
                  placeholder="Cari file digital berdasarkan judul atau nama fail..."
                  value={fileSearch}
                  onChange={(e) => setFileSearch(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 text-xs py-2 px-3.5 rounded-xl focus:border-indigo-500 focus:outline-none focus:bg-white font-medium text-slate-700"
                />
                {fileSearch && (
                  <button
                    type="button"
                    onClick={() => setFileSearch('')}
                    className="p-1 text-slate-400 hover:text-slate-650 text-xs font-bold font-sans cursor-pointer hover:bg-slate-100 rounded-lg"
                  >
                    Clear
                  </button>
                )}
              </div>

              {/* Tabel File Digital (View Only) */}
              <div className="bg-white border border-slate-200 rounded-2xl shadow-sm text-xs overflow-hidden">
                <div className="p-4 border-b border-slate-105 border-b-slate-100 flex items-center justify-between bg-slate-50/50">
                  <span className="font-bold text-slate-700 uppercase tracking-wider text-[10px]">Katalog Sumber Daya Berkas Resmi</span>
                  <span className="bg-indigo-50 text-indigo-700 px-2.5 py-0.5 rounded-full font-mono text-[10px] font-bold">
                    Ditemukan: {digitalFiles.filter(f => f.namaFile.toLowerCase().includes(fileSearch.toLowerCase()) || f.namaAsli.toLowerCase().includes(fileSearch.toLowerCase())).length} File
                  </span>
                </div>

                <div className="overflow-x-auto text-[11px]">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-150/40 bg-slate-100 text-slate-700 font-extrabold border-b border-slate-200">
                        <th className="py-3 px-4 w-12 text-center">No</th>
                        <th className="py-3 px-4">Judul Dokumen Resmi</th>
                        <th className="py-3 px-4">Klasifikasi Berkas</th>
                        <th className="py-3 px-4">Tanggal Diunggah</th>
                        <th className="py-3 px-4 text-center">Ukuran</th>
                        <th className="py-3 px-4 text-center">Aksi Dokumen</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                      {digitalFiles.filter(f => f.namaFile.toLowerCase().includes(fileSearch.toLowerCase()) || f.namaAsli.toLowerCase().includes(fileSearch.toLowerCase())).length === 0 ? (
                        <tr>
                          <td colSpan={6} className="py-10 text-center text-slate-400 font-semibold italic">
                            Belum ada file digital yang cocok atau diunggah oleh admin.
                          </td>
                        </tr>
                      ) : (
                        digitalFiles.filter(f => f.namaFile.toLowerCase().includes(fileSearch.toLowerCase()) || f.namaAsli.toLowerCase().includes(fileSearch.toLowerCase())).map((f, idx) => (
                          <tr key={f.id} className="hover:bg-slate-50/40 transition">
                            <td className="py-3.5 px-4 font-bold text-slate-400 text-center">{idx + 1}</td>
                            <td className="py-3.5 px-4">
                              <span className="font-extrabold text-slate-900 block leading-snug">{f.namaFile}</span>
                              <span className="font-mono text-[10px] text-indigo-500 font-bold truncate block max-w-sm">
                                {f.namaAsli}
                              </span>
                            </td>
                            <td className="py-3.5 px-4 font-semibold">
                              <span className="px-2 py-0.5 bg-sky-50 text-sky-700 border border-sky-150 rounded text-[10px] font-bold whitespace-nowrap">
                                {f.fileType}
                              </span>
                            </td>
                            <td className="py-3.5 px-4 font-mono font-medium text-slate-400">{f.dateAdded}</td>
                            <td className="py-3.5 px-4 text-center font-mono font-semibold text-slate-600">{f.fileSize}</td>
                            <td className="py-3.5 px-4 text-center">
                              <button
                                type="button"
                                onClick={() => handleViewFileInNewTab(f)}
                                className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 hover:shadow-sm text-white rounded-xl transition font-bold active:scale-95 inline-flex items-center gap-1.5 cursor-pointer text-[11px]"
                              >
                                <Eye className="w-3.5 h-3.5" />
                                <span>Lihat & Unduh</span>
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

        </main>
      </div>

      {/* USER PROFILE MODIFICATION POPUP */}
      {profileModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 text-xs">
          <div className="bg-white rounded-2xl w-full max-w-md border border-slate-200 shadow-2xl overflow-hidden animate-in">
            <div className="bg-gradient-to-r from-sky-500 to-indigo-600 px-5 py-4 text-white flex items-center justify-between">
              <span className="font-bold tracking-tight">Perbarui Profil Kepala Sekolah</span>
              <button onClick={() => setProfileModalOpen(false)} className="p-1 hover:bg-white/10 rounded-lg text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 sm:p-6 space-y-4">
              <div>
                <label className="block text-slate-705 font-bold mb-1 uppercase tracking-wider">Nama Lengkap & Jabatan</label>
                <input
                  type="text"
                  disabled
                  value={userProfileName}
                  className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-xl text-slate-500 text-xs cursor-not-allowed"
                />
                <span className="text-[9px] text-slate-400 mt-1 block">Hubungi Admin jika ingin mengubah nama atau gelar kependidikan Anda.</span>
              </div>

              <div>
                <label className="block text-slate-705 font-bold mb-1.5 uppercase tracking-wider">Asal Instansi Sekolah Dasar</label>
                <input
                  type="text"
                  disabled
                  value={userProfileSchool}
                  className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-xl text-slate-500 text-xs cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-slate-705 font-bold mb-1.5 uppercase tracking-wider">Kredensial NIP Kepala Sekolah</label>
                <input
                  type="text"
                  disabled
                  value={userProfileNip || 'Belum diisi'}
                  className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-xl text-slate-500 text-xs cursor-not-allowed"
                />
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setProfileModalOpen(false)}
                  className="w-full py-2.5 bg-gradient-to-r from-sky-500 to-indigo-600 text-white hover:from-sky-600 hover:to-indigo-700 font-bold rounded-xl transition tracking-wide text-xs active:scale-95 duration-200 cursor-pointer"
                >
                  Selesai Review
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DETAILED SURAT UNDANGAN PREVIEW MODAL */}
      {viewDetailsOpen && selectedAgenda && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 text-xs">
          <div className="bg-white rounded-2xl w-full max-w-lg border border-slate-200 shadow-2xl overflow-hidden animate-in">
            
            <div className="bg-gradient-to-r from-sky-600 to-indigo-700 px-5 py-4 text-white flex items-center justify-between">
              <span className="font-extrabold text-sm tracking-tight">Detail Surat Undangan MKKS</span>
              <button onClick={() => setViewDetailsOpen(false)} className="p-1 hover:bg-white/10 rounded-lg text-white">
                <X className="w-4.5 h-4.5" />
              </button>
            </div>

            <div className="p-5 sm:p-6 space-y-4">
              <div className="bg-slate-50 p-4 border border-slate-100 rounded-2xl space-y-1.5">
                <h4 className="font-extrabold text-slate-900 leading-snug">{selectedAgenda.judul}</h4>
                <div className="grid grid-cols-2 gap-3 text-[11px] text-slate-600 pt-1.5">
                  <div>
                    <strong>Waktu Penyelenggaraan:</strong>
                    <span className="block text-slate-800 font-bold">{new Date(selectedAgenda.waktu).toLocaleString('id-ID')}</span>
                  </div>
                  <div>
                    <strong>Tempat Pelaksanaan:</strong>
                    <span className="block text-slate-800 font-bold">{selectedAgenda.tempat}</span>
                  </div>
                </div>
              </div>

              {selectedAgenda.namaDokumen ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800 uppercase tracking-wide text-[11px]">Pratinjau Surat Formal Web</span>
                    <button
                      type="button"
                      onClick={() => setPreviewHandoutOpen(!previewHandoutOpen)}
                      className="px-3.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold rounded-lg border border-indigo-200 transition active:scale-95"
                    >
                      {previewHandoutOpen ? 'Sembunyikan Surat' : 'Buka Surat Resmi'}
                    </button>
                  </div>

                  {previewHandoutOpen && (
                    <div className="border border-slate-200 rounded-2xl p-4 bg-slate-50 text-center space-y-3 animate-in">
                      <div className="bg-white border border-slate-100 max-w-sm mx-auto p-4 py-6 shadow-md text-left space-y-4 font-serif text-[11px]">
                        
                        <div className="text-center border-b-2 border-slate-950 pb-2">
                          <span className="block font-sans font-extrabold text-slate-800 tracking-wider text-[10px]">PEMERINTAH KABUPATEN GARUT</span>
                          <span className="block font-sans font-bold text-slate-700 text-[10px]">MUSYAWARAH KERJA KEPALA SEKOLAH (MKKS) SD</span>
                          <span className="block text-[8px] font-sans text-slate-500">Kecamatan Pasirwangi, Kabupaten Garut, Jawa Barat 44161</span>
                        </div>

                        <div className="text-right text-[9px] text-slate-400 font-sans">Pasirwangi, {new Date(selectedAgenda.waktu).toLocaleDateString('id-ID')}</div>

                        <div>
                          <strong>Hal:</strong> Surat Undangan Kegiatan Terbuka Rayon Pasirwangi<br/>
                          <strong>Kepada Yth:</strong> Bapak/Ibu Kepala {currentUser.namaSekolah}
                        </div>

                        <p className="leading-relaxed">
                          Mengharap kehadiran Bapak/Ibu Kepala Sekolah pada:<br/>
                          <strong>Hari/Tanggal:</strong> {new Date(selectedAgenda.waktu).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}<br/>
                          <strong>Pukul:</strong> {new Date(selectedAgenda.waktu).toLocaleTimeString('id-ID')} WIB s.d Selesai<br/>
                          <strong>Tempat:</strong> {selectedAgenda.tempat}<br/>
                          <strong>Bahasan:</strong> {selectedAgenda.judul}
                        </p>

                        <div className="text-right pt-2 font-sans text-slate-500 lead-none">
                          <span className="block font-bold">Ketua MKKS Kecamatan Pasirwangi</span>
                          <div className="h-8"></div>
                          <span className="block font-bold text-slate-700 underline">H. Jajang, S.Pd., M.M.</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-4 border border-dashed border-slate-200 text-center rounded-2xl text-slate-400 font-bold">
                  Tidak ada fail lampiran surat undangan
                </div>
              )}
            </div>

            <div className="bg-slate-50 px-5 py-4 flex justify-end gap-2 border-t border-slate-100">
              {selectedAgenda.namaDokumen && (
                <button
                  onClick={() => downloadHandoutMock(selectedAgenda)}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition shadow active:scale-95"
                >
                  Unduh Surat (PDF)
                </button>
              )}
              <button
                onClick={() => setViewDetailsOpen(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-705 text-slate-700 font-bold rounded-xl transition active:scale-95 border border-slate-300"
              >
                Tutup
              </button>
            </div>

          </div>
        </div>
      )}

      {/* USER PREVIEW DIGITAL FILE MODAL */}
      {viewUserFileModalOpen && selectedUserFile && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 text-xs">
          <div className="bg-white rounded-2xl w-full max-w-lg border border-slate-200 shadow-2xl overflow-hidden animate-in">
            
            <div className="bg-gradient-to-r from-indigo-650 bg-gradient-to-r from-indigo-600 to-indigo-700 px-5 py-4 text-white flex items-center justify-between">
              <span className="font-extrabold text-sm tracking-tight flex items-center gap-1.5">
                <FolderOpen className="w-4 h-4 text-indigo-200" />
                <span>Rincian Berkas Digital Anggota</span>
              </span>
              <button type="button" onClick={() => setViewUserFileModalOpen(false)} className="p-1 hover:bg-white/10 rounded-lg text-white">
                <X className="w-4.5 h-4.5" />
              </button>
            </div>

            <div className="p-5 sm:p-6 space-y-4">
              <div className="bg-slate-50 p-4 border border-slate-100 rounded-2xl space-y-3">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider mb-0.5">Nama File / Dokumen Resmi</span>
                  <h4 className="font-black text-slate-900 leading-snug text-sm">{selectedUserFile.namaFile}</h4>
                </div>
                
                <div className="grid grid-cols-2 gap-3 text-[11px] text-slate-600 border-t border-slate-200/60 pt-2.5">
                  <div>
                    <strong className="text-slate-400 block text-[10px] uppercase font-bold">Nama Asli Fail:</strong>
                    <span className="text-slate-800 font-mono font-bold truncate block max-w-[180px]" title={selectedUserFile.namaAsli}>
                      {selectedUserFile.namaAsli}
                    </span>
                  </div>
                  <div>
                    <strong className="text-slate-400 block text-[10px] uppercase font-bold">Format Dokumen:</strong>
                    <span className="text-slate-800 font-bold block">{selectedUserFile.fileType}</span>
                  </div>
                  <div>
                    <strong className="text-slate-400 block text-[10px] uppercase font-bold">Tanggal Publikasi:</strong>
                    <span className="text-slate-800 font-bold font-mono block">{selectedUserFile.dateAdded}</span>
                  </div>
                  <div>
                    <strong className="text-slate-400 block text-[10px] uppercase font-bold">Ukuran File:</strong>
                    <span className="text-slate-800 font-bold font-mono block">{selectedUserFile.fileSize}</span>
                  </div>
                </div>
              </div>

              {/* Informative box with security lock icon */}
              <div className="border border-indigo-100 rounded-xl p-4 bg-indigo-50/40 text-center space-y-2">
                <div className="mx-auto w-10 h-10 bg-white rounded-full flex items-center justify-center border border-indigo-100 shadow-sm text-indigo-600">
                  <FolderOpen className="w-5 h-5 animate-pulse" />
                </div>
                <div className="space-y-0.5">
                  <span className="block font-bold text-indigo-900 text-xs">Akses Dokumen Resmi</span>
                  <p className="text-[10px] text-slate-500 max-w-xs mx-auto leading-relaxed">
                    Dokumen ini disediakan secara resmi oleh MKKS Rayon Pasirwangi untuk keperluan administrasi sekolah dasar Anda.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-slate-50 px-5 py-4 flex justify-end gap-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  // Direct clean browser download trigger
                  const link = document.createElement('a');
                  link.href = selectedUserFile.fileContent;
                  link.download = selectedUserFile.namaAsli;
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
                }}
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition shadow active:scale-95 text-xs inline-flex items-center gap-1.5 cursor-pointer"
              >
                <FolderOpen className="w-4 h-4" />
                <span>Unduh File Sekarang</span>
              </button>
              <button
                type="button"
                onClick={() => setViewUserFileModalOpen(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition active:scale-95 border border-slate-305 border-slate-300 text-xs cursor-pointer"
              >
                Tutup
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
