import { Request, Response } from 'express';
import { sign } from 'jsonwebtoken';
import { UserController } from './UserController';
import { UserRepository } from '../datasource';
import { User } from '../entity/user';

// Assume UserRepository is already mocked above
jest.mock('jsonwebtoken', () => ({
    sign: jest.fn(),
}));

describe('UserController', () => {
    let userController: UserController;
    let mockReq: Partial<Request>;
    let mockRes: Partial<Response>;

    beforeEach(() => {
        jest.clearAllMocks();

        userController = new UserController();
        mockReq = { body: {} };
        mockRes = {
            json: jest.fn().mockReturnThis(),
            status: jest.fn().mockReturnThis(),
        };
    });

    it('should create a new user and return success response', async () => {
        mockReq.body = { name: 'John Doe', email: 'john@example.com' };
        // Mock the specific methods of UserRepository
        (UserRepository.findOneBy as jest.Mock).mockResolvedValueOnce(null);
        (UserRepository.save as jest.Mock).mockResolvedValueOnce({ id: 1, ...mockReq.body });

        await userController.createUser(mockReq as Request, mockRes as Response);

        expect(UserRepository.findOneBy).toHaveBeenCalledWith(expect.arrayContaining([{ email: 'john@example.com' }, { name: 'John Doe' }]));
        expect(UserRepository.save).toHaveBeenCalled();
        expect(mockRes.json).toHaveBeenCalledWith(expect.anything());
    });

    it('returns 409 if the email or name already exists', async () => {
        mockReq.body = { name: 'John Doe', email: 'john@example.com' };

        // Directly mock UserRepository's findOneBy method using jest.Mock
        (UserRepository.findOneBy as jest.Mock).mockResolvedValueOnce(new User());

        await userController.createUser(mockReq as Request, mockRes as Response);

        expect(UserRepository.findOneBy).toHaveBeenCalledWith([{ email: 'john@example.com' }, { name: 'John Doe' }]);
        expect(mockRes.status).toHaveBeenCalledWith(409);
        expect(mockRes.json).toHaveBeenCalledWith({ message: 'Email or name already exists.' });
    });

    it('handles unexpected errors gracefully', async () => {
        mockReq.body = { name: 'Unexpected Error', email: 'error@example.com' };

        // Directly mock UserRepository's findOneBy method to reject with an error
        (UserRepository.findOneBy as jest.Mock).mockRejectedValueOnce(new Error('Unexpected Error'));

        await userController.createUser(mockReq as Request, mockRes as Response);

        expect(mockRes.status).toHaveBeenCalledWith(500);
        expect(mockRes.json).toHaveBeenCalledWith({ message: 'Failed to sign up user.' });
    });

    describe('getAllUsers', () => {
        it('successfully retrieves users and excludes accessTokens', async () => {
            // Mock data simulating two users from the database
            const mockUsers = [
                { id: 1, name: 'Alice', email: 'alice@example.com', accessToken: 'token1' },
                { id: 2, name: 'Bob', email: 'bob@example.com', accessToken: 'token2' }
            ];

            // Mock UserRepository.find to resolve with mockUsers
            (UserRepository.find as jest.Mock).mockResolvedValue(mockUsers);

            await userController.getAllUsers(mockReq as Request, mockRes as Response);

            // Check if UserRepository.find was called
            expect(UserRepository.find).toHaveBeenCalled();

            // Check if the response excludes the accessToken
            expect(mockRes.json).toHaveBeenCalledWith(
                expect.arrayContaining([
                    expect.not.objectContaining({ accessToken: expect.any(String) }),
                ])
            );

            // Check the status code is 200
            expect(mockRes.status).toHaveBeenCalledWith(200);
        });

        it('handles unexpected errors when retrieving users', async () => {
            // Mock UserRepository.find to reject with an error
            (UserRepository.find as jest.Mock).mockRejectedValue(new Error('Unexpected Error'));

            await userController.getAllUsers(mockReq as Request, mockRes as Response);

            // Check if the error response is sent
            expect(mockRes.status).toHaveBeenCalledWith(500);
            expect(mockRes.json).toHaveBeenCalledWith({ message: 'Failed to retrieve users', error: 'Unexpected Error' });
        });
    })

  describe('getUserPosts', () => {
        it('successfully retrieves user posts', async () => {
            // Mock request with a valid user ID
            mockReq.params = { userId: '1' };

            // Mock UserRepository.findOne to simulate fetching user with posts
            (UserRepository.findOne as jest.Mock).mockResolvedValueOnce({
                id: 1,
                name: 'Alice',
                email: 'alice@example.com',
                posts: [{ id: 1, title: 'Post 1', content: 'Content 1' }]
            });

            await userController.getUserPosts(mockReq as Request, mockRes as Response);

            // Check if the response is successful and returns the expected posts
            expect(UserRepository.findOne).toHaveBeenCalledWith({
                where: { id: 1 },
                relations: ['posts']
            });
            expect(mockRes.status).toHaveBeenCalledWith(200);
            expect(mockRes.json).toHaveBeenCalledWith(expect.any(Array));
        });

        it('returns 400 for an invalid user ID format', async () => {
            // Mock request with an invalid user ID
            mockReq.params = { userId: 'invalid' };

            await userController.getUserPosts(mockReq as Request, mockRes as Response);

            // Check if the response correctly handles the invalid ID
            expect(mockRes.status).toHaveBeenCalledWith(400);
            expect(mockRes.json).toHaveBeenCalledWith({ message: 'Invalid user ID format.' });
        });

        it('returns 404 when the user is not found', async () => {
            // Mock request with a valid user ID but user does not exist
            mockReq.params = { userId: '2' };
            (UserRepository.findOne as jest.Mock).mockResolvedValueOnce(null);

            await userController.getUserPosts(mockReq as Request, mockRes as Response);

            // Check if the response correctly handles user not found
            expect(UserRepository.findOne).toHaveBeenCalled();
            expect(mockRes.status).toHaveBeenCalledWith(404);
            expect(mockRes.json).toHaveBeenCalledWith({ message: 'User not found' });
        });

        it('handles unexpected errors gracefully', async () => {
            // Mock request with a valid user ID
            mockReq.params = { userId: '3' };
            // Simulate an error during database fetch
            (UserRepository.findOne as jest.Mock).mockRejectedValueOnce(new Error('Unexpected Error'));

            await userController.getUserPosts(mockReq as Request, mockRes as Response);

            // Check if the response correctly handles unexpected errors
            expect(mockRes.status).toHaveBeenCalledWith(500);
            expect(mockRes.json).toHaveBeenCalledWith({ message: 'Failed to retrieve user posts', error: 'Unexpected Error' });
        });
    });
});



