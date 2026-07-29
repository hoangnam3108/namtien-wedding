'use client';

import React, { useState, useEffect, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';

// ============================================================================
// 1. CẤU HÌNH THÔNG TIN 
// ============================================================================
const WEDDING_CONFIG = {
  groom: {
    fullName: 'Phan Văn Nam',
    shortName: 'Phan Nam',
    parents: 'Ông Phan Văn Việt & Bà Nguyễn Thị Vân',
    address: 'Thôn Ninh Thanh 1, xã Ea Kar, tỉnh Đắk Lắk',
    bank: { name: 'Sacombank', accountNumber: '0337188787', accountHolder: 'PHAN VAN NAM', code: 'Sacombank' },
  },
  bride: {
    fullName: 'Trần Thị Mỹ Tiên',
    shortName: 'Mỹ Tiên',
    parents: 'Ông Trần Tài & Bà Nguyễn Thị Hương',
    address: 'Thôn Xuân Tự 2, xã Vạn Hưng, tỉnh Khánh Hòa',
    bank: { name: 'Vietcombank', accountNumber: '1012345678', accountHolder: 'TRAN THI MY TIEN', code: 'VCB' },
  },
  event: {
    dateIso: '2026-09-20T16:50:00', // Đã cập nhật đúng ngày 20/09/2026
    displayDate: '20 . 09 . 2026', // Ngày dương lịch
    lunarDate: '10 Tháng 08 Năm Bính Ngọ', // Ngày âm lịch: 10/08/2026
    displayTime: '16:50',
    mapIframeUrl: 'https://maps.google.com/maps?q=12.794806,108.436139&z=15&output=embed',
    addressText: 'Thôn Ninh Thanh 1, xã Ea Kar, tỉnh Đắk Lắk',
    bgAudioUrl: '/nhaccuoi.mp3',
    locationName: 'Tư Gia Nhà Trai' // Đã bổ sung địa điểm tổ chức
  },
  timeline: [
    { date: '14 . 02 . 2020', title: 'Lần Đầu Gặp Gỡ', desc: 'Ánh mắt chạm nhau giữa phố đông, tình yêu bắt đầu từ những điều giản dị nhất.', img: '/story1.jpg', fallback: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc' },
    { date: '24 . 12 . 2020', title: 'Chính Thức Yêu Nhau', desc: 'Dưới ánh đèn đêm Giáng Sinh, cái nắm tay ngập ngừng thay cho vạn lời muốn nói.', img: '/story3.jpg', fallback: 'https://images.unsplash.com/photo-1606800052052-a08af7148866' },
    { date: '15 . 08 . 2022', title: 'Chuyến Đi Đầu Tiên', desc: 'Cùng nhau đón bình minh trên biển, đánh dấu những tháng ngày rong ruổi có nhau.', img: '/story4.jpg', fallback: 'https://images.unsplash.com/photo-1520854221256-17451cc331bf' },
    { date: '20 . 10 . 2023', title: 'Lời Cầu Hôn', desc: '"Em đồng ý chứ?" - Khoảnh khắc thời gian như ngừng trôi, và hành trình mới mở ra.', img: '/story2.jpg', fallback: 'https://images.unsplash.com/photo-1583939003579-730e3918a45a' },
  ],
  images: {
    hero: '/hero.jpg',
    fallbackHero: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=1200',
    gallery: [
      { src: '/story1.jpg', fallback: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc' },
      { src: '/story2.jpg', fallback: 'https://images.unsplash.com/photo-1583939003579-730e3918a45a' },
      { src: '/story3.jpg', fallback: 'https://images.unsplash.com/photo-1606800052052-a08af7148866' },
      { src: '/story4.jpg', fallback: 'https://images.unsplash.com/photo-1520854221256-17451cc331bf' },
      { src: '/story5.jpg', fallback: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc' },
      { src: '/story6.jpg', fallback: 'https://images.unsplash.com/photo-1583939003579-730e3918a45a' },
    ],
  },
  dressCodeColors: ['#1c221e', '#3d4b3c', '#c2b29f', '#f4ebd9'],
};

const getVietQrUrl = (bankCode: string, accountNum: string, name: string, memo: string) => {
  return `https://img.vietqr.io/image/${bankCode}-${accountNum}-compact2.png?amount=0&addInfo=${encodeURIComponent(memo)}&accountName=${encodeURIComponent(name)}`;
};

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = (supabaseUrl && supabaseAnonKey) ? createClient(supabaseUrl, supabaseAnonKey) : null;

interface Wish { id: string; name: string; message: string; created_at: string; }

// ============================================================================
// 2. COMPONENT CHÍNH
// ============================================================================
export default function WeddingInvitation() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [isPlaying, setIsPlaying] = useState(false);
  
  // States Lời chúc & RSVP
  const [wishes, setWishes] = useState<Wish[]>([]);
  const [nameInput, setNameInput] = useState('');
  const [wishInput, setWishInput] = useState('');
  const [showGiftModal, setShowGiftModal] = useState(false);
  const [modalConfetti, setModalConfetti] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  
  // States Xác Nhận Tham Dự
  const [rsvpName, setRsvpName] = useState('');
  const [rsvpPhone, setRsvpPhone] = useState('');
  const [rsvpStatus, setRsvpStatus] = useState('attending'); 
  const [rsvpCount, setRsvpCount] = useState(1);
  const [isRsvpSubmitting, setIsRsvpSubmitting] = useState(false);
  const [rsvpSuccess, setRsvpSuccess] = useState(false);

  const cards = WEDDING_CONFIG.images.gallery;
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // --- INTERSECTION OBSERVER & ADMIN ---
  useEffect(() => {
    const observerOptions = { threshold: 0.15, rootMargin: '0px 0px -50px 0px' };
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => { if (entry.isIntersecting) entry.target.classList.add('is-revealed'); });
    }, observerOptions);

    setTimeout(() => {
      document.querySelectorAll('.reveal-on-scroll').forEach((el) => observer.observe(el));
      setIsLoaded(true);
    }, 100);

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('admin') === 'true' || params.get('admin') === 'namnguyen') setIsAdmin(true);
    }
    fetchWishes();
  }, []);

  const fetchWishes = async () => {
    if (!supabase) return;
    const { data, error } = await supabase.from('wishes').select('*').order('created_at', { ascending: false });
    if (!error && data) setWishes(data);
  };

  // --- AUTO PLAY MUSIC KHI CÓ TƯƠNG TÁC (SCROLL/CLICK) ---
  useEffect(() => {
    const handleInteraction = () => {
      if (audioRef.current && audioRef.current.paused) {
        audioRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
      }
      document.removeEventListener('click', handleInteraction);
      document.removeEventListener('touchstart', handleInteraction);
      document.removeEventListener('scroll', handleInteraction);
    };
    document.addEventListener('click', handleInteraction, { once: true });
    document.addEventListener('touchstart', handleInteraction, { once: true });
    document.addEventListener('scroll', handleInteraction, { once: true });
    return () => {
      document.removeEventListener('click', handleInteraction);
      document.removeEventListener('touchstart', handleInteraction);
      document.removeEventListener('scroll', handleInteraction);
    };
  }, []);

  const toggleMusic = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (audioRef.current) {
      if (isPlaying) { audioRef.current.pause(); setIsPlaying(false); } 
      else { audioRef.current.play().then(() => setIsPlaying(true)).catch(() => {}); }
    }
  };

  // --- THÊM LỊCH CÓ NHẮC NHỞ (.ICS FILE) ---
  const handleAddCalendar = () => {
    const startDate = '20260920T095000Z'; // 16:50 VN (UTC+7)
    const endDate = '20260920T140000Z';   // 21:00 VN
    const title = 'NAM & TIEN’S WEDDING';
    const description = 'Trân trọng kính mời quý khách đến chung vui cùng gia đình chúng tôi.';
    const location = WEDDING_CONFIG.event.addressText;

    const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//NamTienWedding//VN
BEGIN:VEVENT
UID:${new Date().getTime()}@namtien.vn
DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').split('.')[0]}Z
DTSTART:${startDate}
DTEND:${endDate}
SUMMARY:${title}
DESCRIPTION:${description}
LOCATION:${location}
BEGIN:VALARM
TRIGGER:-PT24H
ACTION:DISPLAY
DESCRIPTION:Nhắc nhở: Ngày mai là đám cưới Nam & Tiên!
END:VALARM
END:VEVENT
END:VCALENDAR`.replace(/\n/g, '\r\n');

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'DamCuoi_NamTien.ics');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    setToastMessage('Đã tải lịch nhắc hẹn (Nhắc trước 1 ngày) 📅');
    setTimeout(() => setToastMessage(null), 3500);
  };

  // --- COPY STK & MODAL QUÀ ---
  const handleCopy = (text: string, name: string) => {
    navigator.clipboard.writeText(text);
    setToastMessage(`Đã sao chép STK của ${name} ✔`);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleOpenGiftModal = () => {
    setShowGiftModal(true);
    setModalConfetti(true);
    setTimeout(() => setModalConfetti(false), 2500); 
  };

  // --- ĐẾM NGƯỢC ---
  useEffect(() => {
    const targetDate = new Date(WEDDING_CONFIG.event.dateIso).getTime();
    const interval = setInterval(() => {
      const distance = targetDate - new Date().getTime();
      if (distance < 0) { clearInterval(interval); return; }
      setTimeLeft({
        days: Math.floor(distance / (1000 * 60 * 60 * 24)),
        hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((distance % (1000 * 60)) / 1000)
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // --- SUBMIT LỜI CHÚC & RSVP ---
  const handleAddWish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameInput.trim() || !wishInput.trim() || isSubmitting) return;
    setIsSubmitting(true);
    if (supabase) {
      const { data, error } = await supabase.from('wishes').insert([{ name: nameInput.trim(), message: wishInput.trim() }]).select();
      if (!error && data) { 
        setWishes([data[0], ...wishes]); 
        setNameInput(''); setWishInput(''); 
        setModalConfetti(true);
        setTimeout(() => setModalConfetti(false), 2500);
      }
    }
    setIsSubmitting(false);
  };

  const handleRsvpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rsvpName.trim() || isRsvpSubmitting) return;
    setIsRsvpSubmitting(true);
    
    if (supabase) {
      const { error } = await supabase.from('rsvp').insert([{
        name: rsvpName,
        phone: rsvpPhone,
        status: rsvpStatus,
        count: rsvpStatus === 'attending' ? rsvpCount : 0,
      }]);
      
      if (!error) {
        setRsvpSuccess(true);
        setModalConfetti(true);
        setTimeout(() => setModalConfetti(false), 2500);
      } else {
        setToastMessage('Lỗi: Bạn cần tạo bảng "rsvp" trên Supabase trước.');
        setTimeout(() => setToastMessage(null), 3000);
      }
    }
    setIsRsvpSubmitting(false);
  };

  const handleDeleteWish = async (id: string) => {
    if (!confirm('Xóa lời chúc này?')) return;
    if (supabase) {
      const { error } = await supabase.from('wishes').delete().eq('id', id);
      if (!error) setWishes(wishes.filter((item) => item.id !== id));
    }
  };

  const qrGroom = getVietQrUrl(WEDDING_CONFIG.groom.bank.code, WEDDING_CONFIG.groom.bank.accountNumber, WEDDING_CONFIG.groom.bank.accountHolder, 'Mung Cuoi Nam Tien');
  const qrBride = getVietQrUrl(WEDDING_CONFIG.bride.bank.code, WEDDING_CONFIG.bride.bank.accountNumber, WEDDING_CONFIG.bride.bank.accountHolder, 'Mung Cuoi My Tien');

  return (
    <div className={`min-h-screen bg-[#FAFAF7] text-[#4A4A4A] font-serif relative overflow-x-hidden selection:bg-[#D4C3B3] selection:text-white pb-24 transition-opacity duration-1000 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}>
      
      {/* ====================================================================
          GLOBAL CSS NÂNG CẤP
          ==================================================================== */}
      <style dangerouslySetInnerHTML={{__html: `
        @import url('https://fonts.googleapis.com/css2?family=Great+Vibes&family=Lora:ital,wght@0,400;0,500;1,400&family=Playfair+Display:ital,wght@0,400;0,600;1,400&display=swap');
        .font-script { font-family: 'Great Vibes', cursive; }
        .font-title { font-family: 'Playfair Display', serif; }
        .font-body { font-family: 'Lora', serif; }

        /* Floating Bubbles */
        @keyframes float-bubble {
          0% { transform: translateY(100vh) translateX(0) scale(0); opacity: 0; }
          10% { opacity: 1; transform: translateY(80vh) scale(1); }
          90% { opacity: 1; }
          100% { transform: translateY(-20vh) translateX(20px) scale(1.1); opacity: 0; }
        }
        .bubble-wish { animation: float-bubble 15s linear infinite; }
        .bubble-wish:hover { animation-play-state: paused; cursor: pointer; z-index: 50; }

        /* VIP Confetti */
        @keyframes explode {
          0% { transform: translateY(0) scale(0.5); opacity: 1; }
          100% { transform: translateY(-150px) scale(1.5) rotate(45deg); opacity: 0; }
        }
        .confetti-piece { position: absolute; left: 50%; top: 50%; animation: explode 2s cubic-bezier(0.1, 0.8, 0.3, 1) forwards; pointer-events: none; z-index: 200;}

        /* Scroll Reveal Base */
        .reveal-on-scroll { opacity: 0; transition-duration: 1.2s; transition-property: all; transition-timing-function: cubic-bezier(0.16, 1, 0.3, 1); }
        .reveal-left { transform: translateX(-60px); }
        .reveal-right { transform: translateX(60px); }
        .reveal-up { transform: translateY(50px); }
        .reveal-zoom { transform: scale(0.9); }
        .is-revealed { opacity: 1 !important; transform: translate(0) scale(1) !important; filter: blur(0) !important; }

        /* Masonry Grid Setup */
        .masonry-grid { column-count: 2; column-gap: 1rem; }
        @media (min-width: 768px) { .masonry-grid { column-count: 3; } }
        .masonry-item { break-inside: avoid; margin-bottom: 1rem; }

        /* Shine Effect */
        .shine-effect { position: relative; overflow: hidden; }
        .shine-effect::after { content: ''; position: absolute; top: 0; left: -100%; width: 50%; height: 100%; background: linear-gradient(to right, rgba(255,255,255,0) 0%, rgba(255,255,255,0.4) 50%, rgba(255,255,255,0) 100%); transform: skewX(-25deg); z-index: 10; transition: none; pointer-events:none; }
        .shine-effect:hover::after { animation: shine 0.75s forwards; }
        @keyframes shine { 100% { left: 200%; } }

        /* Audio Disc */
        @keyframes soundwave { 0% { transform: scale(1); opacity: 0.6; } 100% { transform: scale(1.6); opacity: 0; } }
        .wave-ring { position: absolute; inset: 0; border-radius: 50%; border: 1.5px solid #8C7A6B; pointer-events: none; }
        .playing .wave-ring { animation: soundwave 2s infinite ease-out; }
        
        .pulse-heartbeat { animation: heartbeat 1s infinite ease-in-out; }
        @keyframes heartbeat { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.1); color: #8C7A6B; } }

        /* Scrollbar */
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: #F5F2ED; border-radius: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #D4C3B3; border-radius: 4px; }
      `}} />

      <audio ref={audioRef} loop src={WEDDING_CONFIG.event.bgAudioUrl} />

      {/* TỔNG HỢP HIỆU ỨNG PHÁO HOA CHUNG */}
      {modalConfetti && (
         <div className="fixed inset-0 pointer-events-none z-[250] overflow-hidden">
           {[...Array(25)].map((_, i) => (
             <div key={i} className="confetti-piece text-2xl drop-shadow-md" style={{ left: `${10 + Math.random() * 80}%`, top: `${40 + Math.random() * 20}%`, animationDelay: `${Math.random() * 0.3}s` }}>
               {i % 3 === 0 ? '❤️' : i % 3 === 1 ? '✨' : '💖'}
             </div>
           ))}
         </div>
      )}

      {/* Thông báo Toast */}
      <div className={`fixed top-8 left-1/2 -translate-x-1/2 bg-[#3A332C] text-white px-6 py-3 rounded-full shadow-2xl z-[200] flex items-center gap-3 transition-all duration-500 font-body text-sm ${toastMessage ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-10 pointer-events-none'}`}>
        <span className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center text-xs font-bold">✓</span>
        {toastMessage}
      </div>

      {/* ĐĨA THAN MUSIC PLAYER */}
      <div className={`fixed bottom-6 right-6 z-50 flex items-center justify-center cursor-pointer ${isPlaying ? 'playing' : ''}`} onClick={toggleMusic}>
        <div className="wave-ring" style={{animationDelay: '0s'}}></div>
        <div className="wave-ring" style={{animationDelay: '1s'}}></div>
        <div className={`w-12 h-12 md:w-14 md:h-14 rounded-full shadow-2xl relative flex items-center justify-center bg-gradient-to-br from-[#1a1a1a] to-[#000] border-2 border-gray-600 ${isPlaying ? 'animate-spin' : ''}`} style={{ animationDuration: '4s' }}>
           <div className="absolute inset-1 rounded-full border border-white/10"></div>
           <div className="w-4 h-4 bg-gradient-to-br from-[#B8A492] to-[#8C7A6B] rounded-full flex items-center justify-center z-10"><div className="w-1 h-1 bg-black rounded-full"></div></div>
        </div>
      </div>

      {/* ====================================================================
{/* ====================================================================
          1. HERO SECTION (CẬP NHẬT NGÀY THÁNG SANG TRỌNG)
          ==================================================================== */}
      <section className="relative min-h-screen flex flex-col items-center justify-center px-4 pt-10 pb-20 overflow-hidden">
        <div className="absolute inset-0 z-0 bg-[url('https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=1920')] bg-cover bg-center bg-fixed opacity-[0.08]"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-[#FAFAF7]/50 via-transparent to-[#FAFAF7] z-0"></div>
        
        <div className="text-center z-10 w-full max-w-4xl mx-auto mt-6">
          {/* Ảnh Cô Dâu Chú Rể */}
          <div className="relative w-full max-w-[320px] md:max-w-[420px] aspect-[3/4] mx-auto mb-12 reveal-on-scroll reveal-zoom delay-100 group">
             <div className="w-full h-full rounded-t-full overflow-hidden shadow-2xl border-[6px] border-white z-10 bg-white shine-effect">
               <img src={WEDDING_CONFIG.images.hero} onError={(e) => e.currentTarget.src = WEDDING_CONFIG.images.fallbackHero} className="w-full h-full object-cover transition-transform duration-[10000ms] group-hover:scale-110" alt="Nam & Tiên" />
             </div>
          </div>
          
          {/* Tên Cô Dâu Chú Rể */}
          <div className="flex flex-row items-center justify-center gap-3 md:gap-8 overflow-hidden w-full">
            <h1 className="reveal-on-scroll reveal-left delay-200 font-title text-4xl md:text-5xl lg:text-6xl text-[#4A4A4A] whitespace-nowrap">{WEDDING_CONFIG.groom.shortName}</h1>
            <span className="reveal-on-scroll reveal-zoom delay-300 font-script text-3xl md:text-5xl text-[#B8A492]">&</span>
            <h1 className="reveal-on-scroll reveal-right delay-200 font-title text-4xl md:text-5xl lg:text-6xl text-[#4A4A4A] whitespace-nowrap">{WEDDING_CONFIG.bride.shortName}</h1>
          </div>

          {/* Ngày Tháng Năm Nổi Bật (MỚI THÊM) */}
          <div className="mt-8 flex flex-col items-center justify-center reveal-on-scroll reveal-up delay-400">
            <div className="w-px h-12 bg-gradient-to-b from-transparent via-[#8C7A6B] to-[#8C7A6B] mb-4 opacity-50"></div>
            <h2 className="font-title text-3xl md:text-4xl text-[#8C7A6B] tracking-[0.25em] ml-3">{WEDDING_CONFIG.event.displayDate}</h2>
            <div className="flex items-center gap-4 mt-4">
              <div className="h-[1px] w-8 md:w-16 bg-[#D4C3B3]"></div>
              <p className="font-body text-[9px] md:text-[10px] tracking-widest text-[#A0A0A0] uppercase">Nhằm {WEDDING_CONFIG.event.lunarDate}</p>
              <div className="h-[1px] w-8 md:w-16 bg-[#D4C3B3]"></div>
            </div>
          </div>
        </div>
      </section>

      {/* ====================================================================
          2. ĐẾM NGƯỢC & ADD TO CALENDAR 
          ==================================================================== */}
      <section className="py-10 px-4 relative z-10 -mt-10 reveal-on-scroll reveal-up">
        <div className="flex flex-col items-center justify-center max-w-2xl mx-auto bg-white/80 backdrop-blur-md py-8 px-6 rounded-2xl border border-[#E8E2D9] shadow-xl">
          <div className="flex gap-4 md:gap-10 mb-8">
            {[{ label: 'Ngày', value: timeLeft.days }, { label: 'Giờ', value: timeLeft.hours }, { label: 'Phút', value: timeLeft.minutes }].map((item, index) => (
              <div key={index} className="text-center w-14 md:w-20">
                <div className="font-title text-3xl md:text-4xl text-[#8C7A6B] mb-2">{item.value.toString().padStart(2, '0')}</div>
                <div className="font-body text-[9px] md:text-xs uppercase tracking-[0.2em] text-[#A0A0A0]">{item.label}</div>
              </div>
            ))}
            <div className="text-center w-14 md:w-20">
               <div className="font-title text-3xl md:text-4xl text-[#8C7A6B] mb-2 pulse-heartbeat">{timeLeft.seconds.toString().padStart(2, '0')}</div>
               <div className="font-body text-[9px] md:text-xs uppercase tracking-[0.2em] text-[#A0A0A0]">Giây</div>
            </div>
          </div>
          
          <button onClick={handleAddCalendar} className="flex items-center gap-2 px-6 py-3 bg-[#4A4A4A] text-white rounded-full font-body text-xs uppercase tracking-widest hover:bg-[#8C7A6B] transition-all shadow-md hover:shadow-lg group">
            <span className="text-base group-hover:scale-110 transition-transform">📅</span> Thêm Lịch Nhắc Cưới
          </button>
        </div>
      </section>

      {/* ====================================================================
          3. LỜI NGỎ & GIA ĐÌNH 
          ==================================================================== */}
      <section className="py-24 px-4 max-w-5xl mx-auto overflow-hidden">
        <div className="grid md:grid-cols-2 gap-10 md:gap-16 text-center px-4">
          {/* Nhà Trai */}
          <div className="reveal-on-scroll reveal-left bg-white p-10 md:p-12 shadow-lg rounded-2xl border border-[#F0EBE1] relative hover:shadow-2xl transition-shadow duration-500">
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[#FAFAF7] px-2">
              <span className="font-body text-[10px] md:text-xs uppercase tracking-[0.3em] text-[#B8A492] border border-[#D4C3B3] px-6 py-2 rounded-full bg-white shadow-sm">Nhà Trai</span>
            </div>
            <div className="mt-6 mb-8">
              <p className="font-body text-xs tracking-[0.2em] text-[#A0A0A0] uppercase mb-3">Trưởng Nam</p>
              <h3 className="font-title text-2xl md:text-3xl text-[#4A4A4A]">{WEDDING_CONFIG.groom.fullName}</h3>
            </div>
            <div className="w-12 h-px bg-[#D4C3B3] mx-auto mb-6"></div>
            <p className="font-body font-medium text-[#606060] text-sm md:text-base">{WEDDING_CONFIG.groom.parents}</p>
            <p className="font-body text-xs text-[#A0A0A0] mt-4 leading-relaxed">{WEDDING_CONFIG.groom.address}</p>
          </div>

          {/* Nhà Gái */}
          <div className="reveal-on-scroll reveal-right delay-200 bg-white p-10 md:p-12 shadow-lg rounded-2xl border border-[#F0EBE1] relative hover:shadow-2xl transition-shadow duration-500">
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[#FAFAF7] px-2">
              <span className="font-body text-[10px] md:text-xs uppercase tracking-[0.3em] text-[#B8A492] border border-[#D4C3B3] px-6 py-2 rounded-full bg-white shadow-sm">Nhà Gái</span>
            </div>
            <div className="mt-6 mb-8">
              <p className="font-body text-xs tracking-[0.2em] text-[#A0A0A0] uppercase mb-3">Quý Nữ</p>
              <h3 className="font-title text-2xl md:text-3xl text-[#4A4A4A]">{WEDDING_CONFIG.bride.fullName}</h3>
            </div>
            <div className="w-12 h-px bg-[#D4C3B3] mx-auto mb-6"></div>
            <p className="font-body font-medium text-[#606060] text-sm md:text-base">{WEDDING_CONFIG.bride.parents}</p>
            <p className="font-body text-xs text-[#A0A0A0] mt-4 leading-relaxed">{WEDDING_CONFIG.bride.address}</p>
          </div>
        </div>
      </section>

      {/* ====================================================================
          4. HÀNH TRÌNH TÌNH YÊU
          ==================================================================== */}
      <section className="py-24 px-4 max-w-4xl mx-auto overflow-hidden">
        <div className="text-center mb-16 reveal-on-scroll reveal-up">
          <h2 className="font-script text-5xl md:text-6xl text-[#8C7A6B]">Hành Trình Tình Yêu</h2>
          <div className="font-body text-[10px] tracking-[0.2em] text-[#A0A0A0] uppercase mt-3">Câu chuyện của chúng mình</div>
        </div>

        <div className="relative border-l border-[#D4C3B3] md:border-none ml-6 md:ml-0">
           <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-[#D4C3B3] to-transparent -translate-x-1/2 reveal-on-scroll reveal-up"></div>
           
           {WEDDING_CONFIG.timeline.map((item, idx) => (
             <div key={idx} className={`relative mb-16 md:mb-24 md:flex items-center justify-between w-full reveal-on-scroll ${idx % 2 === 0 ? 'md:flex-row-reverse reveal-left' : 'reveal-right'}`}>
               <div className="absolute -left-[30px] md:left-1/2 md:-translate-x-1/2 w-4 h-4 rounded-full bg-white border-[3px] border-[#8C7A6B] z-10 shadow-md"></div>
               
               <div className="md:w-[45%] pl-6 md:pl-0 mb-6 md:mb-0">
                  <div className={`bg-white p-6 rounded-2xl shadow-lg border border-[#F0EBE1] shine-effect ${idx % 2 === 0 ? 'md:text-right' : 'md:text-left'}`}>
                    <span className="font-body text-xs text-[#B8A492] font-bold tracking-widest">{item.date}</span>
                    <h3 className="font-title text-2xl text-[#4A4A4A] mt-2 mb-3">{item.title}</h3>
                    <p className="font-body text-sm text-[#A0A0A0] leading-relaxed italic">{item.desc}</p>
                  </div>
               </div>

               <div className="md:w-[45%] pl-6 md:pl-0">
                 <div className="w-full aspect-[4/3] rounded-2xl overflow-hidden shadow-md border-4 border-white shine-effect">
                    <img src={item.img} onError={(e) => e.currentTarget.src = item.fallback} className="w-full h-full object-cover transition-transform duration-700 hover:scale-105" alt="Story" />
                 </div>
               </div>
             </div>
           ))}
        </div>
      </section>

      {/* ====================================================================
          5. THƯ VIỆN ẢNH (MASONRY GRID)
          ==================================================================== */}
      <section className="py-24 bg-[#F5F2ED] border-y border-[#E8E2D9] overflow-hidden reveal-on-scroll reveal-up">
        <div className="text-center mb-16">
          <h2 className="font-script text-5xl md:text-6xl text-[#8C7A6B]">Kỷ Niệm</h2>
          <div className="font-body text-[10px] tracking-[0.2em] text-[#A0A0A0] uppercase mt-3">Thư Viện Ảnh Nghệ Thuật</div>
        </div>

        <div className="masonry-grid max-w-5xl mx-auto px-4">
          {cards.map((img, idx) => (
            <div key={idx} className="masonry-item relative group rounded-xl overflow-hidden shadow-lg border-4 border-white shine-effect">
              <img src={img.src} onError={(e) => e.currentTarget.src = img.fallback} className="w-full h-auto object-cover transform transition-transform duration-700 group-hover:scale-110" alt="Gallery" />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300"></div>
            </div>
          ))}
        </div>
      </section>

      {/* ====================================================================
{/* ====================================================================
          6. THỜI GIAN & ĐỊA ĐIỂM (TỐI GIẢN - SANG TRỌNG)
          ==================================================================== */}
      <section className="py-24 px-4 max-w-5xl mx-auto overflow-hidden">
        
        {/* Dress Code (Thu gọn lên trên để tập trung vào thiệp chính) */}
        <div className="max-w-2xl mx-auto mb-12 reveal-on-scroll reveal-up">
           <div className="bg-[#FAF8F5] p-6 rounded-2xl text-center border border-[#E8E2D9]">
              <h3 className="font-body text-[10px] tracking-[0.3em] uppercase mb-3 text-[#8C7A6B]">Dress Code</h3>
              <div className="flex justify-center gap-4">
                {WEDDING_CONFIG.dressCodeColors.map((color, idx) => (
                  <div key={idx} className="w-8 h-8 rounded-full border border-gray-200 shadow-sm" style={{ backgroundColor: color }} />
                ))}
              </div>
           </div>
        </div>

        {/* Khung Thông Tin Lễ Cưới Căn Giữa */}
        <div className="bg-white p-3 md:p-4 rounded-3xl border border-[#E8E2D9] shadow-xl reveal-on-scroll reveal-up">
          <div className="border border-[#F0EBE1] rounded-2xl p-8 md:p-14 relative overflow-hidden bg-[#FAFAF7] flex flex-col items-center text-center">
            
            {/* Họa tiết trang trí tinh tế */}
            <div className="text-[#D4C3B3] text-3xl mb-4 opacity-70">❦</div>
            
            {/* Tiêu đề */}
            <h3 className="font-script text-5xl md:text-7xl text-[#8C7A6B] mb-2 leading-tight">Tư Gia Nhà Trai</h3>
            <p className="font-title text-xl md:text-2xl text-[#4A4A4A] tracking-widest uppercase mb-8">Lễ Tân Hôn</p>

            {/* Cụm Thời gian & Địa chỉ liền mạch */}
            <div className="flex flex-col items-center justify-center gap-2 mb-8">
              <div className="inline-flex items-center justify-center gap-4 border-y border-[#E8E2D9] py-3 px-8">
                 <span className="font-title text-base md:text-lg text-[#4A4A4A]">{WEDDING_CONFIG.event.displayTime}</span>
                 <span className="w-1.5 h-1.5 bg-[#8C7A6B] rotate-45"></span>
                 <span className="font-title text-base md:text-lg text-[#4A4A4A]">{WEDDING_CONFIG.event.displayDate}</span>
              </div>
            </div>

            <p className="font-body text-[#606060] text-sm md:text-base leading-relaxed mb-8 max-w-md">
              {WEDDING_CONFIG.event.addressText}
            </p>

            {/* Nút bản đồ thanh lịch */}
            <a 
              href={`https://maps.google.com/maps?q=12.794806,108.436139`} 
              target="_blank" 
              rel="noreferrer" 
              className="group inline-flex items-center gap-2 bg-transparent border border-[#8C7A6B] text-[#8C7A6B] px-8 py-3 rounded-full font-body text-[10px] md:text-xs tracking-[0.2em] uppercase hover:bg-[#8C7A6B] hover:text-white transition-all duration-500 mb-10"
            >
              <span>Mở Google Maps</span>
              <span className="group-hover:translate-x-1 transition-transform">→</span>
            </a>

            {/* Bản đồ làm nhạt màu (Grayscale) để trông nghệ thuật hơn */}
            <div className="w-full aspect-[16/9] md:aspect-[21/9] bg-gray-100 rounded-xl overflow-hidden relative border border-[#E8E2D9]">
              <iframe 
                src={WEDDING_CONFIG.event.mapIframeUrl} 
                className="absolute inset-0 w-full h-full grayscale-[50%] hover:grayscale-0 opacity-80 hover:opacity-100 transition-all duration-700" 
                style={{ border: 0 }} 
                allowFullScreen={false} 
                loading="lazy" 
              />
            </div>
            
          </div>
        </div>
      </section>
      {/* ====================================================================
          7. XÁC NHẬN THAM DỰ (THUẦN VIỆT, RÕ RÀNG)
          ==================================================================== */}
      <section className="py-24 bg-[#F5F2ED] border-y border-[#E8E2D9] px-4 overflow-hidden reveal-on-scroll reveal-up">
         <div className="max-w-3xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="font-script text-5xl md:text-6xl text-[#8C7A6B]">Xác Nhận Tham Dự</h2>
              <div className="font-body text-[10px] tracking-[0.2em] text-[#A0A0A0] uppercase mt-3">Sự hiện diện của quý khách là niềm vinh hạnh cho chúng tôi</div>
            </div>

            {rsvpSuccess ? (
              <div className="bg-white p-10 rounded-2xl shadow-xl border border-[#E8E2D9] text-center animate-fade-in">
                 <div className="w-20 h-20 bg-[#F5F2ED] rounded-full flex items-center justify-center mx-auto mb-6 text-4xl">💌</div>
                 <h3 className="font-title text-2xl text-[#4A4A4A] mb-2">Cảm ơn bạn!</h3>
                 <p className="font-body text-[#A0A0A0]">Chúng tôi đã nhận được phản hồi. Rất mong được đón tiếp bạn trong ngày vui của chúng tôi.</p>
              </div>
            ) : (
              <div className="bg-white p-8 md:p-10 rounded-2xl shadow-xl border border-[#E8E2D9]">
                <form onSubmit={handleRsvpSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block font-body text-xs tracking-widest text-[#A0A0A0] uppercase mb-2">Tên của bạn</label>
                      <input type="text" required placeholder="Nhập họ tên..." value={rsvpName} onChange={(e) => setRsvpName(e.target.value)} className="w-full p-3 border-b border-[#F0EBE1] focus:outline-none focus:border-[#8C7A6B] bg-transparent font-body" />
                    </div>
                    <div>
                      <label className="block font-body text-xs tracking-widest text-[#A0A0A0] uppercase mb-2">Số điện thoại</label>
                      <input type="tel" required placeholder="Nhập số điện thoại..." value={rsvpPhone} onChange={(e) => setRsvpPhone(e.target.value)} className="w-full p-3 border-b border-[#F0EBE1] focus:outline-none focus:border-[#8C7A6B] bg-transparent font-body" />
                    </div>
                  </div>
                  <div>
                     <label className="block font-body text-xs tracking-widest text-[#A0A0A0] uppercase mb-3">Bạn sẽ đến chung vui chứ?</label>
                     <div className="grid grid-cols-2 gap-4">
                        <div onClick={() => setRsvpStatus('attending')} className={`p-4 rounded-xl border-2 cursor-pointer text-center transition-all ${rsvpStatus === 'attending' ? 'border-[#8C7A6B] bg-[#F5F2ED]' : 'border-[#F0EBE1] hover:border-[#D4C3B3]'}`}>
                           <span className="font-title text-base md:text-lg text-[#4A4A4A] block mb-1">Sẽ đến chung vui</span>
                           <span className="text-2xl">🎉</span>
                        </div>
                        <div onClick={() => setRsvpStatus('declining')} className={`p-4 rounded-xl border-2 cursor-pointer text-center transition-all ${rsvpStatus === 'declining' ? 'border-[#8C7A6B] bg-[#F5F2ED]' : 'border-[#F0EBE1] hover:border-[#D4C3B3]'}`}>
                           <span className="font-title text-base md:text-lg text-[#4A4A4A] block mb-1">Xin phép vắng mặt</span>
                           <span className="text-2xl">🙏</span>
                        </div>
                     </div>
                  </div>
                  <div className={`transition-all duration-500 overflow-hidden ${rsvpStatus === 'attending' ? 'max-h-24 opacity-100' : 'max-h-0 opacity-0'}`}>
                     <label className="block font-body text-xs tracking-widest text-[#A0A0A0] uppercase mb-2">Số lượng người tham dự</label>
                     <select value={rsvpCount} onChange={(e) => setRsvpCount(Number(e.target.value))} className="w-full p-3 border-b border-[#F0EBE1] focus:outline-none focus:border-[#8C7A6B] bg-transparent font-body">
                       {[1, 2, 3, 4, 5].map(num => (
                         <option key={num} value={num}>{num} Người</option>
                       ))}
                     </select>
                  </div>
                  <button type="submit" disabled={isRsvpSubmitting} className="w-full mt-6 bg-[#4A4A4A] text-white py-4 text-xs font-body tracking-[0.2em] uppercase hover:bg-[#8C7A6B] transition-colors rounded-lg shadow-md">
                    {isRsvpSubmitting ? 'Đang gửi...' : 'Gửi Xác Nhận'}
                  </button>
                </form>
              </div>
            )}
         </div>
      </section>

      {/* ====================================================================
          8. SỔ LƯU BÚT & HIỂN THỊ DANH SÁCH LỜI CHÚC
          ==================================================================== */}
      <section className="py-24 px-4 max-w-3xl mx-auto relative reveal-on-scroll reveal-up overflow-hidden">
        <div className="text-center mb-12">
          <h2 className="font-script text-5xl md:text-6xl text-[#8C7A6B]">Sổ Lưu Bút</h2>
          <div className="font-body text-[10px] tracking-[0.2em] text-[#A0A0A0] uppercase mt-3">Gửi Lời Chúc Tốt Đẹp Nhất</div>
        </div>
        
        {/* Bong bóng trang trí */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden -z-10">
          {wishes.slice(0, 8).map((wish, i) => (
            <div key={`float-${wish.id}`} className="absolute bottom-0 bubble-wish flex flex-col items-center pointer-events-auto" style={{ left: `${10 + (i * 20) % 80}%`, animationDelay: `${i * 2}s`, animationDuration: `${15 + (i % 5)}s` }}>
              <div className="w-8 h-8 bg-white/50 rounded-full shadow-sm flex items-center justify-center text-[#8C7A6B] backdrop-blur-sm">🤍</div>
            </div>
          ))}
        </div>

        {/* Form Gửi Lời Chúc */}
        <div className="bg-white/90 backdrop-blur p-8 shadow-xl border border-[#E8E2D9] rounded-2xl mb-12 relative z-10">
          <form onSubmit={handleAddWish}>
            <input type="text" required placeholder="Tên của bạn..." value={nameInput} onChange={(e) => setNameInput(e.target.value)} className="font-body w-full mb-6 p-4 border-b border-[#F0EBE1] focus:outline-none focus:border-[#8C7A6B] bg-transparent" />
            <textarea required rows={3} placeholder="Gửi gắm yêu thương..." value={wishInput} onChange={(e) => setWishInput(e.target.value)} className="font-body w-full mb-6 p-4 border-b border-[#F0EBE1] focus:outline-none focus:border-[#8C7A6B] bg-transparent resize-none" />
            <button type="submit" disabled={isSubmitting} className="w-full bg-[#4A4A4A] text-white py-4 text-xs font-body tracking-[0.2em] uppercase hover:bg-[#8C7A6B] transition-colors rounded-lg shadow-md">
              {isSubmitting ? 'Đang gửi...' : 'Gửi Lời Chúc'}
            </button>
          </form>
        </div>

        {/* Hiển thị danh sách lời chúc (List Scrollable) */}
        <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar relative z-10">
          {wishes.map((item) => (
            <div key={item.id} className="bg-white p-6 rounded-xl border border-[#F0EBE1] shadow-sm relative shine-effect hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-2 relative z-10">
                <span className="font-title font-semibold text-[#4A4A4A] text-base">{item.name}</span>
                {isAdmin && <button onClick={() => handleDeleteWish(item.id)} className="text-red-400 text-xs bg-red-50 px-2 py-1 rounded">Xóa</button>}
              </div>
              <p className="font-body text-[#606060] text-sm italic relative z-10 leading-relaxed">"{item.message}"</p>
            </div>
          ))}
          {wishes.length === 0 && <p className="text-center font-body text-[#A0A0A0] text-sm italic">Hãy là người đầu tiên gửi lời chúc...</p>}
        </div>
      </section>

      {/* ====================================================================
          9. NÚT GỬI QUÀ NỔI 
          ==================================================================== */}
      <div className="flex justify-center pb-10 reveal-on-scroll reveal-zoom relative z-20">
        <button onClick={handleOpenGiftModal} className="flex flex-col items-center group relative cursor-pointer">
          <div className="absolute inset-0 bg-[#8C7A6B]/20 rounded-full animate-ping"></div>
          <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-2xl border border-[#E8E2D9] group-hover:-translate-y-2 transition-transform relative z-10 shine-effect">💝</div>
          <span className="font-body text-[10px] uppercase tracking-[0.2em] text-[#8C7A6B] mt-4 font-bold">Gửi Quà Mừng</span>
        </button>
      </div>

      {showGiftModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4" onClick={() => setShowGiftModal(false)}>
          <div className="bg-[#FAFAF7] w-full max-w-2xl rounded-2xl overflow-hidden shadow-2xl relative border border-[#E8E2D9]" onClick={(e) => e.stopPropagation()}>
            <div className="bg-[#8C7A6B] text-white text-center py-6 relative">
              <h3 className="font-body text-sm md:text-base uppercase tracking-[0.3em]">Hộp Quà Mừng</h3>
              <button onClick={() => setShowGiftModal(false)} className="absolute right-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/20 hover:bg-white/40 text-xl pb-1">×</button>
            </div>
            
            <div className="p-6 md:p-8 flex flex-col md:flex-row gap-6 md:gap-8">
              <div className="flex-1 bg-white p-6 rounded-xl text-center border border-[#E8E2D9] shine-effect">
                <h4 className="font-body text-[10px] uppercase text-[#A0A0A0] mb-4">Chú Rể<br/><span className="text-[#4A4A4A] text-base font-title mt-2 block">{WEDDING_CONFIG.groom.fullName}</span></h4>
                <img src={qrGroom} alt="QR" className="w-32 h-32 object-contain mx-auto border border-gray-100 p-2 rounded-xl mb-4 shadow-sm" />
                <div className="flex items-center justify-center gap-2 my-1">
                   <p className="font-title font-bold text-[#4A4A4A]">{WEDDING_CONFIG.groom.bank.accountNumber}</p>
                   <button onClick={() => handleCopy(WEDDING_CONFIG.groom.bank.accountNumber, 'Chú Rể')} className="w-6 h-6 rounded bg-gray-100 flex items-center justify-center hover:bg-[#8C7A6B] hover:text-white transition-colors text-xs">📋</button>
                </div>
              </div>
              
              <div className="flex-1 bg-white p-6 rounded-xl text-center border border-[#E8E2D9] shine-effect">
                <h4 className="font-body text-[10px] uppercase text-[#A0A0A0] mb-4">Cô Dâu<br/><span className="text-[#4A4A4A] text-base font-title mt-2 block">{WEDDING_CONFIG.bride.fullName}</span></h4>
                <img src={qrBride} alt="QR" className="w-32 h-32 object-contain mx-auto border border-gray-100 p-2 rounded-xl mb-4 shadow-sm" />
                <div className="flex items-center justify-center gap-2 my-1">
                   <p className="font-title font-bold text-[#4A4A4A]">{WEDDING_CONFIG.bride.bank.accountNumber}</p>
                   <button onClick={() => handleCopy(WEDDING_CONFIG.bride.bank.accountNumber, 'Cô Dâu')} className="w-6 h-6 rounded bg-gray-100 flex items-center justify-center hover:bg-[#8C7A6B] hover:text-white transition-colors text-xs">📋</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}