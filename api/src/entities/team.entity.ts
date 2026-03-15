import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';

@Entity()
export class Team {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  @Index()
  sourceTffrsId: string;

  @Column()
  name: string;

  @Column()
  gender: string;

  @Column()
  sport: string;

  @CreateDateColumn()
  createdAt: Date;
}
