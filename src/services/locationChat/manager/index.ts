import { LocationChat, LocationChatMessage } from '../../../types/entities';
import { NotificationMessage } from '../../../types/utilities';
import { Channel, SocketManager } from '../../../utilities';
import { Server } from 'socket.io';

class LocationChatsManager {
  locationChats: LocationChatManager[] = [];

  addLocationChat(locationChatManager: LocationChatManager) {
    if (
      !this.locationChats.find(
        (each) => each.locationChat.id === locationChatManager.locationChat.id
      )
    ) {
      this.locationChats.push(locationChatManager);
    }
  }

  getUser(locationChatId: LocationChat['id']) {
    return this.locationChats.find(
      (each) => each.locationChat.id === locationChatId
    );
  }
}

class LocationChatManager {
  locationChat: LocationChat;
  locationChatSocketManager: LocationChatSocketManager;
  constructor(locationChat: LocationChat, socketId: string, io: Server) {
    this.locationChat = locationChat;
    this.locationChatSocketManager = new LocationChatSocketManager(
      socketId,
      io
    );
    this.joinSelfRoom(String(locationChat.id));
  }

  private joinSelfRoom(locationChatId: string) {
    this.locationChatSocketManager.addRoom(locationChatId);
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

class LocationChatSocketManager extends SocketManager {
  constructor(socketId: string, io: Server) {
    super(socketId, io);
  }
}
