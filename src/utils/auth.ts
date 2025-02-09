import jwt from 'jsonwebtoken';
import { User } from '../types/entities';

export const authorization = async (req, res, next) => {
  const cookies = req.cookies;
  console.log(cookies);
  next();
};

export async function createToken({ user }: { user: User }) {
  const token = jwt.sign(user, process.env.AUTH_KEY || '');
  return token;
}
