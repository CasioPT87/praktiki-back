// src/controllers/userController.ts
import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import pool from '../../db/connection';
import { User, UserAuth } from '../../types/entities';
import jwt from 'jsonwebtoken';
import { createToken } from '../../utils/auth';

// 1. Create a new user
export const createUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { role_id } = req.body;

  const query = `
    INSERT INTO users (role_id, created_at, updated_at)
    VALUES ($1, NOW(), NOW())
    RETURNING *;
  `;

  try {
    const result = await pool.query(query, [role_id]);
    const newUser: User = result.rows[0];
    res.status(201).json(newUser);
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Error creating user:', error.message);
      res.status(500).json({ message: error.message });
    } else {
      console.error('An unknown error occurred:', error);
      res.status(500).json({ message: 'An unknown error occurred' });
    }
  }
};

// 2. Get all users
export const getAllUsers = async (
  req: Request,
  res: Response
): Promise<void> => {
  const query = 'SELECT * FROM users WHERE deleted_at IS NULL;';

  try {
    const result = await pool.query(query);
    const users: User[] = result.rows;
    res.status(200).json(users);
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Error fetching users:', error.message);
      res.status(500).json({ message: error.message });
    } else {
      console.error('An unknown error occurred:', error);
      res.status(500).json({ message: 'An unknown error occurred' });
    }
  }
};

// 3. Get a user by ID
export const getUserById = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { id } = req.params;

  const query = 'SELECT * FROM users WHERE id = $1 AND deleted_at IS NULL;';

  try {
    const result = await pool.query(query, [id]);
    if (result.rows.length === 0) {
      res.status(404).json({ message: 'User not found' });
      return;
    }
    const user: User = result.rows[0];
    res.status(200).json(user);
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Error fetching user:', error.message);
      res.status(500).json({ message: error.message });
    } else {
      console.error('An unknown error occurred:', error);
      res.status(500).json({ message: 'An unknown error occurred' });
    }
  }
};

// 4. Update a user by ID
export const updateUserById = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { id } = req.params;
  const { role_id } = req.body;

  const query = `
    UPDATE users
    SET role_id = $1, updated_at = NOW()
    WHERE id = $2
    RETURNING *;
  `;

  try {
    const result = await pool.query(query, [role_id, id]);
    if (result.rows.length === 0) {
      res.status(404).json({ message: 'User not found' });
      return;
    }
    const updatedUser: User = result.rows[0];
    res.status(200).json(updatedUser);
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Error updating user:', error.message);
      res.status(500).json({ message: error.message });
    } else {
      console.error('An unknown error occurred:', error);
      res.status(500).json({ message: 'An unknown error occurred' });
    }
  }
};

// 5. Soft delete a user (mark as deleted)
export const deleteUserById = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { id } = req.params;

  const query = `
    UPDATE users
    SET deleted_at = NOW()
    WHERE id = $1
    RETURNING *;
  `;

  try {
    const result = await pool.query(query, [id]);
    if (result.rows.length === 0) {
      res.status(404).json({ message: 'User not found' });
      return;
    }
    res.status(200).json({ message: 'User deleted successfully' });
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Error deleting user:', error.message);
      res.status(500).json({ message: error.message });
    } else {
      console.error('An unknown error occurred:', error);
      res.status(500).json({ message: 'An unknown error occurred' });
    }
  }
};

export const registerUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      res.status(400).send('Username and password are required');
      return;
    }

    // Find the user by username
    const queryUser = `
  INSERT INTO user (name) VALUES ($1) RETURNING *
  `;

    const text = 'INSERT INTO user(name) VALUES($1) RETURNING *';
    const values = ['brianc'];

    const userId = await pool.query(text, values);

    const queryAuth = `
  INSERT INTO user_auth (user_id, password) VALUES (?, ?)
  `;

    const hashedPassword = await bcrypt.hash(password, 10);

    await pool.query(queryAuth, [userId, hashedPassword]);

    const user = await pool.query('SELECT * FROM user WHERE id = ?', [userId]);

    const token = await createToken({ user });

    res.status(200).json({ token });
    return;
  } catch (err) {
    res.status(500).send('Error logging in');
  }
};

export const loginUser = async (req: Request, res: Response): Promise<void> => {
  const { username, password } = req.params;

  if (!username || !password) {
    res.status(400).send('Username and password are required');
    return;
  }

  // Find the user by username
  const query = `
  SELECT * FROM user
  INNER JOIN user_auth ON user.id = user_auth.user_id
  WHERE user.id = $1
  `;

  const userResult = await pool.query(query, [username]);

  const user = userResult as User & UserAuth;

  if (!user) {
    res.status(404).send('User not found');
    return;
  }

  try {
    // Compare the provided password with the hashed password
    const match = await bcrypt.compare(password, user.password);

    if (match) {
      res.status(200).json({ user });
    } else {
      res.status(401).send('Invalid password');
    }
  } catch (err) {
    res.status(500).send('Error logging in');
  }
};
