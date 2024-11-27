const tokenService = require('../services/tokenService');
const { createAdapter } = require('@socket.io/redis-adapter');
const { createClient } = require('redis');
import { Server, Socket } from 'socket.io';

interface SocketIO extends Socket {
  user: any;
}

export default async function messages(io: Server) {
  if (process.env.NODE_ENV !== 'test') {
    const redisClientPub = await createClient({
      url: 'redis://default:Genei2020*@cache:6379',
    }).connect();
    const redisClientSub = await redisClientPub.duplicate().connect();

    io.adapter(createAdapter(redisClientPub, redisClientSub));
  }

  io.use(async function (socket: Socket, next) {
    if (socket.handshake.auth) {
      const tokenInfo = tokenService.decodeToken(socket.handshake.auth.token);
      if (!tokenInfo) return next(new Error('Authentication error'));
      socket = Object.assign(socket, { user: tokenInfo }) as SocketIO;
      next();
    } else {
      next(new Error('Authentication error'));
    }
  });

  io.on('connect', async (socket) => {
    const _socket = socket as SocketIO;
    const userId = _socket?.user?.userId;
    if (!userId) return;

    //anadimos al usuario a una room para el solo
    socket.join(userId.toString());

    // const user = await usersService.obtenerUsuarioId(userId);

    // todos los usuarios van a la room "sala-todos"
    socket.join('sala-todos');
  });

  global.messages = messages;
}
