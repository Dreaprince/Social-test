import express from 'express';
import { UserController } from '../controllers/UserController';
import { PostController } from '../controllers/PostController';
import { CommentController } from '../controllers/CommentController';
import {checkToken} from '../middleware/auth'
import { expressValidatorMiddleware, validate } from '../middleware/validator';

const router = express.Router();
const userController = new UserController();
const postController = new PostController();
const commentController = new CommentController()

// User routes
router.post('/users', validate('signup'), expressValidatorMiddleware, userController.createUser);
router.get('/users', userController.getAllUsers);
router.get('/users/:userId/posts', userController.getUserPosts);


// Post routes
router.post('/posts', checkToken, validate('post'), expressValidatorMiddleware, postController.createPost);
router.get('/posts/:postId/comments', postController.getPostComments);
// Comment routes
router.post('/comments', validate('comment'), expressValidatorMiddleware, commentController.addComment);

export default router;






