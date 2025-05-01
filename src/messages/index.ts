import { createAdapter } from '@socket.io/redis-adapter';
import { createClient } from 'redis';
import { Namespace, Server, Socket } from 'socket.io';
import { getUserFromToken } from '../utils/auth';
import { UsersManager, UserManager } from '../services/user/manager';
import { sendInitialNotificationsToUser } from '../services/notification/manager';
import { LocationChatsManager } from '../services/locationChat/manager';
import { LocationChat, User } from '../types/entities';
import { LocationChatClientMessage } from '../types/utilities';
import {
  createLocationChatMessage,
  getLocationChatMessagesByLocationChatId,
} from '../services/locationChatMessage';
import { getUser as getUserService } from '../services/user';
import { Connection, GlobalPrivateChatsManager } from '../managers/call';

const TEXT_NAMESPACE = '/text';
const CALL_NAMESPACE = '/call';
const VIDEO_NAMESPACE = '/video';

async function getUserFromConnection(socket: Socket): Promise<User | null> {
  let token;
  // for development
  if (socket.handshake.auth.token) {
    token = socket.handshake.auth.token;
    // for production
  } else {
    const prodAuthHeader = socket.handshake.headers.cookie;
    token = prodAuthHeader?.split(' ')[1];
  }

  const user = await getUserFromToken({ token });
  if (!user) return null;
  return user;
}

export default async function messages(io: Server) {
  if (process.env.NODE_ENV !== 'test') {
    const redisClientPub = createClient({
      socket: {
        host: 'redis',
        port: 6379,
      },
      password: 'PrakTiki34',
    });

    const redisClientSub = redisClientPub.duplicate();

    await redisClientPub
      .connect()
      .then(() => console.log('Connected to Redis Pub'))
      .catch((err) => console.error('Redis Pub connection error:', err));
    await redisClientSub
      .connect()
      .then(() => console.log('Connected to Redis Sub'))
      .catch((err) => console.error('Redis Sub connection error:', err));

    io.adapter(createAdapter(redisClientPub, redisClientSub));
  }

  const textIO = io.of(TEXT_NAMESPACE);
  const videoIO = io.of(VIDEO_NAMESPACE);

  const globalLocationChatsManager: LocationChatsManager =
    new LocationChatsManager(textIO);

  globalLocationChatsManager.addAllLocationChats();

  const globalLocationChatUsersManager = new UsersManager();
  const globalPrivateChatUsersManager = new UsersManager();

  const globalPrivateChatsManager = new GlobalPrivateChatsManager({
    videoIONamespace: videoIO,
    usersManager: globalPrivateChatUsersManager,
  });

  textIO.on('connection', async (socket) => {
    const user = await getUserFromConnection(socket);
    if (!user) {
      socket.disconnect();
      return;
    }

    const existingUserManager = globalLocationChatUsersManager.getUserByUserId(
      user.id
    );
    if (existingUserManager) {
      if (existingUserManager.socketId !== socket.id) {
        existingUserManager.updateSocketId(socket.id);
      }
    } else {
      const userManager = new UserManager(user.id, socket.id);
      globalLocationChatUsersManager.addUser(userManager);
    }

    socket.on(
      'location-chat:join',
      async (
        { locationChatId }: { locationChatId: LocationChat['id'] },
        callback
      ) => {
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

          return callback(true);
        } catch (e) {
          if (e instanceof Error) {
            console.error(e.stack);
            return callback(false);
          }
        }
      }
    );

    socket.on(
      'location-chat-message:create',
      ({ message }: { message: LocationChatClientMessage }) => {
        const locationChatManager =
          globalLocationChatsManager.getLocationChatByConnectedSocketId(
            socket.id
          );
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
      }
    );

    socket.on('location-chat-messages:get', () => {
      const locationChatManager =
        globalLocationChatsManager.getLocationChatByConnectedSocketId(
          socket.id
        );
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
    });

    socket.on('location-chat-users:get', () => {
      const locationChatManager =
        globalLocationChatsManager.getLocationChatByConnectedSocketId(
          socket.id
        );
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
    });

    socket.on('disconnecting', (reason) => {
      const existingUserManager =
        globalLocationChatUsersManager.getUserByUserId(user.id);
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
    });
  });

  videoIO.on('connection', async (socket) => {
    const user = await getUserFromConnection(socket);
    if (!user) {
      socket.disconnect();
      return;
    }

    const existingUserManager = globalPrivateChatUsersManager.getUserByUserId(
      user.id
    );
    if (existingUserManager) {
      existingUserManager.updateSocketId(socket.id);
    } else {
      const userManager = new UserManager(user.id, socket.id);
      globalPrivateChatUsersManager.addUser(userManager);
    }

    enum DisconnectionReason {
      controlled = 'controlled',
      uncontrolled = 'uncontrolled',
    }

    async function closeConnectionByUser({
      reason,
    }: {
      reason: DisconnectionReason;
    }) {
      if (!user) return;
      const existingUserManager = globalPrivateChatUsersManager.getUserByUserId(
        user.id
      );
      // get users connections:
      const privateChats =
        globalPrivateChatsManager.getAllPrivateChatsForUserId({
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

    socket.once('disconnecting', async (reason) => {
      async () => {
        try {
          await closeConnectionByUser({
            reason: DisconnectionReason.uncontrolled,
          });
        } catch (e) {
          if (e instanceof Error) console.error(e.stack);
        }
      };
    });

    socket.on('error', (err) => {
      socket.disconnect();
    });

    socket.on(
      'private-chat:create',
      ({ targetUserId }: { targetUserId: User['id'] }) => {
        try {
          globalPrivateChatsManager.addRequest({
            creatorUserId: user.id,
            targetUserId,
          });
        } catch (e) {
          if (e instanceof Error) console.error(e.stack);
        }
      }
    );

    socket.on('private-chat:end', async () => {
      try {
        await closeConnectionByUser({ reason: DisconnectionReason.controlled });
      } catch (e) {
        if (e instanceof Error) console.error(e.stack);
      }
    });

    socket.on(
      'private-chat:accept',
      ({ privateChatId }: { privateChatId: string }) => {
        try {
          const privateChatRequest =
            globalPrivateChatsManager.acceptRequest(privateChatId);
          if (!privateChatRequest) return;
          const creatorUserId = privateChatRequest.creatorUserId;
          const targetUserId = privateChatRequest.targetUserId;
          const creator =
            globalPrivateChatUsersManager.getUserByUserId(creatorUserId);
          const target =
            globalPrivateChatUsersManager.getUserByUserId(targetUserId);
          if (!creator || !target) return;
          const creatorSocket = videoIO.sockets.get(creator.socketId);
          const targetSocket = videoIO.sockets.get(target.socketId);
          if (!creatorSocket || !targetSocket) return;

          creatorSocket.join(privateChatId);
          targetSocket.join(privateChatId);

          creatorSocket.emit('private-chat:start', {
            creator: true,
            target: false,
            privateChatId,
          });
          targetSocket.emit('private-chat:start', {
            creator: false,
            target: true,
            privateChatId,
          });

          let countdownToExtinction = setTimeout(() => {
            closeConnectionByUser({ reason: DisconnectionReason.uncontrolled });
          }, 30_000);

          socket.on('heartbeat', () => {
            clearTimeout(countdownToExtinction);
            countdownToExtinction = setTimeout(() => {
              closeConnectionByUser({
                reason: DisconnectionReason.uncontrolled,
              });
            }, 30_000);
          });
        } catch (e) {
          if (e instanceof Error) console.error(e.stack);
        }
      }
    );

    socket.on('offer:create', ({ offer, privateChatId }) => {
      const privateChatRequest = globalPrivateChatsManager.getByIdAndState({
        id: privateChatId,
        state: Connection.onGoing,
      });
      if (!privateChatRequest) return;
      const targetSocketId = privateChatRequest
        .getSocketFromUserId(privateChatRequest.targetUserId)
        .then((socketToSend) => {
          if (!socketToSend) return;
          socketToSend.emit('offer:create', offer);
        });
    });

    socket.on('offer:answer', ({ offerAnswer, privateChatId }) => {
      const privateChatRequest = globalPrivateChatsManager.getByIdAndState({
        id: privateChatId,
        state: Connection.onGoing,
      });
      if (!privateChatRequest) return;
      privateChatRequest
        .getSocketFromUserId(privateChatRequest.creatorUserId)
        .then((socketToSend) => {
          if (!socketToSend) return;
          socketToSend.emit('offer:answer', offerAnswer);
        });
    });

    socket.on(
      'ice-candidates:create',
      ({ iceCandidate, privateChatId, isCreator }) => {
        const privateChatRequest = globalPrivateChatsManager.getByIdAndState({
          id: privateChatId,
          state: Connection.onGoing,
        });
        if (!privateChatRequest) return;
        privateChatRequest
          // is its the creator we want to send it to the target and viceversa
          .getSocketFromUserId(
            isCreator
              ? privateChatRequest.targetUserId
              : privateChatRequest.creatorUserId
          )
          .then((targetSocket) => {
            if (!targetSocket) return;
            targetSocket.emit('ice-candidates:create', iceCandidate);
          });
      }
    );
  });
}
