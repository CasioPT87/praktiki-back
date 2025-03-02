import jwt from 'jsonwebtoken';
import { User } from '../types/entities';
import { NextFunction, Request, Response } from 'express';
import { AuthorisedRequest } from '../types/utilities';

export const authorization = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    let token = null;
    const cookieAuth = req.cookies?.[process.env.APP_NAME || ''];
    const headerAuth = req.headers?.authorization;
    if (cookieAuth) {
      token = cookieAuth;
    } else if (headerAuth) {
      token = headerAuth.split(' ')[1];
    }

    if (token) {
      const user = jwt.decode(token) as User;
      req = {
        ...req,
        user,
      } as AuthorisedRequest;
    }
    next();
  } catch (e) {
    res.status(403).send('token is not valid');
  }
};

export async function createToken({ user }: { user: User }) {
  const token = jwt.sign(user, process.env.AUTH_KEY || '');
  return token;
}
