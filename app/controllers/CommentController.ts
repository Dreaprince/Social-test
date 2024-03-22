import { Request, Response } from 'express';
import { CommentRepository } from '../datasource';
import { Comment } from '../entity/comment';

export class CommentController {
    async addComment(req: Request, res: Response) {
      try {
        const { content, postId, userId } = req.body; // Extract necessary properties
        const newComment = CommentRepository.create({ content, post: { id: postId }, user: { id: userId } });
        const savedComment = await CommentRepository.save(newComment);
        return res.status(201).json(savedComment);
      } catch (error: any) {
        return res.status(500).json({ message: 'Failed to add comment', error: error.message });
      }
    }
  }
