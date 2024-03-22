import { Request, Response } from 'express';
import { UserRepository } from '../datasource';
import { FindOneOptions } from 'typeorm';
import { User } from '../entity/user';
import { sign } from 'jsonwebtoken';

export class UserController {

    async createUser(req: Request, res: Response) {
        try {
            const { name, email } = req.body;

            // Check if email or name already exists
            const existingUser = await UserRepository.findOneBy([
                { email },
                { name }
            ]);
            if (existingUser) {
                return res.status(409).json({ message: 'Email or name already exists.' });
            }


            // Create new user and generate access token
            const newUser = new User();
            newUser.name = name;
            newUser.email = email;

            await UserRepository.save(newUser);

            const accessToken = sign({ userId: newUser.id }, process.env.JWT_SECRET || "wb5Bx7U8bIKefg4PWBcNUoxibGFk92QY", { expiresIn: '50d' });
            newUser.accessToken = accessToken;
            await UserRepository.save(newUser);

            // Assuming your User entity correctly manages the ID property
            return res.json({
                statusCode: "00",
                message: "Sign-up successful",
                data: {
                    id: newUser.id,
                    name: newUser.name,
                    email: newUser.email,
                    accessToken: newUser.accessToken
                }
            });
        } catch (error) {
            console.error("Error occurred while signing up user: ", error);
            return res.status(500).json({ message: 'Failed to sign up user.' });
        }
    }

    async getAllUsers(req: Request, res: Response) {
        try {
            const users = await UserRepository.find();
    
            // Map through each user and exclude the accessToken from the returned data
            const usersWithoutAccessTokens = users.map(user => {
                const { accessToken, ...userWithoutAccessToken } = user;
                return userWithoutAccessToken;
            });
    
            return res.status(200).json(usersWithoutAccessTokens);
        } catch (error: any) {
            return res.status(500).json({ message: 'Failed to retrieve users', error: error.message });
        }
    }

    async getUserPosts(req: Request, res: Response) {
        try {
          const userId = parseInt(req.params.userId);
          if (isNaN(userId)) {
            return res.status(400).json({ message: 'Invalid user ID format.' });
          }
      
          const options: FindOneOptions<User> = {
            where: { id: userId },
            relations: ['posts'],
          };
      
          const user = await UserRepository.findOne(options);
          if (!user) {
            return res.status(404).json({ message: 'User not found' });
          }
      
          return res.status(200).json(user.posts);
        } catch (error: any) {
          console.error('Failed to retrieve user posts:', error.message);
          return res.status(500).json({ message: 'Failed to retrieve user posts', error: error.message });
        }
      }   
}
