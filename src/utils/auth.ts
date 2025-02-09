import jwt from 'jsonwebtoken';
import { User } from '../types/entities';

export const authorization = async (req, res, next) => {
  try {
    let token = null;
    let user = null;
    const cookieAuth = req.cookies?.[process.env.APP_NAME || ''];
    const headerAuth = req.headers?.authorization;
    if (cookieAuth) {
      token = cookieAuth;
    } else if (headerAuth) {
      token = headerAuth.split(' ')[1];
    }

    if (token) {
      user = jwt.decode(token);
      req.user = user;
    }
    next();
  } catch (e) {
    req.status(403).send('token is not valid');
  }
};

export async function createToken({ user }: { user: User }) {
  const token = jwt.sign(user, process.env.AUTH_KEY || '');
  return token;
}
