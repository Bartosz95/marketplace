import { UUID } from "crypto";
import { Pool, PoolConfig } from "pg";
import { EnvDB } from "../libs/validationSchemas";
import { UserState } from "../domain/userListingsDomain";

interface UserTableRow {
  id: UUID;
  created_at: Date;
  updated_at: Date;
  name: string;
  email: string;
  address_street: string;
  address_city: string;
  address_state: string;
  address_zip_code: string;
  address_country: string;
  auth_id: string;
  payment_id: string;
}

export interface UserStateRepository {
  createUser: (user: UserState) => Promise<void>;
  updateUser: (user: UserState) => Promise<void>;
  getUser: (id: UUID) => Promise<UserState | undefined>;
}

export const UserStateRepository = (env: EnvDB): UserStateRepository => {
  const dbConfig: PoolConfig = {
    ...env,
  };

  const pool = new Pool(dbConfig);

  const createUser = async (user: UserState): Promise<void> => {
    const dbClient = await pool.connect();
    try {
      await dbClient.query(
        `INSERT INTO states.Users (id, name, email, created_at, updated_at, payment_id, auth_id, address_street, address_city, address_state, address_zip_code, address_country) 
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
        ON CONFLICT (id) DO UPDATE
        SET name = $2,
            email = $3,
            updated_at = $5,
            payment_id = $6,
            auth_id = $7,
            address_street = $8,
            address_city = $9,
            address_state = $10,
            address_zip_code = $11,
            address_country = $12;
        `,
        [
          user.id,
          user.name,
          user.email,
          user.createdAt,
          user.updatedAt,
          user.paymentId,
          user.authId,
          user.address.street,
          user.address.city,
          user.address.state,
          user.address.zipCode,
          user.address.country,
        ]
      );
    } catch (error) {
      throw error;
    } finally {
      dbClient.release();
    }
  };

  const updateUser = async (user: UserState): Promise<void> => {
    const dbClient = await pool.connect();
    try {
      await dbClient.query(
        `INSERT INTO states.Users (id, name, email, created_at, updated_at, payment_id, auth_id, address_street, address_city, address_state, address_zip_code, address_country) 
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
        ON CONFLICT (id) DO UPDATE
        SET name = $2,
            email = $3,
            updated_at = $5,
            payment_id = $6,
            auth_id = $7,
            address_street = $8,
            address_city = $9,
            address_state = $10,
            address_zip_code = $11,
            address_country = $12;
        `,
        [
          user.id,
          user.name,
          user.email,
          user.createdAt,
          user.updatedAt,
          user.paymentId,
          user.authId,
          user.address.street,
          user.address.city,
          user.address.state,
          user.address.zipCode,
          user.address.country,
        ]
      );
    } catch (error) {
      throw error;
    } finally {
      dbClient.release();
    }
  };

  const getUserById = async (userId: UUID): Promise<UserState | undefined> => {
    const dbClient = await pool.connect();
    try {
      const result = await dbClient.query(
        `SELECT * FROM states.Users WHERE user_id = $1 limit 1;`,
        [userId]
      );
      return result.rows.map(mapUser).shift();
    } catch (error) {
      throw error;
    } finally {
      dbClient.release();
    }
  };

  const getUser = async (id: UUID): Promise<UserState | undefined> => {
    const dbClient = await pool.connect();
    try {
      const results = await dbClient.query(
        `SELECT * FROM states.Users 
        WHERE id = $1;`,
        [id]
      );

      return mapUser(results.rows[0]);
    } catch (error) {
      throw error;
    } finally {
      dbClient.release();
    }
  };

  const mapUser = (row: UserTableRow): UserState => ({
    id: row.id as UUID,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    name: row.name,
    email: row.email,
    address: {
      street: row.address_street,
      city: row.address_city,
      state: row.address_state,
      zipCode: row.address_zip_code,
      country: row.address_country,
    },
    paymentId: row.payment_id,
    authId: row.auth_id,
  });

  return {
    createUser,
    updateUser,
    getUser,
  };
};
