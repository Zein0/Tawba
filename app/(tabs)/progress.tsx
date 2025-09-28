import React from 'react';
import dayjs from 'dayjs';
import { ScrollView, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { ScreenContainer } from '@/components/ScreenContainer';
import { Card } from '@/components/Card';
import { Heading, Body } from '@/components/Typography';
import { ProgressBar } from '@/components/ProgressBar';
import { useAppContext } from '@/contexts/AppContext';

const ProgressScreen: React.FC = () => {
  const { t } = useTranslation();
  const { summaries, projection } = useAppContext();

  return (
    <ScreenContainer>
      <ScrollView contentContainerStyle={{ paddingBottom: 120 }}>
        <Card>
          <Heading className="mb-4">{t('progress.title')}</Heading>
          {summaries.map((summary) => {
            const total = summary.totalQadhaPrayed + summary.remaining;
            const progress = total === 0 ? 0 : summary.totalQadhaPrayed / total;
            return (
              <View key={summary.prayer} className="mb-5">
                <View className="flex-row justify-between mb-2">
                  <Body className="font-semibold">{t(`prayers.${summary.prayer}`)}</Body>
                  <Body>
                    {t('progress.repaid', {
                      count: summary.totalQadhaPrayed.toLocaleString(),
                      total: total.toLocaleString()
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
          {projection.projectedCompletionDate ? (
            <Body>
              {t('progress.projected', {
                average: projection.dailyAverage,
                date: dayjs(projection.projectedCompletionDate).format('MMM D, YYYY')
              })}
            </Body>
          ) : (
            <Body>{t('progress.projectedUnknown')}</Body>
          )}
        </Card>
      </ScrollView>
    </ScreenContainer>
  );
};

export default ProgressScreen;
