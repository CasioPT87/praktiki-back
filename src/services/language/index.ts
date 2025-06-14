import { Request, Response } from 'express';
import pool from '../../db/connection';
import { Language } from '../../types/entities';

// 1. Create a new language
export const createLanguage = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { name, icon_id } = req.body;

  const query = `
    INSERT INTO languages (name, icon_id, created_at, updated_at)
    VALUES ($1, $2, NOW(), NOW())
    RETURNING *;
  `;

  try {
    const result = await pool.query(query, [name, icon_id]);
    const newLanguage: Language = result.rows[0];
    res.status(201).json(newLanguage);
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Error creating language:', error.message);
      res.status(500).json({ message: error.message });
    } else {
      console.error('An unknown error occurred:', error);
      res.status(500).json({ message: 'An unknown error occurred' });
    }
  }
};

// 2. Get all languages
export const getAllLanguages = async (): Promise<Array<any>> => {
  const query = 'SELECT * FROM language WHERE deleted_at IS NULL;';
  const result = await pool.query(query);
  return result?.rows || null;
};

// 3. Get language by ID
export const getLanguageById = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { id } = req.params;

  const query = 'SELECT * FROM languages WHERE id = $1 AND deleted_at IS NULL;';

  try {
    const result = await pool.query(query, [id]);
    if (result.rows.length === 0) {
      res.status(404).json({ message: 'Language not found' });
      return;
    }
    const language: Language = result.rows[0];
    res.status(200).json(language);
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Error fetching language:', error.message);
      res.status(500).json({ message: error.message });
    } else {
      console.error('An unknown error occurred:', error);
      res.status(500).json({ message: 'An unknown error occurred' });
    }
  }
};

// 4. Update a language by ID
export const updateLanguageById = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { id } = req.params;
  const { name, icon_id } = req.body;

  const query = `
    UPDATE languages
    SET name = $1, icon_id = $2, updated_at = NOW()
    WHERE id = $3
    RETURNING *;
  `;

  try {
    const result = await pool.query(query, [name, icon_id, id]);
    if (result.rows.length === 0) {
      res.status(404).json({ message: 'Language not found' });
      return;
    }
    const updatedLanguage: Language = result.rows[0];
    res.status(200).json(updatedLanguage);
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Error updating language:', error.message);
      res.status(500).json({ message: error.message });
    } else {
      console.error('An unknown error occurred:', error);
      res.status(500).json({ message: 'An unknown error occurred' });
    }
  }
};

// 5. Soft delete a language by ID
export const deleteLanguageById = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { id } = req.params;

  const query = `
    UPDATE languages
    SET deleted_at = NOW()
    WHERE id = $1
    RETURNING *;
  `;

  try {
    const result = await pool.query(query, [id]);
    if (result.rows.length === 0) {
      res.status(404).json({ message: 'Language not found' });
      return;
    }
    const deletedLanguage: Language = result.rows[0];
    res
      .status(200)
      .json({ message: 'Language deleted successfully', deletedLanguage });
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Error deleting language:', error.message);
      res.status(500).json({ message: error.message });
    } else {
      console.error('An unknown error occurred:', error);
      res.status(500).json({ message: 'An unknown error occurred' });
    }
  }
};
