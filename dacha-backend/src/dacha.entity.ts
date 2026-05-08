import { Entity, Column, CreateDateColumn, UpdateDateColumn, ObjectIdColumn, ObjectId } from 'typeorm';

@Entity('dachalar')
export class Dacha {
  @ObjectIdColumn()
  id: ObjectId;

  @Column()
  dachaName: string;

  @Column()
  ownerName: string;

  @Column()
  ownerSurname: string;

  @Column()
  phone: string;

  @Column()
  capacity: number;

  @Column()
  guestType: string;

  @Column('text')
  photos: string; // JSON string

  @Column('text')
  calendar: string; // JSON string

  @Column('text')
  amenities: string; // JSON string

  @Column('float', { nullable: true })
  latitude: number;

  @Column('float', { nullable: true })
  longitude: number;

  @Column({ type: 'text', nullable: true })
  storyUrl: string | null;

  @Column({ type: 'text', nullable: true })
  storyLikes: string | null; // JSON array of phone numbers
  @Column({ type: 'text', nullable: true })
  reviews: string | null; // JSON array of reviews

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
