/**
 * Local-only card storage using expo-sqlite.
 * Sensitive values (card number, PIN) are stored separately in SecureStore.
 */
import * as SQLite from "expo-sqlite";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

const DB_NAME = "giftcards.db";

export interface LocalCard {
  id: string;
  merchant_id: string;
  merchant_name: string;
  merchant_color: string | null;
  nickname: string | null;
  notes: string | null;
  balance: number | null;
  balance_updated_at: string | null;
  created_at: string;
}

async function getDb(): Promise<SQLite.SQLiteDatabase> {
  return SQLite.openDatabaseAsync(DB_NAME);
}

export async function initLocalDb(): Promise<void> {
  if (Platform.OS === "web") return; // Use IndexedDB fallback (not implemented here)
  const db = await getDb();
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS local_cards (
      id TEXT PRIMARY KEY,
      merchant_id TEXT NOT NULL,
      merchant_name TEXT NOT NULL,
      merchant_color TEXT,
      nickname TEXT,
      notes TEXT,
      balance REAL,
      balance_updated_at TEXT,
      created_at TEXT NOT NULL
    );
  `);
}

export async function saveLocalCard(card: Omit<LocalCard, "created_at"> & {
  card_number: string;
  pin?: string;
}): Promise<void> {
  if (Platform.OS === "web") return;
  const db = await getDb();
  const now = new Date().toISOString();
  const id = card.id;

  await db.runAsync(
    `INSERT OR REPLACE INTO local_cards
     (id, merchant_id, merchant_name, merchant_color, nickname, notes, balance, balance_updated_at, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [id, card.merchant_id, card.merchant_name, card.merchant_color ?? null,
     card.nickname ?? null, card.notes ?? null, card.balance ?? null,
     card.balance_updated_at ?? null, now]
  );

  // Store sensitive data in SecureStore
  await SecureStore.setItemAsync(`card_number_${id}`, card.card_number);
  if (card.pin) {
    await SecureStore.setItemAsync(`card_pin_${id}`, card.pin);
  }
}

export async function getLocalCards(): Promise<LocalCard[]> {
  if (Platform.OS === "web") return [];
  const db = await getDb();
  return db.getAllAsync<LocalCard>("SELECT * FROM local_cards ORDER BY created_at DESC");
}

export async function getLocalCardSecrets(id: string): Promise<{ card_number: string; pin: string | null }> {
  const card_number = (await SecureStore.getItemAsync(`card_number_${id}`)) ?? "";
  const pin = await SecureStore.getItemAsync(`card_pin_${id}`);
  return { card_number, pin };
}

export async function updateLocalCardBalance(id: string, balance: number): Promise<void> {
  if (Platform.OS === "web") return;
  const db = await getDb();
  await db.runAsync(
    "UPDATE local_cards SET balance = ?, balance_updated_at = ? WHERE id = ?",
    [balance, new Date().toISOString(), id]
  );
}

export async function deleteLocalCard(id: string): Promise<void> {
  if (Platform.OS === "web") return;
  const db = await getDb();
  await db.runAsync("DELETE FROM local_cards WHERE id = ?", [id]);
  await SecureStore.deleteItemAsync(`card_number_${id}`);
  await SecureStore.deleteItemAsync(`card_pin_${id}`);
}
