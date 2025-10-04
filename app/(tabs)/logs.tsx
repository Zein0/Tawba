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
import { useRTL } from '@/hooks/useRTL';

const LogsScreen: React.FC = () => {
  const { t } = useTranslation();
  const { logs, addLog, editLog, removeLog, settings } = useAppContext();
  const rtl = useRTL();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<PrayerLog | null>(null);

  const groupedLogs = useMemo(() => groupLogsByDate(logs), [logs]);
  const dates = useMemo(
    () => Object.keys(groupedLogs).sort((a, b) => dayjs(b).valueOf() - dayjs(a).valueOf()),
    [groupedLogs]
  );
  const [selectedDate, setSelectedDate] = useState<'all' | string>('all');
  const [showDatePicker, setShowDatePicker] = useState(false);

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
      <View className={clsx("mb-4 items-center justify-between", rtl.flexDirection)}>
        <View className={clsx("flex-1", rtl.pr("4"))}>
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
                'mb-4 items-center justify-between rounded-2xl border px-4 py-3',
                rtl.flexDirection,
                'border-olive/20 bg-white/70 shadow-sm shadow-black/5'
              )}
              accessibilityRole="button"
              accessibilityLabel={t('logs.filterLabel')}
            >
              <View className={clsx("items-center gap-3", rtl.flexDirection)}>
                <Ionicons
                  name="calendar-outline"
                  size={18}
                  color="#3e4c41"
                />
                <Text className="font-semibold text-teal">
                  {dateLabel}
                </Text>
              </View>
              <Ionicons
                name="chevron-down"
                size={18}
                color="#6b7a70"
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
                <View className="rounded-t-3xl px-5 pb-6 pt-4 bg-white">
                  <View className={clsx("mb-3 items-center justify-between", rtl.flexDirection)}>
                    <Text className="text-lg font-semibold text-teal">
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
                              'items-center justify-between rounded-2xl px-4 py-3',
                              rtl.flexDirection,
                              active ? 'bg-olive/15' : 'bg-white'
                            )}
                          >
                            <Text
                              className={clsx(
                                'font-medium',
                                active ? 'text-teal' : 'text-olive/70'
                              )}
                            >
                              {label}
                            </Text>
                            {active && (
                              <Ionicons
                                name="checkmark"
                                size={18}
                                color="#2f7a55"
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
          <Card key={date} className="space-y-4 border border-olive/15">
            <View className={clsx("items-center justify-between", rtl.flexDirection)}>
              <Text className={clsx("text-xs uppercase tracking-[2px] text-olive/60", rtl.textAlign)}>
                {dayjs(date).format('MMM D, YYYY')}
              </Text>
              <Text className="text-xs font-medium text-olive/70">
                {t('logs.totalForDay', { count: groupedLogs[date].length })}
              </Text>
            </View>
            <View className="space-y-3">
              {groupedLogs[date].map((log) => {
                const badgeBackground =
                  log.type === 'current' ? 'bg-emerald-500/10' : 'bg-amber-500/10';
                const badgeText =
                  log.type === 'current' ? 'text-emerald-600' : 'text-amber-600';

                return (
                  <View
                    key={log.id}
                    className="rounded-2xl border border-olive/20 bg-white/70 p-3"
                  >
                    <View className={clsx("items-center justify-between", rtl.flexDirection)}>
                      <Body className="font-semibold">{t(`prayers.${log.prayer}`)}</Body>
                      <Text className={clsx("text-xs font-semibold uppercase tracking-wide text-olive/70", rtl.textAlign)}>
                        {formatTimeForDisplay(log.loggedAt)}
                      </Text>
                    </View>
                    <View className={clsx("mt-2 items-center justify-between", rtl.flexDirection)}>
                      <View className={clsx("items-center gap-2", rtl.flexDirection)}>
                        <View className={clsx('rounded-full px-3 py-1', badgeBackground)}>
                          <Text className={clsx('text-xs font-semibold uppercase tracking-wide', badgeText)}>
                            {t(`logs.badge${log.type === 'current' ? 'Current' : 'Qada'}`)} · {log.count}
                          </Text>
                        </View>
                      </View>
                      <View className={clsx("items-center gap-2", rtl.flexDirection)}>
                        <Pressable
                          accessibilityRole="button"
                          accessibilityLabel={t('logs.edit')}
                          onPress={() => handleEdit(log)}
                          className="rounded-full p-2 bg-olive/15"
                        >
                          <Ionicons
                            name="create-outline"
                            size={18}
                            color="#3f4f43"
                          />
                        </Pressable>
                        <Pressable
                          accessibilityRole="button"
                          accessibilityLabel={t('logs.delete')}
                          onPress={() => handleDelete(log)}
                          className="rounded-full p-2 bg-red-100"
                        >
                          <Ionicons
                            name="trash-outline"
                            size={18}
                            color="#b91c1c"
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
