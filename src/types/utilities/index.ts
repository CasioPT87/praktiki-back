import { Request } from 'express';
import { User } from '../entities';

export type AuthorisedRequest = Request & { user: User };
