import { Request, Response } from 'express';
import pool from '../../db/connection';
import { Role } from '../../types/entities';

// 1. Create a new role
export const createRole = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { value, name } = req.body;

  const query = `
    INSERT INTO roles (value, name, created_at, updated_at)
    VALUES ($1, $2, NOW(), NOW())
    RETURNING *;
  `;

  try {
    const result = await pool.query(query, [value, name]);
    const newRole: Role = result.rows[0];
    res.status(201).json(newRole);
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Error creating role:', error.message);
      res.status(500).json({ message: error.message });
    } else {
      // Fallback in case it's not an instance of Error
      console.error('An unknown error occurred:', error);
      res.status(500).json({ message: 'An unknown error occurred' });
    }
  }
};

// 2. Get all roles
export const getAllRoles = async (
  req: Request,
  res: Response
): Promise<void> => {
  const query = 'SELECT * FROM roles WHERE deleted_at IS NULL;';

  try {
    const result = await pool.query(query);
    const roles: Role[] = result.rows;
    res.status(200).json(roles);
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Error fetching roles:', error.message);
      res.status(500).json({ message: error.message });
    } else {
      console.error('An unknown error occurred:', error);
      res.status(500).json({ message: 'An unknown error occurred' });
    }
  }
};

// 3. Get a role by ID
export const getRoleById = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { id } = req.params;

  const query = 'SELECT * FROM roles WHERE id = $1 AND deleted_at IS NULL;';

  try {
    const result = await pool.query(query, [id]);
    if (result.rows.length === 0) {
      res.status(404).json({ message: 'Role not found' });
      return;
    }
    const role: Role = result.rows[0];
    res.status(200).json(role);
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Error fetching role:', error.message);
      res.status(500).json({ message: error.message });
    } else {
      console.error('An unknown error occurred:', error);
      res.status(500).json({ message: 'An unknown error occurred' });
    }
  }
};

// 4. Update a role by ID
export const updateRoleById = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { id } = req.params;
  const { value, name } = req.body;

  const query = `
    UPDATE roles
    SET value = $1, name = $2, updated_at = NOW()
    WHERE id = $3
    RETURNING *;
  `;

  try {
    const result = await pool.query(query, [value, name, id]);
    if (result.rows.length === 0) {
      res.status(404).json({ message: 'Role not found' });
      return;
    }
    const updatedRole: Role = result.rows[0];
    res.status(200).json(updatedRole);
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Error updating role:', error.message);
      res.status(500).json({ message: error.message });
    } else {
      console.error('An unknown error occurred:', error);
      res.status(500).json({ message: 'An unknown error occurred' });
    }
  }
};

// 5. Soft delete a role (mark as deleted)
export const deleteRoleById = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { id } = req.params;

  const query = `
    UPDATE roles
    SET deleted_at = NOW()
    WHERE id = $1
    RETURNING *;
  `;

  try {
    const result = await pool.query(query, [id]);
    if (result.rows.length === 0) {
      res.status(404).json({ message: 'Role not found' });
      return;
    }
    res.status(200).json({ message: 'Role deleted successfully' });
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Error deleting role:', error.message);
      res.status(500).json({ message: error.message });
    } else {
      console.error('An unknown error occurred:', error);
      res.status(500).json({ message: 'An unknown error occurred' });
    }
  }
};
