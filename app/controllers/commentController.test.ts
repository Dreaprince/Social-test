import { Request, Response } from 'express';
import { CommentController } from './CommentController';
import { CommentRepository } from '../datasource';
import { Comment } from '../entity/comment';

describe('CommentController', () => {
  let commentController: CommentController;
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;

  beforeEach(() => {
    jest.clearAllMocks();
    commentController = new CommentController();
    mockReq = {
      body: {}
    };
    mockRes = {
      json: jest.fn().mockReturnThis(),
      status: jest.fn().mockReturnThis(),
    };
  });

  it('successfully adds a comment', async () => {
    mockReq.body = { content: 'Great post!', postId: 1, userId: 1 };
    
    // Assuming CommentRepository.create() returns the argument itself for simplicity
    (CommentRepository.create as jest.Mock).mockImplementation((comment) => comment);
    (CommentRepository.save as jest.Mock).mockResolvedValue({ ...mockReq.body, id: 123 }); // Simulate saved comment

    await commentController.addComment(mockReq as Request, mockRes as Response);

    expect(CommentRepository.create).toHaveBeenCalledWith({
      content: 'Great post!',
      post: { id: 1 },
      user: { id: 1 }
    });
    expect(CommentRepository.save).toHaveBeenCalled();
    expect(mockRes.status).toHaveBeenCalledWith(201);
    expect(mockRes.json).toHaveBeenCalledWith(expect.any(Object));
  });

  it('handles errors when adding a comment', async () => {
    mockReq.body = { content: 'Great post!', postId: 1, userId: 1 };
    
    // Simulate an error during the save operation
    (CommentRepository.save as jest.Mock).mockRejectedValue(new Error('Database Error'));

    await commentController.addComment(mockReq as Request, mockRes as Response);

    expect(CommentRepository.create).toHaveBeenCalledWith(expect.any(Object));
    expect(CommentRepository.save).toHaveBeenCalled();
    expect(mockRes.status).toHaveBeenCalledWith(500);
    expect(mockRes.json).toHaveBeenCalledWith({ message: 'Failed to add comment', error: 'Database Error' });
  });
});
