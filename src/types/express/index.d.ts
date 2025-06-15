import { GlobalPrivateChatsManager } from '../../managers/call';
import { RandomQueueChatManager } from '../../managers/randomQueue';
import { LocationChatsManager } from '../../services/locationChat/manager';
import { UsersManager } from '../../services/user/manager';
import { User } from '../entities';
import { Namespace, Server } from 'socket.io';

declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
  var io: Server; // This will make `io` globally available
  var globalPrivateChatUsersManager: UsersManager;
  var globalLocationChatUsersManager: UsersManager;
  var globalLocationChatsManager: LocationChatsManager;
  var globalPrivateChatsManager: GlobalPrivateChatsManager;
  var globarRandomChatQueue: RandomQueueChatManager;
}

export {};
