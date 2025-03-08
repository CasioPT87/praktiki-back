import { Socket } from 'socket.io';
import { NotificationMessage } from '../types/utilities';

export enum Channel {
  // receive
  receiveNotification = 'receiveNotification',
  receiveLocalChatMessage = 'receiveLocalChatMessage',
  receivePrivateChatMessage = 'receivePrivateChatMessage',
  // emit
  emitNotification = 'emitNotification',
  emitLocalChatMessage = 'emitLocalChatMessage',
  emitPrivateChatMessage = 'emitPrivateChatMessage',
}

export class SocketManager {
  socket: Socket;
  constructor(socket: Socket) {
    this.socket = socket;
  }

  sendMessageToRoom(
    roomName: string,
    channel: Channel,
    message: NotificationMessage
  ) {
    io.to(roomName).emit(channel, message);
  }

  async addRoom(roomName: string | number) {
    this.socket.join(String(roomName));
  }

  leaveRoom(roomName: string) {
    this.socket.leave(roomName);
  }

  roomHasUser(roomName: string) {
    return Array.from(this.socket.rooms).includes(roomName);
  }
}
