import { User } from '../entities';
import { Server } from 'socket.io';

declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
  var io: Server; // This will make `io` globally available
}

export {};
