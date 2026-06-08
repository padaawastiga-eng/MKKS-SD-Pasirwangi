/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import * as XLSX from 'xlsx';
import { School, Agenda, ProgramKerja, Sekretariat, UserAccount, AboutMkks, AdminProfile, GaleriKegiatan, DigitalFile } from '../types';
import { 
  BarChart, School as SchoolIcon, Users, Calendar as CalendarIcon, FileText, Settings, Info, MapPin, 
  Plus, Edit2, Trash2, Eye, Search, LogOut, Camera, Upload, Check, X, ChevronLeft, ChevronRight, HelpCircle,
  Image as ImageIcon, MessageSquare, FolderOpen, FileUp, FileSpreadsheet, Download, Database, Sparkles, RefreshCw
} from 'lucide-react';
import { SUPABASE_SQL_SCHEMA } from '../supabaseClient';
import HelpDeskChat from './HelpDeskChat';

interface AdminDashboardProps {
  schools: School[];
  agendas: Agenda[];
  programs: ProgramKerja[];
  sekretariat: Sekretariat;
  aboutInfo: AboutMkks;
  users: UserAccount[];
  galeri: GaleriKegiatan[];
  adminProfile: AdminProfile;
  digitalFiles: DigitalFile[];
  
  // State Updaters
  onUpdateSchools: (schools: School[]) => void;
  onUpdateAgendas: (agendas: Agenda[]) => void;
  onUpdatePrograms: (programs: ProgramKerja[]) => void;
  onUpdateSekretariat: (sekretariat: Sekretariat) => void;
  onUpdateAbout: (about: AboutMkks) => void;
  onUpdateUsers: (users: UserAccount[]) => void;
  onUpdateGaleri: (galeri: GaleriKegiatan[]) => void;
  onUpdateAdminProfile: (profile: AdminProfile) => void;
  onUpdateDigitalFiles: (files: DigitalFile[]) => void;
  onLogout: () => void;

  // Supabase Controls
  supabaseSync?: boolean;
  onToggleSupabaseSync?: (enabled: boolean) => void;
  supabaseStatus?: {
    connected: boolean;
    tablesExist: boolean;
    error: string | null;
  };
  onPullSupabaseData?: (forceAlert?: boolean) => Promise<boolean>;
  onPushSupabaseData?: () => Promise<boolean>;
}

export default function AdminDashboard({
  schools, agendas, programs, sekretariat, aboutInfo, users, galeri, adminProfile, digitalFiles,
  onUpdateSchools, onUpdateAgendas, onUpdatePrograms, onUpdateSekretariat, onUpdateAbout, onUpdateUsers, onUpdateGaleri, onUpdateAdminProfile, onUpdateDigitalFiles,
  onLogout,
  // Supabase Defaults
  supabaseSync = false,
  onToggleSupabaseSync = () => {},
  supabaseStatus = { connected: false, tablesExist: false, error: null },
  onPullSupabaseData = async () => false,
  onPushSupabaseData = async () => false
}: AdminDashboardProps) {

  // Primary active tab
  const [activeTab, setActiveTab] = useState<'dashboard' | 'kelembagaan' | 'about' | 'agenda' | 'program' | 'sekretariat' | 'user' | 'galeri' | 'helpdesk' | 'files' | 'supabase'>('dashboard');

  const [copiedSql, setCopiedSql] = useState(false);

  const handleCopySql = () => {
    navigator.clipboard.writeText(SUPABASE_SQL_SCHEMA);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2000);
  };

  // Sidebar hidden/collapsed on responsive layouts
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Profile Edit Modal state
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [adminNameInput, setAdminNameInput] = useState(adminProfile.nama);
  const [adminFotoInput, setAdminFotoInput] = useState(adminProfile.foto);
  
  // Deletion Modal / Dialog verification states
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteType, setDeleteType] = useState<'school' | 'agenda' | 'program' | 'user' | 'galeri' | 'files' | null>(null);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  // SEARCH & PAGINATION STATES
  // Kelembagaan pagination
  const [schoolSearchQuery, setSchoolSearchQuery] = useState('');
  const [schoolCurrentPage, setSchoolCurrentPage] = useState(1);
  const schoolsPerPage = 10;

  // View Details Modal (Lihat Aksi)
  const [viewDetailsOpen, setViewDetailsOpen] = useState(false);
  const [viewDetailsType, setViewDetailsType] = useState<'school' | 'agenda' | 'program' | null>(null);
  const [viewDetailsSchool, setViewDetailsSchool] = useState<School | null>(null);
  const [viewDetailsAgenda, setViewDetailsAgenda] = useState<Agenda | null>(null);

  // Agenda PDF browser-preview helper
  const [previewAgendaPdf, setPreviewAgendaPdf] = useState<boolean>(false);

  // FORM INPUT STATES
  // Kelembagaan (Sekolah)
  const [editSchoolId, setEditSchoolId] = useState<string | null>(null);
  const [schoolNama, setSchoolNama] = useState('');
  const [schoolNpsn, setSchoolNpsn] = useState('');
  const [schoolNamaKS, setSchoolNamaKS] = useState('');
  const [schoolNipKS, setSchoolNipKS] = useState('');
  const [schoolStatusKS, setSchoolStatusKS] = useState<'Definitif' | 'PLT'>('Definitif');
  const [schoolFotoKS, setSchoolFotoKS] = useState('');

  // About MKKS
  const [aboutDeskripsi, setAboutDeskripsi] = useState(aboutInfo.deskripsi);
  const [aboutVisi, setAboutVisi] = useState(aboutInfo.visi);
  const [aboutMisi, setAboutMisi] = useState(aboutInfo.misi);
  const [aboutFoto, setAboutFoto] = useState(aboutInfo.foto || '');

  // Agenda
  const [editAgendaId, setEditAgendaId] = useState<string | null>(null);
  const [agendaJudul, setAgendaJudul] = useState('');
  const [agendaWaktu, setAgendaWaktu] = useState('');
  const [agendaTempat, setAgendaTempat] = useState('');
  const [agendaDocName, setAgendaDocName] = useState('');
  const [agendaDocData, setAgendaDocData] = useState('');

  // Program Kerja
  const [editProgramId, setEditProgramId] = useState<string | null>(null);
  const [programJudul, setProgramJudul] = useState('');
  const [programIsi, setProgramIsi] = useState('');

  // Galeri Kegiatan
  const [editGaleriId, setEditGaleriId] = useState<string | null>(null);
  const [galeriJudul, setGaleriJudul] = useState('');
  const [galeriFoto, setGaleriFoto] = useState('');
  const [galeriTanggal, setGaleriTanggal] = useState('');

  // Sekretariat
  const [sekAlamat, setSekAlamat] = useState(sekretariat.alamat);
  const [sekKontak, setSekKontak] = useState(sekretariat.noKontak);
  const [sekEmail, setSekEmail] = useState(sekretariat.email);

  // Pengaturan User (Forced Reg)
  const [editUserId, setEditUserId] = useState<string | null>(null);
  const [userNama, setUserNama] = useState('');
  const [userNip, setUserNip] = useState('');
  const [userSchool, setUserSchool] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [userPass, setUserPass] = useState('');

  // Menu File Digital States
  const [editFileId, setEditFileId] = useState<string | null>(null);
  const [fileNameInput, setFileNameInput] = useState('');
  const [fileBlobName, setFileBlobName] = useState('');
  const [fileBlobContent, setFileBlobContent] = useState('');
  const [fileBlobSize, setFileBlobSize] = useState('');
  const [fileBlobType, setFileBlobType] = useState('');

  // Selected file preview modal
  const [viewFileItem, setViewFileItem] = useState<DigitalFile | null>(null);
  const [viewFileModalOpen, setViewFileModalOpen] = useState(false);

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
          font-weight: 700;
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

  const handleDigitalFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileBlobName(file.name);
      // Humanize size
      const sizeKB = Math.round(file.size / 1024);
      const sizeStr = sizeKB > 1024 ? `${(sizeKB / 1024).toFixed(1)} MB` : `${sizeKB} KB`;
      setFileBlobSize(sizeStr);
      
      // Classify type
      let docType = 'Dokumen Digital';
      if (file.type.includes('pdf')) docType = 'Portable Document Format';
      else if (file.type.includes('sheet') || file.name.endsWith('.xls') || file.name.endsWith('.xlsx')) docType = 'Excel Spreadsheet';
      else if (file.type.includes('word') || file.name.endsWith('.doc') || file.name.endsWith('.docx')) docType = 'Word Document';
      else if (file.type.includes('image')) docType = 'Gambar / Citra';
      else if (file.type.includes('zip') || file.type.includes('rar')) docType = 'Arsip Terkompresi';
      setFileBlobType(docType);

      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setFileBlobContent(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveDigitalFile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fileNameInput.trim()) {
      alert('Nama File wajib diisi!');
      return;
    }

    if (!editFileId && !fileBlobContent) {
      alert('Silakan pilih berkas yang ingin diunggah!');
      return;
    }

    if (editFileId) {
      // Edit
      const updated = digitalFiles.map(f => f.id === editFileId ? {
        ...f,
        namaFile: fileNameInput.trim(),
        namaAsli: fileBlobName || f.namaAsli,
        fileContent: fileBlobContent || f.fileContent,
        fileSize: fileBlobSize || f.fileSize,
        fileType: fileBlobType || f.fileType
      } : f);
      onUpdateDigitalFiles(updated);
      setEditFileId(null);
    } else {
      // Add new
      const newFile: DigitalFile = {
        id: 'f-' + Date.now(),
        namaFile: fileNameInput.trim(),
        namaAsli: fileBlobName || 'dokumen_unduhan.pdf',
        fileContent: fileBlobContent || 'data:application/pdf;base64,...',
        dateAdded: new Date().toISOString().split('T')[0],
        fileSize: fileBlobSize || '0 KB',
        fileType: fileBlobType || 'Dokumen Digital'
      };
      onUpdateDigitalFiles([newFile, ...digitalFiles]);
    }

    // Reset Form
    setFileNameInput('');
    setFileBlobName('');
    setFileBlobContent('');
    setFileBlobSize('');
    setFileBlobType('');
  };

  const startEditDigitalFile = (fileItem: DigitalFile) => {
    setEditFileId(fileItem.id);
    setFileNameInput(fileItem.namaFile);
    setFileBlobName(fileItem.namaAsli);
    setFileBlobContent(fileItem.fileContent);
    setFileBlobSize(fileItem.fileSize);
    setFileBlobType(fileItem.fileType);
    window.scrollTo({ top: 120, behavior: 'smooth' });
  };

  const handleDeleteDigitalFile = (id: string) => {
    triggerDelete(id, 'files');
  };

  // File Upload Handlers (converts local files cleanly to Base64)
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>, setter: (val: string) => void) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setter(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Profile Upload
  const handleAdminPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    handlePhotoUpload(e, setAdminFotoInput);
  };

  // Save Profil Admin
  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminNameInput.trim()) return;
    onUpdateAdminProfile({
      nama: adminNameInput.trim(),
      foto: adminFotoInput
    });
    setProfileModalOpen(false);
  };

  // ACTIONS FOR KELEMBAGAAN (SCHOOL)
  const handleSaveSchool = (e: React.FormEvent) => {
    e.preventDefault();
    if (!schoolNama.trim() || !schoolNpsn.trim() || !schoolNamaKS.trim()) {
      alert('Semua isian wajib diisi!');
      return;
    }

    if (editSchoolId) {
      // Edit
      const updated = schools.map(s => s.id === editSchoolId ? {
        ...s,
        namaSekolah: schoolNama.trim(),
        npsn: schoolNpsn.trim(),
        namaKS: schoolNamaKS.trim(),
        nipKS: schoolNipKS.trim(),
        statusKS: schoolStatusKS,
        fotoKS: schoolFotoKS || s.fotoKS
      } : s);
      onUpdateSchools(updated);
      setEditSchoolId(null);
    } else {
      // Add
      const newS: School = {
        id: 's-' + Date.now(),
        namaSekolah: schoolNama.trim(),
        npsn: schoolNpsn.trim(),
        namaKS: schoolNamaKS.trim(),
        nipKS: schoolNipKS.trim(),
        statusKS: schoolStatusKS,
        fotoKS: schoolFotoKS || 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=150&auto=format&fit=crop'
      };
      onUpdateSchools([newS, ...schools]);
    }

    // Reset Form
    setSchoolNama('');
    setSchoolNpsn('');
    setSchoolNamaKS('');
    setSchoolNipKS('');
    setSchoolStatusKS('Definitif');
    setSchoolFotoKS('');
  };

  const handleDownloadTemplate = () => {
    const headers = ['Nama Sekolah Dasar', 'NPSN', 'Nama Kepala Sekolah', 'NIP Kepala Sekolah', 'Status Kepala Sekolah (Definitif / PLT)'];
    const sampleRows = [
      ['SDN 1 Pasirwangi', '20224101', 'Ahmad Sodikin, S.Pd.', '197108231996041001', 'Definitif'],
      ['SDN 2 Pasirwangi', '20224102', 'Dewi Lestari, M.Pd.', '198212052009032005', 'PLT']
    ];
    
    // Create Worksheet with headers and sample data
    const worksheetData = [headers, ...sampleRows];
    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
    
    // Auto fit column widths for cleaner initial opening layout in Excel
    worksheet['!cols'] = [
      { wch: 25 }, // Nama Sekolah Dasar
      { wch: 15 }, // NPSN
      { wch: 25 }, // Nama Kepala Sekolah
      { wch: 25 }, // NIP Kepala Sekolah
      { wch: 35 }  // Status Kepala Sekolah
    ];
    
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Template SD');
    XLSX.writeFile(workbook, 'Template_Data_Kelembagaan_SD.xlsx');
  };

  const handleImportExcel = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const arrayBuffer = event.target?.result as ArrayBuffer;
        if (!arrayBuffer) return;

        const dataBytes = new Uint8Array(arrayBuffer);
        const workbook = XLSX.read(dataBytes, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];

        const rows = XLSX.utils.sheet_to_json<any[]>(worksheet, { header: 1 });
        if (rows.length < 2) {
          alert('Berhasil membaca berkas Excel, tetapi data kosong atau kurang dari 2 baris!');
          return;
        }

        const headerRow = (rows[0] as any[]).map(h => String(h || '').trim().toLowerCase());

        const idxNama = headerRow.findIndex(h => h.includes('sekolah') || h.includes('nama') || h.includes('lembaga'));
        const idxNpsn = headerRow.findIndex(h => h.includes('npsn') || h.includes('nomor pokok') || h.includes('national school id'));
        const idxNamaKS = headerRow.findIndex(h => h.includes('kepala') || h.includes('ks') || h.includes('pemimpin'));
        const idxNipKS = headerRow.findIndex(h => h.includes('nip') || h.includes('nomor induk pegawai'));
        const idxStatusKS = headerRow.findIndex(h => h.includes('status') || h.includes('jabatan'));

        if (idxNama === -1 || idxNpsn === -1 || idxNamaKS === -1) {
          alert('Template kolom tidak sesuai! File Excel harus memiliki kolom: Nama Sekolah Dasar, NPSN, dan Nama Kepala Sekolah.');
          return;
        }

        const newImportedSchools: School[] = [];
        let importedCount = 0;

        for (let i = 1; i < rows.length; i++) {
          const cells = rows[i] as any[];
          if (!cells || cells.length === 0) continue;

          const npsn = cells[idxNpsn] ? String(cells[idxNpsn]).trim() : '';
          const namaSekolah = cells[idxNama] ? String(cells[idxNama]).trim() : '';
          const namaKS = cells[idxNamaKS] ? String(cells[idxNamaKS]).trim() : '';
          
          if (!npsn || !namaSekolah || !namaKS) continue;

          const nipKS = idxNipKS !== -1 && cells[idxNipKS] ? String(cells[idxNipKS]).trim() : '';
          const rawStatus = idxStatusKS !== -1 && cells[idxStatusKS] ? String(cells[idxStatusKS]).trim() : 'Definitif';
          const statusKS = rawStatus.toLowerCase().includes('plt') ? 'PLT' : 'Definitif';

          newImportedSchools.push({
            id: 's-import-' + Date.now() + '-' + i,
            namaSekolah,
            npsn,
            namaKS,
            nipKS,
            statusKS,
            fotoKS: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=150&auto=format&fit=crop'
          });
          importedCount++;
        }

        if (newImportedSchools.length === 0) {
          alert('Tidak ada baris data valid yang berhasil dibaca dari berkas Excel Anda!');
          return;
        }

        const updatedList = [...schools];
        newImportedSchools.forEach(newS => {
          const existingIdx = updatedList.findIndex(e => e.npsn === newS.npsn);
          if (existingIdx !== -1) {
            updatedList[existingIdx] = {
              ...updatedList[existingIdx],
              namaSekolah: newS.namaSekolah,
              namaKS: newS.namaKS,
              nipKS: newS.nipKS,
              statusKS: newS.statusKS
            };
          } else {
            updatedList.unshift(newS);
          }
        });

        onUpdateSchools(updatedList);
        alert(`Sukses mengimport data kelembagaan! Berhasil memproses ${importedCount} sekolah ke dalam database.`);
      } catch (err) {
        console.error(err);
        alert('Terjadi kesalahan saat memproses berkas Excel Anda. Pastikan format berkas benar (.xlsx / .xls).');
      }
    };
    reader.readAsArrayBuffer(file);
    e.target.value = '';
  };

  const handleDirectPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>, schoolId: string) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          const imgBase64 = event.target.result as string;
          const updated = schools.map(s => s.id === schoolId ? {
            ...s,
            fotoKS: imgBase64
          } : s);
          onUpdateSchools(updated);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const startEditSchool = (sc: School) => {
    setEditSchoolId(sc.id);
    setSchoolNama(sc.namaSekolah);
    setSchoolNpsn(sc.npsn);
    setSchoolNamaKS(sc.namaKS);
    setSchoolNipKS(sc.nipKS);
    setSchoolStatusKS(sc.statusKS);
    setSchoolFotoKS(sc.fotoKS || '');
    // Scroll form into focus or view
    window.scrollTo({ top: 120, behavior: 'smooth' });
  };

  // VIEW LIHAT AKSI
  const handleViewSchool = (sc: School) => {
    viewDetailsType === 'school';
    setViewDetailsSchool(sc);
    setViewDetailsType('school');
    setViewDetailsOpen(true);
  };

  // ACTIONS FOR ABOUT
  const handleSaveAbout = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateAbout({
      deskripsi: aboutDeskripsi.trim(),
      visi: aboutVisi.trim(),
      misi: aboutMisi.trim(),
      foto: aboutFoto
    });
    alert('Tentang MKKS berhasil diperbarui ke Landing Page!');
  };

  // ACTIONS FOR AGENDA
  const handleSaveAgenda = (e: React.FormEvent) => {
    e.preventDefault();
    if (!agendaJudul.trim() || !agendaWaktu.trim() || !agendaTempat.trim()) return;

    if (editAgendaId) {
      // Edit
      const updated = agendas.map(a => a.id === editAgendaId ? {
        ...a,
        judul: agendaJudul.trim(),
        waktu: agendaWaktu,
        tempat: agendaTempat.trim(),
        dokumen: agendaDocData || a.dokumen,
        namaDokumen: agendaDocName || a.namaDokumen
      } : a);
      onUpdateAgendas(updated);
      setEditAgendaId(null);
    } else {
      // Add
      const nAgenda: Agenda = {
        id: 'a-' + Date.now(),
        judul: agendaJudul.trim(),
        waktu: agendaWaktu,
        tempat: agendaTempat.trim(),
        dokumen: agendaDocData || undefined,
        namaDokumen: agendaDocName || undefined
      };
      onUpdateAgendas([nAgenda, ...agendas]);
    }

    // reset Form
    setAgendaJudul('');
    setAgendaWaktu('');
    setAgendaTempat('');
    setAgendaDocName('');
    setAgendaDocData('');
  };

  const startEditAgenda = (ag: Agenda) => {
    setEditAgendaId(ag.id);
    setAgendaJudul(ag.judul);
    setAgendaWaktu(ag.waktu);
    setAgendaTempat(ag.tempat);
    setAgendaDocName(ag.namaDokumen || '');
    setAgendaDocData(ag.dokumen || '');
    window.scrollTo({ top: 120, behavior: 'smooth' });
  };

  const handleViewAgenda = (ag: Agenda) => {
    setViewDetailsAgenda(ag);
    setViewDetailsType('agenda');
    setViewDetailsOpen(true);
    setPreviewAgendaPdf(false); // reset preview toggle initially
  };

  // ACTIONS FOR PROGRAM KERJA
  const handleSaveProgram = (e: React.FormEvent) => {
    e.preventDefault();
    if (!programJudul.trim() || !programIsi.trim()) return;

    if (editProgramId) {
      const updated = programs.map(p => p.id === editProgramId ? {
        ...p,
        judulProgram: programJudul.trim(),
        isiProgram: programIsi.trim()
      } : p);
      onUpdatePrograms(updated);
      setEditProgramId(null);
    } else {
      const nProg: ProgramKerja = {
        id: 'p-' + Date.now(),
        judulProgram: programJudul.trim(),
        isiProgram: programIsi.trim()
      };
      onUpdatePrograms([...programs, nProg]);
    }

    setProgramJudul('');
    setProgramIsi('');
  };

  const startEditProgram = (p: ProgramKerja) => {
    setEditProgramId(p.id);
    setProgramJudul(p.judulProgram);
    setProgramIsi(p.isiProgram);
    window.scrollTo({ top: 120, behavior: 'smooth' });
  };

  // ACTIONS FOR SEKRETARIAT
  const handleSaveSekretariat = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateSekretariat({
      alamat: sekAlamat.trim(),
      noKontak: sekKontak.trim(),
      email: sekEmail.trim()
    });
    alert('Informasi Sekretariat berhasil diperbarui!');
  };

  // ACTIONS FOR PENGATURAN USER (FORCE REGISTER)
  const handleSaveUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userNama.trim() || !userEmail.trim()) return;

    if (editUserId) {
      const updated = users.map(u => u.id === editUserId ? {
        ...u,
        nama: userNama.trim(),
        nip: userNip.trim() || undefined,
        namaSekolah: userSchool.trim() || undefined,
        email: userEmail.trim(),
        password: userPass.trim() || u.password,
      } : u);
      onUpdateUsers(updated);
      setEditUserId(null);
    } else {
      // Validate unique
      const exists = users.some(u => u.email.toLowerCase() === userEmail.toLowerCase().trim());
      if (exists) {
        alert('Email user sudah terdaftar!');
        return;
      }

      const nUser: UserAccount = {
        id: 'u-' + Date.now(),
        nama: userNama.trim(),
        nip: userNip.trim() || undefined,
        namaSekolah: userSchool.trim() || undefined,
        email: userEmail.trim(),
        password: userPass.trim() || 'password123',
        isActive: true,
        registrationType: 'admin_forced'
      };
      onUpdateUsers([...users, nUser]);
    }

    setUserNama('');
    setUserNip('');
    setUserSchool('');
    setUserEmail('');
    setUserPass('');
  };

  const startEditUser = (u: UserAccount) => {
    setEditUserId(u.id);
    setUserNama(u.nama);
    setUserNip(u.nip || '');
    setUserSchool(u.namaSekolah || '');
    setUserEmail(u.email);
    setUserPass(u.password || '');
    window.scrollTo({ top: 120, behavior: 'smooth' });
  };

  // ACTIONS FOR GALERI KEGIATAN
  const handleSaveGaleri = (e: React.FormEvent) => {
    e.preventDefault();
    if (!galeriJudul.trim() || !galeriFoto.trim()) {
      alert('Judul kegiatan dan foto wajib diisi!');
      return;
    }

    if (editGaleriId) {
      const updated = galeri.map(g => g.id === editGaleriId ? {
        ...g,
        judul: galeriJudul.trim(),
        foto: galeriFoto,
        tanggal: galeriTanggal || new Date().toISOString().split('T')[0]
      } : g);
      onUpdateGaleri(updated);
      setEditGaleriId(null);
    } else {
      const nGaleri: GaleriKegiatan = {
        id: 'g-' + Date.now(),
        judul: galeriJudul.trim(),
        foto: galeriFoto,
        tanggal: galeriTanggal || new Date().toISOString().split('T')[0]
      };
      onUpdateGaleri([...galeri, nGaleri]);
    }

    setGaleriJudul('');
    setGaleriFoto('');
    setGaleriTanggal('');
  };

  const startEditGaleri = (g: GaleriKegiatan) => {
    setEditGaleriId(g.id);
    setGaleriJudul(g.judul);
    setGaleriFoto(g.foto);
    setGaleriTanggal(g.tanggal || '');
    window.scrollTo({ top: 120, behavior: 'smooth' });
  };

  const handleToggleUserActive = (id: string) => {
    const updated = users.map(u => u.id === id ? { ...u, isActive: !u.isActive } : u);
    onUpdateUsers(updated);
  };

  // VERIFIED DELETE MODAL ACTIONS
  const triggerDelete = (id: string, type: 'school' | 'agenda' | 'program' | 'user' | 'galeri' | 'files') => {
    setDeleteConfirmOpen(true);
    setDeleteType(type);
    setDeleteTargetId(id);
  };

  const handleVerifiedDelete = () => {
    if (!deleteTargetId || !deleteType) return;

    if (deleteType === 'school') {
      const filtered = schools.filter(s => s.id !== deleteTargetId);
      onUpdateSchools(filtered);
    } else if (deleteType === 'agenda') {
      const filtered = agendas.filter(a => a.id !== deleteTargetId);
      onUpdateAgendas(filtered);
    } else if (deleteType === 'program') {
      const filtered = programs.filter(p => p.id !== deleteTargetId);
      onUpdatePrograms(filtered);
    } else if (deleteType === 'user') {
      const filtered = users.filter(u => u.id !== deleteTargetId);
      onUpdateUsers(filtered);
    } else if (deleteType === 'galeri') {
      const filtered = galeri.filter(g => g.id !== deleteTargetId);
      onUpdateGaleri(filtered);
    } else if (deleteType === 'files') {
      const filtered = digitalFiles.filter(f => f.id !== deleteTargetId);
      onUpdateDigitalFiles(filtered);
    }

    // Reset delete confirmation states
    setDeleteConfirmOpen(false);
    setDeleteTargetId(null);
    setDeleteType(null);
  };

  // CALENDAR CALCULATION DATA
  const [currentCalMonth, setCurrentCalMonth] = useState(5); // 0-indexed (June = 5)
  const [currentCalYear, setCurrentCalYear] = useState(2026);
  const weekdays = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
  const monthNames = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];

  const getDaysInMonth = (month: number, year: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (month: number, year: number) => {
    return new Date(year, month, 1).getDay();
  };

  const daysInMonth = getDaysInMonth(currentCalMonth, currentCalYear);
  const firstDayIndex = getFirstDayOfMonth(currentCalMonth, currentCalYear);

  const prevMonth = () => {
    if (currentCalMonth === 0) {
      setCurrentCalMonth(11);
      setCurrentCalYear(currentCalYear - 1);
    } else {
      setCurrentCalMonth(currentCalMonth - 1);
    }
  };

  const nextMonth = () => {
    if (currentCalMonth === 11) {
      setCurrentCalMonth(0);
      setCurrentCalYear(currentCalYear + 1);
    } else {
      setCurrentCalMonth(currentCalMonth + 1);
    }
  };

  // Helper calendar render dates
  const calendarCells = [];
  // Empty slots for previous month padding
  for (let i = 0; i < firstDayIndex; i++) {
    calendarCells.push(null);
  }
  // This month's days
  for (let d = 1; d <= daysInMonth; d++) {
    calendarCells.push(d);
  }

  // Active users count
  const totalSchoolsCount = schools.length;
  const totalKsCount = schools.filter(s => s.namaKS).length;
  const totalUsersCount = users.length;
  const totalAgendasCount = agendas.length;

  // School table filtration & searching setup
  const filteredSchools = schools.filter(sc => {
    const q = schoolSearchQuery.toLowerCase().trim();
    if (!q) return true;
    return sc.namaSekolah.toLowerCase().includes(q) || sc.npsn.includes(q);
  });

  // Pagination bounds
  const indexLastSchool = schoolCurrentPage * schoolsPerPage;
  const indexFirstSchool = indexLastSchool - schoolsPerPage;
  const currentSchoolsList = filteredSchools.slice(indexFirstSchool, indexLastSchool);
  const schoolTotalPages = Math.ceil(filteredSchools.length / schoolsPerPage);

  const changeSchoolPage = (pN: number) => {
    if (pN >= 1 && pN <= schoolTotalPages) {
      setSchoolCurrentPage(pN);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-800">
      
      {/* Top Navbar */}
      <nav className="fixed top-0 left-0 right-0 h-16 bg-gradient-to-r from-sky-600 to-indigo-700 text-white flex items-center justify-between px-4 sm:px-6 shadow-md z-40">
        <div className="flex items-center gap-2.5">
          <button 
            type="button"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 block "
          >
            <ChevronLeft className={`w-5 h-5 transition-transform ${sidebarOpen ? '' : 'rotate-180'}`} />
          </button>
          <div className="flex items-center gap-2">
            <SchoolIcon className="w-5 h-5 text-sky-200" />
            <span className="font-extrabold tracking-tight text-sm sm:text-base">MKKS Pasirwangi Admin</span>
          </div>
        </div>

        {/* Profile Dropdown & Logout button */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => {
                setAdminNameInput(adminProfile.nama);
                setAdminFotoInput(adminProfile.foto);
                setProfileModalOpen(true);
              }}
              className="flex items-center gap-2 p-1 px-2.5 bg-white/10 hover:bg-white/15 rounded-full transition text-xs font-semibold hover:border-white/35 border border-transparent cursor-pointer"
            >
              <img 
                src={adminProfile.foto} 
                alt="Profile photo" 
                className="w-7 h-7 rounded-full object-cover border border-white/20 shrink-0" 
              />
              <span className="hidden sm:inline text-white truncate max-w-28">{adminProfile.nama}</span>
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
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block px-3 mb-2">Navigasi Utama</span>
              
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all font-medium text-xs text-left cursor-pointer ${activeTab === 'dashboard' ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/10 font-bold' : 'hover:bg-slate-800 text-slate-300'}`}
              >
                <BarChart className="w-4 h-4" />
                <span>Dashboard</span>
              </button>

              <button
                onClick={() => setActiveTab('kelembagaan')}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all font-medium text-xs text-left cursor-pointer ${activeTab === 'kelembagaan' ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/10 font-bold' : 'hover:bg-slate-800 text-slate-300'}`}
              >
                <SchoolIcon className="w-4 h-4" />
                <span>Kelembagaan</span>
              </button>

              <button
                onClick={() => setActiveTab('about')}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all font-medium text-xs text-left cursor-pointer ${activeTab === 'about' ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/10 font-bold' : 'hover:bg-slate-800 text-slate-300'}`}
              >
                <Info className="w-4 h-4" />
                <span>About MKKS</span>
              </button>

              <button
                onClick={() => setActiveTab('agenda')}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all font-medium text-xs text-left cursor-pointer ${activeTab === 'agenda' ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/10 font-bold' : 'hover:bg-slate-800 text-slate-300'}`}
              >
                <CalendarIcon className="w-4 h-4" />
                <span>Agenda Rapat</span>
              </button>

              <button
                onClick={() => setActiveTab('program')}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all font-medium text-xs text-left cursor-pointer ${activeTab === 'program' ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/10 font-bold' : 'hover:bg-slate-800 text-slate-300'}`}
              >
                <FileText className="w-4 h-4" />
                <span>Program Kerja</span>
              </button>

              <button
                onClick={() => setActiveTab('galeri')}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all font-medium text-xs text-left cursor-pointer ${activeTab === 'galeri' ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/10 font-bold' : 'hover:bg-slate-800 text-slate-300'}`}
              >
                <ImageIcon className="w-4 h-4" />
                <span>Galeri Kegiatan</span>
              </button>

              <button
                onClick={() => setActiveTab('files')}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all font-medium text-xs text-left cursor-pointer ${activeTab === 'files' ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/10 font-bold' : 'hover:bg-slate-800 text-slate-300'}`}
              >
                <FolderOpen className="w-4 h-4 text-sky-400" />
                <span className="font-extrabold text-sky-300">File Digital</span>
              </button>

              <button
                onClick={() => setActiveTab('helpdesk')}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all font-medium text-xs text-left cursor-pointer ${activeTab === 'helpdesk' ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/10 font-bold' : 'hover:bg-slate-800 text-emerald-400/90'}`}
              >
                <div className="relative">
                  <MessageSquare className="w-4 h-4" />
                  <span className="absolute -top-1 -right-1 w-2 h-2 bg-rose-555 bg-rose-500 rounded-full animate-pulse"></span>
                </div>
                <span className="font-extrabold text-emerald-400 md:text-emerald-355 transition">Help Desk (Chat)</span>
              </button>

              <button
                onClick={() => setActiveTab('sekretariat')}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all font-medium text-xs text-left cursor-pointer ${activeTab === 'sekretariat' ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/10 font-bold' : 'hover:bg-slate-800 text-slate-300'}`}
              >
                <MapPin className="w-4 h-4" />
                <span>Sekretariat</span>
              </button>

              <button
                onClick={() => setActiveTab('user')}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all font-medium text-xs text-left cursor-pointer ${activeTab === 'user' ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/10 font-bold' : 'hover:bg-slate-800 text-slate-300'}`}
              >
                <Settings className="w-4 h-4" />
                <span>Pengaturan User</span>
              </button>

              <button
                onClick={() => setActiveTab('supabase')}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all font-medium text-xs text-left cursor-pointer ${activeTab === 'supabase' ? 'bg-emerald-600 text-white shadow-md' : 'hover:bg-slate-800 text-emerald-400'}`}
              >
                <Database className="w-4 h-4" />
                <span className="font-extrabold">Integrasi Supabase</span>
              </button>
            </div>

            <div className="pt-4 border-t border-slate-800">
              <div className="flex items-center gap-2 p-2 bg-slate-950/40 rounded-xl">
                <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-ping"></div>
                <span className="text-[10px] text-slate-400 font-bold">AKSES ADMIN GLOBAL</span>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className={`flex-1 min-w-0 transition-all duration-300 p-4 sm:p-6 ${sidebarOpen ? 'pl-4 sm:pl-6 bg-slate-50 md:ml-64' : 'ml-0'}`}>
          
          {/* TAB 1: DASHBOARD METRICS, CHARTS & CALENDAR */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <div>
                  <h1 className="text-xl font-black text-slate-900 tracking-tight">Dashboard Ringkasan</h1>
                  <p className="text-xs text-slate-500">Analisis metrik kelembagaan program kerja MKKS SD Pasirwangi</p>
                </div>
              </div>

              {/* Colorful metric cards - Redirects tab on click! */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                
                {/* Total Sekolah card - Royal Blue */}
                <button
                  onClick={() => setActiveTab('kelembagaan')}
                  className="bg-indigo-600 text-white rounded-2xl p-5 shadow-xl hover:-translate-y-1 transition duration-300 text-left cursor-pointer"
                >
                  <div className="flex justify-between items-start">
                    <div className="p-2.5 bg-white/10 rounded-xl"><SchoolIcon className="w-6 h-6" /></div>
                    <span className="text-3xl font-extrabold">{totalSchoolsCount}</span>
                  </div>
                  <h3 className="text-sm font-bold mt-4">Jumlah Sekolah</h3>
                  <p className="text-[10px] text-indigo-200">Klik untuk kelola data lembaga</p>
                </button>

                {/* Total Kepala Sekolah card - Teal */}
                <button
                  onClick={() => setActiveTab('kelembagaan')}
                  className="bg-teal-600 text-white rounded-2xl p-5 shadow-xl hover:-translate-y-1 transition duration-300 text-left cursor-pointer"
                >
                  <div className="flex justify-between items-start">
                    <div className="p-2.5 bg-white/10 rounded-xl"><Users className="w-6 h-6" /></div>
                    <span className="text-3xl font-extrabold">{totalKsCount}</span>
                  </div>
                  <h3 className="text-sm font-bold mt-4">Jumlah Kepala Sekolah</h3>
                  <p className="text-[10px] text-teal-100">Jumlah pimpinan aktif</p>
                </button>

                {/* Total User card - Orange */}
                <button
                  onClick={() => setActiveTab('user')}
                  className="bg-orange-600 text-white rounded-2xl p-5 shadow-xl hover:-translate-y-1 transition duration-300 text-left cursor-pointer"
                >
                  <div className="flex justify-between items-start">
                    <div className="p-2.5 bg-white/10 rounded-xl"><Users className="w-6 h-6" /></div>
                    <span className="text-3xl font-extrabold">{totalUsersCount}</span>
                  </div>
                  <h3 className="text-sm font-bold mt-4">Jumlah User</h3>
                  <p className="text-[10px] text-orange-150">Akses user & pengaturan</p>
                </button>

                {/* Total Agenda card - Purple / Violet */}
                <button
                  onClick={() => setActiveTab('agenda')}
                  className="bg-fuchsia-700 text-white rounded-2xl p-5 shadow-xl hover:-translate-y-1 transition duration-300 text-left cursor-pointer"
                >
                  <div className="flex justify-between items-start">
                    <div className="p-2.5 bg-white/10 rounded-xl"><CalendarIcon className="w-6 h-6" /></div>
                    <span className="text-3xl font-extrabold">{totalAgendasCount}</span>
                  </div>
                  <h3 className="text-sm font-bold mt-4">Jumlah Agenda</h3>
                  <p className="text-[10px] text-fuchsia-200">Kelola jadwal rapat dsb</p>
                </button>
              </div>

              {/* Charts Display grid & Calendar side-by-side */}
              <div className="grid lg:grid-cols-12 gap-6">
                
                {/* Visual SVG interactive Pie/Doughnut charts */}
                <div className="lg:col-span-8 bg-white border border-slate-200 p-5 rounded-2xl shadow-sm space-y-5">
                  <div className="border-b border-slate-100 pb-2 flex justify-between items-center">
                    <div>
                      <h3 className="font-extrabold text-slate-800 text-xs sm:text-sm">Statistik Capaian & Agenda</h3>
                      <p className="text-[10px] text-slate-500">Pencapaian program kerja dan realisasi musyawarah</p>
                    </div>
                    <span className="bg-sky-50 text-indigo-600 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">Metrik Juni 2026</span>
                  </div>

                  {/* SVG Pie & Doughnut charts */}
                  <div className="grid sm:grid-cols-2 gap-6 pt-2">
                    {/* Doughnut Chart: Capaian Program vs Sisa */}
                    <div className="flex flex-col items-center p-3 border border-slate-100 rounded-xl text-center bg-slate-50/50">
                      <span className="font-bold text-xs text-slate-700 mb-3">Realisasi Program Kerja & Agenda</span>
                      
                      <div className="relative w-36 h-36 flex items-center justify-center">
                        {/* SVG circle rendering */}
                        <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                          {/* Inner / Gray Base circle */}
                          <circle cx="50" cy="50" r="38" fill="transparent" stroke="#e2e8f0" strokeWidth="12" />
                          {/* Segment 1: Capaian program (Teal) - 85% */}
                          <circle cx="50" cy="50" r="38" fill="transparent" stroke="#0d9488" strokeWidth="12"
                            strokeDasharray="238.7" strokeDashoffset="35.8" />
                          {/* Segment 2: Realisasi Agenda (Indigo) - 68% */}
                          <circle cx="50" cy="50" r="24" fill="transparent" stroke="#e2e8f0" strokeWidth="8" />
                          <circle cx="50" cy="50" r="24" fill="transparent" stroke="#4f46e5" strokeWidth="8"
                            strokeDasharray="150.7" strokeDashoffset="48.2" />
                        </svg>
                        
                        <div className="absolute text-center">
                          <span className="block text-base font-extrabold text-teal-700">85%</span>
                          <span className="text-[9px] text-indigo-500 font-bold">Capai</span>
                        </div>
                      </div>

                      <div className="flex gap-4 mt-4 text-[10px] font-bold">
                        <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-teal-600 rounded"></span><span>Program (85%)</span></div>
                        <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-indigo-600 rounded"></span><span>Agenda (68%)</span></div>
                      </div>
                    </div>

                    {/* Pie Chart: User Aktif vs Registered */}
                    <div className="flex flex-col items-center p-3 border border-slate-100 rounded-xl text-center bg-slate-50/50">
                      <span className="font-bold text-xs text-slate-700 mb-3">Rasio User Aktif di Sistem</span>
                      
                      <div className="relative w-36 h-36 flex items-center justify-center">
                        <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                          {/* Total 100% equivalent to 100 of stroke length */}
                          {/* Segment 1: User Aktif (Amber) - 92% */}
                          <circle cx="50" cy="50" r="38" fill="transparent" stroke="#ea580c" strokeWidth="16"
                            strokeDasharray="238.7" strokeDashoffset="19.1" />
                          {/* Segment 2: User Inaktif (Slate) - 8% */}
                          <circle cx="50" cy="50" r="38" fill="transparent" stroke="#94a3b8" strokeWidth="16"
                            strokeDasharray="238.7" strokeDashoffset="238.7" />
                        </svg>
                        
                        <div className="absolute text-center">
                          <span className="block text-base font-extrabold text-orange-600">92%</span>
                          <span className="text-[9px] text-slate-500 font-bold">Aktif</span>
                        </div>
                      </div>

                      <div className="flex gap-4 mt-4 text-[10px] font-bold">
                        <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-orange-600 rounded"></span><span>User Aktif (92%)</span></div>
                        <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-slate-400 rounded"></span><span>Inaktif (8%)</span></div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Calendar Grid on the right */}
                <div className="lg:col-span-4 bg-white border border-slate-200 p-5 rounded-2xl shadow-sm flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-3">
                      <span className="font-black text-xs sm:text-sm text-slate-900">Agenda Kalender</span>
                      <div className="flex items-center gap-1">
                        <button onClick={prevMonth} className="p-1 hover:bg-slate-100 rounded"><ChevronLeft className="w-4 h-4" /></button>
                        <span className="text-[11px] font-bold uppercase text-indigo-600">{monthNames[currentCalMonth]} {currentCalYear}</span>
                        <button onClick={nextMonth} className="p-1 hover:bg-slate-100 rounded"><ChevronRight className="w-4 h-4" /></button>
                      </div>
                    </div>

                    <div className="grid grid-cols-7 text-center text-[10px] font-bold text-slate-400 mb-1.5">
                      {weekdays.map(w => <div key={w}>{w}</div>)}
                    </div>

                    <div className="grid grid-cols-7 gap-1 text-center text-[11px]">
                      {calendarCells.map((day, idx) => {
                        if (day === null) return <div key={`empty-${idx}`} className="p-1 px-1.5"></div>;
                        
                        // Check if this day has a scheduled meeting (by comparing month/day/year)
                        // Mock highlight days 15 and 22 as agendas out-of-the-box
                        const isMeetingDay = (currentCalMonth === 5 && (day === 15 || day === 22));
                        
                        return (
                          <div 
                            key={`day-${day}`} 
                            className={`p-1 font-semibold rounded-lg ${isMeetingDay ? 'bg-indigo-600 font-black text-white shadow shadow-indigo-300' : 'text-slate-700 hover:bg-slate-100'}`}
                            title={isMeetingDay ? 'Rapat MKKS' : ''}
                          >
                            {day}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="mt-4 pt-3.5 border-t border-slate-100 text-[10px] space-y-1.5 text-slate-500 font-medium">
                    <span className="block font-bold text-slate-800 text-xs">Jadwal Agenda Bulan Ini</span>
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-indigo-600"></span>
                      <span>Senin, 15 Juni: Rakor PAS (Aula SDN 1)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-indigo-600"></span>
                      <span>Senin, 22 Juni: Sosialisasi BOSP 2026 (PGRI)</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: KELEMBAGAAN */}
          {activeTab === 'kelembagaan' && (
            <div className="space-y-6">
              
              {/* Header */}
              <div className="border-b border-slate-200 pb-3">
                <h1 className="text-xl font-black text-slate-900 tracking-tight">Manajemen Kelembagaan SD</h1>
                <p className="text-xs text-slate-500">Kelola rincian data unit sekolah, NPSN, dan nama Kepala Sekolah aktif</p>
              </div>

              {/* Form Input Data Kelembagaan */}
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-2 mb-4">
                  {editSchoolId ? 'Edit Data Sekolah' : 'Input Data Sekolah Baru'}
                </h3>
                
                <form onSubmit={handleSaveSchool} className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Nama Sekolah Dasar *</label>
                    <input
                      type="text"
                      required
                      placeholder="Contoh: SDN 1 Pasirwangi"
                      value={schoolNama}
                      onChange={(e) => setSchoolNama(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:border-indigo-500 focus:outline-none focus:bg-white text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">NPSN (Nomor Pokok Sekolah Nasional) *</label>
                    <input
                      type="text"
                      required
                      placeholder="Contoh: 20224101"
                      value={schoolNpsn}
                      onChange={(e) => setSchoolNpsn(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:border-indigo-500 focus:outline-none focus:bg-white text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Nama Kepala Sekolah *</label>
                    <input
                      type="text"
                      required
                      placeholder="Contoh: Drs. Agus Mulyana"
                      value={schoolNamaKS}
                      onChange={(e) => setSchoolNamaKS(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:border-indigo-500 focus:outline-none focus:bg-white text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">NIP Kepala Sekolah</label>
                    <input
                      type="text"
                      placeholder="Contoh: 197108231996041001"
                      value={schoolNipKS}
                      onChange={(e) => setSchoolNipKS(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:border-indigo-500 focus:outline-none focus:bg-white text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Status Kepala Sekolah</label>
                    <select
                      value={schoolStatusKS}
                      onChange={(e) => setSchoolStatusKS(e.target.value as 'Definitif' | 'PLT')}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:border-indigo-500 focus:outline-none focus:bg-white text-xs cursor-pointer"
                    >
                      <option value="Definitif">Definitif</option>
                      <option value="PLT">PLT (Pelaksana Tugas)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Pas Foto Kepala Sekolah (Upload)</label>
                    <div className="flex items-center gap-2">
                      <label className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-xl border border-slate-300 cursor-pointer text-[11px] whitespace-nowrap active:scale-95 transition">
                        <Upload className="w-3.5 h-3.5" />
                        <span>Pilih Foto</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handlePhotoUpload(e, setSchoolFotoKS)}
                          className="hidden"
                        />
                      </label>
                      {schoolFotoKS ? (
                        <div className="relative shrink-0 border border-sky-400 p-0.5 rounded-lg bg-teal-50">
                          <img src={schoolFotoKS} className="w-8 h-8 rounded-md object-cover" alt="mini-preview" />
                          <button 
                            type="button" 
                            onClick={() => setSchoolFotoKS('')}
                            className="absolute -top-1 -right-1 bg-red-500 rounded-full text-white p-0.5"
                          >
                            <X className="w-2.5 h-2.5" />
                          </button>
                        </div>
                      ) : (
                        <span className="text-[10px] text-slate-400">Belum ada foto</span>
                      )}
                    </div>
                  </div>

                  <div className="sm:col-span-2 md:col-span-3 pt-2.5 flex justify-end gap-2">
                    {editSchoolId && (
                      <button
                        type="button"
                        onClick={() => {
                          setEditSchoolId(null);
                          setSchoolNama('');
                          setSchoolNpsn('');
                          setSchoolNamaKS('');
                          setSchoolNipKS('');
                          setSchoolStatusKS('Definitif');
                          setSchoolFotoKS('');
                        }}
                        className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold cursor-pointer transition active:scale-95"
                      >
                        Batal Edit
                      </button>
                    )}
                    <button
                      type="submit"
                      className="px-6 py-2 bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-600 hover:to-indigo-700 text-white rounded-xl font-bold cursor-pointer transition active:scale-95"
                    >
                      {editSchoolId ? 'Simpan Perubahan' : 'Tambahkan Lembaga'}
                    </button>
                  </div>
                </form>
              </div>

              {/* Data Table with Search and Pagination */}
              <div className="bg-white border border-slate-200 rounded-2xl shadow-sm text-xs overflow-hidden">
                
                {/* Excel Template & Data Integration Action Group */}
                <div className="px-5 py-4 bg-gradient-to-r from-emerald-50/40 to-teal-50/20 border-b border-slate-200 flex flex-col md:flex-row md:items-center gap-4 text-xs justify-between">
                  <div className="space-y-1">
                    <span className="font-extrabold text-slate-800 flex items-center gap-2 text-sm leading-none">
                      <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
                      Sistem Integrasi Spreadsheet & Excel
                    </span>
                    <p className="text-[11px] text-slate-500 font-medium">Unduh template kolom resmi, isi di Excel/Sheets, lalu unggah untuk pemutakhiran data masal instan.</p>
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-2.5">
                    <button
                      type="button"
                      onClick={handleDownloadTemplate}
                      className="flex items-center gap-1.5 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-xs transition active:scale-95 cursor-pointer text-[11px]"
                      title="Download format CSV / Excel dengan header yang sesuai"
                    >
                      <Download className="w-4 h-4" />
                      <span>Download Template Excel</span>
                    </button>
                    
                    <label className="flex items-center gap-1.5 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-xs transition active:scale-95 cursor-pointer text-[11px]">
                      <Upload className="w-4 h-4" />
                      <span>Import Data Massal</span>
                      <input
                        type="file"
                        accept=".xlsx,.xls"
                        className="hidden"
                        onChange={handleImportExcel}
                      />
                    </label>
                  </div>
                </div>

                {/* Search Bar block */}
                <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div className="relative w-full sm:max-w-xs">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <Search className="w-4 h-4" />
                    </span>
                    <input
                      type="text"
                      value={schoolSearchQuery}
                      onChange={(e) => {
                        setSchoolSearchQuery(e.target.value);
                        setSchoolCurrentPage(1); // Reset to page 1 on search
                      }}
                      placeholder="Cari NPSN atau Nama Sekolah..."
                      className="w-full pl-9 pr-4 py-2 bg-white border border-slate-300 rounded-xl focus:outline-none focus:border-indigo-500 text-xs shadow-inner"
                    />
                  </div>
                  <span className="text-[11px] font-bold text-slate-500 block">Menampilkan {filteredSchools.length} Sekolah Dasar</span>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-100 text-slate-700 font-extrabold border-b border-slate-200">
                        <th className="py-3 px-4">#</th>
                        <th className="py-3 px-4">Foto</th>
                        <th className="py-3 px-4">Nama Sekolah & NPSN</th>
                        <th className="py-3 px-4">Identitas Kepala Sekolah</th>
                        <th className="py-3 px-4 text-center">Status KS</th>
                        <th className="py-3 px-4 text-right">Aksi Operasi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                      {currentSchoolsList.length > 0 ? (
                        currentSchoolsList.map((sc, index) => (
                          <tr key={sc.id} className="hover:bg-slate-50/50 transition">
                            <td className="py-3 px-4 font-bold text-slate-500">{indexFirstSchool + index + 1}</td>
                            <td className="py-3 px-4">
                              <div className="relative w-11 h-11 group/img rounded-lg overflow-hidden border border-slate-200 shadow-xs cursor-pointer select-none" title="Klik untuk ganti foto langsung">
                                <img 
                                  src={sc.fotoKS || 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=120&auto=format'} 
                                  alt="Foto KS" 
                                  className="w-full h-full object-cover transition-transform duration-200 group-hover/img:scale-105"
                                />
                                <label className="absolute inset-0 bg-slate-900/75 opacity-0 group-hover/img:opacity-100 flex flex-col items-center justify-center text-[8px] text-white font-extrabold transition-all duration-150 cursor-pointer">
                                  <Camera className="w-4 h-4 text-emerald-400 mb-0.5" />
                                  <span className="scale-90">EDIT</span>
                                  <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => handleDirectPhotoUpload(e, sc.id)}
                                    className="hidden"
                                  />
                                </label>
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <span className="block font-bold text-slate-900 leading-tight">{sc.namaSekolah}</span>
                              <span className="text-[10px] font-mono text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded-md mt-1 inline-block">NPSN: {sc.npsn}</span>
                            </td>
                            <td className="py-3 px-4">
                              <span className="block font-bold text-slate-800">{sc.namaKS}</span>
                              <span className="text-[10px] text-slate-500 block">NIP: {sc.nipKS || '-'}</span>
                            </td>
                            <td className="py-3 px-4 text-center">
                              <span className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold ${sc.statusKS === 'Definitif' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'}`}>
                                {sc.statusKS}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  onClick={() => handleViewSchool(sc)}
                                  className="p-1.5 hover:bg-sky-50 text-sky-600 rounded-lg transition"
                                  title="Lihat Detail"
                                >
                                  <Eye className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => startEditSchool(sc)}
                                  className="p-1.5 hover:bg-amber-50 text-amber-600 rounded-lg transition"
                                  title="Ubah Data"
                                >
                                  <Edit2 className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => triggerDelete(sc.id, 'school')}
                                  className="p-1.5 hover:bg-rose-50 text-rose-600 rounded-lg transition"
                                  title="Hapus Data"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={6} className="text-center py-10 text-slate-400 font-medium">Data sekolah tidak ditemukan</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {schoolTotalPages > 1 && (
                  <div className="p-4 border-t border-slate-100 flex items-center justify-between bg-slate-50/50">
                    <span className="text-[11px] text-slate-500 font-semibold">
                      Halaman {schoolCurrentPage} dari {schoolTotalPages}
                    </span>
                    <div className="flex gap-1.5">
                      <button
                        onClick={() => changeSchoolPage(schoolCurrentPage - 1)}
                        disabled={schoolCurrentPage === 1}
                        className="py-1 px-2.5 rounded border border-slate-200 bg-white hover:bg-slate-100 text-slate-600 outline-none disabled:opacity-50 font-bold transition flex items-center gap-1 cursor-pointer"
                      >
                        <ChevronLeft className="w-3.5 h-3.5" />
                        <span>Sebelumnya</span>
                      </button>
                      
                      {/* Generates numbered buttons */}
                      {Array.from({ length: schoolTotalPages }, (_, i) => i + 1).map(n => (
                        <button
                          key={n}
                          onClick={() => changeSchoolPage(n)}
                          className={`w-7 h-7 rounded text-[11px] font-bold ${schoolCurrentPage === n ? 'bg-indigo-600 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'}`}
                        >
                          {n}
                        </button>
                      ))}

                      <button
                        onClick={() => changeSchoolPage(schoolCurrentPage + 1)}
                        disabled={schoolCurrentPage === schoolTotalPages}
                        className="py-1 px-2.5 rounded border border-slate-200 bg-white hover:bg-slate-100 text-slate-600 outline-none disabled:opacity-50 font-bold transition flex items-center gap-1 cursor-pointer"
                      >
                        <span>Selanjutnya</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: ABOUT MKKS */}
          {activeTab === 'about' && (
            <div className="space-y-6">
              <div className="border-b border-slate-200 pb-3">
                <h1 className="text-xl font-black text-slate-900 tracking-tight">Pengaturan Dokumen & Visi Misi MKKS</h1>
                <p className="text-xs text-slate-500">Sesuaikan deskripsi visi misi beserta banner yang tampil pada Landing Page utama</p>
              </div>

              <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-sm">
                <form onSubmit={handleSaveAbout} className="space-y-4 text-xs">
                  <div>
                    <label className="block text-slate-705 font-bold mb-1 uppercase tracking-wider">Deskripsi Singkat MKKS Pasirwangi *</label>
                    <textarea
                      required
                      rows={3}
                      value={aboutDeskripsi}
                      onChange={(e) => setAboutDeskripsi(e.target.value)}
                      placeholder="Masukkan deskripsi profil organisasi..."
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:border-indigo-500 focus:outline-none focus:bg-white text-xs leading-relaxed"
                    />
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-slate-705 font-bold mb-1 uppercase tracking-wider">Visi Organisasi *</label>
                      <textarea
                        required
                        rows={3}
                        value={aboutVisi}
                        onChange={(e) => setAboutVisi(e.target.value)}
                        placeholder="Masukkan pernyataan visi..."
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:border-indigo-500 focus:outline-none focus:bg-white text-xs leading-relaxed"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-705 font-bold mb-1 uppercase tracking-wider">Misi Organisasi *</label>
                      <textarea
                        required
                        rows={3}
                        value={aboutMisi}
                        onChange={(e) => setAboutMisi(e.target.value)}
                        placeholder="Masukkan butir misi kepengurusan..."
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:border-indigo-500 focus:outline-none focus:bg-white text-xs leading-relaxed"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-705 font-bold mb-1 uppercase tracking-wider">Foto Profil MKKS (Unggah dari direktori)</label>
                    <div className="flex items-center gap-3">
                      <label className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl border border-slate-300 cursor-pointer text-xs transition active:scale-95">
                        <Upload className="w-4 h-4" />
                        <span>Pilih Foto Organisasi</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handlePhotoUpload(e, setAboutFoto)}
                          className="hidden"
                        />
                      </label>
                      {aboutFoto ? (
                        <div className="relative border border-sky-400 p-0.5 rounded-xl bg-teal-50 shrink-0">
                          <img src={aboutFoto} className="w-16 h-10 object-cover rounded-lg" alt="organisation banner" />
                          <button 
                            type="button" 
                            onClick={() => setAboutFoto('')}
                            className="absolute -top-1.5 -right-1.5 bg-red-500 rounded-full text-white p-0.5 shadow-inner"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <span className="text-slate-400 text-[10px]">Belum diunggah</span>
                      )}
                    </div>
                  </div>

                  <div className="pt-2 flex justify-end">
                    <button
                      type="submit"
                      className="px-6 py-2.5 bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-600 hover:to-indigo-700 text-white rounded-xl font-bold cursor-pointer transition active:scale-95 text-xs inline-flex items-center gap-1.5 shadow"
                    >
                      <Check className="w-4 h-4" />
                      <span>Simpan Rincian Visi Misi</span>
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* TAB 4: AGENDA RAPAT */}
          {activeTab === 'agenda' && (
            <div className="space-y-6">
              <div className="border-b border-slate-200 pb-3">
                <h1 className="text-xl font-black text-slate-900 tracking-tight">Agenda Kegiatan & Rapat MKKS</h1>
                <p className="text-xs text-slate-500">Entri agenda kepengarahan, rapat koordinasi, beserta lampiran PDF dokumen surat undangan</p>
              </div>

              {/* Form Input Agenda */}
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm text-xs">
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-2 mb-4">
                  {editAgendaId ? 'Modifikasi Agenda Rapat' : 'Tambah Agenda Rapat Baru'}
                </h3>

                <form onSubmit={handleSaveAgenda} className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-slate-700 font-bold mb-1">Judul / Tajuk Agenda *</label>
                    <input
                      type="text"
                      required
                      placeholder="Contoh: Rapat Pleno Koordinasi Pemantapan Pihak Sekolah Dasar Semester II"
                      value={agendaJudul}
                      onChange={(e) => setAgendaJudul(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:border-indigo-500 focus:outline-none focus:bg-white text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Waktu Kegiatan *</label>
                    <input
                      type="datetime-local"
                      required
                      value={agendaWaktu}
                      onChange={(e) => setAgendaWaktu(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:border-indigo-500 focus:outline-none focus:bg-white text-xs"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-slate-700 font-bold mb-1">Tempat Penyelenggaraan *</label>
                    <input
                      type="text"
                      required
                      placeholder="Contoh: Aula Serbaguna PGRI Pasirwangi, Lt 2"
                      value={agendaTempat}
                      onChange={(e) => setAgendaTempat(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:border-indigo-500 focus:outline-none focus:bg-white text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Lampiran File Surat / Undangan (PDF)</label>
                    <div className="flex items-center gap-2">
                      <label className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl border border-slate-300 cursor-pointer text-xs transition active:scale-95">
                        <Upload className="w-3.5 h-3.5" />
                        <span>Pilih PDF</span>
                        <input
                          type="file"
                          accept="application/pdf,application/msword"
                          onChange={(e) => {
                            const f = e.target.files?.[0];
                            if (f) {
                              setAgendaDocName(f.name);
                              // Simple Mock reader block
                              const r = new FileReader();
                              r.onload = (re => {
                                if (re.target?.result) setAgendaDocData(re.target.result as string);
                              });
                              r.readAsDataURL(f);
                            }
                          }}
                          className="hidden"
                        />
                      </label>
                      <span className="text-[10px] text-slate-400 truncate max-w-[120px]">
                        {agendaDocName || 'Belum ada surat'}
                      </span>
                    </div>
                  </div>

                  <div className="sm:col-span-2 lg:col-span-3 pt-2.5 flex justify-end gap-2">
                    {editAgendaId && (
                      <button
                        type="button"
                        onClick={() => {
                          setEditAgendaId(null);
                          setAgendaJudul('');
                          setAgendaWaktu('');
                          setAgendaTempat('');
                          setAgendaDocName('');
                          setAgendaDocData('');
                        }}
                        className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold transition active:scale-95"
                      >
                        Batal
                      </button>
                    )}
                    <button
                      type="submit"
                      className="px-6 py-2 bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-600 hover:to-indigo-700 text-white rounded-xl font-bold transition active:scale-95"
                    >
                      {editAgendaId ? 'Simpan Kegiatan' : 'Tambahkan Agenda'}
                    </button>
                  </div>
                </form>
              </div>

              {/* Agenda list table */}
              <div className="bg-white border border-slate-200 rounded-2xl shadow-sm text-xs overflow-hidden">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-100 text-slate-700 font-extrabold border-b border-slate-200">
                      <th className="py-3 px-4 w-12">#</th>
                      <th className="py-3 px-4">Judul Kegiatan & Lampiran</th>
                      <th className="py-3 px-4">Tempat Rapat</th>
                      <th className="py-3 px-4">Waktu Mulai</th>
                      <th className="py-3 px-4 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {agendas.length > 0 ? (
                      agendas.map((ag, index) => (
                        <tr key={ag.id} className="hover:bg-slate-50/50">
                          <td className="py-3 px-4 font-bold text-slate-500">{index + 1}</td>
                          <td className="py-3 px-4">
                            <span className="block font-bold text-slate-900 leading-tight">{ag.judul}</span>
                            {ag.namaDokumen && (
                              <span className="text-[10px] text-teal-600 bg-teal-50 border border-teal-100 px-1.5 py-0.5 rounded inline-block mt-1">Undangan: {ag.namaDokumen}</span>
                            )}
                          </td>
                          <td className="py-3 px-4 font-medium">{ag.tempat}</td>
                          <td className="py-3 px-4 text-slate-500">{new Date(ag.waktu).toLocaleString('id-ID')}</td>
                          <td className="py-3 px-4 text-right">
                            <div className="flex justify-end gap-1.5">
                              <button
                                onClick={() => handleViewAgenda(ag)}
                                className="p-1.5 hover:bg-sky-50 text-sky-600 rounded-lg"
                                title="Pratinjau Agenda"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => startEditAgenda(ag)}
                                className="p-1.5 hover:bg-amber-50 text-amber-600 rounded-lg"
                                title="Sunting Agenda"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => triggerDelete(ag.id, 'agenda')}
                                className="p-1.5 hover:bg-rose-50 text-rose-600 rounded-lg"
                                title="Hapus Agenda"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="text-center py-10 text-slate-400 font-medium">Belum ada agenda terdaftar</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 5: PROGRAM KERJA */}
          {activeTab === 'program' && (
            <div className="space-y-6">
              <div className="border-b border-slate-200 pb-3">
                <h1 className="text-xl font-black text-slate-900 tracking-tight">Program Kerja Pembinaan MKKS</h1>
                <p className="text-xs text-slate-500">Formulasi butun serta rincian program kerja jangka menengah dan panjang</p>
              </div>

              {/* Form Program Kerja */}
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm text-xs">
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-2 mb-4">
                  {editProgramId ? 'Sunting Program Kerja' : 'Input Program Kerja Baru'}
                </h3>

                <form onSubmit={handleSaveProgram} className="space-y-3">
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Judul / Pilar Program Kerja *</label>
                    <input
                      type="text"
                      required
                      placeholder="Contoh: Pembinaan Standar ISO Pengadministrasian Lembaga Pendidikan Dasar"
                      value={programJudul}
                      onChange={(e) => setProgramJudul(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:border-indigo-500 focus:outline-none focus:bg-white text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Butir Uraian Isi Program Kerja *</label>
                    <textarea
                      required
                      rows={4}
                      placeholder="Masukkan detail pelaksanaan dan target capaian..."
                      value={programIsi}
                      onChange={(e) => setProgramIsi(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:border-indigo-500 focus:outline-none focus:bg-white text-xs leading-relaxed"
                    />
                  </div>

                  <div className="pt-2 flex justify-end gap-1.5">
                    {editProgramId && (
                      <button
                        type="button"
                        onClick={() => {
                          setEditProgramId(null);
                          setProgramJudul('');
                          setProgramIsi('');
                        }}
                        className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold transition active:scale-95"
                      >
                        Batal
                      </button>
                    )}
                    <button
                      type="submit"
                      className="px-6 py-2 bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-600 hover:to-indigo-700 text-white rounded-xl font-bold transition active:scale-95"
                    >
                      {editProgramId ? 'Simpan Perubahan' : 'Tambahkan Program'}
                    </button>
                  </div>
                </form>
              </div>

              {/* Table Program Kerja */}
              <div className="bg-white border border-slate-200 rounded-2xl shadow-sm text-xs overflow-hidden">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-100 text-slate-700 font-extrabold border-b border-slate-200">
                      <th className="py-3 px-4 w-12">#</th>
                      <th className="py-3 px-4">Pilar Program</th>
                      <th className="py-3 px-4">Uraian Isi Detail Program</th>
                      <th className="py-3 px-4 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {programs.map((p, index) => (
                      <tr key={p.id} className="hover:bg-slate-50/50">
                        <td className="py-3 px-4 font-bold text-slate-500">{index + 1}</td>
                        <td className="py-3 px-4 font-bold text-slate-900">{p.judulProgram}</td>
                        <td className="py-3 px-4 text-slate-500 leading-relaxed whitespace-pre-wrap">{p.isiProgram}</td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex justify-end gap-1.5">
                            <button
                              onClick={() => startEditProgram(p)}
                              className="p-1.5 hover:bg-amber-50 text-amber-600 rounded-lg"
                              title="Edit"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => triggerDelete(p.id, 'program')}
                              className="p-1.5 hover:bg-rose-50 text-rose-600 rounded-lg"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB: GALERI KEGIATAN */}
          {activeTab === 'galeri' && (
            <div className="space-y-6">
              <div className="border-b border-slate-200 pb-3">
                <h1 className="text-xl font-black text-slate-900 tracking-tight">Kelola Galeri Kegiatan MKKS</h1>
                <p className="text-xs text-slate-500">Tambahkan, ubah, atau hapus dokumentasi foto beserta judul kegiatan untuk dipublikasikan di halaman landing page utama.</p>
              </div>

              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm text-xs">
                <span className="block text-slate-900 font-extrabold text-[13px] uppercase tracking-wider border-b border-slate-150 pb-2 mb-4">
                  {editGaleriId ? '✏️ Edit Dokumentasi Kegiatan' : '➕ Tambah Kegiatan Baru'}
                </span>

                <form onSubmit={handleSaveGaleri} className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-slate-700 font-bold mb-1 uppercase tracking-wider">Judul Kegiatan *</label>
                      <input
                        type="text"
                        required
                        value={galeriJudul}
                        onChange={(e) => setGaleriJudul(e.target.value)}
                        placeholder="Contoh: Rapat Pleno Kerja MKKS Semester 1"
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:border-indigo-500 focus:outline-none focus:bg-white text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-700 font-bold mb-1 uppercase tracking-wider">Tanggal Kegiatan (Opsional)</label>
                      <input
                        type="date"
                        value={galeriTanggal}
                        onChange={(e) => setGaleriTanggal(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:border-indigo-500 focus:outline-none focus:bg-white text-xs"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-700 font-bold mb-1 uppercase tracking-wider">Foto Kegiatan (Base64 / URL Foto) *</label>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <input
                          type="text"
                          required
                          value={galeriFoto}
                          onChange={(e) => setGaleriFoto(e.target.value)}
                          placeholder="Masukkan tautan gambar, atau gunakan uploader di samping..."
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:border-indigo-500 focus:outline-none focus:bg-white text-xs"
                        />
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => setGaleriFoto('https://images.unsplash.com/photo-1577896851231-70ef18881754?w=800')}
                            className="px-2 py-1 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded text-[10px] text-slate-600 transition"
                          >
                            Preset Rektorat/Studio
                          </button>
                          <button
                            type="button"
                            onClick={() => setGaleriFoto('https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=800')}
                            className="px-2 py-1 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded text-[10px] text-slate-600 transition"
                          >
                            Preset Seminar
                          </button>
                        </div>
                      </div>

                      <div className="border-2 border-dashed border-slate-200 rounded-xl p-3 flex flex-col items-center justify-center bg-slate-50">
                        <label className="cursor-pointer flex flex-col items-center gap-1 text-slate-500 hover:text-indigo-600 transition">
                          <Upload className="w-5 h-5" />
                          <span className="font-extrabold text-[10px] uppercase tracking-wider">Unggah Foto (PNG / JPG)</span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => handlePhotoUpload(e, setGaleriFoto)}
                          />
                        </label>
                        {galeriFoto && (
                          <span className="text-[10px] text-emerald-600 font-bold mt-1.5 flex items-center gap-1 text-center">
                            <Check className="w-3.5 h-3.5" /> Foto Berhasil Dimuat
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {galeriFoto && (
                    <div className="mt-2.5">
                      <span className="block text-slate-500 font-bold text-[9px] uppercase mb-1">Pratinjau Gambar / Foto:</span>
                      <div className="h-28 w-44 rounded-xl border border-slate-200 overflow-hidden bg-slate-100 shadow-sm">
                        <img referrerPolicy="no-referrer" src={galeriFoto} alt="Pratinjau" className="h-full w-full object-cover" />
                      </div>
                    </div>
                  )}

                  <div className="pt-2 border-t border-slate-150 flex items-center justify-end gap-2">
                    {editGaleriId && (
                      <button
                        type="button"
                        onClick={() => {
                          setEditGaleriId(null);
                          setGaleriJudul('');
                          setGaleriFoto('');
                          setGaleriTanggal('');
                        }}
                        className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold transition active:scale-95 cursor-pointer"
                      >
                        Batal
                      </button>
                    )}
                    <button
                      type="submit"
                      className="px-6 py-2 bg-gradient-to-r from-indigo-600 to-sky-500 hover:from-indigo-700 hover:to-sky-600 text-white rounded-xl font-bold transition active:scale-95 cursor-pointer flex items-center gap-1.5"
                    >
                      <ImageIcon className="w-3.5 h-3.5" />
                      <span>{editGaleriId ? 'Simpan Perubahan' : 'Publish Dokumentasi'}</span>
                    </button>
                  </div>
                </form>
              </div>

              {/* Table Galeri Kegiatan */}
              <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden text-xs">
                <span className="block text-slate-900 font-extrabold text-[13px] uppercase tracking-wider px-5 py-4 bg-slate-50 border-b border-slate-200">
                  📁 Daftar Tabel Dokumentasi Kegiatan ({galeri.length})
                </span>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-150/40 text-slate-700 font-black border-b border-slate-200 text-[10px] uppercase tracking-wider">
                        <th className="py-3 px-5 w-12 text-center">#</th>
                        <th className="py-3 px-4 w-28">Pratinjau</th>
                        <th className="py-3 px-4">Judul Kegiatan</th>
                        <th className="py-3 px-4 w-32">Tanggal</th>
                        <th className="py-3 px-4 w-28 text-center">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                      {galeri.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="py-10 text-center text-slate-400 font-medium">
                            Belum ada galeri kegiatan yang dimasukkan. Silakan gunakan pengisian di atas.
                          </td>
                        </tr>
                      ) : (
                        galeri.map((item, index) => (
                          <tr key={item.id} className="hover:bg-slate-50/40 transition">
                            <td className="py-3.5 px-5 font-bold text-slate-400 text-center">{index + 1}</td>
                            <td className="py-3.5 px-4">
                              <div className="h-12 w-20 rounded-lg overflow-hidden border border-slate-200 shadow-inner bg-slate-100">
                                <img referrerPolicy="no-referrer" src={item.foto} alt={item.judul} className="h-full w-full object-cover" />
                              </div>
                            </td>
                            <td className="py-3.5 px-4 font-extrabold text-slate-900 leading-relaxed text-justify">{item.judul}</td>
                            <td className="py-3.5 px-4 font-mono font-medium text-slate-400">{item.tanggal || '-'}</td>
                            <td className="py-3.5 px-4">
                              <div className="flex items-center justify-center gap-1.5">
                                <button
                                  onClick={() => startEditGaleri(item)}
                                  className="p-1.5 hover:bg-amber-50 text-amber-600 rounded-lg border border-transparent hover:border-amber-200 transition cursor-pointer"
                                  title="Edit"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => triggerDelete(item.id, 'galeri')}
                                  className="p-1.5 hover:bg-rose-50 text-rose-600 rounded-lg border border-transparent hover:border-rose-200 transition cursor-pointer"
                                  title="Delete"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
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

          {/* TAB: HELPDESK CHAT */}
          {activeTab === 'helpdesk' && (
            <div className="space-y-6">
              <div className="border-b border-slate-200 pb-3">
                <h1 className="text-xl font-black text-slate-900 tracking-tight">Pusat Layanan Konsultasi & Help Desk</h1>
                <p className="text-xs text-slate-500">Komunikasi dua arah super praktis, interaktif, dan modern dengan Kepala Sekolah se-Kecamatan Pasirwangi.</p>
              </div>
              <HelpDeskChat />
            </div>
          )}

          {/* TAB 6: SEKRETARIAT */}
          {activeTab === 'sekretariat' && (
            <div className="space-y-6">
              <div className="border-b border-slate-200 pb-3">
                <h1 className="text-xl font-black text-slate-900 tracking-tight">Detail Kontak Sekretariat MKKS</h1>
                <p className="text-xs text-slate-500">Sesuaikan alamat dasar, nomor whatsapp kependidikan, serta email rujukan formal organisasi</p>
              </div>

              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm text-xs">
                <form onSubmit={handleSaveSekretariat} className="space-y-4">
                  <div>
                    <label className="block text-slate-700 font-bold mb-1 uppercase tracking-wider">Alamat Sekretariat Fisik *</label>
                    <textarea
                      required
                      rows={2}
                      value={sekAlamat}
                      onChange={(e) => setSekAlamat(e.target.value)}
                      placeholder="Alamat lengkap..."
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:border-indigo-500 focus:outline-none focus:bg-white text-xs leading-relaxed"
                    />
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-slate-700 font-bold mb-1 uppercase tracking-wider">Nomor Kontak Whatsapp / Telp *</label>
                      <input
                        type="text"
                        required
                        value={sekKontak}
                        onChange={(e) => setSekKontak(e.target.value)}
                        placeholder="Contoh: 0812-3456-7890"
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:border-indigo-500 focus:outline-none focus:bg-white text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-700 font-bold mb-1 uppercase tracking-wider font-sans">E-mail Hubungan Resmi *</label>
                      <input
                        type="email"
                        required
                        value={sekEmail}
                        onChange={(e) => setSekEmail(e.target.value)}
                        placeholder="mkks.sd.pasirwangi@gmail.com"
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:border-indigo-500 focus:outline-none focus:bg-white text-xs"
                      />
                    </div>
                  </div>

                  <div className="pt-2 flex justify-end">
                    <button
                      type="submit"
                      className="px-6 py-2.5 bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-600 hover:to-indigo-700 text-white font-bold rounded-xl transition active:scale-95 text-xs shadow"
                    >
                      Perbarui Kontak Sekretariat
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* TAB 7: PENGATURAN USER */}
          {activeTab === 'user' && (
            <div className="space-y-6">
              <div className="border-b border-slate-200 pb-3">
                <h1 className="text-xl font-black text-slate-900 tracking-tight">Manajemen Akun Pengguna / User</h1>
                <p className="text-xs text-slate-500">Otorisasi pendaftaran anggota baru, hapus, sunting, atau lakukan registrasi paksa Kepala Sekolah dasar aktif</p>
              </div>

              {/* Force Add User */}
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm text-xs">
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-2 mb-4">
                  {editUserId ? 'Modifikasi Akun Pengguna' : 'Tambahkan Akun Anggota (Paksa Masuk)'}
                </h3>

                <form onSubmit={handleSaveUser} className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Nama Lengkap & Jabatan *</label>
                    <input
                      type="text"
                      required
                      placeholder="Ahmad Sodikin, S.Pd."
                      value={userNama}
                      onChange={(e) => setUserNama(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:border-indigo-500 focus:outline-none focus:bg-white text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-bold mb-1">NIP Kepala Sekolah</label>
                    <input
                      type="text"
                      placeholder="19xxxxxxxxxxxxxx"
                      value={userNip}
                      onChange={(e) => setUserNip(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:border-indigo-500 focus:outline-none focus:bg-white text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Nama Lembaga SD Sekolah *</label>
                    <input
                      type="text"
                      required
                      placeholder="SDN 1 Sarimukti"
                      value={userSchool}
                      onChange={(e) => setUserSchool(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:border-indigo-500 focus:outline-none focus:bg-white text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-bold mb-1">E-mail Pengguna *</label>
                    <input
                      type="email"
                      required
                      placeholder="ahmad@gmail.com"
                      value={userEmail}
                      onChange={(e) => setUserEmail(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:border-indigo-500 focus:outline-none focus:bg-white text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Kata Sandi (Password) *</label>
                    <input
                      type="password"
                      required={!editUserId}
                      placeholder={editUserId ? 'Kosongkan jika tidak berubah' : '••••••••'}
                      value={userPass}
                      onChange={(e) => setUserPass(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:border-indigo-500 focus:outline-none focus:bg-white text-xs"
                    />
                  </div>

                  <div className="sm:col-span-2 lg:col-span-3 pt-2.5 flex justify-end gap-2">
                    {editUserId && (
                      <button
                        type="button"
                        onClick={() => {
                          setEditUserId(null);
                          setUserNama('');
                          setUserNip('');
                          setUserSchool('');
                          setUserEmail('');
                          setUserPass('');
                        }}
                        className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold transition active:scale-95"
                      >
                        Batal
                      </button>
                    )}
                    <button
                      type="submit"
                      className="px-6 py-2 bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-600 hover:to-indigo-700 text-white rounded-xl font-bold transition active:scale-95"
                    >
                      {editUserId ? 'Modifikasi User' : 'Force Tambahkan User'}
                    </button>
                  </div>
                </form>
              </div>

              {/* Users list table */}
              <div className="bg-white border border-slate-200 rounded-2xl shadow-sm text-xs overflow-hidden">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-100 text-slate-700 font-extrabold border-b border-slate-200">
                      <th className="py-3 px-4 w-12">#</th>
                      <th className="py-3 px-4">Nama Lengkap & NIP</th>
                      <th className="py-3 px-4">Lembaga Sekolah</th>
                      <th className="py-3 px-4">E-mail Acuan</th>
                      <th className="py-3 px-4 text-center">Registrasi</th>
                      <th className="py-3 px-4 text-center">Status</th>
                      <th className="py-3 px-4 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {users.map((u, index) => (
                      <tr key={u.id} className="hover:bg-slate-50/50">
                        <td className="py-3 px-4 font-bold text-slate-500">{index + 1}</td>
                        <td className="py-3 px-4 text-slate-800">
                          <span className="block font-bold">{u.nama}</span>
                          <span className="text-[10px] text-slate-400">NIP: {u.nip || '-'}</span>
                        </td>
                        <td className="py-3 px-4 font-semibold">{u.namaSekolah || '-'}</td>
                        <td className="py-3 px-4 font-mono">{u.email}</td>
                        <td className="py-3 px-4 text-center">
                          <span className={`inline-block px-1.5 py-0.5 rounded text-[9px] font-bold ${u.registrationType === 'admin_forced' ? 'bg-indigo-50 text-indigo-700 border border-indigo-150' : 'bg-teal-50 text-teal-700 border border-teal-150'}`}>
                            {u.registrationType === 'admin_forced' ? 'Admin' : 'User'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <button
                            onClick={() => handleToggleUserActive(u.id)}
                            className={`px-3 py-1 font-bold rounded-full text-[10px] cursor-pointer transition active:scale-95 ${u.isActive ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-250' : 'bg-red-50 text-red-700 hover:bg-red-105 border border-red-200'}`}
                          >
                            {u.isActive ? 'Aktif' : 'Non-Aktif'}
                          </button>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex justify-end gap-1.5">
                            <button
                              onClick={() => startEditUser(u)}
                              className="p-1.5 hover:bg-amber-50 text-amber-600 rounded-lg"
                              title="Edit user"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => triggerDelete(u.id, 'user')}
                              className="p-1.5 hover:bg-rose-50 text-rose-600 rounded-lg"
                              title="Hapus user"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 8: MENU FILE DIGITAL (ADMIN ACCESS) */}
          {activeTab === 'files' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="border-b border-slate-200 pb-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2 text-indigo-700">
                    <FolderOpen className="w-6 h-6 text-indigo-600" />
                    <h1 className="text-xl font-black text-slate-900 tracking-tight">Menu File Digital</h1>
                  </div>
                  <p className="text-xs text-slate-500">
                    Kelola dokumen, instrumen, blangko dinas, dan sumber daya koordinasi digital untuk dapat diunduh oleh seluruh anggota Kepala Sekolah.
                  </p>
                </div>
              </div>

              {/* Form Input File Digital */}
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-2 mb-4">
                  {editFileId ? '✏️ Edit File Digital Terpilih' : '➕ Input File Digital Baru'}
                </h3>
                
                <form onSubmit={handleSaveDigitalFile} className="space-y-4 text-xs font-medium text-slate-700">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-slate-700 font-bold mb-1 uppercase tracking-wider text-[10px]">Nama File / Judul Dokumen Resmi *</label>
                      <input
                        type="text"
                        required
                        placeholder="Contoh: Format LPJ Dana BOS Reguler 2026"
                        value={fileNameInput}
                        onChange={(e) => setFileNameInput(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:border-indigo-500 focus:outline-none focus:bg-white text-xs font-bold"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-700 font-bold mb-1 uppercase tracking-wider text-[10px]">Pilih Fail Berkas Digital *</label>
                      <div className="flex items-center gap-3">
                        <label className="flex items-center gap-1.5 px-3.5 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-705 text-indigo-700 font-extrabold rounded-xl border border-indigo-200 cursor-pointer text-[11px] whitespace-nowrap active:scale-95 transition">
                          <FileUp className="w-4 h-4" />
                          <span>Pilih File</span>
                          <input
                            type="file"
                            onChange={handleDigitalFileUpload}
                            className="hidden"
                          />
                        </label>
                        <div className="min-w-0 flex-1">
                          {fileBlobName ? (
                            <div className="flex flex-col">
                              <span className="font-bold text-slate-800 truncate text-[11px]" title={fileBlobName}>
                                {fileBlobName}
                              </span>
                              <span className="text-[9px] text-slate-400 font-bold font-mono">
                                Size: {fileBlobSize} • {fileBlobType}
                              </span>
                            </div>
                          ) : (
                            <span className="text-slate-400 font-bold italic text-[11px]">Belum ada fail terpilih</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                    {editFileId && (
                      <button
                        type="button"
                        onClick={() => {
                          setEditFileId(null);
                          setFileNameInput('');
                          setFileBlobName('');
                          setFileBlobContent('');
                          setFileBlobSize('');
                          setFileBlobType('');
                        }}
                        className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold transition active:scale-95"
                      >
                        Batal
                      </button>
                    )}
                    <button
                      type="submit"
                      className="px-6 py-2 bg-indigo-650 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition active:scale-95 shadow-md shadow-indigo-100"
                    >
                      {editFileId ? 'Simpan Perubahan' : 'Unggah File Digital'}
                    </button>
                  </div>
                </form>
              </div>

              {/* Tabel File Digital */}
              <div className="bg-white border border-slate-200 rounded-2xl shadow-sm text-xs overflow-hidden">
                <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                  <span className="font-bold text-slate-700 uppercase tracking-wider text-[10px]">Tabel Daftar File Digital Resmi</span>
                  <span className="bg-slate-100 text-indigo-600 px-2.5 py-0.5 rounded-full font-mono text-[10px] font-bold">
                    Total: {digitalFiles.length} File
                  </span>
                </div>
                
                <div className="overflow-x-auto text-[11px]">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-100 text-slate-700 font-extrabold border-b border-slate-200">
                        <th className="py-3 px-4 w-12 text-center">No</th>
                        <th className="py-3 px-4">Nama File / Dokumen Resmi</th>
                        <th className="py-3 px-4">Klasifikasi Berkas</th>
                        <th className="py-3 px-4">Tanggal Diunggah</th>
                        <th className="py-3 px-4 text-center">Ukuran</th>
                        <th className="py-3 px-4 text-center">Aksi Pengelolaan</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                      {digitalFiles.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="py-10 text-center text-slate-400 font-semibold italic">
                            Belum ada file digital yang diunggah. Silakan isi form di atas.
                          </td>
                        </tr>
                      ) : (
                        digitalFiles.map((f, idx) => (
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
                            <td className="py-3.5 px-4">
                              <div className="flex items-center justify-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => handleViewFileInNewTab(f)}
                                  className="p-1 px-2.5 text-indigo-650 text-indigo-600 hover:bg-indigo-50 border border-indigo-250 hover:border-indigo-300 rounded-lg transition font-bold"
                                  title="Lihat Detail"
                                >
                                  <Eye className="w-3.5 h-3.5 inline mr-1" />
                                  <span>Lihat</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => startEditDigitalFile(f)}
                                  className="p-1.5 text-amber-600 hover:bg-amber-50 border border-transparent hover:border-amber-200 rounded-lg transition"
                                  title="Edit"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteDigitalFile(f.id)}
                                  className="p-1.5 text-rose-650 hover:bg-rose-50 text-rose-650 hover:hover:bg-rose-100 hover:border-rose-200 border border-transparent rounded-lg transition"
                                  title="Hapus"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
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

          {/* TAB 9: SINKRONISASI INTEGRASI SUPABASE (DATABASE MANAGER) */}
          {activeTab === 'supabase' && (
            <div className="space-y-6 animate-in fade-in duration-300 font-sans text-xs font-semibold text-slate-700">
              {/* Header Panel */}
              <div className="border-b border-slate-200 pb-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2 text-emerald-700">
                    <Database className="w-6 h-6 text-emerald-600" />
                    <h1 className="text-xl font-black text-slate-900 tracking-tight">Koneksi & Sinkronisasi Supabase</h1>
                  </div>
                  <p className="text-xs text-slate-500 font-medium font-sans">
                    Sambungkan landing page dan dashboard admin MKKS SD ini secara penuh ke backend database awan online Supabase Anda.
                  </p>
                </div>
              </div>

              {/* Status & Toggle Sync Card */}
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-2 mb-4 flex items-center gap-2">
                  <span className="p-1 bg-emerald-50 rounded-lg"><Sparkles className="w-4 h-4 text-emerald-600" /></span>
                  <span>Parameter Koneksi Suku Cadang Awan</span>
                </h3>

                <div className="grid md:grid-cols-3 gap-6">
                  {/* Left Specs List */}
                  <div className="md:col-span-2 space-y-4">
                    <div className="grid grid-cols-3 gap-2 text-xs font-semibold">
                      <span className="text-slate-400 font-sans">Project Name:</span>
                      <span className="col-span-2 text-slate-800 font-bold">MKKS SD Pasirwangi</span>

                      <span className="text-slate-400 font-sans">Project ID:</span>
                      <span className="col-span-2 text-slate-800 font-mono">tpbeoqkwdorahqsestbk</span>

                      <span className="text-slate-400 font-sans">Database URL:</span>
                      <span className="col-span-2 text-slate-600 font-mono break-all font-bold">https://tpbeoqkwdorahqsestbk.supabase.co/rest/v1/</span>

                      <span className="text-slate-400 font-sans">Anon Key:</span>
                      <span className="col-span-2 text-slate-500 font-mono break-all font-semibold">sb_publishable_f97QpPaEhcr...</span>
                    </div>

                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-150 flex items-start gap-3">
                      <Info className="w-5 h-5 text-indigo-500 shrink-0 mt-0.5" />
                      <div>
                        <h4 className="text-xs font-bold text-slate-800 font-sans">Bagaimana Cara Kerja Sinkronisasi?</h4>
                        <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed font-semibold">
                          Saat sinkronisasi realtime diaktifkan, semua tindakan tambah, edit, atau hapus di dashboard admin secara otomatis diperbarui di database Supabase secara instan. Data juga tersinkronisasi kembali ke penyimpanan offline lokal sebagai redundansi yang aman.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Connection Status Box */}
                  <div className="bg-slate-50 rounded-2xl p-5 border border-slate-150 flex flex-col justify-between gap-4 font-sans">
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">Status Koneksi</span>
                      {supabaseStatus.connected ? (
                        supabaseStatus.tablesExist ? (
                          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-100 text-emerald-800 rounded-lg text-xs font-extrabold shadow-sm">
                            <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full inline-block animate-pulse"></span>
                            <span>SINKRONISASI AKTIF</span>
                          </div>
                        ) : (
                          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-100 text-amber-800 rounded-lg text-xs font-extrabold shadow-sm">
                            <span className="w-2.5 h-2.5 bg-amber-500 rounded-full inline-block animate-ping"></span>
                            <span>TABEL BELUM TERDEKLARASI</span>
                          </div>
                        )
                      ) : (
                        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-rose-100 text-rose-800 rounded-lg text-xs font-extrabold shadow-sm">
                          <span className="w-2.5 h-2.5 bg-rose-500 rounded-full inline-block"></span>
                          <span>BELUM TERHUBUNG</span>
                        </div>
                      )}
                      
                      <p className="text-[11px] text-slate-500 mt-2 leading-relaxed font-medium">
                        {!supabaseStatus.connected 
                          ? `Gagal terhubung ke URL REST Supabase. Pastikan internet Anda aktif dan file .env telah dimuat dengan benar.`
                          : !supabaseStatus.tablesExist 
                            ? `Terhubung ke Supabase! Namun schema tabel belum terbuat. Silakan buat tabel dengan menyalin skema SQL di bagian bawah halaman ini.`
                            : `Aplikasi berhasil mengautentikasi dan mendeteksi kesembilan (9) tabel skema data di Supabase.`}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-slate-200">
                      <label className="flex items-center gap-2 cursor-pointer group">
                        <input
                          type="checkbox"
                          checked={supabaseSync}
                          onChange={(e) => onToggleSupabaseSync(e.target.checked)}
                          className="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500 cursor-pointer"
                        />
                        <span className="text-xs font-extrabold text-slate-800 group-hover:text-emerald-600 transition font-sans">
                          Aktifkan Sinkronisasi Supabase
                        </span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              {/* Data Synchronizer Controls Card */}
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-2 mb-4 flex items-center gap-2">
                  <span>🔄 Operasi Manual Sinkronisasi Data</span>
                </h3>

                <p className="text-xs text-slate-500 mb-6 leading-relaxed font-medium font-sans">
                  Gunakan tombol kontrol manual di bawah ini untuk mengimpor atau mengekspor seluruh database. Ini sangat membantu ketika inisialisasi awal database Anda atau saat memulihkan riwayat data dari Supabase.
                </p>

                <div className="grid sm:grid-cols-2 gap-6">
                  {/* Pull Card */}
                  <div className="border border-slate-200 hover:border-indigo-300 rounded-2xl p-5 transition hover:shadow-md flex flex-col justify-between gap-4">
                    <div>
                      <h4 className="text-xs font-extrabold text-indigo-700 flex items-center gap-1.5 uppercase font-sans">
                        <span>📥 Pull Data (Tarik Data Dari Supabase)</span>
                      </h4>
                      <p className="text-xs text-slate-500 mt-1 leading-relaxed font-medium">
                        Mengambil seluruh baris data dari tabel `schools`, `agendas`, `programs`, `users`, `galeri`, `sekretariat`, `about_info`, dan `digital_files` secara langsung dari Supabase untuk menimpa penyimpanan lokal Anda saat ini.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => onPullSupabaseData(true)}
                      className="w-full py-2.5 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-xl text-xs font-extrabold text-indigo-700 hover:text-indigo-850 active:scale-95 transition flex items-center justify-center gap-2 cursor-pointer shadow-sm font-sans"
                    >
                      <RefreshCw className="w-3.5 h-3.5 animate-spin-slow" />
                      <span>Mulai Tarik Data dari Supabase</span>
                    </button>
                  </div>

                  {/* Push Card */}
                  <div className="border border-slate-200 hover:border-emerald-300 rounded-2xl p-5 transition hover:shadow-md flex flex-col justify-between gap-4">
                    <div>
                      <h4 className="text-xs font-extrabold text-emerald-700 flex items-center gap-1.5 uppercase font-sans">
                        <span>📤 Push Data (Kirim Data Lokal ke Supabase)</span>
                      </h4>
                      <p className="text-xs text-slate-500 mt-1 leading-relaxed font-medium">
                        Mengunggah semua data yang ada di penyimpanan lokal Anda saat ini ke table database Supabase. Sangat berguna untuk mengunggah master data awal (seeding) setelah Anda selesai mengeksekusi script SQL skema di bawah.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={async () => {
                        const confirm = window.confirm('Apakah Anda yakin ingin mengupload data lokal? Ini akan meng-upsert database online di Supabase dengan data lokal Anda saat ini.');
                        if (confirm) {
                          await onPushSupabaseData();
                        }
                      }}
                      className="w-full py-2.5 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl text-xs font-extrabold text-emerald-700 hover:text-emerald-850 active:scale-95 transition flex items-center justify-center gap-2 cursor-pointer shadow-sm font-sans"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>Mulai Unggah Data ke Supabase</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Schema SQL block panel */}
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-4">
                  <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5 font-sans">
                    <span>📋 Salinan Script SQL Skema Database</span>
                  </h3>
                  <button
                    type="button"
                    onClick={handleCopySql}
                    className={`px-3 py-1.5 rounded-xl text-xs font-black transition flex items-center gap-1.5 cursor-pointer font-sans ${copiedSql ? 'bg-emerald-600 text-white shadow' : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200'}`}
                  >
                    {copiedSql ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Kopi Berhasil!</span>
                      </>
                    ) : (
                      <>
                        <Download className="w-3.5 h-3.5" />
                        <span>Salin Script SQL</span>
                      </>
                    )}
                  </button>
                </div>

                <p className="text-xs text-slate-500 mb-4 leading-relaxed font-sans font-semibold">
                  Supabase memerlukan pembuatan tabel yang tepat agar API REST berfungsi secara otomatis. Salin skema SQL di bawah ini, buka dashboard Supabase Anda di <a href="https://supabase.com" target="_blank" rel="noreferrer" className="text-indigo-600 underline font-semibold">https://supabase.com</a>, klik menu **SQL Editor**, buat **New Query**, paste kode ini, lalu jalankan (**Run**).
                </p>

                <div className="relative text-xs">
                  <pre className="bg-slate-900 text-emerald-400 p-4 rounded-xl text-[11px] font-mono overflow-x-auto max-h-72 border border-slate-800 shadow-inner select-all leading-relaxed whitespace-pre font-medium">
                    {SUPABASE_SQL_SCHEMA}
                  </pre>
                  <div className="absolute bottom-2 right-2 bg-slate-950/80 text-slate-400 text-[9px] font-bold px-2 py-1 rounded border border-slate-800 font-mono">
                    SQL EDITOR SCHEMA
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Clean Admin Panel Workspace Footer */}
          <footer className="mt-12 pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-450 text-slate-500 font-medium pb-2">
            <span>&copy; {new Date().getFullYear()} MKKS SD Kecamatan Pasirwangi, Kabupaten Garut • Panel Administrator Utama. Hak Cipta Dilindungi.</span>
            <span className="sm:mt-0 font-bold text-indigo-600 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full inline-block animate-ping"></span>
              <span>Sistem Sinergi Terintegrasi</span>
            </span>
          </footer>
        </main>
      </div>

      {/* DYNAMIC DELETE POPUP / VERIFICATION MODAL */}
      {deleteConfirmOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-sm border border-slate-200 shadow-2xl p-6 text-center animate-in fade-in duration-200">
            <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-4 scale-110">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="font-extrabold text-slate-900 text-sm sm:text-base tracking-tight mb-2">Konfirmasi Hapus Data</h3>
            <p className="text-xs text-slate-500 leading-relaxed max-w-xs mx-auto mb-6">
              Apakah Anda benar-benar yakin ingin menghapus data ini secara permanen dari basis data? Pindaan ini tidak dapat dibatalkan.
            </p>
            <div className="flex gap-2.5 justify-center">
              <button
                onClick={() => {
                  setDeleteConfirmOpen(false);
                  setDeleteTargetId(null);
                  setDeleteType(null);
                }}
                className="w-1/2 py-2 bg-slate-100 hover:bg-slate-200 font-bold rounded-xl transition text-slate-600 text-xs active:scale-95 cursor-pointer"
              >
                Batalkan
              </button>
              <button
                onClick={handleVerifiedDelete}
                className="w-1/2 py-2 bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-600 hover:to-red-700 text-white font-bold rounded-xl transition text-xs active:scale-95 cursor-pointer"
              >
                Ya, Konfirmasi Hapus
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADMIN PROFILE EDITING POPUP MODAL */}
      {profileModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 text-xs">
          <div className="bg-white rounded-2xl w-full max-w-md border border-slate-200 shadow-2xl overflow-hidden animate-in">
            <div className="bg-gradient-to-r from-sky-500 to-indigo-600 px-5 py-4 text-white flex items-center justify-between">
              <span className="font-extrabold tracking-tight">Perbarui Profil Admin Utama</span>
              <button onClick={() => setProfileModalOpen(false)} className="p-1 hover:bg-white/10 rounded-lg text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="p-5 sm:p-6 space-y-4">
              <div className="flex flex-col items-center gap-3 bg-slate-50 p-4 border border-slate-100 rounded-2xl mb-1.5">
                <div className="relative group">
                  <img 
                    src={adminFotoInput} 
                    alt="Photo preview" 
                    className="w-20 h-20 rounded-full object-cover border-2 border-indigo-500" 
                  />
                  <label className="absolute bottom-0 right-0 bg-indigo-600 p-1.5 text-white rounded-full cursor-pointer hover:bg-indigo-700 transition">
                    <Camera className="w-3.5 h-3.5" />
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handleAdminPhotoUpload} 
                      className="hidden" 
                    />
                  </label>
                </div>
                <span className="text-[10px] text-slate-500">Mendukung format gambar PNG, JPG, atau WEBP</span>
              </div>

              <div>
                <label className="block text-slate-705 font-bold mb-1.5 uppercase tracking-wider">Nama Lengkap Admin *</label>
                <input
                  type="text"
                  required
                  value={adminNameInput}
                  onChange={(e) => setAdminNameInput(e.target.value)}
                  placeholder="Contoh: Admin Utama MKKS"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:border-indigo-500 focus:outline-none focus:bg-white text-xs"
                />
              </div>

              <div className="flex gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setProfileModalOpen(false)}
                  className="w-1/2 py-2.5 bg-slate-100 hover:bg-slate-200 font-bold rounded-xl text-slate-600 transition tracking-wide text-xs active:scale-95 duration-200 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2.5 bg-gradient-to-r from-sky-500 to-indigo-600 text-white hover:from-sky-600 hover:to-indigo-700 font-bold rounded-xl transition tracking-wide text-xs active:scale-95 duration-200 cursor-pointer"
                >
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* LIHAT AKSI DETAILS MODAL (SCHOOL & AGENDA) */}
      {viewDetailsOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 text-xs">
          <div className="bg-white rounded-2xl w-full max-w-lg border border-slate-200 shadow-2xl overflow-hidden animate-in transform transition-all">
            
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-sky-600 to-indigo-700 px-5 py-4 text-white flex items-center justify-between">
              <span className="font-extrabold text-sm tracking-tight">Detil Informasi Aksi</span>
              <button onClick={() => setViewDetailsOpen(false)} className="p-1 hover:bg-white/10 rounded-lg text-white">
                <X className="w-4.5 h-4.5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 sm:p-6 space-y-4">
              
              {/* Detail view FOR SCHOOL */}
              {viewDetailsType === 'school' && viewDetailsSchool && (
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row gap-5 items-center bg-slate-50 p-4 border border-slate-100 rounded-2xl">
                    <img 
                      src={viewDetailsSchool.fotoKS || 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=200&auto=format'} 
                      className="w-24 h-24 rounded-full object-cover border-2 border-indigo-500 shadow-md shrink-0" 
                      alt="KS Profile Photo" 
                    />
                    <div className="text-center sm:text-left space-y-1">
                      <span className="bg-indigo-50 text-indigo-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-indigo-200">
                        {viewDetailsSchool.statusKS === 'Definitif' ? 'Kepala Sekolah Definitif' : 'Pelaksana Tugas (PLT) KS'}
                      </span>
                      <h4 className="font-extrabold text-slate-900 text-base">{viewDetailsSchool.namaKS}</h4>
                      <p className="text-slate-500 text-[11px] font-medium">NIP Kepala Sekolah: {viewDetailsSchool.nipKS || '-'}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-50/50 p-3 rounded-xl border border-slate-100">
                      <span className="text-slate-400 block font-bold text-[10px] uppercase tracking-wider mb-1">Nama Instansi</span>
                      <span className="text-slate-800 font-bold block">{viewDetailsSchool.namaSekolah}</span>
                    </div>
                    <div className="bg-slate-50/50 p-3 rounded-xl border border-slate-100">
                      <span className="text-slate-400 block font-bold text-[10px] uppercase tracking-wider mb-1">NPSN Nasional</span>
                      <span className="text-slate-800 font-mono font-bold block bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-lg w-fit mt-0.5">{viewDetailsSchool.npsn}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Detail view FOR AGENDA with custom mock browser PDF Previewer */}
              {viewDetailsType === 'agenda' && viewDetailsAgenda && (
                <div className="space-y-4">
                  <div className="bg-slate-50 p-4 border border-slate-100 rounded-2xl space-y-2">
                    <h4 className="font-black text-slate-900 text-sm tracking-tight leading-relaxed">{viewDetailsAgenda.judul}</h4>
                    <div className="grid grid-cols-2 gap-3 pt-2 text-[11px]">
                      <div>
                        <span className="text-slate-400 block font-bold">Waktu Mulai:</span>
                        <span className="text-slate-800 font-bold">{new Date(viewDetailsAgenda.waktu).toLocaleString('id-ID')}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block font-bold">Temkat Kegiatan:</span>
                        <span className="text-slate-800 font-bold">{viewDetailsAgenda.tempat}</span>
                      </div>
                    </div>
                  </div>

                  {/* Document preview toggles */}
                  {viewDetailsAgenda.namaDokumen ? (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-800 text-[11px] block uppercase tracking-wide">Pindai Surat Lampiran</span>
                        <button
                          type="button"
                          onClick={() => setPreviewAgendaPdf(!previewAgendaPdf)}
                          className="px-3.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold rounded-lg border border-indigo-200 transition active:scale-95"
                        >
                          {previewAgendaPdf ? 'Tutup Pratinjau' : 'Lihat Pratinjau Dokumen'}
                        </button>
                      </div>

                      {previewAgendaPdf && (
                        <div className="border border-slate-200 rounded-2xl p-4 bg-slate-50 text-center space-y-3 animate-in fade-in duration-300">
                          <div className="bg-white border-2 border-slate-100 rounded-xl max-w-sm mx-auto p-4 py-6 shadow-md text-left space-y-4 font-serif text-[11px] relative">
                            {/* Formal letterhead layout */}
                            <div className="text-center border-b-2 border-double border-slate-900 pb-2 mb-2">
                              <span className="block font-sans font-extrabold text-slate-800 tracking-wider">PEMERINTAH KABUPATEN GARUT</span>
                              <span className="block font-sans font-bold text-slate-700">MUSYAWARAH KERJA KEPALA SEKOLAH (MKKS) SD</span>
                              <span className="block text-[9px] font-sans text-slate-500 leading-normal">Kecamatan Pasirwangi, Kabupaten Garut, Jawa Barat 44161</span>
                            </div>

                            <div className="text-right font-sans text-[10px] text-slate-500">Pasirwangi, {new Date(viewDetailsAgenda.waktu).toLocaleDateString('id-ID')}</div>
                            <div>
                              <strong>Hal:</strong> Undangan Musyawarah Agenda Koordinasi Pendidikan Dasar Pasirwangi<br />
                              <strong>Sifat:</strong> Penting / Segera
                            </div>

                            <div>
                              Mengharap kehadiran Bapak/Ibu Kepala Sekolah Dasar se-Kecamatan Pasirwangi pada:<br />
                              <strong>Hari/Tanggal:</strong> {new Date(viewDetailsAgenda.waktu).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}<br />
                              <strong>Waktu:</strong> {new Date(viewDetailsAgenda.waktu).toLocaleTimeString('id-ID')} WIB<br />
                              <strong>Tempat:</strong> {viewDetailsAgenda.tempat}<br />
                              <strong>Acara:</strong> {viewDetailsAgenda.judul}
                            </div>

                            <div className="text-right pt-4 font-sans leading-none text-slate-600">
                              <span className="block font-bold">Ketua MKKS Pasirwangi</span>
                              <div className="h-10"></div>
                              <span className="block font-bold underline">H. Jajang, S.Pd., M.M.</span>
                            </div>
                          </div>
                          
                          <div className="text-[10px] text-slate-400 font-medium">Pratinjau Dokumen Bawaan Browser Digital Berhasil Terbuat</div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="p-4 border border-dashed border-slate-200 text-center rounded-2xl text-slate-400 font-semibold text-[11px]">
                      Tidak ada file lampiran PDF dalam agenda rapat ini
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="bg-slate-50 px-5 py-4 flex justify-end border-t border-slate-100">
              <button
                onClick={() => setViewDetailsOpen(false)}
                className="px-5 py-2 bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-600 hover:to-indigo-700 text-white font-extrabold rounded-xl transition tracking-wide shadow"
              >
                Tutup Jendela Detil
              </button>
            </div>

          </div>
        </div>
      )}

      {/* PREVIEW DIGITAL FILE MODAL */}
      {viewFileModalOpen && viewFileItem && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 text-xs">
          <div className="bg-white rounded-2xl w-full max-w-lg border border-slate-200 shadow-2xl overflow-hidden animate-in">
            
            <div className="bg-gradient-to-r from-indigo-600 to-sky-600 px-5 py-4 text-white flex items-center justify-between">
              <span className="font-extrabold text-sm tracking-tight flex items-center gap-1.5">
                <FolderOpen className="w-4 h-4" />
                <span>Rincian Berkas File Digital</span>
              </span>
              <button type="button" onClick={() => setViewFileModalOpen(false)} className="p-1 hover:bg-white/10 rounded-lg text-white">
                <X className="w-4.5 h-4.5" />
              </button>
            </div>

            <div className="p-5 sm:p-6 space-y-4">
              <div className="bg-slate-50 p-4 border border-slate-100 rounded-2xl space-y-3">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider mb-0.5">Nama File / Judul Dokumen</span>
                  <h4 className="font-black text-slate-900 leading-snug text-sm">{viewFileItem.namaFile}</h4>
                </div>
                
                <div className="grid grid-cols-2 gap-3 text-[11px] text-slate-600 border-t border-slate-200/60 pt-2.5">
                  <div>
                    <strong className="text-slate-400 font-bold block text-[10px] uppercase">Teks Nama Asli:</strong>
                    <span className="text-slate-800 font-mono font-bold truncate block max-w-[180px]" title={viewFileItem.namaAsli}>
                      {viewFileItem.namaAsli}
                    </span>
                  </div>
                  <div>
                    <strong className="text-slate-400 font-bold block text-[10px] uppercase">Klasifikasi Berkas:</strong>
                    <span className="text-slate-800 font-bold block">{viewFileItem.fileType}</span>
                  </div>
                  <div>
                    <strong className="text-slate-400 font-bold block text-[10px] uppercase">Tanggal Diunggah:</strong>
                    <span className="text-slate-800 font-bold font-mono block">{viewFileItem.dateAdded}</span>
                  </div>
                  <div>
                    <strong className="text-slate-400 font-bold block text-[10px] uppercase">Ukuran File:</strong>
                    <span className="text-slate-800 font-bold font-mono block">{viewFileItem.fileSize}</span>
                  </div>
                </div>
              </div>

              {/* Simulated download / file contents view box */}
              <div className="border border-indigo-100 rounded-xl p-4 bg-indigo-50/40 text-center space-y-2">
                <div className="mx-auto w-10 h-10 bg-white rounded-full flex items-center justify-center border border-indigo-100 shadow-sm text-indigo-600">
                  <FolderOpen className="w-5 h-5 animate-pulse" />
                </div>
                <div className="space-y-1">
                  <span className="block font-bold text-indigo-900 text-xs">Arsip Berkas Digital Tersambung</span>
                  <p className="text-[10px] text-slate-500 max-w-xs mx-auto leading-relaxed">
                    Arsip kependidikan formal digital tersimpan dalam sistem terenkripsi base64. Siap untuk disalurkan ke anggota.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-slate-50 px-5 py-4 flex justify-end gap-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  // Direct clean fallback download
                  const link = document.createElement('a');
                  link.href = viewFileItem.fileContent;
                  link.download = viewFileItem.namaAsli;
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
                }}
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition shadow active:scale-95 text-xs inline-flex items-center gap-1.5 cursor-pointer"
              >
                <FolderOpen className="w-4 h-4" />
                <span>Unduh File Resmi</span>
              </button>
              <button
                type="button"
                onClick={() => setViewFileModalOpen(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-705 text-slate-700 font-bold rounded-xl transition active:scale-95 border border-slate-300 text-xs cursor-pointer"
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
