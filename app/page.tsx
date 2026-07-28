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
      { src: '/story7.jpg', fallback: 'https://images.unsplash.com/photo-1606800052052-a08af7148866?auto=format&fit=crop&q=80&w=600' },
      { src: '/story8.jpg', fallback: 'https://images.unsplash.com/photo-1520854221256-17451cc331bf?auto=format&fit=crop&q=80&w=600' },
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
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // LOGIC HIỆU ỨNG CUỘN TRANG VIP (Intersection Observer)
  useEffect(() => {
    const observerOptions = { threshold: 0.15, rootMargin: '0px 0px -50px 0px' };
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-revealed');
        }
      });
    }, observerOptions);

    setTimeout(() => {
      document.querySelectorAll('.reveal-on-scroll').forEach((el) => observer.observe(el));
      setIsLoaded(true);
    }, 100);

    return () => observer.disconnect();
  }, []);

  // Xử lý Admin & Audio
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('admin') === 'true' || params.get('admin') === 'namnguyen') setIsAdmin(true);
    }
  }, []);

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
      if (!error && data) { setWishes([data[0], ...wishes]); setNameInput(''); setWishInput(''); }
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

  return (
    <div className={`min-h-screen bg-[#FAFAF7] text-[#4A4A4A] font-serif relative overflow-x-hidden selection:bg-[#D4C3B3] selection:text-white pb-24 transition-opacity duration-1000 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}>
      
      {/* CSS NÂNG CAO CHO CÁC HIỆU ỨNG VIP */}
      <style dangerouslySetInnerHTML={{__html: `
        @import url('https://fonts.googleapis.com/css2?family=Great+Vibes&family=Lora:ital,wght@0,400;0,500;1,400&family=Playfair+Display:ital,wght@0,400;0,600;1,400&display=swap');
        
        .font-script { font-family: 'Great Vibes', cursive; }
        .font-title { font-family: 'Playfair Display', serif; }
        .font-body { font-family: 'Lora', serif; }

        /* Lớp cơ sở cho hiệu ứng lướt */
        .reveal-on-scroll {
          opacity: 0;
          transition-duration: 1.5s;
          transition-property: all;
          transition-timing-function: cubic-bezier(0.16, 1, 0.3, 1);
        }
        
        /* Các chiều chuyển động */
        .reveal-left { transform: translateX(-80px); }
        .reveal-right { transform: translateX(80px); }
        .reveal-up { transform: translateY(60px); }
        .reveal-zoom { transform: scale(0.85); }
        .reveal-blur { filter: blur(10px); transform: scale(1.05); }

        /* Trạng thái đã hiện */
        .is-revealed {
          opacity: 1 !important;
          transform: translate(0) scale(1) !important;
          filter: blur(0) !important;
        }

        /* Độ trễ (Staggering) */
        .delay-100 { transition-delay: 100ms; }
        .delay-200 { transition-delay: 200ms; }
        .delay-300 { transition-delay: 300ms; }
        .delay-400 { transition-delay: 400ms; }
        .delay-500 { transition-delay: 500ms; }

        @keyframes scroll-left { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
        .animate-scroll { display: flex; width: max-content; animation: scroll-left 40s linear infinite; }
        .animate-scroll:hover { animation-play-state: paused; }
      `}} />

      <audio ref={audioRef} loop src={WEDDING_CONFIG.event.bgAudioUrl} />

      {/* NÚT BẬT TẮT NHẠC */}
      <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 cursor-pointer" onClick={toggleMusic}>
        <div className="bg-white/80 backdrop-blur-md p-3 rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-[#E8E2D9] flex items-center justify-center hover:scale-110 active:scale-95 transition-all">
          <div className={`w-8 h-8 rounded-full border border-[#B8A492] flex items-center justify-center text-sm relative ${isPlaying ? 'animate-spin' : ''}`} style={{ animationDuration: '3s' }}>
            <span className="text-[#8C7A6B]">🎵</span>
            {!isPlaying && (
              <span className="absolute inset-0 rounded-full flex items-center justify-center text-[24px] text-red-500/80 font-bold backdrop-blur-[1px] -mt-1">/</span>
            )}
          </div>
        </div>
      </div>

      {/* ====================================================================
          1. HERO SECTION (CHỮ LỒNG & TỪ HAI BÊN GHÉP VÀO) 
          ==================================================================== */}
      <section className="relative min-h-[95vh] flex flex-col items-center justify-center px-4 pt-10 pb-20 overflow-hidden">
        
        {/* LOGO CHỮ LỒNG (MONOGRAM) */}
        <div className="relative h-32 w-full flex items-center justify-center mb-8 reveal-on-scroll reveal-zoom">
            <h1 className="font-title text-[100px] md:text-[130px] text-[#E8E2D9] absolute translate-x-[-15px] md:translate-x-[-25px] opacity-80 leading-none">N</h1>
            <h1 className="font-title text-[100px] md:text-[130px] text-[#B8A492] absolute translate-x-[15px] md:translate-x-[25px] translate-y-[20px] md:translate-y-[30px] opacity-90 leading-none">T</h1>
            <div className="absolute font-script text-5xl md:text-6xl text-[#4A4A4A] z-10 drop-shadow-md">&</div>
        </div>
        
        {/* KHUNG ẢNH VIP EFFECT */}
        <div className="text-center z-10 w-full max-w-4xl mx-auto flex flex-col items-center mt-10">
          <div className="relative w-full max-w-[320px] md:max-w-[420px] aspect-[3/4] mb-12 reveal-on-scroll reveal-blur delay-200 group">
             <div className="w-full h-full rounded-t-full overflow-hidden relative shadow-2xl border-[6px] border-white z-10 bg-white">
               {/* Ảnh tự động zoom nhẹ mượt mà */}
               <img src={WEDDING_CONFIG.images.hero} onError={(e) => e.currentTarget.src = WEDDING_CONFIG.images.fallbackHero} alt="Nam & Tiên" className="w-full h-full object-cover transition-transform duration-[10000ms] group-hover:scale-110 ease-out" />
             </div>
             
             {/* Text nổi bồng bềnh */}
             <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 bg-white/95 backdrop-blur-md px-10 py-3 rounded-full shadow-lg border border-[#E8E2D9] whitespace-nowrap z-20 reveal-on-scroll reveal-up delay-500">
               <span className="font-script text-2xl md:text-3xl text-[#8C7A6B]">Save the Date</span>
             </div>
          </div>

          {/* TÊN LƯỚT TỪ 2 BÊN GHÉP VÀO */}
          <div className="flex flex-row items-center justify-center gap-3 md:gap-8 mt-6 overflow-hidden w-full">
            <h1 className="reveal-on-scroll reveal-left delay-300 font-title text-4xl md:text-5xl lg:text-6xl text-[#4A4A4A] tracking-wider whitespace-nowrap">
              {WEDDING_CONFIG.groom.shortName}
            </h1>
            <span className="reveal-on-scroll reveal-zoom delay-500 font-script text-3xl md:text-5xl text-[#B8A492]">
              &
            </span>
            <h1 className="reveal-on-scroll reveal-right delay-300 font-title text-4xl md:text-5xl lg:text-6xl text-[#4A4A4A] tracking-wider whitespace-nowrap">
              {WEDDING_CONFIG.bride.shortName}
            </h1>
          </div>

          <div className="mt-10 flex items-center justify-center w-full max-w-md reveal-on-scroll reveal-up delay-400">
            <div className="h-px bg-gradient-to-r from-transparent via-[#D4C3B3] to-transparent flex-1"></div>
            <span className="font-body text-lg tracking-[0.2em] text-[#8C7A6B] px-6">{WEDDING_CONFIG.event.displayDate}</span>
            <div className="h-px bg-gradient-to-r from-[#D4C3B3] via-[#D4C3B3] to-transparent flex-1"></div>
          </div>
        </div>
      </section>

      {/* ====================================================================
          2. ĐẾM NGƯỢC
          ==================================================================== */}
      <section className="py-10 px-4 relative z-10 -mt-10 reveal-on-scroll reveal-up">
        <div className="flex justify-center gap-4 md:gap-10 max-w-2xl mx-auto bg-white/80 backdrop-blur-md py-8 px-6 rounded-2xl border border-[#E8E2D9] shadow-xl">
          {[{ label: 'Ngày', value: timeLeft.days }, { label: 'Giờ', value: timeLeft.hours }, { label: 'Phút', value: timeLeft.minutes }, { label: 'Giây', value: timeLeft.seconds }].map((item, index) => (
            <div key={index} className="text-center w-16 md:w-20">
              <div className="font-title text-3xl md:text-4xl text-[#8C7A6B] mb-2">{item.value.toString().padStart(2, '0')}</div>
              <div className="font-body text-[9px] md:text-xs uppercase tracking-[0.2em] text-[#A0A0A0]">{item.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ====================================================================
          3. LỜI NGỎ & GIA ĐÌNH (LƯỚT TRÁI - LƯỚT PHẢI)
          ==================================================================== */}
      <section className="py-24 px-4 max-w-5xl mx-auto overflow-hidden">
        <div className="text-center mb-16 reveal-on-scroll reveal-up">
          <h2 className="font-script text-5xl md:text-6xl text-[#8C7A6B] mb-4">Lời Ngỏ</h2>
          <p className="font-body text-sm md:text-base text-gray-500 italic max-w-2xl mx-auto leading-loose px-4">
            "Hành trình vạn dặm bắt đầu từ một bước chân, và hành trình hạnh phúc của chúng con bắt đầu từ ngày hôm nay. Trân trọng kính mời quý khách đến chung vui cùng gia đình chúng tôi."
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-10 md:gap-16 text-center px-4">
          {/* Nhà Trai - Lướt từ Trái */}
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

          {/* Nhà Gái - Lướt từ Phải */}
          <div className="reveal-on-scroll reveal-right delay-200 bg-white p-10 md:p-12 shadow-lg rounded-2xl border border-[#F0EBE1] relative hover:shadow-2xl transition-shadow duration-500">
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[#FAFAF7] px-2">
              <span className="font-body text-[10px] md:text-xs uppercase tracking-[0.3em] text-[#B8A492] border border-[#D4C3B3] px-6 py-2 rounded-full bg-white shadow-sm">Nhà Gái</span>
            </div>
            <div className="mt-6 mb-8">
              <p className="font-body text-xs tracking-[0.2em] text-[#A0A0A0] uppercase mb-3">Út Nữ</p>
              <h3 className="font-title text-2xl md:text-3xl text-[#4A4A4A]">{WEDDING_CONFIG.bride.fullName}</h3>
            </div>
            <div className="w-12 h-px bg-[#D4C3B3] mx-auto mb-6"></div>
            <p className="font-body font-medium text-[#606060] text-sm md:text-base">{WEDDING_CONFIG.bride.parents}</p>
            <p className="font-body text-xs text-[#A0A0A0] mt-4 leading-relaxed">{WEDDING_CONFIG.bride.address}</p>
          </div>
        </div>
      </section>

      {/* ====================================================================
          4. ALBUM ẢNH (SCROLL MƯỢT)
          ==================================================================== */}
      <section className="py-24 bg-[#F5F2ED] border-y border-[#E8E2D9] overflow-hidden reveal-on-scroll reveal-up">
        <div className="text-center mb-16">
          <h2 className="font-script text-5xl md:text-6xl text-[#8C7A6B] mb-2">Our Gallery</h2>
          <div className="font-body text-[10px] tracking-[0.2em] text-[#A0A0A0] uppercase mt-2">Khoảnh Khắc Hạnh Phúc</div>
        </div>

        <div className="relative w-full overflow-hidden whitespace-nowrap mb-12">
          <div className="animate-scroll gap-4 px-4 flex items-center">
            {[...WEDDING_CONFIG.images.gallery, ...WEDDING_CONFIG.images.gallery].map((img, idx) => (
              <div key={idx} className="inline-block w-[280px] md:w-[350px] h-[350px] md:h-[450px] bg-white p-2 rounded-lg flex-shrink-0 shadow-lg mx-2 transform hover:scale-[1.02] transition-transform duration-500">
                <img src={img.src} onError={(e) => e.currentTarget.src = img.fallback} className="w-full h-full object-cover rounded-md" alt="Gallery Slide" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ====================================================================
          5. BẢN ĐỒ & SỰ KIỆN (ZOOM & SLIDE)
          ==================================================================== */}
      <section className="py-24 px-4 max-w-6xl mx-auto overflow-hidden">
        <div className="grid lg:grid-cols-12 gap-12 items-start">
          
          {/* Lịch & Dresscode (Trái) */}
          <div className="lg:col-span-4 flex flex-col gap-8 reveal-on-scroll reveal-left">
             <div className="bg-white p-8 rounded-2xl text-center border border-[#E8E2D9] shadow-lg relative overflow-hidden">
               <div className="absolute top-0 right-0 w-24 h-24 bg-[#F5F2ED] rounded-bl-full -z-10"></div>
               <h3 className="font-body uppercase tracking-[0.2em] text-xs mb-6 text-[#8C7A6B] font-bold">Tháng 9 - 2026</h3>
               <div className="grid grid-cols-7 gap-2 text-[10px] md:text-xs font-body text-[#A0A0A0] mb-4">
                 <div>CN</div><div>T2</div><div>T3</div><div>T4</div><div>T5</div><div>T6</div><div>T7</div>
               </div>
               <div className="grid grid-cols-7 gap-y-4 text-sm md:text-base font-title text-[#606060]">
                 <div className="opacity-0">.</div><div className="opacity-0">.</div>
                 <div>1</div><div>2</div><div>3</div><div>4</div><div>5</div>
                 <div>6</div><div>7</div><div>8</div><div>9</div><div>10</div><div>11</div><div>12</div>
                 <div>13</div><div>14</div><div>15</div><div>16</div><div>17</div><div>18</div><div>19</div>
                 <div className="relative flex justify-center items-center">
                    <span className="absolute w-8 h-8 md:w-10 md:h-10 bg-[#8C7A6B] rounded-full z-0 shadow-md"></span>
                    <span className="relative z-10 text-white font-bold">20</span>
                 </div>
                 <div>21</div><div>22</div><div>23</div><div>24</div><div>25</div><div>26</div>
                 <div>27</div><div>28</div><div>29</div><div>30</div>
               </div>
               <div className="mt-6 pt-4 border-t border-[#F0EBE1] text-xs font-body text-[#8C7A6B] italic">
                 {WEDDING_CONFIG.event.lunarDate}
               </div>
             </div>

             <div className="bg-[#4A4A4A] text-white p-8 rounded-2xl text-center shadow-lg">
                <h3 className="font-body text-xs font-medium tracking-[0.2em] uppercase mb-4 text-[#D4C3B3]">Dress Code</h3>
                <p className="font-body text-xs text-gray-300 mb-6 leading-relaxed">Trang phục gợi ý để khung hình thêm phần hoàn hảo.</p>
                <div className="flex justify-center gap-4">
                  {WEDDING_CONFIG.dressCodeColors.map((color, idx) => (
                    <div key={idx} className="w-10 h-10 rounded-full border border-white/20 shadow-inner" style={{ backgroundColor: color }} />
                  ))}
                </div>
             </div>
          </div>

          {/* Bản đồ (Phải) */}
          <div className="lg:col-span-8 bg-white p-4 md:p-8 rounded-2xl border border-[#E8E2D9] shadow-lg reveal-on-scroll reveal-right delay-200">
            <h2 className="font-script text-5xl text-[#8C7A6B] text-center mb-2">Location</h2>
            <p className="font-body text-center text-sm text-[#A0A0A0] mb-6">Tư Gia Nhà Trai - Đón khách lúc {WEDDING_CONFIG.event.displayTime}</p>
            <div className="w-full aspect-square md:aspect-[16/9] bg-[#F5F2ED] rounded-xl overflow-hidden shadow-inner relative">
              <iframe src={WEDDING_CONFIG.event.mapIframeUrl} className="absolute inset-0 w-full h-full" style={{ border: 0 }} allowFullScreen={false} loading="lazy" />
            </div>
          </div>

        </div>
      </section>

      {/* ====================================================================
          6. SỔ LƯU BÚT
          ==================================================================== */}
      <section className="py-24 px-4 max-w-3xl mx-auto relative reveal-on-scroll reveal-up">
        <div className="text-center mb-12">
          <h2 className="font-script text-5xl md:text-6xl text-[#8C7A6B]">Guestbook</h2>
          <div className="font-body text-[10px] tracking-[0.2em] text-[#A0A0A0] uppercase mt-2">Sổ Lưu Bút</div>
        </div>

        <div className="bg-white p-8 shadow-xl border border-[#E8E2D9] rounded-2xl mb-12">
          <form onSubmit={handleAddWish}>
            <input type="text" required placeholder="Tên của bạn..." value={nameInput} onChange={(e) => setNameInput(e.target.value)} className="font-body w-full mb-6 p-4 border-b border-[#F0EBE1] focus:outline-none focus:border-[#8C7A6B] text-sm md:text-base bg-transparent transition-colors" />
            <textarea required rows={3} placeholder="Gửi gắm yêu thương..." value={wishInput} onChange={(e) => setWishInput(e.target.value)} className="font-body w-full mb-6 p-4 border-b border-[#F0EBE1] focus:outline-none focus:border-[#8C7A6B] text-sm md:text-base bg-transparent transition-colors resize-none" />
            <button type="submit" disabled={isSubmitting} className="w-full bg-[#4A4A4A] text-white py-4 text-xs md:text-sm font-body tracking-[0.2em] uppercase hover:bg-[#8C7A6B] transition-colors rounded-lg shadow-md">
              {isSubmitting ? 'Đang gửi...' : 'Gửi Lời Chúc'}
            </button>
          </form>
        </div>

        <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
          {wishes.map((item) => (
            <div key={item.id} className="bg-white p-6 rounded-xl border border-[#F0EBE1] shadow-sm relative">
              <div className="flex justify-between items-start mb-2">
                <span className="font-title font-semibold text-[#4A4A4A] text-base">{item.name}</span>
                {isAdmin && <button onClick={() => handleDeleteWish(item.id)} className="text-red-400 text-xs hover:text-red-600 bg-red-50 px-2 py-1 rounded">Xóa</button>}
              </div>
              <p className="font-body text-[#606060] text-sm italic">"{item.message}"</p>
            </div>
          ))}
        </div>
      </section>

      {/* ====================================================================
          7. NÚT GỬI QUÀ NỔI & MODAL
          ==================================================================== */}
      <div className="flex justify-center pb-10 reveal-on-scroll reveal-zoom">
        <button onClick={() => setShowGiftModal(true)} className="flex flex-col items-center group relative cursor-pointer">
          <div className="absolute inset-0 bg-[#8C7A6B]/20 rounded-full animate-ping"></div>
          <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-[#E8E2D9] group-hover:-translate-y-2 transition-transform relative z-10">
             <span className="text-3xl">💝</span>
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
              <div className="flex-1 bg-white p-6 rounded-xl text-center shadow-sm border border-[#E8E2D9]">
                <h4 className="font-body text-[10px] uppercase tracking-widest text-[#A0A0A0] mb-4">Mừng Cưới Chú Rể<br/><span className="text-[#4A4A4A] text-sm md:text-base font-title mt-2 block">{WEDDING_CONFIG.groom.fullName}</span></h4>
                <div className="bg-white p-2 rounded-xl border border-gray-100 inline-block mb-4 shadow-sm">
                   <img src={qrGroom} alt="QR Chú Rể" className="w-40 h-40 object-contain mx-auto" />
                </div>
                <p className="font-body text-[10px] text-[#A0A0A0] uppercase">{WEDDING_CONFIG.groom.bank.name}</p>
                <p className="font-title text-base font-bold text-[#4A4A4A] my-1">{WEDDING_CONFIG.groom.bank.accountNumber}</p>
                <p className="font-body text-xs text-[#606060] mb-5">{WEDDING_CONFIG.groom.bank.accountHolder}</p>
                <a href={qrGroom} download className="inline-block font-body text-[10px] uppercase tracking-widest border border-[#8C7A6B] bg-transparent text-[#8C7A6B] px-6 py-2.5 hover:bg-[#8C7A6B] hover:text-white transition-all rounded-full">Tải Mã QR</a>
              </div>
              
              <div className="flex-1 bg-white p-6 rounded-xl text-center shadow-sm border border-[#E8E2D9]">
                <h4 className="font-body text-[10px] uppercase tracking-widest text-[#A0A0A0] mb-4">Mừng Cưới Cô Dâu<br/><span className="text-[#4A4A4A] text-sm md:text-base font-title mt-2 block">{WEDDING_CONFIG.bride.fullName}</span></h4>
                <div className="bg-white p-2 rounded-xl border border-gray-100 inline-block mb-4 shadow-sm">
                   <img src={qrBride} alt="QR Cô Dâu" className="w-40 h-40 object-contain mx-auto" />
                </div>
                <p className="font-body text-[10px] text-[#A0A0A0] uppercase">{WEDDING_CONFIG.bride.bank.name}</p>
                <p className="font-title text-base font-bold text-[#4A4A4A] my-1">{WEDDING_CONFIG.bride.bank.accountNumber}</p>
                <p className="font-body text-xs text-[#606060] mb-5">{WEDDING_CONFIG.bride.bank.accountHolder}</p>
                <a href={qrBride} download className="inline-block font-body text-[10px] uppercase tracking-widest border border-[#8C7A6B] bg-transparent text-[#8C7A6B] px-6 py-2.5 hover:bg-[#8C7A6B] hover:text-white transition-all rounded-full">Tải Mã QR</a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}