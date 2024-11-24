import { Request, Response } from 'express';
import pool from '../../db/connection';
import { Icon } from '../../types/entities';

// 1. Create a new icon
export const createIcon = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { path } = req.body;

  const query = `
    INSERT INTO icons (path, created_at, updated_at)
    VALUES ($1, NOW(), NOW())
    RETURNING *;
  `;

  try {
    const result = await pool.query(query, [path]);
    const newIcon: Icon = result.rows[0];
    res.status(201).json(newIcon);
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Error creating icon:', error.message);
      res.status(500).json({ message: error.message });
    } else {
      console.error('An unknown error occurred:', error);
      res.status(500).json({ message: 'An unknown error occurred' });
    }
  }
};

// 2. Get all icons
export const getAllIcons = async (
  req: Request,
  res: Response
): Promise<void> => {
  const query = 'SELECT * FROM icons WHERE deleted_at IS NULL;';

  try {
    const result = await pool.query(query);
    const icons: Icon[] = result.rows;
    res.status(200).json(icons);
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Error fetching icons:', error.message);
      res.status(500).json({ message: error.message });
    } else {
      console.error('An unknown error occurred:', error);
      res.status(500).json({ message: 'An unknown error occurred' });
    }
  }
};

// 3. Get an icon by ID
export const getIconById = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { id } = req.params;

  const query = 'SELECT * FROM icons WHERE id = $1 AND deleted_at IS NULL;';

  try {
    const result = await pool.query(query, [id]);
    if (result.rows.length === 0) {
      res.status(404).json({ message: 'Icon not found' });
      return;
    }
    const icon: Icon = result.rows[0];
    res.status(200).json(icon);
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Error fetching icon:', error.message);
      res.status(500).json({ message: error.message });
    } else {
      console.error('An unknown error occurred:', error);
      res.status(500).json({ message: 'An unknown error occurred' });
    }
  }
};

// 4. Update an icon by ID
export const updateIconById = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { id } = req.params;
  const { path } = req.body;

  const query = `
    UPDATE icons
    SET path = $1, updated_at = NOW()
    WHERE id = $2
    RETURNING *;
  `;

  try {
    const result = await pool.query(query, [path, id]);
    if (result.rows.length === 0) {
      res.status(404).json({ message: 'Icon not found' });
      return;
    }
    const updatedIcon: Icon = result.rows[0];
    res.status(200).json(updatedIcon);
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Error updating icon:', error.message);
      res.status(500).json({ message: error.message });
    } else {
      console.error('An unknown error occurred:', error);
      res.status(500).json({ message: 'An unknown error occurred' });
    }
  }
};

// 5. Soft delete an icon (mark as deleted)
export const deleteIconById = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { id } = req.params;

  const query = `
    UPDATE icons
    SET deleted_at = NOW()
    WHERE id = $1
    RETURNING *;
  `;

  try {
    const result = await pool.query(query, [id]);
    if (result.rows.length === 0) {
      res.status(404).json({ message: 'Icon not found' });
      return;
    }
    res.status(200).json({ message: 'Icon deleted successfully' });
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Error deleting icon:', error.message);
      res.status(500).json({ message: error.message });
    } else {
      console.error('An unknown error occurred:', error);
      res.status(500).json({ message: 'An unknown error occurred' });
    }
  }
};
