import { createAdapter } from '@socket.io/redis-adapter';
import { createClient } from 'redis';
import { Server, Socket } from 'socket.io';

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

  io.use(async function (socket: Socket, next) {
    if (socket.handshake.auth) {
      // const tokenInfo = tokenService.decodeToken(socket.handshake.auth.token);
      // if (!tokenInfo) return next(new Error('Authentication error'));
      // socket = Object.assign(socket, { user: tokenInfo }) as SocketIO;

      next();
    } else {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', async (socket) => {
    socket.on('chat message', (msg) => {
      console.log('message: ' + msg);
      // le mandamos el mensaje a todos los que esten en este canal, incluido el que lo ha enviado
      io.emit('chat message', msg);
    });

    const userName = socket.handshake.auth.userName;
    const password = socket.handshake.auth.password;

    connectedSockets.push({
      socketId: socket.id,
      userName,
    });

    //a new client has joined. If there are any offers available,
    //emit them out
    if (offers.length) {
      socket.emit('availableOffers', offers);
    }

    socket.on('newOffer', (newOffer) => {
      offers.push({
        offererUserName: userName,
        offer: newOffer,
        offerIceCandidates: [],
        answererUserName: null,
        answer: null,
        answererIceCandidates: [],
      });
      // console.log(newOffer.sdp.slice(50))
      //send out to all connected sockets EXCEPT the caller
      socket.broadcast.emit('newOfferAwaiting', offers.slice(-1));
    });

    socket.on('newAnswer', (offerObj, ackFunction) => {
      console.log(offerObj);
      //emit this answer (offerObj) back to CLIENT1
      //in order to do that, we need CLIENT1's socketid
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

    // const _socket = socket as SocketIO;
    // const userId = _socket?.user?.userId;
    // if (!userId) return;

    // //anadimos al usuario a una room para el solo
    // socket.join(userId.toString());

    // // const user = await usersService.obtenerUsuarioId(userId);

    // // todos los usuarios van a la room "sala-todos"
    // socket.join('sala-todos');
  });
}
