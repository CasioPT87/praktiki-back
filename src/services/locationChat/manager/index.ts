import { Namespace, Socket } from 'socket.io';
import { getAllLocationChats } from '..';
import { LocationChat } from '../../../types/entities';

class LocationChatsManager {
  locationChats: LocationChatManager[] = [];
  namespace: Namespace;

  constructor(textIO: Namespace) {
    this.namespace = textIO;
  }

  async addAllLocationChats() {
    const locationChats = await getAllLocationChats();
    if (locationChats) {
      locationChats.forEach((locationChat) => {
        const locationChatManager = new LocationChatManager(
          locationChat,
          this.namespace
        );
        this.addLocationChat(locationChatManager);
      });
    }
  }

  hasLocationChat(locationChatId: LocationChat['id']) {
    return this.locationChats.some(
      (locationChatManager) =>
        String(locationChatManager.locationChat.id) === String(locationChatId)
    );
  }

  addLocationChat(locationChatManager: LocationChatManager) {
    if (this.hasLocationChat(locationChatManager.locationChat.id)) return;
    this.locationChats.push(locationChatManager);
  }

  getLocationChat(
    locationChatId: LocationChat['id']
  ): LocationChatManager | undefined {
    const locationChat = this.locationChats.find(
      (each) => String(each.locationChat.id) === String(locationChatId)
    );
    return locationChat;
  }

  getLocationChatByName(roomName: LocationChatManager['name']) {
    const locationChat = this.locationChats.find(
      (each) => each.name === roomName
    );
    return locationChat;
  }

  getLocationChatByConnectedSocketId(socketId: Socket['id']) {
    const locationChat = this.locationChats.find((each) =>
      each.hasSocketId(socketId)
    );
    return locationChat;
  }
}

export class LocationChatManager {
  prefix: string = 'location-chat-';
  name: string;
  locationChat: LocationChat;
  namespace: Namespace;

  constructor(locationChat: LocationChat, namespace: Namespace) {
    this.name = this.prefix + locationChat.id;
    this.locationChat = locationChat;
    this.namespace = namespace;
  }

  getRoomConnectedSocketIds() {
    const socketIds = this.namespace.adapter.rooms.get(this.name);
    return socketIds;
  }

  hasSocketId(sockerId: Socket['id']) {
    return this.namespace.adapter.rooms.has(sockerId);
  }
}

export { LocationChatsManager };
