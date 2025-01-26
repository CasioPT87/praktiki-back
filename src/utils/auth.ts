import jwt from 'jsonwebtoken';
import { User } from '../types/entities';

export async function createToken({ user }: { user: User }) {
  const token = jwt.sign(user, process.env.AUTH_KEY || '');
  return token;
}
