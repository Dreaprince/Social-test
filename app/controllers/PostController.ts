import { Request, Response } from 'express';
import { PostRepository, UserRepository } from '../datasource';
import { FindOneOptions } from 'typeorm';
import { Post } from '../entity/post';

export class PostController {

  async createPost(req: Request, res: Response) {
    try {
      const requestingUserId = req.decoded?.userId; // Make sure this is correctly parsed
      const user = await UserRepository.findOneBy({ id: requestingUserId });

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      const newPost = new Post();
      newPost.title = req.body.title;
      newPost.content = req.body.content;
      newPost.user = user; // Associate the post with the fetched user

      await PostRepository.save(newPost);

      return res.status(201).json({ message: 'Post created successfully', data: newPost });
    } catch (error: any) {
      console.error('Failed to create post:', error.message);
      return res.status(500).json({ message: 'Failed to create post', error: error.message });
    }
  }

  async getPostComments(req: Request, res: Response) {
    try {
      const postId = parseInt(req.params.postId);
      const options: FindOneOptions<Post> = {
        where: { id: postId },
        relations: ['comments']
      };
      const post = await PostRepository.findOne(options);
      if (!post) {
        return res.status(404).json({ message: 'Post not found' });
      }
      return res.status(200).json(post.comments);
    } catch (error: any) {
      return res.status(500).json({ message: 'Failed to retrieve post comments', error: error.message });
    }
  }

}
