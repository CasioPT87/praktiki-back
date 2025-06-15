import { Language, User } from '../../types/entities';
import { getUser } from '../../services/user';
import { Connection, PrivateChatManager } from '../call';
import { Namespace } from 'socket.io';

type UserRandomQueue = {
  userId: User['id'];
  fluent: Language['id'];
  practice: Language['id'];
  channel: string;
};

class RandomQueueChatManager {
  queryRandomChat: Array<UserRandomQueue> = [];

  addUserQueryRandomChat =
    (userId: User['id'], videoIO: Namespace) =>
    async ({ uuid }: { uuid: string }) => {
      if (!this.checkUserIsElegible(userId)) {
        console.warn('user not eligible, cannot be added to random queue');
        return;
      }
      const user = await getUser({ userId });
      if (!user) {
        console.warn('user to be added to random queue, not found');
        return;
      }
      this.queryRandomChat = [
        ...this.queryRandomChat,
        {
          userId,
          fluent: user.fluent_language,
          practice: user.practice_language,
          channel: uuid,
        },
      ];
      // each time a user joins, we try to find a match
      this.findAndSendQueryRandomChatMatches(videoIO);
    };

  checkUserIsElegible(userId: User['id']): boolean {
    if (this.queryRandomChat.find((each) => each.userId === userId)) {
      console.warn('user is already in random queue');
      return false;
    }
    const privateChatUser =
      globalPrivateChatUsersManager.getUserByUserId(userId);
    if (!privateChatUser) {
      console.warn(
        'to be elegible for random queue, user must be in globalPrivateChatUsersManager'
      );
      return false;
    }
    const privateChats = globalPrivateChatsManager.getAllPrivateChatsForUserId({
      userId,
    });
    if (
      privateChats.some(
        (pc: PrivateChatManager<Connection>) =>
          [pc.creatorUserId, pc.targetUserId].includes(userId) &&
          pc.connected !== Connection.finished
      )
    ) {
      console.warn(
        'to be elegible for random queue, user cannot be in a private call that has not finished (its on a video call)'
      );
      return false;
    }
    return true;
  }

  removeUserQueryRandomChat(userId: User['id']) {
    this.queryRandomChat = this.queryRandomChat.filter(
      (each) => each.userId !== userId
    );
  }

  findAndSendQueryRandomChatMatches = (videoIO: Namespace) => {
    const tuples: Array<
      [
        { userId: User['id']; channel: string },
        { userId: User['id']; channel: string },
      ]
    > = [];
    this.queryRandomChat.forEach(({ userId, fluent, practice, channel }) => {
      const match = this.queryRandomChat.find((each) => {
        return (
          each.userId !== userId &&
          fluent === each.practice &&
          practice === each.fluent
        );
      });
      if (match) {
        tuples.push([
          { userId, channel },
          { userId: match.userId, channel: match.channel },
        ]);
        this.removeUserQueryRandomChat(userId);
        this.removeUserQueryRandomChat(match.userId);
      }
    });
    if (tuples.length > 0) {
      tuples.forEach(([userOne, userTwo]) => {
        // we send the second user to the first user
        videoIO
          .to(userOne.channel)
          .emit('private-chat-random-queue:user-match', {
            user: userTwo.userId,
          });
        // and the other way around, so they can connect
        videoIO
          .to(userTwo.channel)
          .emit('private-chat-random-queue:user-match', {
            user: userOne.userId,
          });
      });
    }
  };
}

export { RandomQueueChatManager };
