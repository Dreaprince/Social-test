import 'express';

declare module 'express-serve-static-core' {
  interface Request {
    decoded?: jwt.JwtPayload | string; // Adjust the type according to what you expect to store in 'decoded'
  }
}
