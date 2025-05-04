// src/controllers/userController.ts
import { Request, Response } from 'express';
import {
  registerUser as registerUserService,
  loginUser as loginUserService,
  getUser as getUserService,
} from '../services/user';
import { ListManager } from '../redis';

export const joinQueue = async (req: Request, res: Response): Promise<void> => {
  try {
    const languageCombinationId = Number(req.query.combination);
    if (!languageCombinationId || !Number.isInteger(languageCombinationId))
      throw new Error('Not valid language combiantion');
    const listManager = new ListManager({ languageCombinationId });

    if (!user) {
      res.status(403).send('User not found');
      return;
    }

    res.status(200).json({ user });
  } catch (e) {
    if (e instanceof Error) console.error(e.stack);
    res.status(500).send('Error logging in');
  }
};
