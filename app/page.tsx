'use client';

import React, { useState, useEffect, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';

// ============================================================================
// 1. CẤU HÌNH THÔNG TIN ĐÁM CƯỚI (CHỈ CẦN SỬA Ở ĐÂY)
// ============================================================================
const WEDDING_CONFIG = {
  // --- Thông tin Chú Rể & Cô Dâu ---
  groom: {
    fullName: 'Phan Văn Nam',
    parents: 'Phan Văn Việt & Nguyễn Thị Vân',
    address: 'Thôn Ninh Thanh 1, xã Ea Kar, Đắk Lắk',
    bank: {
      name: 'Ngân hàng Sacombank',
      accountNumber: '0337188787',
      accountHolder: 'PHAN VAN NAM',
      code: 'Sacombank', // Mã ngân hàng dùng cho VietQR
    },
  },
  bride: {
    fullName: 'Trần Thị Mỹ Tiên',
    parents: 'Trần Tài & Nguyễn Thị Hương',
    address: 'Thôn Xuân Tự 2, xã Vạn Hưng, Khánh Hòa',
    bank: {
      name: 'Ngân hàng Vietcombank', // Sửa tên ngân hàng cô dâu
      accountNumber: '1012345678',   // Sửa STK cô dâu
      accountHolder: 'TRAN THI MY TIEN',
      code: 'VCB',                   // Mã VietQR (VCB, MB, ACB, ICB, VPB...)
    },
  },

  // --- Thời gian & Địa điểm ---
  event: {
    dateIso: '2026-09-20T16:50:00', // Định dạng YYYY-MM-DDTHH:mm:ss
    displayDate: '20 . 09 . 2026',
    displayTime: '16:50 PM',
    mapIframeUrl: 'https://maps.google.com/maps?q=12.794806,108.436139&z=15&output=embed',
    bgAudioUrl: 'https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=wedding-march-113854.mp3',
  },

  // --- Đường dẫn Ảnh (Đặt trong thư mục public/) ---
  images: {
    hero: '/hero.jpg',
    fallbackHero: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=800',
    gallery: [
      { src: '/story1.jpg', fallback: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&q=80&w=600' },
      { src: '/story2.jpg', fallback: 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&q=80&w=600' },
      { src: '/story3.jpg', fallback: 'https://images.unsplash.com/photo-1606800052052-a08af7148866?auto=format&fit=crop&q=80&w=600' },
      { src: '/story4.jpg', fallback: 'https://images.unsplash.com/photo-1520854221256-17451cc331bf?auto=format&fit=crop&q=80&w=600' },
    ],
  },

  // --- Tone màu trang phục khách mời ---
  dressCodeColors: ['#1c221e', '#3d4b3c', '#c2b29f', '#f4ebd9'],
};

// Hàm tạo URL QR Code tự động từ VietQR
const getVietQrUrl = (bankCode: string, accountNum: string, name: string, memo: string) => {
  return `https://img.vietqr.io/image/${bankCode}-${accountNum}-compact2.png?amount=0&addInfo=${encodeURIComponent(memo)}&accountName=${encodeURIComponent(name)}`;
};

// Khởi tạo Supabase Client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = (supabaseUrl && supabaseAnonKey) ? createClient(supabaseUrl, supabaseAnonKey) : null;

interface Wish {
  id: string;
  name: string;
  message: string;
  created_at: string;
}

// ============================================================================
// 2. MAIN COMPONENT TRANG CHÍNH
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

  // Link mã QR động
  const qrGroom = getVietQrUrl(
    WEDDING_CONFIG.groom.bank.code,
    WEDDING_CONFIG.groom.bank.accountNumber,
    WEDDING_CONFIG.groom.bank.accountHolder,
    'Mung Cuoi Nam Tien'
  );

  const qrBride = getVietQrUrl(
    WEDDING_CONFIG.bride.bank.code,
    WEDDING_CONFIG.bride.bank.accountNumber,
    WEDDING_CONFIG.bride.bank.accountHolder,
    'Mung Cuoi My Tien'
  );

  // Kiểm tra quyền Admin
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('admin') === 'true' || params.get('admin') === 'namnguyen') {
        setIsAdmin(true);
      }
    }
  }, []);

  // Tự động phát nhạc khi chạm nhẹ vào màn hình lần đầu
  useEffect(() => {
    const handleFirstInteraction = () => {
      if (audioRef.current && !isPlaying) {
        audioRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
      }
      window.removeEventListener('click', handleFirstInteraction);
      window.removeEventListener('scroll', handleFirstInteraction);
    };
    window.addEventListener('click', handleFirstInteraction);
    window.addEventListener('scroll', handleFirstInteraction);
    return () => {
      window.removeEventListener('click', handleFirstInteraction);
      window.removeEventListener('scroll', handleFirstInteraction);
    };
  }, [isPlaying]);

  // Lấy danh sách lời chúc
  const fetchWishes = async () => {
    if (!supabase) return;
    const { data, error } = await supabase.from('wishes').select('*').order('created_at', { ascending: false });
    if (!error && data) setWishes(data);
  };

  useEffect(() => { fetchWishes(); }, []);

  // Đồng hồ đếm ngược
  useEffect(() => {
    const targetDate = new Date(WEDDING_CONFIG.event.dateIso).getTime();
    const interval = setInterval(() => {
      const now = new Date().getTime();
      const distance = targetDate - now;
      if (distance < 0) {
        clearInterval(interval);
        return;
      }
      setTimeLeft({
        days: Math.floor(distance / (1000 * 60 * 60 * 24)),
        hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((distance % (1000 * 60)) / 1000)
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const toggleMusic = () => {
    if (audioRef.current) {
      isPlaying ? audioRef.current.pause() : audioRef.current.play().catch(() => {});
      setIsPlaying(!isPlaying);
    }
  };

  const handleAddWish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameInput.trim() || !wishInput.trim() || isSubmitting) return;
    setIsSubmitting(true);
    if (supabase) {
      const { data, error } = await supabase
        .from('wishes')
        .insert([{ name: nameInput.trim(), message: wishInput.trim() }])
        .select();
      if (error) alert('Lỗi gửi lời chúc, vui lòng thử lại!');
      else if (data) {
        setWishes([data[0], ...wishes]);
        setNameInput('');
        setWishInput('');
      }
    }
    setIsSubmitting(false);
  };

  const handleDeleteWish = async (id: string) => {
    if (!confirm('Bạn có chắc muốn xóa lời chúc này?')) return;
    if (supabase) {
      const { error } = await supabase.from('wishes').delete().eq('id', id);
      if (!error) setWishes(wishes.filter((item) => item.id !== id));
    }
  };

  return (
    <div className="min-h-screen bg-[#fcf9f5] text-[#5c4d42] font-serif relative overflow-x-hidden selection:bg-[#b0967a] selection:text-white pb-24">
      
      {/* CSS Animation lá rơi nhúng trực tiếp */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes float-leaf {
          0% { transform: translateY(-10vh) rotate(0deg) translateX(0); opacity: 0; }
          10% { opacity: 0.6; }
          90% { opacity: 0.6; }
          100% { transform: translateY(110vh) rotate(360deg) translateX(50px); opacity: 0; }
        }
        .leaf { position: fixed; top: -10%; z-index: 10; pointer-events: none; animation: float-leaf linear infinite; }
      `}} />

      {/* Nhạc nền */}
      <audio ref={audioRef} loop src={WEDDING_CONFIG.event.bgAudioUrl} />

      {/* Hiệu ứng 12 chiếc lá rơi */}
      {[...Array(12)].map((_, i) => (
        <div 
          key={i} 
          className="leaf text-[#d3c2b1]" 
          style={{ 
            left: `${(i * 8)}%`, 
            animationDuration: `${8 + (i % 5)}s`, 
            animationDelay: `${(i % 4)}s`, 
            fontSize: `${14 + (i % 3) * 6}px` 
          }}
        >
          🍂
        </div>
      ))}

      {/* Nút bật/tắt nhạc tròn xoay */}
      <button 
        onClick={toggleMusic} 
        aria-label="Toggle Music"
        className="fixed bottom-6 right-6 z-40 bg-[#fcf9f5]/90 backdrop-blur p-3 rounded-full shadow-lg border border-[#d3c2b1] flex items-center group transition-transform hover:scale-105"
      >
        <div className={`w-8 h-8 rounded-full border border-[#8c7355] flex items-center justify-center text-sm ${isPlaying ? 'animate-spin' : ''}`} style={{ animationDuration: '4s' }}>
          🎵
        </div>
      </button>

{/* --- SECTION 1: HERO (KHUNG ẢNH VÒM ELEGANT) --- */}
      <section className="relative flex flex-col items-center pt-20 pb-16 px-4 text-center z-10">
        {/* Nền Texture */}
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cream-paper.png')] opacity-40 pointer-events-none"></div>
        
        <p className="tracking-[0.4em] uppercase text-[10px] text-[#a88a6d] mb-10 font-sans font-semibold">Save The Date</p>

        {/* Khung ảnh vòm cung */}
        <div className="relative p-2 border-2 border-[#d3c2b1] rounded-t-[10rem] w-full max-w-sm mx-auto shadow-2xl mb-12 group bg-white transition-all duration-500">
          <div className="overflow-hidden rounded-t-[10rem] relative">
            <img 
              src={WEDDING_CONFIG.images.hero} 
              onError={(e) => e.currentTarget.src = WEDDING_CONFIG.images.fallbackHero} 
              alt="Wedding Hero" 
              className="w-full h-[450px] object-cover transition-transform duration-[1500ms] group-hover:scale-110" 
            />
            {/* Lớp phủ gradient làm ảnh có chiều sâu */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#5c4d42]/60 via-transparent to-transparent opacity-80"></div>
          </div>
          
          {/* Huy hiệu nổi */}
          <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 bg-white px-8 py-3 rounded-full shadow-xl border border-[#e8e1d7] flex items-center justify-center min-w-[220px]">
            <span className="text-[#a88a6d] text-xs font-sans tracking-[0.25em] uppercase font-bold">We are getting married</span>
          </div>
        </div>

        {/* Tên Cô Dâu Chú Rể */}
        <h1 className="text-4xl md:text-5xl font-serif text-[#5c4d42] mb-1 drop-shadow-sm">{WEDDING_CONFIG.groom.fullName}</h1>
        <div className="text-2xl italic text-[#a88a6d] my-2 font-light">&</div>
        <h1 className="text-4xl md:text-5xl font-serif text-[#5c4d42] mb-8 drop-shadow-sm">{WEDDING_CONFIG.bride.fullName}</h1>

        <div className="border-y border-[#c8b7a6]/50 py-4 px-12 mb-4 bg-white/30 backdrop-blur-sm">
          <span className="text-xl tracking-widest text-[#7a6456] font-medium">{WEDDING_CONFIG.event.displayDate}</span>
        </div>
      </section>
      

      {/* --- SECTION 2: ĐẾM NGƯỢC --- */}
      <section className="py-10 px-4">
        <div className="flex justify-center gap-4 md:gap-8 max-w-lg mx-auto">
          {[
            { label: 'Ngày', value: timeLeft.days },
            { label: 'Giờ', value: timeLeft.hours },
            { label: 'Phút', value: timeLeft.minutes },
            { label: 'Giây', value: timeLeft.seconds }
          ].map((item, index) => (
            <div key={index} className="text-center">
              <div className="text-3xl font-light text-[#8c7355]">{item.value.toString().padStart(2, '0')}</div>
              <div className="text-[9px] uppercase tracking-widest text-gray-400 mt-1">{item.label}</div>
            </div>
          ))}
        </div>
      </section>

{/* --- SECTION 3: ALBUM ẢNH (BỐ CỤC SO LE / TẠP CHÍ) --- */}
      <section className="py-24 px-4 max-w-5xl mx-auto overflow-hidden relative">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-serif text-[#5c4d42] mb-2">Khoảnh Khắc</h2>
          <div className="text-[10px] tracking-[0.3em] text-[#a88a6d] uppercase font-sans">Our Sweet Memories</div>
          <div className="w-12 h-px bg-[#a88a6d] mx-auto mt-6"></div>
        </div>
        
        {/* Lưới ảnh so le */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-12 md:gap-6 px-2">
          {WEDDING_CONFIG.images.gallery.map((img, idx) => {
            // Tính toán góc nghiêng và độ thụt thò ngẫu nhiên có quy luật
            const isEven = idx % 2 === 0;
            const tilt = isEven ? 'rotate-2 md:rotate-3' : '-rotate-2 md:-rotate-3';
            const offset = isEven ? 'mt-0' : 'mt-10 md:mt-16';
            
            return (
              <div 
                key={idx} 
                className={`relative group bg-[#fcf9f5] p-2.5 pb-12 shadow-xl border border-[#e8e1d7] transition-all duration-500 hover:rotate-0 hover:scale-[1.05] hover:z-20 ${tilt} ${offset} cursor-pointer`}
              >
                {/* Băng keo dán (Tape) */}
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-14 h-5 bg-white/60 backdrop-blur-md border border-gray-200/50 shadow-sm rotate-3 z-10"></div>
                
                {/* Khung chứa ảnh */}
                <div className="overflow-hidden relative bg-gray-100 w-full h-52 md:h-72">
                  <img 
                    src={img.src} 
                    onError={(e) => e.currentTarget.src = img.fallback} 
                    alt={`Gallery ${idx + 1}`} 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                  />
                  {/* Lớp phủ mờ ánh nâu khi hover */}
                  <div className="absolute inset-0 bg-[#7a6456]/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
                </div>
                
                {/* Biểu tượng tim nhỏ dưới góc ảnh */}
                <div className="absolute bottom-3 right-4 text-[#a88a6d] text-lg opacity-60">
                  ♥
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* --- SECTION 4: THÔNG TIN LỄ CƯỚI & LỊCH --- */}
      <section className="py-16 px-4 max-w-3xl mx-auto bg-white/60 border-y border-[#e8e1d7] mb-16">
        <div className="text-center mb-10">
          <h2 className="text-2xl font-serif text-[#5c4d42]">Thông Tin Lễ Cưới</h2>
          <div className="w-10 h-px bg-[#a88a6d] mx-auto mt-4"></div>
        </div>

        {/* Lịch tháng 9/2026 */}
        <div className="bg-[#f0ebe1] p-6 rounded text-center max-w-sm mx-auto mb-10 border border-[#e5dfd3]">
          <h3 className="uppercase tracking-widest text-xs mb-4 text-[#7a6456] font-bold">Tháng 9 - 2026</h3>
          <div className="grid grid-cols-7 gap-2 text-xs font-sans text-gray-500 mb-2">
            <div>CN</div><div>T2</div><div>T3</div><div>T4</div><div>T5</div><div>T6</div><div>T7</div>
          </div>
          <div className="grid grid-cols-7 gap-y-3 text-sm font-serif">
            <div className="text-transparent">.</div><div className="text-transparent">.</div>
            <div>1</div><div>2</div><div>3</div><div>4</div><div>5</div>
            <div>6</div><div>7</div><div>8</div><div>9</div><div>10</div><div>11</div><div>12</div>
            <div>13</div><div>14</div><div>15</div><div>16</div><div>17</div><div>18</div><div>19</div>
            <div className="bg-[#8c7355] text-white rounded-full w-7 h-7 flex items-center justify-center mx-auto shadow-md">20</div>
            <div>21</div><div>22</div><div>23</div><div>24</div><div>25</div><div>26</div>
            <div>27</div><div>28</div><div>29</div><div>30</div>
          </div>
        </div>

        {/* Thông tin 2 nhà */}
        <div className="grid md:grid-cols-2 gap-10 text-center">
          <div>
            <span className="text-[10px] uppercase tracking-widest text-[#a88a6d] border border-[#a88a6d] px-3 py-1 rounded-full">Nhà Trai</span>
            <p className="mt-4 font-bold text-gray-800">{WEDDING_CONFIG.groom.parents}</p>
            <p className="text-xs text-gray-500 mt-2">{WEDDING_CONFIG.groom.address}</p>
            <p className="mt-4 font-serif text-[#7a6456] text-xl">{WEDDING_CONFIG.groom.fullName}</p>
          </div>
          <div>
            <span className="text-[10px] uppercase tracking-widest text-[#a88a6d] border border-[#a88a6d] px-3 py-1 rounded-full">Nhà Gái</span>
            <p className="mt-4 font-bold text-gray-800">{WEDDING_CONFIG.bride.parents}</p>
            <p className="text-xs text-gray-500 mt-2">{WEDDING_CONFIG.bride.address}</p>
            <p className="mt-4 font-serif text-[#7a6456] text-xl">{WEDDING_CONFIG.bride.fullName}</p>
          </div>
        </div>
      </section>

      {/* --- SECTION 5: BẢN ĐỒ & DRESS CODE --- */}
      <section className="py-10 px-4 max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-serif text-[#5c4d42] mb-2">Bản Đồ Chỉ Đường</h2>
          <p className="text-xs text-gray-500 mb-6">Tư Gia Nhà Trai - {WEDDING_CONFIG.event.displayTime}</p>
        </div>
        
        {/* Khung bản đồ */}
        <div className="w-full h-80 rounded-lg overflow-hidden border border-[#e8e1d7] shadow-sm mb-12">
          <iframe 
            src={WEDDING_CONFIG.event.mapIframeUrl} 
            width="100%" 
            height="100%" 
            style={{ border: 0 }} 
            allowFullScreen={false} 
            loading="lazy"
            title="Google Map"
          />
        </div>

        {/* Trang phục gợi ý */}
        <div className="bg-[#f0ebe1] p-8 rounded-lg text-center max-w-lg mx-auto border border-[#e5dfd3]">
          <h3 className="text-sm font-semibold tracking-widest uppercase text-[#7a6456] mb-4">Dress Code</h3>
          <p className="text-xs text-gray-500 mb-6">Khuyến khích khách mời diện trang phục theo tone màu sau để có những bức ảnh thật đẹp.</p>
          <div className="flex justify-center gap-4">
            {WEDDING_CONFIG.dressCodeColors.map((color, idx) => (
              <div 
                key={idx} 
                className="w-8 h-8 rounded-full shadow-md border-2 border-white" 
                style={{ backgroundColor: color }} 
              />
            ))}
          </div>
        </div>
      </section>

      {/* --- SECTION 6: SỔ LỜI CHÚC --- */}
      <section className="py-16 px-4 max-w-2xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="text-2xl font-serif text-[#5c4d42]">Sổ Lời Chúc</h2>
          {isAdmin && <span className="block text-red-500 text-xs mt-1">(Chế độ Admin - Được quyền xóa)</span>}
          <div className="w-10 h-px bg-[#a88a6d] mx-auto mt-4"></div>
        </div>

        <form onSubmit={handleAddWish} className="bg-white p-6 shadow-sm border border-[#e8e1d7] mb-10 rounded">
          <input 
            type="text" 
            required 
            placeholder="Tên của bạn..." 
            value={nameInput} 
            onChange={(e) => setNameInput(e.target.value)} 
            className="w-full mb-4 p-3 border-b border-gray-200 focus:outline-none focus:border-[#a88a6d] text-sm bg-transparent" 
          />
          <textarea 
            required 
            rows={3} 
            placeholder="Gửi gắm yêu thương..." 
            value={wishInput} 
            onChange={(e) => setWishInput(e.target.value)} 
            className="w-full mb-4 p-3 border-b border-gray-200 focus:outline-none focus:border-[#a88a6d] text-sm bg-transparent" 
          />
          <button 
            type="submit" 
            disabled={isSubmitting} 
            className="w-full bg-[#8c7355] text-white py-3 text-sm font-medium hover:bg-[#7a6456] transition-colors rounded-sm"
          >
            {isSubmitting ? 'Đang gửi...' : 'Gửi Lời Chúc'}
          </button>
        </form>

        <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
          {wishes.map((item) => (
            <div key={item.id} className="bg-[#fcf9f5] p-4 border-l-2 border-[#a88a6d] shadow-sm">
              <div className="flex justify-between items-center mb-1">
                <span className="font-semibold text-[#5c4d42] text-sm">{item.name}</span>
                {isAdmin && (
                  <button onClick={() => handleDeleteWish(item.id)} className="text-red-400 text-xs hover:text-red-600">
                    ✕ Xóa
                  </button>
                )}
              </div>
              <p className="text-gray-600 text-xs italic">"{item.message}"</p>
            </div>
          ))}
        </div>
      </section>

      {/* --- NÚT NỔI MỞ HỘP QUÀ MỪNG --- */}
      <div className="flex justify-center pb-20">
        <button onClick={() => setShowGiftModal(true)} className="flex flex-col items-center group">
          <div className="w-16 h-16 bg-[#f0ebe1] rounded-full flex items-center justify-center shadow-lg border border-[#e5dfd3] group-hover:scale-110 transition-transform">
             <span className="text-2xl">🎁</span>
          </div>
          <span className="text-xs uppercase tracking-widest text-[#7a6456] mt-3 font-semibold">Gửi Quà Mừng</span>
        </button>
      </div>

      {/* --- POPUP MODAL HỘP QUÀ MỪNG (VIETQR ĐỘNG CẢ 2 BÊN) --- */}
      {showGiftModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-[#fcf9f5] w-full max-w-2xl rounded-xl overflow-hidden shadow-2xl relative animate-fade-in">
            {/* Header Nâu */}
            <div className="bg-[#7a6456] text-white text-center py-5 relative">
              <h3 className="font-serif text-xl tracking-widest">HỘP QUÀ MỪNG</h3>
              <button onClick={() => setShowGiftModal(false)} className="absolute right-4 top-1/2 -translate-y-1/2 text-2xl hover:text-gray-300">
                ✕
              </button>
            </div>
            
            {/* Nội dung QR Chú rể & Cô dâu */}
            <div className="p-6 md:p-8 flex flex-col md:flex-row gap-6 md:gap-8">
              
              {/* QR Chú Rể */}
              <div className="flex-1 bg-white p-6 rounded-lg text-center shadow-sm border border-[#e8e1d7]">
                <h4 className="text-xs uppercase tracking-widest font-semibold mb-4 text-gray-700">Chú Rể - {WEDDING_CONFIG.groom.fullName}</h4>
                <div className="bg-gray-50 p-2 rounded-lg border border-gray-100 inline-block mb-4">
                   <img src={qrGroom} alt="QR Chú Rể" className="w-36 h-36 object-contain" />
                </div>
                <p className="text-[11px] text-gray-500">{WEDDING_CONFIG.groom.bank.name}</p>
                <p className="text-sm font-bold text-gray-800 my-1">{WEDDING_CONFIG.groom.bank.accountNumber}</p>
                <p className="text-xs text-gray-500 mb-5">{WEDDING_CONFIG.groom.bank.accountHolder}</p>
                <a 
                  href={qrGroom} 
                  download="QR_Mung_Cuoi_Chu_Re.png" 
                  className="inline-block text-xs border border-[#8c7355] text-[#8c7355] px-5 py-2 hover:bg-[#8c7355] hover:text-white transition-colors rounded-sm"
                >
                  📥 Tải QR
                </a>
              </div>

              {/* QR Cô Dâu */}
              <div className="flex-1 bg-white p-6 rounded-lg text-center shadow-sm border border-[#e8e1d7]">
                <h4 className="text-xs uppercase tracking-widest font-semibold mb-4 text-gray-700">Cô Dâu - {WEDDING_CONFIG.bride.fullName}</h4>
                <div className="bg-gray-50 p-2 rounded-lg border border-gray-100 inline-block mb-4">
                   <img src={qrBride} alt="QR Cô Dâu" className="w-36 h-36 object-contain" />
                </div>
                <p className="text-[11px] text-gray-500">{WEDDING_CONFIG.bride.bank.name}</p>
                <p className="text-sm font-bold text-gray-800 my-1">{WEDDING_CONFIG.bride.bank.accountNumber}</p>
                <p className="text-xs text-gray-500 mb-5">{WEDDING_CONFIG.bride.bank.accountHolder}</p>
                <a 
                  href={qrBride} 
                  download="QR_Mung_Cuoi_Co_Dau.png" 
                  className="inline-block text-xs border border-[#8c7355] text-[#8c7355] px-5 py-2 hover:bg-[#8c7355] hover:text-white transition-colors rounded-sm"
                >
                  📥 Tải QR
                </a>
              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  );
}