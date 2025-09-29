import React, { useEffect, useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';
import { ScreenContainer } from '@/components/ScreenContainer';
import { Card } from '@/components/Card';
import { Heading, Body } from '@/components/Typography';
import { Button } from '@/components/Button';
import { LogForm } from '@/components/LogForm';
import { useAppContext } from '@/contexts/AppContext';
import { groupLogsByDate, formatTimeForDisplay } from '@/utils/calculations';
import { PrayerLog } from '@/types';
import clsx from 'clsx';

const LogsScreen: React.FC = () => {
  const { t } = useTranslation();
  const { logs, addLog, editLog, removeLog } = useAppContext();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<PrayerLog | null>(null);

  const groupedLogs = useMemo(() => groupLogsByDate(logs), [logs]);
  const dates = useMemo(
    () => Object.keys(groupedLogs).sort((a, b) => dayjs(b).valueOf() - dayjs(a).valueOf()),
    [groupedLogs]
  );
  const [selectedDate, setSelectedDate] = useState<'all' | string>('all');

  useEffect(() => {
    if (selectedDate !== 'all' && !dates.includes(selectedDate)) {
      setSelectedDate('all');
    }
  }, [dates, selectedDate]);

  const filteredDates = useMemo(() => {
    if (selectedDate === 'all') return dates;
    return dates.filter((date) => date === selectedDate);
  }, [dates, selectedDate]);

  const handleAdd = () => {
    setEditing(null);
    setShowForm(true);
  };

  const handleEdit = (log: PrayerLog) => {
    setEditing(log);
    setShowForm(true);
  };

  const handleDelete = (log: PrayerLog) => {
    Alert.alert(t('logs.delete'), t('logs.confirmDelete'), [
      { text: t('forms.cancel'), style: 'cancel' },
      {
        text: t('forms.confirm'),
        style: 'destructive',
        onPress: async () => {
          await removeLog(log.id);
        }
      }
    ]);
  };

  const handleSubmit = async (payload: Omit<PrayerLog, 'id'>) => {
    if (editing) {
      await editLog({ ...editing, ...payload });
    } else {
      await addLog(payload);
    }
  };

  return (
    <ScreenContainer>
      <View className="mb-4 flex-row items-center justify-between">
        <View className="flex-1 pr-4">
          <Heading className="text-2xl">{t('logs.title')}</Heading>
          <Body className="mt-1 text-olive/70">{t('logs.subtitle')}</Body>
        </View>
        <Button title={t('logs.add')} onPress={handleAdd} size="compact" fullWidth={false} />
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 120 }}>
        {dates.length > 0 && (
          <Card className="mb-4 space-y-3 border border-olive/15 dark:border-white/10">
            <View>
              <Text className="mb-2 text-xs uppercase tracking-[2px] text-olive/60 dark:text-white/60">
                {t('logs.filterLabel')}
              </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View className="flex-row gap-2 pr-3">
                  {(['all', ...dates] as Array<'all' | string>).map((value) => {
                    const active = selectedDate === value;
                    const label = value === 'all'
                      ? t('logs.filterAll')
                      : dayjs(value).format('MMM D');
                    return (
                      <Pressable
                        key={value}
                        onPress={() => setSelectedDate(value)}
                        className={clsx(
                          'rounded-full px-4 py-2',
                          active ? 'bg-olive' : 'bg-olive/10 dark:bg-white/10'
                        )}
                      >
                        <Text className={clsx('font-semibold', active ? 'text-white' : 'text-teal dark:text-white')}>
                          {label}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </ScrollView>
            </View>
            <Body className="text-sm text-olive/70 dark:text-white/60">{t('logs.filterHint')}</Body>
          </Card>
        )}

        {dates.length === 0 && (
          <Card className="items-center">
            <Body className="text-center text-olive/70">{t('logs.empty')}</Body>
          </Card>
        )}

        {filteredDates.map((date) => (
          <Card key={date} className="space-y-4 border border-olive/15 dark:border-white/10">
            <View className="flex-row items-center justify-between">
              <Text className="text-xs uppercase tracking-[2px] text-olive/60 dark:text-white/60">
                {dayjs(date).format('MMM D, YYYY')}
              </Text>
              <Text className="text-xs font-medium text-olive/70 dark:text-white/70">
                {t('logs.totalForDay', { count: groupedLogs[date].length })}
              </Text>
            </View>
            <View className="space-y-3">
              {groupedLogs[date].map((log) => (
                <View
                  key={log.id}
                  className="rounded-2xl border border-olive/20 bg-white/70 p-4 dark:border-white/10 dark:bg-white/5"
                >
                  <View className="flex-row items-center justify-between">
                    <Body className="font-semibold">{t(`prayers.${log.prayer}`)}</Body>
                    <Text className="text-xs font-semibold uppercase tracking-wide text-olive/70 dark:text-white/60">
                      {formatTimeForDisplay(log.loggedAt)}
                    </Text>
                  </View>
                  <View className="mt-2 flex-row items-center justify-between">
                    <Body className="text-sm text-olive/80 dark:text-white/70">
                      {log.type === 'current'
                        ? t('logs.typeCurrent')
                        : `${t('logs.typeQada')} · ${log.count}`}
                    </Body>
                    <View
                      className={`rounded-full px-3 py-1 ${
                        log.type === 'current'
                          ? 'bg-emerald-500/10'
                          : 'bg-amber-500/10'
                      }`}
                    >
                      <Text
                        className={`text-xs font-semibold uppercase tracking-wide ${
                          log.type === 'current' ? 'text-emerald-600' : 'text-amber-600'
                        }`}
                      >
                        {t(`logs.badge${log.type === 'current' ? 'Current' : 'Qada'}`)}
                      </Text>
                    </View>
                  </View>
                  <View className="mt-3 flex-row gap-2">
                    <View className="flex-1">
                      <Button
                        title={t('logs.edit')}
                        variant="secondary"
                        size="compact"
                        onPress={() => handleEdit(log)}
                      />
                    </View>
                    <View className="flex-1">
                      <Button
                        title={t('logs.delete')}
                        variant="secondary"
                        size="compact"
                        onPress={() => handleDelete(log)}
                      />
                    </View>
                  </View>
                </View>
              ))}
            </View>
          </Card>
        ))}
      </ScrollView>

      <LogForm visible={showForm} onClose={() => setShowForm(false)} onSubmit={handleSubmit} initial={editing} />
    </ScreenContainer>
  );
};

export default LogsScreen;
