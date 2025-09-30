import React, { useMemo, useState } from 'react';
import { View, Text } from 'react-native';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';
import { useRouter } from 'expo-router';
import clsx from 'clsx';
import { ScreenContainer } from '@/components/ScreenContainer';
import { Card } from '@/components/Card';
import { Heading, Body } from '@/components/Typography';
import { Button } from '@/components/Button';
import { useAppContext } from '@/contexts/AppContext';
import { usePrayerTimes } from '@/hooks/usePrayerTimes';
import { LogForm } from '@/components/LogForm';
import { PrayerPromptModal } from '@/components/PrayerPromptModal';
import { totalRemaining, todayISO } from '@/utils/calculations';
import { PrayerLog } from '@/types';
import { useRTL } from '@/hooks/useRTL';

const HomeScreen: React.FC = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const { summaries, logs, addLog } = useAppContext();
  const {
    promptPrayer,
    setPromptPrayer,
    markMissed,
    logQadaPrayer,
    logCurrentPrayer,
    locationDetails,
    nextPrayer
  } = usePrayerTimes();
  const [showForm, setShowForm] = useState(false);
  const { isRTL, writingDirection, textAlign } = useRTL();

  const todayLogs = useMemo(() => logs.filter((log) => log.date === todayISO()), [logs]);

  const prayedToday = todayLogs.filter((log) => log.type === 'current').length;
  const missedToday = Math.max(5 - prayedToday, 0);

  const handleSubmit = async (log: Omit<PrayerLog, 'id'>) => {
    await addLog(log);
  };

  return (
    <ScreenContainer>
      <Card>
        <Heading className="mb-1">{t('dashboard.greeting')}</Heading>
        <Body className="mb-4">{dayjs().format('dddd, MMM D')}</Body>

        <View className="mb-6">
          <Text
            className={clsx(
              'text-sm uppercase tracking-wider text-olive/70 mb-2',
              isRTL ? 'text-right' : 'text-left'
            )}
            style={{ writingDirection }}
          >
            {t('dashboard.nextPrayer')}
          </Text>
          <Text
            className={clsx('text-3xl font-semibold text-teal', isRTL ? 'text-right' : 'text-left')}
            style={{ writingDirection }}
          >
            {nextPrayer ? t(`prayers.${nextPrayer.prayer}`) : t('dashboard.nextPrayer')}
          </Text>
          {nextPrayer && (
            <Body className="mt-2 text-olive/80" style={{ textAlign }}>
              {t('dashboard.nextPrayerAt', { time: dayjs(nextPrayer.time).format('h:mm A') })}
            </Body>
          )}
          {locationDetails?.formatted && (
            <Body className="mt-2 text-olive/70" style={{ textAlign }}>
              {t('dashboard.locationLine', {
                location: locationDetails.formatted
              })}
            </Body>
          )}
        </View>

        <View className="mb-6">
          <Text
            className={clsx(
              'text-sm uppercase tracking-wider text-olive/70 mb-2',
              isRTL ? 'text-right' : 'text-left'
            )}
            style={{ writingDirection }}
          >
            {t('dashboard.totalRemaining')}
          </Text>
          <Text
            className={clsx('text-3xl font-semibold text-teal', isRTL ? 'text-right' : 'text-left')}
            style={{ writingDirection }}
          >
            {totalRemaining(summaries).toLocaleString()}
          </Text>
        </View>

        <View className={clsx('gap-3', isRTL ? 'flex-row-reverse' : 'flex-row')}>
          <View className="flex-1">
            <Button title={t('dashboard.addLog')} onPress={() => setShowForm(true)} />
          </View>
          <View className="flex-1">
            <Button
              title={t('dashboard.viewLogs')}
              variant="secondary"
              onPress={() => router.push('/(tabs)/logs')}
            />
          </View>
        </View>
      </Card>

      <Card>
        <Heading className="mb-3 text-xl">{t('dashboard.todaysProgress')}</Heading>
        <View className={clsx('justify-between', isRTL ? 'flex-row-reverse' : 'flex-row')}>
          <Body>{t('dashboard.prayed', { count: prayedToday })}</Body>
          <Body>{t('dashboard.missed', { count: missedToday })}</Body>
        </View>
      </Card>

      <LogForm visible={showForm} onClose={() => setShowForm(false)} onSubmit={handleSubmit} />
      <PrayerPromptModal
        prayer={promptPrayer}
        onClose={() => setPromptPrayer(null)}
        onMissed={markMissed}
        onQada={logQadaPrayer}
        onOnTime={logCurrentPrayer}
      />
    </ScreenContainer>
  );
};

export default HomeScreen;
