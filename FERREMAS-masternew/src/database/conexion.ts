import mysql from "mysql2/promise";

const {
  DB_HOST,
  DB_USER,
  DB_PASSWORD,
  DB_NAME
} = process.env;

if (!DB_HOST || !DB_USER || !DB_PASSWORD || !DB_NAME) {
  throw new Error("Faltan variables de entorno para la base de datos");
}

export const db = mysql.createPool({
  host: DB_HOST,
  user: DB_USER,
  password: DB_PASSWORD,
  database: DB_NAME,
  port: Number(process.env.DB_PORT) || 25484,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});