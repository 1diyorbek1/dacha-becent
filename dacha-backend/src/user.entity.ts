import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  surname: string;

  @Column()
  phone: string;

  @Column({ type: 'varchar', nullable: true })
  chatId: string | null;

  @Column({ type: 'varchar', nullable: true })
  verificationCode: string | null;

  @Column({ type: 'text', nullable: true })
  avatarUrl: string | null;

  @Column({ default: 'buyer' })
  role: string; // 'buyer' or 'seller'

  @Column({ default: false })
  isVerified: boolean;

  @Column({ type: 'text', nullable: true })
  storyUrl: string | null;

  @Column({ default: false })
  isSubscribed: boolean;

  @Column({ type: 'datetime', nullable: true })
  lastSubscribedCheck: Date | null;
}
