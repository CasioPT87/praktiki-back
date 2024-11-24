// src/controllers/eventCommentController.ts
import { Request, Response } from 'express';
import pool from '../../db/connection';
import { EventComment } from '../../types/entities';

// 1. Create a new event comment (create)
export const createEventComment = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { location_chat_id, text, user_id } = req.body;

  const query = `
    INSERT INTO event_comment (location_chat_id, text, user_id, created_at, updated_at)
    VALUES ($1, $2, $3, NOW(), NOW())
    RETURNING *;
  `;

  try {
    const result = await pool.query(query, [location_chat_id, text, user_id]);
    const newEventComment: EventComment = result.rows[0];
    res.status(201).json(newEventComment);
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Error creating event comment:', error.message);
      res.status(500).json({ message: error.message });
    } else {
      console.error('An unknown error occurred:', error);
      res.status(500).json({ message: 'An unknown error occurred' });
    }
  }
};

// 2. Get all comments for an event
export const getEventComments = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { location_chat_id } = req.params;

  const query = `
    SELECT * FROM event_comment
    WHERE location_chat_id = $1 AND deleted_at IS NULL
    ORDER BY created_at DESC;
  `;

  try {
    const result = await pool.query(query, [location_chat_id]);
    const comments: EventComment[] = result.rows;
    res.status(200).json(comments);
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Error fetching event comments:', error.message);
      res.status(500).json({ message: error.message });
    } else {
      console.error('An unknown error occurred:', error);
      res.status(500).json({ message: 'An unknown error occurred' });
    }
  }
};

// 3. Soft delete an event comment (mark as deleted)
export const deleteEventComment = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { id } = req.params;

  const query = `
    UPDATE event_comment
    SET deleted_at = NOW()
    WHERE id = $1
    RETURNING *;
  `;

  try {
    const result = await pool.query(query, [id]);
    if (result.rows.length === 0) {
      res.status(404).json({ message: 'Event comment not found' });
      return;
    }
    const deletedEventComment: EventComment = result.rows[0];
    res
      .status(200)
      .json({
        message: 'Event comment deleted successfully',
        deletedEventComment,
      });
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Error deleting event comment:', error.message);
      res.status(500).json({ message: error.message });
    } else {
      console.error('An unknown error occurred:', error);
      res.status(500).json({ message: 'An unknown error occurred' });
    }
  }
};
