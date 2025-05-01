import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { User } from '../types/entities';
import { NextFunction, Request, Response } from 'express';
import { getUser } from '../services/user';

export async function getUserFromToken({ token }: { token: string }) {
  try {
    if (!token) throw new Error('Token not provided');
    const { id } = jwt.decode(token) as User;
    const user = await getUser({ userId: id });
    if (!user) throw new Error('User not found');
    return user;
  } catch (e) {
    if (e instanceof Error) console.error(e.stack);
    return null;
  }
}

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

      req.user = user;
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

export function createRandomUuid() {
  return uuidv4();
}

export enum UserRole {
  guest = 10,
  registered = 20,
}
