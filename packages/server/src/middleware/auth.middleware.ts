// swipe/packages/server/src/middleware/auth.middleware.ts
import { Request, Response, NextFunction, RequestHandler } from 'express';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config(); // To ensure JWT_SECRET is loaded if not already global

// Extend the Express Request interface to include our 'user' property
declare global {
  namespace Express {
    interface Request {
      user?: any; // You can replace 'any' with a more specific type for your decoded user payload
    }
  }
}

const authMiddleware: RequestHandler = (req: Request, res: Response, next: NextFunction) => {
  // Get token from header
  const authHeader = req.header('Authorization');

  // Check if no token
  if (!authHeader) {
    res.status(401).json({ message: 'No token, authorization denied' });
    return;
  }

  // Check if token is in the correct 'Bearer <token>' format
  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    res.status(401).json({ message: 'Token is not in Bearer format' });
    return;
  }

  const token = parts[1];

  try {
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      console.error('JWT_SECRET is not defined in .env file for auth middleware!');
      res.status(500).json({ message: 'Server configuration error' });
      return;
    }

    // Verify token
    const decoded = jwt.verify(token, jwtSecret);

    // Add user from payload to request object
    req.user = (decoded as any).user; // Assuming your payload is { user: { id: ..., username: ... } }
                                     // Cast to 'any' for simplicity here, or define a proper DecodedToken interface

    next(); // Move to the next middleware or route handler
  } catch (err) {
    console.error('Token verification failed:', err);
    res.status(401).json({ message: 'Token is not valid' });
  }
};

export default authMiddleware;