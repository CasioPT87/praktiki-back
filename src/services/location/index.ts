import { Request, Response } from 'express';
import pool from '../../db/connection';
import { Location } from '../../types/entities';

export const getAllLocations = async (): Promise<Location[] | null> => {
  const query = 'SELECT * FROM location WHERE deleted_at IS NULL;';

  try {
    const result = await pool.query(query);
    const locations: Location[] = result.rows;
    return locations;
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Error fetching locations:', error.message);
    } else {
      console.error('An unknown error occurred:', error);
    }
    return null;
  }
};
