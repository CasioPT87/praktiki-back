import { Namespace } from 'socket.io';
import { User } from '../../types/entities';

enum Connection {
  pending = 'pendig',
  onGoing = 'ongoin',
  finished = 'finished',
}

class PrivateChatManager<T extends Connection> {
  id: symbol = Symbol('private chat');
  creatorUserId: User['id'];
  targetUserId: User['id'] | null = null;
  textIONamespace: Namespace;
  videoIONamespace: Namespace;
  connected: T;

  constructor({
    creatorUserId,
    targetUserId,
    textIONamespace,
    videoIONamespace,
  }: {
    creatorUserId: User['id'];
    targetUserId: User['id'];
    textIONamespace: Namespace;
    videoIONamespace: Namespace;
  }) {
    this.creatorUserId = creatorUserId;
    this.targetUserId = targetUserId;
    this.textIONamespace = textIONamespace;
    this.videoIONamespace = videoIONamespace;
    this.connected = Connection.pending;
  }

  sendRequest() {}

  connect() {}

  disconnect() {}
}

class GlobalPrivateChatManager {
  privateChatRequests: PrivateChatManager<Connection.pending>[] = [];
  privateChatsOngoing: PrivateChatManager<Connection.onGoing>[] = [];
  textIONamespace: Namespace;
  videoIONamespace: Namespace;

  constructor({
    textIONamespace,
    videoIONamespace,
  }: {
    textIONamespace: Namespace;
    videoIONamespace: Namespace;
  }) {
    this.textIONamespace = textIONamespace;
    this.videoIONamespace = videoIONamespace;
  }

  addCall({ creator }: { creator: User }) {
    const call = new PrivateChatManager({
      creator,
      textIONamespace: this.textIONamespace,
      videoIONamespace: this.videoIONamespace,
    });
    this.calls = [...this.calls, call];
  }
}
