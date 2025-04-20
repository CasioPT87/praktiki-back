// src/controllers/userController.ts
import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import pool from '../../db/connection';
import { Role, User, UserAuth } from '../../types/entities';
import { UserRole } from '../../utils/auth';

export const registerUser = async ({
  username,
  password,
  roleValue,
}: {
  username: string;
  password: string;
  roleValue: UserRole;
}): Promise<User | null> => {
  const client = await pool.connect();
  try {
    if (!username || !password) {
      return null;
    }
    await client.query('BEGIN');

    // Find the user by username
    const queryUser = `INSERT INTO "user"("name", "role_id") VALUES($1, $2) RETURNING *;`;

    const roleResponse = await client.query(
      'SELECT * FROM role WHERE value = $1',
      [roleValue]
    );

    if (!roleResponse?.rows?.[0].id)
      throw new Error('Error matching role value');

    const roleId = roleResponse?.rows?.[0].id;

    const newUserResult = await client.query(queryUser, [username, roleId]);
    const queryAuth = `INSERT INTO user_auth (user_id, password) VALUES ($1, $2)`;

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = newUserResult.rows[0] as User;
    await client.query(queryAuth, [user.id, hashedPassword]);
    await client.query('COMMIT');

    return await getUser({ userId: user.id });
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
      return user;
    } else {
      throw new Error('Error loging in: wrong password');
    }
  } catch (err) {
    if (err instanceof Error) console.log(err.stack);
    return null;
  }
};

export const getUser = async ({
  userId,
}: {
  userId: User['id'];
}): Promise<User | null> => {
  try {
    const query = `
    SELECT u.*, r.value
    FROM "user" u
    JOIN "role" r
    ON r.id = u.role_id
    WHERE u.id = $1
    AND u.deleted_at IS NULL
    `;
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
