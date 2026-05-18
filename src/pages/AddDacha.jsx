import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import toast from 'react-hot-toast';
import { User, Camera, Calendar as CalendarIcon, Save, CheckCircle2, Info } from 'lucide-react';
import OwnerForm from '../components/OwnerForm';
import PhotoUpload from '../components/PhotoUpload';
import Calendar from '../components/Calendar';
import AmenitiesForm from '../components/AmenitiesForm';

function AddDacha() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));
  
  const [ownerData, setOwnerData] = useState({ 
    dachaName: '', 
    phone: user?.phone || '', 
    capacity: '', 
    guestType: '', 
    ownerName: user?.name || '', 
    ownerSurname: user?.surname || '' 
  });
  const [photos, setPhotos] = useState([]);
  const [calendarData, setCalendarData] = useState({});
  const [amenitiesData, setAmenitiesData] = useState({});
  const [showSubModal, setShowSubModal] = useState(false);
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

  React.useEffect(() => {
    if (!user) {
      toast.error('Dacha qo\'shish uchun avval tizimga kiring!');
      navigate('/login');
    }
  }, [user, navigate]);

  const handleSave = async () => {
    // 1. Validation with specific feedback
    if (!ownerData.dachaName) { toast.error("Dacha nomini kiriting!"); return; }
    if (!ownerData.ownerName) { toast.error("Ismingizni kiriting!"); return; }
    if (!ownerData.ownerSurname) { toast.error("Familiyangizni kiriting!"); return; }
    if (!ownerData.phone) { toast.error("Telefon raqamini kiriting!"); return; }
    if (!ownerData.capacity) { toast.error("Sig'imini (kishi soni) kiriting!"); return; }
    if (!ownerData.guestType) { toast.error("Mehmonlar turini (Oila/Ulfat) tanlang!"); return; }

    const uploadedPhotosCount = photos.length;
    if (uploadedPhotosCount < 5) {
      toast.error(`Siz kamida 5 ta rasm yuklashingiz shart! (Hozir ${uploadedPhotosCount} ta yuklandi)`);
      return;
    }

    const today = new Date().getDate();
    const calendarEntries = Object.entries(calendarData);
    const futureDays = calendarEntries.filter(([day]) => parseInt(day) >= today);
    const missingPrices = futureDays.filter(([_, info]) => !info.price || info.price.toString().trim() === '');

    if (missingPrices.length > 0) {
      toast.error(`Iltimos, bugungi va kelajakdagi barcha kunlar uchun narxlarni kiriting!`);
      return;
    }

    const savePromise = new Promise(async (resolve, reject) => {
      try {
        const newDacha = {
          owner: ownerData,
          photos: photos,
          calendar: calendarData,
          amenities: amenitiesData,
          createdAt: new Date().toISOString()
        };

        const response = await api.post('/api/dachalar', newDacha);

        if (response.status !== 200 && response.status !== 201) throw new Error('Server error');
        
        resolve();
        setTimeout(() => navigate('/browse'), 1500);
      } catch (error) {
        console.error("Save error:", error);
        reject(error);
      }
    });

    toast.promise(savePromise, {
      loading: 'Dacha saqlanmoqda (bu bir oz vaqt olishi mumkin)...',
      success: "Dacha muvaffaqiyatli qo'shildi!",
      error: 'Xatolik: Serverga ulanib bo\'lmadi. Server yoqilganligini tekshiring.',
    });
  };

  return (
    <div className="add-dacha-page">
      <div className="card">
        <div className="section-title"><User size={20} /> Dacha ma'lumotlari (Majburiy)</div>
        <OwnerForm data={ownerData} setData={setOwnerData} />
      </div>

      <div className="card">
        <div className="section-title"><Camera size={20} /> Dacha rasmlari (Kamida bitta majburiy)</div>
        <PhotoUpload photos={photos} setPhotos={setPhotos} />
      </div>

      <div className="card">
        <div className="section-title"><CalendarIcon size={20} /> Bandlik va Narxlar Kalendari</div>
        <Calendar data={calendarData} setData={setCalendarData} />
      </div>

      <div className="card">
        <div className="section-title"><CalendarIcon size={20} /> Qulayliklar</div>
        <AmenitiesForm selectedAmenities={amenitiesData} setSelectedAmenities={setAmenitiesData} />
      </div>

      <button className="btn-primary" onClick={handleSave}>
        <Save size={24} /> Saqlash va Bo'sh kunlarni ko'rishga o'tish
      </button>
    </div>
  );
}

export default AddDacha;
