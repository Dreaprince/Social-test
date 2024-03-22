import { Request, Response } from 'express';
import { PostController } from './PostController';
import { UserRepository, PostRepository } from '../datasource';
import { Post } from '../entity/post'; 
import { User} from '../entity/user';



describe('PostController', () => {
  let postController: PostController;
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;

  beforeEach(() => {
    jest.clearAllMocks();
    postController = new PostController();
    mockReq = {
      decoded: { userId: 1 }, // Simulate decoded JWT payload
      body: { title: 'Test Post', content: 'This is a test post content.' }
    };
    mockRes = {
      json: jest.fn().mockReturnThis(),
      status: jest.fn().mockReturnThis(),
    };
  });

  it('successfully creates a new post', async () => {
    (UserRepository.findOneBy as jest.Mock).mockResolvedValueOnce(new User());
    (PostRepository.save as jest.Mock).mockImplementationOnce(post => Promise.resolve({ ...post, id: 1 }));

    await postController.createPost(mockReq as Request, mockRes as Response);

    expect(UserRepository.findOneBy).toHaveBeenCalledWith({ id: 1 });
    expect(PostRepository.save).toHaveBeenCalled();
    expect(mockRes.status).toHaveBeenCalledWith(201);
    expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'Post created successfully' }));
  });

  it('returns 404 when the user is not found', async () => {
    (UserRepository.findOneBy as jest.Mock).mockResolvedValueOnce(null);

    await postController.createPost(mockReq as Request, mockRes as Response);

    expect(UserRepository.findOneBy).toHaveBeenCalledWith({ id: 1 });
    expect(mockRes.status).toHaveBeenCalledWith(404);
    expect(mockRes.json).toHaveBeenCalledWith({ message: 'User not found' });
  });

  it('handles unexpected errors gracefully', async () => {
    (UserRepository.findOneBy as jest.Mock).mockRejectedValueOnce(new Error('Unexpected Error'));

    await postController.createPost(mockReq as Request, mockRes as Response);

    expect(mockRes.status).toHaveBeenCalledWith(500);
    expect(mockRes.json).toHaveBeenCalledWith({ message: 'Failed to create post', error: 'Unexpected Error' });
  });

  it('successfully retrieves post comments', async () => {
    const mockComments = [
      { id: 1, content: 'First comment', postId: 1 },
      { id: 2, content: 'Second comment', postId: 1 }
    ];
    const mockPost = new Post();
    mockPost.id = 1;
    mockPost.title = 'Test Post';
    mockPost.content = 'This is a test post content.';
    // mockPost.comments = mockComments;

    (PostRepository.findOne as jest.Mock).mockResolvedValueOnce(mockPost);

    await postController.getPostComments(mockReq as Request, mockRes as Response);

    expect(PostRepository.findOne).toHaveBeenCalledWith({
      where: { id: 1 },
      relations: ['comments']
    });
    expect(mockRes.status).toHaveBeenCalledWith(200);
    expect(mockRes.json).toHaveBeenCalledWith(mockComments);
  });

  it('returns 404 when the post is not found', async () => {
    (PostRepository.findOne as jest.Mock).mockResolvedValueOnce(null);

    await postController.getPostComments(mockReq as Request, mockRes as Response);

    expect(PostRepository.findOne).toHaveBeenCalledWith({
      where: { id: 1 },
      relations: ['comments']
    });
    expect(mockRes.status).toHaveBeenCalledWith(404);
    expect(mockRes.json).toHaveBeenCalledWith({ message: 'Post not found' });
  });

  it('handles unexpected errors gracefully', async () => {
    (PostRepository.findOne as jest.Mock).mockRejectedValueOnce(new Error('Unexpected Error'));

    await postController.getPostComments(mockReq as Request, mockRes as Response);

    expect(mockRes.status).toHaveBeenCalledWith(500);
    expect(mockRes.json).toHaveBeenCalledWith({ message: 'Failed to retrieve post comments', error: 'Unexpected Error' });
  });
});




