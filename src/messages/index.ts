import { createAdapter } from '@socket.io/redis-adapter';
import { createClient } from 'redis';
import { Server, Socket } from 'socket.io';
import { getUserFromToken } from '../utils/auth';
import { GlobalUsersManager, UserManager } from '../services/user/manager';
import { sendInitialNotificationsToUser } from '../services/notification/manager';
import { GlobalLocationChatsManager } from '../services/locationChat/manager';
import { LocationChat, User } from '../types/entities';
import { SocketManager } from '../utilities';
import { LocationChatClientMessage } from '../types/utilities';
import {
  createLocationChatMessage,
  getLocationChatMessagesByLocationChatId,
} from '../services/locationChatMessage';

interface SocketIO extends Socket {
  user: any;
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

  io.on('connection', async (socket) => {
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
    if (!user) return;

    socket.on(
      'joinLocationChat',
      (
        { locationChatId }: { locationChatId: LocationChat['id'] },
        callback
      ) => {
        try {
          const locationChatManager =
            GlobalLocationChatsManager.getLocationChat(locationChatId);
          if (!locationChatManager) {
            return;
          }
          const socketManager = new SocketManager(socket);
          socketManager.addRoom(locationChatManager.name);

          getLocationChatMessagesByLocationChatId({ locationChatId }).then(
            (data) => {
              if (data && data.length > 0) {
                console.log('hey!!!');
                const parsedData = data.map((each) => ({
                  content: each,
                  created: each.created_at,
                }));

                callback(parsedData);
              } else {
                callback([]);
              }
            }
          );

          socket.on(
            'sendMessageToLocationChat',
            ({
              locationChatId,
              message,
            }: {
              locationChatId: LocationChat['id'];
              message: LocationChatClientMessage;
            }) => {
              createLocationChatMessage({
                user_id: user.id,
                location_chat_id: locationChatId,
                text: message.content,
              })
                .then(() => {
                  const locationChatManager =
                    GlobalLocationChatsManager.getLocationChat(locationChatId);
                  if (locationChatManager) {
                    io.to(locationChatManager.name).emit(
                      'receiveMessageFromLocationChat',
                      message
                    );
                  }
                })
                .catch((e) => {
                  throw e;
                });
            }
          );
        } catch (e) {
          console.log(e);
        }
      }
    );

    const userManager = new UserManager(user.id);
    GlobalUsersManager.addUser(userManager);
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
  });
}
