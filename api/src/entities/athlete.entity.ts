import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Team } from './team.entity';

@Entity()
export class Athlete {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  @Index()
  sourceTffrsAthleteId: string;

  @Column()
  name: string;

  @Column()
  sport: string;

  @ManyToOne(() => Team)
  @JoinColumn()
  team: Team;

  @CreateDateColumn()
  createdAt: Date;
}
