import React, { useState, useEffect } from 'react';
import { User, Phone, Edit2, Save, Trash2, ArrowLeft, Camera, Video, PlayCircle, PlusCircle, LayoutGrid, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import toast from 'react-hot-toast';
import Calendar from '../components/Calendar';
import AmenitiesForm from '../components/AmenitiesForm';
import VerifiedBadge from '../components/VerifiedBadge';

function Cabinet() {
  const navigate = useNavigate();
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')));
  const [myDachas, setMyDachas] = useState([]);
  const [editingDacha, setEditingDacha] = useState(null);
  const [storyModal, setStoryModal] = useState(null); // { type: 'dacha'|'user', id: string, url: string }
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (user?.role === 'seller') {
      fetchMyDachas();
    }
  }, []);

  const fetchMyDachas = async () => {
    try {
      const res = await api.get('/api/dachalar');
      const filtered = res.data.filter(d => d.phone === user?.phone);
      setMyDachas(filtered);
    } catch (error) {
      console.error("Fetch error:", error);
    }
  };

  const handleUpdateAvatar = () => {
    document.getElementById('avatarInput').click();
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Rasm hajmi 5MB dan oshmasligi kerak!");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const img = new Image();
      img.onload = async () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 400;
        let width = img.width;
        let height = img.height;

        if (width > MAX_WIDTH) {
          height *= MAX_WIDTH / width;
          width = MAX_WIDTH;
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        const compressedBase64 = canvas.toDataURL('image/jpeg', 0.8);

        try {
          const res = await api.put('/api/dachalar/user/profile', {
            phone: user.phone,
            data: { avatarUrl: compressedBase64 }
          });
          const updatedUser = { ...user, avatarUrl: res.data.avatarUrl };
          localStorage.setItem('user', JSON.stringify(updatedUser));
          setUser(updatedUser);
          toast.success('Profil rasmi yangilandi!');
        } catch (e) {
          toast.error('Xatolik yuz berdi');
        }
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 60 * 1024 * 1024) {
      toast.error("Fayl hajmi 60MB dan oshmasligi kerak!");
      return;
    }

    setIsUploading(true);
    const reader = new FileReader();
    reader.onloadend = () => {
      setStoryModal(prev => ({ ...prev, url: reader.result }));
      setIsUploading(false);
    };
    reader.readAsDataURL(file);
  };

  const handleSaveStory = async () => {
    if (!storyModal.url) {
      toast.error("Iltimos, avval fayl tanlang!");
      return;
    }
    try {
      if (storyModal.type === 'dacha') {
        await api.put(`/api/dachalar/${storyModal.id}/story`, {
          storyUrl: storyModal.url
        });
        fetchMyDachas();
      } else {
        const res = await api.put('/api/dachalar/user/profile', {
          phone: user.phone,
          data: { storyUrl: storyModal.url }
        });
        const updatedUser = { ...user, storyUrl: res.data.storyUrl };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        setUser(updatedUser);
      }
      toast.success('Story saqlandi!');
      setStoryModal(null);
    } catch (e) {
      toast.error('Xatolik yuz berdi');
    }
  };

  const handleUpdate = async () => {
    try {
      await api.put(`/api/dachalar/${editingDacha.id}`, editingDacha);
      toast.success('O\'zgarishlar saqlandi!');
      setEditingDacha(null);
      fetchMyDachas();
    } catch (e) {
      toast.error('Xatolik yuz berdi');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Haqiqatdan ham ushbu e'lonni o'chirmoqchimisiz?")) {
      try {
        await api.delete(`/api/dachalar/${id}`);
        toast.success('Dacha o\'chirildi!');
        fetchMyDachas();
      } catch (e) {
        toast.error('O\'chirishda xatolik');
      }
    }
  };

  if (!user) {
    return (
      <div className="cabinet-page" style={{ textAlign: 'center', padding: '100px 20px' }}>
        <h2 style={{ color: 'var(--primary)' }}>Siz tizimga kirmagansiz</h2>
        <button onClick={() => navigate('/login')} className="btn-primary" style={{ width: 'auto', marginTop: '20px' }}>Kirish</button>
      </div>
    );
  }

  if (editingDacha) {
    return (
      <div className="cabinet-edit">
        <button onClick={() => setEditingDacha(null)} className="nav-link" style={{ marginBottom: '20px', border: 'none', cursor: 'pointer', background: 'none' }}>
          <ArrowLeft size={18} /> Orqaga qaytish
        </button>
        <div className="card">
          <h2>{(editingDacha.dachaName)} tahrirlash</h2>
          <Calendar 
            data={editingDacha.calendar} 
            setData={(newData) => setEditingDacha(prev => ({ ...prev, calendar: typeof newData === 'function' ? newData(prev.calendar) : newData }))} 
            isEditable={true}
          />
          <AmenitiesForm 
            selectedAmenities={editingDacha.amenities || {}} 
            setSelectedAmenities={(newData) => setEditingDacha(prev => ({ ...prev, amenities: typeof newData === 'function' ? newData(prev.amenities || {}) : newData }))}
          />
          <button className="btn-primary" onClick={handleUpdate} style={{ marginTop: '30px' }}>
            <Save size={20} /> O'zgarishlarni saqlash
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="cabinet-page">
      {/* Profile Header */}
      <div className="card profile-header" style={{ padding: '40px', borderRadius: '30px', marginBottom: '40px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '30px', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative' }}>
            <div style={{ 
              width: '140px', 
              height: '140px', 
              borderRadius: '50%', 
              padding: '4px',
              background: 'linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <div style={{ width: '100%', height: '100%', borderRadius: '50%', border: '4px solid white', overflow: 'hidden', background: '#f1f5f9' }}>
                {user.avatarUrl ? (
                  <img src={user.avatarUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <User size={70} color="#cbd5e1" style={{ margin: '30px auto', display: 'block' }} />
                )}
              </div>
            </div>
            <button onClick={handleUpdateAvatar} className="btn-icon" style={{ position: 'absolute', bottom: '5px', right: '5px', background: 'var(--primary)', color: 'white', border: '3px solid white', width: '40px', height: '40px', borderRadius: '50%' }}>
              <Camera size={20} />
            </button>
            <input type="file" id="avatarInput" hidden accept="image/*" onChange={handleAvatarChange} />
          </div>
          
          <div style={{ flex: 1 }}>
            <h1 style={{ marginBottom: '8px', fontSize: '2rem', fontWeight: '800' }}>
              {user.name} {user.surname} <VerifiedBadge size={24} />
            </h1>
            <div style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.1rem' }}>
              <Phone size={18} /> {user.phone}
            </div>
            <div style={{ marginTop: '15px', display: 'flex', gap: '15px' }}>
               <span style={{ 
                 padding: '8px 16px', 
                 borderRadius: '12px', 
                 background: user.role === 'seller' ? '#f0f9ff' : '#f0fdf4',
                 color: user.role === 'seller' ? '#0284c7' : '#16a34a',
                 fontWeight: '800',
                 fontSize: '0.9rem'
               }}>
                 {user.role === 'seller' ? '🏘 Sotuvchi' : '🛒 Sotib oluvchi'}
               </span>
            </div>
          </div>
        </div>
      </div>

      {/* Role Specific Content */}
      {user.role === 'buyer' ? (
        <div className="buyer-dashboard">
          <div className="card" style={{ padding: '30px', borderRadius: '24px' }}>
            <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '25px' }}>
              <Video size={24} color="var(--primary)" /> Mening istoriyam
            </h2>
            <div style={{ 
              width: '100%', 
              maxWidth: '320px', 
              aspectRatio: '9/16', 
              borderRadius: '24px', 
              overflow: 'hidden', 
              background: '#f8fafc', 
              border: '2px dashed #cbd5e1',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative'
            }}>
              {user.storyUrl ? (
                <>
                  <video src={user.storyUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} autoPlay muted loop />
                  <div style={{ position: 'absolute', bottom: '20px', left: '20px', right: '20px', display: 'flex', gap: '10px' }}>
                    <button onClick={() => setStoryModal({ type: 'user', id: user.phone, url: user.storyUrl })} className="btn-primary" style={{ background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.3)', color: 'white' }}>
                      O'zgartirish
                    </button>
                  </div>
                </>
              ) : (
                <button onClick={() => setStoryModal({ type: 'user', id: user.phone, url: '' })} style={{ background: 'none', border: 'none', cursor: 'pointer', textAlign: 'center' }}>
                  <div style={{ width: '70px', height: '70px', borderRadius: '50%', background: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 15px' }}>
                    <PlusCircle size={35} color="#64748b" />
                  </div>
                  <span style={{ fontWeight: '700', color: '#64748b' }}>Video qo'shish</span>
                </button>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="seller-dashboard">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
            <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <LayoutGrid size={24} color="var(--primary)" /> Mening e'lonlarim
            </h2>
            <button className="btn-primary" onClick={() => navigate('/add')} style={{ width: 'auto', padding: '12px 25px' }}>
              <PlusCircle size={20} /> Yangi qo'shish
            </button>
          </div>
          
          {myDachas.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: '60px' }}>
              <p style={{ color: '#64748b', fontSize: '1.1rem' }}>Sizda hali e'lonlar yo'q.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {myDachas.map(dacha => {
                let mainPhoto = '/logo.jpg';
                try {
                  const photos = typeof dacha.photos === 'string' ? JSON.parse(dacha.photos) : dacha.photos;
                  if (photos && photos.length > 0) mainPhoto = photos[0];
                } catch (e) {
                  console.error("Photo parse error");
                }

                return (
                  <div key={dacha.id} className="card" style={{ display: 'flex', gap: '20px', padding: '25px', alignItems: 'center' }}>
                    <img src={mainPhoto} alt="" style={{ width: '100px', height: '100px', borderRadius: '20px', objectFit: 'cover' }} />
                    <div style={{ flex: 1 }}>
                      <h3 style={{ margin: 0, fontSize: '1.4rem' }}>{dacha.dachaName}</h3>
                      <p style={{ margin: '5px 0', color: '#64748b' }}>{dacha.capacity} kishilik • {dacha.guestType}</p>
                    </div>
                    <div style={{ display: 'flex', gap: '12px' }}>
                      <button className="btn-icon" onClick={() => setStoryModal({ type: 'dacha', id: dacha.id, url: dacha.storyUrl || '' })} title="Story">
                        <Video size={22} color={dacha.storyUrl ? 'var(--success)' : '#64748b'} />
                      </button>
                      <button className="btn-icon" onClick={() => setEditingDacha(dacha)} title="Tahrirlash">
                        <Edit2 size={22} color="var(--primary)" />
                      </button>
                      <button className="btn-icon danger" onClick={() => handleDelete(dacha.id)} title="O'chirish">
                        <Trash2 size={22} color="#e11d48" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Unified Story Modal */}
      {storyModal && (
        <div className="modal-overlay" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(15px)', zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div className="card" style={{ maxWidth: '420px', width: '100%', textAlign: 'center', padding: '40px', borderRadius: '32px' }}>
            <div style={{ background: 'var(--primary)', width: '70px', height: '70px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 25px', color: 'white' }}>
              <Video size={35} />
            </div>
            <h3 style={{ fontSize: '1.6rem', fontWeight: '800' }}>Fayl yuklash</h3>
            <p style={{ color: 'var(--text-muted)', marginBottom: '30px' }}>Galereyadan video yoki rasm tanlang.</p>
            
            <div className="upload-zone" style={{ 
              border: '3px dashed #e2e8f0', borderRadius: '24px', padding: '40px', marginBottom: '30px',
              background: storyModal.url ? '#f0fdf4' : '#f8fafc',
              position: 'relative',
              transition: 'all 0.3s ease'
            }}>
              {isUploading ? (
                <div style={{ color: 'var(--primary)', fontWeight: '800' }}>Yuklanmoqda...</div>
              ) : storyModal.url ? (
                <div style={{ color: 'var(--success)', fontWeight: '800' }}>
                   Tayyor! ✅
                </div>
              ) : (
                <div style={{ color: '#94a3b8', fontWeight: '600' }}>Tanlash uchun bosing</div>
              )}
              <input type="file" accept="video/*,image/*" onChange={handleFileSelect} style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer' }} />
            </div>

            <div style={{ display: 'flex', gap: '15px' }}>
              <button className="btn-primary" style={{ flex: 2, padding: '16px' }} onClick={handleSaveStory} disabled={isUploading}>
                {isUploading ? 'Kuting...' : 'Saqlash'}
              </button>
              <button className="btn-primary" style={{ flex: 1, background: '#f1f5f9', color: '#64748b', padding: '16px' }} onClick={() => setStoryModal(null)}>Bekor qilish</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Cabinet;


