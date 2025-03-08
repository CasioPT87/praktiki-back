import { Request, Response } from 'express';
import { getAllLocationChats as getAllLocationChatsService } from '../services/locationChat';

export const getAllLocationChats = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const locations = await getAllLocationChatsService();
    if (!locations) throw new Error('Error fetching all locations');
    res.status(200).json(locations);
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Error fetching locations:', error.stack);
      res.status(500).json({ message: error.message });
    } else {
      console.error('An unknown error occurred:', error);
      res.status(500).json({ message: 'An unknown error occurred' });
    }
  }
};
