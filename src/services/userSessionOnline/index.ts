import { Request, Response } from 'express';
import pool from '../../db/connection';
import { UserSessionOnline } from '../../types/entities';

// 1. Create a new user session
export const createUserSession = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { user_id, start, end } = req.body;

  const query = `
    INSERT INTO user_sessions_online (user_id, start, end)
    VALUES ($1, $2, $3)
    RETURNING *;
  `;

  try {
    const result = await pool.query(query, [user_id, start, end]);
    const newUserSession: UserSessionOnline = result.rows[0];
    res.status(201).json(newUserSession);
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Error creating user session:', error.message);
      res.status(500).json({ message: error.message });
    } else {
      console.error('An unknown error occurred:', error);
      res.status(500).json({ message: 'An unknown error occurred' });
    }
  }
};

// 2. Get all user sessions
export const getAllUserSessions = async (
  req: Request,
  res: Response
): Promise<void> => {
  const query = 'SELECT * FROM user_sessions_online;';

  try {
    const result = await pool.query(query);
    const sessions: UserSessionOnline[] = result.rows;
    res.status(200).json(sessions);
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Error fetching user sessions:', error.message);
      res.status(500).json({ message: error.message });
    } else {
      console.error('An unknown error occurred:', error);
      res.status(500).json({ message: 'An unknown error occurred' });
    }
  }
};

// 3. Get user session by ID
export const getUserSessionById = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { id } = req.params;

  const query = 'SELECT * FROM user_sessions_online WHERE id = $1;';

  try {
    const result = await pool.query(query, [id]);
    if (result.rows.length === 0) {
      res.status(404).json({ message: 'User session not found' });
      return;
    }
    const session: UserSessionOnline = result.rows[0];
    res.status(200).json(session);
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Error fetching user session:', error.message);
      res.status(500).json({ message: error.message });
    } else {
      console.error('An unknown error occurred:', error);
      res.status(500).json({ message: 'An unknown error occurred' });
    }
  }
};

// 4. Update a user session by ID
export const updateUserSessionById = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { id } = req.params;
  const { user_id, start, end } = req.body;

  const query = `
    UPDATE user_sessions_online
    SET user_id = $1, start = $2, end = $3
    WHERE id = $4
    RETURNING *;
  `;

  try {
    const result = await pool.query(query, [user_id, start, end, id]);
    if (result.rows.length === 0) {
      res.status(404).json({ message: 'User session not found' });
      return;
    }
    const updatedSession: UserSessionOnline = result.rows[0];
    res.status(200).json(updatedSession);
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Error updating user session:', error.message);
      res.status(500).json({ message: error.message });
    } else {
      console.error('An unknown error occurred:', error);
      res.status(500).json({ message: 'An unknown error occurred' });
    }
  }
};

// 5. Delete a user session by ID
export const deleteUserSessionById = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { id } = req.params;

  const query = `
    DELETE FROM user_sessions_online
    WHERE id = $1
    RETURNING *;
  `;

  try {
    const result = await pool.query(query, [id]);
    if (result.rows.length === 0) {
      res.status(404).json({ message: 'User session not found' });
      return;
    }
    res.status(200).json({ message: 'User session deleted successfully' });
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Error deleting user session:', error.message);
      res.status(500).json({ message: error.message });
    } else {
      console.error('An unknown error occurred:', error);
      res.status(500).json({ message: 'An unknown error occurred' });
    }
  }
};
