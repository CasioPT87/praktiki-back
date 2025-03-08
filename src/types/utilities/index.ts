import { Request } from 'express';
import { User } from '../entities';

export type AuthorisedRequest = Request & { user: User };

type Message = {
  content: string;
  created: Date;
};

export interface NotificationMessage extends Message {}
export interface LocationChatClientMessage extends Message {}
export interface PrivateChatMessage extends Message {}
