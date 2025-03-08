import { Socket } from 'socket.io';
import { getAllLocationChats } from '..';
import {
  LocationChat,
  LocationChatMessage,
  User,
} from '../../../types/entities';

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

  async joinLocationChatRoom(socket: Socket, userId: User['id']) {
    try {
      const userIsAlreadyInRoom = this.userHasRoom(roomName);
      if (userIsAlreadyInRoom) return true;
    } catch (e) {
      if (e instanceof Error)
        throw new Error(e.message + ' for user: ' + this.userId);
    }
    if (
      this.roomManager.userCanJoinLocationRoom(Number(this.userId)) &&
      (await this.roomManager.locationRoomCanAcceptUser(roomName, this.userId))
    ) {
      this.roomManager.addRoom(roomName);

      return true;
    } else {
      return false;
    }
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
}

class LocationChatSocketManager {
  sendMessageToRoom(roomName: string, message: string) {
    io.to(roomName).emit('receiveMessage', { message });
  }
}

const GlobalLocationChatsManager = new LocationChatsManager();

export { GlobalLocationChatsManager };
