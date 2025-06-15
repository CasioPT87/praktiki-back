import { Namespace } from 'socket.io';
import { PrivateChatRequest, User } from '../../types/entities';
import { UsersManager } from '../../services/user/manager';
import crypto from 'crypto';

export enum Connection {
  pending = 'pendig',
  onGoing = 'ongoin',
  finished = 'finished',
}

class PrivateChatManager<T extends Connection> {
  id: string;
  creatorUserId: User['id'];
  targetUserId: User['id'];
  videoIONamespace: Namespace;
  connected: Connection;
  usersManager: UsersManager;

  constructor({
    creatorUserId,
    targetUserId,
    videoIONamespace,
    connected,
    usersManager,
  }: {
    creatorUserId: User['id'];
    targetUserId: User['id'];
    videoIONamespace: Namespace;
    connected: T;
    usersManager: UsersManager;
  }) {
    this.id = crypto.randomUUID();
    this.creatorUserId = creatorUserId;
    this.targetUserId = targetUserId;
    this.videoIONamespace = videoIONamespace;
    this.connected = connected;
    this.usersManager = usersManager;
  }

  async getSocketFromUserId(userId: User['id']) {
    const userManager = this.usersManager.getUserByUserId(userId);
    if (userManager) {
      const socketId = userManager.socketId;
      const socket = await this.videoIONamespace.sockets.get(socketId);
      if (!socket) {
        console.warn('socket is not in videoIONamespace for user: ' + userId);
        return null;
      }
      return socket;
    } else {
      console.error('could not find user: ' + userId);
      return null;
    }
  }

  async create() {
    const targetUserSocket = await this.getSocketFromUserId(this.targetUserId);
    if (!targetUserSocket) {
      console.warn(
        'could not create request. user target does not exist anymore'
      );
      return null;
    }
    targetUserSocket.emit('private-chat:create', {
      privateChatId: this.id,
      requestCreatorUserId: this.creatorUserId,
    });
    return this;
  }

  accept() {
    this.connected = Connection.onGoing;
  }

  finish() {
    this.connected = Connection.finished;
  }
}

class GlobalPrivateChatsManager {
  privateChatRequests: PrivateChatManager<Connection.pending>[] = [];
  privateChatsOngoing: PrivateChatManager<Connection.onGoing>[] = [];
  videoIONamespace: Namespace;
  usersManager: UsersManager;

  constructor({
    videoIONamespace,
    usersManager,
  }: {
    videoIONamespace: Namespace;
    usersManager: UsersManager;
  }) {
    this.videoIONamespace = videoIONamespace;
    this.usersManager = usersManager;
  }

  async addRequest({
    creatorUserId,
    targetUserId,
  }: {
    creatorUserId: User['id'];
    targetUserId: User['id'];
  }) {
    if (this.requestExistsAlready({ creatorUserId, targetUserId })) {
      return;
    }
    const privateChatRequest = await new PrivateChatManager({
      creatorUserId,
      targetUserId,
      videoIONamespace: this.videoIONamespace,
      connected: Connection.pending,
      usersManager: this.usersManager,
    }).create();
    this.privateChatRequests = [
      ...this.privateChatRequests,
      privateChatRequest,
    ];
  }

  requestExistsAlready({
    creatorUserId,
    targetUserId,
  }: {
    creatorUserId: User['id'];
    targetUserId: User['id'];
  }) {
    const exists = this.privateChatRequests.some(
      (request) =>
        (request.creatorUserId === creatorUserId &&
          request.targetUserId === targetUserId) ||
        (request.creatorUserId === targetUserId &&
          request.targetUserId === creatorUserId)
    );
    return exists;
  }

  removeRequest({
    privateChatRequest,
  }: {
    privateChatRequest: PrivateChatManager<Connection.pending>;
  }) {
    let privateChatRequests = this.privateChatRequests.filter(
      (chat) => chat.id !== privateChatRequest.id
    );
    this.privateChatRequests = [...privateChatRequests];
  }

  removeOngoing({
    privateChatOngoing,
  }: {
    privateChatOngoing: PrivateChatManager<Connection.onGoing>;
  }) {
    let privateChatsOngoing = this.privateChatsOngoing.filter(
      (chat) => chat.id !== privateChatOngoing.id
    );
    this.privateChatsOngoing = [...privateChatsOngoing];
  }

  addOngoing({
    privateChat,
  }: {
    privateChat: PrivateChatManager<Connection.onGoing>;
  }) {
    this.privateChatsOngoing = [...this.privateChatsOngoing, privateChat];
  }

  getAllPrivateChatsForUserId({
    userId,
  }: {
    userId: User['id'];
  }): Array<PrivateChatManager<Connection.pending | Connection.onGoing>> {
    const userRequests = this.privateChatRequests.filter((each) =>
      [each.creatorUserId, each.targetUserId].includes(userId)
    );
    const userOngoing = this.privateChatsOngoing.filter((each) =>
      [each.creatorUserId, each.targetUserId].includes(userId)
    );
    return [...userRequests, ...userOngoing];
  }

  async finishConnectionsForUserId({ userId }: { userId: User['id'] }) {
    const connections = this.getAllPrivateChatsForUserId({ userId });
    await Promise.allSettled(
      connections.map((conn) => {
        if (conn.connected === Connection.pending)
          this.removeRequest({ privateChatRequest: conn });
        if (conn.connected === Connection.onGoing)
          this.removeOngoing({ privateChatOngoing: conn });
        conn.finish();
      })
    ).catch((e) => {
      console.error(e.stack);
    });
  }

  acceptRequest(privateChatId: string) {
    const privateChatRequest = this.privateChatRequests.find(
      (chat) => chat.id === privateChatId
    );
    if (privateChatRequest) {
      this.removeRequest({ privateChatRequest });
      privateChatRequest.accept();
      this.addOngoing({ privateChat: privateChatRequest });
      return privateChatRequest;
    }
  }

  getByIdAndState({ id, state }: { id: string; state: Connection }) {
    let privateChats = [];
    if (state === Connection.pending) {
      privateChats = this.privateChatRequests;
      const privateChat = privateChats.find((each) => each.id === id);
      return privateChat || null;
    } else if (state === Connection.onGoing) {
      privateChats = this.privateChatsOngoing;
      const privateChat = privateChats.find((each) => each.id === id);
      return privateChat || null;
    }

    return null;
  }
}

export { GlobalPrivateChatsManager, PrivateChatManager };
