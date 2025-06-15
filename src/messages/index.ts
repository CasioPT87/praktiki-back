import { createAdapter } from '@socket.io/redis-adapter';
import { createClient } from 'redis';
import { Server, Socket } from 'socket.io';
import { getUserFromToken } from '../utils/auth';
import { UsersManager, UserManager } from '../services/user/manager';
import { LocationChatsManager } from '../services/locationChat/manager';
import { LocationChat, User } from '../types/entities';
import { GlobalPrivateChatsManager } from '../managers/call';
import videoChatController, {
  DisconnectionReason,
} from '../controllers/socket/video/videoChat';
import videoChatHelper from '../controllers/socket/video/helper';
import videoChatConnectionController from '../controllers/socket/video/videoConnection';
import locationChatController from '../controllers/socket/locationChat/locationChat';
import { RandomQueueChatManager } from '../managers/randomQueue';

const TEXT_NAMESPACE = '/text';
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

  global.globalLocationChatsManager = new LocationChatsManager(textIO);

  globalLocationChatsManager.addAllLocationChats();

  global.globalLocationChatUsersManager = new UsersManager();
  global.globalPrivateChatUsersManager = new UsersManager();

  global.globalPrivateChatsManager = new GlobalPrivateChatsManager({
    videoIONamespace: videoIO,
    usersManager: globalPrivateChatUsersManager,
  });

  const randomChatQueueManager = new RandomQueueChatManager();

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
        // anadimos al usuario al globalLocationChatUsersManager, por si acaso se hubiese desconectado o algo
        const userManager = new UserManager(user.id, socket.id);
        globalLocationChatUsersManager.addUser(userManager);
        const result = await locationChatController.join(socket)({
          locationChatId,
        });
        return callback(result);
      }
    );
    socket.on(
      'location-chat-message:create',
      locationChatController.createMessage(socket, user, textIO)
    );
    socket.on(
      'location-chat-messages:get',
      locationChatController.getMessages(socket)
    );
    socket.on(
      'location-chat-users:get',
      locationChatController.getLocationChatRoomUsers(socket, textIO)
    );
    socket.on(
      'location-chat:leave',
      locationChatController.onDisconnecting(socket, user)
    );
    socket.on(
      'disconnecting',
      locationChatController.onDisconnecting(socket, user)
    );
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

    socket.on('heartbeat', () => {});
    //

    socket.once(
      'disconnecting',
      videoChatController.onDisconnecting(user, videoIO)
    );

    socket.on('error', (err) => {
      socket.disconnect();
    });

    socket.on('private-chat:create', videoChatController.create(user));
    socket.on('private-chat:end', videoChatController.end(user, videoIO));
    socket.on(
      'private-chat-message:create',
      videoChatController.createMessage(videoIO)
    );
    socket.on(
      'private-chat:accept',
      videoChatConnectionController.accept(videoIO)
    );
    socket.on('offer:create', videoChatConnectionController.createdOffer);
    socket.on('offer:answer', videoChatConnectionController.answerOffer);
    socket.on(
      'ice-candidates:create',
      videoChatConnectionController.createdIceCandidate
    );
    // random query
    socket.on('private-chat-random-queue:add-user', () =>
      randomChatQueueManager.addUserQueryRandomChat(user.id, videoIO)
    );
    socket.on('private-chat-random-queue:remove-user', () =>
      randomChatQueueManager.removeUserQueryRandomChat(user.id)
    );
  });
}
