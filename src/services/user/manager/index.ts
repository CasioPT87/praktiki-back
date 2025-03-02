import { Server } from 'socket.io';
import { NotificationMessage } from '../../../types/utilities';
import { Channel, SocketManager } from '../../../utilities';
import { User } from '../../../types/entities';

const NUM_MAX_ROOMS = 1;
const MAX_NUM_USERS_PER_ROOM = 30;
const GENERAL_ROOMS: string[] = [];

class UsersManager {
  users: UserManager[] = [];

  addUser(user: UserManager) {
    if (!this.users.find((each) => each.userId === user.userId)) {
      this.users.push(user);
    }
  }

  getUser(userId: string) {
    return this.users.find((each) => each.userId === userId);
  }
}

export class UserManager {
  userId: string;
  roomManager: UserRoomManager;

  constructor(userId: string, socketId: string, io: Server) {
    this.userId = userId;
    this.roomManager = new UserRoomManager(socketId, io);
    this.joinSelfRoom(userId);
  }

  private joinSelfRoom(userId: string) {
    this.roomManager.addRoom(userId);
  }

  sendNotificationMessage(message: NotificationMessage) {
    this.roomManager.sendMessageToRoom(
      this.userId,
      Channel.notifications,
      message
    );
  }

  sendNotificationMessages(messages: NotificationMessage[]) {
    messages.forEach((message) => {
      this.sendNotificationMessage(message);
    });
  }

  async joinLocationRoom(roomName: string) {
    try {
      const userIsAlreadyInRoom = this.roomManager.userHasRoom(roomName);
      if (userIsAlreadyInRoom) return true;
    } catch (e) {
      if (e instanceof Error)
        throw new Error(e.message + ' for user: ' + this.userId);
    }
    if (
      this.roomManager.userCanJoinLocationRoom(this.userId) &&
      (await this.roomManager.locationRoomCanAcceptUser(roomName, this.userId))
    ) {
      this.roomManager.addRoom(roomName);
      return true;
    } else {
      return false;
    }
  }

  async leaveLocationRoom(roomName: string) {
    this.roomManager.leaveRoom(roomName);
  }
}

class UserRoomManager extends SocketManager {
  constructor(socketId: string, io: Server) {
    super(socketId, io);
  }

  userHasRoom(roomId: string) {
    if (this.socket) {
      return Array.from(this.socket.rooms).includes(roomId);
    }
    throw new Error(`User not connected to socket`);
  }

  userCanJoinLocationRoom(userId: User['id']) {
    if (this.socket) {
      const socketId = this.socket.id;
      const locationRooms = Array.from(this.socket.rooms).filter(
        (room) =>
          room !== socketId &&
          !GENERAL_ROOMS.includes(room) &&
          room !== String(userId)
      );
      return locationRooms.length < NUM_MAX_ROOMS;
    }
  }

  async locationRoomCanAcceptUser(roomName: string, userId: string) {
    const roomSockets = await this.io.in(roomName).fetchSockets();
    return roomSockets.length < MAX_NUM_USERS_PER_ROOM;
  }
}

const GlobalUsersManager = new UsersManager();

export { GlobalUsersManager };
