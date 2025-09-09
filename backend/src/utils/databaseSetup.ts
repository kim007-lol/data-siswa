import pool from '../config/database';

export const createTable = async (): Promise<void> => {
  const client = await pool.connect();
  try {
    const queryText = `
      CREATE TABLE IF NOT EXISTS siswa (
        id SERIAL PRIMARY KEY,
        nama VARCHAR(255) NOT NULL,
        nisn VARCHAR(10) UNIQUE NOT NULL,
        foto VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        status BOOLEAN DEFAULT TRUE,
        deleted_at TIMESTAMP NULL
      )
    `;
    await client.query(queryText);
    console.log('Table created successfully');
  } catch (error) {
    console.error('Error creating table:', error);
  } finally {
    client.release();
  }
};