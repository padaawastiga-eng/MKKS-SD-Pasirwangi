/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, FormEvent } from 'react';
import { UserAccount } from '../types';
import { School, ShieldAlert, KeyRound, Mail, User, Landmark, HelpCircle, ArrowLeft } from 'lucide-react';
import { supabase } from '../supabaseClient';

interface LoginPageProps {
  users: UserAccount[];
  onRegisterUser: (newUser: UserAccount) => void;
  onLoginSuccess: (userId: string, role: 'admin' | 'user') => void;
  onBackToHome: () => void;
}

export default function LoginPage({ users, onRegisterUser, onLoginSuccess, onBackToHome }: LoginPageProps) {
  const [isRegistering, setIsRegistering] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Login inputs
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Register inputs
  const [regName, setRegName] = useState('');
  const [regNip, setRegNip] = useState('');
  const [regSchool, setRegSchool] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPass, setRegPass] = useState('');
  const [regSuccessMsg, setRegSuccessMsg] = useState('');

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setRegSuccessMsg('');

    // Simple validation (fields cannot be empty)
    if (!username.trim() || !password.trim()) {
      setErrorMsg('Username/Email dan Password tidak boleh kosong!');
      return;
    }

    // Check for Admin
    if (username === 'Admin' && password === 'mkks037') {
      onLoginSuccess('admin', 'admin');
      return;
    }

    setIsLoading(true);

    try {
      // 1. Authenticate with Supabase Auth
      const { data, error } = await supabase.auth.signInWithPassword({
        email: username.trim(),
        password: password.trim()
      });

      if (error) {
        // If there's an error, check if email/password is wrong OR fall back to standard local credentials
        if (error.status === 400 || error.message.toLowerCase().includes('invalid') || error.message.toLowerCase().includes('credential')) {
          setErrorMsg('Email atau Password salah! Pastikan Anda memasukkan sandi yang benar atau sudah mengonfirmasi pendaftaran akun melalui email Anda.');
        } else {
          // Alternative fallback for offline mode/development mockup
          const userMatch = users.find(u => u.email.toLowerCase() === username.toLowerCase().trim());
          if (userMatch) {
            if (!userMatch.isActive) {
              setErrorMsg('Akun Anda belum disetujui atau dinonaktifkan oleh Admin!');
              setIsLoading(false);
              return;
            }
            const savedPassword = userMatch.password || 'password123';
            if (password.trim() === savedPassword) {
              onLoginSuccess(userMatch.id, 'user');
              setIsLoading(false);
              return;
            }
          }
          setErrorMsg('Gagal Autentikasi: ' + error.message);
        }
        setIsLoading(false);
        return;
      }

      // Successful Auth on Supabase!
      const sbUser = data.user;
      if (sbUser) {
        const uId = sbUser.id;
        const email = sbUser.email || '';

        // Fetch user metadata or check for record in user profiles table in Supabase
        const { data: dbUser } = await supabase
          .from('users')
          .select('*')
          .eq('id', uId)
          .maybeSingle();

        let profile: UserAccount;
        if (dbUser) {
          profile = dbUser;
        } else {
          // Generate a user profile in database
          profile = {
            id: uId,
            nama: sbUser.user_metadata?.nama || email.split('@')[0],
            nip: sbUser.user_metadata?.nip || '',
            namaSekolah: sbUser.user_metadata?.namaSekolah || 'SD Pasirwangi',
            email: email,
            isActive: true,
            registrationType: 'self_registered'
          };
          // Upsert to DB if sync is ongoing
          try {
            await supabase.from('users').upsert(profile);
          } catch (upsertErr) {
            console.warn('Gagal mencatatkan profil pengguna default ke Supabase:', upsertErr);
          }
        }

        // Add to active React user list
        onRegisterUser(profile);

        // Sign in!
        onLoginSuccess(uId, 'user');
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg('Terdapat kendala koneksi atau teknis: ' + (err.message || err));
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setRegSuccessMsg('');

    if (!regName.trim() || !regEmail.trim() || !regPass.trim() || !regSchool.trim()) {
      setErrorMsg('Harap lengkapi semua isian yang berbintang (*)');
      return;
    }

    if (regPass.trim().length < 6) {
      setErrorMsg('Sandi/Password minimal harus terdiri dari 6 karakter!');
      return;
    }

    setIsLoading(true);

    try {
      // 1. Sign up on Supabase Auth
      const { data, error } = await supabase.auth.signUp({
        email: regEmail.trim(),
        password: regPass.trim(),
        options: {
          data: {
            nama: regName.trim(),
            nip: regNip.trim(),
            namaSekolah: regSchool.trim()
          }
        }
      });

      if (error) {
        setErrorMsg('Registrasi Supabase Gagal: ' + error.message);
        setIsLoading(false);
        return;
      }

      const sbUser = data.user;
      if (!sbUser) {
        setErrorMsg('Gagal menerima informasi pengguna baru dari server.');
        setIsLoading(false);
        return;
      }

      // 2. Put record into public.users table as well
      const nUser: UserAccount = {
        id: sbUser.id,
        nama: regName.trim(),
        nip: regNip.trim() || undefined,
        namaSekolah: regSchool.trim(),
        email: regEmail.trim(),
        password: regPass.trim(),
        isActive: true, // auto activate inside schema
        registrationType: 'self_registered'
      };

      // Direct write to public.users table in Supabase
      const { error: insertError } = await supabase.from('users').upsert(nUser);
      if (insertError) {
        console.warn('Gagal mencatat profil publik ke tabel "users" Supabase:', insertError);
      }

      // Sync state to local memory
      onRegisterUser(nUser);

      // Check representation of session
      if (!data.session) {
        setRegSuccessMsg('Registrasi Berhasil! Tautan aktivasi/konfirmasi email telah dikirim. Silakan cek inbox (dan spam) email Anda (' + regEmail.trim() + ') dan klik tautan tersebut sebelum masuk.');
      } else {
        setRegSuccessMsg('Pendaftaran Berhasil! Akun Anda aktif secara instan.');
      }

      // Reset inputs
      setRegName('');
      setRegNip('');
      setRegSchool('');
      setRegEmail('');
      setRegPass('');

      setTimeout(() => {
        setIsRegistering(false);
        setUsername(regEmail.trim());
      }, 5000);

    } catch (err: any) {
      console.error(err);
      setErrorMsg('Kendala registrasi: ' + (err.message || err));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 font-sans text-slate-800 p-4 relative overflow-hidden">
      {/* Background Ornaments */}
      <div className="absolute top-[-100px] left-[-100px] w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-[-100px] right-[-100px] w-96 h-96 bg-sky-500/10 rounded-full blur-3xl pointer-events-none"></div>

      {/* Outermost container for visual card placement */}
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 backdrop-blur-md overflow-hidden z-10 transition-all duration-300">
        
        {/* Header decoration */}
        <div className="bg-gradient-to-r from-sky-500 via-indigo-500 to-indigo-600 px-6 py-8 text-white text-center relative">
          <button 
            type="button"
            onClick={onBackToHome}
            className="absolute top-4 left-4 p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-all text-white flex items-center justify-center cursor-pointer"
            title="Kembali ke Beranda"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>

          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mx-auto mb-3.5 shadow-inner">
            <School className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-xl font-extrabold tracking-tight">Sistem Portal MKKS SD</h2>
          <p className="text-xs text-sky-100 mt-1 font-medium uppercase tracking-wider">Kecamatan Pasirwangi, Garut</p>
        </div>

        {/* Form Area */}
        <div className="p-6 sm:p-8">
          {errorMsg && (
            <div className="mb-4 flex items-start gap-2.5 p-3.5 bg-rose-50 border-l-4 border-rose-500 rounded text-rose-800 text-xs font-medium">
              <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5 text-rose-500" />
              <span>{errorMsg}</span>
            </div>
          )}

          {regSuccessMsg && (
            <div className="mb-4 flex items-start gap-2.5 p-3.5 bg-emerald-50 border-l-4 border-emerald-500 rounded text-emerald-800 text-xs font-semibold">
              <span>{regSuccessMsg}</span>
            </div>
          )}

          {!isRegistering ? (
            /* LOGIN VIEW */
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="text-center mb-6">
                <h3 className="text-lg font-bold text-slate-800">Masuk Sistem</h3>
                <p className="text-xs text-slate-500">Gunakan akun Admin atau Akun Kepala Sekolah terdaftar Anda</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Username / Email</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Contoh: Admin atau email@anda.com"
                    className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:border-indigo-500 focus:bg-white focus:outline-none transition-colors text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <KeyRound className="w-4 h-4" />
                  </div>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:border-indigo-500 focus:bg-white focus:outline-none transition-colors text-sm"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-2 py-3 bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-600 hover:to-indigo-700 text-white font-bold rounded-xl transition-all shadow-md shadow-indigo-100 hover:shadow-lg hover:shadow-indigo-200 text-sm active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2 disabled:opacity-75 disabled:cursor-wait"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Memvalidasi...</span>
                  </>
                ) : (
                  <span>Masuk Sistem</span>
                )}
              </button>

              <div className="pt-4 border-t border-slate-100 text-center">
                <p className="text-xs text-slate-500">
                  Belum memiliki akun Kepala Sekolah?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setIsRegistering(true);
                      setErrorMsg('');
                    }}
                    className="text-indigo-600 hover:text-indigo-800 font-bold transition-colors cursor-pointer"
                  >
                    Daftar Sekarang
                  </button>
                </p>
              </div>

              {/* Convenience tip removed by user request */}
            </form>
          ) : (
            /* REGISTER VIEW */
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="text-center mb-4">
                <h3 className="text-lg font-bold text-slate-800">Registrasi Akun Anggota</h3>
                <p className="text-xs text-slate-500">Silakan daftarkan rincian jabatan Kepala Sekolah Anda</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Nama Lengkap & Gelar *</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    placeholder="Contoh: Drs. Wahyu Hidayat, M.Pd."
                    className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:border-indigo-500 focus:bg-white focus:outline-none transition-colors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">NIP Kepala Sekolah</label>
                  <input
                    type="text"
                    value={regNip}
                    onChange={(e) => setRegNip(e.target.value)}
                    placeholder="19xxxxxxxxxxxxxx"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:border-indigo-500 focus:bg-white focus:outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Nama Instansi SD *</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <Landmark className="w-3.5 h-3.5" />
                    </div>
                    <input
                      type="text"
                      required
                      value={regSchool}
                      onChange={(e) => setRegSchool(e.target.value)}
                      placeholder="SDN 1 Pasirwangi"
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:border-indigo-500 focus:bg-white focus:outline-none transition-colors"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Alamat E-mail *</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    required
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="email@sekolah.com"
                    className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:border-indigo-500 focus:bg-white focus:outline-none transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Password Baru *</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <KeyRound className="w-4 h-4" />
                  </div>
                  <input
                    type="password"
                    required
                    value={regPass}
                    onChange={(e) => setRegPass(e.target.value)}
                    placeholder="Minimal 6 Karakter"
                    className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:border-indigo-500 focus:bg-white focus:outline-none transition-colors"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-2.5 bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 text-white font-bold rounded-xl transition-all shadow-md text-xs active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2 disabled:opacity-75 disabled:cursor-wait"
                >
                  {isLoading ? (
                    <>
                      <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Mendaftarkan...</span>
                    </>
                  ) : (
                    <span>Daftar Akun Baru</span>
                  )}
                </button>
              </div>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsRegistering(false);
                    setErrorMsg('');
                  }}
                  className="text-xs text-indigo-600 font-bold hover:text-indigo-800 transition-colors cursor-pointer"
                >
                  Sudah memiliki akun? Kembali Login
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
