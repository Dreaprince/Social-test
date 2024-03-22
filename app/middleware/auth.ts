import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export const checkToken = (req: Request, res: Response, next: NextFunction) => {
    // Note: Express headers are auto-converted to lowercase
    let token = req.headers['token'];

    if (token) {
        let newToken: string = token as string;
        
        jwt.verify(newToken, "wb5Bx7U8bIKefg4PWBcNUoxibGFk92QY", (err, decoded) => { // Consider using process.env.JWT_SECRET
            if (err) {
                return res.json({
                    status: false,
                    message: err.message,
                    responseCode: 10
                });
            } else {
                req.decoded = decoded; // You may need to extend the Request type to include this property
                next();
            }
        });
    } else {
        return res.json({
            status: false,
            message: 'Auth token is not supplied',
            responseCode: 10
        });
    }
};

export const parseIp = (req: Request): string | undefined =>
    req.headers['x-forwarded-for']?.toString().split(',').shift()
    || req.socket?.remoteAddress;
