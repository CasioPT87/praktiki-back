// src/controllers/privateChatMessageController.ts
import { Request, Response } from 'express';
import pool from '../../db/connection';
import { PrivateChatMessage } from '../../types/entities';

// 1. Create a new private chat message
export const createPrivateChatMessage = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { user_id, text, private_chat_id } = req.body;

  const query = `
    INSERT INTO private_chat_messages (user_id, text, private_chat_id, created_at, updated_at)
    VALUES ($1, $2, $3, NOW(), NOW())
    RETURNING *;
  `;

  try {
    const result = await pool.query(query, [user_id, text, private_chat_id]);
    const newMessage: PrivateChatMessage = result.rows[0];
    res.status(201).json(newMessage);
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Error creating private chat message:', error.message);
      res.status(500).json({ message: error.message });
    } else {
      console.error('An unknown error occurred:', error);
      res.status(500).json({ message: 'An unknown error occurred' });
    }
  }
};

// 2. Get all messages in a private chat
export const getMessagesInPrivateChat = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { private_chat_id } = req.params;

  const query =
    'SELECT * FROM private_chat_messages WHERE private_chat_id = $1 AND deleted_at IS NULL ORDER BY created_at;';

  try {
    const result = await pool.query(query, [private_chat_id]);
    const messages: PrivateChatMessage[] = result.rows;
    res.status(200).json(messages);
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Error fetching private chat messages:', error.message);
      res.status(500).json({ message: error.message });
    } else {
      console.error('An unknown error occurred:', error);
      res.status(500).json({ message: 'An unknown error occurred' });
    }
  }
};

// 3. Get a private chat message by ID
export const getPrivateChatMessageById = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { id } = req.params;

  const query =
    'SELECT * FROM private_chat_messages WHERE id = $1 AND deleted_at IS NULL;';

  try {
    const result = await pool.query(query, [id]);
    if (result.rows.length === 0) {
      res.status(404).json({ message: 'Private chat message not found' });
      return;
    }
    const message: PrivateChatMessage = result.rows[0];
    res.status(200).json(message);
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Error fetching private chat message:', error.message);
      res.status(500).json({ message: error.message });
    } else {
      console.error('An unknown error occurred:', error);
      res.status(500).json({ message: 'An unknown error occurred' });
    }
  }
};

// 4. Update a private chat message by ID
export const updatePrivateChatMessageById = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { id } = req.params;
  const { text } = req.body;

  const query = `
    UPDATE private_chat_messages
    SET text = $1, updated_at = NOW()
    WHERE id = $2
    RETURNING *;
  `;

  try {
    const result = await pool.query(query, [text, id]);
    if (result.rows.length === 0) {
      res.status(404).json({ message: 'Private chat message not found' });
      return;
    }
    const updatedMessage: PrivateChatMessage = result.rows[0];
    res.status(200).json(updatedMessage);
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Error updating private chat message:', error.message);
      res.status(500).json({ message: error.message });
    } else {
      console.error('An unknown error occurred:', error);
      res.status(500).json({ message: 'An unknown error occurred' });
    }
  }
};

// 5. Soft delete a private chat message by ID
export const deletePrivateChatMessageById = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { id } = req.params;

  const query = `
    UPDATE private_chat_messages
    SET deleted_at = NOW()
    WHERE id = $1
    RETURNING *;
  `;

  try {
    const result = await pool.query(query, [id]);
    if (result.rows.length === 0) {
      res.status(404).json({ message: 'Private chat message not found' });
      return;
    }
    const deletedMessage: PrivateChatMessage = result.rows[0];
    res
      .status(200)
      .json({ message: 'Message deleted successfully', deletedMessage });
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Error deleting private chat message:', error.message);
      res.status(500).json({ message: error.message });
    } else {
      console.error('An unknown error occurred:', error);
      res.status(500).json({ message: 'An unknown error occurred' });
    }
  }
};
