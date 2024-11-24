import { Request, Response } from 'express';
import pool from '../../db/connection';
import { Location } from '../../types/entities';

// 1. Create a new location
export const createLocation = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { name, x_coordinates, y_coordinates, country_id } = req.body;

  const query = `
    INSERT INTO locations (name, x_coordinates, y_coordinates, country_id, created_at, updated_at)
    VALUES ($1, $2, $3, $4, NOW(), NOW())
    RETURNING *;
  `;

  try {
    const result = await pool.query(query, [
      name,
      x_coordinates,
      y_coordinates,
      country_id,
    ]);
    const newLocation: Location = result.rows[0];
    res.status(201).json(newLocation);
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Error creating location:', error.message);
      res.status(500).json({ message: error.message });
    } else {
      console.error('An unknown error occurred:', error);
      res.status(500).json({ message: 'An unknown error occurred' });
    }
  }
};

// 2. Get all locations
export const getAllLocations = async (
  req: Request,
  res: Response
): Promise<void> => {
  const query = 'SELECT * FROM locations WHERE deleted_at IS NULL;';

  try {
    const result = await pool.query(query);
    const locations: Location[] = result.rows;
    res.status(200).json(locations);
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Error fetching locations:', error.message);
      res.status(500).json({ message: error.message });
    } else {
      console.error('An unknown error occurred:', error);
      res.status(500).json({ message: 'An unknown error occurred' });
    }
  }
};

// 3. Get location by ID
export const getLocationById = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { id } = req.params;

  const query = 'SELECT * FROM locations WHERE id = $1 AND deleted_at IS NULL;';

  try {
    const result = await pool.query(query, [id]);
    if (result.rows.length === 0) {
      res.status(404).json({ message: 'Location not found' });
      return;
    }
    const location: Location = result.rows[0];
    res.status(200).json(location);
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Error fetching location:', error.message);
      res.status(500).json({ message: error.message });
    } else {
      console.error('An unknown error occurred:', error);
      res.status(500).json({ message: 'An unknown error occurred' });
    }
  }
};

// 4. Soft delete a location
export const deleteLocationById = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { id } = req.params;

  const query = `
    UPDATE locations
    SET deleted_at = NOW()
    WHERE id = $1
    RETURNING *;
  `;

  try {
    const result = await pool.query(query, [id]);
    if (result.rows.length === 0) {
      res.status(404).json({ message: 'Location not found' });
      return;
    }
    res.status(200).json({ message: 'Location deleted successfully' });
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Error deleting location:', error.message);
      res.status(500).json({ message: error.message });
    } else {
      console.error('An unknown error occurred:', error);
      res.status(500).json({ message: 'An unknown error occurred' });
    }
  }
};

// 5. Update a location by ID
export const updateLocationById = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { id } = req.params;
  const { name, x_coordinates, y_coordinates, country_id } = req.body;

  const query = `
    UPDATE locations
    SET name = $1, x_coordinates = $2, y_coordinates = $3, country_id = $4, updated_at = NOW()
    WHERE id = $5
    RETURNING *;
  `;

  try {
    const result = await pool.query(query, [
      name,
      x_coordinates,
      y_coordinates,
      country_id,
      id,
    ]);
    if (result.rows.length === 0) {
      res.status(404).json({ message: 'Location not found' });
      return;
    }
    const updatedLocation: Location = result.rows[0];
    res.status(200).json(updatedLocation);
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Error updating location:', error.message);
      res.status(500).json({ message: error.message });
    } else {
      console.error('An unknown error occurred:', error);
      res.status(500).json({ message: 'An unknown error occurred' });
    }
  }
};
