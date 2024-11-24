import { Request, Response } from 'express';
import pool from '../../db/connection';
import { PrivateChatRequest } from '../../types/entities';

// 1. Create a new private chat request
export const createPrivateChatRequest = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { request, asked } = req.body;

  const query = `
    INSERT INTO private_chat_requests (request, asked, created_at, updated_at)
    VALUES ($1, $2, NOW(), NOW())
    RETURNING *;
  `;

  try {
    const result = await pool.query(query, [request, asked]);
    const newPrivateChatRequest: PrivateChatRequest = result.rows[0];
    res.status(201).json(newPrivateChatRequest);
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Error creating private chat request:', error.message);
      res.status(500).json({ message: error.message });
    } else {
      console.error('An unknown error occurred:', error);
      res.status(500).json({ message: 'An unknown error occurred' });
    }
  }
};

// 2. Get all private chat requests
export const getAllPrivateChatRequests = async (
  req: Request,
  res: Response
): Promise<void> => {
  const query = 'SELECT * FROM private_chat_requests WHERE deleted_at IS NULL;';

  try {
    const result = await pool.query(query);
    const privateChatRequests: PrivateChatRequest[] = result.rows;
    res.status(200).json(privateChatRequests);
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Error fetching private chat requests:', error.message);
      res.status(500).json({ message: error.message });
    } else {
      console.error('An unknown error occurred:', error);
      res.status(500).json({ message: 'An unknown error occurred' });
    }
  }
};

// 3. Get private chat request by ID
export const getPrivateChatRequestById = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { id } = req.params;

  const query =
    'SELECT * FROM private_chat_requests WHERE id = $1 AND deleted_at IS NULL;';

  try {
    const result = await pool.query(query, [id]);
    if (result.rows.length === 0) {
      res.status(404).json({ message: 'Private chat request not found' });
      return;
    }
    const privateChatRequest: PrivateChatRequest = result.rows[0];
    res.status(200).json(privateChatRequest);
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Error fetching private chat request:', error.message);
      res.status(500).json({ message: error.message });
    } else {
      console.error('An unknown error occurred:', error);
      res.status(500).json({ message: 'An unknown error occurred' });
    }
  }
};

// 4. Update private chat request by ID
export const updatePrivateChatRequestById = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { id } = req.params;
  const { accepted, rejected } = req.body;

  const query = `
    UPDATE private_chat_requests
    SET accepted = $1, rejected = $2, updated_at = NOW()
    WHERE id = $3
    RETURNING *;
  `;

  try {
    const result = await pool.query(query, [accepted, rejected, id]);
    if (result.rows.length === 0) {
      res.status(404).json({ message: 'Private chat request not found' });
      return;
    }
    const updatedPrivateChatRequest: PrivateChatRequest = result.rows[0];
    res.status(200).json(updatedPrivateChatRequest);
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Error updating private chat request:', error.message);
      res.status(500).json({ message: error.message });
    } else {
      console.error('An unknown error occurred:', error);
      res.status(500).json({ message: 'An unknown error occurred' });
    }
  }
};

// 5. Soft delete private chat request by ID
export const deletePrivateChatRequestById = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { id } = req.params;

  const query = `
    UPDATE private_chat_requests
    SET deleted_at = NOW()
    WHERE id = $1
    RETURNING *;
  `;

  try {
    const result = await pool.query(query, [id]);
    if (result.rows.length === 0) {
      res.status(404).json({ message: 'Private chat request not found' });
      return;
    }
    const deletedPrivateChatRequest: PrivateChatRequest = result.rows[0];
    res.status(200).json({
      message: 'Private chat request deleted successfully',
      deletedPrivateChatRequest,
    });
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Error deleting private chat request:', error.message);
      res.status(500).json({ message: error.message });
    } else {
      console.error('An unknown error occurred:', error);
      res.status(500).json({ message: 'An unknown error occurred' });
    }
  }
};
