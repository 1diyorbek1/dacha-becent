import React, { useState, useEffect } from 'react';
import api from '../api';
import toast from 'react-hot-toast';
import { Users, Home, Trash2, Settings, ShieldCheck, LogOut, Search, Edit2, MessageSquare, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

function AdminPanel() {
  const [activeTab, setActiveTab] = useState('stats');
  const [users, setUsers] = useState([]);
  const [dachas, setDachas] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [editingDacha, setEditingDacha] = useState(null);
  const [settings, setSettings] = useState({
    siteName: '',
    logoUrl: '',
    primaryColor: '',
    botToken: '',
    channelId: '',
    adminChatId: '',
    channelLink: '',
    holidayMode: 'none',
    holidayText: ''
  });
  const [loading, setLoading] = useState(true);
  const [saveLoading, setSaveLoading] = useState(false);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (localStorage.getItem('isAdmin') !== 'true') {
      navigate('/admin');
      return;
    }
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const dachasRes = await api.get('/api/dachalar');
      setDachas(dachasRes.data);
      
      const settingsRes = await api.get('/api/dachalar/settings');
      setSettings(settingsRes.data);

      try {
        const usersRes = await api.get('/api/dachalar/admin/users');
        setUsers(usersRes.data);
      } catch (e) {
        console.log("Users endpoint error");
      }

      try {
        const bookingsRes = await api.get('/api/dachalar/admin/bookings');
        setBookings(bookingsRes.data);
      } catch (e) {
        console.log("Bookings endpoint error");
      }
      
      setLoading(false);
    } catch (error) {
      toast.error('Ma\'lumotlarni yuklashda xatolik!');
      setLoading(false);
    }
  };

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    setSaveLoading(true);
    try {
      const res = await api.put('/api/dachalar/settings', settings);
      console.log('Update response:', res.data);
      setSettings(res.data);
      toast.success('Sozlamalar saqlandi!');
      setTimeout(() => {
        window.location.reload(); 
      }, 500);
    } catch (e) {
      console.error('Save error details:', e);
      toast.error('Saqlashda xatolik!');
    } finally {
      setSaveLoading(false);
    }
  };

  const handleDeleteDacha = async (id) => {
    if (!window.confirm('Haqiqatdan ham ushbu dachani o\'chirib tashlamoqchimisiz?')) return;
    try {
      await api.delete(`/api/dachalar/${id}`);
      toast.success('Dacha o\'chirildi');
      fetchData();
    } catch (e) {
      toast.error('O\'chirishda xatolik!');
    }
  };

  const handleUpdateDacha = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/api/dachalar/${editingDacha.id}`, editingDacha);
      toast.success('Dacha yangilandi!');
      setEditingDacha(null);
      fetchData();
    } catch (e) {
      toast.error('Yangilashda xatolik!');
    }
  };

  const handleDeleteReview = async (dachaId, index) => {
    if (!window.confirm('Haqiqatdan ham ushbu sharhni o\'chirmoqchimisiz?')) return;
    try {
      await api.delete(`/api/dachalar/${dachaId}/review/${index}`);
      toast.success('Sharh o\'chirildi');
      fetchData();
    } catch (e) {
      toast.error('Sharhni o\'chirishda xatolik!');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('isAdmin');
    navigate('/admin');
  };

  if (loading) return <div style={{ textAlign: 'center', padding: '50px' }}>Yuklanmoqda...</div>;

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <ShieldCheck size={32} color="var(--primary)" />
          <h1 style={{ margin: 0, fontSize: '1.8rem' }}>Super Admin Panel</h1>
          <a href="/" target="_blank" style={{ marginLeft: '20px', fontSize: '0.9rem', color: 'var(--primary)', textDecoration: 'none', fontWeight: '600' }}>Saytni ko'rish 👁️</a>
        </div>
        <button onClick={handleLogout} style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '8px', 
          padding: '8px 15px', 
          background: '#fee2e2', 
          color: '#dc2626', 
          border: 'none', 
          borderRadius: '10px',
          cursor: 'pointer',
          fontWeight: '600'
        }}>
          <LogOut size={18} /> Chiqish
        </button>
      </div>

      <div className="stats-grid" style={{ display: 'flex', gap: '20px', marginBottom: '30px' }}>
        <div onClick={() => setActiveTab('stats')} style={{ 
          flex: 1, padding: '20px', background: 'white', borderRadius: '20px', 
          boxShadow: '0 10px 30px rgba(0,0,0,0.05)', cursor: 'pointer',
          border: activeTab === 'stats' ? '2px solid var(--primary)' : '2px solid transparent'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-muted)' }}>
            <Users size={20} /> Foydalanuvchilar
          </div>
          <div style={{ fontSize: '2rem', fontWeight: '800', marginTop: '10px' }}>{users.length}</div>
        </div>
        <div onClick={() => setActiveTab('dachas')} style={{ 
          flex: 1, padding: '20px', background: 'white', borderRadius: '20px', 
          boxShadow: '0 10px 30px rgba(0,0,0,0.05)', cursor: 'pointer',
          border: activeTab === 'dachas' ? '2px solid var(--primary)' : '2px solid transparent'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-muted)' }}>
            <Home size={20} /> Dachalar
          </div>
          <div style={{ fontSize: '2rem', fontWeight: '800', marginTop: '10px' }}>{dachas.length}</div>
        </div>
        <div onClick={() => setActiveTab('bookings')} style={{ 
          flex: 1, padding: '20px', background: 'white', borderRadius: '20px', 
          boxShadow: '0 10px 30px rgba(0,0,0,0.05)', cursor: 'pointer',
          border: activeTab === 'bookings' ? '2px solid var(--primary)' : '2px solid transparent'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-muted)' }}>
            <ShieldCheck size={20} /> Band qilishlar
          </div>
          <div style={{ fontSize: '2rem', fontWeight: '800', marginTop: '10px' }}>{bookings.length}</div>
        </div>
        <div onClick={() => setActiveTab('reviews')} style={{ 
          flex: 1, padding: '20px', background: 'white', borderRadius: '20px', 
          boxShadow: '0 10px 30px rgba(0,0,0,0.05)', cursor: 'pointer',
          border: activeTab === 'reviews' ? '2px solid var(--primary)' : '2px solid transparent'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-muted)' }}>
            <MessageSquare size={20} /> Sharhlar
          </div>
          <div style={{ fontSize: '2rem', fontWeight: '800', marginTop: '10px' }}>
            {dachas.reduce((acc, d) => acc + (d.reviews ? JSON.parse(d.reviews).length : 0), 0)}
          </div>
        </div>
        <div onClick={() => setActiveTab('settings')} style={{ 
          flex: 1, padding: '20px', background: 'white', borderRadius: '20px', 
          boxShadow: '0 10px 30px rgba(0,0,0,0.05)', cursor: 'pointer',
          border: activeTab === 'settings' ? '2px solid var(--primary)' : '2px solid transparent'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-muted)' }}>
            <Settings size={20} /> Sozlamalar
          </div>
          <div style={{ fontSize: '1.2rem', fontWeight: '700', marginTop: '10px' }}>Tizim</div>
        </div>
      </div>

      <div style={{ background: 'white', padding: '30px', borderRadius: '30px', boxShadow: '0 10px 50px rgba(0,0,0,0.05)' }}>
        {activeTab === 'stats' && (
          <div>
            <h3 style={{ marginBottom: '20px' }}>Barcha Foydalanuvchilar</h3>
            <div className="table-container">
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ textAlign: 'left', borderBottom: '2px solid #f1f5f9' }}>
                    <th style={{ padding: '15px' }}>#</th>
                    <th style={{ padding: '15px' }}>F.I.SH</th>
                    <th style={{ padding: '15px' }}>Telefon</th>
                    <th style={{ padding: '15px' }}>Holat</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u, idx) => (
                    <tr key={u.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '15px' }}>{idx + 1}</td>
                      <td style={{ padding: '15px', fontWeight: '600' }}>{u.name} {u.surname}</td>
                      <td style={{ padding: '15px' }}>{u.phone}</td>
                      <td style={{ padding: '15px' }}>
                        <span style={{ 
                          padding: '4px 10px', borderRadius: '20px', fontSize: '0.8rem',
                          background: u.isVerified ? '#dcfce7' : '#fee2e2',
                          color: u.isVerified ? '#166534' : '#991b1b'
                        }}>
                          {u.isVerified ? 'Tasdiqlangan' : 'Kutilmoqda'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'dachas' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ margin: 0 }}>Dachalar Boshqaruvi</h3>
              <div style={{ position: 'relative' }}>
                <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input 
                  type="text" 
                  placeholder="Dacha nomi yoki egasi..." 
                  style={{ paddingLeft: '40px', width: '250px', marginBottom: 0 }}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>
            <div className="table-container">
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ textAlign: 'left', borderBottom: '2px solid #f1f5f9' }}>
                    <th style={{ padding: '15px' }}>Dacha Nomi</th>
                    <th style={{ padding: '15px' }}>Egasi</th>
                    <th style={{ padding: '15px' }}>Telefon</th>
                    <th style={{ padding: '15px' }}>Amallar</th>
                  </tr>
                </thead>
                <tbody>
                  {dachas.filter(d => 
                    d.dachaName.toLowerCase().includes(search.toLowerCase()) || 
                    d.ownerName.toLowerCase().includes(search.toLowerCase())
                  ).map(d => (
                    <tr key={d.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '15px', fontWeight: '600' }}>{d.dachaName}</td>
                      <td style={{ padding: '15px' }}>{d.ownerName} {d.ownerSurname}</td>
                      <td style={{ padding: '15px' }}>{d.phone}</td>
                      <td style={{ padding: '15px' }}>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button onClick={() => setEditingDacha(d)} style={{ 
                            background: '#f1f5f9', color: '#64748b', border: 'none', 
                            padding: '8px', borderRadius: '8px', cursor: 'pointer' 
                          }}>
                            <Edit2 size={18} />
                          </button>
                          <button onClick={() => handleDeleteDacha(d.id)} style={{ 
                            background: '#fee2e2', color: '#dc2626', border: 'none', 
                            padding: '8px', borderRadius: '8px', cursor: 'pointer' 
                          }}>
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
        {activeTab === 'bookings' && (
          <div>
            <h3 style={{ marginBottom: '20px' }}>Band Qilish So'rovlari</h3>
            <div className="table-container">
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ textAlign: 'left', borderBottom: '2px solid #f1f5f9' }}>
                    <th style={{ padding: '15px' }}>Mijoz</th>
                    <th style={{ padding: '15px' }}>Dacha</th>
                    <th style={{ padding: '15px' }}>Dacha Egasi</th>
                    <th style={{ padding: '15px' }}>Sana & Vaqt</th>
                    <th style={{ padding: '15px' }}>Jami</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map(b => (
                    <tr key={b.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '15px' }}>
                        <div style={{ fontWeight: '600' }}>{b.customerName}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{b.customerPhone}</div>
                      </td>
                      <td style={{ padding: '15px', fontWeight: '600' }}>{b.dachaName}</td>
                      <td style={{ padding: '15px' }}>
                        <div>{b.ownerName}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{b.ownerPhone}</div>
                      </td>
                      <td style={{ padding: '15px', fontSize: '0.9rem' }}>
                        <div>🟢 {b.checkIn}</div>
                        <div>🔴 {b.checkOut}</div>
                        <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '5px' }}>
                          📅 {JSON.parse(b.bookedDays).join(', ')}
                        </div>
                      </td>
                      <td style={{ padding: '15px', fontWeight: '700', color: 'var(--success)' }}>{b.totalPrice}$</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
        
        {activeTab === 'reviews' && (
          <div>
            <h3 style={{ marginBottom: '20px' }}>Dacha Sharhlari Boshqaruvi</h3>
            <div className="table-container">
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ textAlign: 'left', borderBottom: '2px solid #f1f5f9' }}>
                    <th style={{ padding: '15px' }}>Kimdan (Mijoz)</th>
                    <th style={{ padding: '15px' }}>Dacha</th>
                    <th style={{ padding: '15px' }}>Baholash</th>
                    <th style={{ padding: '15px' }}>Fikr (Sharh)</th>
                    <th style={{ padding: '15px' }}>Amallar</th>
                  </tr>
                </thead>
                <tbody>
                  {dachas.flatMap(d => {
                    const reviews = d.reviews ? JSON.parse(d.reviews) : [];
                    return reviews.map((r, idx) => ({ ...r, dachaId: d.id, dachaName: d.dachaName, reviewIndex: idx }));
                  }).sort((a,b) => new Date(b.date) - new Date(a.date)).map((r, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '15px' }}>
                        <div style={{ fontWeight: '600' }}>{r.userName}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{r.phone}</div>
                      </td>
                      <td style={{ padding: '15px', fontWeight: '600' }}>{r.dachaName}</td>
                      <td style={{ padding: '15px' }}>
                        <div style={{ display: 'flex', color: '#fbbf24' }}>
                          {[...Array(5)].map((_, starIdx) => (
                            <Star key={starIdx} size={14} fill={starIdx < r.rating ? "currentColor" : "none"} />
                          ))}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '4px' }}>
                          {new Date(r.date).toLocaleDateString()}
                        </div>
                      </td>
                      <td style={{ padding: '15px', maxWidth: '300px' }}>
                        <div style={{ fontSize: '0.9rem', color: '#475569', fontStyle: 'italic' }}>"{r.text}"</div>
                      </td>
                      <td style={{ padding: '15px' }}>
                        <button onClick={() => handleDeleteReview(r.dachaId, r.reviewIndex)} style={{ 
                          background: '#fee2e2', color: '#dc2626', border: 'none', 
                          padding: '8px', borderRadius: '8px', cursor: 'pointer' 
                        }}>
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div>
            <h3 style={{ marginBottom: '20px' }}>Tizim Sozlamalari</h3>
            <form onSubmit={handleSaveSettings}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div className="form-group">
                  <label style={{ fontWeight: '600', display: 'block', marginBottom: '8px' }}>Sayt Nomi</label>
                  <input 
                    type="text" 
                    value={settings.siteName}
                    onChange={(e) => setSettings({...settings, siteName: e.target.value})}
                    placeholder="Masalan: Dacha Tour"
                  />
                </div>
                <div className="form-group">
                  <label style={{ fontWeight: '600', display: 'block', marginBottom: '8px' }}>Logo URL</label>
                  <input 
                    type="text" 
                    value={settings.logoUrl}
                    onChange={(e) => setSettings({...settings, logoUrl: e.target.value})}
                    placeholder="Logo manzili (masalan: /logo.jpg)"
                  />
                </div>
                <div className="form-group">
                  <label style={{ fontWeight: '600', display: 'block', marginBottom: '8px' }}>Asosiy Rang (Primary Color)</label>
                  <input 
                    type="color" 
                    value={settings.primaryColor}
                    onChange={(e) => setSettings({...settings, primaryColor: e.target.value})}
                    style={{ height: '45px', padding: '5px' }}
                  />
                </div>
                <div className="form-group">
                  <label style={{ fontWeight: '600', display: 'block', marginBottom: '8px' }}>Bot Token</label>
                  <input 
                    type="password" 
                    value={settings.botToken}
                    onChange={(e) => setSettings({...settings, botToken: e.target.value})}
                    placeholder="Telegram Bot Token"
                  />
                </div>
                <div className="form-group">
                  <label style={{ fontWeight: '600', display: 'block', marginBottom: '8px' }}>Kanal ID</label>
                  <input 
                    type="text" 
                    value={settings.channelId}
                    onChange={(e) => setSettings({...settings, channelId: e.target.value})}
                    placeholder="Masalan: -100..."
                  />
                </div>
                <div className="form-group">
                  <label style={{ fontWeight: '600', display: 'block', marginBottom: '8px' }}>Admin Chat ID</label>
                  <input 
                    type="text" 
                    value={settings.adminChatId}
                    onChange={(e) => setSettings({...settings, adminChatId: e.target.value})}
                    placeholder="Shaxsiy ID nima uchun"
                  />
                </div>
                <div className="form-group">
                  <label style={{ fontWeight: '600', display: 'block', marginBottom: '8px' }}>Kanal Linki</label>
                  <input 
                    type="text" 
                    value={settings.channelLink}
                    onChange={(e) => setSettings({...settings, channelLink: e.target.value})}
                    placeholder="Masalan: https://t.me/..."
                  />
                </div>
              </div>

              <hr style={{ margin: '30px 0', border: 'none', borderBottom: '1px solid #f1f5f9' }} />
              
              <h4 style={{ marginBottom: '15px', color: 'var(--primary)' }}>🎁 Bayramlar va Effektlar</h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div className="form-group">
                  <label style={{ fontWeight: '600', display: 'block', marginBottom: '8px' }}>Bayram Rejimi</label>
                  <select 
                    value={settings.holidayMode}
                    onChange={(e) => setSettings({...settings, holidayMode: e.target.value})}
                    style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #e2e8f0' }}
                  >
                    <option value="none">Oddiy kunlar (Effektsiz)</option>
                    <option value="newyear">Yangi Yil 🎄</option>
                    <option value="ramadan">Ramazon 🌙</option>
                    <option value="eid">Hayit Bayrami ✨</option>
                  </select>
                </div>
                <div className="form-group">
                  <label style={{ fontWeight: '600', display: 'block', marginBottom: '8px' }}>Bayram Matni (Yil yoki Tabrik)</label>
                  <input 
                    type="text" 
                    value={settings.holidayText}
                    onChange={(e) => setSettings({...settings, holidayText: e.target.value})}
                    placeholder="Masalan: 2027 yoki Muborak bo'lsin!"
                  />
                </div>
              </div>

              <button 
                className="btn-primary" 
                type="submit" 
                style={{ marginTop: '20px', width: '220px' }}
                disabled={saveLoading}
              >
                {saveLoading ? 'Saqlanmoqda...' : 'Saqlash va Ishga tushirish'}
              </button>
            </form>
          </div>
        )}
      </div>

      {editingDacha && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
          background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center',
          alignItems: 'center', zIndex: 10000
        }}>
          <div style={{ background: 'white', padding: '30px', borderRadius: '25px', width: '400px', boxShadow: '0 20px 50px rgba(0,0,0,0.2)' }}>
            <h3>Dachani Tahrirlash</h3>
            <form onSubmit={handleUpdateDacha}>
              <div className="form-group" style={{ marginBottom: '15px' }}>
                <label>Dacha Nomi</label>
                <input 
                  type="text" 
                  value={editingDacha.dachaName}
                  onChange={(e) => setEditingDacha({...editingDacha, dachaName: e.target.value})}
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
                <div className="form-group">
                  <label>Sig'imi</label>
                  <input 
                    type="number" 
                    value={editingDacha.capacity}
                    onChange={(e) => setEditingDacha({...editingDacha, capacity: parseInt(e.target.value)})}
                  />
                </div>
                <div className="form-group">
                  <label>Mehmonlar</label>
                  <select 
                    value={editingDacha.guestType}
                    onChange={(e) => setEditingDacha({...editingDacha, guestType: e.target.value})}
                    style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #e2e8f0' }}
                  >
                    <option value="family">Faqat Oila uchun</option>
                    <option value="friends">Ulfatlar uchun</option>
                    <option value="both">Oila va ulfatlar uchun</option>
                  </select>
                </div>
              </div>
              <div className="form-group" style={{ marginBottom: '15px' }}>
                <label>Egasining Ismi</label>
                <input 
                  type="text" 
                  value={editingDacha.ownerName}
                  onChange={(e) => setEditingDacha({...editingDacha, ownerName: e.target.value})}
                />
              </div>
              <div className="form-group" style={{ marginBottom: '20px' }}>
                <label>Telefon</label>
                <input 
                  type="text" 
                  value={editingDacha.phone}
                  onChange={(e) => setEditingDacha({...editingDacha, phone: e.target.value})}
                />
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button type="submit" className="btn-primary" style={{ flex: 1 }}>Saqlash</button>
                <button type="button" onClick={() => setEditingDacha(null)} style={{ 
                  flex: 1, padding: '12px', borderRadius: '12px', border: '1px solid #e2e8f0', background: 'none' 
                }}>Bekor qilish</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminPanel;
