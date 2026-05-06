import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Athlete } from './athlete.entity';
import { Meet } from './meet.entity';
import { Team } from './team.entity';

@Entity()
@Index(['sourceTffrsMeetId', 'sourceTffrsAthleteId', 'event'], {
  unique: true,
})
export class Result {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Meet)
  @JoinColumn()
  meet: Meet;

  @Column()
  @Index()
  sourceTffrsMeetId: string;

  @ManyToOne(() => Athlete)
  @JoinColumn()
  athlete: Athlete;

  @Column()
  @Index()
  sourceTffrsAthleteId: string;

  @ManyToOne(() => Team)
  @JoinColumn()
  team: Team;

  @Column()
  @Index()
  sourceTffrsTeamId: string;

  @Column()
  event: string;

  @Column()
  time: string;

  @Column({ type: 'float', nullable: true })
  @Index()
  timeSeconds: number | null;

  @Column()
  place: number;

  @CreateDateColumn()
  createdAt: Date;
}
