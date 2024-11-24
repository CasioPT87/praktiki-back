// src/controllers/eventAttendanceController.ts
import { Request, Response } from 'express';
import pool from '../../db/connection';
import { EventAttendance } from '../../types/entities';

// 1. Add a user to an event (create attendance)
export const addEventAttendance = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { event_id, user_id } = req.body;

  const query = `
    INSERT INTO event_attendance (event_id, user_id, created_at, updated_at)
    VALUES ($1, $2, NOW(), NOW())
    RETURNING *;
  `;

  try {
    const result = await pool.query(query, [event_id, user_id]);
    const newAttendance: EventAttendance = result.rows[0];
    res.status(201).json(newAttendance);
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Error adding event attendance:', error.message);
      res.status(500).json({ message: error.message });
    } else {
      console.error('An unknown error occurred:', error);
      res.status(500).json({ message: 'An unknown error occurred' });
    }
  }
};

// 2. Get all attendees for a specific event
export const getEventAttendees = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { event_id } = req.params;

  const query = `
    SELECT * FROM event_attendance
    WHERE event_id = $1 AND deleted_at IS NULL;
  `;

  try {
    const result = await pool.query(query, [event_id]);
    const attendees: EventAttendance[] = result.rows;
    res.status(200).json(attendees);
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Error fetching event attendees:', error.message);
      res.status(500).json({ message: error.message });
    } else {
      console.error('An unknown error occurred:', error);
      res.status(500).json({ message: 'An unknown error occurred' });
    }
  }
};

// 3. Get all events a user has attended
export const getUserEventAttendances = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { user_id } = req.params;

  const query = `
    SELECT * FROM event_attendance
    WHERE user_id = $1 AND deleted_at IS NULL;
  `;

  try {
    const result = await pool.query(query, [user_id]);
    const attendances: EventAttendance[] = result.rows;
    res.status(200).json(attendances);
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Error fetching user event attendances:', error.message);
      res.status(500).json({ message: error.message });
    } else {
      console.error('An unknown error occurred:', error);
      res.status(500).json({ message: 'An unknown error occurred' });
    }
  }
};

// 4. Remove a user's attendance from an event (soft delete)
export const removeEventAttendance = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { id } = req.params;

  const query = `
    UPDATE event_attendance
    SET deleted_at = NOW()
    WHERE id = $1
    RETURNING *;
  `;

  try {
    const result = await pool.query(query, [id]);
    if (result.rows.length === 0) {
      res.status(404).json({ message: 'Event attendance not found' });
      return;
    }
    const removedAttendance: EventAttendance = result.rows[0];
    res
      .status(200)
      .json({ message: 'Attendance removed successfully', removedAttendance });
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Error removing event attendance:', error.message);
      res.status(500).json({ message: error.message });
    } else {
      console.error('An unknown error occurred:', error);
      res.status(500).json({ message: 'An unknown error occurred' });
    }
  }
};
