import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany } from 'typeorm';
import { User } from './user';
import { Comment } from './comment';

@Entity()
export class Post {
  @PrimaryGeneratedColumn()
  id!: number; // Definite assignment assertion

  @Column()
  title!: string;

  @Column()
  content!: string;
  
  @ManyToOne(() => User, user => user.posts)
  user!: User;
  

  @OneToMany(() => Comment, comment => comment.post)
  comments!: Comment[]; // Definite assignment assertion

  constructor() {
    // Optionally initialize other properties here if needed
  }
}
