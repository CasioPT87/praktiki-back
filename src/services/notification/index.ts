import { Request, Response } from 'express';
import pool from '../../db/connection';
import { Notification } from '../../types/entities';

// 1. Create a new notification
export const createNotification = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { user_id, text, read } = req.body;

  const query = `
    INSERT INTO notifications (user_id, text, read, created_at, updated_at)
    VALUES ($1, $2, $3, NOW(), NOW())
    RETURNING *;
  `;

  try {
    const result = await pool.query(query, [user_id, text, read]);
    const newNotification: Notification = result.rows[0];
    res.status(201).json(newNotification);
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Error creating notification:', error.message);
      res.status(500).json({ message: error.message });
    } else {
      console.error('An unknown error occurred:', error);
      res.status(500).json({ message: 'An unknown error occurred' });
    }
  }
};

// 2. Get all notifications
export const getAllNotifications = async (
  req: Request,
  res: Response
): Promise<void> => {
  const query = 'SELECT * FROM notifications WHERE deleted_at IS NULL;';

  try {
    const result = await pool.query(query);
    const notifications: Notification[] = result.rows;
    res.status(200).json(notifications);
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Error fetching notifications:', error.message);
      res.status(500).json({ message: error.message });
    } else {
      console.error('An unknown error occurred:', error);
      res.status(500).json({ message: 'An unknown error occurred' });
    }
  }
};

// 3. Get notification by ID
export const getNotificationById = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { id } = req.params;

  const query =
    'SELECT * FROM notifications WHERE id = $1 AND deleted_at IS NULL;';

  try {
    const result = await pool.query(query, [id]);
    if (result.rows.length === 0) {
      res.status(404).json({ message: 'Notification not found' });
      return;
    }
    const notification: Notification = result.rows[0];
    res.status(200).json(notification);
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Error fetching notification:', error.message);
      res.status(500).json({ message: error.message });
    } else {
      console.error('An unknown error occurred:', error);
      res.status(500).json({ message: 'An unknown error occurred' });
    }
  }
};

// 4. Update notification by ID
export const updateNotificationById = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { id } = req.params;
  const { read, text } = req.body;

  const query = `
    UPDATE notifications
    SET read = $1, text = $2, updated_at = NOW()
    WHERE id = $3
    RETURNING *;
  `;

  try {
    const result = await pool.query(query, [read, text, id]);
    if (result.rows.length === 0) {
      res.status(404).json({ message: 'Notification not found' });
      return;
    }
    const updatedNotification: Notification = result.rows[0];
    res.status(200).json(updatedNotification);
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Error updating notification:', error.message);
      res.status(500).json({ message: error.message });
    } else {
      console.error('An unknown error occurred:', error);
      res.status(500).json({ message: 'An unknown error occurred' });
    }
  }
};

// 5. Soft delete notification by ID
export const deleteNotificationById = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { id } = req.params;

  const query = `
    UPDATE notifications
    SET deleted_at = NOW()
    WHERE id = $1
    RETURNING *;
  `;

  try {
    const result = await pool.query(query, [id]);
    if (result.rows.length === 0) {
      res.status(404).json({ message: 'Notification not found' });
      return;
    }
    const deletedNotification: Notification = result.rows[0];
    res
      .status(200)
      .json({
        message: 'Notification deleted successfully',
        deletedNotification,
      });
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Error deleting notification:', error.message);
      res.status(500).json({ message: error.message });
    } else {
      console.error('An unknown error occurred:', error);
      res.status(500).json({ message: 'An unknown error occurred' });
    }
  }
};
