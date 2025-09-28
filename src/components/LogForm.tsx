import React, { useEffect, useMemo, useState } from 'react';
import { Alert, Modal, View, TextInput, Text } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import clsx from 'clsx';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/Button';
import { PRAYER_ORDER } from '@/constants/prayer';
import { useAppContext } from '@/contexts/AppContext';
import { PrayerLog, PrayerName, PrayerType } from '@/types';
import { timeNow, todayISO } from '@/utils/calculations';

interface LogFormProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (log: Omit<PrayerLog, 'id'>) => Promise<void>;
  initial?: PrayerLog | null;
}

export const LogForm: React.FC<LogFormProps> = ({ visible, onClose, onSubmit, initial }) => {
  const { t } = useTranslation();
  const { settings } = useAppContext();
  const [prayer, setPrayer] = useState<PrayerName>('fajr');
  const [type, setType] = useState<PrayerType>('current');
  const [count, setCount] = useState('1');
  const [date, setDate] = useState(todayISO());
  const [time, setTime] = useState(timeNow());

  useEffect(() => {
    if (initial) {
      setPrayer(initial.prayer);
      setType(initial.type);
      setCount(String(initial.count));
      setDate(initial.date);
      setTime(initial.loggedAt);
    } else {
      setPrayer('fajr');
      setType('current');
      setCount('1');
      setDate(todayISO());
      setTime(timeNow());
    }
  }, [initial, visible]);

  const onDismiss = () => {
    onClose();
  };

  useEffect(() => {
    if (type === 'current') {
      setCount('1');
    }
  }, [type]);

  const handleSave = async () => {
    const countValue = type === 'current' ? 1 : Number(count);
    if (type === 'qadha' && (Number.isNaN(countValue) || countValue <= 0)) return;
    try {
      await onSubmit({
        prayer,
        type,
        count: countValue,
        date,
        loggedAt: time
      });
      onDismiss();
    } catch (error) {
      if (error instanceof Error && error.message === 'log-exists') {
        Alert.alert(t('logs.duplicateTitle'), t('logs.duplicateMessage'));
      } else {
        Alert.alert(t('logs.errorTitle'), t('logs.errorMessage'));
      }
    }
  };

  const fontSizeClass = useMemo(() => {
    switch (settings?.fontSize) {
      case 'small':
        return 'text-sm';
      case 'large':
        return 'text-lg';
      default:
        return 'text-base';
    }
  }, [settings?.fontSize]);

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View className="flex-1 bg-black/40 justify-end">
        <View className={clsx('rounded-t-3xl bg-white p-6 gap-4', settings?.theme === 'dark' && 'bg-[#1f2429]')}>
          <Text className={clsx('text-lg font-semibold text-teal', settings?.theme === 'dark' && 'text-white')}>
            {initial ? t('logs.edit') : t('logs.add')}
          </Text>

          <View>
            <Text className={clsx('mb-2 text-teal/70', fontSizeClass)}>{t('logs.prayerLabel')}</Text>
            <View className={clsx('rounded-2xl border border-olive/30', settings?.theme === 'dark' && 'border-white/20')}>
              <Picker selectedValue={prayer} onValueChange={(value) => setPrayer(value)}>
                {PRAYER_ORDER.map((p) => (
                  <Picker.Item key={p} label={t(`prayers.${p}`)} value={p} />
                ))}
              </Picker>
            </View>
          </View>

          <View>
            <Text className={clsx('mb-2 text-teal/70', fontSizeClass)}>{t('logs.typeLabel')}</Text>
            <View className={clsx('rounded-2xl border border-olive/30', settings?.theme === 'dark' && 'border-white/20')}>
              <Picker selectedValue={type} onValueChange={(value) => setType(value)}>
                <Picker.Item label={t('logs.typeCurrent')} value="current" />
                <Picker.Item label={t('logs.typeQadha')} value="qadha" />
              </Picker>
            </View>
          </View>

          <View className="flex-row gap-4">
            {type === 'qadha' ? (
              <View className="flex-1">
                <Text className={clsx('mb-2 text-teal/70', fontSizeClass)}>{t('logs.countLabel')}</Text>
                <TextInput
                  keyboardType="number-pad"
                  value={count}
                  onChangeText={setCount}
                  className={clsx(
                    'rounded-2xl border border-olive/30 px-4 py-3 text-teal',
                    settings?.theme === 'dark' && 'border-white/20 text-white'
                  )}
                />
              </View>
            ) : (
              <View className="flex-1 justify-end">
                <Text className={clsx('mb-2 text-teal/70', fontSizeClass)}>{t('logs.countLabel')}</Text>
                <View
                  className={clsx(
                    'rounded-2xl border border-olive/30 px-4 py-3',
                    settings?.theme === 'dark' && 'border-white/20'
                  )}
                >
                  <Text className={clsx('text-teal', settings?.theme === 'dark' && 'text-white')}>
                    {t('logs.singleCount')}
                  </Text>
                </View>
              </View>
            )}
            <View className="flex-1">
              <Text className={clsx('mb-2 text-teal/70', fontSizeClass)}>{t('logs.timeLabel')}</Text>
              <TextInput
                value={time}
                onChangeText={setTime}
                placeholder="HH:mm"
                className={clsx(
                  'rounded-2xl border border-olive/30 px-4 py-3 text-teal',
                  settings?.theme === 'dark' && 'border-white/20 text-white'
                )}
              />
            </View>
          </View>

          <View>
            <Text className={clsx('mb-2 text-teal/70', fontSizeClass)}>{t('logs.dateLabel')}</Text>
            <TextInput
              value={date}
              onChangeText={setDate}
              placeholder="YYYY-MM-DD"
              className={clsx(
                'rounded-2xl border border-olive/30 px-4 py-3 text-teal',
                settings?.theme === 'dark' && 'border-white/20 text-white'
              )}
            />
          </View>

          <View className="flex-row gap-3 pt-2">
            <View className="flex-1">
              <Button title={t('forms.cancel')} variant="secondary" onPress={onDismiss} />
            </View>
            <View className="flex-1">
              <Button title={t('forms.confirm')} onPress={handleSave} />
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
};
