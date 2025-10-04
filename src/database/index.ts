import { openDatabaseAsync, SQLiteDatabase } from 'expo-sqlite';
import dayjs from 'dayjs';
import { MissedEstimate, PrayerLog, PrayerName, PrayerType, Settings } from '@/types';
import { PRAYER_ORDER } from '@/constants/prayer';

let dbPromise: Promise<SQLiteDatabase> | null = null;

const settingKeyMap: Record<keyof Settings, string> = {
  language: 'language',
  fontSize: 'font_size',
  startDate: 'start_date',
  remindersEnabled: 'reminders_enabled',
  location: 'location'
};

const serializeSettingValue = (key: keyof Settings, value: Settings[keyof Settings]) => {
  if (value === null || value === undefined) return null;
  if (key === 'remindersEnabled') {
    return value ? '1' : '0';
  }
  if (typeof value === 'object') {
    return JSON.stringify(value);
  }
  return String(value);
};

const deserializeSettingValue = (key: keyof Settings, value: string | null) => {
  if (value === null || value === undefined) {
    return null;
  }
  switch (key) {
    case 'remindersEnabled':
      return value === '1';
    case 'location':
      try {
        return JSON.parse(value);
      } catch (error) {
        return null;
      }
    case 'startDate':
      return value;
    case 'fontSize':
      return value as Settings['fontSize'];
    case 'language':
      return value as Settings['language'];
    default:
      return value;
  }
};

export const getDb = () => {
  if (!dbPromise) {
    dbPromise = openDatabaseAsync('tawba.db');
  }
  return dbPromise;
};

export const initializeDatabase = async () => {
  const db = await getDb();
  await db.execAsync(`
    PRAGMA foreign_keys = ON;
    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY NOT NULL,
      value TEXT
    );
    CREATE TABLE IF NOT EXISTS missed_estimates (
      prayer TEXT PRIMARY KEY NOT NULL,
      initial_count INTEGER NOT NULL DEFAULT 0
    );
    CREATE TABLE IF NOT EXISTS prayer_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      date TEXT NOT NULL,
      prayer TEXT NOT NULL,
      type TEXT NOT NULL,
      count INTEGER NOT NULL,
      logged_at TEXT NOT NULL
    );
  `);

  await db.execAsync("UPDATE prayer_logs SET type='qada' WHERE type='qadha';");

  const defaults: Partial<Settings> = {
    language: 'en',
    fontSize: 'medium',
    startDate: null,
    remindersEnabled: true,
    location: null
  };

  await Promise.all(
    Object.entries(defaults).map(async ([key, value]) => {
      const dbKey = settingKeyMap[key as keyof Settings];
      await db.runAsync(
        'INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?)',
        dbKey,
        serializeSettingValue(key as keyof Settings, value as Settings[keyof Settings])
      );
    })
  );

  await Promise.all(
    PRAYER_ORDER.map(async (prayer) => {
      await db.runAsync(
        'INSERT OR IGNORE INTO missed_estimates (prayer, initial_count) VALUES (?, ?)',
        prayer,
        0
      );
    })
  );
};

export const getSettings = async (): Promise<Settings> => {
  const db = await getDb();
  const rows = await db.getAllAsync<{ key: string; value: string | null }>('SELECT key, value FROM settings');
  const map = Object.fromEntries(rows.map((row) => [row.key, row.value]));
  return {
    language: (deserializeSettingValue('language', map[settingKeyMap.language]) as Settings['language']) ?? 'en',
    fontSize: (deserializeSettingValue('fontSize', map[settingKeyMap.fontSize]) as Settings['fontSize']) ?? 'medium',
    startDate: (deserializeSettingValue('startDate', map[settingKeyMap.startDate]) as Settings['startDate']) ?? null,
    remindersEnabled:
      (deserializeSettingValue('remindersEnabled', map[settingKeyMap.remindersEnabled]) as Settings['remindersEnabled']) ??
      true,
    location: (deserializeSettingValue('location', map[settingKeyMap.location]) as Settings['location']) ?? null
  };
};

export const updateSetting = async <K extends keyof Settings>(key: K, value: Settings[K]) => {
  const db = await getDb();
  const dbKey = settingKeyMap[key];
  const storedValue = serializeSettingValue(key, value);
  await db.runAsync(
    'INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value=excluded.value',
    dbKey,
    storedValue
  );
};

export const getMissedEstimates = async (): Promise<MissedEstimate[]> => {
  const db = await getDb();
  const rows = await db.getAllAsync<{ prayer: PrayerName; initial_count: number }>(
    'SELECT prayer, initial_count FROM missed_estimates'
  );
  return rows.map((row) => ({ prayer: row.prayer, initialCount: row.initial_count }));
};

export const upsertMissedEstimate = async (estimate: MissedEstimate) => {
  const db = await getDb();
  await db.runAsync(
    'INSERT INTO missed_estimates (prayer, initial_count) VALUES (?, ?) ON CONFLICT(prayer) DO UPDATE SET initial_count=excluded.initial_count',
    estimate.prayer,
    estimate.initialCount
  );
};

export const replaceMissedEstimates = async (estimates: MissedEstimate[]) => {
  const db = await getDb();
  await db.runAsync('DELETE FROM missed_estimates');
  for (const estimate of estimates) {
    await db.runAsync(
      'INSERT INTO missed_estimates (prayer, initial_count) VALUES (?, ?)',
      estimate.prayer,
      estimate.initialCount
    );
  }
};

export const adjustMissedEstimate = async (prayer: PrayerName, delta: number) => {
  const db = await getDb();
  await db.runAsync('UPDATE missed_estimates SET initial_count = MAX(initial_count + ?, 0) WHERE prayer = ?', delta, prayer);
};

export const getPrayerLogs = async (): Promise<PrayerLog[]> => {
  const db = await getDb();
  const rows = await db.getAllAsync<{
    id: number;
    date: string;
    prayer: PrayerName;
    type: PrayerType;
    count: number;
    logged_at: string;
  }>('SELECT id, date, prayer, type, count, logged_at FROM prayer_logs ORDER BY date DESC, logged_at DESC');
  return rows.map((row) => ({
    id: row.id,
    date: row.date,
    prayer: row.prayer,
    type: (row.type === 'qada' ? 'qada' : row.type) as PrayerType,
    count: row.count,
    loggedAt: row.logged_at
  }));
};

export const insertPrayerLog = async (log: Omit<PrayerLog, 'id'>) => {
  const db = await getDb();
  await db.runAsync(
    'INSERT INTO prayer_logs (date, prayer, type, count, logged_at) VALUES (?, ?, ?, ?, ?)',
    log.date,
    log.prayer,
    log.type,
    log.count,
    log.loggedAt
  );
};

export const updatePrayerLog = async (log: PrayerLog) => {
  const db = await getDb();
  await db.runAsync(
    'UPDATE prayer_logs SET date=?, prayer=?, type=?, count=?, logged_at=? WHERE id=?',
    log.date,
    log.prayer,
    log.type,
    log.count,
    log.loggedAt,
    log.id
  );
};

export const deletePrayerLog = async (id: number) => {
  const db = await getDb();
  await db.runAsync('DELETE FROM prayer_logs WHERE id=?', id);
};

export const resetDatabase = async () => {
  const db = await getDb();
  await db.execAsync('DELETE FROM settings; DELETE FROM missed_estimates; DELETE FROM prayer_logs;');
};

export const getTodayLogs = async (date: string) => {
  const db = await getDb();
  return db.getAllAsync<{
    id: number;
    date: string;
    prayer: PrayerName;
    type: PrayerType;
    count: number;
    logged_at: string;
  }>('SELECT * FROM prayer_logs WHERE date = ? ORDER BY logged_at DESC', date);
};

export const countMissedSinceStart = (
  startDate: string | null,
  logs: PrayerLog[],
  prayer: PrayerName
) => {
  if (!startDate) return 0;
  const totalDays = dayjs().startOf('day').diff(dayjs(startDate).startOf('day'), 'day');
  const totalCurrent = logs.filter((l) => l.prayer === prayer && l.type === 'current').length;
  return Math.max(totalDays - totalCurrent, 0);
};
