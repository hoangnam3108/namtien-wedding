'use client';

import React, { useState, useEffect, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';

// ============================================================================
// 1. CẤU HÌNH THÔNG TIN
// ============================================================================
const WEDDING_CONFIG = {
  groom: {
    fullName: 'Phan Văn Nam',
    parents: 'Ông Phan Văn Việt & Bà Nguyễn Thị Vân',
    address: 'Thôn Ninh Thanh 1, xã Ea Kar, Đắk Lắk',
    bank: { name: 'Sacombank', accountNumber: '0337188787', accountHolder: 'PHAN VAN NAM', code: 'Sacombank' },
  },
  bride: {
    fullName: 'Trần Thị Mỹ Tiên',
    parents: 'Ông Trần Tài & Bà Nguyễn Thị Hương',
    address: 'Thôn Xuân Tự 2, xã Vạn Hưng, Khánh Hòa',
    bank: { name: 'Vietcombank', accountNumber: '1012345678', accountHolder: 'TRAN THI MY TIEN', code: 'VCB' },
  },
  event: {
    dateIso: '2026-09-20T16:50:00',
    displayDate: '20 . 09 . 2026',
    displayTime: '16:50 PM',
    mapIframeUrl: 'https://maps.google.com/maps?q=12.794806,108.436139&z=15&output=embed',
    bgAudioUrl: '/nhaccuoi.mp3', // Đọc trực tiếp từ thư mục public/nhaccuoi.mp3
  },
  images: {
    hero: '/hero.jpg',
    fallbackHero: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=800',
gallery: [
      { src: '/story1.jpg', fallback: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&q=80&w=600' },
      { src: '/story2.jpg', fallback: 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&q=80&w=600' },
      { src: '/story3.jpg', fallback: 'https://images.unsplash.com/photo-1606800052052-a08af7148866?auto=format&fit=crop&q=80&w=600' },
      { src: '/story4.jpg', fallback: 'https://images.unsplash.com/photo-1520854221256-17451cc331bf?auto=format&fit=crop&q=80&w=600' },
      { src: '/story5.jpg', fallback: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&q=80&w=600' },
      { src: '/story6.jpg', fallback: 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&q=80&w=600' },
      { src: '/story7.jpg', fallback: 'https://images.unsplash.com/photo-1606800052052-a08af7148866?auto=format&fit=crop&q=80&w=600' },
      { src: '/story8.jpg', fallback: 'https://images.unsplash.com/photo-1520854221256-17451cc331bf?auto=format&fit=crop&q=80&w=600' },
      { src: '/story9.jpg', fallback: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&q=80&w=600' },
      { src: '/story10.jpg', fallback: 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&q=80&w=600' },
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
// 2. MAIN COMPONENT
// ============================================================================
export default function WeddingInvitation() {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [isPlaying, setIsPlaying] = useState(false);
  const [wishes, setWishes] = useState<Wish[]>([]);
  const [nameInput, setNameInput] = useState('');
  const [wishInput, setWishInput] = useState('');
  const [showGiftModal, setShowGiftModal] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const qrGroom = getVietQrUrl(WEDDING_CONFIG.groom.bank.code, WEDDING_CONFIG.groom.bank.accountNumber, WEDDING_CONFIG.groom.bank.accountHolder, 'Mung Cuoi Nam Tien');
  const qrBride = getVietQrUrl(WEDDING_CONFIG.bride.bank.code, WEDDING_CONFIG.bride.bank.accountNumber, WEDDING_CONFIG.bride.bank.accountHolder, 'Mung Cuoi My Tien');

  // Kiểm tra Admin
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('admin') === 'true' || params.get('admin') === 'namnguyen') setIsAdmin(true);
    }
  }, []);

  // Xử lý Audio mượt mà, chống lỗi click
  useEffect(() => {
    const initAudio = () => {
      if (audioRef.current && audioRef.current.paused) {
        audioRef.current.play().then(() => setIsPlaying(true)).catch(() => console.log("Trình duyệt chặn autoplay"));
      }
      document.removeEventListener('click', initAudio);
      document.removeEventListener('scroll', initAudio);
    };
    document.addEventListener('click', initAudio, { once: true });
    document.addEventListener('scroll', initAudio, { once: true });
    return () => {
      document.removeEventListener('click', initAudio);
      document.removeEventListener('scroll', initAudio);
    };
  }, []);

  const toggleMusic = (e: React.MouseEvent) => {
    e.stopPropagation(); // Ngăn chặn sự kiện click lan ra ngoài
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        audioRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
      }
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
      if (error) {
        alert(`Lỗi: ${error.message}. Vui lòng kiểm tra lại quyền Supabase!`);
      } else if (data) {
        setWishes([data[0], ...wishes]);
        setNameInput('');
        setWishInput('');
      }
    } else {
      alert("Chưa kết nối CSDL Supabase trên Vercel!");
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
    <div className="min-h-screen bg-[#fcf9f5] text-[#5c4d42] font-serif relative overflow-x-hidden selection:bg-[#b0967a] selection:text-white pb-24">
      
      {/* CSS Nhúng cho thanh trượt ngang & Lá rơi */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes float-leaf {
          0% { transform: translateY(-10vh) rotate(0deg) translateX(0); opacity: 0; }
          10% { opacity: 0.6; }
          90% { opacity: 0.6; }
          100% { transform: translateY(110vh) rotate(360deg) translateX(50px); opacity: 0; }
        }
        .leaf { position: fixed; top: -10%; z-index: 10; pointer-events: none; animation: float-leaf linear infinite; }
        
        @keyframes scroll-left {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); } 
        }
        .animate-scroll {
          display: flex;
          width: max-content;
          animation: scroll-left 30s linear infinite;
        }
        .animate-scroll:hover { animation-play-state: paused; }
      `}} />

      <audio ref={audioRef} loop src={WEDDING_CONFIG.event.bgAudioUrl} />

      {[...Array(10)].map((_, i) => (
        <div key={i} className="leaf text-[#d3c2b1]" style={{ left: `${(i * 10)}%`, animationDuration: `${8 + (i % 5)}s`, animationDelay: `${(i % 4)}s`, fontSize: `${14 + (i % 3) * 6}px` }}>🍂</div>
      ))}

      {/* NÚT BẬT TẮT NHẠC FIX LỖI */}
      <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 cursor-pointer" onClick={toggleMusic}>
        <div className="bg-[#fcf9f5]/90 backdrop-blur p-2.5 rounded-full shadow-[0_4px_20px_rgba(0,0,0,0.1)] border border-[#d3c2b1] flex items-center justify-center hover:scale-110 active:scale-95 transition-all">
          <div className={`w-9 h-9 rounded-full border-2 border-[#8c7355] flex items-center justify-center text-sm relative ${isPlaying ? 'animate-spin' : 'opacity-60'}`} style={{ animationDuration: '4s' }}>
            <span>🎵</span>
            {!isPlaying && (
              <span className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center text-[10px] text-white font-bold backdrop-blur-[1px]">✕</span>
            )}
          </div>
        </div>
      </div>

      {/* --- HERO SECTION NÂNG CẤP --- */}
      <section className="relative flex flex-col items-center pt-24 pb-16 px-4 text-center z-10">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cream-paper.png')] opacity-40 pointer-events-none"></div>
        <p className="tracking-[0.4em] uppercase text-[10px] text-[#a88a6d] mb-10 font-sans font-semibold">Save The Date</p>

        <div className="relative p-2.5 bg-white border border-[#e8e1d7] shadow-2xl w-full max-w-md mx-auto mb-14 group">
           <div className="absolute -inset-3 border border-[#d3c2b1]/40 pointer-events-none hidden md:block"></div>
           <div className="overflow-hidden relative">
             <img src={WEDDING_CONFIG.images.hero} onError={(e) => e.currentTarget.src = WEDDING_CONFIG.images.fallbackHero} alt="Wedding Hero" className="w-full h-[500px] object-cover transition-transform duration-[2000ms] group-hover:scale-105" />
             <div className="absolute inset-0 bg-gradient-to-t from-[#3a2e26]/60 via-transparent to-transparent opacity-70"></div>
           </div>
           <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 bg-white px-10 py-3 rounded-sm shadow-xl border border-[#e8e1d7] min-w-[240px]">
             <span className="text-[#a88a6d] text-xs font-sans tracking-[0.25em] uppercase font-bold whitespace-nowrap">We're getting married</span>
           </div>
        </div>

        <h1 className="text-4xl md:text-6xl font-serif text-[#5c4d42] mb-2 drop-shadow-sm">{WEDDING_CONFIG.groom.fullName}</h1>
        <div className="text-2xl md:text-3xl italic text-[#a88a6d] my-3 font-light">&</div>
        <h1 className="text-4xl md:text-6xl font-serif text-[#5c4d42] mb-10 drop-shadow-sm">{WEDDING_CONFIG.bride.fullName}</h1>

        <div className="border-y border-[#c8b7a6]/50 py-4 px-12 bg-white/40 backdrop-blur-sm">
          <span className="text-xl md:text-2xl tracking-[0.2em] text-[#7a6456] font-medium">{WEDDING_CONFIG.event.displayDate}</span>
        </div>
      </section>

      {/* --- ĐẾM NGƯỢC --- */}
      <section className="py-8 px-4">
        <div className="flex justify-center gap-6 md:gap-12 max-w-lg mx-auto bg-white/50 p-6 rounded-lg border border-[#e8e1d7] shadow-sm">
          {[{ label: 'Ngày', value: timeLeft.days }, { label: 'Giờ', value: timeLeft.hours }, { label: 'Phút', value: timeLeft.minutes }, { label: 'Giây', value: timeLeft.seconds }].map((item, index) => (
            <div key={index} className="text-center">
              <div className="text-3xl md:text-4xl font-light text-[#8c7355] mb-1">{item.value.toString().padStart(2, '0')}</div>
              <div className="text-[10px] uppercase tracking-widest text-gray-500">{item.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* --- THÔNG TIN 2 GIA ĐÌNH NÂNG CẤP --- */}
      <section className="py-20 px-4 max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-serif text-[#5c4d42] mb-2">Lời Ngỏ</h2>
          <div className="w-12 h-px bg-[#a88a6d] mx-auto mt-6"></div>
          <p className="mt-8 text-sm md:text-base text-gray-600 italic max-w-2xl mx-auto leading-relaxed">
            "Tình yêu không phải là những lời thề non hẹn biển, mà là cùng nhau bình yên qua những ngày giông bão." <br/> Kính mời quý khách đến chung vui cùng gia đình chúng tôi.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 md:gap-12 text-center">
          {/* Nhà Trai */}
          <div className="bg-white p-8 md:p-12 shadow-md border border-[#e8e1d7] relative group hover:shadow-lg transition-shadow">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#fcf9f5] px-4">
              <span className="text-[10px] uppercase tracking-[0.3em] text-[#a88a6d] border border-[#a88a6d] px-4 py-1.5 rounded-full font-semibold bg-white">Nhà Trai</span>
            </div>
            <div className="mt-4 mb-8">
              <p className="text-xs tracking-widest text-gray-400 uppercase mb-2">Trưởng Nam</p>
              <h3 className="font-serif text-2xl md:text-3xl text-[#7a6456]">{WEDDING_CONFIG.groom.fullName}</h3>
            </div>
            <div className="w-16 h-px bg-gray-200 mx-auto mb-6"></div>
            <p className="font-semibold text-gray-800 text-sm md:text-base">{WEDDING_CONFIG.groom.parents}</p>
            <p className="text-xs text-gray-500 mt-3 italic">{WEDDING_CONFIG.groom.address}</p>
          </div>

          {/* Nhà Gái */}
          <div className="bg-white p-8 md:p-12 shadow-md border border-[#e8e1d7] relative group hover:shadow-lg transition-shadow">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#fcf9f5] px-4">
              <span className="text-[10px] uppercase tracking-[0.3em] text-[#a88a6d] border border-[#a88a6d] px-4 py-1.5 rounded-full font-semibold bg-white">Nhà Gái</span>
            </div>
            <div className="mt-4 mb-8">
              <p className="text-xs tracking-widest text-gray-400 uppercase mb-2">Út Nữ</p>
              <h3 className="font-serif text-2xl md:text-3xl text-[#7a6456]">{WEDDING_CONFIG.bride.fullName}</h3>
            </div>
            <div className="w-16 h-px bg-gray-200 mx-auto mb-6"></div>
            <p className="font-semibold text-gray-800 text-sm md:text-base">{WEDDING_CONFIG.bride.parents}</p>
            <p className="text-xs text-gray-500 mt-3 italic">{WEDDING_CONFIG.bride.address}</p>
          </div>
        </div>
      </section>

      {/* --- ALBUM ẢNH (SCROLL TRƯỢT NGANG + ZIC-ZAC) --- */}
      <section className="py-20 bg-white/60 border-y border-[#e8e1d7] overflow-hidden">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-serif text-[#5c4d42] mb-2">Khoảnh Khắc</h2>
          <div className="text-[10px] tracking-[0.3em] text-[#a88a6d] uppercase font-sans">Our Sweet Memories</div>
          <div className="w-12 h-px bg-[#a88a6d] mx-auto mt-6"></div>
        </div>

        {/* Thanh trượt ngang vô tận */}
        <div className="relative w-full overflow-hidden whitespace-nowrap mb-16 py-4">
          <div className="animate-scroll gap-4 px-4 flex items-center">
            {/* Render 2 lần mảng ảnh để tạo cảm giác lặp vô tận (infinite loop) */}
            {[...WEDDING_CONFIG.images.gallery, ...WEDDING_CONFIG.images.gallery].map((img, idx) => (
              <div key={idx} className="inline-block w-64 md:w-80 h-48 md:h-56 bg-gray-100 rounded-md overflow-hidden flex-shrink-0 shadow-md mx-2 hover:scale-105 transition-transform duration-500">
                <img src={img.src} onError={(e) => e.currentTarget.src = img.fallback} className="w-full h-full object-cover" alt="Slide" />
              </div>
            ))}
          </div>
        </div>

        {/* Lưới ảnh Zic-zac bên dưới */}
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 px-4">
          {WEDDING_CONFIG.images.gallery.slice(0, 4).map((img, idx) => {
            const isEven = idx % 2 === 0;
            const tilt = isEven ? 'rotate-2 md:rotate-3' : '-rotate-2 md:-rotate-3';
            const offset = isEven ? 'mt-0' : 'mt-8 md:mt-12';
            return (
              <div key={`grid-${idx}`} className={`relative group bg-[#fcf9f5] p-2.5 pb-10 shadow-xl border border-[#e8e1d7] transition-all duration-500 hover:rotate-0 hover:scale-[1.05] hover:z-20 ${tilt} ${offset}`}>
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-12 h-4 bg-white/70 backdrop-blur-md border border-gray-200/50 shadow-sm rotate-2 z-10"></div>
                <div className="overflow-hidden relative bg-gray-100 w-full h-40 md:h-60">
                  <img src={img.src} onError={(e) => e.currentTarget.src = img.fallback} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt="Gallery" />
                </div>
                <div className="absolute bottom-2 right-3 text-[#a88a6d] text-base opacity-60">♥</div>
              </div>
            );
          })}
        </div>
      </section>

      {/* --- BẢN ĐỒ & DRESSCODE (CHIA 2 CỘT KHOA HỌC) --- */}
      <section className="py-24 px-4 max-w-6xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          
          {/* Cột Trái: Bản đồ thu gọn */}
          <div className="w-full">
            <h2 className="text-2xl font-serif text-[#5c4d42] mb-2">Chỉ Đường</h2>
            <p className="text-sm text-gray-500 mb-6">Tư Gia Nhà Trai - Đón khách lúc {WEDDING_CONFIG.event.displayTime}</p>
            <div className="w-full aspect-video md:aspect-[4/3] bg-gray-100 rounded-xl overflow-hidden border-4 border-white shadow-xl relative">
              <iframe src={WEDDING_CONFIG.event.mapIframeUrl} className="absolute inset-0 w-full h-full" style={{ border: 0 }} allowFullScreen={false} loading="lazy" />
            </div>
            <a href="https://maps.app.goo.gl/..." target="_blank" rel="noreferrer" className="inline-block mt-6 text-sm border-b border-[#8c7355] text-[#8c7355] pb-1 hover:text-[#5c4d42] hover:border-[#5c4d42] transition-colors">
              Mở trên Google Maps ↗
            </a>
          </div>

          {/* Cột Phải: Dresscode & Lịch */}
          <div className="space-y-8">
            <div className="bg-[#f0ebe1] p-8 md:p-10 rounded-xl text-center border border-[#e5dfd3] shadow-inner">
              <h3 className="text-sm font-semibold tracking-widest uppercase text-[#7a6456] mb-4">Dress Code</h3>
              <p className="text-sm text-gray-600 mb-6 leading-relaxed">Để khung hình kỷ niệm thêm phần hoàn hảo, chúng tôi khuyến khích khách mời lựa chọn trang phục theo tone màu dưới đây.</p>
              <div className="flex justify-center gap-4 md:gap-6">
                {WEDDING_CONFIG.dressCodeColors.map((color, idx) => (
                  <div key={idx} className="w-10 h-10 md:w-12 md:h-12 rounded-full shadow-lg border-2 border-white transform hover:-translate-y-1 transition-transform" style={{ backgroundColor: color }} />
                ))}
              </div>
            </div>

            <div className="bg-white p-6 md:p-8 rounded-xl text-center border border-[#e8e1d7] shadow-sm">
               <h3 className="uppercase tracking-widest text-xs mb-4 text-[#7a6456] font-bold">Tháng 9 - 2026</h3>
               <div className="grid grid-cols-7 gap-2 text-xs font-sans text-gray-400 mb-3">
                 <div>CN</div><div>T2</div><div>T3</div><div>T4</div><div>T5</div><div>T6</div><div>T7</div>
               </div>
               <div className="grid grid-cols-7 gap-y-4 text-sm md:text-base font-serif text-gray-600">
                 <div className="text-transparent">.</div><div className="text-transparent">.</div>
                 <div>1</div><div>2</div><div>3</div><div>4</div><div>5</div>
                 <div>6</div><div>7</div><div>8</div><div>9</div><div>10</div><div>11</div><div>12</div>
                 <div>13</div><div>14</div><div>15</div><div>16</div><div>17</div><div>18</div><div>19</div>
                 <div className="bg-[#8c7355] text-white rounded-full w-8 h-8 flex items-center justify-center mx-auto shadow-md ring-4 ring-[#8c7355]/20 font-bold">20</div>
                 <div>21</div><div>22</div><div>23</div><div>24</div><div>25</div><div>26</div>
                 <div>27</div><div>28</div><div>29</div><div>30</div>
               </div>
            </div>
          </div>

        </div>
      </section>

      {/* --- SỔ LỜI CHÚC NÂNG CẤP --- */}
      <section className="py-20 px-4 max-w-3xl mx-auto bg-white/40 border-t border-[#e8e1d7]">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-serif text-[#5c4d42]">Sổ Lưu Bút</h2>
          <div className="text-[10px] tracking-[0.3em] text-[#a88a6d] uppercase font-sans mt-1">Guestbook</div>
          {isAdmin && <span className="block text-red-500 text-xs mt-2">(Chế độ Admin)</span>}
          <div className="w-12 h-px bg-[#a88a6d] mx-auto mt-5"></div>
        </div>

        <div className="bg-white p-6 md:p-10 shadow-lg border border-[#e8e1d7] rounded-xl mb-12">
          <form onSubmit={handleAddWish}>
            <input type="text" required placeholder="Tên của bạn..." value={nameInput} onChange={(e) => setNameInput(e.target.value)} className="w-full mb-6 p-4 border-b border-gray-200 focus:outline-none focus:border-[#a88a6d] text-sm md:text-base bg-[#fcf9f5]/50 rounded-t-md transition-colors" />
            <textarea required rows={4} placeholder="Gửi gắm yêu thương đến cô dâu, chú rể..." value={wishInput} onChange={(e) => setWishInput(e.target.value)} className="w-full mb-6 p-4 border-b border-gray-200 focus:outline-none focus:border-[#a88a6d] text-sm md:text-base bg-[#fcf9f5]/50 rounded-t-md transition-colors resize-none" />
            <button type="submit" disabled={isSubmitting} className="w-full bg-[#8c7355] text-white py-4 text-sm md:text-base font-semibold tracking-widest uppercase hover:bg-[#7a6456] transition-colors rounded-sm shadow-md">
              {isSubmitting ? 'Đang gửi...' : 'Gửi Lời Chúc'}
            </button>
          </form>
        </div>

        <div className="space-y-5 max-h-[500px] overflow-y-auto pr-4 custom-scrollbar">
          {wishes.map((item) => (
            <div key={item.id} className="bg-white p-5 md:p-6 rounded-lg border-l-4 border-[#a88a6d] shadow-sm hover:shadow-md transition-shadow relative">
              <div className="flex justify-between items-start mb-3">
                <span className="font-bold text-[#5c4d42] text-sm md:text-base">{item.name}</span>
                {isAdmin && <button onClick={() => handleDeleteWish(item.id)} className="text-red-400 text-xs hover:text-red-600 bg-red-50 px-2 py-1 rounded">Xóa</button>}
              </div>
              <p className="text-gray-600 text-sm md:text-base italic leading-relaxed">"{item.message}"</p>
              <div className="absolute top-4 right-4 opacity-10 text-3xl">❝</div>
            </div>
          ))}
          {wishes.length === 0 && <p className="text-center text-gray-400 text-sm italic">Hãy là người đầu tiên gửi lời chúc...</p>}
        </div>
      </section>

      {/* --- NÚT GỬI QUÀ NỔI --- */}
      <div className="flex justify-center pb-20 pt-10">
        <button onClick={() => setShowGiftModal(true)} className="flex flex-col items-center group relative">
          <div className="absolute inset-0 bg-[#8c7355]/20 rounded-full animate-ping"></div>
          <div className="w-20 h-20 bg-gradient-to-br from-[#f0ebe1] to-[#e5dfd3] rounded-full flex items-center justify-center shadow-xl border-2 border-white group-hover:scale-110 transition-transform relative z-10">
             <span className="text-3xl drop-shadow-sm">🎁</span>
          </div>
          <span className="text-xs md:text-sm uppercase tracking-widest text-[#7a6456] mt-4 font-bold">Gửi Quà Mừng</span>
        </button>
      </div>

      {/* POPUP HỘP QUÀ */}
      {showGiftModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-[#fcf9f5] w-full max-w-2xl rounded-2xl overflow-hidden shadow-2xl relative animate-fade-in border border-[#e8e1d7]">
            <div className="bg-gradient-to-r from-[#8c7355] to-[#7a6456] text-white text-center py-6 relative">
              <h3 className="font-serif text-xl tracking-[0.2em]">HỘP QUÀ MỪNG</h3>
              <button onClick={() => setShowGiftModal(false)} className="absolute right-5 top-1/2 -translate-y-1/2 text-2xl hover:text-gray-300">✕</button>
            </div>
            <div className="p-6 md:p-8 flex flex-col md:flex-row gap-6 md:gap-8">
              <div className="flex-1 bg-white p-6 rounded-xl text-center shadow-md border border-[#e8e1d7] hover:border-[#a88a6d] transition-colors">
                <h4 className="text-xs uppercase tracking-widest font-bold mb-4 text-gray-800">Chú Rể<br/><span className="text-[#a88a6d] text-base font-serif mt-1 block">{WEDDING_CONFIG.groom.fullName}</span></h4>
                <div className="bg-white p-2 rounded-xl border-2 border-dashed border-gray-200 inline-block mb-4 shadow-sm">
                   <img src={qrGroom} alt="QR Chú Rể" className="w-40 h-40 object-contain" />
                </div>
                <p className="text-xs text-gray-500 uppercase">{WEDDING_CONFIG.groom.bank.name}</p>
                <p className="text-base font-bold text-gray-800 my-1 font-sans">{WEDDING_CONFIG.groom.bank.accountNumber}</p>
                <p className="text-xs text-gray-500 mb-5">{WEDDING_CONFIG.groom.bank.accountHolder}</p>
                <a href={qrGroom} download className="inline-block text-xs uppercase tracking-widest border border-[#8c7355] bg-white text-[#8c7355] px-6 py-2.5 hover:bg-[#8c7355] hover:text-white transition-all rounded-full font-semibold">Tải Mã QR</a>
              </div>
              <div className="flex-1 bg-white p-6 rounded-xl text-center shadow-md border border-[#e8e1d7] hover:border-[#a88a6d] transition-colors">
                <h4 className="text-xs uppercase tracking-widest font-bold mb-4 text-gray-800">Cô Dâu<br/><span className="text-[#a88a6d] text-base font-serif mt-1 block">{WEDDING_CONFIG.bride.fullName}</span></h4>
                <div className="bg-white p-2 rounded-xl border-2 border-dashed border-gray-200 inline-block mb-4 shadow-sm">
                   <img src={qrBride} alt="QR Cô Dâu" className="w-40 h-40 object-contain" />
                </div>
                <p className="text-xs text-gray-500 uppercase">{WEDDING_CONFIG.bride.bank.name}</p>
                <p className="text-base font-bold text-gray-800 my-1 font-sans">{WEDDING_CONFIG.bride.bank.accountNumber}</p>
                <p className="text-xs text-gray-500 mb-5">{WEDDING_CONFIG.bride.bank.accountHolder}</p>
                <a href={qrBride} download className="inline-block text-xs uppercase tracking-widest border border-[#8c7355] bg-white text-[#8c7355] px-6 py-2.5 hover:bg-[#8c7355] hover:text-white transition-all rounded-full font-semibold">Tải Mã QR</a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}