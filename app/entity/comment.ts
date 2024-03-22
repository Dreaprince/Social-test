import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { User } from './user';
import { Post } from './post';

@Entity()
export class Comment {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  content!: string ;

  @ManyToOne(() => User, user => user.comments)
  user!: User;

  @ManyToOne(() => Post, post => post.comments)
  post!: Post;
}
