import dayjs from 'dayjs';
import { MissedEstimate, PrayerLog, PrayerName, PrayerSummary, ProgressProjection } from '@/types';
import { PRAYER_ORDER } from '@/constants/prayer';

export const calculateInitialEstimate = (years: number) => {
  if (Number.isNaN(years) || years < 0) return 0;
  return Math.round(years * 365 * 5);
};

export const summarizePrayers = (
  estimates: MissedEstimate[],
  logs: PrayerLog[],
  startDate: string | null
): PrayerSummary[] => {
  return PRAYER_ORDER.map((prayer) => {
    const estimate = estimates.find((e) => e.prayer === prayer);
    const initialCount = estimate?.initialCount ?? 0;
    const totalQadhaPrayed = logs
      .filter((log) => log.prayer === prayer && log.type === 'qadha')
      .reduce((sum, log) => sum + log.count, 0);
    const totalCurrent = logs.filter((log) => log.prayer === prayer && log.type === 'current').length;
    const daysSinceStart = startDate
      ? dayjs().startOf('day').diff(dayjs(startDate).startOf('day'), 'day')
      : 0;
    const missedSinceStart = Math.max(daysSinceStart - totalCurrent, 0);
    const remaining = Math.max(initialCount + missedSinceStart - totalQadhaPrayed, 0);

    return {
      prayer,
      initialCount,
      totalQadhaPrayed,
      totalCurrentPrayed: totalCurrent,
      remaining
    };
  });
};

export const totalRemaining = (summaries: PrayerSummary[]) => {
  return summaries.reduce((sum, prayer) => sum + prayer.remaining, 0);
};

export const totalQadhaPrayed = (logs: PrayerLog[]) => {
  return logs
    .filter((log) => log.type === 'qadha')
    .reduce((sum, log) => sum + log.count, 0);
};

export const buildProjection = (
  summaries: PrayerSummary[],
  logs: PrayerLog[],
  startDate: string | null
): ProgressProjection => {
  const qadhaLogs = logs.filter((log) => log.type === 'qadha');
  if (!startDate || qadhaLogs.length === 0) {
    return { dailyAverage: 0, projectedCompletionDate: null };
  }

  const start = dayjs(startDate).startOf('day');
  const today = dayjs().startOf('day');
  const days = Math.max(today.diff(start, 'day') + 1, 1);
  const totalQadha = qadhaLogs.reduce((sum, log) => sum + log.count, 0);
  const average = totalQadha / days;
  const remaining = totalRemaining(summaries);
  if (average <= 0) {
    return { dailyAverage: 0, projectedCompletionDate: null };
  }
  const daysToComplete = Math.ceil(remaining / average);
  const projectionDate = today.add(daysToComplete, 'day');
  return {
    dailyAverage: parseFloat(average.toFixed(2)),
    projectedCompletionDate: projectionDate.toISOString()
  };
};

export const groupLogsByDate = (logs: PrayerLog[]) => {
  return logs.reduce<Record<string, PrayerLog[]>>((acc, log) => {
    if (!acc[log.date]) acc[log.date] = [];
    acc[log.date].push(log);
    return acc;
  }, {});
};

export const formatTimeForDisplay = (time: string) => {
  if (!time) return '';
  const [hour, minute] = time.split(':').map(Number);
  if (Number.isNaN(hour) || Number.isNaN(minute)) return time;
  const date = dayjs().hour(hour).minute(minute).second(0);
  return date.format('h:mm A');
};

export const todayISO = () => dayjs().format('YYYY-MM-DD');

export const timeNow = () => dayjs().format('HH:mm');

export const sortLogs = (logs: PrayerLog[]) =>
  [...logs].sort((a, b) => {
    if (a.date === b.date) {
      return dayjs(`${b.date} ${b.loggedAt}`).valueOf() - dayjs(`${a.date} ${a.loggedAt}`).valueOf();
    }
    return dayjs(b.date).valueOf() - dayjs(a.date).valueOf();
  });
