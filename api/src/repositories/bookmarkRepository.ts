import { Logger } from "winston";
import { Pool, PoolConfig } from "pg";

export interface BookmarkTableRow {
  process_name: string;
  bookmark: number;
}

export interface BookmarkRepository {
  getBookmark: () => Promise<number>;
  setBookmark: (value: number) => Promise<void>;
}

export const BookmarkRepository = (
  env: any,
  process_name: string
): BookmarkRepository => {
  const dbConfig: PoolConfig = {
    ...env,
  };

  const pool = new Pool(dbConfig);

  const getBookmark = async (): Promise<number> => {
    const dbClient = await pool.connect();
    try {
      const results = await dbClient.query(
        `SELECT * FROM states.bookmarks WHERE process_name = $1;`,
        [process_name]
      );
      return results.rowCount === 0 ? 0 : results.rows[0].bookmark;
    } catch (error) {
      throw error;
    } finally {
      dbClient.release();
    }
  };

  const setBookmark = async (value: number): Promise<void> => {
    const dbClient = await pool.connect();
    try {
      await dbClient.query(
        `INSERT INTO states.bookmarks (process_name, bookmark) 
        VALUES ($1, $2)
        ON CONFLICT (process_name) DO UPDATE
        SET bookmark = $2;`,
        [process_name, value]
      );
    } catch (error) {
      throw error;
    } finally {
      dbClient.release();
    }
  };

  return {
    getBookmark,
    setBookmark,
  };
};
