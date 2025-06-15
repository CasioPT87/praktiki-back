import { Namespace } from 'socket.io';
import { Connection } from '../../../managers/call';
import { User } from '../../../types/entities';
import { endPrivateChat } from './helper';

export enum DisconnectionReason {
  controlled = 'controlled',
  uncontrolled = 'uncontrolled',
}

export const onDisconnecting = (user: User, videoIO: Namespace) => async () => {
  try {
    await endPrivateChat({
      user,
      reason: DisconnectionReason.uncontrolled,
      videoIO,
    });
    const existingOtherUserManager =
      globalPrivateChatUsersManager.getUserByUserId(user.id);
    if (existingOtherUserManager) {
      // sacamos al otro usuario del global users manager
      globalPrivateChatUsersManager.removeUser(existingOtherUserManager.userId);
    }
  } catch (e) {
    if (e instanceof Error) console.error(e.stack);
  }
};

export const create =
  (user: User) =>
  ({ targetUserId }: { targetUserId: User['id'] }) => {
    try {
      console.log('create');
      globalPrivateChatsManager.addRequest({
        creatorUserId: user.id,
        targetUserId,
      });
    } catch (e) {
      if (e instanceof Error) console.error(e.stack);
    }
  };

const end = (user: User, videoIO: Namespace) => async () => {
  try {
    await endPrivateChat({
      user,
      reason: DisconnectionReason.controlled,
      videoIO,
    });
  } catch (e) {
    if (e instanceof Error) console.error(e.stack);
  }
};

export const createMessage =
  (videoIO: Namespace) =>
  ({ text, privateChatId }: { text: string; privateChatId: string }) => {
    if (!text) return;
    const privateChatRequest = globalPrivateChatsManager.getByIdAndState({
      id: privateChatId,
      state: Connection.onGoing,
    });
    if (!privateChatRequest) return;
    const room = privateChatRequest.id;
    videoIO.to(room).emit('private-chat-message:create', text);
  };

export default {
  onDisconnecting,
  create,
  end,
  createMessage,
};
