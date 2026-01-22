import { CapacitorSQLite, SQLiteConnection } from "@capacitor-community/sqlite";

const sqlite = new SQLiteConnection(CapacitorSQLite);

let db;

export async function initDB() {
  try {
    // Create connection
    db = await sqlite.createConnection(
      "budget_app_db",
      false,
      "no-encryption",
      4
    );

    // Open database
    await db.open();

    // Create tables

    // transactions table
    await db.execute(`
      CREATE TABLE IF NOT EXISTS transactions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        product TEXT,
        amount REAL,
        image_path TEXT,
        category_id INTEGER,
        payment_method_id INTEGER,
        date TEXT,
        note TEXT,
        purpose_id INTEGER
      );
    `);

    // categories table
    await db.execute(`
      CREATE TABLE IF NOT EXISTS categories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        color TEXT
      );
    `);

    // payment_methods table
    await db.execute(`
      CREATE TABLE IF NOT EXISTS payment_methods (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT
      );
    `);

    // purposes table
    await db.execute(`
      CREATE TABLE IF NOT EXISTS purposes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT
      );
    `);

    // budget table
    await db.execute(`
      CREATE TABLE IF NOT EXISTS budget (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        amount TEXT,
        month INTEGER,
        year INTEGER
      );
    `);

    // profile table
    await db.execute(`
      CREATE TABLE IF NOT EXISTS profile (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        email TEXT,
        pin INTEGER
      );
    `);

    return true;
  } catch (err) {
    console.error("DB init error:", err);
    return false;
  }
}

export function getDB() {
  if (!db) throw new Error("Database not initialized!");
  return db;
}
