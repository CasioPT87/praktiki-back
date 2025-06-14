// src/controllers/userController.ts
import { Request, Response } from 'express';
import {
  registerUser as registerUserService,
  loginUser as loginUserService,
  getUser as getUserService,
} from '../services/user';
import { UserRole, createRandomUuid, createToken } from '../utils/auth';

export const registerUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { username, password } = req.body;
    const { fluentLanguageId, practiceLanguageId } = req.body;

    if (
      !fluentLanguageId ||
      !practiceLanguageId ||
      Number(fluentLanguageId) === Number(practiceLanguageId)
    )
      throw new Error('Chosen languages are not valid');

    const user = await registerUserService({
      username,
      password,
      roleValue: UserRole.registered,
      fluentLanguageId,
      practiceLanguageId,
    });
    if (!user) throw new Error('Error registering new user');

    const token = await createToken({ user });

    res.status(200).json({ token });
    return;
  } catch (err) {
    res.status(500).send('Error logging in');
  }
};

export const registerGuest = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const username = 'Guest User';
    const password = createRandomUuid();
    const { fluentLanguageId, practiceLanguageId } = req.body;

    if (
      !fluentLanguageId ||
      !practiceLanguageId ||
      Number(fluentLanguageId) === Number(practiceLanguageId)
    )
      throw new Error('Chosen languages are not valid');

    const user = await registerUserService({
      username,
      password,
      roleValue: UserRole.guest,
      fluentLanguageId,
      practiceLanguageId,
    });
    if (!user) throw new Error('Error registering new user');

    const token = await createToken({ user });

    res.status(200).json({ user, token });
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

export const getUserLogged = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = req?.user?.id as number;
    if (!userId) throw new Error('User is not logged');
    const user = await getUserService({ userId });

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
