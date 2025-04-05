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
  return user;
}

//offers will contain {}
// offererUserName
// offer
// offerIceCandidates
// answererUserName
// answer
// answererIceCandidates
const offers: any = [];

//username, socketId
const connectedSockets: any = [];

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
    textIONamespace: textIO,
    videoIONamespace: videoIO,
    usersManager: globalPrivateChatUsersManager,
  });

  textIO.on('connection', async (socket) => {
    const user = await getUserFromConnection(socket);
    if (!user) {
      socket.disconnect();
      return;
    }

    socket.on(
      'location-chat:join',
      async (
        { locationChatId }: { locationChatId: LocationChat['id'] },
        callback
      ) => {
        try {
          const locationChatManager =
            globalLocationChatsManager.getLocationChat(locationChatId);
          if (!locationChatManager) {
            return false;
          }

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
          /* ** */

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
      const existingUserManager = globalLocationChatUsersManager.getUser(
        user.id
      );
      // remove user from global users
      if (existingUserManager) {
        globalLocationChatUsersManager.removeUser(existingUserManager.userId);
      }
      // send message to the people from all rooms indicating all the users in that room (there is one less now)
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

    const existingUserManager = globalLocationChatUsersManager.getUser(user.id);
    if (existingUserManager) {
      existingUserManager.updateSocketId(socket.id);
    } else {
      const userManager = new UserManager(user.id, socket.id);
      globalLocationChatUsersManager.addUser(userManager);
    }
  });

  videoIO.on('connection', async (socket) => {
    const user = await getUserFromConnection(socket);
    if (!user) {
      socket.disconnect();
      return;
    }

    const existingUserManager = globalPrivateChatUsersManager.getUser(user.id);
    if (existingUserManager) {
      existingUserManager.updateSocketId(socket.id);
    } else {
      const userManager = new UserManager(user.id, socket.id);
      globalPrivateChatUsersManager.addUser(userManager);
    }

    socket.on('disconnecting', (reason) => {
      const existingUserManager = globalPrivateChatUsersManager.getUser(
        user.id
      );
      // remove user from global users
      if (existingUserManager) {
        globalPrivateChatUsersManager.removeUser(existingUserManager.userId);
      }
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
          creatorSocket.emit('private-chat:start', {
            creator: true,
            target: false,
          });
          targetSocket.emit('private-chat:start', {
            creator: false,
            target: true,
            privateChatId,
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
        .then((targetSocket) => {
          if (!targetSocketId) return;
          targetSocket.emit('offer:create', offer);
        });
    });
  });

  // esto pasa cuando un usuario responde una oferta
  socket.on('offer:accept', (offerObj, ackFunction) => {
    // encontramos el socket del usuario que hizo la oferta
    const socketToAnswer = connectedSockets.find(
      (s) => s.userName === offerObj.offererUserName
    );
    if (!socketToAnswer) {
      console.log('No matching socket');
      return;
    }
    //we found the matching socket, so we can emit to it!
    const socketIdToAnswer = socketToAnswer.socketId;
    //we find the offer to update so we can emit it
    const offerToUpdate = offers.find(
      (o) => o.offererUserName === offerObj.offererUserName
    );
    if (!offerToUpdate) {
      console.log('No OfferToUpdate');
      return;
    }
    //send back to the answerer all the iceCandidates we have already collected
    ackFunction(offerToUpdate.offerIceCandidates);
    offerToUpdate.answer = offerObj.answer;
    offerToUpdate.answererUserName = userName;
    //socket has a .to() which allows emiting to a "room"
    //every socket has it's own room
    socket.to(socketIdToAnswer).emit('answerResponse', offerToUpdate);
  });

  socket.on('sendIceCandidateToSignalingServer', (iceCandidateObj) => {
    const { didIOffer, iceUserName, iceCandidate } = iceCandidateObj;
    // console.log(iceCandidate);
    if (didIOffer) {
      //this ice is coming from the offerer. Send to the answerer
      const offerInOffers = offers.find(
        (o) => o.offererUserName === iceUserName
      );
      if (offerInOffers) {
        offerInOffers.offerIceCandidates.push(iceCandidate);
        // 1. When the answerer answers, all existing ice candidates are sent
        // 2. Any candidates that come in after the offer has been answered, will be passed through
        if (offerInOffers.answererUserName) {
          //pass it through to the other socket
          const socketToSendTo = connectedSockets.find(
            (s) => s.userName === offerInOffers.answererUserName
          );
          if (socketToSendTo) {
            socket
              .to(socketToSendTo.socketId)
              .emit('receivedIceCandidateFromServer', iceCandidate);
          } else {
            console.log('Ice candidate recieved but could not find answere');
          }
        }
      }
    } else {
      //this ice is coming from the answerer. Send to the offerer
      //pass it through to the other socket
      const offerInOffers = offers.find(
        (o) => o.answererUserName === iceUserName
      );
      const socketToSendTo = connectedSockets.find(
        (s) => s.userName === offerInOffers.offererUserName
      );
      if (socketToSendTo) {
        socket
          .to(socketToSendTo.socketId)
          .emit('receivedIceCandidateFromServer', iceCandidate);
      } else {
        console.log('Ice candidate recieved but could not find offerer');
      }
    }
    // console.log(offers)
  });
}
