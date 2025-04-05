import { Namespace } from 'socket.io';
import { User } from '../../types/entities';
import { UsersManager } from '../../services/user/manager';
import crypto from 'crypto';

enum Connection {
  pending = 'pendig',
  onGoing = 'ongoin',
  finished = 'finished',
}

class PrivateChatManager<T extends Connection> {
  id: string;
  creatorUserId: User['id'];
  targetUserId: User['id'];
  textIONamespace: Namespace;
  videoIONamespace: Namespace;
  connected: Connection;
  usersManager: UsersManager;

  constructor({
    creatorUserId,
    targetUserId,
    textIONamespace,
    videoIONamespace,
    connected,
    usersManager,
  }: {
    creatorUserId: User['id'];
    targetUserId: User['id'];
    textIONamespace: Namespace;
    videoIONamespace: Namespace;
    connected: T;
    usersManager: UsersManager;
  }) {
    this.id = crypto.randomUUID();
    this.creatorUserId = creatorUserId;
    this.targetUserId = targetUserId;
    this.textIONamespace = textIONamespace;
    this.videoIONamespace = videoIONamespace;
    this.connected = connected;
    this.usersManager = usersManager;
  }

  async getSocketFromUserId(userId: User['id']) {
    const userManager = this.usersManager.getUser(userId);
    if (userManager) {
      const socketId = userManager.socketId;
      const socket = await this.videoIONamespace.sockets.get(socketId);
      if (!socket) {
        throw new Error(
          'socket is not in videoIONamespace for user: ' + userId
        );
      }
      return socket || null;
    } else {
      throw new Error('could not find user: ' + userId);
    }
  }

  async create() {
    const targetUserSocket = await this.getSocketFromUserId(this.targetUserId);
    targetUserSocket.emit('private-chat:create', {
      privateChatId: this.id,
      requestCreatorUserId: this.creatorUserId,
    });
    return this;
  }

  accept() {
    this.connected = Connection.onGoing;
  }

  connect() {}

  disconnect() {}
}

class GlobalPrivateChatsManager {
  privateChatRequests: PrivateChatManager<Connection.pending>[] = [];
  privateChatsOngoing: PrivateChatManager<Connection.onGoing>[] = [];
  textIONamespace: Namespace;
  videoIONamespace: Namespace;
  usersManager: UsersManager;

  constructor({
    textIONamespace,
    videoIONamespace,
    usersManager,
  }: {
    textIONamespace: Namespace;
    videoIONamespace: Namespace;
    usersManager: UsersManager;
  }) {
    this.textIONamespace = textIONamespace;
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
    const privateChatRequests = await new PrivateChatManager({
      creatorUserId,
      targetUserId,
      textIONamespace: this.textIONamespace,
      videoIONamespace: this.videoIONamespace,
      connected: Connection.pending,
      usersManager: this.usersManager,
    }).create();
    this.privateChatRequests = [
      ...this.privateChatRequests,
      privateChatRequests,
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

  addOngoing({
    privateChat,
  }: {
    privateChat: PrivateChatManager<Connection.onGoing>;
  }) {
    this.privateChatsOngoing = [...this.privateChatsOngoing, privateChat];
  }

  acceptRequest(privateChatId: string) {
    const privateChatRequest = this.privateChatRequests.find(
      (chat) => chat.id === privateChatId
    );
    if (privateChatRequest) {
      this.removeRequest({ privateChatRequest });
      privateChatRequest.accept();
      this.addOngoing({ privateChat: privateChatRequest });
      privateChatRequest.connect();
    }
  }
}

export { GlobalPrivateChatsManager };
