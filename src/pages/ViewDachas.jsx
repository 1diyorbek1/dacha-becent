import React, { useState, useEffect } from 'react';
import { Phone, User, Calendar as CalendarIcon, Info, Star, MapPin, CheckCircle2, Search, PlayCircle, X, Heart } from 'lucide-react';
import { formatPriceUz } from '../utils/priceFormatter';
import { AMENITIES_LIST } from '../components/AmenitiesForm';
import ImageSlider from '../components/ImageSlider';
import api from '../api';
import toast from 'react-hot-toast';

function StoryPlayer({ dacha, onClose, onToggleLike }) {
  const url = dacha.storyUrl;
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [showLikers, setShowLikers] = useState(false);
  const videoRef = React.useRef(null);
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  
  const isImage = url && (url.startsWith('data:image') || url.match(/\.(jpeg|jpg|gif|png|webp)$/i));
  const duration = isImage ? 10000 : 110000;
  const interval = duration / 100;

  const hasLiked = dacha.likers?.some(l => l.phone === user.phone);

  useEffect(() => {
    if (isPaused || showLikers) {
      if (videoRef.current) videoRef.current.pause();
      return;
    }
    
    if (videoRef.current) videoRef.current.play().catch(() => {});

    const timer = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          onClose();
          return 100;
        }
        return prev + 1;
      });
    }, interval); 

    return () => clearInterval(timer);
  }, [onClose, isPaused, interval, showLikers]);

  const handleHoldStart = () => setIsPaused(true);
  const handleHoldEnd = () => setIsPaused(false);

  return (
    <div className="story-player-overlay" 
      onMouseDown={handleHoldStart}
      onMouseUp={handleHoldEnd}
      onMouseLeave={handleHoldEnd}
      onTouchStart={handleHoldStart}
      onTouchEnd={handleHoldEnd}
      style={{ 
        position: 'fixed', inset: 0, background: 'black', zIndex: 11000, 
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        userSelect: 'none', cursor: isPaused ? 'grabbing' : 'default'
      }}
    >
      <div className="story-progress-container" style={{ position: 'absolute', top: '20px', left: '20px', right: '20px', display: 'flex', gap: '5px', zIndex: 20 }}>
        <div className="story-progress-bar" style={{ flex: 1, height: '2px', background: 'rgba(255,255,255,0.3)', borderRadius: '2px', overflow: 'hidden' }}>
          <div style={{ width: `${progress}%`, height: '100%', background: 'white', transition: 'width 0.1s linear' }} />
        </div>
      </div>

      <div style={{ position: 'absolute', top: '40px', left: '20px', display: 'flex', alignItems: 'center', gap: '10px', color: 'white', zIndex: 20 }}>
         <div style={{ width: '40px', height: '40px', borderRadius: '50%', border: '2px solid white', overflow: 'hidden' }}>
            <img src={dacha.ownerProfile?.avatarUrl || ''} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
         </div>
         <span style={{ fontWeight: '700' }}>{dacha.dachaName}</span>
      </div>

      <button 
        onClick={(e) => { e.stopPropagation(); onClose(); }} 
        style={{ position: 'absolute', top: '40px', right: '20px', color: 'white', background: 'none', border: 'none', cursor: 'pointer', zIndex: 20 }}
      >
        <X size={32} />
      </button>

      {url && (url.startsWith('data:image') || url.match(/\.(jpeg|jpg|gif|png|webp)$/i)) ? (
        <img 
          src={url} 
          alt="Story"
          style={{ maxWidth: '100%', maxHeight: '80vh', borderRadius: '20px', objectFit: 'contain', pointerEvents: 'none' }}
        />
      ) : (
        <video 
          ref={videoRef}
          src={url} 
          autoPlay 
          playsInline 
          style={{ maxWidth: '100%', maxHeight: '80vh', borderRadius: '20px', pointerEvents: 'none' }}
          onEnded={onClose}
        />
      )}

      {/* Like and Viewers Footer */}
      <div style={{ position: 'absolute', bottom: '40px', left: '20px', right: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <button 
            onClick={(e) => { e.stopPropagation(); onToggleLike(dacha.id); }}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: hasLiked ? '#ff3040' : 'white' }}
          >
            <Heart size={36} fill={hasLiked ? "#ff3040" : "none"} strokeWidth={2.5} />
          </button>
          
          {dacha.likers?.length > 0 && (
            <div 
              onClick={(e) => { e.stopPropagation(); setShowLikers(true); }}
              style={{ color: 'white', fontSize: '0.9rem', fontWeight: '700', cursor: 'pointer', textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}
            >
              {dacha.likers.length} likes
            </div>
          )}
        </div>
      </div>

      {/* Likers Modal */}
      {showLikers && (
        <div 
          onClick={(e) => { e.stopPropagation(); setShowLikers(false); }}
          style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 30, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px' }}
        >
          <div 
            onClick={e => e.stopPropagation()}
            style={{ background: 'white', width: '100%', maxWidth: '400px', borderRadius: '20px', padding: '20px', maxHeight: '60vh', overflowY: 'auto' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ margin: 0 }}>Like bosganlar</h3>
              <X size={24} onClick={() => setShowLikers(false)} style={{ cursor: 'pointer' }} />
            </div>
            {dacha.likers.map((liker, idx) => (
              <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '15px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#f1f5f9', overflow: 'hidden' }}>
                  {liker.avatarUrl ? (
                    <img src={liker.avatarUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <User size={24} style={{ margin: '8px' }} color="#cbd5e1" />
                  )}
                </div>
                <div>
                  <div style={{ fontWeight: '700', fontSize: '0.95rem' }}>{liker.name} {liker.surname}</div>
                  <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{liker.phone}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function ViewDachas() {
  const [dachalar, setDachalar] = useState([]);
  const [selectedDacha, setSelectedDacha] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDays, setSelectedDays] = useState([]);
  const [customerName, setCustomerName] = useState('');
  const [activeStory, setActiveStory] = useState(null);
  
  // Reviews state
  const [reviewModalDacha, setReviewModalDacha] = useState(null);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const { data } = await api.get('/api/dachalar/settings');
        setSettings(data);
      } catch (e) {}
    };
    fetchSettings();
  }, []);

  useEffect(() => {
    const checkSub = async () => {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      if (user.phone && selectedDacha) {
        try {
          const { data } = await api.get(`/api/dachalar/auth/check-subscription?phone=${user.phone}`);
          setIsSubscribed(data.isSubscribed);
        } catch (e) {}
      }
    };
    checkSub();
  }, [selectedDacha]);

  useEffect(() => {
    const fetchDachalar = async () => {
      try {
        const { data } = await api.get('/api/dachalar');
        setDachalar(data);
      } catch (error) {
        console.error("Fetch error:", error);
      }
    };
    fetchDachalar();
  }, []);

  const handleToggleLike = async (dachaId) => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (!user.phone) {
      alert("Iltimos, avval ro'yxatdan o'ting!");
      return;
    }
    try {
      await api.post(`/api/dachalar/${dachaId}/story/like`, { phone: user.phone });
      // Refresh data
      const { data } = await api.get('/api/dachalar');
      setDachalar(data);
      // Update activeStory if open
      if (activeStory && activeStory.id === dachaId) {
        const updatedDacha = data.find(d => d.id === dachaId);
        setActiveStory(updatedDacha);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSubmitReview = async () => {
    if (reviewRating === 0 || !reviewText.trim()) return;
    setIsSubmittingReview(true);
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const { data: updatedDacha } = await api.post(`/api/dachalar/${reviewModalDacha.id}/review`, { 
        phone: user.phone || 'Noma`lum', 
        rating: reviewRating, 
        text: reviewText 
      });
      
      const parsedDacha = {
        ...updatedDacha,
        photos: typeof updatedDacha.photos === 'string' ? JSON.parse(updatedDacha.photos || '[]') : updatedDacha.photos,
        calendar: typeof updatedDacha.calendar === 'string' ? JSON.parse(updatedDacha.calendar) : updatedDacha.calendar,
        amenities: typeof updatedDacha.amenities === 'string' ? JSON.parse(updatedDacha.amenities) : updatedDacha.amenities
      };
      
      setDachalar(dachalar.map(d => d.id === parsedDacha.id ? parsedDacha : d));
      setReviewModalDacha(parsedDacha); // Update modal immediately without closing
      setReviewText('');
      setReviewRating(0);
      toast.success('Fikringiz yuborildi! Rahmat ✅');
    } catch (e) {
      console.error(e);
      toast.error('Xatolik yuz berdi');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  if (dachalar.length === 0) {
    return (
      <div className="empty-state" style={{ padding: '100px 20px' }}>
        <div style={{ background: 'white', display: 'inline-block', padding: '30px', borderRadius: '50%', boxShadow: 'var(--shadow-md)', marginBottom: '20px' }}>
          <CalendarIcon size={64} color="var(--primary)" />
        </div>
        <h2>Hali hech qanday dacha qo'shilmagan</h2>
        <p>Ilk dachani qo'shish uchun yuqoridagi 'Add' bo'limiga o'ting.</p>
      </div>
    );
  }

  return (
    <div className="view-dachas-page" style={{ paddingBottom: '60px' }}>
      {activeStory && (
        <StoryPlayer 
          dacha={activeStory} 
          onClose={() => setActiveStory(null)} 
          onToggleLike={handleToggleLike} 
        />
      )}

      <header style={{ marginBottom: '40px' }}>
        <h2 style={{ fontSize: '2.5rem', fontWeight: '900', color: 'var(--primary)' }}>Siz uchun saralangan dachalar</h2>
        <p style={{ color: 'var(--text-muted)' }}>Bugun {dachalar.length} ta dacha faol holatda</p>
      </header>

      {/* Professional Search Bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        background: '#e2e8f0',
        borderRadius: '20px',
        padding: '5px',
        marginBottom: '40px',
        maxWidth: '600px',
        boxShadow: 'var(--shadow-sm)',
        border: '1px solid rgba(255,255,255,0.5)'
      }}>
        <div style={{ padding: '0 15px', color: '#64748b' }}>
          <Search size={20} />
        </div>
        <input 
          type="text" 
          placeholder="Dacha nomi bo'yicha qidirish..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            flex: 1,
            border: 'none',
            background: 'transparent',
            padding: '12px 5px',
            fontSize: '1rem',
            outline: 'none',
            color: 'var(--text-main)'
          }}
        />
      </div>
      
      <div className="dacha-list" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '30px' }}>
        {dachalar.filter(dacha => 
          (dacha.dachaName || '').toLowerCase().includes(searchTerm.toLowerCase())
        ).map(dacha => (
          <div key={dacha.id} className="dacha-card" onClick={() => setSelectedDacha(dacha)} style={{ position: 'relative' }}>
            <div className="dacha-card-image" style={{ height: '240px', position: 'relative' }}>
              <ImageSlider photos={dacha.photos} />
              <div style={{ position: 'absolute', top: '15px', right: '15px', background: 'rgba(255,255,255,0.9)', padding: '5px 12px', borderRadius: '10px', fontSize: '0.8rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Star size={14} fill="#fbbf24" color="#fbbf24" /> 4.9
              </div>
            </div>
            
            <div className="dacha-card-content" style={{ padding: '25px' }}>
              <div style={{ display: 'flex', gap: '15px', alignItems: 'center', marginBottom: '15px' }}>
                {/* Instagram Style Avatar */}
                <div 
                  className={dacha.storyUrl ? "story-ring-active" : ""}
                  onClick={(e) => {
                    if (dacha.storyUrl) {
                      e.stopPropagation();
                      setActiveStory(dacha);
                    }
                  }}
                  style={{ 
                    width: '60px', 
                    height: '60px', 
                    borderRadius: '50%', 
                    padding: '3px',
                    background: dacha.storyUrl ? 'linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)' : '#e2e8f0',
                    cursor: dacha.storyUrl ? 'pointer' : 'default',
                    flexShrink: 0
                  }}
                >
                  <div style={{ width: '100%', height: '100%', borderRadius: '50%', border: '2px solid white', overflow: 'hidden', background: 'white' }}>
                    {dacha.ownerProfile?.avatarUrl ? (
                      <img src={dacha.ownerProfile.avatarUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#cbd5e1' }}>
                        <User size={30} />
                      </div>
                    )}
                  </div>
                </div>

                <div style={{ flex: 1 }}>
                  <h3 style={{ fontSize: '1.2rem', marginBottom: '2px' }}>{dacha.dachaName}</h3>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    {dacha.ownerProfile ? `${dacha.ownerProfile.name} ${dacha.ownerProfile.surname}` : dacha.ownerName}
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="#0095f6" style={{ flexShrink: 0 }}>
                      <path d="M22.12 11.23L20 9.24V6.33A1.33 1.33 0 0 0 18.67 5h-2.91l-1.99-2.12a1.33 1.33 0 0 0-1.95 0L9.83 5H6.92A1.33 1.33 0 0 0 5.59 6.33v2.91l-2.12 1.99a1.33 1.33 0 0 0 0 1.95l2.12 1.99v2.91a1.33 1.33 0 0 0 1.33 1.33h2.91l1.99 2.12a1.33 1.33 0 0 0 1.95 0l1.99-2.12h2.91a1.33 1.33 0 0 0 1.33-1.33v-2.91l2.12-1.99a1.33 1.33 0 0 0 0-1.95zM10.59 15.21L7.29 11.9l1.1-1.1l2.2 2.2l4.8-4.8l1.1 1.1l-5.9 5.91z" />
                    </svg>
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase' }}>Bugun</div>
                  <div style={{ color: 'var(--primary)', fontWeight: '900', fontSize: '1.2rem' }}>
                    {dacha.calendar[new Date().getDate()]?.price ? formatPriceUz(dacha.calendar[new Date().getDate()].price) : (dacha.calendar[1] ? formatPriceUz(dacha.calendar[1].price) : 'N/A')}
                  </div>
                </div>
              </div>
              
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px 15px', color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '15px' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><MapPin size={16} /> Bo'stonliq</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><User size={16} /> {dacha.capacity} kishi</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <CheckCircle2 size={16} color={dacha.guestType === 'family' ? 'var(--success)' : 'var(--primary)'} />
                  {dacha.guestType === 'family' ? 'Faqat oila' : dacha.guestType === 'friends' ? 'Ulfatlar' : 'Oila/Ulfatlar'}
                </span>
              </div>

              {(() => {
                let parsed = {};
                try { parsed = typeof dacha.amenities === 'string' ? JSON.parse(dacha.amenities || '{}') : (dacha.amenities || {}); } catch(e){}
                const activeAm = Object.keys(parsed).filter(k => parsed[k] === true);
                if (activeAm.length === 0) return null;
                return (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '15px' }}>
                    {activeAm.slice(0, 4).map((a, i) => {
                      const amenityItem = AMENITIES_LIST.find(x => x.id === a);
                      return (
                        <span key={i} style={{ background: '#f8fafc', color: '#475569', fontSize: '0.75rem', padding: '5px 10px', borderRadius: '8px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          {amenityItem?.icon && <span style={{ fontSize: '1rem' }}>{React.createElement(amenityItem.icon, { size: 14 })}</span>}
                          {amenityItem?.label || a}
                        </span>
                      );
                    })}
                    {activeAm.length > 4 && (
                      <span style={{ background: '#f1f5f9', color: '#64748b', fontSize: '0.75rem', padding: '5px 10px', borderRadius: '8px', border: '1px dashed #cbd5e1' }}>
                        +{activeAm.length - 4} ta
                      </span>
                    )}
                  </div>
                );
              })()}

              <div className="dacha-card-phone" style={{ background: '#f1fcf8', padding: '12px', borderRadius: '12px', color: 'var(--primary)', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                <Phone size={16} /> {dacha.phone}
              </div>

              {dacha.latitude && dacha.longitude ? (
                <button 
                  onClick={(e) => { e.stopPropagation(); window.open(`https://www.google.com/maps?q=${dacha.latitude},${dacha.longitude}`, '_blank'); }}
                  style={{ width: '100%', background: '#fff', border: '1px solid #e2e8f0', padding: '10px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', color: '#64748b', fontSize: '0.85rem', fontWeight: '700', cursor: 'pointer' }}
                >
                  <MapPin size={16} color="var(--primary)" /> Lokatsiyani ko'rish
                </button>
              ) : (
                <div style={{ padding: '5px', fontSize: '0.8rem', color: '#94a3b8', textAlign: 'center' }}>
                  <MapPin size={14} /> Manzil aniqlanmagan
                </div>
              )}

              <button 
                onClick={(e) => { e.stopPropagation(); setReviewModalDacha(dacha); }}
                style={{ width: '100%', background: '#fdf8f6', border: '1px solid #fed7aa', padding: '10px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', color: '#ea580c', fontSize: '0.85rem', fontWeight: '700', cursor: 'pointer', marginTop: '10px' }}
              >
                <Star size={16} fill="currentColor" /> Dacha haqida fikrlar {dacha.reviews ? `(${JSON.parse(dacha.reviews).length})` : '(0)'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {selectedDacha && (
        <div className="modal-overlay" style={{
          position: 'fixed', inset: 0, background: 'rgba(10, 26, 18, 0.8)',
          backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center',
          justifyContent: 'center', zIndex: 2000, padding: '20px'
        }} onClick={() => { setSelectedDacha(null); setSelectedDays([]); }}>
          <div className="card" style={{ maxWidth: '900px', width: '100%', maxHeight: '90vh', overflowY: 'auto', padding: '40px', position: 'relative' }} onClick={e => e.stopPropagation()}>
            <button onClick={() => setSelectedDacha(null)} style={{ position: 'absolute', top: '20px', right: '20px', border: 'none', background: '#f1f5f9', width: '40px', height: '40px', borderRadius: '50%', cursor: 'pointer', zIndex: 100 }}>✕</button>

            <div style={{ height: '350px', width: '100%', borderRadius: '20px', overflow: 'hidden', marginBottom: '30px', position: 'relative' }}>
              <ImageSlider photos={selectedDacha.photos} />
            </div>

            <div style={{ marginBottom: '30px' }}>
              <h2 style={{ fontSize: '2rem', color: 'var(--primary)', marginBottom: '15px' }}>{selectedDacha.dachaName}</h2>
              
              {(() => {
                let parsed = {};
                try { parsed = typeof selectedDacha.amenities === 'string' ? JSON.parse(selectedDacha.amenities || '{}') : (selectedDacha.amenities || {}); } catch(e){}
                const activeAm = Object.keys(parsed).filter(k => parsed[k] === true);
                if (activeAm.length === 0) return null;
                return (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '20px' }}>
                    {activeAm.map((a, i) => {
                      const amenityItem = AMENITIES_LIST.find(x => x.id === a);
                      return (
                        <span key={i} style={{ background: '#f8fafc', color: '#475569', fontSize: '0.9rem', padding: '8px 12px', borderRadius: '10px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '500' }}>
                          {amenityItem?.icon && <span style={{ fontSize: '1.1rem' }}>{React.createElement(amenityItem.icon, { size: 16 })}</span>}
                          {amenityItem?.label || a}
                        </span>
                      );
                    })}
                  </div>
                );
              })()}

              <h3 style={{ fontSize: '1.5rem', color: 'var(--primary)', marginTop: '20px' }}>Kalendar</h3>
              <p style={{ color: 'var(--text-muted)' }}>Bandlik holati va kunlik narxlar bilan tanishing</p>
              <div style={{ 
                background: '#f0fdf4', 
                color: 'var(--success)', 
                padding: '12px 20px', 
                borderRadius: '12px', 
                marginTop: '15px', 
                fontSize: '0.95rem', 
                fontWeight: '700',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                border: '1px solid #dcfce7'
              }}>
                <Info size={18} /> Kunlarni ustiga bosib dachaning egasiga maktub yuboring
              </div>
            </div>

            <div className="calendar-grid">
                {Object.entries(selectedDacha.calendar).map(([day, info]) => {
                  const dayNum = parseInt(day);
                  const now = new Date();
                  const isPast = new Date(now.getFullYear(), now.getMonth(), dayNum, 23, 59, 59) < now;
                  const isSelected = selectedDays.includes(day);
                  
                  return (
                  <div 
                    key={day} 
                    className={`day-box ${info.status === 'occupied' ? 'occupied' : 'free'} ${isPast ? 'past' : ''}`} 
                    onClick={() => {
                      if (isPast || info.status === 'occupied') return;
                      setSelectedDays(prev => isSelected ? prev.filter(d => d !== day) : [...prev, day].sort((a,b) => parseInt(a) - parseInt(b)));
                    }}
                    style={{ 
                      minHeight: '100px', 
                      backgroundColor: isPast ? '#fef3c7' : (info.status === 'occupied' ? '#fff0f0' : (isSelected ? '#ecfdf5' : 'white')),
                      borderColor: isPast ? '#fbbf24' : (info.status === 'occupied' ? 'var(--danger)' : (isSelected ? 'var(--primary)' : '#e2e8f0')),
                      borderWidth: isSelected ? '3px' : '1px'
                    }}
                  >
                     <div className="day-number">{day}</div>
                     <div className="status-badge" style={{ background: isPast ? '#fbbf24' : (info.status === 'occupied' ? 'var(--danger)' : (isSelected ? 'var(--primary)' : 'var(--success)')) }}>
                       {isPast ? 'O\'tib ketdi' : (info.status === 'occupied' ? 'Band' : 'Bo\'sh')}
                     </div>
                     {info.price && <div style={{ fontSize: '0.85rem', marginTop: 'auto', fontWeight: '800' }}>{formatPriceUz(info.price)}</div>}
                  </div>
                )})}
            </div>

            {selectedDays.length > 0 && (() => {
              const totalPrice = selectedDays.reduce((a, b) => a + (Number(selectedDacha.calendar[b]?.price) || 0), 0);
              
              const firstDay = Math.min(...selectedDays.map(Number));
              const lastDay = Math.max(...selectedDays.map(Number));
              const monthsUz = ["yanvar", "fevral", "mart", "aprel", "may", "iyun", "iyul", "avgust", "sentyabr", "oktyabr", "noyabr", "dekabr"];
              const checkInDate = new Date(new Date().getFullYear(), new Date().getMonth(), firstDay);
              const checkOutDate = new Date(new Date().getFullYear(), new Date().getMonth(), lastDay + 1);

              const checkInText = `${checkInDate.getDate()}-${monthsUz[checkInDate.getMonth()]} kirish vaqti soat 19:00`;
              const checkOutText = `${checkOutDate.getDate()}-${monthsUz[checkOutDate.getMonth()]} chiqish vaqti soat 17:00`;

              return (
              <div style={{ background: '#f0fdf4', padding: '25px', borderRadius: '20px', marginTop: '30px', border: '2px solid var(--success)' }}>
                
                {/* Discount Banner */}
                <div style={{ 
                  background: isSubscribed ? '#f0fdf4' : '#fff7ed', 
                  border: isSubscribed ? '1px solid #22c55e' : '1px solid #f97316',
                  borderRadius: '15px', 
                  padding: '15px', 
                  marginBottom: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '15px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ background: isSubscribed ? '#22c55e' : '#f97316', color: 'white', width: '30px', height: '30px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {isSubscribed ? '✅' : '🎁'}
                    </div>
                    <div>
                      <div style={{ fontWeight: '800', fontSize: '0.9rem', color: isSubscribed ? '#15803d' : '#9a3412' }}>
                        {isSubscribed ? 'Obuna chegirmasi qo\'llanildi!' : 'Kanalga obuna bo\'ling va 20$ chegirma oling!'}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: isSubscribed ? '#166534' : '#c2410c' }}>
                        {isSubscribed ? 'Siz kanalimiz a\'zosisiz. Rahmat!' : 'Obuna bo\'lgach "Tekshirish" tugmasini bosing.'}
                      </div>
                    </div>
                  </div>
                  {!isSubscribed ? (
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <a href={settings?.channelLink || 'https://t.me/+5AuXHINaqNBjZjM6'} target="_blank" rel="noreferrer" style={{ background: '#f97316', color: 'white', padding: '8px 12px', borderRadius: '10px', textDecoration: 'none', fontSize: '0.8rem', fontWeight: '700' }}>Obuna bo'lish</a>
                      <button 
                        onClick={async () => {
                          const user = JSON.parse(localStorage.getItem('user') || '{}');
                          if (user.phone) {
                            const { data } = await api.get(`/api/dachalar/auth/check-subscription?phone=${user.phone}`);
                            setIsSubscribed(data.isSubscribed);
                            if (data.isSubscribed) toast.success('Chegirma qo\'llanildi!');
                            else toast.error('Hali obuna bo\'lmabsiz!');
                          } else {
                            toast.error('Avval tizimga kiring!');
                          }
                        }}
                        style={{ background: 'white', border: '1px solid #f97316', color: '#f97316', padding: '8px 12px', borderRadius: '10px', fontSize: '0.8rem', fontWeight: '700', cursor: 'pointer' }}
                      >
                        Tekshirish
                      </button>
                    </div>
                  ) : (
                     <div style={{ fontWeight: '900', color: '#22c55e', fontSize: '1.2rem' }}>-20$</div>
                  )}
                </div>

                <h3 style={{ color: 'var(--success)', marginBottom: '15px' }}>
                  Jami narx: {isSubscribed ? Math.max(0, totalPrice - 20) : totalPrice}$
                  {isSubscribed && <span style={{ textDecoration: 'line-through', color: '#94a3b8', fontSize: '1rem', marginLeft: '10px' }}>{totalPrice}$</span>}
                </h3>
                
                <div style={{ background: 'white', padding: '15px', borderRadius: '15px', marginBottom: '15px', border: '1px solid #dcfce7' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', fontWeight: '700', color: '#475569' }}>
                    <span style={{ color: 'var(--success)' }}>🟢</span> {checkInText}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '700', color: '#475569' }}>
                    <span style={{ color: 'var(--danger)' }}>🔴</span> {checkOutText}
                  </div>
                </div>

                <input type="text" placeholder="Ismingizni kiriting" value={customerName} onChange={(e) => setCustomerName(e.target.value)} style={{ width: '100%', padding: '16px', borderRadius: '15px', border: '2px solid #cbd5e1', marginTop: '5px' }} />
                <button onClick={async () => {
                  if (!customerName.trim()) {
                    toast.error('Iltimos, ismingizni kiriting!');
                    return;
                  }

                  const user = JSON.parse(localStorage.getItem('user') || '{}');
                  const bookingData = {
                    dachaId: selectedDacha.id,
                    dachaName: selectedDacha.dachaName,
                    ownerName: selectedDacha.ownerName,
                    ownerPhone: selectedDacha.phone,
                    customerName: customerName,
                    customerPhone: user.phone || 'Noma`lum',
                    bookedDays: selectedDays,
                    totalPrice: isSubscribed ? Math.max(0, totalPrice - 20) : totalPrice,
                    checkIn: checkInText,
                    checkOut: checkOutText
                  };

                  try {
                    await api.post('/api/dachalar/bookings', bookingData);
                  } catch (e) {
                    console.error('Failed to save booking:', e);
                  }

                  const finalPrice = isSubscribed ? Math.max(0, totalPrice - 20) : totalPrice;
                  const text = `🏠 Dacha: ${selectedDacha.dachaName}\n📅 Kunlar: ${selectedDays.join(', ')}\n\n🟢 ${checkInText}\n🔴 ${checkOutText}\n\n💰 Jami: ${finalPrice}$\n👤 Mijoz: ${customerName}`;
                  window.open(`https://t.me/+${selectedDacha.phone.replace(/\D/g, '')}?text=${encodeURIComponent(text)}`, '_blank');
                }} className="btn-primary" style={{ width: '100%', marginTop: '15px', background: 'var(--success)' }}>📩 Band qilish</button>
              </div>
            )})()}
          </div>
        </div>
      )}

      {reviewModalDacha && (
        <div className="modal-overlay" style={{
          position: 'fixed', inset: 0, background: 'rgba(10, 26, 18, 0.8)',
          backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center',
          justifyContent: 'center', zIndex: 2000, padding: '20px'
        }} onClick={() => setReviewModalDacha(null)}>
          <div className="card" style={{ maxWidth: '600px', width: '100%', maxHeight: '90vh', overflowY: 'auto', padding: '30px', position: 'relative' }} onClick={e => e.stopPropagation()}>
            <button onClick={() => setReviewModalDacha(null)} style={{ position: 'absolute', top: '15px', right: '15px', border: 'none', background: '#f1f5f9', width: '35px', height: '35px', borderRadius: '50%', cursor: 'pointer', zIndex: 100 }}>✕</button>

            <h2 style={{ fontSize: '1.8rem', color: 'var(--primary)', marginBottom: '20px' }}>Dacha haqida fikrlar</h2>

            <div style={{ marginBottom: '30px', background: '#f8fafc', padding: '20px', borderRadius: '15px' }}>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '15px' }}>Fikringizni qoldiring:</h3>
              <div style={{ display: 'flex', gap: '10px', marginBottom: '15px', flexWrap: 'wrap' }}>
                {[
                  { val: 1, text: 'Juda yomon' },
                  { val: 2, text: 'Sal yaxshiroq' },
                  { val: 3, text: 'Bo\'ladi' },
                  { val: 4, text: 'Yaxshi' },
                  { val: 5, text: 'Judaham zo\'r' }
                ].map(star => (
                  <button 
                    key={star.val}
                    onClick={() => setReviewRating(star.val)}
                    style={{ 
                      padding: '8px 12px', 
                      borderRadius: '20px', 
                      border: '1px solid #cbd5e1', 
                      background: reviewRating >= star.val ? '#fbbf24' : 'white',
                      color: reviewRating >= star.val ? 'white' : '#64748b',
                      cursor: 'pointer',
                      display: 'flex', alignItems: 'center', gap: '5px',
                      transition: 'all 0.2s'
                    }}
                  >
                    <Star size={14} fill={reviewRating >= star.val ? 'white' : 'none'} /> {star.val}
                  </button>
                ))}
              </div>
              <div style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '15px' }}>
                {reviewRating === 1 && 'Sizning bahoingiz: Juda yomon'}
                {reviewRating === 2 && 'Sizning bahoingiz: Sal yaxshiroq'}
                {reviewRating === 3 && 'Sizning bahoingiz: Bo\'ladi'}
                {reviewRating === 4 && 'Sizning bahoingiz: Yaxshi'}
                {reviewRating === 5 && 'Sizning bahoingiz: Judaham zo\'r'}
              </div>
              
              <textarea 
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                placeholder="Dacha haqida taassurotlaringizni yozing..."
                style={{ width: '100%', minHeight: '100px', padding: '15px', borderRadius: '12px', border: '1px solid #cbd5e1', marginBottom: '15px', resize: 'vertical' }}
              />
              <button 
                onClick={handleSubmitReview}
                disabled={isSubmittingReview || reviewRating === 0 || !reviewText.trim()}
                className="btn-primary" 
                style={{ width: '100%' }}
              >
                {isSubmittingReview ? 'Yuborilmoqda...' : 'Fikrni yuborish'}
              </button>
            </div>

            <div>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '15px' }}>Barcha fikrlar ({reviewModalDacha.reviews ? JSON.parse(reviewModalDacha.reviews).length : 0})</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                {reviewModalDacha.reviews && JSON.parse(reviewModalDacha.reviews).length > 0 ? (
                  JSON.parse(reviewModalDacha.reviews).reverse().map((review, idx) => (
                    <div key={idx} style={{ background: '#f1f5f9', padding: '15px', borderRadius: '12px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <span style={{ fontWeight: '700', color: 'var(--primary)' }}>{review.userName}</span>
                        <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{new Date(review.date).toLocaleDateString()}</span>
                      </div>
                      <div style={{ display: 'flex', gap: '2px', marginBottom: '10px' }}>
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} size={14} color="#fbbf24" fill={i < review.rating ? '#fbbf24' : 'none'} />
                        ))}
                      </div>
                      <p style={{ color: '#475569', fontSize: '0.95rem', lineHeight: '1.5' }}>{review.text}</p>
                    </div>
                  ))
                ) : (
                  <p style={{ color: '#94a3b8', textAlign: 'center', padding: '20px' }}>Hozircha fikrlar yo'q. Birinchi bo'lib fikr qoldiring!</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ViewDachas;

