import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('settings')
export class Settings {
  @PrimaryGeneratedColumn()
  _id: number;

  @Column()
  id: string; // 'current'

  @Column({ default: 'Dacha Tour' })
  siteName: string;

  @Column({ default: '/logo.jpg' })
  logoUrl: string;

  @Column({ default: '#0ea5e9' })
  primaryColor: string;

  @Column({ default: '8585258425:AAHUGMT0RQKS-pU8N8n8v2KsaBs070Mt4NQ' })
  botToken: string;

  @Column({ default: '-1003728376282' })
  channelId: string;

  @Column({ default: '6986959848' })
  adminChatId: string;

  @Column({ default: 'none' })
  holidayMode: string; // 'none', 'newyear', 'ramadan', 'eid'

  @Column({ default: '' })
  holidayText: string;
}
