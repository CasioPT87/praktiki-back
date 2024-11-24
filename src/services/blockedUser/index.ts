import { Request, Response } from 'express';
import pool from '../../db/connection';
import { BlockedUser } from '../../types/entities';

// 1. Create a new blocked user relationship
export const createBlockedUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { user_id, blocked_user } = req.body;

  const query = `
    INSERT INTO blocked_users (user_id, blocked_user, created_at, updated_at)
    VALUES ($1, $2, NOW(), NOW())
    RETURNING *;
  `;

  try {
    const result = await pool.query(query, [user_id, blocked_user]);
    const newBlockedUser: BlockedUser = result.rows[0];
    res.status(201).json(newBlockedUser);
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Error creating blocked user:', error.message);
      res.status(500).json({ message: error.message });
    } else {
      console.error('An unknown error occurred:', error);
      res.status(500).json({ message: 'An unknown error occurred' });
    }
  }
};

// 2. Get all blocked users
export const getAllBlockedUsers = async (
  req: Request,
  res: Response
): Promise<void> => {
  const query = 'SELECT * FROM blocked_users WHERE deleted_at IS NULL;';

  try {
    const result = await pool.query(query);
    const blockedUsers: BlockedUser[] = result.rows;
    res.status(200).json(blockedUsers);
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Error fetching blocked users:', error.message);
      res.status(500).json({ message: error.message });
    } else {
      console.error('An unknown error occurred:', error);
      res.status(500).json({ message: 'An unknown error occurred' });
    }
  }
};

// 3. Get blocked user relationship by ID
export const getBlockedUserById = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { id } = req.params;

  const query =
    'SELECT * FROM blocked_users WHERE id = $1 AND deleted_at IS NULL;';

  try {
    const result = await pool.query(query, [id]);
    if (result.rows.length === 0) {
      res.status(404).json({ message: 'Blocked user relationship not found' });
      return;
    }
    const blockedUser: BlockedUser = result.rows[0];
    res.status(200).json(blockedUser);
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Error fetching blocked user:', error.message);
      res.status(500).json({ message: error.message });
    } else {
      console.error('An unknown error occurred:', error);
      res.status(500).json({ message: 'An unknown error occurred' });
    }
  }
};

// 4. Soft delete a blocked user relationship
export const deleteBlockedUserById = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { id } = req.params;

  const query = `
    UPDATE blocked_users
    SET deleted_at = NOW()
    WHERE id = $1
    RETURNING *;
  `;

  try {
    const result = await pool.query(query, [id]);
    if (result.rows.length === 0) {
      res.status(404).json({ message: 'Blocked user relationship not found' });
      return;
    }
    res
      .status(200)
      .json({ message: 'Blocked user relationship deleted successfully' });
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Error deleting blocked user relationship:', error.message);
      res.status(500).json({ message: error.message });
    } else {
      console.error('An unknown error occurred:', error);
      res.status(500).json({ message: 'An unknown error occurred' });
    }
  }
};

// 5. Update a blocked user relationship (if necessary)
export const updateBlockedUserById = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { id } = req.params;
  const { user_id, blocked_user } = req.body;

  const query = `
    UPDATE blocked_users
    SET user_id = $1, blocked_user = $2, updated_at = NOW()
    WHERE id = $3
    RETURNING *;
  `;

  try {
    const result = await pool.query(query, [user_id, blocked_user, id]);
    if (result.rows.length === 0) {
      res.status(404).json({ message: 'Blocked user relationship not found' });
      return;
    }
    const updatedBlockedUser: BlockedUser = result.rows[0];
    res.status(200).json(updatedBlockedUser);
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Error updating blocked user relationship:', error.message);
      res.status(500).json({ message: error.message });
    } else {
      console.error('An unknown error occurred:', error);
      res.status(500).json({ message: 'An unknown error occurred' });
    }
  }
};
