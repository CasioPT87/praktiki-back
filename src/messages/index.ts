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
import { GlobalPrivateChatsManager } from '../managers/call';
import { userInfo } from 'os';

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

async function getUsersConnectedToRoom({
  socketIds,
  roomName,
  ioNamespace,
  globalLocationChatUsersManager,
}: {
  socketIds: string[];
  roomName: string;
  ioNamespace: Namespace;
  globalLocationChatUsersManager: UsersManager;
}) {
  return Promise.all(
    Array.from(socketIds).map(async (socketId) => {
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
  );
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

          socket.join(locationChatManager.name); // the user joins the room

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
          getUsersConnectedToRoom({
            user_id: user.id,
            location_chat_id: locationChatManager.locationChat.id,
            text: message.content,
          }).then((users) => {
            textIO
              .to(locationChatManager.name)
              .emit('location-chat-users:get', users);
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
        }).then((data) => {
          if (data && data.length > 0) {
            const parsedData = data.map((each) => ({
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

        if (socketIdsConnectedToRoom) {
          sendUserConnectedToRoom({
            socketIds: Array.from(socketIdsConnectedToRoom),
            roomName: locationChatManager.name,
            ioNamespace: textIO,
            globalLocationChatUsersManager,
          });
        }
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
            const socketIdsMinusOneAboutToLeave = Array.from(
              socketIdsConnectedToRoom
            ).filter((socketId) => socketId !== socket.id);
            sendUserConnectedToRoom({
              socketIds: socketIdsMinusOneAboutToLeave,
              roomName: locationChatManager.name,
              ioNamespace: textIO,
              globalLocationChatUsersManager,
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
          globalPrivateChatsManager.acceptRequest(privateChatId);
        } catch (e) {
          if (e instanceof Error) console.error(e.stack);
        }
      }
    );
  });

  //sendInitialNotificationsToUser(String(user.id));

  // aqui hay que coger de la bd todos los mensajes DIRECTOS que se hayan mandado a ese usuario y mandarle una notificacion con los NO leidos

  // esta parte es para estableces conexiones de video. Bueno, te lo vas a tener que currar, pero la base esta ahi:

  //   connectedSockets.push({
  //     socketId: socket.id,
  //     userName,
  //   });

  //   //setSocket({ socketId: socket.id, userName })

  //   //a new client has joined. If there are any offers available,
  //   //emit them out
  //   if (offers.length) {
  //     socket.emit('availableOffers', offers);
  //   }

  //   // esto pasa cuando un usuario pulsa en "call"
  //   socket.on('newOffer', (newOffer) => {
  //     console.log('new offer!!!', newOffer);
  //     const offer = {
  //       offererUserName: userName,
  //       offer: newOffer,
  //       offerIceCandidates: [],
  //       answererUserName: null,
  //       answer: null,
  //       answererIceCandidates: [],
  //     };
  //     offers.push(offer);

  //     //send out to all connected sockets EXCEPT the caller
  //     socket.broadcast.emit('newOfferAwaiting', offer);
  //   });

  //   // esto pasa cuando un usuario responde una oferta
  //   socket.on('newAnswer', (offerObj, ackFunction) => {
  //     // encontramos el socket del usuario que hizo la oferta
  //     const socketToAnswer = connectedSockets.find(
  //       (s) => s.userName === offerObj.offererUserName
  //     );
  //     if (!socketToAnswer) {
  //       console.log('No matching socket');
  //       return;
  //     }
  //     //we found the matching socket, so we can emit to it!
  //     const socketIdToAnswer = socketToAnswer.socketId;
  //     //we find the offer to update so we can emit it
  //     const offerToUpdate = offers.find(
  //       (o) => o.offererUserName === offerObj.offererUserName
  //     );
  //     if (!offerToUpdate) {
  //       console.log('No OfferToUpdate');
  //       return;
  //     }
  //     //send back to the answerer all the iceCandidates we have already collected
  //     ackFunction(offerToUpdate.offerIceCandidates);
  //     offerToUpdate.answer = offerObj.answer;
  //     offerToUpdate.answererUserName = userName;
  //     //socket has a .to() which allows emiting to a "room"
  //     //every socket has it's own room
  //     socket.to(socketIdToAnswer).emit('answerResponse', offerToUpdate);
  //   });

  //   socket.on('sendIceCandidateToSignalingServer', (iceCandidateObj) => {
  //     const { didIOffer, iceUserName, iceCandidate } = iceCandidateObj;
  //     // console.log(iceCandidate);
  //     if (didIOffer) {
  //       //this ice is coming from the offerer. Send to the answerer
  //       const offerInOffers = offers.find(
  //         (o) => o.offererUserName === iceUserName
  //       );
  //       if (offerInOffers) {
  //         offerInOffers.offerIceCandidates.push(iceCandidate);
  //         // 1. When the answerer answers, all existing ice candidates are sent
  //         // 2. Any candidates that come in after the offer has been answered, will be passed through
  //         if (offerInOffers.answererUserName) {
  //           //pass it through to the other socket
  //           const socketToSendTo = connectedSockets.find(
  //             (s) => s.userName === offerInOffers.answererUserName
  //           );
  //           if (socketToSendTo) {
  //             socket
  //               .to(socketToSendTo.socketId)
  //               .emit('receivedIceCandidateFromServer', iceCandidate);
  //           } else {
  //             console.log('Ice candidate recieved but could not find answere');
  //           }
  //         }
  //       }
  //     } else {
  //       //this ice is coming from the answerer. Send to the offerer
  //       //pass it through to the other socket
  //       const offerInOffers = offers.find(
  //         (o) => o.answererUserName === iceUserName
  //       );
  //       const socketToSendTo = connectedSockets.find(
  //         (s) => s.userName === offerInOffers.offererUserName
  //       );
  //       if (socketToSendTo) {
  //         socket
  //           .to(socketToSendTo.socketId)
  //           .emit('receivedIceCandidateFromServer', iceCandidate);
  //       } else {
  //         console.log('Ice candidate recieved but could not find offerer');
  //       }
  //     }
  //     // console.log(offers)
  //   });

  //   // const _socket = socket as SocketIO;
  //   // const userId = _socket?.user?.userId;
  //   // if (!userId) return;

  //   // //anadimos al usuario a una room para el solo
  //   // socket.join(userId.toString());

  //   // // const user = await usersService.obtenerUsuarioId(userId);

  //   // // todos los usuarios van a la room "sala-todos"
  //   // socket.join('sala-todos');
}
