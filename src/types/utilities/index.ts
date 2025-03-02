import { Request } from 'express';
import { User } from '../entities';

export type AuthorisedRequest = Request & { user: User };

export type NotificationMessage = {
  message: string;
  created: Date;
};
