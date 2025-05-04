// src/controllers/userController.ts
import { Request, Response } from 'express';
import { ListManager } from '../redis';

export const joinQueue = async (req: Request, res: Response): Promise<void> => {
  try {
    const languageCombinationId = Number(req.query.combination);
    if (!languageCombinationId || !Number.isInteger(languageCombinationId))
      throw new Error('Not valid language combiantion');
    const listManager = new ListManager({ languageCombinationId });
    const userId = req.user?.id || null;
    if (!userId) throw new Error('Not valid user found');

    const usersInList = await listManager.getAllFromList();

    if (Array.isArray(usersInList) && usersInList.length > 0) {
      const userIdToConnect = usersInList[0];
      await listManager.removeFromList(userIdToConnect);

      res.status(200).json({
        status: 'connect',
        connectTo: userIdToConnect,
      });
    } else {
      await listManager.addToList(userId);
      res.status(200).json({
        status: 'waiting',
        connectTo: null,
      });
    }
  } catch (e) {
    if (e instanceof Error) console.error(e.stack);
    res.status(500).send('Error logging in');
  }
};
