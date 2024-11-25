// src/controllers/locationChatMessageController.ts
import { Request, Response } from 'express';
import pool from '../../db/connection';
import { LocationChatMessage } from '../../types/entities';

// 1. Create a new location chat message
export const createLocationChatMessage = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { user_id, location_chat_id, text } = req.body;

  const query = `
    INSERT INTO location_chat_messages (user_id, location_chat_id, text, created_at, updated_at)
    VALUES ($1, $2, $3, NOW(), NOW())
    RETURNING *;
  `;

  try {
    const result = await pool.query(query, [user_id, location_chat_id, text]);
    const newLocationChatMessage: LocationChatMessage = result.rows[0];
    res.status(201).json(newLocationChatMessage);
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Error creating location chat message:', error.message);
      res.status(500).json({ message: error.message });
    } else {
      console.error('An unknown error occurred:', error);
      res.status(500).json({ message: 'An unknown error occurred' });
    }
  }
};

// 2. Get all location chat messages for a specific location chat
export const getLocationChatMessagesByLocationChat = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { location_chat_id } = req.params;

  const query = `
    SELECT * FROM location_chat_messages 
    WHERE location_chat_id = $1 AND deleted_at IS NULL
    ORDER BY created_at;
  `;

  try {
    const result = await pool.query(query, [location_chat_id]);
    const locationChatMessages: LocationChatMessage[] = result.rows;
    res.status(200).json(locationChatMessages);
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Error fetching location chat messages:', error.message);
      res.status(500).json({ message: error.message });
    } else {
      console.error('An unknown error occurred:', error);
      res.status(500).json({ message: 'An unknown error occurred' });
    }
  }
};

// 3. Get a location chat message by ID
export const getLocationChatMessageById = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { id } = req.params;

  const query = `
    SELECT * FROM location_chat_messages 
    WHERE id = $1 AND deleted_at IS NULL;
  `;

  try {
    const result = await pool.query(query, [id]);
    if (result.rows.length === 0) {
      res.status(404).json({ message: 'Location chat message not found' });
      return;
    }
    const locationChatMessage: LocationChatMessage = result.rows[0];
    res.status(200).json(locationChatMessage);
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Error fetching location chat message:', error.message);
      res.status(500).json({ message: error.message });
    } else {
      console.error('An unknown error occurred:', error);
      res.status(500).json({ message: 'An unknown error occurred' });
    }
  }
};

// 4. Update a location chat message by ID
export const updateLocationChatMessageById = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { id } = req.params;
  const { text } = req.body;

  const query = `
    UPDATE location_chat_messages
    SET text = $1, updated_at = NOW()
    WHERE id = $2
    RETURNING *;
  `;

  try {
    const result = await pool.query(query, [text, id]);
    if (result.rows.length === 0) {
      res.status(404).json({ message: 'Location chat message not found' });
      return;
    }
    const updatedLocationChatMessage: LocationChatMessage = result.rows[0];
    res.status(200).json(updatedLocationChatMessage);
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Error updating location chat message:', error.message);
      res.status(500).json({ message: error.message });
    } else {
      console.error('An unknown error occurred:', error);
      res.status(500).json({ message: 'An unknown error occurred' });
    }
  }
};

// 5. Soft delete a location chat message by ID
export const deleteLocationChatMessageById = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { id } = req.params;

  const query = `
    UPDATE location_chat_messages
    SET deleted_at = NOW()
    WHERE id = $1
    RETURNING *;
  `;

  try {
    const result = await pool.query(query, [id]);
    if (result.rows.length === 0) {
      res.status(404).json({ message: 'Location chat message not found' });
      return;
    }
    const deletedLocationChatMessage: LocationChatMessage = result.rows[0];
    res.status(200).json({
      message: 'Location chat message deleted successfully',
      deletedLocationChatMessage,
    });
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Error deleting location chat message:', error.message);
      res.status(500).json({ message: error.message });
    } else {
      console.error('An unknown error occurred:', error);
      res.status(500).json({ message: 'An unknown error occurred' });
    }
  }
};
