import React from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusCircle, Search, UserCircle, MapPin, Star, ShieldCheck } from 'lucide-react';
import VerifiedBadge from '../components/VerifiedBadge';

function Landing({ settings }) {
  const navigate = useNavigate();
  const siteLogo = settings?.logoUrl || '/logo.jpg';
  const siteName = settings?.siteName || 'Dacha Tour';

  return (
    <div className="landing-page" style={{ padding: '40px 0' }}>
      {/* Hero Section */}
      <section style={{
        background: 'linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.6)), url("https://images.unsplash.com/photo-1500382017468-9049fee74a62?auto=format&fit=crop&q=80&w=2000")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        borderRadius: '20px',
        padding: '60px 20px',
        color: 'white',
        textAlign: 'center',
        marginBottom: '60px',
        boxShadow: 'var(--shadow-lg)',
        overflow: 'hidden'
      }}>
        <img src={siteLogo} alt={`${siteName} Logo`} style={{ 
          height: '120px', 
          marginBottom: '20px', 
          borderRadius: '50%', 
          border: '4px solid white',
          boxShadow: '0 10px 30px rgba(0,0,0,0.2)'
        }} />
        <h1 style={{ fontSize: 'clamp(1.8rem, 5vw, 3.5rem)', fontWeight: '900', marginBottom: '20px', textShadow: '0 4px 10px rgba(0,0,0,0.3)', lineHeight: '1.2', wordBreak: 'break-word' }}>
          {siteName} <VerifiedBadge size={32} style={{ verticalAlign: 'middle', marginTop: '-5px' }} />
        </h1>
        <p style={{ fontSize: 'clamp(0.95rem, 2.5vw, 1.3rem)', maxWidth: '700px', margin: '0 auto 40px', opacity: 0.95 }}>
          O'zbekistondagi eng chiroyli va qulay dachalarni biz bilan toping. 100% xavfsiz va ishonchli band qilish tizimi.
        </p>
        
        <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', flexWrap: 'wrap' }}>
          <button onClick={() => navigate('/browse')} className="btn-primary" style={{ width: 'auto', padding: '20px 40px' }}>
            <Search size={22} /> Hozir topish
          </button>
          <button onClick={() => navigate('/add')} style={{
            background: 'white',
            color: 'var(--primary)',
            border: 'none',
            padding: '20px 40px',
            borderRadius: '20px',
            fontWeight: '700',
            fontSize: '1.1rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            <PlusCircle size={22} /> Dacha qo'shish
          </button>
          <button onClick={() => navigate('/cabinet')} style={{
            background: '#e63946',
            color: 'white',
            border: 'none',
            padding: '20px 40px',
            borderRadius: '20px',
            fontWeight: '700',
            fontSize: '1.1rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            boxShadow: '0 10px 20px rgba(230, 57, 70, 0.3)'
          }}>
            <UserCircle size={22} /> Shaxsiy kabinet
          </button>
          <a 
            href={settings?.channelLink || 'https://t.me/+5AuXHINaqNBjZjM6'} 
            target="_blank" 
            rel="noreferrer" 
            style={{
              background: '#0284c7',
              color: 'white',
              border: 'none',
              padding: '20px 40px',
              borderRadius: '20px',
              fontWeight: '700',
              fontSize: '1.1rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              boxShadow: '0 10px 20px rgba(2, 132, 199, 0.3)',
              textDecoration: 'none'
            }}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="white">
              <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12l-6.871 4.326-2.962-.924c-.643-.204-.657-.643.136-.953l11.57-4.461c.537-.194 1.006.131.833.941z"/>
            </svg>
            Kanalga obuna bo'lish
          </a>
        </div>
      </section>

      {/* Features Grid */}
      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '30px', marginBottom: '60px' }}>
        <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
          <ShieldCheck size={48} color="var(--primary)" style={{ marginBottom: '20px' }} />
          <h3>100% Xavfsiz</h3>
          <p style={{ color: 'var(--text-muted)' }}>Ma'lumotlaringiz himoyalangan va faqat sizga tegishli.</p>
        </div>
        <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
          <MapPin size={48} color="var(--primary)" style={{ marginBottom: '20px' }} />
          <h3>Eng yaxshi joylar</h3>
          <p style={{ color: 'var(--text-muted)' }}>Toshkent viloyatining barcha so'lim go'shalarida dachalar.</p>
        </div>
        <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
          <Star size={48} color="var(--primary)" style={{ marginBottom: '20px' }} />
          <h3>Premium sifat</h3>
          <p style={{ color: 'var(--text-muted)' }}>Faqat eng yuqori reytingli dachalar bizning platformada.</p>
        </div>
      </section>

      {/* How it works */}
      <section style={{ padding: '80px 20px', textAlign: 'center', background: 'white' }}>
        <h2 style={{ fontSize: '2.5rem', marginBottom: '50px', fontWeight: '900', color: 'var(--primary)' }}>Qanday ishlaydi?</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '40px', maxWidth: '1200px', margin: '0 auto' }}>
          <div className="card" style={{ padding: '40px', textAlign: 'center' }}>
            <div style={{ background: 'rgba(26, 67, 50, 0.1)', width: '70px', height: '70px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 25px', color: 'var(--primary)', fontSize: '1.5rem', fontWeight: '900' }}>1</div>
            <h3 style={{ marginBottom: '15px', fontWeight: '800' }}>Ro'yxatdan o'ting</h3>
            <p style={{ color: 'var(--text-muted)', lineHeight: '1.6' }}>Ismingiz va telefon raqamingizni kiriting. Bizning tizim siz uchun maxsus xona yaratadi.</p>
          </div>
          <div className="card" style={{ padding: '40px', textAlign: 'center' }}>
            <div style={{ background: 'rgba(26, 67, 50, 0.1)', width: '70px', height: '70px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 25px', color: 'var(--primary)', fontSize: '1.5rem', fontWeight: '900' }}>2</div>
            <h3 style={{ marginBottom: '15px', fontWeight: '800' }}>Telegram orqali tasdiqlang</h3>
            <p style={{ color: 'var(--text-muted)', lineHeight: '1.6' }}>Telegram botimizga o'tib, raqamingizni tasdiqlang. Bu xavfsizlik va faqat o'z dachangizni boshqarishingizni ta'minlaydi.</p>
          </div>
          <div className="card" style={{ padding: '40px', textAlign: 'center' }}>
            <div style={{ background: 'rgba(26, 67, 50, 0.1)', width: '70px', height: '70px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 25px', color: 'var(--primary)', fontSize: '1.5rem', fontWeight: '900' }}>3</div>
            <h3 style={{ marginBottom: '15px', fontWeight: '800' }}>Dacha qo'shing</h3>
            <p style={{ color: 'var(--text-muted)', lineHeight: '1.6' }}>O'z dachangiz rasmlari, narxlari va qulayliklarini joylang. Har bir foydalanuvchining o'z shaxsiy kabineti bo'ladi.</p>
          </div>
        </div>
      </section>

      <footer style={{ 
        padding: '60px 20px', 
        background: '#f8fafc', 
        textAlign: 'center',
        borderTop: '1px solid #e2e8f0'
      }}>
        <div style={{ marginBottom: '30px' }}>
          <img src="/logo.jpg" alt="Logo" style={{ height: '60px', borderRadius: '50%', marginBottom: '15px' }} />
          <h2 style={{ color: 'var(--primary)', fontWeight: '800' }}>Dacha Tour</h2>
          <p style={{ color: 'var(--text-muted)' }}>O'zbekistondagi eng yaxshi dachalar platformasi</p>
        </div>

        <a 
          href="https://t.me/Martonov_D" 
          target="_blank" 
          rel="noopener noreferrer"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '12px',
            background: 'linear-gradient(135deg, #0088cc 0%, #00a2ed 100%)',
            color: 'white',
            textDecoration: 'none',
            padding: '12px 25px',
            borderRadius: '50px',
            fontWeight: '700',
            fontSize: '1rem',
            boxShadow: '0 8px 25px rgba(0, 136, 204, 0.3)',
            transition: 'all 0.3s ease'
          }}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="white">
            <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
          </svg>
          Professional Developer — @Martonov_D
        </a>
        <p style={{ marginTop: '25px', fontSize: '0.9rem', color: '#94a3b8' }}>
          © {new Date().getFullYear()} Dacha Tour. Barcha huquqlar himoyalangan.
        </p>
      </footer>
    </div>
  );
}

export default Landing;
