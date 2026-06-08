/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  MessageSquare, Send, Check, CheckCheck, Search, Paperclip, MoreVertical, 
  Smile, UserCheck, Bot, Sparkles, Phone, Video, RefreshCw, Trash2, ShieldCheck,
  FileText, CornerUpLeft, HelpCircle, X, AlertTriangle
} from 'lucide-react';
import { UserAccount } from '../types';

interface Message {
  id: string;
  text: string;
  sender: 'admin' | 'user';
  timestamp: string; // HH:MM
  status: 'sent' | 'delivered' | 'read';
  isDeleted?: boolean;
}

interface ChatContact {
  id: string;
  name: string;
  school: string;
  avatarColor: string;
  status: 'Online' | 'Offline' | 'Sedang mengetik...';
  unreadCount: number;
  lastActive: string;
  messages: Message[];
  botType?: 'custom' | 'agent' | 'educational';
}

const PRESET_CONTACTS: ChatContact[] = [
  {
    id: 'c-1',
    name: 'Bp. Hermawan, S.Pd.',
    school: 'SDN 1 Pasirwangi',
    avatarColor: 'from-emerald-500 to-teal-600',
    status: 'Online',
    unreadCount: 2,
    lastActive: 'Baru saja',
    botType: 'educational',
    messages: [
      {
        id: '1',
        text: 'Selamat pagi Pak Admin MKKS Pasirwangi. Mohon izin bertanya.',
        sender: 'user',
        timestamp: '08:15',
        status: 'read'
      },
      {
        id: '2',
        text: 'Terkait pengisian berkas kelembagaan dan pembaharuan profil Kepala Sekolah, apakah ada berkas fisik yang harus kami kumpulkan ke Sekretariat?',
        sender: 'user',
        timestamp: '08:16',
        status: 'read'
      },
      {
        id: '3',
        text: 'Selamat pagi Pak Hermawan. Selama data profil di portal online MKKS ini sudah diupdate dengan benar (termasuk status Definitif/PLT dan foto terbaru), bapak tidak perlu mengumpulkan berkas fisik ke kantor sekretariat.',
        sender: 'admin',
        timestamp: '08:24',
        status: 'read'
      },
      {
        id: '4',
        text: 'Format digital sudah cukup aman untuk database pengurus.',
        sender: 'admin',
        timestamp: '08:25',
        status: 'read'
      },
      {
        id: '5',
        text: 'Alhamdulillah, terima kasih banyak informasinya Pak Admin. Lebih praktis ya sekarang.',
        sender: 'user',
        timestamp: '08:30',
        status: 'read'
      },
      {
        id: '6',
        text: 'Oh iya pak, untuk kuitansi iuran operasional MKKS bulan ini sudah saya upload juga via menu data.',
        sender: 'user',
        timestamp: '08:32',
        status: 'read'
      }
    ]
  },
  {
    id: 'c-2',
    name: 'Ibu Sri Wahyuni, M.Pd.',
    school: 'SDN 3 Pasirwangi',
    avatarColor: 'from-amber-400 to-orange-500',
    status: 'Online',
    unreadCount: 0,
    lastActive: 'Aktif 5m yang lalu',
    botType: 'agent',
    messages: [
      {
        id: '1',
        text: 'Assalamualaikum, rekan-rekan pengurus MKKS.',
        sender: 'user',
        timestamp: 'Kemarin',
        status: 'read'
      },
      {
        id: '2',
        text: 'Kami dari panitia Festival FLS2N SD tingkat Kecamatan ingin mengonfirmasi jadwal rapat finalisasi besok jumat.',
        sender: 'user',
        timestamp: 'Kemarin',
        status: 'read'
      },
      {
        id: '3',
        text: 'Waalaikumsalam Bu Sri. Betul sekali, untuk jadwal finalisasi teknis FLS2N akan kita laksanakan jam 09.00 WIB bertempat di Ruang Sidang Sekretariat MKKS Kecamatan Pasirwangi.',
        sender: 'admin',
        timestamp: 'Kemarin',
        status: 'read'
      },
      {
        id: '4',
        text: 'Baik, siap pak. Kami siapkan draf pengumuman dan daftar pialanya dahulu ya.',
        sender: 'user',
        timestamp: '10:02',
        status: 'read'
      }
    ]
  },
  {
    id: 'c-3',
    name: 'Bp. Drs. Cecep Supriatna',
    school: 'SDN 2 Padaawas',
    avatarColor: 'from-sky-500 to-indigo-600',
    status: 'Offline',
    unreadCount: 0,
    lastActive: 'Kemarin',
    botType: 'educational',
    messages: [
      {
        id: '1',
        text: 'Permisi Pak, terkait kendala akun operator sekolah kami yang tidak bisa login ke portal, kemana kami harus ajukan reset password?',
        sender: 'user',
        timestamp: 'Kamis',
        status: 'read'
      },
      {
        id: '2',
        text: 'Silakan hubungi admin sistem utama melalui menu Pengaturan User atau kirim permohonan tertulis ke admin global agar divalidasi manual.',
        sender: 'admin',
        timestamp: 'Kamis',
        status: 'read'
      },
      {
        id: '3',
        text: 'Baik, akan segera kami koordinasikan dengan operator kami. Hatur nuhun.',
        sender: 'user',
        timestamp: 'Kamis',
        status: 'read'
      }
    ]
  },
  {
    id: 'c-bot',
    name: 'MKKS Smart Help-Bot (AI)',
    school: 'Asisten Virtual Cerdas',
    avatarColor: 'from-violet-600 to-fuchsia-600 border border-violet-350',
    status: 'Online',
    unreadCount: 0,
    lastActive: 'Selalu Aktif',
    botType: 'custom',
    messages: [
      {
        id: '1',
        text: 'Halo! Saya adalah MKKS Smart Assist-Bot 🤖 siap mendampingi kebutuhan informasi Anda seputar administrasi sekolah se-Kecamatan Pasirwangi.',
        sender: 'user',
        timestamp: '06:00',
        status: 'read'
      },
      {
        id: '2',
        text: 'Ketik apa saja berkaitan dengan "RKAS", "Dana BOS", "Mutasi Guru", "Kalender Akademik", "FLS2N", atau "Akun" untuk berkonsultasi secara interaktif!',
        sender: 'user',
        timestamp: '06:01',
        status: 'read'
      }
    ]
  }
];

const BOT_REPLIES = {
  rkas: "Terkait pengisian Rencana Kegiatan dan Anggaran Sekolah (RKAS) SD se-Pasirwangi, harap pastikan pagu indikatif BOS Reguler disesuaikan dengan jumlah siswa Dapodik cut-off terbaru. Jika ada kendala input, silakan lakukan sinkronisasi ulang di ARKAS pusat.",
  bos: "Penyaluran Dana BOS tahap berikutnya memerlukan kelancaran pelaporan Surat Pertanggungjawaban (SPJ) tahap sebelumnya. Sesuai juknis, laporan minimal 80% realisasi harus diunggah dan diverifikasi Dinas Pendidikan Kabupaten Garut.",
  mutasi: "Untuk pengaduan mutasi guru atau staf sekolah dasar, mohon pastikan berkas SK penempatan asli dari Badan Kepegawaian Daerah (BKD) dan rekomendasi dinas terkait diunggah secara legal untuk pembaharuan Dapodik.",
  agenda: "Agenda rapat kerja terdekat pengurus MKKS Kecamatan Pasirwangi dapat dilihat secara real-time pada tab menu 'Agenda Rapat'. Pengurus juga mengirimkan notifikasi resmi berupa surat undangan fisik serta PDF yang bisa diunduh di tab tersebut.",
  fls2n: "Fasilitasi seleksi Festival & Lomba Seni Siswa Nasional (FLS2N) tingkat Kecamatan Pasirwangi dikoordinasikan langsung oleh seksi bakat minat MKKS siswa. Pastikan siswa diinput pada aplikasi pusat Kemdikbud tepat waktu.",
  akun: "Jika operator atau guru kesulitan masuk (masalah kredensial login), silakan admin lakukan pembaharuan/reset sandi pada menu 'Pengaturan User'. Pastikan status akun diaktifkan (Centang Hijau Aktif).",
  halo: "Halo! Selamat datang di Help Desk MKKS Kecamatan Pasirwangi. Ada yang bisa kami bantu seputar regulasi sekolah, pelaporan administrasi, atau agenda kerja?",
  default: "Terima kasih atas pesan yang Anda kirimkan. Kami selaku Tim Pengurus MKKS SD Kecamatan Pasirwangi akan memverifikasi perihal ini secepatnya. Jika ini mendesak, silakan ajukan koordinasi khusus atau datangi kantor sekretariat."
};

const EMOJI_CATEGORIES = [
  {
    name: 'Ekspresi / Wajah 😃',
    emojis: ['😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', '😇', '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😋', '😜', '🤪', '🤨', '🧐', '🤓', '😎', '🥸', '🤩', '🥳', '😏', '😒', '😞', '😔', '😟', '🤫']
  },
  {
    name: 'Isyarat & Reaksi 👍',
    emojis: ['👍', '👎', '👌', '🤝', '👏', '🙌', '🙏', '💪', '💡', '🔥', '✨', '🎉', '🌟', '✅', '❌', '⚠️', '💯', '🔔']
  },
  {
    name: 'Pendidikan & Kantor 🏫',
    emojis: ['🏫', '📚', '📝', '✏️', '💼', '📌', '📎', '📂', '🛡️', '📊', '📈', '📋', '🗓️', '🎓', '✉️', '💬']
  }
];

const QUICK_REPLIES = [
  "Baik, kami terima laporannya.",
  "Mohon ditunggu sebentar ya, sedang kami koordinasikan.",
  "Kuitansi & berkas fisik sudah kami sahkan di sekretariat.",
  "Harap lengkapi profil sekolah Anda di menu Kelembagaan.",
  "Rapat besok wajib dihadiri oleh seluruh Kepala Sekolah!"
];

export default function HelpDeskChat() {
  const [deletedContactIds, setDeletedContactIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('mkks_helpdesk_deleted_contacts');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  const [contacts, setContacts] = useState<ChatContact[]>(() => {
    try {
      let regUsers: UserAccount[] = [];
      const savedUsers = localStorage.getItem('mkks_users');
      if (savedUsers) {
        regUsers = JSON.parse(savedUsers);
      } else {
        regUsers = [
          {
            id: 'u-1',
            nama: 'Ahmad Sodikin, S.Pd.',
            namaSekolah: 'SDN 1 Sarimukti',
            email: 'ahmad.sarimukti@gmail.com',
            isActive: true,
            registrationType: 'self_registered'
          },
          {
            id: 'u-2',
            nama: 'Dewi Lestari, M.Pd.',
            namaSekolah: 'SDN 2 Pasirwangi',
            email: 'dewi.pasirwangi@gmail.com',
            isActive: true,
            registrationType: 'admin_forced'
          }
        ];
      }

      // Filter out admin users and modern self logged-in user
      const loggedInUserId = localStorage.getItem('mkks_active_user_id');
      const cleanUsers = regUsers.filter(u => 
        u.id !== 'admin' && 
        u.id !== 'u-admin' && 
        u.email !== 'admin@mkks.com' &&
        (!loggedInUserId || u.id !== loggedInUserId)
      );

      // Deduplicate to prevent duplicate usernames
      const uniqueUsers: UserAccount[] = [];
      const seenIds = new Set<string>();
      const seenEmails = new Set<string>();
      for (const u of cleanUsers) {
        const uId = u.id;
        const emailLower = (u.email || '').toLowerCase().trim();
        if (!seenIds.has(uId) && (!emailLower || !seenEmails.has(emailLower))) {
          seenIds.add(uId);
          if (emailLower) seenEmails.add(emailLower);
          uniqueUsers.push(u);
        }
      }

      const savedStr = localStorage.getItem('mkks_helpdesk_chats_v2');
      let savedChats: ChatContact[] = savedStr ? JSON.parse(savedStr) : [];

      const AVATAR_COLORS = [
        'from-emerald-500 to-teal-600',
        'from-amber-400 to-orange-500',
        'from-sky-500 to-indigo-600',
        'from-rose-500 to-pink-600',
        'from-indigo-500 to-purple-600',
      ];

      return uniqueUsers.map((user, index) => {
        const existing = savedChats.find(c => c.id === user.id);
        if (existing) {
          return {
            ...existing,
            name: user.nama,
            school: user.namaSekolah || 'Sekolah Dasar',
          };
        }

        const avatarColor = AVATAR_COLORS[index % AVATAR_COLORS.length];
        return {
          id: user.id,
          name: user.nama,
          school: user.namaSekolah || 'Sekolah Dasar',
          avatarColor,
          status: 'Online',
          unreadCount: 0,
          lastActive: 'Baru saja',
          messages: [
            {
              id: 'welcome-' + user.id,
              text: `Selamat pagi Bapak/Ibu Admin MKKS Pasirwangi. Mohon izin bertanya perihal pengisian berkas kelembagaan dan pembaharuan profil Kepala Sekolah di portal online MKKS ini.`,
              sender: 'user',
              timestamp: '08:15',
              status: 'read'
            },
            {
              id: 'welcome-2-' + user.id,
              text: `Apakah kuitansi iuran operasional MKKS bulan ini sudah divalidasi?`,
              sender: 'user',
              timestamp: '08:16',
              status: 'read'
            }
          ]
        };
      });
    } catch (e) {
      console.error(e);
      return [];
    }
  });

  const [activeContactId, setActiveContactId] = useState<string>(() => {
    try {
      const savedUsers = localStorage.getItem('mkks_users');
      if (savedUsers) {
        const regUsers: UserAccount[] = JSON.parse(savedUsers);
        const loggedInUserId = localStorage.getItem('mkks_active_user_id');
        const cleanUsers = regUsers.filter(u => 
          u.id !== 'admin' && 
          u.id !== 'u-admin' && 
          u.email !== 'admin@mkks.com' &&
          (!loggedInUserId || u.id !== loggedInUserId)
        );

        // Deduplicate to prevent duplicate usernames
        const uniqueUsers: UserAccount[] = [];
        const seenIds = new Set<string>();
        const seenEmails = new Set<string>();
        for (const u of cleanUsers) {
          const uId = u.id;
          const emailLower = (u.email || '').toLowerCase().trim();
          if (!seenIds.has(uId) && (!emailLower || !seenEmails.has(emailLower))) {
            seenIds.add(uId);
            if (emailLower) seenEmails.add(emailLower);
            uniqueUsers.push(u);
          }
        }

        const savedDeleted = localStorage.getItem('mkks_helpdesk_deleted_contacts');
        const deletedIds: string[] = savedDeleted ? JSON.parse(savedDeleted) : [];
        const visible = uniqueUsers.filter(u => !deletedIds.includes(u.id));
        if (visible.length > 0) {
          return visible[0].id;
        }
      }
    } catch (e) {
      console.error(e);
    }
    return '';
  });

  const [searchContactQuery, setSearchContactQuery] = useState('');
  const [inputMessage, setInputMessage] = useState('');
  const [typingContactId, setTypingContactId] = useState<string | null>(null);
  
  // State for deleting individual messages
  const [selectedDeleteMessage, setSelectedDeleteMessage] = useState<Message | null>(null);
  const [activeMenuMessageId, setActiveMenuMessageId] = useState<string | null>(null);

  // Custom Dynamic Dialog/Popup States
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [showResetAllConfirm, setShowResetAllConfirm] = useState(false);
  const [showContactInfo, setShowContactInfo] = useState(false);

  // New Interactive states and refs
  const [headerMenuOpen, setHeaderMenuOpen] = useState(false);
  const [emojiPickerOpen, setEmojiPickerOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Read registered users from local storage dynamically
  useEffect(() => {
    try {
      const savedUsers = localStorage.getItem('mkks_users');
      if (!savedUsers) return;
      const regUsers: UserAccount[] = JSON.parse(savedUsers);
      const loggedInUserId = localStorage.getItem('mkks_active_user_id');
      const cleanUsers = regUsers.filter(u => 
        u.id !== 'admin' && 
        u.id !== 'u-admin' && 
        u.email !== 'admin@mkks.com' &&
        (!loggedInUserId || u.id !== loggedInUserId)
      );

      // Deduplicate to prevent duplicate usernames
      const uniqueUsers: UserAccount[] = [];
      const seenIds = new Set<string>();
      const seenEmails = new Set<string>();
      for (const u of cleanUsers) {
        const uId = u.id;
        const emailLower = (u.email || '').toLowerCase().trim();
        if (!seenIds.has(uId) && (!emailLower || !seenEmails.has(emailLower))) {
          seenIds.add(uId);
          if (emailLower) seenEmails.add(emailLower);
          uniqueUsers.push(u);
        }
      }

      setContacts(prev => {
        const AVATAR_COLORS = [
          'from-emerald-500 to-teal-600',
          'from-amber-400 to-orange-500',
          'from-sky-500 to-indigo-600',
          'from-rose-500 to-pink-600',
          'from-indigo-500 to-purple-600',
        ];

        return uniqueUsers.map((user, index) => {
          const existing = prev.find(c => c.id === user.id);
          if (existing) {
            return {
              ...existing,
              name: user.nama,
              school: user.namaSekolah || 'Sekolah Dasar',
            };
          }

          // Fetch from old saved chats if any
          const savedChatsStr = localStorage.getItem('mkks_helpdesk_chats_v2');
          const savedChats: ChatContact[] = savedChatsStr ? JSON.parse(savedChatsStr) : [];
          const oldExisting = savedChats.find(c => c.id === user.id);
          if (oldExisting) {
            return {
              ...oldExisting,
              name: user.nama,
              school: user.namaSekolah || 'Sekolah Dasar',
            };
          }

          const avatarColor = AVATAR_COLORS[index % AVATAR_COLORS.length];
          return {
            id: user.id,
            name: user.nama,
            school: user.namaSekolah || 'Sekolah Dasar',
            avatarColor,
            status: 'Online',
            unreadCount: 0,
            lastActive: 'Baru saja',
            messages: [
              {
                id: 'welcome-' + user.id,
                text: `Selamat pagi Bapak/Ibu Admin MKKS Pasirwangi. Mohon izin bertanya perihal pengisian berkas kelembagaan dan pembaharuan profil Kepala Sekolah di portal online MKKS ini.`,
                sender: 'user',
                timestamp: '08:15',
                status: 'read'
              },
              {
                id: 'welcome-2-' + user.id,
                text: `Apakah kuitansi iuran operasional MKKS bulan ini sudah divalidasi?`,
                sender: 'user',
                timestamp: '08:16',
                status: 'read'
              }
            ]
          };
        });
      });
    } catch (e) {
      console.error(e);
    }
  }, [deletedContactIds]);

  const visibleContacts = contacts.filter(c => !deletedContactIds.includes(c.id));
  const activeContact = visibleContacts.find(c => c.id === activeContactId) || visibleContacts[0];

  useEffect(() => {
    localStorage.setItem('mkks_helpdesk_chats_v2', JSON.stringify(contacts));
  }, [contacts]);

  // Scroll to bottom helper
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [activeContact?.messages, typingContactId]);

  // Mark active chat as read
  useEffect(() => {
    if (activeContact && activeContact.unreadCount > 0) {
      setContacts(prev => prev.map(c => {
        if (c.id === activeContact.id) {
          return {
            ...c,
            unreadCount: 0,
            messages: c.messages.map(m => m.sender === 'user' ? { ...m, status: 'read' as const } : m)
          };
        }
        return c;
      }));
    }
  }, [activeContactId]);

  const handleDeleteParticipant = (id: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus peserta obrolan ini dari daftar?')) {
      const updated = [...deletedContactIds, id];
      setDeletedContactIds(updated);
      localStorage.setItem('mkks_helpdesk_deleted_contacts', JSON.stringify(updated));
      
      const remaining = contacts.filter(c => c.id !== id && !updated.includes(c.id));
      if (activeContactId === id) {
        if (remaining.length > 0) {
          setActiveContactId(remaining[0].id);
        } else {
          setActiveContactId('');
        }
      }
    }
  };

  const handleSendMessage = (textToSend: string) => {
    if (!textToSend.trim()) return;

    const timeString = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
    const newMessage: Message = {
      id: 'm-' + Date.now(),
      text: textToSend.trim(),
      sender: 'admin',
      timestamp: timeString,
      status: 'sent'
    };

    // 1. Add admin's outgoing message to active chat
    setContacts(prev => prev.map(c => {
      if (c.id === activeContact.id) {
        return {
          ...c,
          lastActive: 'Baru saja',
          messages: [...c.messages, newMessage]
        };
      }
      return c;
    }));

    setInputMessage('');

    // Simulate delivered tick after 650ms, then read receipt after 1.2s
    setTimeout(() => {
      setContacts(prev => prev.map(c => {
        if (c.id === activeContact.id) {
          return {
            ...c,
            messages: c.messages.map(m => m.id === newMessage.id ? { ...m, status: 'delivered' as const } : m)
          };
        }
        return c;
      }));
    }, 650);

    setTimeout(() => {
      setContacts(prev => prev.map(c => {
        if (c.id === activeContact.id) {
          return {
            ...c,
            messages: c.messages.map(m => m.id === newMessage.id ? { ...m, status: 'read' as const } : m)
          };
        }
        return c;
      }));
    }, 1200);

    // 2. Trigger automatic smart response from contact/bot
    triggerAutomaticResponse(textToSend.trim().toLowerCase(), activeContact.id);
  };

  const triggerAutomaticResponse = (inputText: string, contactId: string) => {
    // Set simulated typing state after 1.5 seconds
    setTimeout(() => {
      setTypingContactId(contactId);
      setContacts(prev => prev.map(c => {
        if (c.id === contactId) {
          return { ...c, status: 'Sedang mengetik...' };
        }
        return c;
      }));
    }, 1500);

    // Finalize bot response after 3.2 seconds
    setTimeout(() => {
      let responseText = '';
      
      // Smart Keyword matcher in Indonesian
      if (inputText.includes('rkas') || inputText.includes('rencana anggaran')) {
        responseText = BOT_REPLIES.rkas;
      } else if (inputText.includes('bos') || inputText.includes('dana') || inputText.includes('spj')) {
        responseText = BOT_REPLIES.bos;
      } else if (inputText.includes('mutasi') || inputText.includes('guru') || inputText.includes('pindah')) {
        responseText = BOT_REPLIES.mutasi;
      } else if (inputText.includes('agenda') || inputText.includes('rapat') || inputText.includes('jadwal')) {
        responseText = BOT_REPLIES.agenda;
      } else if (inputText.includes('fls2n') || inputText.includes('lomba') || inputText.includes('festival')) {
        responseText = BOT_REPLIES.fls2n;
      } else if (inputText.includes('akun') || inputText.includes('login') || inputText.includes('sandi') || inputText.includes('password')) {
        responseText = BOT_REPLIES.akun;
      } else if (inputText.includes('halo') || inputText.includes('pagi') || inputText.includes('assalamualaikum') || inputText.includes('permisi')) {
        responseText = BOT_REPLIES.halo;
      } else {
        responseText = BOT_REPLIES.default;
      }

      const replyStringTime = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
      const incomingMessage: Message = {
        id: 'reply-' + Date.now(),
        text: responseText,
        sender: 'user',
        timestamp: replyStringTime,
        status: 'read'
      };

      setTypingContactId(null);
      setContacts(prev => prev.map(c => {
        if (c.id === contactId) {
          // If active chat is something else, increment unread count
          const isNotCurrent = c.id !== activeContactId;
          return {
            ...c,
            status: 'Online',
            unreadCount: isNotCurrent ? c.unreadCount + 1 : 0,
            messages: [...c.messages, incomingMessage]
          };
        }
        return c;
      }));
    }, 3500);
  };

  const handleDeleteForMe = (messageId: string) => {
    setContacts(prev => {
      const updated = prev.map(c => {
        if (c.id === activeContact.id) {
          return {
            ...c,
            messages: c.messages.filter(m => m.id !== messageId)
          };
        }
        return c;
      });
      return updated;
    });
    setSelectedDeleteMessage(null);
  };

  const handleDeleteForEveryone = (messageId: string) => {
    setContacts(prev => {
      const updated = prev.map(c => {
        if (c.id === activeContact.id) {
          return {
            ...c,
            messages: c.messages.map(m => m.id === messageId ? {
              ...m,
              text: '🚫 Pesan ini telah dihapus oleh pengirim',
              isDeleted: true
            } : m)
          };
        }
        return c;
      });
      return updated;
    });
    setSelectedDeleteMessage(null);
  };

  const handleClearChatHistory = () => {
    setShowClearConfirm(true);
  };

  const confirmClearChatHistory = () => {
    setContacts(prev => prev.map(c => {
      if (c.id === activeContact.id) {
        return { ...c, messages: [] };
      }
      return c;
    }));
    setShowClearConfirm(false);
  };

  const handleResetAllChats = () => {
    setShowResetAllConfirm(true);
  };

  const confirmResetAllChats = () => {
    setContacts(prev => prev.map(c => ({
      ...c,
      messages: [],
      unreadCount: 0,
      status: 'Online'
    })));
    setShowResetAllConfirm(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fileSizeKB = Math.round(file.size / 1024);
    const timeString = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });

    // Send mock file upload details
    const fileMessage: Message = {
      id: 'm-file-' + Date.now(),
      text: `📁 Berkas Lampiran:\n📄 Nama: ${file.name}\n⚖️ Ukuran: ${fileSizeKB} KB\n📂 Tipe: ${file.type || 'Dokumen'}\n\n[Sistem MKKS: Berkas berhasil diunggah secara aman ke server awan]`,
      sender: 'admin',
      timestamp: timeString,
      status: 'sent'
    };

    setContacts(prev => prev.map(c => {
      if (c.id === activeContact.id) {
        return {
          ...c,
          lastActive: 'Baru saja',
          messages: [...c.messages, fileMessage]
        };
      }
      return c;
    }));

    // Trigger delivery simulation
    setTimeout(() => {
      setContacts(prev => prev.map(c => {
        if (c.id === activeContact.id) {
          return {
            ...c,
            messages: c.messages.map(m => m.id === fileMessage.id ? { ...m, status: 'delivered' as const } : m)
          };
        }
        return c;
      }));
    }, 700);

    setTimeout(() => {
      setContacts(prev => prev.map(c => {
        if (c.id === activeContact.id) {
          return {
            ...c,
            messages: c.messages.map(m => m.id === fileMessage.id ? { ...m, status: 'read' as const } : m)
          };
        }
        return c;
      }));
    }, 1300);

    // Dynamic Reply for files
    setTimeout(() => {
      setTypingContactId(activeContact.id);
      setContacts(prev => prev.map(c => {
        if (c.id === activeContact.id) {
          return { ...c, status: 'Sedang mengetik...' };
        }
        return c;
      }));
    }, 1850);

    setTimeout(() => {
      const replyStringTime = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
      const replyMsg: Message = {
        id: 'reply-file-' + Date.now(),
        text: `Terima kasih banyak Pak/Bu Admin, berkas laporan "${file.name}" telah kami terima dengan baik di basis data sekolah Kecamatan Pasirwangi. 🙏 Kami akan segera memverifikasinya.`,
        sender: 'user',
        timestamp: replyStringTime,
        status: 'read'
      };

      setTypingContactId(null);
      setContacts(prev => prev.map(c => {
        if (c.id === activeContact.id) {
          return {
            ...c,
            status: 'Online',
            messages: [...c.messages, replyMsg]
          };
        }
        return c;
      }));
    }, 3805);

    if (e.target) {
      e.target.value = '';
    }
  };

  const visibleFilteredContacts = visibleContacts.filter(c => 
    (c.name || '').toLowerCase().includes(searchContactQuery.toLowerCase()) || 
    (c.school || '').toLowerCase().includes(searchContactQuery.toLowerCase())
  );

  return (
    <div className="bg-slate-50 border border-slate-200 rounded-2xl overflow-hidden shadow-sm flex flex-col h-[650px] md:h-[680px]">
      {/* Top Banner Alert (Canggih Help Desk branding) */}
      <div className="bg-gradient-to-r from-emerald-600 via-teal-700 to-indigo-700 py-2.5 px-4 text-white flex items-center justify-between text-[11px] font-medium border-b border-white/10">
        <div className="flex items-center gap-2">
          <span className="p-1 bg-white/20 rounded-md">
            <ShieldCheck className="w-4 h-4 text-emerald-300" />
          </span>
          <span>
            <strong>MKKS Help Desk v2.1</strong> &bull; Seluruh lalu lintas terenkripsi secara aman dan divalidasi dinamis.
          </span>
        </div>
        <div className="flex items-center gap-3">
          <button 
            type="button" 
            onClick={confirmResetAllChats}
            className="hover:text-emerald-100 flex items-center gap-1 bg-white/10 px-2 py-0.5 rounded border border-white/20 transition cursor-pointer font-bold text-[10px]"
            title="Reset Database Chat"
          >
            <RefreshCw className="w-3 h-3 animate-spin duration-1000" /> RESET CHAT
          </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* LEFT COLUMN: Sidebar Chat Contacts */}
        <aside className="w-80 border-r border-slate-200 flex flex-col bg-white">
          {/* Search Inputs */}
          <div className="p-4 border-b border-slate-150 space-y-3">
            <h2 className="text-sm font-black text-slate-800 flex items-center gap-2">
              <MessageSquare className="w-4.5 h-4.5 text-emerald-600" />
              <span>Saluran Obrolan ({visibleContacts.length})</span>
            </h2>
            <div className="relative">
              <input
                type="text"
                placeholder="Cari kepala sekolah / instansi..."
                value={searchContactQuery}
                onChange={(e) => setSearchContactQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-100 border border-slate-200 rounded-xl focus:bg-white focus:border-emerald-500 focus:outline-none text-xs transition duration-200"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            </div>
          </div>

          {/* Contact Scroll List */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
            {visibleFilteredContacts.length === 0 ? (
              <div className="p-8 text-center text-slate-450 space-y-2 mt-4">
                <HelpCircle className="w-8 h-8 text-slate-300 mx-auto opacity-70" />
                <p className="text-xs font-semibold text-slate-450">Kontak tidak ditemukan</p>
                <p className="text-[10px] text-slate-400">Pastikan nama instansi atau guru terdaftar di Kecamatan Pasirwangi.</p>
              </div>
            ) : (
              visibleFilteredContacts.map(contact => {
                const latestMsg = contact.messages[contact.messages.length - 1];
                const avatarText = (contact.name || 'User')
                  .split(' ')
                  .filter(Boolean)
                  .map(n => n[0])
                  .join('')
                  .substring(0, 2)
                  .toUpperCase();

                return (
                  <button
                    key={contact.id}
                    onClick={() => setActiveContactId(contact.id)}
                    className={`w-full p-3.5 flex sm:gap-3 items-start hover:bg-slate-50 transition-all border-l-4 text-left cursor-pointer relative group ${activeContactId === contact.id ? 'bg-emerald-50/60 border-l-emerald-600' : 'border-l-transparent'}`}
                  >
                    {/* Visual Avatar */}
                    <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${contact.avatarColor} text-white flex items-center justify-center font-bold text-xs shadow-sm shadow-black/10 flex-shrink-0 relative`}>
                      {avatarText}
                      {contact.status === 'Online' && (
                        <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full"></span>
                      )}
                    </div>
                    {/* Contact Text details */}
                    <div className="flex-1 min-w-0 ml-3 pr-2">
                      <div className="flex justify-between items-baseline mb-0.5">
                        <span className="font-extrabold text-slate-900 text-xs truncate leading-none">
                          {contact.name}
                        </span>
                        <span className="text-[8px] font-bold text-slate-400 font-mono">
                          {contact.lastActive}
                        </span>
                      </div>
                      <span className="block text-[10px] text-sky-600 font-bold tracking-normal truncate mb-1">
                        🏢 {contact.school}
                      </span>
                      <p className="text-[11px] text-slate-500 truncate leading-snug">
                        {contact.status === 'Sedang mengetik...' ? (
                          <span className="text-emerald-600 font-bold animate-pulse">Mengetik tanggapan...</span>
                        ) : (
                          latestMsg ? latestMsg.text : 'Mulai pesan baru...'
                        )}
                      </p>
                    </div>

                    {/* Unread Pill indicator or Hover delete button */}
                    <div className="flex flex-col items-end justify-center shrink-0 min-w-[20px] self-stretch">
                      {contact.unreadCount > 0 ? (
                        <span className="bg-emerald-600 text-white font-black text-[9px] w-5 h-5 flex items-center justify-center rounded-full shadow-sm animate-bounce shadow-emerald-600/30">
                          {contact.unreadCount}
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteParticipant(contact.id);
                          }}
                          className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-rose-600 hover:bg-rose-50 p-1.5 rounded-full transition-all duration-155 cursor-pointer flex items-center justify-center"
                          title="Hapus Peserta Obrolan"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </aside>

        {/* RIGHT COLUMN: WhatsApp Web Interactive Pane */}
        <section className="flex-1 flex flex-col bg-[#efeae2]/15 relative overflow-hidden" style={{ backgroundImage: 'linear-gradient(rgba(240,242,245,0.7), rgba(240,242,245,0.7)), url("https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564")' }}>
          
          {!activeContact ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-[#f5f6f8]/80 backdrop-blur-xs space-y-4">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-md">
                <MessageSquare className="w-8 h-8 animate-bounce duration-1000" />
              </div>
              <h3 className="text-sm font-black text-slate-800">Tidak Ada Saluran Obrolan Aktif</h3>
              <p className="text-xs text-slate-550 max-w-sm leading-relaxed">
                Harap tunggu hingga terdapat kepala sekolah atau staf instansi terdaftar yang mendaftar atau mengirimkan pengajuan bantuan ke portal MKKS SD Kecamatan Pasirwangi.
              </p>
            </div>
          ) : (
            <>
              {/* Active Contact Header Panel */}
          <div className="bg-[#f0f2f5] px-4 py-3.5 border-b border-slate-205 flex items-center justify-between shadow-sm z-10">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${activeContact.avatarColor} text-white flex items-center justify-center font-bold text-xs shadow-inner`}>
                {activeContact.name.split(' ').map(n=>n[0]).join('').substring(0,2).toUpperCase()}
              </div>
              <div>
                <h3 className="font-extrabold text-slate-900 text-xs flex items-center gap-1.5 leading-none">
                  <span>{activeContact.name}</span>
                  {activeContact.botType === 'custom' && (
                    <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-indigo-100 border border-indigo-200 text-[8px] text-indigo-700 font-black">
                      <Bot className="w-2.5 h-2.5" /> SMART AI
                    </span>
                  )}
                </h3>
                <span className="text-[10px] text-slate-500 font-bold block mt-1">
                  🏫 {activeContact.school} &bull;{' '} 
                  <span className={activeContact.status.startsWith('Sedang') ? 'text-emerald-600 font-bold animate-pulse' : 'text-slate-400 font-medium'}>
                    {activeContact.status}
                  </span>
                </span>
              </div>
            </div>

            {/* Actions with Dropdown Menu */}
            <div className="flex items-center gap-1 text-slate-500 relative">
              {/* Direct Trash Icon shortcut for Kosongkan Obrolan */}
              <button 
                onClick={handleClearChatHistory}
                className="p-2 hover:bg-rose-50 text-rose-500 hover:text-rose-600 rounded-full transition cursor-pointer flex items-center justify-center"
                title="Kosongkan Obrolan (Hapus semua isi chat kontak ini)"
              >
                <Trash2 className="w-4.5 h-4.5" />
              </button>

              <div className="h-5 w-px bg-slate-200 mx-1"></div>

              {/* Three-dots menu button */}
              <button 
                onClick={() => setHeaderMenuOpen(!headerMenuOpen)}
                className={`p-2 hover:bg-slate-200/60 rounded-full transition cursor-pointer relative ${headerMenuOpen ? 'bg-slate-200 text-slate-800' : 'text-slate-600'}`} 
                title="Opsi Lanjutan"
              >
                <MoreVertical className="w-4.5 h-4.5" />
              </button>

              {/* Options Dropdown menu overlay */}
              {headerMenuOpen && (
                <>
                  <div className="fixed inset-0 z-20" onClick={() => setHeaderMenuOpen(false)}></div>
                  <div className="absolute right-0 top-11 bg-white border border-slate-200 rounded-2xl shadow-xl py-2 z-30 min-w-[210px] text-slate-700 animate-in fade-in slide-in-from-top-1 duration-155">
                    <div className="px-3.5 py-1 text-[9px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-100 mb-1.5">
                      Menu Manajemen Obrolan
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        handleClearChatHistory();
                        setHeaderMenuOpen(false);
                      }}
                      className="w-full text-left px-4 py-2.5 text-xs hover:bg-slate-50 transition flex items-center gap-2 text-rose-600 font-extrabold cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                      Kosongkan Obrolan
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (activeContact) {
                          handleDeleteParticipant(activeContact.id);
                        }
                        setHeaderMenuOpen(false);
                      }}
                      className="w-full text-left px-4 py-2.5 text-xs hover:bg-rose-50 text-rose-700 hover:text-rose-800 transition flex items-center gap-2 font-extrabold cursor-pointer border-t border-b border-slate-100"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                      Hapus Peserta Obrolan
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        handleResetAllChats();
                        setHeaderMenuOpen(false);
                      }}
                      className="w-full text-left px-4 py-2.5 text-xs hover:bg-slate-50 transition flex items-center gap-2 font-bold cursor-pointer"
                    >
                      <RefreshCw className="w-3.5 h-3.5 text-indigo-500" />
                      Reset Semua Obrolan MKKS
                    </button>
                    <div className="h-px bg-slate-100 my-1"></div>
                    <button
                      type="button"
                      onClick={() => {
                        setShowContactInfo(true);
                        setHeaderMenuOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 text-xs hover:bg-slate-50 transition flex items-center gap-2 text-slate-600 font-medium cursor-pointer"
                    >
                      <UserCheck className="w-3.5 h-3.5 text-emerald-500" />
                      Tampilkan Detail Kontak
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Chat Messages Body Area */}
          <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
            
            {/* Disclaimer Security Notice */}
            <div className="flex justify-center my-2">
              <span className="inline-flex items-center gap-1 bg-[#ffeecd] border border-[#ffd78a] text-[#72541a] px-3.5 py-1.5 rounded-xl text-[10px] font-medium max-w-sm text-center leading-normal shadow-sm">
                🔒 Pesan dan panggilan terenkripsi secara end-to-end. MKKS Pasirwangi tidak dapat membaca koordinat eksternal Anda. Anda sedang bertindak sebagai Admin.
              </span>
            </div>

            {activeContact.messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-8 text-slate-405 space-y-3 opacity-80 min-h-[300px]">
                <MessageSquare className="w-12 h-12 text-slate-300 animate-bounce" />
                <h4 className="text-xs font-black text-slate-600">Mulai Percakapan Baru</h4>
                <p className="text-[11px] text-slate-500 max-w-xs">Ketik atau pilih salah satu balasan templat cepat di bawah untuk berkonsultasi.</p>
              </div>
            ) : (
              activeContact.messages.map(msg => {
                const isAdmin = msg.sender === 'admin';
                return (
                  <div key={msg.id} className={`flex ${isAdmin ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-250 group`}>
                    <div 
                      className={`relative max-w-md px-3.5 py-2 rounded-2xl shadow-sm text-xs leading-relaxed font-medium break-words group/bubble transition-all
                        ${isAdmin 
                          ? msg.isDeleted ? 'bg-slate-100 text-slate-400 rounded-tr-none' : 'bg-[#d9fdd3] text-slate-900 rounded-tr-none border-t border-r border-[#ceeeb1]' 
                          : msg.isDeleted ? 'bg-slate-100 text-slate-400 rounded-tl-none' : 'bg-white text-slate-900 rounded-tl-none border border-slate-200/85'
                        } ${msg.isDeleted ? 'italic text-slate-400' : ''}`}
                    >
                      {/* Dropdown Menu Overlay */}
                      {activeMenuMessageId === msg.id && (
                        <div className="absolute right-0 top-7 bg-white border border-slate-200 rounded-xl shadow-xl py-1 z-30 min-w-[150px] animate-in fade-in zoom-in-95 duration-100">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteForMe(msg.id);
                              setActiveMenuMessageId(null);
                            }}
                            className="w-full text-left px-3 py-1.5 text-[11px] text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition flex items-center gap-1.5 font-extrabold cursor-pointer"
                          >
                            Hapus untuk Saya
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteForEveryone(msg.id);
                              setActiveMenuMessageId(null);
                            }}
                            className="w-full text-left px-3 py-1.5 text-[11px] text-rose-600 hover:bg-rose-50 hover:text-rose-700 transition flex items-center gap-1.5 font-extrabold cursor-pointer border-t border-slate-100"
                          >
                            Hapus untuk Semua
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveMenuMessageId(null);
                            }}
                            className="w-full text-center px-3 py-1 text-[10px] text-slate-400 hover:bg-slate-50 transition border-t border-slate-100 cursor-pointer"
                          >
                            Batal
                          </button>
                        </div>
                      )}

                      {/* Hover options button */}
                      {!msg.isDeleted && (
                        <button
                          type="button"
                          onClick={(e) => {
                             e.stopPropagation();
                             setActiveMenuMessageId(activeMenuMessageId === msg.id ? null : msg.id);
                          }}
                          className="absolute -top-2.5 -right-2.5 w-6 h-6 bg-white border border-slate-200 text-slate-400 hover:text-rose-650 hover:text-rose-600 rounded-full shadow-md flex items-center justify-center opacity-0 group-hover/bubble:opacity-100 transition-opacity cursor-pointer z-10"
                          title="Hapus / Opsi"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}

                      <p className="text-justify whitespace-pre-line pr-1">{msg.text}</p>
                      <div className="flex items-center justify-end gap-1 mt-1 font-mono text-[8px] text-slate-450 leading-none select-none">
                        <span>{msg.timestamp}</span>
                        {isAdmin && !msg.isDeleted && (
                          <span>
                            {msg.status === 'sent' && <Check className="w-3.5 h-3.5 text-slate-400" />}
                            {msg.status === 'delivered' && <CheckCheck className="w-3.5 h-3.5 text-slate-400" />}
                            {msg.status === 'read' && <CheckCheck className="w-3.5 h-3.5 text-emerald-500" />}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}

            {/* Simulated Live Typing bubble */}
            {typingContactId === activeContact.id && (
              <div className="flex justify-start animate-in fade-in duration-200">
                <div className="bg-white text-slate-900 border border-slate-200 px-4 py-2.5 rounded-2xl rounded-tl-none shadow-sm flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Replies Panel */}
          <div className="bg-slate-100/90 backdrop-blur border-t border-slate-200 p-2.5 z-10">
            <span className="block text-[8px] font-black uppercase tracking-widest text-slate-400 mb-1.5 px-1.5 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-indigo-500" /> Balas Cepat (Quick Templates) untuk Kepala Sekolah / Instansi:
            </span>
            <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-thin select-none">
              {QUICK_REPLIES.map((reply, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleSendMessage(reply)}
                  className="bg-white hover:bg-emerald-50 hover:text-emerald-700 text-slate-700 ring-1 ring-slate-200 transition-all font-bold px-3 py-1.5 rounded-xl text-[10px] shadow-sm flex-shrink-0 cursor-pointer active:scale-95 text-justify"
                >
                  {reply}
                </button>
              ))}
            </div>
          </div>

          {/* Interactive Chat Input form with Emojis & Paperclips */}
          <form 
            onSubmit={(e) => { e.preventDefault(); handleSendMessage(inputMessage); }}
            className="bg-[#f0f2f5] px-4 py-3 border-t border-slate-205 flex items-center gap-3 z-10 relative"
          >
            {/* Complete Emoji Picker Panel overlay */}
            {emojiPickerOpen && (
              <>
                <div className="fixed inset-0 z-20" onClick={() => setEmojiPickerOpen(false)}></div>
                <div className="absolute left-4 bottom-16 bg-white border border-slate-200 shadow-2xl rounded-2xl p-4 w-80 z-30 max-h-80 overflow-y-auto animate-in fade-in slide-in-from-bottom-2 duration-150">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-3">
                    <span className="text-xs font-black text-slate-800 flex items-center gap-1.5 uppercase tracking-wider">
                      ✨ Template Smile Komplit
                    </span>
                    <button 
                      type="button" 
                      onClick={() => setEmojiPickerOpen(false)}
                      className="text-slate-400 hover:text-slate-600 font-bold text-xs"
                    >
                      Tutup
                    </button>
                  </div>
                  
                  <div className="space-y-3.5 text-left">
                    {EMOJI_CATEGORIES.map((cat, idx) => (
                      <div key={idx} className="space-y-1.5">
                        <span className="block text-[9px] font-extrabold text-slate-400 uppercase tracking-widest">
                          {cat.name}
                        </span>
                        <div className="grid grid-cols-7 gap-1">
                          {cat.emojis.map((emoji) => (
                            <button
                              key={emoji}
                              type="button"
                              onClick={() => {
                                setInputMessage(prev => prev + emoji);
                              }}
                              className="w-8 h-8 rounded-lg hover:bg-emerald-50 hover:scale-110 active:scale-95 transition flex items-center justify-center text-lg cursor-pointer"
                            >
                              {emoji}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Hidden File Input element */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
              accept="*/*"
            />

            <div className="flex items-center gap-1 text-slate-500">
              <button 
                type="button"
                onClick={() => setEmojiPickerOpen(!emojiPickerOpen)}
                className={`p-2 rounded-md transition cursor-pointer ${emojiPickerOpen ? 'bg-emerald-100 text-emerald-700' : 'hover:bg-slate-200 hover:text-slate-700'}`}
                title="Pilih Emotikon"
              >
                <Smile className="w-5 h-5" />
              </button>
              <button 
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="p-2 hover:bg-slate-200 hover:text-slate-700 rounded-md transition cursor-pointer"
                title="Pilih & Kirim Berkas Lampiran / Lap. BOS"
              >
                <Paperclip className="w-5 h-5" />
              </button>
            </div>

            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Ketik pesan konsultasi Anda disini (misal: 'bos', 'rkas')..."
              className="flex-1 px-4 py-2 bg-white border border-slate-200 rounded-xl focus:border-emerald-500 focus:outline-none text-xs leading-normal transition shadow-inner"
            />

            <button
              type="submit"
              disabled={!inputMessage.trim()}
              className={`p-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl transition duration-200 shadow-md cursor-pointer active:scale-95 disabled:bg-slate-300 disabled:shadow-none disabled:active:scale-100 disabled:cursor-not-allowed`}
              title="Kirim Pesan"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
            </>
          )}

        </section>
      </div>

      {/* MODAL 1: KOSONGKAN OBROLAN (SINGLE CONTACT DELETION) */}
      {showClearConfirm && activeContact && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-100 overflow-hidden transform transition-all animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="bg-rose-50 px-6 py-4 border-b border-rose-100 flex items-center justify-between">
              <div className="flex items-center gap-2.5 text-rose-700">
                <div className="p-1.5 bg-rose-100 rounded-lg">
                  <Trash2 className="w-5 h-5 text-rose-600" />
                </div>
                <h3 className="font-black text-sm tracking-tight">Kosongkan Riwayat Obrolan</h3>
              </div>
              <button 
                onClick={() => setShowClearConfirm(false)}
                className="text-slate-400 hover:text-slate-600 p-1 hover:bg-slate-100 rounded-full transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            {/* Content */}
            <div className="p-6 space-y-3">
              <p className="text-xs text-slate-600 leading-relaxed">
                Apakah Anda yakin ingin menghapus seluruh riwayat percakapan dengan:
              </p>
              <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl flex items-center gap-3">
                <div className={`w-9 h-9 rounded-full bg-gradient-to-br ${activeContact.avatarColor} text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-sm`}>
                  {activeContact.name.split(' ').map(n=>n[0]).join('').substring(0,2).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <h4 className="font-extrabold text-xs text-slate-800 truncate">{activeContact.name}</h4>
                  <p className="text-[10px] text-slate-500 font-bold truncate">🏫 {activeContact.school}</p>
                </div>
              </div>
              <p className="text-[11px] text-rose-600 font-bold">
                ⚠️ Seluruh pesan dalam saluran obrolan ini akan dihapus secara permanen dari perangkat ini.
              </p>
            </div>

            {/* Footer Buttons */}
            <div className="bg-slate-50 px-6 py-3.5 border-t border-slate-150 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setShowClearConfirm(false)}
                className="px-4 py-2 text-xs font-bold text-slate-550 hover:bg-slate-200/60 rounded-xl transition cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={confirmClearChatHistory}
                className="px-4 py-2 text-xs font-black text-white bg-rose-600 hover:bg-rose-700 active:scale-95 shadow-md shadow-rose-600/10 rounded-xl transition cursor-pointer"
              >
                Ya, Hapus Obrolan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: RESET SEMUA OBROLAN MKKS */}
      {showResetAllConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-100 overflow-hidden transform transition-all animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="bg-amber-50 px-6 py-4 border-b border-amber-100 flex items-center justify-between">
              <div className="flex items-center gap-2.5 text-amber-800">
                <div className="p-1.5 bg-amber-100 rounded-lg">
                  <AlertTriangle className="w-5 h-5 text-amber-600" />
                </div>
                <h3 className="font-black text-xs sm:text-sm tracking-tight">Hapus & Reset Semua Obrolan</h3>
              </div>
              <button 
                onClick={() => setShowResetAllConfirm(false)}
                className="text-slate-400 hover:text-slate-600 p-1 hover:bg-slate-100 rounded-full transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            {/* Content */}
            <div className="p-6 space-y-4">
              <p className="text-xs text-slate-600 leading-relaxed">
                Apakah Anda yakin ingin menghapus seluruh pesan obrolan untuk <strong className="text-slate-800">SEMUA kontak & grup MKKS</strong> di sistem?
              </p>
              <div className="bg-yellow-50 border border-yellow-200/80 p-3.5 rounded-xl text-[11px] text-yellow-800 leading-relaxed font-medium space-y-1">
                <p className="font-bold flex items-center gap-1"><AlertTriangle className="w-3.5 h-3.5 text-yellow-600 inline" /> Dampak Tindakan:</p>
                <ul className="list-disc pl-4 space-y-1 text-[10px]">
                  <li>Seluruh histori pesan di setiap saluran obrolan akan sepenuhnya kosong.</li>
                  <li>Jumlah pesan belum dibaca diatur ulang menjadi nol.</li>
                  <li>Semua status kontak dikembalikan ke kondisi default.</li>
                </ul>
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="bg-slate-50 px-6 py-3.5 border-t border-slate-150 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setShowResetAllConfirm(false)}
                className="px-4 py-2 text-xs font-bold text-slate-550 hover:bg-slate-200/60 rounded-xl transition cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={confirmResetAllChats}
                className="px-4 py-2 text-xs font-black text-white bg-amber-600 hover:bg-amber-700 active:scale-95 shadow-md shadow-amber-600/10 rounded-xl transition cursor-pointer"
              >
                Ya, Reset Semua Chat
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: DISPLAY CONTACT INFO DETAIL */}
      {showContactInfo && activeContact && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-100 overflow-hidden transform transition-all animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="bg-emerald-50 px-6 py-4 border-b border-emerald-100 flex items-center justify-between">
              <div className="flex items-center gap-2.5 text-emerald-800">
                <div className="p-1.5 bg-emerald-100 rounded-lg">
                  <UserCheck className="w-5 h-5 text-emerald-600" />
                </div>
                <h3 className="font-black text-sm tracking-tight">Detail Kontak Pengurus MKKS</h3>
              </div>
              <button 
                onClick={() => setShowContactInfo(false)}
                className="text-slate-400 hover:text-slate-600 p-1 hover:bg-slate-100 rounded-full transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            {/* Content */}
            <div className="p-6 space-y-4">
              <div className="flex flex-col items-center text-center space-y-2 pb-2 border-b border-slate-100">
                <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${activeContact.avatarColor} text-white flex items-center justify-center font-black text-2xl shadow-md`}>
                  {activeContact.name.split(' ').map(n=>n[0]).join('').substring(0,2).toUpperCase()}
                </div>
                <div className="font-black text-sm text-slate-800">{activeContact.name}</div>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 border border-emerald-250 text-[10px] text-emerald-700 font-extrabold uppercase tracking-wide">
                  {activeContact.status}
                </span>
              </div>

              <div className="space-y-3.5 text-xs text-slate-700">
                <div className="grid grid-cols-3 gap-2 border-b border-slate-50 pb-2">
                  <span className="text-slate-400 font-extrabold text-[10px] uppercase tracking-wider">Instansi Sekolah</span>
                  <span className="col-span-2 font-bold text-slate-900">🏢 {activeContact.school}</span>
                </div>
                <div className="grid grid-cols-3 gap-2 border-b border-slate-50 pb-2">
                  <span className="text-slate-400 font-extrabold text-[10px] uppercase tracking-wider">Wilayah</span>
                  <span className="col-span-2 font-bold text-slate-900">Kecamatan Pasirwangi, Garut</span>
                </div>
                <div className="grid grid-cols-3 gap-2 border-b border-slate-50 pb-2">
                  <span className="text-slate-400 font-extrabold text-[10px] uppercase tracking-wider">Metode Enkripsi</span>
                  <span className="col-span-2 text-sky-600 font-black flex items-center gap-1">
                    <ShieldCheck className="w-4 h-4 text-sky-500 inline shrink-0" /> End-To-End (Aman)
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <span className="text-slate-400 font-extrabold text-[10px] uppercase tracking-wider">Model Konsultasi</span>
                  <span className="col-span-2 font-semibold text-slate-600">
                    {activeContact.botType === 'custom' ? 'Asisten Virtual Cerdas MKKS (AI)' : 'Saluran Konsultasi Langsung'}
                  </span>
                </div>
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="bg-slate-50 px-6 py-3.5 border-t border-slate-150 flex items-center justify-end">
              <button
                type="button"
                onClick={() => setShowContactInfo(false)}
                className="px-5 py-2 text-xs font-black text-white bg-emerald-600 hover:bg-emerald-700 active:scale-95 shadow-md shadow-emerald-600/10 rounded-xl transition cursor-pointer"
              >
                Selesai
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
