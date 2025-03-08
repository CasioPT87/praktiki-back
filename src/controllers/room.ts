import { Request, Response } from 'express';
import { AuthorisedRequest } from '../types/utilities';
import { GlobalUsersManager } from '../services/user/manager';
import { getLocationChatById } from '../services/locationChat';
import { GlobalLocationChatsManager } from '../services/locationChat/manager';

export async function joinLocationRoom(
  req: AuthorisedRequest,
  res: Response
): Promise<void> {
  try {
    const userId = req.user.id;
    const roomId = req.params.id_room;
    const locationChatManager = GlobalLocationChatsManager.getLocationChat(
      Number(roomId)
    );
    if (!locationChatManager)
      throw new Error(
        `room ${roomId} not found for user ${userId} when joining room`
      );
    const userManager = GlobalUsersManager.getUser(String(userId));
    if (userManager) {
      const success = await userManager.joinLocationRoom(
        locationChatManager.name
      );
      if (success) {
        res.status(200).json({ data: null });
        return;
      }
    }
    res
      .status(500)
      .json({ data: null, error: 'Joining room did not succeeded' });
    return;
  } catch (e: unknown) {
    if (e instanceof Error) console.error(e.stack);
    res
      .status(500)
      .json({ data: null, error: 'Joining room did not succeeded' });
    return;
  }
}

export async function leaveLocationRoom(req: AuthorisedRequest, res: Response) {
  try {
    const userId = req.user.id;
    const roomId = req.params.id_room;
    const room = await getLocationChatById(roomId);
    if (!room)
      throw new Error(
        `room ${roomId} not found for user ${userId} when leaving room`
      );
    const userManager = GlobalUsersManager.getUser(String(userId));
    if (userManager) {
      await userManager.leaveLocationRoom(room.name);
      res.status(200);
      return;
    }
    res.status(500);
    return;
  } catch (e: unknown) {
    if (e instanceof Error) console.error(e.stack);
    res.status(500);
    return;
  }
}
