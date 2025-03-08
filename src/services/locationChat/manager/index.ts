import { getAllLocationChats } from '..';
import { LocationChat, LocationChatMessage } from '../../../types/entities';

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
    const locationChat = this.locationChats.find(
      (each) => String(each.locationChat.id) === String(locationChatId)
    );
    return locationChat;
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

  sendMessageToUsersConnected(messageText: string) {
    this.locationChatSocketManager.sendMessageToRoom(this.name, messageText);
  }
}

class LocationChatSocketManager {
  sendMessageToRoom(roomName: string, message: string) {
    io.to(roomName).emit('receiveMessage', { message });
  }
}

const GlobalLocationChatsManager = new LocationChatsManager();

export { GlobalLocationChatsManager };
