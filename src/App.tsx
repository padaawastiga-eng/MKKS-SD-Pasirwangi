/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { School, Agenda, ProgramKerja, Sekretariat, UserAccount, AboutMkks, AdminProfile, GaleriKegiatan, DigitalFile } from './types';
import { 
  initialSchools, initialAgendas, initialProgramKerja, initialSekretariat, initialAboutMkks, initialUsers, initialGaleri, initialDigitalFiles 
} from './data';
import {
  checkSupabaseConnection,
  fetchFromSupabase,
  upsertToSupabase,
  deleteFromSupabase,
  getSingleRecord,
  saveSingleRecord,
  supabase
} from './supabaseClient';

import LandingPage from './components/LandingPage';
import LoginPage from './components/LoginPage';
import AdminDashboard from './components/AdminDashboard';
import UserDashboard from './components/UserDashboard';


export default function App() {
  // Navigation State
  // 'landing' | 'login' | 'admin' | 'user'
  const [currentPage, setCurrentPage] = useState<string>(() => {
    return localStorage.getItem('mkks_current_page') || 'landing';
  });

  // Supabase State Sync & Status
  const [supabaseSyncEnabled, setSupabaseSyncEnabled] = useState<boolean>(() => {
    return localStorage.getItem('mkks_supabase_sync') === 'true';
  });

  const [supabaseStatus, setSupabaseStatus] = useState<{
    connected: boolean;
    tablesExist: boolean;
    error: string | null;
  }>({ connected: false, tablesExist: false, error: null });

  // Load and manage state from localStorage for maximum authenticity of data persistence!
  const [schools, setSchools] = useState<School[]>(() => {
    const saved = localStorage.getItem('mkks_schools');
    return saved ? JSON.parse(saved) : initialSchools;
  });

  const [agendas, setAgendas] = useState<Agenda[]>(() => {
    const saved = localStorage.getItem('mkks_agendas');
    return saved ? JSON.parse(saved) : initialAgendas;
  });

  const [programs, setPrograms] = useState<ProgramKerja[]>(() => {
    const saved = localStorage.getItem('mkks_programs');
    return saved ? JSON.parse(saved) : initialProgramKerja;
  });

  const [sekretariat, setSekretariat] = useState<Sekretariat>(() => {
    const saved = localStorage.getItem('mkks_sekretariat');
    return saved ? JSON.parse(saved) : initialSekretariat;
  });

  const [aboutInfo, setAboutInfo] = useState<AboutMkks>(() => {
    const saved = localStorage.getItem('mkks_about_info');
    return saved ? JSON.parse(saved) : initialAboutMkks;
  });

  const [users, setUsers] = useState<UserAccount[]>(() => {
    const saved = localStorage.getItem('mkks_users');
    return saved ? JSON.parse(saved) : initialUsers;
  });

  const [galeri, setGaleri] = useState<GaleriKegiatan[]>(() => {
    const saved = localStorage.getItem('mkks_galeri');
    return saved ? JSON.parse(saved) : initialGaleri;
  });

  const [adminProfile, setAdminProfile] = useState<AdminProfile>(() => {
    const saved = localStorage.getItem('mkks_admin_profile');
    return saved ? JSON.parse(saved) : {
      nama: 'Admin Utama',
      foto: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80'
    };
  });

  const [digitalFiles, setDigitalFiles] = useState<DigitalFile[]>(() => {
    const saved = localStorage.getItem('mkks_digital_files');
    return saved ? JSON.parse(saved) : initialDigitalFiles;
  });

  const [activeUserId, setActiveUserId] = useState<string | null>(() => {
    return localStorage.getItem('mkks_active_user_id');
  });

  // Track and recover session from Supabase on mount
  useEffect(() => {
    const recoverSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          const uId = session.user.id;
          const email = session.user.email || '';
          
          if (email.toLowerCase() === 'admin@mkks.com') {
            handleLoginSuccess('admin', 'admin');
          } else {
            // Check if profile exists, if not we add to state dynamically
            const meta = session.user.user_metadata || {};
            const userExists = users.some(u => u.id === uId || u.email.toLowerCase() === email.toLowerCase());
            
            if (!userExists) {
              const newProfile: UserAccount = {
                id: uId,
                nama: meta.nama || email.split('@')[0],
                nip: meta.nip || '',
                namaSekolah: meta.namaSekolah || 'SD Pasirwangi',
                email: email,
                isActive: true,
                registrationType: 'self_registered'
              };
              setUsers(prev => {
                const checked = prev.some(u => u.id === uId || u.email.toLowerCase() === email.toLowerCase());
                if (checked) return prev;
                const updated = [...prev, newProfile];
                localStorage.setItem('mkks_users', JSON.stringify(updated));
                return updated;
              });
            }
            handleLoginSuccess(uId, 'user');
          }
        }
      } catch (err) {
        console.warn('Gagal memulihkan sesi Supabase pada startup:', err);
      }
    };
    recoverSession();
  }, []);

  // Sync state changes with localStorage
  useEffect(() => {
    localStorage.setItem('mkks_schools', JSON.stringify(schools));
  }, [schools]);

  useEffect(() => {
    localStorage.setItem('mkks_agendas', JSON.stringify(agendas));
  }, [agendas]);

  useEffect(() => {
    localStorage.setItem('mkks_programs', JSON.stringify(programs));
  }, [programs]);

  useEffect(() => {
    localStorage.setItem('mkks_sekretariat', JSON.stringify(sekretariat));
  }, [sekretariat]);

  useEffect(() => {
    localStorage.setItem('mkks_about_info', JSON.stringify(aboutInfo));
  }, [aboutInfo]);

  useEffect(() => {
    localStorage.setItem('mkks_users', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem('mkks_galeri', JSON.stringify(galeri));
  }, [galeri]);

  useEffect(() => {
    localStorage.setItem('mkks_admin_profile', JSON.stringify(adminProfile));
  }, [adminProfile]);

  useEffect(() => {
    localStorage.setItem('mkks_digital_files', JSON.stringify(digitalFiles));
  }, [digitalFiles]);

  // Check Supabase connection and pull tables on start if Sync is enabled
  useEffect(() => {
    const initSync = async () => {
      const conn = await checkSupabaseConnection();
      setSupabaseStatus(conn);
      if (supabaseSyncEnabled && conn.tablesExist) {
        await pullDataFromSupabase(false);
      }
    };
    initSync();
  }, [supabaseSyncEnabled]);

  const pullDataFromSupabase = async (forceAlert = false) => {
    try {
      const dbSchools = await fetchFromSupabase<School>('schools', schools);
      const dbAgendas = await fetchFromSupabase<Agenda>('agendas', agendas);
      const dbPrograms = await fetchFromSupabase<ProgramKerja>('programs', programs);
      const dbUsers = await fetchFromSupabase<UserAccount>('users', users);
      const dbGaleri = await fetchFromSupabase<GaleriKegiatan>('galeri', galeri);
      const dbDigitalFiles = await fetchFromSupabase<DigitalFile>('digital_files', digitalFiles);

      const dbSekretariat = await getSingleRecord<Sekretariat>('sekretariat', 'primary', sekretariat);
      const dbAbout = await getSingleRecord<AboutMkks>('about_info', 'primary', aboutInfo);

      const check = await checkSupabaseConnection();
      if (!check.tablesExist) {
        if (forceAlert) {
          alert('Gagal menyinkronkan data dari Supabase. Pastikan tabel database telah dibuat sesuai skema SQL yang disediakan.');
        }
        return false;
      }

      setSchools(dbSchools);
      setAgendas(dbAgendas);
      setPrograms(dbPrograms);
      setUsers(dbUsers);
      setSekretariat(dbSekretariat);
      setAboutInfo(dbAbout);
      setGaleri(dbGaleri);
      setDigitalFiles(dbDigitalFiles);

      if (forceAlert) {
        alert('Sinkronisasi Berhasil! Sukses mengimpor sembila (9) tabel data dari Supabase.');
      }
      return true;
    } catch (e: any) {
      if (forceAlert) {
        alert('Kegagalan sinkronisasi: ' + (e.message || e));
      }
      return false;
    }
  };

  const pushDataToSupabase = async () => {
    const check = await checkSupabaseConnection();
    if (!check.tablesExist) {
      alert('Gagal mengupload data. Pastikan seluruh tabel di Supabase SQL editor telah dibuat.');
      return false;
    }

    try {
      let isSuccess = true;
      for (const item of schools) {
        const ok = await upsertToSupabase('schools', item);
        if (!ok) isSuccess = false;
      }
      for (const item of agendas) {
        const ok = await upsertToSupabase('agendas', item);
        if (!ok) isSuccess = false;
      }
      for (const item of programs) {
        const ok = await upsertToSupabase('programs', item);
        if (!ok) isSuccess = false;
      }
      for (const item of users) {
        const ok = await upsertToSupabase('users', item);
        if (!ok) isSuccess = false;
      }
      for (const item of galeri) {
        const ok = await upsertToSupabase('galeri', item);
        if (!ok) isSuccess = false;
      }
      for (const item of digitalFiles) {
        const ok = await upsertToSupabase('digital_files', item);
        if (!ok) isSuccess = false;
      }

      await saveSingleRecord('sekretariat', sekretariat);
      await saveSingleRecord('about_info', aboutInfo);

      if (isSuccess) {
        alert('Berhasil mengunggah semua data lokal Anda ke Database Online Supabase!');
      } else {
        alert('Unggah selesai dengan beberapa peringatan. Pastikan tidak ada kolom yang mismatch.');
      }
      return isSuccess;
    } catch (err: any) {
      alert('Gagal mengunggah data: ' + err.message);
      return false;
    }
  };

  // State Updates Wrapper for Incremental Syncing to Supabase
  const handleUpdateSchools = async (newSchools: School[]) => {
    setSchools(newSchools);
    if (supabaseSyncEnabled && supabaseStatus.tablesExist) {
      const deleted = schools.filter(o => !newSchools.some(n => n.id === o.id));
      for (const item of deleted) {
        await deleteFromSupabase('schools', item.id);
      }
      const changed = newSchools.filter(n => {
        const matching = schools.find(o => o.id === n.id);
        return !matching || JSON.stringify(matching) !== JSON.stringify(n);
      });
      for (const item of changed) {
        await upsertToSupabase('schools', item);
      }
    }
  };

  const handleUpdateAgendas = async (newAgendas: Agenda[]) => {
    setAgendas(newAgendas);
    if (supabaseSyncEnabled && supabaseStatus.tablesExist) {
      const deleted = agendas.filter(o => !newAgendas.some(n => n.id === o.id));
      for (const item of deleted) {
        await deleteFromSupabase('agendas', item.id);
      }
      const changed = newAgendas.filter(n => {
        const matching = agendas.find(o => o.id === n.id);
        return !matching || JSON.stringify(matching) !== JSON.stringify(n);
      });
      for (const item of changed) {
        await upsertToSupabase('agendas', item);
      }
    }
  };

  const handleUpdatePrograms = async (newPrograms: ProgramKerja[]) => {
    setPrograms(newPrograms);
    if (supabaseSyncEnabled && supabaseStatus.tablesExist) {
      const deleted = programs.filter(o => !newPrograms.some(n => n.id === o.id));
      for (const item of deleted) {
        await deleteFromSupabase('programs', item.id);
      }
      const changed = newPrograms.filter(n => {
        const matching = programs.find(o => o.id === n.id);
        return !matching || JSON.stringify(matching) !== JSON.stringify(n);
      });
      for (const item of changed) {
        await upsertToSupabase('programs', item);
      }
    }
  };

  const handleUpdateSekretariat = async (newSek: Sekretariat) => {
    setSekretariat(newSek);
    if (supabaseSyncEnabled && supabaseStatus.tablesExist) {
      await saveSingleRecord('sekretariat', newSek);
    }
  };

  const handleUpdateAbout = async (newAbout: AboutMkks) => {
    setAboutInfo(newAbout);
    if (supabaseSyncEnabled && supabaseStatus.tablesExist) {
      await saveSingleRecord('about_info', newAbout);
    }
  };

  const handleUpdateUsers = async (newUsers: UserAccount[]) => {
    setUsers(newUsers);
    if (supabaseSyncEnabled && supabaseStatus.tablesExist) {
      const deleted = users.filter(o => !newUsers.some(n => n.id === o.id));
      for (const item of deleted) {
        await deleteFromSupabase('users', item.id);
      }
      const changed = newUsers.filter(n => {
        const matching = users.find(o => o.id === n.id);
        return !matching || JSON.stringify(matching) !== JSON.stringify(n);
      });
      for (const item of changed) {
        await upsertToSupabase('users', item);
      }
    }
  };

  const handleUpdateGaleri = async (newGaleri: GaleriKegiatan[]) => {
    setGaleri(newGaleri);
    if (supabaseSyncEnabled && supabaseStatus.tablesExist) {
      const deleted = galeri.filter(o => !newGaleri.some(n => n.id === o.id));
      for (const item of deleted) {
        await deleteFromSupabase('galeri', item.id);
      }
      const changed = newGaleri.filter(n => {
        const matching = galeri.find(o => o.id === n.id);
        return !matching || JSON.stringify(matching) !== JSON.stringify(n);
      });
      for (const item of changed) {
        await upsertToSupabase('galeri', item);
      }
    }
  };

  const handleUpdateDigitalFiles = async (newFiles: DigitalFile[]) => {
    setDigitalFiles(newFiles);
    if (supabaseSyncEnabled && supabaseStatus.tablesExist) {
      const deleted = digitalFiles.filter(o => !newFiles.some(n => n.id === o.id));
      for (const item of deleted) {
        await deleteFromSupabase('digital_files', item.id);
      }
      const changed = newFiles.filter(n => {
        const matching = digitalFiles.find(o => o.id === n.id);
        return !matching || JSON.stringify(matching) !== JSON.stringify(n);
      });
      for (const item of changed) {
        await upsertToSupabase('digital_files', item);
      }
    }
  };

  const handleToggleSupabaseSync = async (enabled: boolean) => {
    if (enabled) {
      const check = await checkSupabaseConnection();
      setSupabaseStatus(check);
      if (!check.connected) {
        alert('Gagal menghubungkan. Tidak dapat diverifikasi koneksi Supabase Anda: ' + check.error);
        return;
      }
      if (!check.tablesExist) {
        alert('Koneksi terhubung ke Supabase! Tetapi tabel database belum terbuat. Silakan buat tabel di panel Supabase dengan SQL yang disediakan.');
      } else {
        await pullDataFromSupabase(true);
      }
    }
    setSupabaseSyncEnabled(enabled);
    localStorage.setItem('mkks_supabase_sync', enabled ? 'true' : 'false');
  };

  // Handler: User Registration
  const handleRegisterUser = (newUser: UserAccount) => {
    // Check if user already exists by ID or Email
    const userExists = users.some(u => 
      u.id === newUser.id || 
      (u.email && newUser.email && u.email.toLowerCase().trim() === newUser.email.toLowerCase().trim())
    );
    if (!userExists) {
      const updatedUsers = [...users, newUser];
      handleUpdateUsers(updatedUsers);
    } else {
      // If user exists, update their profile with any potentially updated details
      const updatedUsers = users.map(u => {
        if (u.id === newUser.id || (u.email && newUser.email && u.email.toLowerCase().trim() === newUser.email.toLowerCase().trim())) {
          return { ...u, ...newUser };
        }
        return u;
      });
      handleUpdateUsers(updatedUsers);
    }
  };

  // Handler: Login Success
  const handleLoginSuccess = (userId: string, role: 'admin' | 'user') => {
    setActiveUserId(userId);
    localStorage.setItem('mkks_active_user_id', userId);
    if (role === 'admin') {
      setCurrentPage('admin');
      localStorage.setItem('mkks_current_page', 'admin');
    } else {
      setCurrentPage('user');
      localStorage.setItem('mkks_current_page', 'user');
    }
  };

  // Handler: Logout
  const handleLogout = () => {
    setActiveUserId(null);
    localStorage.removeItem('mkks_active_user_id');
    setCurrentPage('landing');
    localStorage.setItem('mkks_current_page', 'landing');
    supabase.auth.signOut().catch(() => {});
  };

  // Active user details helper
  const loggedInUser = users.find(u => u.id === activeUserId) || {
    id: 'u-mock',
    nama: 'Kepala Sekolah Tamu',
    email: 'tamu@sekolah.com',
    namaSekolah: 'SD Pasirwangi',
    isActive: true,
    registrationType: 'self_registered' as const
  };


  return (
    <div className="min-h-screen bg-slate-50 flex flex-col relative">
      
      {/* Dynamic View Selector Router */}
      {currentPage === 'landing' && (
        <LandingPage 
          schools={schools}
          agendas={agendas}
          users={users}
          aboutInfo={aboutInfo}
          programs={programs}
          sekretariat={sekretariat}
          galeri={galeri}
          onNavigate={setCurrentPage}
        />
      )}

      {currentPage === 'login' && (
        <LoginPage 
          users={users}
          onRegisterUser={handleRegisterUser}
          onLoginSuccess={handleLoginSuccess}
          onBackToHome={() => setCurrentPage('landing')}
        />
      )}

      {currentPage === 'admin' && (
        <AdminDashboard 
          schools={schools}
          agendas={agendas}
          programs={programs}
          sekretariat={sekretariat}
          aboutInfo={aboutInfo}
          users={users}
          galeri={galeri}
          adminProfile={adminProfile}
          digitalFiles={digitalFiles}
          onUpdateSchools={handleUpdateSchools}
          onUpdateAgendas={handleUpdateAgendas}
          onUpdatePrograms={handleUpdatePrograms}
          onUpdateSekretariat={handleUpdateSekretariat}
          onUpdateAbout={handleUpdateAbout}
          onUpdateUsers={handleUpdateUsers}
          onUpdateGaleri={handleUpdateGaleri}
          onUpdateAdminProfile={setAdminProfile}
          onUpdateDigitalFiles={handleUpdateDigitalFiles}
          onLogout={handleLogout}
          // Supabase Control Pass down
          supabaseSync={supabaseSyncEnabled}
          onToggleSupabaseSync={handleToggleSupabaseSync}
          supabaseStatus={supabaseStatus}
          onPullSupabaseData={pullDataFromSupabase}
          onPushSupabaseData={pushDataToSupabase}
        />
      )}

      {currentPage === 'user' && (
        <UserDashboard 
          currentUser={loggedInUser}
          schools={schools}
          agendas={agendas}
          programs={programs}
          sekretariat={sekretariat}
          aboutInfo={aboutInfo}
          digitalFiles={digitalFiles}
          onLogout={handleLogout}
        />
      )}

    </div>
  );
}
