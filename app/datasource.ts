import { DataSourceOptions, DataSource } from 'typeorm';
import { User } from './entity/user';
import { Comment } from './entity/comment';
import { Post } from './entity/post';

// Define your database connection options
const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  host: 'localhost',
  port: 5432,
  username: 'postgres',
  password: 'P@ssw0rd',
  database: 'test1',
  entities: [User, Comment, Post],
  synchronize: true,
};

export const myDataSource = new DataSource(dataSourceOptions);

export const UserRepository = myDataSource.getRepository(User);
export const CommentRepository = myDataSource.getRepository(Comment);
export const PostRepository = myDataSource.getRepository(Post);
