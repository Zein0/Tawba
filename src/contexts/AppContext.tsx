import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { I18nManager } from 'react-native';
import {
  adjustMissedEstimate,
  deletePrayerLog,
  getMissedEstimates,
  getPrayerLogs,
  getSettings,
  initializeDatabase,
  insertPrayerLog,
  replaceMissedEstimates,
  resetDatabase,
  updatePrayerLog,
  updateSetting
} from '@/database';
import { MissedEstimate, PrayerLog, PrayerName, PrayerSummary, ProgressProjection, Settings } from '@/types';
import { buildProjection, summarizePrayers, sortLogs } from '@/utils/calculations';
import { reloadApp } from '@/utils/reload';

interface AppContextShape {
  loading: boolean;
  settings: Settings | null;
  estimates: MissedEstimate[];
  logs: PrayerLog[];
  summaries: PrayerSummary[];
  projection: ProgressProjection;
  refresh: () => Promise<void>;
  completeOnboarding: (params: { startDate: string; estimates: MissedEstimate[] }) => Promise<void>;
  addLog: (log: Omit<PrayerLog, 'id'>) => Promise<void>;
  editLog: (log: PrayerLog) => Promise<void>;
  removeLog: (id: number) => Promise<void>;
  setLanguage: (language: Settings['language']) => Promise<void>;
  setFontSize: (size: Settings['fontSize']) => Promise<void>;
  setRemindersEnabled: (enabled: boolean) => Promise<void>;
  updateLocation: (location: Settings['location']) => Promise<void>;
  incrementMissed: (prayer: PrayerName, amount?: number) => Promise<void>;
  resetApp: () => Promise<void>;
}

const AppContext = createContext<AppContextShape | undefined>(undefined);

export const AppProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [estimates, setEstimates] = useState<MissedEstimate[]>([]);
  const [logs, setLogs] = useState<PrayerLog[]>([]);

  const load = async () => {
    const [settingsValue, estimateValue, logsValue] = await Promise.all([
      getSettings(),
      getMissedEstimates(),
      getPrayerLogs()
    ]);
    setSettings(settingsValue);
    setEstimates(estimateValue);
    setLogs(sortLogs(logsValue));
  };

  useEffect(() => {
    (async () => {
      await initializeDatabase();
      await load();
      setLoading(false);
    })();
  }, []);

  const summaries = useMemo(() => {
    if (!settings) return [];
    return summarizePrayers(estimates, logs, settings.startDate);
  }, [estimates, logs, settings]);

  const projection: ProgressProjection = useMemo(() => {
    if (!settings) {
      return { dailyAverage: 0, projectedCompletionDate: null };
    }
    return buildProjection(summaries, logs, settings.startDate);
  }, [summaries, logs, settings]);

  const refresh = async () => {
    await load();
  };

  const completeOnboarding = async ({
    startDate,
    estimates: incoming
  }: {
    startDate: string;
    estimates: MissedEstimate[];
  }) => {
    await updateSetting('startDate', startDate);
    await replaceMissedEstimates(incoming);
    await load();
  };

  const addLog = async (log: Omit<PrayerLog, 'id'>) => {
    if (log.type === 'current') {
      const alreadyLogged = logs.some(
        (entry) => entry.date === log.date && entry.prayer === log.prayer && entry.type === 'current'
      );
      if (alreadyLogged) {
        throw new Error('log-exists');
      }
    }
    await insertPrayerLog(log);
    await refresh();
  };

  const editLog = async (log: PrayerLog) => {
    await updatePrayerLog(log);
    await refresh();
  };

  const removeLog = async (id: number) => {
    await deletePrayerLog(id);
    await refresh();
  };

  const setLanguage = async (language: Settings['language']) => {
    // Save language to database
    await updateSetting('language', language);

    // Force RTL direction for the new language
    const shouldUseRTL = language === 'ar';

    // Check if RTL direction needs to change
    if (I18nManager.isRTL !== shouldUseRTL) {
      // Force the new RTL direction
      I18nManager.forceRTL(shouldUseRTL);

      // Full reload to apply RTL changes
      await reloadApp();
    } else {
      // Just refresh if no RTL change needed
      await refresh();
    }
  };

  const setFontSize = async (size: Settings['fontSize']) => {
    await updateSetting('fontSize', size);
    await refresh();
  };

  const setRemindersEnabled = async (enabled: boolean) => {
    await updateSetting('remindersEnabled', enabled);
    await refresh();
  };

  const updateLocation = async (location: Settings['location']) => {
    await updateSetting('location', location ?? null);
    await refresh();
  };

  const incrementMissed = async (prayer: PrayerName, amount: number = 1) => {
    await adjustMissedEstimate(prayer, amount);
    await refresh();
  };

  const resetApp = async () => {
    setLoading(true);
    await resetDatabase();
    await initializeDatabase();
    await load();
    setLoading(false);
  };

  const value: AppContextShape = {
    loading,
    settings,
    estimates,
    logs,
    summaries,
    projection,
    refresh,
    completeOnboarding,
    addLog,
    editLog,
    removeLog,
    setLanguage,
    setFontSize,
    setRemindersEnabled,
    updateLocation,
    incrementMissed,
    resetApp
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = () => {
  const ctx = useContext(AppContext);
  if (!ctx) {
    throw new Error('useAppContext must be used within AppProvider');
  }
  return ctx;
};
