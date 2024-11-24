// src/controllers/userRateController.ts
import { Request, Response } from 'express';
import pool from '../../db/connection';
import { UserRate } from '../../types/entities';

// 1. Create a new user rating (create)
export const createUserRate = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { target_user_id, voter_user_id, rate } = req.body;

  const query = `
    INSERT INTO user_rate (target_user_id, voter_user_id, rate, created_at, updated_at)
    VALUES ($1, $2, $3, NOW(), NOW())
    RETURNING *;
  `;

  try {
    const result = await pool.query(query, [
      target_user_id,
      voter_user_id,
      rate,
    ]);
    const newUserRate: UserRate = result.rows[0];
    res.status(201).json(newUserRate);
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Error creating user rate:', error.message);
      res.status(500).json({ message: error.message });
    } else {
      console.error('An unknown error occurred:', error);
      res.status(500).json({ message: 'An unknown error occurred' });
    }
  }
};

// 2. Get ratings for a target user
export const getRatingsForUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { target_user_id } = req.params;

  const query = `
    SELECT * FROM user_rate
    WHERE target_user_id = $1 AND deleted_at IS NULL;
  `;

  try {
    const result = await pool.query(query, [target_user_id]);
    const ratings: UserRate[] = result.rows;
    res.status(200).json(ratings);
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Error fetching ratings for user:', error.message);
      res.status(500).json({ message: error.message });
    } else {
      console.error('An unknown error occurred:', error);
      res.status(500).json({ message: 'An unknown error occurred' });
    }
  }
};

// 3. Get all ratings made by a voter user
export const getRatingsByUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { voter_user_id } = req.params;

  const query = `
    SELECT * FROM user_rate
    WHERE voter_user_id = $1 AND deleted_at IS NULL;
  `;

  try {
    const result = await pool.query(query, [voter_user_id]);
    const ratings: UserRate[] = result.rows;
    res.status(200).json(ratings);
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Error fetching ratings by user:', error.message);
      res.status(500).json({ message: error.message });
    } else {
      console.error('An unknown error occurred:', error);
      res.status(500).json({ message: 'An unknown error occurred' });
    }
  }
};

// 4. Soft delete a user rating (mark as deleted)
export const deleteUserRate = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { id } = req.params;

  const query = `
    UPDATE user_rate
    SET deleted_at = NOW()
    WHERE id = $1
    RETURNING *;
  `;

  try {
    const result = await pool.query(query, [id]);
    if (result.rows.length === 0) {
      res.status(404).json({ message: 'User rate not found' });
      return;
    }
    const deletedUserRate: UserRate = result.rows[0];
    res
      .status(200)
      .json({ message: 'User rate deleted successfully', deletedUserRate });
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Error deleting user rate:', error.message);
      res.status(500).json({ message: error.message });
    } else {
      console.error('An unknown error occurred:', error);
      res.status(500).json({ message: 'An unknown error occurred' });
    }
  }
};
