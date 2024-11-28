import { createAdapter } from '@socket.io/redis-adapter';
import { createClient } from 'redis';
import { Server, Socket } from 'socket.io';

interface SocketIO extends Socket {
  user: any;
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
    console.log('hola');
    socket.on('chat message', (msg) => {
      console.log('message: ' + msg);
      // le mandamos el mensaje a todos los que esten en este canal, incluido el que lo ha enviado
      io.emit('chat message', msg);
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
