import { Server, Socket } from 'socket.io';
import { NotificationMessage } from '../types/utilities';

export enum Channel {
  notifications = 'notificacions',
  publicChatMessage = 'publicChatMessage',
  privateChatMessage = 'privateChatMessage',
}

export class SocketManager {
  socket: Socket | null = null;
  io: Server;
  constructor(socketId: string, io: Server) {
    this.socket = io.sockets.sockets.get(socketId) || null;
    this.io = io;
  }

  sendMessageToRoom(
    userId: string,
    channel: Channel,
    message: NotificationMessage
  ) {
    this.io.to(userId).emit('notifications', message);
  }

  addRoom(roomName: string) {
    this.socket?.join(roomName);
  }

  leaveRoom(roomName: string) {
    this.socket?.leave(roomName);
  }
}
