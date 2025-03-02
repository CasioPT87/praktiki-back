import { getAllLocationChats } from '..';
import { LocationChat, LocationChatMessage } from '../../../types/entities';
import { NotificationMessage } from '../../../types/utilities';
import { Channel, SocketManager } from '../../../utilities';
import { Server } from 'socket.io';

class LocationChatsManager {
  locationChats: LocationChatManager[] = [];

  async addAllLocationChats() {
    const locationChats = await getAllLocationChats();
    if (locationChats) {
      locationChats.forEach((locationChat) => {
        const locationChatManager = new LocationChatManager(locationChat);
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
    return this.locationChats.find(
      (each) => each.locationChat.id === locationChatId
    );
  }
}

export class LocationChatManager {
  prefix: string = 'location-chat-';
  name: string;
  locationChat: LocationChat;
  locationChatSocketManager: LocationChatSocketManager;

  constructor(locationChat: LocationChat) {
    this.name = this.prefix + locationChat.id;
    this.locationChat = locationChat;
    this.locationChatSocketManager = new LocationChatSocketManager();
  }

  sendMessageToUserConnected(messageText: string) {
    const locationChatId = String(this.locationChat.id);
    const locationChatMessage: NotificationMessage = {
      message: messageText,
      created: new Date(),
    };
    this.locationChatSocketManager.sendMessageToRoom(
      locationChatId,
      Channel.publicChatMessage,
      locationChatMessage
    );
  }
}

class LocationChatSocketManager {
  sendMessageToRoom(roomName: string, message: string) {
    io.to(roomName).emit(message);
  }
}

const GlobalLocationChatsManager = new LocationChatsManager();

export { GlobalLocationChatsManager };
