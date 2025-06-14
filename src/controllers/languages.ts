import { Request, Response } from 'express';
import { getAllLanguages as getAllLanguagesService } from '../services/language';

export const getAllLanguages = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const languages = await getAllLanguagesService();
    if (!languages) throw new Error('Error fetching all languages');
    res.status(200).json(languages);
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Error fetching languages:', error.stack);
      res.status(500).json({ message: error.message });
    } else {
      console.error('An unknown error occurred:', error);
      res.status(500).json({ message: 'An unknown error occurred' });
    }
  }
};
