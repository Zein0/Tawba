import React, { useEffect, useState } from 'react';
import { Alert, Modal, View, Text, TextInput } from 'react-native';
import clsx from 'clsx';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/Button';
import { useAppContext } from '@/contexts/AppContext';
import { PrayerName } from '@/types';

interface PrayerPromptModalProps {
  prayer: PrayerName | null;
  onClose: () => void;
  onMissed: (prayer: PrayerName) => Promise<void>;
  onQada: (prayer: PrayerName, count: number) => Promise<void>;
  onOnTime: (prayer: PrayerName) => Promise<void>;
}

export const PrayerPromptModal: React.FC<PrayerPromptModalProps> = ({
  prayer,
  onClose,
  onMissed,
  onQada,
  onOnTime
}) => {
  const { t } = useTranslation();
  const { settings } = useAppContext();
  const [step, setStep] = useState<'question' | 'qada'>('question');
  const [count, setCount] = useState('1');

  useEffect(() => {
    if (prayer) {
      setStep('question');
      setCount('1');
    }
  }, [prayer]);

  if (!prayer) return null;

  const prayerLabel = t(`prayers.${prayer}`);

  const handleMissed = async () => {
    await onMissed(prayer);
    onClose();
  };

  const handleOnTime = async () => {
    try {
      await onOnTime(prayer);
      onClose();
    } catch (error) {
      if (error instanceof Error && error.message === 'log-exists') {
        Alert.alert(t('notifications.alreadyLoggedTitle'), t('notifications.alreadyLoggedBody', { prayer: prayerLabel }));
      } else {
        Alert.alert(t('notifications.errorTitle'), t('notifications.errorBody'));
      }
    }
  };

  const handleQadaSubmit = async () => {
    const value = Number(count);
    await onQada(prayer, Number.isNaN(value) ? 0 : value);
    onClose();
  };

  return (
    <Modal visible animationType="fade" transparent>
      <View className="flex-1 bg-black/50 justify-center px-6">
        <View className={clsx('rounded-3xl p-6', settings?.theme === 'dark' ? 'bg-[#1f2429]' : 'bg-white')}>
          {step === 'question' ? (
            <>
              <Text className={clsx('text-lg font-semibold text-teal', settings?.theme === 'dark' && 'text-white')}>
                {t('notifications.question', { prayer: prayerLabel })}
              </Text>
              <View className="mt-5 gap-3">
                <Button title={t('notifications.yesOnTime')} onPress={handleOnTime} />
                <Button title={t('notifications.no')} variant="secondary" onPress={handleMissed} />
                <Button title={t('notifications.logQada')} variant="secondary" onPress={() => setStep('qada')} />
              </View>
            </>
          ) : (
            <>
              <Text className={clsx('text-lg font-semibold text-teal', settings?.theme === 'dark' && 'text-white')}>
                {t('notifications.qadaQuestion')}
              </Text>
              <TextInput
                keyboardType="number-pad"
                value={count}
                onChangeText={setCount}
                className={clsx(
                  'mt-4 rounded-2xl border border-olive/30 px-4 py-3 text-teal',
                  settings?.theme === 'dark' && 'border-white/20 text-white'
                )}
              />
              <View className="mt-5 gap-3">
                <Button title={t('notifications.submit')} onPress={handleQadaSubmit} />
                <Button title={t('notifications.skip')} variant="secondary" onPress={onClose} />
              </View>
            </>
          )}
        </View>
      </View>
    </Modal>
  );
};
