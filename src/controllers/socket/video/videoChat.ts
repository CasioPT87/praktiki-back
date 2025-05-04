import { Connection } from '../../../managers/call';
import { User } from '../../../types/entities';
import { closeConnectionByUser } from './helper';

export enum DisconnectionReason {
  controlled = 'controlled',
  uncontrolled = 'uncontrolled',
}

export const onDisconnecting = (user: User) => async () => {
  try {
    await closeConnectionByUser({
      user,
      reason: DisconnectionReason.uncontrolled,
    });
  } catch (e) {
    if (e instanceof Error) console.error(e.stack);
  }
};

export const create =
  (user: User) =>
  ({ targetUserId }: { targetUserId: User['id'] }) => {
    try {
      globalPrivateChatsManager.addRequest({
        creatorUserId: user.id,
        targetUserId,
      });
    } catch (e) {
      if (e instanceof Error) console.error(e.stack);
    }
  };

const end = (user: User) => async () => {
  try {
    await closeConnectionByUser({
      user,
      reason: DisconnectionReason.controlled,
    });
  } catch (e) {
    if (e instanceof Error) console.error(e.stack);
  }
};

export const createMessage = ({
  text,
  privateChatId,
}: {
  text: string;
  privateChatId: string;
}) => {
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
