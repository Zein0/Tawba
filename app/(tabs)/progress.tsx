import React, { useEffect, useMemo, useState } from 'react';
import dayjs from 'dayjs';
import { ScrollView, View, Text, TextInput, Pressable } from 'react-native';
import { useTranslation } from 'react-i18next';
import { ScreenContainer } from '@/components/ScreenContainer';
import { Card } from '@/components/Card';
import { Heading, Body } from '@/components/Typography';
import { ProgressBar } from '@/components/ProgressBar';
import { useAppContext } from '@/contexts/AppContext';
import { PrayerName } from '@/types';
import { totalRemaining } from '@/utils/calculations';
import clsx from 'clsx';

const ProgressScreen: React.FC = () => {
  const { t } = useTranslation();
  const { summaries, projection } = useAppContext();
  const [selectedPrayer, setSelectedPrayer] = useState<'all' | PrayerName>('all');
  const [userEditedTarget, setUserEditedTarget] = useState(false);
  const [dailyTarget, setDailyTarget] = useState(() =>
    projection.dailyAverage > 0 ? Math.max(1, Math.round(projection.dailyAverage)).toString() : '2'
  );

  useEffect(() => {
    if (!userEditedTarget) {
      if (projection.dailyAverage > 0) {
        setDailyTarget(Math.max(1, Math.round(projection.dailyAverage)).toString());
      } else {
        setDailyTarget('2');
      }
    }
  }, [projection.dailyAverage, userEditedTarget]);

  const remainingForSelection = useMemo(() => {
    if (selectedPrayer === 'all') {
      return totalRemaining(summaries);
    }
    return summaries.find((summary) => summary.prayer === selectedPrayer)?.remaining ?? 0;
  }, [selectedPrayer, summaries]);

  const handleDailyTargetChange = (value: string) => {
    const sanitized = value.replace(/[^0-9]/g, '');
    setDailyTarget(sanitized);
    setUserEditedTarget(true);
  };

  const dailyTargetNumber = useMemo(() => {
    if (!dailyTarget) return 0;
    const parsed = Number(dailyTarget);
    return Number.isFinite(parsed) ? parsed : 0;
  }, [dailyTarget]);

  const daysToClear = useMemo(() => {
    if (dailyTargetNumber <= 0) {
      return null;
    }

    if (selectedPrayer === 'all') {
      if (summaries.length === 0) {
        return 0;
      }
      const perPrayerDays = summaries.map((summary) =>
        summary.remaining > 0 ? Math.ceil(summary.remaining / dailyTargetNumber) : 0
      );
      const maxDays = Math.max(...perPrayerDays);
      return Number.isFinite(maxDays) ? maxDays : null;
    }

    const summary = summaries.find((item) => item.prayer === selectedPrayer);
    if (!summary) {
      return null;
    }
    if (summary.remaining <= 0) {
      return 0;
    }
    return Math.ceil(summary.remaining / dailyTargetNumber);
  }, [dailyTargetNumber, selectedPrayer, summaries]);

  const projectedDate = useMemo(() => {
    if (!daysToClear || daysToClear <= 0) {
      return null;
    }
    return dayjs().startOf('day').add(daysToClear, 'day');
  }, [daysToClear]);

  return (
    <ScreenContainer>
      <ScrollView contentContainerStyle={{ paddingBottom: 120 }}>
        <Card>
          <Heading className="mb-4">{t('progress.title')}</Heading>
          {summaries.map((summary) => {
            const completed = summary.totalQadaPrayed;
            const target = summary.missedTotal;
            const progress = target > 0 ? Math.min(completed / target, 1) : completed > 0 ? 1 : 0;
            return (
              <View key={summary.prayer} className="mb-5">
                <View className="mb-2 flex-row justify-between">
                  <Body className="font-semibold">{t(`prayers.${summary.prayer}`)}</Body>
                  <Body>
                    {t('progress.repaid', {
                      completed: completed.toLocaleString(),
                      total: target.toLocaleString()
                    })}
                  </Body>
                </View>
                <ProgressBar progress={progress} />
                <Body className="mt-1">
                  {t('dashboard.totalRemaining')}: {summary.remaining.toLocaleString()}
                </Body>
              </View>
            );
          })}
        </Card>

        <Card>
          <Heading className="mb-3 text-xl">{t('progress.filterTitle')}</Heading>
          <Body className="mb-5 text-olive/70">{t('progress.filterSubtitle')}</Body>

          <View className="mb-5">
            <Text className="mb-2 text-xs font-semibold uppercase tracking-wider text-olive/70">
              {t('progress.focusLabel')}
            </Text>
            <View className="flex-row flex-wrap gap-2">
              {([
                { value: 'all', label: t('progress.allPrayers') },
                ...summaries.map((summary) => ({
                  value: summary.prayer,
                  label: t(`prayers.${summary.prayer}`)
                }))
              ] as { value: 'all' | PrayerName; label: string }[]).map((option) => {
                const active = selectedPrayer === option.value;
                return (
                  <Pressable
                    key={option.value}
                    onPress={() => setSelectedPrayer(option.value)}
                    className={clsx('rounded-full px-4 py-2', active ? 'bg-olive' : 'bg-olive/10')}
                  >
                    <Text className={clsx('font-semibold', active ? 'text-white' : 'text-teal')}>
                      {option.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          <View className="mb-5">
            <Text className="mb-2 text-xs font-semibold uppercase tracking-wider text-olive/70">
              {selectedPrayer === 'all' ? t('progress.perDayLabelAll') : t('progress.perDayLabel')}
            </Text>
            <TextInput
              value={dailyTarget}
              onChangeText={handleDailyTargetChange}
              keyboardType="number-pad"
              inputMode="numeric"
              placeholder="2"
              placeholderTextColor="#a3ad9d"
              className="rounded-2xl border border-olive/20 px-4 py-3 text-base text-teal"
            />
            <Body className="mt-2 text-olive/70">{t('progress.perDayHint')}</Body>
          </View>

          <View className="rounded-2xl bg-olive/10 px-4 py-4">
            <Body className="mb-1 font-semibold text-olive">
              {t('progress.remainingLabel', { remaining: remainingForSelection.toLocaleString() })}
            </Body>
            {projectedDate ? (
              <View className="gap-2">
                <Body>
                  {selectedPrayer === 'all'
                    ? t('progress.projectedDetailedAll', {
                        average: dailyTargetNumber,
                        date: projectedDate.format('MMM D, YYYY'),
                        count: daysToClear ?? 0
                      })
                    : t('progress.projectedDetailed', {
                        average: dailyTargetNumber,
                        date: projectedDate.format('MMM D, YYYY'),
                        count: daysToClear ?? 0
                      })}
                </Body>
              </View>
            ) : remainingForSelection === 0 ? (
              <Body>{t('progress.clearMessage')}</Body>
            ) : (
              <Body>{t('progress.projectedUnknown')}</Body>
            )}
          </View>
        </Card>
      </ScrollView>
    </ScreenContainer>
  );
};

export default ProgressScreen;
