import { UUID } from "crypto";
import { Pool, PoolConfig } from "pg";
import { EnvDB } from "../libs/validationSchemas";

export interface User {
  userId: UUID;
  authenticationProviderId: string;
  paymentProviderId: string | undefined;
  name: string;
  email: string;
  address: Address | undefined;
  createdAt: Date;
  updatedAt: Date;
}

export interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

interface AddressRow {
  street: string;
  city: string;
  state: string;
  zip_code: string;
  country: string;
}

interface UserTableRow {
  user_id: UUID;
  authentication_provider_id: string;
  payment_provider_id: string | null;
  name: string;
  email: string;
  address: AddressRow;
  metadata: any;
  created_at: Date;
  updated_at: Date;
}

export interface UsersStateRepository {
  createUser: (
    userId: UUID,
    authenticationProviderId: string,
    name: string,
    email: string,
  ) => Promise<boolean>;
  updateUser: (
    userId: UUID,
    name: string,
    email: string,
    address: Address,
  ) => Promise<void>;
  getUser: (userId: UUID) => Promise<User | undefined>;
  getUserByAuthenticationId: (
    authenticationProviderId: string,
  ) => Promise<User | undefined>;
  userExistsWithAuthenticationId: (
    authenticationProviderId: string,
  ) => Promise<boolean>;
  setPaymentProviderId: (userId: UUID, paymentProviderId: string) => Promise<void>;
  getPaymentProviderId: (userId: string) => Promise<string | undefined>;
}

export const UsersStateRepository = (env: EnvDB): UsersStateRepository => {
  const dbConfig: PoolConfig = {
    ...env,
  };

  const pool = new Pool(dbConfig);

  const createUser = async (
    userId: UUID,
    authenticationProviderId: string,
    name: string,
    email: string,
  ): Promise<boolean> => {
    const dbClient = await pool.connect();
    try {
      const result = await dbClient.query(
        `INSERT INTO states.users (user_id, authentication_provider_id, name, email)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (authentication_provider_id) DO NOTHING
        RETURNING user_id
        `,
        [userId, authenticationProviderId, name, email],
      );
      return result.rowCount === 1;
    } catch (error) {
      throw error;
    } finally {
      dbClient.release();
    }
  };

  const updateUser = async (
    userId: UUID,
    name: string,
    email: string,
    address: Address,
  ): Promise<void> => {
    const dbClient = await pool.connect();
    try {
      await dbClient.query(
        `INSERT INTO states.users (user_id, name, email, address) 
        VALUES ($1, $2, $3, $4) 
        ON CONFLICT (user_id) DO UPDATE
        SET name = $2,
            email = $3,
            address = $4,
            updated_at = NOW();
        `,
        [userId, name, email, address],
      );
    } catch (error) {
      throw error;
    } finally {
      dbClient.release();
    }
  };

  const getUser = async (userId: UUID): Promise<User | undefined> => {
    const dbClient = await pool.connect();
    try {
      const results = await dbClient.query(
        `SELECT * FROM states.users  
        WHERE user_id = $1;`,
        [userId],
      );

      return mapUser(results.rows[0]);
    } catch (error) {
      throw error;
    } finally {
      dbClient.release();
    }
  };

  const getUserByAuthenticationId = async (
    authenticationProviderId: string,
  ): Promise<User | undefined> => {
    const dbClient = await pool.connect();
    try {
      const results = await dbClient.query(
        `SELECT * FROM states.users 
        WHERE authentication_provider_id = $1;`,
        [authenticationProviderId],
      );

      if (results.rowCount === null) {
        throw Error();
      }
      if (results.rowCount < 1) return undefined;
      return mapUser(results.rows[0]);
    } catch (error) {
      throw error;
    } finally {
      dbClient.release();
    }
  };

  const userExistsWithAuthenticationId = async (
    authenticationProviderId: string,
  ): Promise<boolean> => {
    const dbClient = await pool.connect();
    try {
      const results = await dbClient.query(
        `SELECT 1 FROM states.users 
        WHERE authentication_provider_id = $1 LIMIT 1;`,
        [authenticationProviderId],
      );

      if (results.rowCount === null) throw Error();

      return results.rowCount > 0;
    } catch (error) {
      throw error;
    } finally {
      dbClient.release();
    }
  };

  const setPaymentProviderId = async (
    userId: UUID,
    paymentProviderId: string,
  ): Promise<void> => {
    const dbClient = await pool.connect();
    try {
      await dbClient.query(
        `UPDATE states.users
        SET payment_provider_id = $2, updated_at = NOW()
        WHERE user_id = $1`,
        [userId, paymentProviderId],
      );
    } finally {
      dbClient.release();
    }
  };

  const getPaymentProviderId = async (
    userId: string,
  ): Promise<string | undefined> => {
    const dbClient = await pool.connect();
    try {
      const result = await dbClient.query(
        `SELECT payment_provider_id FROM states.users WHERE user_id = $1`,
        [userId],
      );
      return result.rows[0]?.payment_provider_id ?? undefined;
    } finally {
      dbClient.release();
    }
  };

  const mapUser = (row: UserTableRow): User => ({
    userId: row.user_id,
    authenticationProviderId: row.authentication_provider_id,
    paymentProviderId: row.payment_provider_id ?? undefined,
    name: row.name,
    email: row.email,
    address: row.address
      ? {
          street: row.address.street,
          city: row.address.city,
          state: row.address.state,
          zipCode: row.address.zip_code,
          country: row.address.country,
        }
      : undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  });

  return {
    createUser,
    updateUser,
    getUser,
    getUserByAuthenticationId,
    userExistsWithAuthenticationId,
    setPaymentProviderId,
    getPaymentProviderId,
  };
};
