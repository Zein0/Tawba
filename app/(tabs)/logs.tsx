import React, { useMemo, useState } from 'react';
import { Alert, ScrollView, Text, View } from 'react-native';
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

const LogsScreen: React.FC = () => {
  const { t } = useTranslation();
  const { logs, addLog, editLog, removeLog } = useAppContext();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<PrayerLog | null>(null);

  const groupedLogs = useMemo(() => groupLogsByDate(logs), [logs]);
  const dates = useMemo(() => Object.keys(groupedLogs).sort((a, b) => dayjs(b).valueOf() - dayjs(a).valueOf()), [groupedLogs]);

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
      <View className="flex-row justify-between items-center mb-4">
        <Heading className="text-2xl">{t('logs.title')}</Heading>
        <Button title={t('logs.add')} onPress={handleAdd} />
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 120 }}>
        {dates.length === 0 && (
          <Card>
            <Body>{t('logs.empty')}</Body>
          </Card>
        )}

        {dates.map((date) => (
          <Card key={date} className="mb-4">
            <Text className="text-sm uppercase text-olive/70 mb-3">{dayjs(date).format('MMM D, YYYY')}</Text>
            {groupedLogs[date].map((log) => (
              <View key={log.id} className="mb-4 rounded-2xl bg-olive/10 p-4">
                <View className="flex-row justify-between mb-2">
                  <Body className="font-semibold">{t(`prayers.${log.prayer}`)}</Body>
                  <Body>{formatTimeForDisplay(log.loggedAt)}</Body>
                </View>
                <Body>
                  {log.type === 'current'
                    ? t('logs.typeCurrent')
                    : `${t('logs.typeQadha')} · ${log.count}`}
                </Body>
                <View className="flex-row gap-3 mt-3">
                  <View className="flex-1">
                    <Button title={t('logs.edit')} variant="secondary" onPress={() => handleEdit(log)} />
                  </View>
                  <View className="flex-1">
                    <Button title={t('logs.delete')} variant="secondary" onPress={() => handleDelete(log)} />
                  </View>
                </View>
              </View>
            ))}
          </Card>
        ))}
      </ScrollView>

      <LogForm visible={showForm} onClose={() => setShowForm(false)} onSubmit={handleSubmit} initial={editing} />
    </ScreenContainer>
  );
};

export default LogsScreen;
