import { Entity, Column, ObjectIdColumn, ObjectId } from 'typeorm';

@Entity()
export class User {
  @ObjectIdColumn()
  id: ObjectId;

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

  @Column({ default: false })
  isVerified: boolean;
}
