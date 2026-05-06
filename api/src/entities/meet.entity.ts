import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  Index,
} from 'typeorm';

@Entity()
export class Meet {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  @Index()
  sourceTffrsMeetId: string;

  @Column()
  name: string;

  @Column({ type: 'date' })
  date: Date;

  @CreateDateColumn()
  createdAt: Date;
}
