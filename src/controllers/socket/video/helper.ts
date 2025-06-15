import { Namespace } from 'socket.io';
import { User } from '../../../types/entities';
import { DisconnectionReason } from './videoChat';

export async function endPrivateChat({
  reason,
  user,
  videoIO,
}: {
  reason: DisconnectionReason;
  user: User;
  videoIO: Namespace;
}) {
  if (!user) return;
  const existingUserManager = globalPrivateChatUsersManager.getUserByUserId(
    user.id
  );

  if (!existingUserManager) return;

  // get users connections:
  const privateChats = globalPrivateChatsManager.getAllPrivateChatsForUserId({
    userId: user.id,
  });

  // desc
  await Promise.allSettled(
    privateChats.map((pc) => {
      // id de la room
      const privateChatId = pc.id;
      // id del otro usuario
      const userIdToMessage =
        pc.creatorUserId === user.id ? pc.targetUserId : pc.creatorUserId;

      pc.getSocketFromUserId(userIdToMessage).then((socket) => {
        // sacamos de la room al socket del "otro" de la conexion
        if (socket) socket.leave(privateChatId);
      });

      // mandamos a la room que se ha desconectado y quien ha sido
      videoIO
        .to(privateChatId)
        .emit('private-chat:disconnected', { user: user.id, reason });
    })
  );

  // quitamos la conexion
  await globalPrivateChatsManager.finishConnectionsForUserId({
    userId: user.id,
  });
}

export default {
  endPrivateChat,
};
