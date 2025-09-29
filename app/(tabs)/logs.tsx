import React, { useEffect, useMemo, useState } from 'react';
import { Alert, Modal, Pressable, ScrollView, Text, View } from 'react-native';
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
import { Ionicons } from '@expo/vector-icons';

const LogsScreen: React.FC = () => {
  const { t } = useTranslation();
  const { logs, addLog, editLog, removeLog, settings } = useAppContext();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<PrayerLog | null>(null);

  const groupedLogs = useMemo(() => groupLogsByDate(logs), [logs]);
  const dates = useMemo(
    () => Object.keys(groupedLogs).sort((a, b) => dayjs(b).valueOf() - dayjs(a).valueOf()),
    [groupedLogs]
  );
  const [selectedDate, setSelectedDate] = useState<'all' | string>('all');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const isDark = settings?.theme === 'dark';

  useEffect(() => {
    if (selectedDate !== 'all' && !dates.includes(selectedDate)) {
      setSelectedDate('all');
    }
  }, [dates, selectedDate]);

  const filteredDates = useMemo(() => {
    if (selectedDate === 'all') return dates;
    return dates.filter((date) => date === selectedDate);
  }, [dates, selectedDate]);

  const dateLabel = useMemo(() => {
    if (selectedDate === 'all') {
      return t('logs.filterAll');
    }
    return dayjs(selectedDate).format('MMM D, YYYY');
  }, [selectedDate, t]);

  const handleSelectDate = (value: 'all' | string) => {
    setSelectedDate(value);
    setShowDatePicker(false);
  };

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
          <>
            <Pressable
              onPress={() => setShowDatePicker(true)}
              className={clsx(
                'mb-4 flex-row items-center justify-between rounded-2xl border px-4 py-3',
                isDark ? 'border-white/10 bg-white/5' : 'border-olive/20 bg-white/70 shadow-sm shadow-black/5'
              )}
              accessibilityRole="button"
              accessibilityLabel={t('logs.filterLabel')}
            >
              <View className="flex-row items-center gap-3">
                <Ionicons
                  name="calendar-outline"
                  size={18}
                  color={isDark ? '#f4f4f5' : '#3e4c41'}
                />
                <Text className={clsx('font-semibold', isDark ? 'text-white' : 'text-teal')}>
                  {dateLabel}
                </Text>
              </View>
              <Ionicons
                name="chevron-down"
                size={18}
                color={isDark ? '#e5e7eb' : '#6b7a70'}
              />
            </Pressable>

            <Modal
              visible={showDatePicker}
              transparent
              animationType="fade"
              onRequestClose={() => setShowDatePicker(false)}
            >
              <View className="flex-1 justify-end bg-black/40">
                <Pressable className="flex-1" onPress={() => setShowDatePicker(false)} accessible={false} />
                <View
                  className={clsx(
                    'rounded-t-3xl px-5 pb-6 pt-4',
                    isDark ? 'bg-[#1f2429]' : 'bg-white'
                  )}
                >
                  <View className="mb-3 flex-row items-center justify-between">
                    <Text className={clsx('text-lg font-semibold', isDark ? 'text-white' : 'text-teal')}>
                      {t('logs.filterLabel')}
                    </Text>
                  </View>
                  <View className="max-h-80">
                    <ScrollView showsVerticalScrollIndicator={false}>
                      {(['all', ...dates] as Array<'all' | string>).map((value) => {
                        const active = selectedDate === value;
                        const label =
                          value === 'all' ? t('logs.filterAll') : dayjs(value).format('MMM D, YYYY');
                        return (
                          <Pressable
                            key={value}
                            onPress={() => handleSelectDate(value)}
                            className={clsx(
                              'flex-row items-center justify-between rounded-2xl px-4 py-3',
                              active
                                ? isDark
                                  ? 'bg-teal/30'
                                  : 'bg-olive/15'
                                : isDark
                                ? 'bg-white/5'
                                : 'bg-white'
                            )}
                          >
                            <Text
                              className={clsx(
                                'font-medium',
                                isDark
                                  ? active
                                    ? 'text-white'
                                    : 'text-white/70'
                                  : active
                                  ? 'text-teal'
                                  : 'text-olive/70'
                              )}
                            >
                              {label}
                            </Text>
                            {active && (
                              <Ionicons
                                name="checkmark"
                                size={18}
                                color={isDark ? '#22d3ee' : '#2f7a55'}
                              />
                            )}
                          </Pressable>
                        );
                      })}
                    </ScrollView>
                  </View>
                </View>
              </View>
            </Modal>
          </>
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
              {groupedLogs[date].map((log) => {
                const badgeBackground =
                  log.type === 'current'
                    ? isDark
                      ? 'bg-emerald-500/20'
                      : 'bg-emerald-500/10'
                    : isDark
                    ? 'bg-amber-500/20'
                    : 'bg-amber-500/15';
                const badgeText =
                  log.type === 'current'
                    ? isDark
                      ? 'text-emerald-200'
                      : 'text-emerald-600'
                    : isDark
                    ? 'text-amber-200'
                    : 'text-amber-600';

                return (
                  <View
                    key={log.id}
                    className={clsx(
                      'rounded-2xl border p-3',
                      isDark ? 'border-white/10 bg-white/5' : 'border-olive/20 bg-white/70'
                    )}
                  >
                    <View className="flex-row items-center justify-between">
                      <Body className="font-semibold">{t(`prayers.${log.prayer}`)}</Body>
                      <Text className="text-xs font-semibold uppercase tracking-wide text-olive/70 dark:text-white/60">
                        {formatTimeForDisplay(log.loggedAt)}
                      </Text>
                    </View>
                    <View className="mt-2 flex-row items-center justify-between">
                      <View className="flex-row items-center gap-2">
                        <Body className="text-sm text-olive/80 dark:text-white/70">
                          {log.type === 'current'
                            ? t('logs.typeCurrent')
                            : `${t('logs.typeQada')} · ${log.count}`}
                        </Body>
                        <View className={clsx('rounded-full px-3 py-1', badgeBackground)}>
                          <Text className={clsx('text-xs font-semibold uppercase tracking-wide', badgeText)}>
                            {t(`logs.badge${log.type === 'current' ? 'Current' : 'Qada'}`)}
                          </Text>
                        </View>
                      </View>
                      <View className="flex-row items-center gap-2">
                        <Pressable
                          accessibilityRole="button"
                          accessibilityLabel={t('logs.edit')}
                          onPress={() => handleEdit(log)}
                          className={clsx('rounded-full p-2', isDark ? 'bg-white/10' : 'bg-olive/15')}
                        >
                          <Ionicons
                            name="create-outline"
                            size={18}
                            color={isDark ? '#f8fafc' : '#3f4f43'}
                          />
                        </Pressable>
                        <Pressable
                          accessibilityRole="button"
                          accessibilityLabel={t('logs.delete')}
                          onPress={() => handleDelete(log)}
                          className={clsx('rounded-full p-2', isDark ? 'bg-red-500/20' : 'bg-red-100')}
                        >
                          <Ionicons
                            name="trash-outline"
                            size={18}
                            color={isDark ? '#fca5a5' : '#b91c1c'}
                          />
                        </Pressable>
                      </View>
                    </View>
                  </View>
                );
              })}
            </View>
          </Card>
        ))}
      </ScrollView>

      <LogForm visible={showForm} onClose={() => setShowForm(false)} onSubmit={handleSubmit} initial={editing} />
    </ScreenContainer>
  );
};

export default LogsScreen;
