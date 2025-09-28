import React, { useEffect, useState } from 'react';
import { Modal, View, Text, TextInput } from 'react-native';
import clsx from 'clsx';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/Button';
import { useAppContext } from '@/contexts/AppContext';
import { PrayerName } from '@/types';

interface PrayerPromptModalProps {
  prayer: PrayerName | null;
  onClose: () => void;
  onMissed: (prayer: PrayerName) => Promise<void>;
  onQadha: (prayer: PrayerName, count: number) => Promise<void>;
}

export const PrayerPromptModal: React.FC<PrayerPromptModalProps> = ({ prayer, onClose, onMissed, onQadha }) => {
  const { t } = useTranslation();
  const { settings } = useAppContext();
  const [step, setStep] = useState<'question' | 'qadha'>('question');
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

  const handleQadhaSubmit = async () => {
    const value = Number(count);
    await onQadha(prayer, Number.isNaN(value) ? 0 : value);
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
                <Button title={t('notifications.yes')} onPress={() => setStep('qadha')} />
                <Button title={t('notifications.no')} variant="secondary" onPress={handleMissed} />
              </View>
            </>
          ) : (
            <>
              <Text className={clsx('text-lg font-semibold text-teal', settings?.theme === 'dark' && 'text-white')}>
                {t('notifications.qadhaQuestion')}
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
                <Button title={t('notifications.submit')} onPress={handleQadhaSubmit} />
                <Button title={t('notifications.skip')} variant="secondary" onPress={onClose} />
              </View>
            </>
          )}
        </View>
      </View>
    </Modal>
  );
};
