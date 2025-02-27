import { Server, Socket } from 'socket.io';
import { websockets as io } from '../../../index';

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
  constructor(userId: string, socketId: string) {
    this.userId = userId;
    this.roomManager = new UserRoomManager(socketId);
  }

  async joinLocationRoom(roomName: string) {
    if (
      this.roomManager.userCanJoinLocationRoom() &&
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

class UserSocketManager {
  socket: Socket | null = null;
  constructor(socketId: string) {
    this.socket = io.sockets.sockets.get(socketId) || null;
  }

  addRoom(roomName: string) {
    this.socket?.join(roomName);
  }

  leaveRoom(roomName: string) {
    this.socket?.leave(roomName);
  }
}

class UserRoomManager extends UserSocketManager {
  constructor(socketId: string) {
    super(socketId);
  }

  userCanJoinLocationRoom() {
    if (this.socket) {
      const socketId = this.socket.id;
      const locationRooms = Array.from(this.socket.rooms).filter(
        (room) => room !== socketId && !GENERAL_ROOMS.includes(room)
      );
      return locationRooms.length < NUM_MAX_ROOMS;
    }
  }

  async locationRoomCanAcceptUser(roomName: string, userId: string) {
    const roomSockets = await io.in(roomName).fetchSockets();
    return roomSockets.length < MAX_NUM_USERS_PER_ROOM;
  }
}

const GlobalUsersManager = new UsersManager();

export { GlobalUsersManager };
