import { User } from '../../../types/entities';
import { DisconnectionReason } from './videoChat';

export async function closeConnectionByUser({
  reason,
  user,
}: {
  reason: DisconnectionReason;
  user: User;
}) {
  if (!user) return;
  const existingUserManager = globalPrivateChatUsersManager.getUserByUserId(
    user.id
  );
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
      const existingOtherUserManager =
        globalPrivateChatUsersManager.getUserByUserId(user.id);
      if (existingOtherUserManager) {
        // sacamos al otro usuario del global users manager
        globalPrivateChatUsersManager.removeUser(
          existingOtherUserManager.userId
        );
      }

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

  if (existingUserManager) {
    globalPrivateChatUsersManager.removeUser(existingUserManager.userId);
  }
}

export default {
  closeConnectionByUser,
};
