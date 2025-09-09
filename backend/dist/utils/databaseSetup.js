"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createTable = void 0;
const database_1 = __importDefault(require("../config/database"));
const createTable = async () => {
    const client = await database_1.default.connect();
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
    }
    catch (error) {
        console.error('Error creating table:', error);
    }
    finally {
        client.release();
    }
};
exports.createTable = createTable;
//# sourceMappingURL=databaseSetup.js.map