// src/controllers/userController.ts
import { Request, Response } from 'express';
import {
  registerUser as registerUserService,
  loginUser as loginUserService,
} from '../services/user';
import { createToken } from '../utils/auth';

export const registerUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { username, password } = req.body;

    const user = await registerUserService({ username, password });
    if (!user) throw new Error('Error registering new user');

    const token = await createToken({ user });

    res.status(200).json({ token });
    return;
  } catch (err) {
    res.status(500).send('Error logging in');
  }
};

export const loginUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, password } = req.body;

    const user = await loginUserService({ username, password });

    if (!user) {
      res.status(403).send('User not found');
      return;
    }

    const token = await createToken({ user });

    res.status(200).json({ token });
  } catch (err) {
    res.status(500).send('Error logging in');
  }
};
