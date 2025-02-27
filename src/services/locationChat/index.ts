// src/controllers/locationChatController.ts
import { Request, Response } from 'express';
import pool from '../../db/connection';
import { LocationChat } from '../../types/entities';

// 1. Create a new location chat
export const createLocationChat = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { location_id, languages_id } = req.body;

  const query = `
    INSERT INTO location_chats (location_id, languages_id, created_at, updated_at)
    VALUES ($1, $2, NOW(), NOW())
    RETURNING *;
  `;

  try {
    const result = await pool.query(query, [location_id, languages_id]);
    const newLocationChat: LocationChat = result.rows[0];
    res.status(201).json(newLocationChat);
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Error creating location chat:', error.message);
      res.status(500).json({ message: error.message });
    } else {
      console.error('An unknown error occurred:', error);
      res.status(500).json({ message: 'An unknown error occurred' });
    }
  }
};

// 2. Get all location chats
export const getAllLocationChats = async (
  req: Request,
  res: Response
): Promise<void> => {
  const query =
    'SELECT * FROM location_chats WHERE deleted_at IS NULL ORDER BY created_at;';

  try {
    const result = await pool.query(query);
    const locationChats: LocationChat[] = result.rows;
    res.status(200).json(locationChats);
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Error fetching location chats:', error.message);
      res.status(500).json({ message: error.message });
    } else {
      console.error('An unknown error occurred:', error);
      res.status(500).json({ message: 'An unknown error occurred' });
    }
  }
};

// 3. Get a location chat by ID
export const getLocationChatById = async (
  roomId: string
): Promise<LocationChat | null> => {
  const query =
    'SELECT * FROM location_chats WHERE id = $1 AND deleted_at IS NULL;';

  try {
    const result = await pool.query(query, [roomId]);
    const locationChat: LocationChat = result.rows[0];
    return locationChat;
  } catch (error) {
    console.error(error);
    return null;
  }
};

// 4. Update a location chat by ID
export const updateLocationChatById = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { id } = req.params;
  const { location_id, languages_id } = req.body;

  const query = `
    UPDATE location_chats
    SET location_id = $1, languages_id = $2, updated_at = NOW()
    WHERE id = $3
    RETURNING *;
  `;

  try {
    const result = await pool.query(query, [location_id, languages_id, id]);
    if (result.rows.length === 0) {
      res.status(404).json({ message: 'Location chat not found' });
      return;
    }
    const updatedLocationChat: LocationChat = result.rows[0];
    res.status(200).json(updatedLocationChat);
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Error updating location chat:', error.message);
      res.status(500).json({ message: error.message });
    } else {
      console.error('An unknown error occurred:', error);
      res.status(500).json({ message: 'An unknown error occurred' });
    }
  }
};

// 5. Soft delete a location chat by ID
export const deleteLocationChatById = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { id } = req.params;

  const query = `
    UPDATE location_chats
    SET deleted_at = NOW()
    WHERE id = $1
    RETURNING *;
  `;

  try {
    const result = await pool.query(query, [id]);
    if (result.rows.length === 0) {
      res.status(404).json({ message: 'Location chat not found' });
      return;
    }
    const deletedLocationChat: LocationChat = result.rows[0];
    res.status(200).json({
      message: 'Location chat deleted successfully',
      deletedLocationChat,
    });
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Error deleting location chat:', error.message);
      res.status(500).json({ message: error.message });
    } else {
      console.error('An unknown error occurred:', error);
      res.status(500).json({ message: 'An unknown error occurred' });
    }
  }
};
