// src/controllers/eventController.ts
import { Request, Response } from 'express';
import pool from '../../db/connection';
import { Event } from '../../types/entities';

// 1. Create a new event
export const createEvent = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { location_chat_id, date, creator_user_id, link, title, description } =
    req.body;

  const query = `
    INSERT INTO events (location_chat_id, date, creator_user_id, link, title, description, created_at, updated_at)
    VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
    RETURNING *;
  `;

  try {
    const result = await pool.query(query, [
      location_chat_id,
      date,
      creator_user_id,
      link,
      title,
      description,
    ]);
    const newEvent: Event = result.rows[0];
    res.status(201).json(newEvent);
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Error creating event:', error.message);
      res.status(500).json({ message: error.message });
    } else {
      console.error('An unknown error occurred:', error);
      res.status(500).json({ message: 'An unknown error occurred' });
    }
  }
};

// 2. Get all events for a location chat
export const getEventsByLocationChatId = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { location_chat_id } = req.params;

  const query = `
    SELECT * FROM events
    WHERE location_chat_id = $1 AND deleted_at IS NULL
    ORDER BY date;
  `;

  try {
    const result = await pool.query(query, [location_chat_id]);
    const events: Event[] = result.rows;
    res.status(200).json(events);
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Error fetching events:', error.message);
      res.status(500).json({ message: error.message });
    } else {
      console.error('An unknown error occurred:', error);
      res.status(500).json({ message: 'An unknown error occurred' });
    }
  }
};

// 3. Get an event by ID
export const getEventById = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { id } = req.params;

  const query = `
    SELECT * FROM events
    WHERE id = $1 AND deleted_at IS NULL;
  `;

  try {
    const result = await pool.query(query, [id]);
    if (result.rows.length === 0) {
      res.status(404).json({ message: 'Event not found' });
      return;
    }
    const event: Event = result.rows[0];
    res.status(200).json(event);
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Error fetching event:', error.message);
      res.status(500).json({ message: error.message });
    } else {
      console.error('An unknown error occurred:', error);
      res.status(500).json({ message: 'An unknown error occurred' });
    }
  }
};

// 4. Update an event by ID
export const updateEventById = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { id } = req.params;
  const { location_chat_id, date, creator_user_id, link, title, description } =
    req.body;

  const query = `
    UPDATE events
    SET location_chat_id = $1, date = $2, creator_user_id = $3, link = $4, title = $5, description = $6, updated_at = NOW()
    WHERE id = $7
    RETURNING *;
  `;

  try {
    const result = await pool.query(query, [
      location_chat_id,
      date,
      creator_user_id,
      link,
      title,
      description,
      id,
    ]);
    if (result.rows.length === 0) {
      res.status(404).json({ message: 'Event not found' });
      return;
    }
    const updatedEvent: Event = result.rows[0];
    res.status(200).json(updatedEvent);
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Error updating event:', error.message);
      res.status(500).json({ message: error.message });
    } else {
      console.error('An unknown error occurred:', error);
      res.status(500).json({ message: 'An unknown error occurred' });
    }
  }
};

// 5. Soft delete an event by ID
export const deleteEventById = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { id } = req.params;

  const query = `
    UPDATE events
    SET deleted_at = NOW()
    WHERE id = $1
    RETURNING *;
  `;

  try {
    const result = await pool.query(query, [id]);
    if (result.rows.length === 0) {
      res.status(404).json({ message: 'Event not found' });
      return;
    }
    const deletedEvent: Event = result.rows[0];
    res
      .status(200)
      .json({ message: 'Event deleted successfully', deletedEvent });
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Error deleting event:', error.message);
      res.status(500).json({ message: error.message });
    } else {
      console.error('An unknown error occurred:', error);
      res.status(500).json({ message: 'An unknown error occurred' });
    }
  }
};
