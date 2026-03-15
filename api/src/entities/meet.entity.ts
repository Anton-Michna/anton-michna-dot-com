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

  @Column()
  date: string;

  @CreateDateColumn()
  createdAt: Date;
}
