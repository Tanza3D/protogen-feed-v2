import SqliteDb from 'better-sqlite3'
import { Kysely, Migrator, SqliteDialect } from 'kysely'
import { DatabaseSchema } from './schema'
import { migrationProvider } from './migrations'
import mysql, {Connection} from 'mysql2/promise'

export const createDb = () => {

  const connection = mysql.createPool({
    host: "localhost",
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: "protogenfeed",
    connectionLimit: 10,
  });
  return connection;
}

export type Database = Connection
