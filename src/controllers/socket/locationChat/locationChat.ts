import { Socket } from 'socket.io';
import { LocationChat, User } from '../../../types/entities';
import { getUser as getUserService } from '../../../services/user';
import { LocationChatClientMessage } from '../../../types/utilities';
import {
  createLocationChatMessage,
  getLocationChatMessagesByLocationChatId,
} from '../../../services/locationChatMessage';

const join =
  (socket: Socket) =>
  async ({ locationChatId }: { locationChatId: LocationChat['id'] }) => {
    try {
      // get the location chat
      const locationChatManager =
        globalLocationChatsManager.getLocationChat(locationChatId);
      if (!locationChatManager) {
        return false;
      }

      // the user abandoms all the other rooms it was in (but its own)
      for (const room of socket.rooms) {
        if (room !== socket.id) {
          socket.leave(room);
        }
      }

      socket.join(locationChatManager.name); // the user joins the room

      /* send list of users to the room's users */
      if (locationChatManager) {
        const socketIdsConnectedToRoom =
          locationChatManager.getRoomConnectedSocketIds();
        if (!socketIdsConnectedToRoom) return;
        Promise.all(
          Array.from(socketIdsConnectedToRoom).map(async (socketId) => {
            const userManager =
              globalLocationChatUsersManager.getUserBySocketId(socketId);
            if (userManager) {
              const user = await getUserService({
                userId: userManager.userId,
              });
              if (user) {
                return {
                  userId: user.id,
                  name: user.name,
                };
              }
            }
          })
        ).then((users) => {
          textIO
            .to(locationChatManager.name)
            .emit('location-chat-users:get', users);
        });
      }

      return true;
    } catch (e) {
      if (e instanceof Error) {
        console.error(e.stack);
        return false;
      }
    }
  };

const createMessage =
  (socket: Socket, user: User) =>
  ({ message }: { message: LocationChatClientMessage }) => {
    const locationChatManager =
      globalLocationChatsManager.getLocationChatByConnectedSocketId(socket.id);
    if (locationChatManager) {
      createLocationChatMessage({
        user_id: user.id,
        location_chat_id: locationChatManager.locationChat.id,
        text: message.content,
      }).then((locationChatMessage) => {
        if (!locationChatMessage) return;
        const parsedData = {
          content: locationChatMessage.text,
          created: locationChatMessage.created_at,
        };
        textIO
          .to(locationChatManager.name)
          .emit('location-chat-message:get', parsedData);
      });
    }
  };

const getMessages = (socket: Socket) => () => {
  const locationChatManager =
    globalLocationChatsManager.getLocationChatByConnectedSocketId(socket.id);
  if (locationChatManager) {
    getLocationChatMessagesByLocationChatId({
      locationChatId: locationChatManager.locationChat.id,
    }).then((locationChatMessages) => {
      if (locationChatMessages && locationChatMessages.length > 0) {
        const parsedData = locationChatMessages.map((each) => ({
          content: each.text,
          created: each.created_at,
        }));

        socket.emit('location-chat-messages:get', parsedData);
      } else {
        socket.emit('location-chat-messages:get', []);
      }
    });
  }
};

const getLocationChatRoomUsers = (socket: Socket) => () => {
  const locationChatManager =
    globalLocationChatsManager.getLocationChatByConnectedSocketId(socket.id);
  if (locationChatManager) {
    const socketIdsConnectedToRoom =
      locationChatManager.getRoomConnectedSocketIds();
    if (!socketIdsConnectedToRoom) return;
    Promise.all(
      Array.from(socketIdsConnectedToRoom).map(async (socketId) => {
        const userManager =
          globalLocationChatUsersManager.getUserBySocketId(socketId);
        if (userManager) {
          const user = await getUserService({
            userId: userManager.userId,
          });
          if (user) {
            return {
              userId: user.id,
              name: user.name,
            };
          }
        }
      })
    ).then((users) => {
      socket.emit('location-chat-users:get', users);
    });
  }
};

const onDisconnecting = (socket: Socket, user: User) => () => {
  const existingUserManager = globalLocationChatUsersManager.getUserByUserId(
    user.id
  );
  // remove user from global users
  if (existingUserManager) {
    globalLocationChatUsersManager.removeUser(existingUserManager.userId);
  }
  // send message to the all people in all rooms of this socket (it should only be one, but just in case), indicating all the users in that room (there is one less now)
  const rooms = Array.from(socket.rooms);
  rooms.forEach((roomName) => {
    const locationChatManager =
      globalLocationChatsManager.getLocationChatByName(roomName);
    if (locationChatManager) {
      const socketIdsConnectedToRoom =
        locationChatManager.getRoomConnectedSocketIds();
      if (socketIdsConnectedToRoom) {
        Promise.all(
          Array.from(socketIdsConnectedToRoom).map(async (socketId) => {
            const userManager =
              globalLocationChatUsersManager.getUserBySocketId(socketId);
            if (userManager) {
              const user = await getUserService({
                userId: userManager.userId,
              });
              if (user) {
                return {
                  userId: user.id,
                  name: user.name,
                };
              }
            }
          })
        ).then((users) => {
          const filteredUsers = users.filter(Boolean);
          textIO
            .to(locationChatManager.name)
            .emit('location-chat-users:get', filteredUsers);
        });
      }
    }
  });
};

export default {
  createMessage,
  getLocationChatRoomUsers,
  getMessages,
  join,
  onDisconnecting,
};
