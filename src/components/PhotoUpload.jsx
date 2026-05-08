import React from 'react';
import { Plus } from 'lucide-react';

function PhotoUpload({ photos, setPhotos }) {
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    const availableSlots = 12 - photos.length;
    
    if (availableSlots <= 0) {
      toast.error("Maksimal 12 ta rasm yuklash mumkin!");
      return;
    }

    const filesToUpload = files.slice(0, availableSlots);
    if (files.length > availableSlots) {
      toast.error(`Faqat ${availableSlots} ta rasm qo'shildi. Maksimal limit 12 ta.`);
    }

    filesToUpload.forEach(file => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target.result;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 1200;
          const MAX_HEIGHT = 1200;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          
          // Compress to JPEG with 0.7 quality
          const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
          setPhotos(prev => [...prev, dataUrl]);
        };
      };
      reader.readAsDataURL(file);
    });
  };

  const removePhoto = (index, e) => {
    e.stopPropagation();
    const newPhotos = [...photos];
    newPhotos.splice(index, 1);
    setPhotos(newPhotos);
  };

  return (
    <div className="photo-grid">
      {photos.map((photo, index) => (
        <div key={index} className="photo-slot" style={{ position: 'relative' }}>
          <img src={photo} alt={`Dacha ${index + 1}`} />
          <button 
            onClick={(e) => removePhoto(index, e)}
            style={{
              position: 'absolute',
              top: '5px',
              right: '5px',
              background: 'rgba(239, 71, 111, 0.9)',
              color: 'white',
              border: 'none',
              borderRadius: '50%',
              width: '24px',
              height: '24px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 10,
              fontSize: '12px',
              fontWeight: 'bold'
            }}
          >✕</button>
        </div>
      ))}
      
      {photos.length < 12 && (
        <div 
          className="photo-slot add-more" 
          onClick={() => document.getElementById('multi-upload').click()}
          style={{ border: '3px dashed var(--primary-light)', background: 'rgba(45, 106, 79, 0.05)' }}
        >
          <Plus size={32} color="var(--primary-light)" />
          <span className="photo-label" style={{ color: 'var(--primary-light)', fontWeight: '700' }}>Rasm qo'shish ({photos.length}/12)</span>
          <input 
            type="file" 
            id="multi-upload" 
            accept="image/*" 
            multiple
            style={{ display: 'none' }} 
            onChange={handleFileChange}
          />
        </div>
      )}
    </div>
  );
}

export default PhotoUpload;
