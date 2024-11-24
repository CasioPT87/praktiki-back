import { Request, Response } from 'express';
import pool from '../../db/connection';
import { PrivateChat } from '../../types/entities';

// 1. Create a new private chat
export const createPrivateChat = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { user_id_1, user_id_2 } = req.body;

  const query = `
    INSERT INTO private_chats (user_id_1, user_id_2, created_at, updated_at)
    VALUES ($1, $2, NOW(), NOW())
    RETURNING *;
  `;

  try {
    const result = await pool.query(query, [user_id_1, user_id_2]);
    const newPrivateChat: PrivateChat = result.rows[0];
    res.status(201).json(newPrivateChat);
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Error creating private chat:', error.message);
      res.status(500).json({ message: error.message });
    } else {
      console.error('An unknown error occurred:', error);
      res.status(500).json({ message: 'An unknown error occurred' });
    }
  }
};

// 2. Get all private chats
export const getAllPrivateChats = async (
  req: Request,
  res: Response
): Promise<void> => {
  const query = 'SELECT * FROM private_chats WHERE deleted_at IS NULL;';

  try {
    const result = await pool.query(query);
    const privateChats: PrivateChat[] = result.rows;
    res.status(200).json(privateChats);
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Error fetching private chats:', error.message);
      res.status(500).json({ message: error.message });
    } else {
      console.error('An unknown error occurred:', error);
      res.status(500).json({ message: 'An unknown error occurred' });
    }
  }
};

// 3. Get private chat by ID
export const getPrivateChatById = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { id } = req.params;

  const query =
    'SELECT * FROM private_chats WHERE id = $1 AND deleted_at IS NULL;';

  try {
    const result = await pool.query(query, [id]);
    if (result.rows.length === 0) {
      res.status(404).json({ message: 'Private chat not found' });
      return;
    }
    const privateChat: PrivateChat = result.rows[0];
    res.status(200).json(privateChat);
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Error fetching private chat:', error.message);
      res.status(500).json({ message: error.message });
    } else {
      console.error('An unknown error occurred:', error);
      res.status(500).json({ message: 'An unknown error occurred' });
    }
  }
};

// 4. Update private chat by ID
export const updatePrivateChatById = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { id } = req.params;
  const { user_id_1, user_id_2 } = req.body;

  const query = `
    UPDATE private_chats
    SET user_id_1 = $1, user_id_2 = $2, updated_at = NOW()
    WHERE id = $3
    RETURNING *;
  `;

  try {
    const result = await pool.query(query, [user_id_1, user_id_2, id]);
    if (result.rows.length === 0) {
      res.status(404).json({ message: 'Private chat not found' });
      return;
    }
    const updatedPrivateChat: PrivateChat = result.rows[0];
    res.status(200).json(updatedPrivateChat);
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Error updating private chat:', error.message);
      res.status(500).json({ message: error.message });
    } else {
      console.error('An unknown error occurred:', error);
      res.status(500).json({ message: 'An unknown error occurred' });
    }
  }
};

// 5. Soft delete private chat by ID
export const deletePrivateChatById = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { id } = req.params;

  const query = `
    UPDATE private_chats
    SET deleted_at = NOW()
    WHERE id = $1
    RETURNING *;
  `;

  try {
    const result = await pool.query(query, [id]);
    if (result.rows.length === 0) {
      res.status(404).json({ message: 'Private chat not found' });
      return;
    }
    const deletedPrivateChat: PrivateChat = result.rows[0];
    res
      .status(200)
      .json({
        message: 'Private chat deleted successfully',
        deletedPrivateChat,
      });
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Error deleting private chat:', error.message);
      res.status(500).json({ message: error.message });
    } else {
      console.error('An unknown error occurred:', error);
      res.status(500).json({ message: 'An unknown error occurred' });
    }
  }
};
