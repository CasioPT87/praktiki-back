import { Socket } from 'socket.io';
import { User } from '../../../types/entities';

class UsersManager {
  users: UserManager[] = [];

  addUser(user: UserManager): boolean {
    if (!this.users.find((each) => each.userId === user.userId)) {
      this.users.push(user);
      return true;
    }
    return false;
  }

  getUser(userId: User['id']): UserManager | null {
    return this.users.find((each) => each.userId === userId) || null;
  }

  getUserBySocketId(socketId: Socket['id']) {
    return this.users.find((each) => each.socketId === socketId) || null;
  }

  removeUser(userId: User['id']) {
    this.users = this.users.filter((each) => each.userId !== userId);
  }
}

export class UserManager {
  prefix: string = 'user-';
  name: string;
  userId: User['id'];
  socketId: Socket['id'];

  constructor(userId: User['id'], socketId: Socket['id']) {
    this.name = this.prefix + String(userId);
    this.userId = userId;
    this.socketId = socketId;
  }

  updateSocketId(socketId: Socket['id']) {
    this.socketId = socketId;
  }
}

const GlobalUsersManager = new UsersManager();

export { GlobalUsersManager };
