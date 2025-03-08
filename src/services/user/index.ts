// src/controllers/userController.ts
import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import pool from '../../db/connection';
import { User, UserAuth } from '../../types/entities';

export const registerUser = async ({
  username,
  password,
  rol = 1,
}: {
  username: string;
  password: string;
  rol: number;
}): Promise<User | null> => {
  const client = await pool.connect();
  try {
    if (!username || !password) {
      return null;
    }
    await client.query('BEGIN');

    // Find the user by username
    const queryUser = `INSERT INTO "user"("name", "role_id") VALUES($1, $2) RETURNING *;`;

    const newUserResult = await pool.query(queryUser, [username, rol]);
    const queryAuth = `INSERT INTO user_auth (user_id, password) VALUES ($1, $2)`;

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = newUserResult.rows[0] as User;
    await pool.query(queryAuth, [user.id, hashedPassword]);
    await client.query('COMMIT');

    return user;
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error logging in');
    return null;
  } finally {
    client.release();
  }
};

export const loginUser = async ({
  username,
  password,
}: {
  username: string;
  password: string;
}): Promise<User | null> => {
  try {
    if (!username || !password) {
      throw new Error('Login needs username and password');
    }

    // Find the user by username
    const query = `
    SELECT "user".*, user_auth.password FROM "user"
    INNER JOIN user_auth ON "user"."id" = user_auth.user_id
    WHERE "user"."name" = $1
    `;

    const userResult = await pool.query(query, [username]);

    const user = userResult.rows[0] as User & UserAuth;

    if (!user) {
      throw new Error('User not found login in');
    }

    const match = await bcrypt.compare(password, user.password);

    if (match) {
      const tokenUser: User = {
        id: user.id,
        name: user.name,
        role_id: user.role_id,
        created_at: user.created_at,
        deleted_at: user.deleted_at,
        updated_at: user.updated_at,
      };

      return user;
    } else {
      throw new Error('Error loging in: wrong password');
    }
  } catch (err) {
    if (err instanceof Error) console.log(err.stack);
    return null;
  }
};

export const getUser = async ({ userId }): Promise<User | null> => {
  try {
    const query = 'SELECT * FROM "user" WHERE id = $1 AND deleted_at IS NULL;';
    const result = await pool.query(query, [userId]);
    if (result.rows.length === 0) throw new Error(`User ${userId} not found`);
    const user: User = result.rows[0];
    return user;
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Error fetching user:', error.stack);
    } else {
      console.error('An unknown error occurred:', error);
    }
    return null;
  }
};
