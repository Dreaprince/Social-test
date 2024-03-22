import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Post } from './post';
import { Comment } from './comment';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  name!: string; 

  @Column()
  email!: string; 

  @Column({ length: 1000, nullable: true }) // Make accessToken nullable
  accessToken?: string; 

  @OneToMany(() => Post, post => post.user)
  posts!: Post[];

  @OneToMany(() => Comment, comment => comment.user)
  comments!: Comment[];
}
