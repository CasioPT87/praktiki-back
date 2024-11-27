import { Request, Response } from 'express';
import pool from '../../db/connection';
import { Country } from '../../types/entities';

// 1. Create a new country
export const createCountry = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { name } = req.body;

  const query = `
    INSERT INTO countries (name, created_at, updated_at)
    VALUES ($1, NOW(), NOW())
    RETURNING *;
  `;

  try {
    const result = await pool.query(query, [name]);
    const newCountry: Country = result.rows[0];
    res.status(201).json(newCountry);
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Error creating country:', error.message);
      res.status(500).json({ message: error.message });
    } else {
      console.error('An unknown error occurred:', error);
      res.status(500).json({ message: 'An unknown error occurred' });
    }
  }
};

// 2. Get all countries
export const getAllCountries = async (
  req: Request,
  res: Response
): Promise<void> => {
  const query = 'SELECT * FROM countries WHERE deleted_at IS NULL;';

  try {
    const result = await pool.query(query);
    const countries: Country[] = result.rows;
    res.status(200).json(countries);
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Error fetching countries:', error.message);
      res.status(500).json({ message: error.message });
    } else {
      console.error('An unknown error occurred:', error);
      res.status(500).json({ message: 'An unknown error occurred' });
    }
  }
};

// 3. Get a country by ID
export const getCountryById = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { id } = req.params;

  const query = 'SELECT * FROM countries WHERE id = $1 AND deleted_at IS NULL;';

  try {
    const result = await pool.query(query, [id]);
    if (result.rows.length === 0) {
      res.status(404).json({ message: 'Country not found' });
      return;
    }
    const country: Country = result.rows[0];
    res.status(200).json(country);
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Error fetching country:', error.message);
      res.status(500).json({ message: error.message });
    } else {
      console.error('An unknown error occurred:', error);
      res.status(500).json({ message: 'An unknown error occurred' });
    }
  }
};

// 4. Update a country by ID
export const updateCountryById = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { id } = req.params;
  const { name } = req.body;

  const query = `
    UPDATE countries
    SET name = $1, updated_at = NOW()
    WHERE id = $2
    RETURNING *;
  `;

  try {
    const result = await pool.query(query, [name, id]);
    if (result.rows.length === 0) {
      res.status(404).json({ message: 'Country not found' });
      return;
    }
    const updatedCountry: Country = result.rows[0];
    res.status(200).json(updatedCountry);
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Error updating country:', error.message);
      res.status(500).json({ message: error.message });
    } else {
      console.error('An unknown error occurred:', error);
      res.status(500).json({ message: 'An unknown error occurred' });
    }
  }
};

// 5. Soft delete a country (mark as deleted)
export const deleteCountryById = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { id } = req.params;

  const query = `
    UPDATE countries
    SET deleted_at = NOW()
    WHERE id = $1
    RETURNING *;
  `;

  try {
    const result = await pool.query(query, [id]);
    if (result.rows.length === 0) {
      res.status(404).json({ message: 'Country not found' });
      return;
    }
    res.status(200).json({ message: 'Country deleted successfully' });
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Error deleting country:', error.message);
      res.status(500).json({ message: error.message });
    } else {
      console.error('An unknown error occurred:', error);
      res.status(500).json({ message: 'An unknown error occurred' });
    }
  }
};
