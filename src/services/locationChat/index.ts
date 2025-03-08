// src/controllers/locationChatController.ts
import { Request, Response } from 'express';
import pool from '../../db/connection';
import { LocationChat } from '../../types/entities';

export const getAllLocationChats = async (): Promise<LocationChat[] | null> => {
  const query = `SELECT * FROM location_chat 
     JOIN location ON location_chat.location_id = location.id
     WHERE location_chat.deleted_at IS NULL ORDER BY location_chat.created_at;`;

  try {
    const result = await pool.query(query);
    const locationChats: LocationChat[] = result.rows;
    return locationChats;
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Error fetching location chats:', error.stack);
    }
    return null;
  }
};
