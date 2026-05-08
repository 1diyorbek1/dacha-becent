import { Entity, Column, CreateDateColumn, ObjectIdColumn, ObjectId } from 'typeorm';

@Entity('bookings')
export class Booking {
  @ObjectIdColumn()
  id: ObjectId;

  @Column()
  dachaId: string;

  @Column()
  dachaName: string;

  @Column()
  ownerName: string;

  @Column()
  ownerPhone: string;

  @Column()
  customerName: string;

  @Column()
  customerPhone: string;

  @Column('text')
  bookedDays: string; // JSON string array

  @Column()
  totalPrice: number;

  @Column()
  checkIn: string;

  @Column()
  checkOut: string;

  @Column({ default: 'pending' })
  status: string; // pending, confirmed, cancelled

  @CreateDateColumn()
  createdAt: Date;
}
