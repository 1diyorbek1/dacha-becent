import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import toast from 'react-hot-toast';
import { User, Phone, Key, ArrowRight, Send } from 'lucide-react';

function Login() {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    surname: '',
    phone: '+998',
    code: '',
    role: 'buyer' // Default role
  });

  const navigate = useNavigate();

  const [step, setStep] = useState(1); // 1: Info, 2: MandatorySub, 3: BotGuide/Code
  const [botRedirect, setBotRedirect] = useState(false);
  const [settings, setSettings] = useState(null);

  React.useEffect(() => {
    const fetchSettings = async () => {
      try {
        const { data } = await api.get('/api/dachalar/settings');
        setSettings(data);
      } catch (e) {}
    };
    fetchSettings();
  }, []);

  const handleRequestCode = async (e) => {
    if (e) e.preventDefault();
    
    setLoading(true);
    try {
      const res = await api.post('/api/dachalar/auth/request-code', {
        name: formData.name,
        surname: formData.surname,
        phone: formData.phone,
        role: formData.role || 'buyer'
      });

      if (res.data.success) {
        if (res.data.message === 'BOT_REDIRECT') {
          setBotRedirect(true);
        } else {
          toast.success(res.data.message);
        }
        setStep(3);
      } else {
        toast.error(res.data.message, { duration: 6000 });
      }
    } catch (error) {
      toast.error('Xatolik yuz berdi!');
    } finally {
      setLoading(false);
    }
  };

  const checkAndProceed = async () => {
    if (!formData.phone.startsWith('+')) {
      toast.error('Telefon raqamni + belgi bilan boshlang (masalan: +99890...)');
      return;
    }
    setStep(2); // Show mandatory sub step for everyone
  };

  const handleVerifyCode = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/api/dachalar/auth/verify-code', {
        phone: formData.phone,
        code: formData.code.trim()
      });

      if (res.data.success) {
        localStorage.setItem('user', JSON.stringify(res.data.user));
        toast.success('Muvaffaqiyatli kirdingiz!');
        navigate('/cabinet');
      } else {
        toast.error(res.data.message);
      }
    } catch (error) {
      toast.error('Kod tasdiqlanmadi!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container" style={{ 
      maxWidth: '450px', 
      margin: '80px auto', 
      padding: '40px',
      background: 'white',
      borderRadius: '30px',
      boxShadow: '0 20px 50px rgba(0,0,0,0.1)'
    }}>
      <div style={{ textAlign: 'center', marginBottom: '30px' }}>
        <img src="/logo.jpg" alt="Logo" style={{ height: '80px', borderRadius: '50%', marginBottom: '15px' }} />
        <h2 style={{ color: 'var(--primary)', fontWeight: '800' }}>Tizimga kirish</h2>
        <p style={{ color: 'var(--text-muted)' }}>Dacha Tour platformasidan foydalanish uchun kiring</p>
      </div>

      {step === 1 ? (
        <form onSubmit={handleRequestCode}>
          <div className="form-group">
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', fontWeight: '600' }}>
              <User size={18} /> Ismingiz
            </label>
            <input 
              type="text" 
              required 
              placeholder="Ismingizni kiriting"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
            />
          </div>
          <div className="form-group">
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', fontWeight: '600' }}>
              <User size={18} /> Familiyangiz
            </label>
            <input 
              type="text" 
              required 
              placeholder="Familiyangizni kiriting"
              value={formData.surname}
              onChange={(e) => setFormData({...formData, surname: e.target.value})}
            />
          </div>
          <div className="form-group">
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', fontWeight: '600' }}>
              <Phone size={18} /> Telefon raqam
            </label>
            <input 
              type="tel" 
              required 
              placeholder="+998901234567"
              value={formData.phone}
              onChange={(e) => {
                let val = e.target.value;
                if (!val.startsWith('+')) val = '+' + val;
                if (val.length < 4) val = '+998';
                setFormData({...formData, phone: val});
              }}
            />
          </div>

          <div className="form-group" style={{ marginBottom: '25px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', fontWeight: '700', color: 'var(--primary)' }}>
               Hisob turi
            </label>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: '1fr 1fr', 
              gap: '10px',
              padding: '5px',
              background: '#f1f5f9',
              borderRadius: '16px'
            }}>
              <button
                type="button"
                onClick={() => setFormData({...formData, role: 'buyer'})}
                style={{
                  padding: '12px',
                  borderRadius: '12px',
                  border: 'none',
                  cursor: 'pointer',
                  fontWeight: '700',
                  fontSize: '0.9rem',
                  transition: 'all 0.3s ease',
                  background: formData.role === 'buyer' ? 'white' : 'transparent',
                  color: formData.role === 'buyer' ? 'var(--primary)' : '#64748b',
                  boxShadow: formData.role === 'buyer' ? '0 4px 12px rgba(0,0,0,0.05)' : 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px'
                }}
              >
                🛒 Sotib oluvchi
              </button>
              <button
                type="button"
                onClick={() => setFormData({...formData, role: 'seller'})}
                style={{
                  padding: '12px',
                  borderRadius: '12px',
                  border: 'none',
                  cursor: 'pointer',
                  fontWeight: '700',
                  fontSize: '0.9rem',
                  transition: 'all 0.3s ease',
                  background: formData.role === 'seller' ? 'white' : 'transparent',
                  color: formData.role === 'seller' ? 'var(--primary)' : '#64748b',
                  boxShadow: formData.role === 'seller' ? '0 4px 12px rgba(0,0,0,0.05)' : 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px'
                }}
              >
                🏘 Sotuvchi
              </button>
            </div>
            <p style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '8px', textAlign: 'center' }}>
              {formData.role === 'seller' ? 'Dacha quyish va boshqarish uchun' : 'Dachalarni ko\'rish va band qilish uchun'}
            </p>
          </div>
          <div style={{
            background: 'linear-gradient(135deg, #f0f9ff, #e0f2fe)',
            border: '1.5px solid #7dd3fc',
            borderRadius: '16px',
            padding: '14px 18px',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="#0284c7" style={{ flexShrink: 0 }}>
              <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12l-6.871 4.326-2.962-.924c-.643-.204-.657-.643.136-.953l11.57-4.461c.537-.194 1.006.131.833.941z"/>
            </svg>
            <div>
              <div style={{ fontWeight: '700', fontSize: '0.9rem', color: '#0369a1' }}>
                Tasdiqlash kodi shu botdan keladi:
              </div>
              <a
                href="https://t.me/FBD7_bot"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: '#0284c7', fontWeight: '800', fontSize: '1rem', textDecoration: 'none' }}
              >
                @FBD7_bot
              </a>
            </div>
          </div>
          <button 
            className="btn-primary" 
            type="button" 
            disabled={loading}
            onClick={(e) => {
              e.preventDefault();
              if (!formData.name || !formData.surname || formData.phone.length < 13) {
                toast.error('Iltimos, barcha maydonlarni to\'ldiring!');
                return;
              }
              checkAndProceed();
            }}
          >
            {loading ? 'Yuborilmoqda...' : <><Send size={20} /> Kodni olish</>}
          </button>
        </form>
      ) : step === 2 ? (
        <div style={{ textAlign: 'center' }}>
           <div style={{ 
             background: 'linear-gradient(135deg, #f0f9ff, #e0f2fe)',
             border: '2px solid #7dd3fc',
             borderRadius: '24px',
             padding: '30px',
             marginBottom: '25px'
           }}>
             <div style={{ background: '#0284c7', color: 'white', width: '60px', height: '60px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', boxShadow: '0 8px 20px rgba(2,132,199,0.3)' }}>
               <svg width="30" height="30" viewBox="0 0 24 24" fill="white">
                 <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12l-6.871 4.326-2.962-.924c-.643-.204-.657-.643.136-.953l11.57-4.461c.537-.194 1.006.131.833.941z"/>
               </svg>
             </div>
             <h3 style={{ color: '#0369a1', fontWeight: '800', marginBottom: '10px' }}>Majburiy obuna!</h3>
             <p style={{ color: '#0c4a6e', fontSize: '0.95rem', lineHeight: '1.6' }}>
               Kodni olishdan avval bizning rasmiy kanalimizga a'zo bo'lishingiz shart.
             </p>
           </div>

           <a 
             href={settings?.channelLink || 'https://t.me/+5AuXHINaqNBjZjM6'} 
             target="_blank" 
             rel="noreferrer" 
             className="btn-primary" 
             style={{ 
               background: 'linear-gradient(135deg, #0284c7, #0369a1)', 
               textDecoration: 'none', 
               marginBottom: '15px',
               display: 'flex',
               alignItems: 'center',
               justifyContent: 'center',
               gap: '10px'
             }}
           >
             📢 Kanalga obuna bo'lish
           </a>

           <button 
             onClick={handleRequestCode}
             className="btn-primary" 
             style={{ background: '#f1f5f9', color: '#475569', border: '1px solid #e2e8f0' }}
           >
             Kanalga a'zo bo'ldim, davom etish ➜
           </button>

           <button 
             onClick={() => setStep(1)}
             style={{ background: 'none', border: 'none', color: '#94a3b8', marginTop: '15px', cursor: 'pointer', fontSize: '0.9rem' }}
           >
             Orqaga qaytish
           </button>
        </div>
      ) : (
        <div>
          {/* Bot instruction guide */}
          {botRedirect && (
            <div style={{ marginBottom: '25px' }}>
              <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                <div style={{ fontSize: '3rem', marginBottom: '8px' }}>🤖</div>
                <h3 style={{ color: '#0369a1', fontWeight: '800', marginBottom: '5px' }}>Botdan kod oling!</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                  Quyidagi 2 ta qadamni bajaring — kod 3 soniyada keladi
                </p>
              </div>

              {/* Steps */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 15px', background: '#f0f9ff', borderRadius: '14px', border: '1px solid #bae6fd' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#0284c7', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', fontSize: '1rem', flexShrink: 0 }}>1</div>
                  <span style={{ fontWeight: '600', fontSize: '0.95rem' }}>Quyidagi botni oching va <b>"Start"</b> bosing</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 15px', background: '#f0f9ff', borderRadius: '14px', border: '1px solid #bae6fd' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#0284c7', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', fontSize: '1rem', flexShrink: 0 }}>2</div>
                  <span style={{ fontWeight: '600', fontSize: '0.95rem' }}>📱 <b>Telefon raqamimni ulashish</b> tugmasini bosing</span>
                </div>
              </div>

              <a
                href="https://t.me/FBD7_bot"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '10px',
                  width: '100%',
                  padding: '16px',
                  background: 'linear-gradient(135deg, #229ed9, #1a7abf)',
                  color: 'white',
                  borderRadius: '18px',
                  fontWeight: '800',
                  fontSize: '1.1rem',
                  textDecoration: 'none',
                  marginBottom: '20px',
                  boxShadow: '0 8px 20px rgba(34,158,217,0.4)'
                }}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                  <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12l-6.871 4.326-2.962-.924c-.643-.204-.657-.643.136-.953l11.57-4.461c.537-.194 1.006.131.833.941z"/>
                </svg>
                @FBD7_bot — Botni ochish
              </a>

              <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '15px' }}>
                ⬇️ Kod kelgandan keyin pastga kiriting
              </div>
            </div>
          )}

          {/* Code input */}
          <form onSubmit={handleVerifyCode}>
            <div className="form-group">
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', fontWeight: '600' }}>
                <Key size={18} /> Tasdiqlash kodi
              </label>
              <input 
                type="text" 
                required 
                placeholder="6 xonali kodni kiriting"
                maxLength="6"
                value={formData.code}
                onChange={(e) => setFormData({...formData, code: e.target.value.replace(/\s/g, '')})}
                style={{ textAlign: 'center', fontSize: '1.5rem', letterSpacing: '8px' }}
              />
              {!botRedirect && (
                <div style={{ marginTop: '15px', textAlign: 'center', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                  Tasdiqlash kodi Telegram orqali <a href="https://t.me/FBD7_bot" target="_blank" rel="noopener noreferrer" style={{ color: '#0284c7', fontWeight: '600', textDecoration: 'none' }}>@FBD7_bot</a> botiga yuborildi.
                </div>
              )}
            </div>
            <button className="btn-primary" type="submit" disabled={loading}>
              {loading ? 'Tekshirilmoqda...' : <><ArrowRight size={20} /> Kirish</>}
            </button>
            <button 
              type="button" 
              onClick={() => { setStep(1); setBotRedirect(false); }} 
              style={{ 
                width: '100%', 
                background: 'none', 
                border: 'none', 
                marginTop: '15px', 
                color: 'var(--text-muted)', 
                cursor: 'pointer',
                textDecoration: 'underline'
              }}
            >
              Raqamni o'zgartirish
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

export default Login;
