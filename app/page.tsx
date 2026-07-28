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
    address: 'Thôn Ninh Thanh 1, xã Ea Kar, Đắk Lắk',
    bank: { name: 'Sacombank', accountNumber: '0337188787', accountHolder: 'PHAN VAN NAM', code: 'Sacombank' },
  },
  bride: {
    fullName: 'Trần Thị Mỹ Tiên',
    shortName: 'Mỹ Tiên',
    parents: 'Ông Trần Tài & Bà Nguyễn Thị Hương',
    address: 'Thôn Xuân Tự 2, xã Vạn Hưng, Khánh Hòa',
    bank: { name: 'Vietcombank', accountNumber: '1012345678', accountHolder: 'TRAN THI MY TIEN', code: 'VCB' },
  },
  event: {
    dateIso: '2026-09-20T16:50:00',
    displayDate: '20 . 09 . 2026',
    lunarDate: '10 Tháng 08 Năm Bính Ngọ',
    displayTime: '16:00',
    mapIframeUrl: 'https://maps.google.com/maps?q=12.794806,108.436139&z=15&output=embed',
    bgAudioUrl: '/nhaccuoi.mp3',
  },
  timeline: [
    { date: '14 . 02 . 2020', title: 'Lần Đầu Gặp Gỡ', desc: 'Ánh mắt chạm nhau giữa phố đông, tình yêu bắt đầu từ những điều giản dị nhất.', img: '/story1.jpg', fallback: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc' },
    { date: '20 . 10 . 2023', title: 'Lời Cầu Hôn', desc: '"Em đồng ý chứ?" - Khoảnh khắc thời gian như ngừng trôi, và hành trình mới mở ra.', img: '/story2.jpg', fallback: 'https://images.unsplash.com/photo-1583939003579-730e3918a45a' },
  ],
  images: {
    hero: '/hero.jpg',
    fallbackHero: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=1200',
    gallery: [
      { src: '/story1.jpg', fallback: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&q=80&w=600' },
      { src: '/story2.jpg', fallback: 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&q=80&w=600' },
      { src: '/story3.jpg', fallback: 'https://images.unsplash.com/photo-1606800052052-a08af7148866?auto=format&fit=crop&q=80&w=600' },
      { src: '/story4.jpg', fallback: 'https://images.unsplash.com/photo-1520854221256-17451cc331bf?auto=format&fit=crop&q=80&w=600' },
      { src: '/story5.jpg', fallback: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&q=80&w=600' },
      { src: '/story6.jpg', fallback: 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&q=80&w=600' },
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
  const [wishes, setWishes] = useState<Wish[]>([]);
  const [nameInput, setNameInput] = useState('');
  const [wishInput, setWishInput] = useState('');
  const [showGiftModal, setShowGiftModal] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Intersection Observer cho Scroll Animation
  useEffect(() => {
    const observerOptions = { threshold: 0.15, rootMargin: '0px 0px -50px 0px' };
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) { entry.target.classList.add('is-revealed'); }
      });
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
  }, []);

  // Audio Handler
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

  // Sao chép STK (Toast Notification)
  const handleCopy = (text: string, name: string) => {
    navigator.clipboard.writeText(text);
    setToastMessage(`Đã sao chép STK của ${name} ✔`);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const fetchWishes = async () => {
    if (!supabase) return;
    const { data, error } = await supabase.from('wishes').select('*').order('created_at', { ascending: false });
    if (!error && data) setWishes(data);
  };
  useEffect(() => { fetchWishes(); }, []);

  // Đếm ngược
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

  const handleAddWish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameInput.trim() || !wishInput.trim() || isSubmitting) return;
    setIsSubmitting(true);
    
    if (supabase) {
      const { data, error } = await supabase.from('wishes').insert([{ name: nameInput.trim(), message: wishInput.trim() }]).select();
      if (!error && data) { 
        setWishes([data[0], ...wishes]); 
        setNameInput(''); 
        setWishInput(''); 
        
        // Kích hoạt bùng nổ trái tim
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 2500);
      }
    }
    setIsSubmitting(false);
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
      
      {/* CSS CSS CSS: VIP EFFECTS */}
      <style dangerouslySetInnerHTML={{__html: `
        @import url('https://fonts.googleapis.com/css2?family=Great+Vibes&family=Lora:ital,wght@0,400;0,500;1,400&family=Playfair+Display:ital,wght@0,400;0,600;1,400&display=swap');
        
        .font-script { font-family: 'Great Vibes', cursive; }
        .font-title { font-family: 'Playfair Display', serif; }
        .font-body { font-family: 'Lora', serif; }

        /* Scroll Reveal Base */
        .reveal-on-scroll { opacity: 0; transition-duration: 1.2s; transition-property: all; transition-timing-function: cubic-bezier(0.16, 1, 0.3, 1); }
        .reveal-left { transform: translateX(-60px); }
        .reveal-right { transform: translateX(60px); }
        .reveal-up { transform: translateY(50px); }
        .reveal-zoom { transform: scale(0.9); }
        .is-revealed { opacity: 1 !important; transform: translate(0) scale(1) !important; filter: blur(0) !important; }
        .delay-100 { transition-delay: 100ms; }
        .delay-200 { transition-delay: 200ms; }
        .delay-300 { transition-delay: 300ms; }

        /* Floating Petals/Hearts */
        @keyframes float-petal { 0% { transform: translateY(-10vh) rotate(0deg) translateX(0); opacity: 0; } 20% { opacity: 0.7; } 80% { opacity: 0.7; } 100% { transform: translateY(110vh) rotate(360deg) translateX(60px); opacity: 0; } }
        .petal { position: fixed; top: -10%; z-index: 0; pointer-events: none; animation: float-petal linear infinite; }

        /* Music Player Wave */
        @keyframes soundwave { 0% { transform: scale(1); opacity: 0.6; } 100% { transform: scale(1.6); opacity: 0; } }
        .wave-ring { position: absolute; inset: 0; border-radius: 50%; border: 1.5px solid #8C7A6B; pointer-events: none; }
        .playing .wave-ring { animation: soundwave 2s infinite ease-out; }
        
        /* Heartbeat Pulse */
        @keyframes heartbeat { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.1); color: #8C7A6B; } }
        .pulse-heartbeat { animation: heartbeat 1s infinite ease-in-out; }

        /* Shine Effect Gallery */
        .shine-effect { position: relative; overflow: hidden; }
        .shine-effect::after { content: ''; position: absolute; top: 0; left: -100%; width: 50%; height: 100%; background: linear-gradient(to right, rgba(255,255,255,0) 0%, rgba(255,255,255,0.4) 50%, rgba(255,255,255,0) 100%); transform: skewX(-25deg); z-index: 10; transition: none; }
        .shine-effect:hover::after { animation: shine 0.75s forwards; }
        @keyframes shine { 100% { left: 200%; } }

        /* Scroll Carousel */
        @keyframes scroll-left { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
        .animate-scroll { display: flex; width: max-content; animation: scroll-left 40s linear infinite; }
        .animate-scroll:hover { animation-play-state: paused; }

        /* Heart Burst */
        @keyframes burst-up { 0% { transform: translateY(0) scale(0.5); opacity: 1; } 100% { transform: translateY(-120px) scale(1.5) rotate(20deg); opacity: 0; } }
        .burst-heart { position: absolute; left: 50%; top: 0; animation: burst-up 1.5s cubic-bezier(0, 1, 0.5, 1) forwards; pointer-events: none; z-index: 50; }
      `}} />

      <audio ref={audioRef} loop src={WEDDING_CONFIG.event.bgAudioUrl} />

      {/* Mưa Cánh Hoa / Trái Tim Nhẹ Nhàng */}
      {[...Array(15)].map((_, i) => (
        <div key={i} className="petal text-[#D4C3B3]/60 drop-shadow-sm" style={{ left: `${(i * 7)}%`, animationDuration: `${12 + (i % 8)}s`, animationDelay: `${(i % 5)}s`, fontSize: `${12 + (i % 3) * 6}px` }}>
          {i % 2 === 0 ? '🌸' : '🤍'}
        </div>
      ))}

      {/* Thông báo Toast (Copy STK) */}
      <div className={`fixed top-8 left-1/2 -translate-x-1/2 bg-[#3A332C] text-white px-6 py-3 rounded-full shadow-2xl z-[200] flex items-center gap-3 transition-all duration-500 font-body text-sm ${toastMessage ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-10 pointer-events-none'}`}>
        <span className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center text-xs font-bold">✓</span>
        {toastMessage}
      </div>

      {/* ĐĨA THAN MUSIC PLAYER - GÓC PHẢI DƯỚI */}
      <div className={`fixed bottom-6 right-6 z-50 flex items-center justify-center cursor-pointer ${isPlaying ? 'playing' : ''}`} onClick={toggleMusic}>
        <div className="wave-ring" style={{animationDelay: '0s'}}></div>
        <div className="wave-ring" style={{animationDelay: '1s'}}></div>
        
        {/* Vinyl Disc Design */}
        <div className={`w-12 h-12 md:w-14 md:h-14 rounded-full shadow-2xl relative flex items-center justify-center bg-gradient-to-br from-[#1a1a1a] to-[#000] border-2 border-gray-600 ${isPlaying ? 'animate-spin' : ''}`} style={{ animationDuration: '4s' }}>
           {/* Rãnh đĩa than */}
           <div className="absolute inset-1 rounded-full border border-white/10"></div>
           <div className="absolute inset-2 rounded-full border border-white/5"></div>
           {/* Label giữa */}
           <div className="w-5 h-5 bg-gradient-to-br from-[#B8A492] to-[#8C7A6B] rounded-full flex items-center justify-center relative z-10 shadow-inner">
             {/* Lỗ tâm */}
             <div className="w-1.5 h-1.5 bg-black rounded-full"></div>
           </div>
           
           {!isPlaying && (
             <div className="absolute inset-0 bg-black/60 rounded-full flex items-center justify-center z-20 backdrop-blur-[1px]">
               <div className="w-0 h-0 border-t-4 border-t-transparent border-l-6 border-l-white border-b-4 border-b-transparent ml-1"></div>
             </div>
           )}
        </div>
      </div>

      {/* ====================================================================
          1. HERO SECTION (PARALLAX BACKGROUND) 
          ==================================================================== */}
      <section className="relative min-h-screen flex flex-col items-center justify-center px-4 pt-10 pb-20 overflow-hidden">
        {/* Parallax Background Cover */}
        <div className="absolute inset-0 z-0 bg-[url('https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=1920')] bg-cover bg-center bg-fixed opacity-10"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-[#FAFAF7] via-transparent to-[#FAFAF7] z-0"></div>
        
        <div className="text-center z-10 w-full max-w-4xl mx-auto flex flex-col items-center mt-6">
          <div className="relative w-full max-w-[300px] md:max-w-[400px] aspect-[3/4] mb-12 reveal-on-scroll reveal-zoom delay-100 group">
             <div className="w-full h-full rounded-t-full overflow-hidden relative shadow-2xl border-[6px] border-white z-10 bg-white">
               <img src={WEDDING_CONFIG.images.hero} onError={(e) => e.currentTarget.src = WEDDING_CONFIG.images.fallbackHero} alt="Nam & Tiên" className="w-full h-full object-cover transition-transform duration-[10000ms] group-hover:scale-110 ease-out" />
             </div>
             <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 bg-white/95 backdrop-blur-md px-10 py-3 rounded-full shadow-lg border border-[#E8E2D9] whitespace-nowrap z-20 reveal-on-scroll reveal-up delay-300">
               <span className="font-script text-2xl md:text-3xl text-[#8C7A6B]">Save the Date</span>
             </div>
          </div>

          <div className="flex flex-row items-center justify-center gap-3 md:gap-8 mt-6 overflow-hidden w-full">
            <h1 className="reveal-on-scroll reveal-left delay-200 font-title text-4xl md:text-5xl lg:text-6xl text-[#4A4A4A] tracking-wider whitespace-nowrap">{WEDDING_CONFIG.groom.shortName}</h1>
            <span className="reveal-on-scroll reveal-zoom delay-300 font-script text-3xl md:text-5xl text-[#B8A492]">&</span>
            <h1 className="reveal-on-scroll reveal-right delay-200 font-title text-4xl md:text-5xl lg:text-6xl text-[#4A4A4A] tracking-wider whitespace-nowrap">{WEDDING_CONFIG.bride.shortName}</h1>
          </div>
        </div>
      </section>

      {/* ====================================================================
          2. ĐẾM NGƯỢC (HEARTBEAT SECONDS)
          ==================================================================== */}
      <section className="py-10 px-4 relative z-10 -mt-10 reveal-on-scroll reveal-up">
        <div className="flex justify-center gap-4 md:gap-10 max-w-2xl mx-auto bg-white/80 backdrop-blur-md py-8 px-6 rounded-2xl border border-[#E8E2D9] shadow-xl">
          {[{ label: 'Ngày', value: timeLeft.days }, { label: 'Giờ', value: timeLeft.hours }, { label: 'Phút', value: timeLeft.minutes }].map((item, index) => (
            <div key={index} className="text-center w-14 md:w-20">
              <div className="font-title text-3xl md:text-4xl text-[#8C7A6B] mb-2">{item.value.toString().padStart(2, '0')}</div>
              <div className="font-body text-[9px] md:text-xs uppercase tracking-[0.2em] text-[#A0A0A0]">{item.label}</div>
            </div>
          ))}
          {/* Giây Đập Nhịp Tim */}
          <div className="text-center w-14 md:w-20">
             <div className="font-title text-3xl md:text-4xl text-[#8C7A6B] mb-2 pulse-heartbeat">{timeLeft.seconds.toString().padStart(2, '0')}</div>
             <div className="font-body text-[9px] md:text-xs uppercase tracking-[0.2em] text-[#A0A0A0]">Giây</div>
          </div>
        </div>
      </section>

      {/* ====================================================================
          3. TÌNH YÊU (TIMELINE) LƯỚT CUỘN TRANG
          ==================================================================== */}
      <section className="py-24 px-4 max-w-4xl mx-auto overflow-hidden">
        <div className="text-center mb-16 reveal-on-scroll reveal-up">
          <h2 className="font-script text-5xl md:text-6xl text-[#8C7A6B]">Our Story</h2>
          <div className="font-body text-[10px] tracking-[0.2em] text-[#A0A0A0] uppercase mt-3">Hành Trình Tình Yêu</div>
        </div>

        <div className="relative border-l border-[#D4C3B3] md:border-none ml-6 md:ml-0">
           {/* Đường thẳng ở giữa (Desktop) */}
           <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-[#D4C3B3] to-transparent -translate-x-1/2 reveal-on-scroll reveal-up"></div>
           
           {WEDDING_CONFIG.timeline.map((item, idx) => (
             <div key={idx} className={`relative mb-16 md:mb-24 md:flex items-center justify-between w-full reveal-on-scroll ${idx % 2 === 0 ? 'md:flex-row-reverse reveal-left' : 'reveal-right'}`}>
               
               {/* Chấm tròn ở giữa */}
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
          4. ALBUM ẢNH (SHINE EFFECT)
          ==================================================================== */}
      <section className="py-24 bg-[#F5F2ED] border-y border-[#E8E2D9] overflow-hidden reveal-on-scroll reveal-up">
        <div className="text-center mb-16">
          <h2 className="font-script text-5xl md:text-6xl text-[#8C7A6B]">Our Gallery</h2>
        </div>

        <div className="relative w-full overflow-hidden whitespace-nowrap py-4">
          <div className="animate-scroll gap-4 px-4 flex items-center">
            {[...WEDDING_CONFIG.images.gallery, ...WEDDING_CONFIG.images.gallery].map((img, idx) => (
              <div key={idx} className="inline-block w-[280px] md:w-[350px] aspect-[4/5] bg-white p-2.5 rounded-lg flex-shrink-0 shadow-[0_4px_20px_rgba(0,0,0,0.08)] mx-2 transform hover:scale-[1.03] transition-transform duration-500 cursor-pointer shine-effect">
                <img src={img.src} onError={(e) => e.currentTarget.src = img.fallback} className="w-full h-full object-cover rounded" alt="Gallery" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ====================================================================
          5. BẢN ĐỒ & SỰ KIỆN 
          ==================================================================== */}
      <section className="py-24 px-4 max-w-6xl mx-auto overflow-hidden">
        <div className="grid lg:grid-cols-12 gap-12 items-start">
          <div className="lg:col-span-4 flex flex-col gap-8 reveal-on-scroll reveal-left">
             <div className="bg-[#4A4A4A] text-white p-8 rounded-2xl text-center shadow-2xl relative overflow-hidden group">
                <div className="absolute inset-0 bg-white/5 group-hover:bg-white/10 transition-colors"></div>
                <h3 className="font-body text-xs font-medium tracking-[0.2em] uppercase mb-4 text-[#D4C3B3]">Dress Code</h3>
                <p className="font-body text-xs text-gray-300 mb-6 leading-relaxed relative z-10">Trang phục gợi ý để khung hình thêm phần hoàn hảo.</p>
                <div className="flex justify-center gap-4 relative z-10">
                  {WEDDING_CONFIG.dressCodeColors.map((color, idx) => (
                    <div key={idx} className="w-10 h-10 rounded-full border border-white/20 shadow-inner transform hover:scale-110 transition-transform" style={{ backgroundColor: color }} />
                  ))}
                </div>
             </div>
          </div>

          <div className="lg:col-span-8 bg-white p-4 md:p-8 rounded-2xl border border-[#E8E2D9] shadow-lg reveal-on-scroll reveal-right delay-200 shine-effect">
            <h2 className="font-script text-5xl text-[#8C7A6B] text-center mb-2">Location</h2>
            <p className="font-body text-center text-sm text-[#A0A0A0] mb-6">Tư Gia Nhà Trai - {WEDDING_CONFIG.event.displayTime}</p>
            <div className="w-full aspect-square md:aspect-[16/9] bg-[#F5F2ED] rounded-xl overflow-hidden shadow-inner relative">
              <iframe src={WEDDING_CONFIG.event.mapIframeUrl} className="absolute inset-0 w-full h-full" style={{ border: 0 }} allowFullScreen={false} loading="lazy" />
            </div>
          </div>
        </div>
      </section>

      {/* ====================================================================
          6. SỔ LƯU BÚT (HEART BURST CONFETTI)
          ==================================================================== */}
      <section className="py-24 px-4 max-w-3xl mx-auto relative reveal-on-scroll reveal-up">
        <div className="text-center mb-12">
          <h2 className="font-script text-5xl md:text-6xl text-[#8C7A6B]">Guestbook</h2>
        </div>

        <div className="bg-white p-8 shadow-xl border border-[#E8E2D9] rounded-2xl mb-12">
          <form onSubmit={handleAddWish} className="relative">
            <input type="text" required placeholder="Tên của bạn..." value={nameInput} onChange={(e) => setNameInput(e.target.value)} className="font-body w-full mb-6 p-4 border-b border-[#F0EBE1] focus:outline-none focus:border-[#8C7A6B] text-sm md:text-base bg-transparent transition-colors" />
            <textarea required rows={3} placeholder="Gửi gắm yêu thương..." value={wishInput} onChange={(e) => setWishInput(e.target.value)} className="font-body w-full mb-6 p-4 border-b border-[#F0EBE1] focus:outline-none focus:border-[#8C7A6B] text-sm md:text-base bg-transparent transition-colors resize-none" />
            
            <button type="submit" disabled={isSubmitting} className="relative w-full bg-[#4A4A4A] text-white py-4 text-xs md:text-sm font-body tracking-[0.2em] uppercase hover:bg-[#8C7A6B] transition-colors rounded-lg shadow-md overflow-hidden group">
              <span className="relative z-10">{isSubmitting ? 'Đang gửi...' : 'Gửi Lời Chúc'}</span>
              
              {/* Hiệu ứng tia sáng chạy ngang nút */}
              <div className="absolute top-0 -left-[100%] w-1/2 h-full bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-[-20deg] group-hover:animate-[shine_1s_ease-in-out]"></div>
              
              {/* Bursting Hearts Confetti */}
              {showConfetti && [...Array(12)].map((_, i) => (
                <div key={i} className="burst-heart text-xl md:text-2xl drop-shadow-md" style={{ left: `${30 + Math.random() * 40}%`, animationDelay: `${Math.random() * 0.2}s` }}>
                  {i % 2 === 0 ? '❤️' : '✨'}
                </div>
              ))}
            </button>
          </form>
        </div>

        <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
          {wishes.map((item) => (
            <div key={item.id} className="bg-white p-6 rounded-xl border border-[#F0EBE1] shadow-sm relative shine-effect hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-2 relative z-10">
                <span className="font-title font-semibold text-[#4A4A4A] text-base">{item.name}</span>
                {isAdmin && <button onClick={() => handleDeleteWish(item.id)} className="text-red-400 text-xs bg-red-50 px-2 py-1 rounded">Xóa</button>}
              </div>
              <p className="font-body text-[#606060] text-sm italic relative z-10">"{item.message}"</p>
            </div>
          ))}
        </div>
      </section>

      {/* ====================================================================
          7. NÚT GỬI QUÀ NỔI & MODAL COPY
          ==================================================================== */}
      <div className="flex justify-center pb-10 reveal-on-scroll reveal-zoom">
        <button onClick={() => setShowGiftModal(true)} className="flex flex-col items-center group relative cursor-pointer">
          <div className="absolute inset-0 bg-[#8C7A6B]/20 rounded-full animate-ping"></div>
          <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-[#E8E2D9] group-hover:-translate-y-2 transition-transform relative z-10 shine-effect">
             <span className="text-3xl relative z-10">💝</span>
          </div>
          <span className="font-body text-[10px] md:text-xs uppercase tracking-[0.2em] text-[#8C7A6B] mt-4 font-bold">Gửi Quà Mừng</span>
        </button>
      </div>

      {showGiftModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4" onClick={() => setShowGiftModal(false)}>
          <div className="bg-[#FAFAF7] w-full max-w-2xl rounded-2xl overflow-hidden shadow-2xl relative border border-[#E8E2D9]" onClick={(e) => e.stopPropagation()}>
            <div className="bg-[#8C7A6B] text-white text-center py-6 relative">
              <h3 className="font-body text-sm md:text-base uppercase tracking-[0.3em]">Hộp Quà Mừng</h3>
              <button onClick={() => setShowGiftModal(false)} className="absolute right-4 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/40 transition-colors text-xl pb-1">×</button>
            </div>
            
            <div className="p-6 md:p-8 flex flex-col md:flex-row gap-6 md:gap-8">
              {/* Box Chú Rể */}
              <div className="flex-1 bg-white p-6 rounded-xl text-center shadow-sm border border-[#E8E2D9] relative group">
                <h4 className="font-body text-[10px] uppercase tracking-widest text-[#A0A0A0] mb-4">Chú Rể<br/><span className="text-[#4A4A4A] text-sm md:text-base font-title mt-2 block">{WEDDING_CONFIG.groom.fullName}</span></h4>
                <div className="bg-white p-2 rounded-xl border border-gray-100 inline-block mb-4 shadow-sm shine-effect"><img src={qrGroom} alt="QR" className="w-40 h-40 object-contain mx-auto relative z-10" /></div>
                <p className="font-body text-[10px] text-[#A0A0A0] uppercase">{WEDDING_CONFIG.groom.bank.name}</p>
                <div className="flex items-center justify-center gap-2 my-1">
                   <p className="font-title text-base font-bold text-[#4A4A4A]">{WEDDING_CONFIG.groom.bank.accountNumber}</p>
                   <button onClick={() => handleCopy(WEDDING_CONFIG.groom.bank.accountNumber, 'Chú Rể')} className="w-6 h-6 rounded bg-gray-100 flex items-center justify-center hover:bg-[#8C7A6B] hover:text-white transition-colors text-xs" title="Copy">📋</button>
                </div>
                <p className="font-body text-xs text-[#606060] mb-4">{WEDDING_CONFIG.groom.bank.accountHolder}</p>
              </div>
              
              {/* Box Cô Dâu */}
              <div className="flex-1 bg-white p-6 rounded-xl text-center shadow-sm border border-[#E8E2D9] relative group">
                <h4 className="font-body text-[10px] uppercase tracking-widest text-[#A0A0A0] mb-4">Cô Dâu<br/><span className="text-[#4A4A4A] text-sm md:text-base font-title mt-2 block">{WEDDING_CONFIG.bride.fullName}</span></h4>
                <div className="bg-white p-2 rounded-xl border border-gray-100 inline-block mb-4 shadow-sm shine-effect"><img src={qrBride} alt="QR" className="w-40 h-40 object-contain mx-auto relative z-10" /></div>
                <p className="font-body text-[10px] text-[#A0A0A0] uppercase">{WEDDING_CONFIG.bride.bank.name}</p>
                <div className="flex items-center justify-center gap-2 my-1">
                   <p className="font-title text-base font-bold text-[#4A4A4A]">{WEDDING_CONFIG.bride.bank.accountNumber}</p>
                   <button onClick={() => handleCopy(WEDDING_CONFIG.bride.bank.accountNumber, 'Cô Dâu')} className="w-6 h-6 rounded bg-gray-100 flex items-center justify-center hover:bg-[#8C7A6B] hover:text-white transition-colors text-xs" title="Copy">📋</button>
                </div>
                <p className="font-body text-xs text-[#606060] mb-4">{WEDDING_CONFIG.bride.bank.accountHolder}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}