import { check, validationResult, ValidationChain } from 'express-validator';
import { Request, Response, NextFunction } from 'express';
import { UserRepository } from '../datasource'; // Adjusted import based on your request

// Middleware to handle the validation result
export const expressValidatorMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    next();
};

export function validate(method: 'signup' | 'post' | 'comment'): ValidationChain[] {
    switch (method) {
        case 'signup':
            return [
                check('name')
                    .trim()
                    .isString()
                    .escape()
                    .not()
                    .isEmpty()
                    .withMessage('Please Input a Name')
                    .bail()
                    .isLength({ min: 3 })
                    .withMessage('Minimum 3 characters required!'),
                check('email')
                    .trim()
                    .not()
                    .isEmpty()
                    .withMessage('Please input an email address!')
                    .bail()
                    .isEmail()
                    .withMessage('Invalid email address!')
                    .bail()
                    .custom(async (email) => {
                        const existingUser = await UserRepository.findOne({ where: { email } });
                        if (existingUser) {
                            throw new Error('Email already in use!');
                        }
                    }),
            ];

        case 'post':
            return [
                check('title')
                    .isString()
                    .trim()
                    .escape()
                    .not()
                    .isEmpty()
                    .withMessage('Title cannot be empty')
                    .bail()
                    .isLength({ min: 1 })
                    .withMessage('Minimum 1 character required!'),
                check('content')
                    .isString()
                    .trim()
                    .escape()
                    .not()
                    .isEmpty()
                    .withMessage('Content cannot be empty')
                    .bail()
                    .isLength({ min: 1 })
                    .withMessage('Minimum 1 character required!'),
            ];

        case 'comment':
            return [
                check('content')
                    .trim()
                    .escape()
                    .not()
                    .isEmpty()
                    .withMessage('Content cannot be empty')
                    .bail()
                    .isLength({ min: 3 })
                    .withMessage('Minimum 3 characters required!'),
                check('userId')
                    .trim()
                    .escape()
                    .not()
                    .isEmpty()
                    .withMessage('Please Input userId'),
                check('postId')
                    .trim()
                    .escape()
                    .not()
                    .isEmpty()
                    .withMessage('Please Input PostId'),
            ];

        default:
            return [];
    }
}
