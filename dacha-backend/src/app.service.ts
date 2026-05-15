import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Dacha } from './dacha.entity';
import { User } from './user.entity';
import { Settings } from './settings.entity';
import { Booking } from './booking.entity';
import axios from 'axios';
import { Cron } from '@nestjs/schedule';
import FormData = require('form-data');

@Injectable()
export class AppService implements OnModuleInit {
  constructor(
    @InjectRepository(Dacha)
    private dachaRepository: Repository<Dacha>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Settings)
    private settingsRepository: Repository<Settings>,
    @InjectRepository(Booking)
    private bookingRepository: Repository<Booking>,
  ) {}

  async onModuleInit() {
    try {
      const settings = await this.getSettings();
      await axios.get(`https://api.telegram.org/bot${settings.botToken}/deleteWebhook`);
    } catch (e) {
      // Ignore errors if no webhook was set
    }
    this.pollTelegramUpdates();
  }

  private lastUpdateId = 0;

  // Poll Telegram every 3 seconds for new contact shares
  @Cron('*/3 * * * * *')
  async pollTelegramUpdates(): Promise<void> {
    try {
      const settings = await this.getSettings();
      const botToken = settings.botToken;

      const response = await axios.get(
        `https://api.telegram.org/bot${botToken}/getUpdates?offset=${this.lastUpdateId + 1}&limit=20&timeout=0`
      );
      const updates = response.data.result || [];

      for (const update of updates) {
        if (update.update_id > this.lastUpdateId) {
          this.lastUpdateId = update.update_id;
        }

        const message = update.message;
        if (!message) continue;

        const chatId = message.chat.id.toString();
        const text = message.text || '';

        // Handle /start
        if (text === '/start' || text.startsWith('/start ')) {
          await axios.post(`https://api.telegram.org/bot${botToken}/sendMessage`, {
            chat_id: chatId,
            text: '🏠 *Dacha Tour* ☑️ ga xush kelibsiz!\n\nTasdiqlash kodingizni olish uchun telefon raqamingizni ulashing:',
            parse_mode: 'Markdown',
            reply_markup: {
              keyboard: [[{ text: '📱 Telefon raqamimni ulashish', request_contact: true }]],
              resize_keyboard: true,
              one_time_keyboard: true
            }
          });
          continue;
        }

        // Handle contact share
        if (message.contact) {
          const sharedPhone = message.contact.phone_number.replace(/\D/g, '');
          const allUsers = await this.userRepository.find();
          const matchedUser = allUsers.find(u => {
            const uPhone = u.phone.replace(/\D/g, '');
            return uPhone.includes(sharedPhone) || sharedPhone.includes(uPhone);
          });

          if (matchedUser) {
            matchedUser.chatId = chatId;
            await this.userRepository.save(matchedUser);

            if (matchedUser.verificationCode) {
              await axios.post(`https://api.telegram.org/bot${botToken}/sendMessage`, {
                chat_id: chatId,
                text: `✅ *Dacha Tour* ✅ tasdiqlash kodi:\n\n*${matchedUser.verificationCode}*\n\nUshbu kodni saytga kiriting.`,
                parse_mode: 'Markdown',
                reply_markup: { remove_keyboard: true }
              });
            } else {
              await axios.post(`https://api.telegram.org/bot${botToken}/sendMessage`, {
                chat_id: chatId,
                text: '✅ Raqamingiz saqlandi! Endi saytda kod so\'rang.',
                reply_markup: { remove_keyboard: true }
              });
            }
          } else {
            await axios.post(`https://api.telegram.org/bot${botToken}/sendMessage`, {
              chat_id: chatId,
              text: '⚠️ Bu raqam tizimda topilmadi. Avval saytda ism va raqamingizni kiriting!',
              reply_markup: { remove_keyboard: true }
            });
          }
        }
      }
    } catch (e) {
      console.error('Polling error:', e.message, e.response?.data);
    }
  }

  async handleTelegramWebhook(body: any): Promise<any> {
    const settings = await this.getSettings();
    const botToken = settings.botToken;
    const message = body.message || body.edited_message;
    if (!message) return { ok: true };

    const chatId = message.chat.id.toString();
    const text = message.text || '';

    // Extract custom emoji ID if user sends one (to help them find the ID for the verified badge)
    if (message.entities) {
      const customEmojiEntity = message.entities.find(e => e.type === 'custom_emoji');
      if (customEmojiEntity && customEmojiEntity.custom_emoji_id) {
        await axios.post(`https://api.telegram.org/bot${botToken}/sendMessage`, {
          chat_id: chatId,
          text: `Siz yuborgan maxsus stikerning kodi:\n\n\`${customEmojiEntity.custom_emoji_id}\`\n\nShu kodni menga (chatga) yuboring!`,
          parse_mode: 'Markdown'
        });
        return { ok: true };
      }
    }

    // If /start command - send button to share phone
    if (text === '/start' || text.startsWith('/start')) {
      await axios.post(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        chat_id: chatId,
        text: '🏠 *Dacha Tour* ✅ ga xush kelibsiz!\n\nTasdiqlash kodingizni olish uchun telefon raqamingizni ulashing:',
        parse_mode: 'Markdown',
        reply_markup: {
          keyboard: [[{
            text: '📱 Telefon raqamimni ulashish',
            request_contact: true
          }]],
          resize_keyboard: true,
          one_time_keyboard: true
        }
      });
      return { ok: true };
    }

    // If user shared their phone contact
    if (message.contact) {
      const sharedPhone = message.contact.phone_number.replace(/\D/g, '');

      // Save chatId to user
      const allUsers = await this.userRepository.find();
      const matchedUser = allUsers.find(u => {
        const uPhone = u.phone.replace(/\D/g, '');
        return uPhone.includes(sharedPhone) || sharedPhone.includes(uPhone);
      });

      if (matchedUser) {
        matchedUser.chatId = chatId;
        await this.userRepository.save(matchedUser);

        if (matchedUser.verificationCode) {
          await axios.post(`https://api.telegram.org/bot${botToken}/sendMessage`, {
            chat_id: chatId,
            text: `✅ Tasdiqlash kodingiz:\n\n🔢 \`${matchedUser.verificationCode}\`\n\nUshbu kodni saytga kiriting.`,
            parse_mode: 'Markdown',
            reply_markup: { remove_keyboard: true }
          });
        } else {
          await axios.post(`https://api.telegram.org/bot${botToken}/sendMessage`, {
            chat_id: chatId,
            text: '✅ Raqamingiz saqlandi! Endi saytda raqamingizni kiritib, kod so\'rang.',
            reply_markup: { remove_keyboard: true }
          });
        }
      } else {
        await axios.post(`https://api.telegram.org/bot${botToken}/sendMessage`, {
          chat_id: chatId,
          text: '⚠️ Bu raqam tizimda topilmadi. Avval saytda ro\'yxatdan o\'ting!',
          reply_markup: { remove_keyboard: true }
        });
      }
      return { ok: true };
    }

    return { ok: true };
  }

  async requestCode(name: string, surname: string, phone: string, role: string = 'buyer'): Promise<{ success: boolean; message: string }> {
    // 1. Generate 6-digit random code
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    // 2. Find or Create User & save code
    let user = await this.userRepository.findOne({ where: { phone } });
    const isNewUser = !user;

    if (!user) {
      user = this.userRepository.create({ name, surname, phone, role });
    } else {
      user.name = name;
      user.surname = surname;
      user.role = role;
    }
    user.verificationCode = code;
    await this.userRepository.save(user);

    // Notify Admin about new registration or role update
    try {
      const settings = await this.getSettings();
      const roleText = role === 'seller' ? '🏘 Sotuvchi' : '🛒 Sotib oluvchi';
      const statusText = isNewUser ? '🆕 Yangi ro\'yxatdan o\'tish' : '🔄 Profil yangilandi';
      
      await axios.post(`https://api.telegram.org/bot${settings.botToken}/sendMessage`, {
        chat_id: settings.adminChatId,
        text: `👤 *${statusText}*\n\n👤 Ism: ${name} ${surname}\n📞 Tel: ${phone}\n🎭 Rol: *${roleText}*\n\n#foydalanuvchi`,
        parse_mode: 'Markdown',
      });
    } catch (e) {
      console.error('Admin notification error:', e.message);
    }

    // 3. If user already linked their Telegram - send code immediately
    if (user.chatId) {
      const settings = await this.getSettings();
      try {
        await axios.post(`https://api.telegram.org/bot${settings.botToken}/sendMessage`, {
          chat_id: user.chatId,
          text: `🔐 *Dacha Tour* ✅\n\nSizning tasdiqlash kodingiz:\n\n*${code}*\n\nUshbu kodni saytga kiriting.`,
          parse_mode: 'Markdown',
        });
        return { success: true, message: 'Kod Telegramingizga yuborildi! ✅' };
      } catch (e) {
        console.error('Send code error:', e.message);
      }
    }

    // 4. User not linked yet - instruct them to open the bot
    // The polling job will send the code automatically when they share their contact
    return {
      success: true,
      message: 'BOT_REDIRECT' // Frontend will show bot instructions
    };
  }

  async verifyCode(phone: string, code: string): Promise<{ success: boolean; user?: any; message?: string }> {
    const user = await this.userRepository.findOne({ where: { phone, verificationCode: code } });
    if (user) {
      user.isVerified = true;
      user.verificationCode = null; // Clear code after use
      await this.userRepository.save(user);
      return { success: true, user };
    }
    return { success: false, message: 'Noto\'g\'ri kod kiritildi!' };
  }

  async findAll(): Promise<any[]> {
    const dachas = await this.dachaRepository.find();
    const users = await this.userRepository.find();
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    return Promise.all(dachas.map(async d => {
      let calendar = JSON.parse(d.calendar);
      const updatedDate = new Date(d.updatedAt || d.createdAt);
      const ownerProfile = users.find(u => u.phone === d.phone);
      
      if (updatedDate.getMonth() !== currentMonth || updatedDate.getFullYear() !== currentYear) {
        for (const day in calendar) {
          if (calendar[day]) calendar[day].status = 'free';
        }
        d.calendar = JSON.stringify(calendar);
        await this.dachaRepository.save(d);
      }

      let likes: string[] = [];
      try {
        likes = d.storyLikes ? JSON.parse(d.storyLikes) : [];
      } catch (e) { likes = []; }

      const likers = users.filter(u => likes.includes(u.phone)).map(u => ({
        name: u.name,
        surname: u.surname,
        phone: u.phone,
        avatarUrl: u.avatarUrl
      }));

      return {
        ...d,
        photos: JSON.parse(d.photos),
        calendar: calendar,
        amenities: JSON.parse(d.amenities),
        ownerProfile: ownerProfile || null,
        likers: likers
      } as any;
    }));
  }

  async create(data: any): Promise<any> {
    const dacha = this.dachaRepository.create({
      ...data,
      dachaName: data.owner.dachaName,
      ownerName: data.owner.ownerName,
      ownerSurname: data.owner.ownerSurname,
      phone: data.owner.phone,
      capacity: parseInt(data.owner.capacity),
      guestType: data.owner.guestType,
      photos: JSON.stringify(data.photos),
      calendar: JSON.stringify(data.calendar),
      amenities: JSON.stringify(data.amenities),
      latitude: parseFloat(data.owner.latitude),
      longitude: parseFloat(data.owner.longitude),
    });
    const savedDacha = await this.dachaRepository.save(dacha);

    // Send Telegram Notification
    try {
      const settings = await this.getSettings();
      const botToken = settings.botToken;
      const chatId = settings.adminChatId;
      const now = new Date();
      const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
      const dateStr = `${now.getDate()}/${now.getMonth() + 1}/${now.getFullYear()}`;

      const locationLink = data.owner.latitude 
        ? `📍 [Xaritada ko'rish](https://www.google.com/maps?q=${data.owner.latitude},${data.owner.longitude})`
        : '📍 Lokatsiya belgilanmagan';

      const AMENITIES_DICT = {
        wifi: 'Wi-Fi',
        ac: 'Konditsioner',
        tv: 'Televizor',
        pool_summer: 'Basseyn (Yozgi)',
        pool_winter: 'Basseyn (Qishgi)',
        tennis: 'Stol tennisi',
        billiards: 'Bilyard',
        sauna: 'Sauna',
        cinema: 'Kinoteatr',
        bowling: 'Bovling',
        tapchan: 'Tapchan',
        computer: 'Kompyuter',
        playstation: 'PlayStation'
      };

      const selectedAmenities = Object.keys(data.amenities || {})
        .filter(key => data.amenities[key])
        .map(key => AMENITIES_DICT[key])
        .filter(Boolean);

      const amenitiesText = selectedAmenities.length > 0 
        ? `\n✨ *Qulayliklar:*\n▪️ ${selectedAmenities.join('\n▪️ ')}` 
        : '';

      const message = `
🏠 *Yangi Dacha Qo'shildi!*

📍 *Nomi:* ${data.owner.dachaName}
👤 *Egasining Ismi:* ${data.owner.ownerName}
👤 *Egasining Familiyasi:* ${data.owner.ownerSurname}
📞 *Telefon:* ${data.owner.phone}
👥 *Sig'imi:* ${data.owner.capacity} kishi
👨‍👩‍👧‍👦 *Mehmonlar turi:* ${data.owner.guestType === 'family' ? 'Faqat Oila' : 'Ulfatlar'}
📸 *Rasmlar soni:* ${data.photos.length} ta
⏰ *Vaqt:* ${dateStr} | ${timeStr}
${amenitiesText}

${locationLink}

✅ *Ma'lumotlar muvaffaqiyatli saqlandi!*
      `;

      await axios.post(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        chat_id: chatId,
        text: message,
        parse_mode: 'Markdown',
      });

      // --- Post to Telegram Channel ---
      await this.sendDachaToChannel(savedDacha as any, 'new');

    } catch (error) {
      console.error('Telegram notification error:', error.response?.data || error.message);
    }

    return savedDacha;
  }

  async update(id: string, data: any): Promise<void> {
    const oldDacha = await this.dachaRepository.findOne({ where: { id: Number(id) as any } });
    const oldCalendar = oldDacha ? JSON.parse(oldDacha.calendar) : {};

    const dachaName = data.owner?.dachaName || data.dachaName;
    const ownerName = data.owner?.ownerName || data.ownerName;
    const ownerSurname = data.owner?.ownerSurname || data.ownerSurname;
    const phone = data.owner?.phone || data.phone;
    const capacity = data.owner?.capacity || data.capacity;
    const guestType = data.owner?.guestType || data.guestType;
    const photos = data.photos;
    const calendar = data.calendar;
    const amenities = data.amenities;

    await this.dachaRepository.update(Number(id), {
      dachaName,
      ownerName,
      ownerSurname,
      phone,
      capacity: capacity ? parseInt(capacity.toString()) : undefined,
      guestType,
      photos: photos ? JSON.stringify(photos) : undefined,
      calendar: calendar ? JSON.stringify(calendar) : undefined,
      amenities: amenities ? JSON.stringify(amenities) : undefined,
    });

    // Check for new bookings
    if (calendar) {
      const today = new Date().getDate();
      // If any day was changed from free/undefined to occupied
      const wasJustBooked = Object.keys(calendar).some(day => 
        calendar[day].status === 'occupied' && (!oldCalendar[day] || oldCalendar[day].status === 'free')
      );

      if (wasJustBooked) {
        const updatedDacha = await this.dachaRepository.findOne({ where: { id: Number(id) as any } });
        if (updatedDacha) {
          await this.sendDachaToChannel(updatedDacha, 'booking');
        }
      }
    }
  }

  async remove(id: string): Promise<void> {
    await this.dachaRepository.delete(Number(id));
  }

  @Cron('0 0 9,12,17,18,19 * * *')
  async handleScheduledPosts() {
    try {
      const dachas = await this.dachaRepository.find();
      const now = new Date();
      const today = now.getDate();
      const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000).getDate();
      const currentHour = now.getHours();

      for (const d of dachas) {
        const calendar = JSON.parse(d.calendar);
        const todayStatus = calendar[today]?.status || 'free';
        const tomorrowStatus = calendar[tomorrow]?.status || 'free';

        let shouldPost = false;

        // Morning/Noon: Post if free today
        if (currentHour < 15) {
          if (todayStatus === 'free') shouldPost = true;
        } 
        // Evening: Post if free today OR free tomorrow
        else {
          if (todayStatus === 'free' || tomorrowStatus === 'free') shouldPost = true;
        }

        if (shouldPost) {
          await this.sendDachaToChannel(d, 'free');
          // Wait a bit between posts to avoid Telegram rate limits
          await new Promise(resolve => setTimeout(resolve, 5000));
        }
      }
    } catch (error) {
      console.error('Scheduled post error:', error.message);
    }
  }
  async updateUserProfile(phone: string, data: any): Promise<User> {
    const user = await this.userRepository.findOne({ where: { phone } });
    if (!user) throw new Error('User not found');
    if (data.name) user.name = data.name;
    if (data.surname) user.surname = data.surname;
    if (data.avatarUrl !== undefined) user.avatarUrl = data.avatarUrl;
    return this.userRepository.save(user);
  }

  async updateDachaStory(id: string, storyUrl: string): Promise<Dacha> {
    const dacha = await this.dachaRepository.findOne({ where: { id: Number(id) as any } });
    if (!dacha) throw new Error('Dacha not found');
    dacha.storyUrl = storyUrl;
    return this.dachaRepository.save(dacha);
  }

  async sendDachaToChannel(d: Dacha, headerType: 'new' | 'free' | 'booking' = 'free') {
    try {
      const settings = await this.getSettings();
      const botToken = settings.botToken;
      const channelId = settings.channelId;
      const photos = JSON.parse(d.photos);
      const amenities = JSON.parse(d.amenities);
      const calendar = JSON.parse(d.calendar);
      const today = new Date().getDate();

      const AMENITIES_DICT = {
        wifi: 'Wi-Fi',
        ac: 'Konditsioner',
        tv: 'Televizor',
        pool_summer: 'Basseyn (Yozgi)',
        pool_winter: 'Basseyn (Qishgi)',
        tennis: 'Stol tennisi',
        billiards: 'Bilyard',
        sauna: 'Sauna',
        cinema: 'Kinoteatr',
        bowling: 'Bovling',
        tapchan: 'Tapchan',
        computer: 'Kompyuter',
        playstation: 'PlayStation'
      };

      const selectedAmenities = Object.keys(amenities || {})
        .filter(key => amenities[key])
        .map(key => AMENITIES_DICT[key])
        .filter(Boolean);

      const amenitiesText = selectedAmenities.length > 0 
        ? `\n✨ *Qulayliklar:*\n▪️ ${selectedAmenities.join('\n▪️ ')}` 
        : '';

      const locationLink = d.latitude 
        ? `📍 [Xaritada ko'rish](https://www.google.com/maps?q=${d.latitude},${d.longitude})`
        : '📍 Lokatsiya belgilanmagan';

      let header = `🌟 *DACHA E'LONI!* 🌟\n`;
      if (headerType === 'new') header = `🔥 *YANGI E'LON* 🔥\n▬▬▬▬▬▬▬▬▬▬▬▬▬▬\n`;
      else if (headerType === 'free') header = `🟢 *BUGUN BO'SH* 🟢\n▬▬▬▬▬▬▬▬▬▬▬▬▬▬\n`;
      else if (headerType === 'booking') header = `🔴 *BAND QILINDI* 🔴\n▬▬▬▬▬▬▬▬▬▬▬▬▬▬\n`;

      const caption = `
${header}
📍 *Nomi:* ${d.dachaName}
👥 *Sig'imi:* ${d.capacity} kishi
👨‍👩‍👧‍👦 *Kimlar uchun:* ${d.guestType === 'family' ? 'Faqat Oila' : 'Ulfatlar'}
💵 *Narxi:* ${calendar[today]?.price || 'Kelisuv asosida'}$
${headerType === 'booking' ? '' : amenitiesText}

📞 *Aloqa:* ${d.phone}
👤 *Admin:* ${d.ownerName}

${locationLink}

👉 @dacha_tour_online
      `;

      if (photos && photos.length > 0) {
        if (headerType === 'booking') {
          // Send only the first photo for booking notifications
          const base64Data = photos[0].replace(/^data:image\/\w+;base64,/, "");
          const buffer = Buffer.from(base64Data, 'base64');
          const formData = new FormData();
          formData.append('chat_id', channelId);
          formData.append('photo', buffer, { filename: 'photo.jpg' });
          formData.append('caption', caption);
          formData.append('parse_mode', 'Markdown');
          
          await axios.post(`https://api.telegram.org/bot${botToken}/sendPhoto`, formData, {
            headers: formData.getHeaders(),
          });
          return;
        }

        const formData = new FormData();
        formData.append('chat_id', channelId);
        const mediaArray: any[] = [];
        const photoCount = Math.min(photos.length, 10);
        
        for (let i = 0; i < photoCount; i++) {
          const base64Data = photos[i].replace(/^data:image\/\w+;base64,/, "");
          const buffer = Buffer.from(base64Data, 'base64');
          const filename = `photo${i}.jpg`;
          formData.append(filename, buffer, { filename });
          
          const mediaItem: any = { type: 'photo', media: `attach://${filename}` };
          if (i === 0) {
            mediaItem.caption = caption;
            mediaItem.parse_mode = 'Markdown';
          }
          mediaArray.push(mediaItem);
        }
        
        formData.append('media', JSON.stringify(mediaArray));
        await axios.post(`https://api.telegram.org/bot${botToken}/sendMediaGroup`, formData, {
          headers: formData.getHeaders(),
        });
      } else {
        await axios.post(`https://api.telegram.org/bot${botToken}/sendMessage`, {
          chat_id: channelId,
          text: caption,
          parse_mode: 'Markdown',
        });
      }
    } catch (error) {
      console.error('Error sending dacha to channel:', error.message);
    }
  }

  @Cron('0 9 * * *')
  async handleDailyUpdate() {
    // Keep the existing daily update logic or merge it
    // For now I'll just keep it as is, but it might be redundant if we post individual dachas
  }

  async findAllUsers(): Promise<User[]> {
    return this.userRepository.find();
  }

  async getSettings(): Promise<Settings> {
    let settings = await this.settingsRepository.findOne({ where: { id: 'current' } });
    if (!settings) {
      settings = this.settingsRepository.create({ 
        id: 'current',
        siteName: 'Dacha Tour',
        logoUrl: '/logo.jpg',
        primaryColor: '#0ea5e9',
        botToken: '8585258425:AAHUGMT0RQKS-pU8N8n8v2KsaBs070Mt4NQ',
        channelId: '-1003728376282',
        adminChatId: '6986959848',
        holidayMode: 'none',
        holidayText: ''
      });
      await this.settingsRepository.save(settings);
    }
    return settings;
  }

  async updateSettings(data: Partial<Settings>): Promise<Settings> {
    const settings = await this.getSettings();
    Object.assign(settings, data);
    settings.id = 'current';
    console.log('Saving settings to DB:', settings);
    return this.settingsRepository.save(settings);
  }

  async toggleStoryLike(dachaId: string, phone: string): Promise<any> {
    const dacha = await this.dachaRepository.findOne({ where: { id: Number(dachaId) as any } });
    if (!dacha) throw new Error('Dacha topilmadi');

    let likes: string[] = [];
    try {
      likes = dacha.storyLikes ? JSON.parse(dacha.storyLikes) : [];
    } catch (e) { likes = []; }

    if (likes.includes(phone)) {
      likes = likes.filter(p => p !== phone);
    } else {
      likes.push(phone);
    }

    dacha.storyLikes = JSON.stringify(likes);
    return this.dachaRepository.save(dacha);
  }

  async addReview(dachaId: string, phone: string, rating: number, text: string): Promise<any> {
    const dacha = await this.dachaRepository.findOne({ where: { id: Number(dachaId) as any } });
    if (!dacha) throw new Error('Dacha topilmadi');

    let reviews: any[] = [];
    try {
      reviews = dacha.reviews ? JSON.parse(dacha.reviews) : [];
    } catch (e) { reviews = []; }

    const user = await this.userRepository.findOne({ where: { phone } });
    const userName = user ? user.name : 'Maxfiy foydalanuvchi';

    reviews.push({
      phone,
      userName,
      rating,
      text,
      date: new Date().toISOString()
    });

    dacha.reviews = JSON.stringify(reviews);
    return this.dachaRepository.save(dacha);
  }

  async deleteReview(id: string, index: number): Promise<any> {
    const dacha = await this.dachaRepository.findOne({ where: { id: Number(id) as any } });
    if (!dacha) return null;

    let reviews: any[] = [];
    try {
      reviews = dacha.reviews ? JSON.parse(dacha.reviews) : [];
    } catch (e) { reviews = []; }

    if (index >= 0 && index < reviews.length) {
      reviews.splice(index, 1);
    }

    dacha.reviews = JSON.stringify(reviews);
    return this.dachaRepository.save(dacha);
  }

  async createBooking(data: any): Promise<any> {
    const booking = this.bookingRepository.create({
      ...data,
      bookedDays: JSON.stringify(data.bookedDays),
    });
    const savedBooking = await this.bookingRepository.save(booking);

    // Send Telegram Notifications
    try {
      const settings = await this.getSettings();
      const botToken = settings.botToken;
      const adminChatId = settings.adminChatId;
      const owner = await this.userRepository.findOne({ where: { phone: data.ownerPhone } });
      
      const message = `🔔 *Yangi band qilish so'rovi!*\n\n🏠 *Dacha:* ${data.dachaName}\n👤 *Mijoz:* ${data.customerName}\n📱 *Tel:* ${data.customerPhone}\n📅 *Kunlar:* ${data.bookedDays.join(', ')}\n\n🟢 ${data.checkIn}\n🔴 ${data.checkOut}\n💰 *Jami:* ${data.totalPrice}$`;

      // 1. Notify Owner (if connected)
      if (owner && owner.chatId) {
        await axios.post(`https://api.telegram.org/bot${botToken}/sendMessage`, {
          chat_id: owner.chatId,
          text: message,
          parse_mode: 'Markdown'
        }).catch(e => console.log('Owner notification failed'));
      }

      // 2. Notify Super Admin (always if configured)
      if (adminChatId) {
        await axios.post(`https://api.telegram.org/bot${botToken}/sendMessage`, {
          chat_id: adminChatId,
          text: `🛡️ *ADMIN XABARI*\n\n${message}`,
          parse_mode: 'Markdown'
        }).catch(e => console.log('Admin notification failed'));
      }
    } catch (e) {
      console.error('Failed to send booking notifications:', e);
    }

    return savedBooking;
  }

  async findAllBookings(): Promise<Booking[]> {
    return this.bookingRepository.find({ order: { createdAt: 'DESC' } });
  }
}
