import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Modal,
  View,
  TextInput,
  Text,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  Pressable,
  Dimensions
} from 'react-native';
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

const SHEET_MAX_HEIGHT = Dimensions.get('window').height * 0.9;

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

  const placeholderColor = settings?.theme === 'dark' ? '#9ca3af' : '#94a38c';
  const borderMuted = settings?.theme === 'dark' ? 'border-white/10' : 'border-olive/20';

  const handleCountChange = (value: string) => {
    setCount(value.replace(/[^0-9]/g, ''));
  };

  const handleTimeChange = (value: string) => {
    setTime(value.replace(/[^0-9:]/g, '').slice(0, 5));
  };

  const handleDateChange = (value: string) => {
    setDate(value.replace(/[^0-9-]/g, '').slice(0, 10));
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View className="flex-1 justify-end bg-black/40">
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            className="w-full"
          >
            <View
              style={{ maxHeight: SHEET_MAX_HEIGHT }}
              className={clsx(
                'rounded-t-3xl bg-white/95 px-6 pt-6 pb-8 shadow-2xl',
                settings?.theme === 'dark' && 'bg-[#1f2429]/95'
              )}
            >
              <ScrollView
                contentContainerStyle={{ paddingBottom: 24 }}
                showsVerticalScrollIndicator={false}
              >
                <Text
                  className={clsx(
                    'mb-1 text-lg font-semibold text-teal',
                    settings?.theme === 'dark' && 'text-white'
                  )}
                >
                  {initial ? t('logs.edit') : t('logs.add')}
                </Text>
                <Text className={clsx('text-sm text-olive/70', settings?.theme === 'dark' && 'text-white/70')}>
                  {t('logs.save')}
                </Text>

                <View className="mt-6 gap-5">
                  <View className="gap-3">
                    <Text className={clsx('text-xs uppercase tracking-wider text-olive/70', settings?.theme === 'dark' && 'text-white/60')}>
                      {t('logs.prayerLabel')}
                    </Text>
                    <View
                      className={clsx(
                        'overflow-hidden rounded-2xl border bg-white/80',
                        borderMuted,
                        settings?.theme === 'dark' && 'bg-white/5'
                      )}
                    >
                      <Picker selectedValue={prayer} onValueChange={(value) => setPrayer(value)}>
                        {PRAYER_ORDER.map((p) => (
                          <Picker.Item key={p} label={t(`prayers.${p}`)} value={p} />
                        ))}
                      </Picker>
                    </View>
                  </View>

                  <View className="gap-3">
                    <Text className={clsx('text-xs uppercase tracking-wider text-olive/70', settings?.theme === 'dark' && 'text-white/60')}>
                      {t('logs.typeLabel')}
                    </Text>
                    <View className="flex-row gap-3">
                      {(['current', 'qadha'] as PrayerType[]).map((option) => {
                        const active = type === option;
                        return (
                          <Pressable
                            key={option}
                            onPress={() => setType(option)}
                            className={clsx(
                              'flex-1 rounded-2xl border px-4 py-3',
                              active
                                ? settings?.theme === 'dark'
                                  ? 'border-teal bg-teal'
                                  : 'border-olive bg-olive'
                                : settings?.theme === 'dark'
                                ? 'border-white/10 bg-white/5'
                                : 'border-olive/20 bg-white/70'
                            )}
                          >
                            <Text
                              className={clsx(
                                'text-center font-semibold',
                                fontSizeClass,
                                active ? 'text-white' : settings?.theme === 'dark' ? 'text-white' : 'text-teal'
                              )}
                            >
                              {t(`logs.type${option === 'current' ? 'Current' : 'Qadha'}`)}
                            </Text>
                          </Pressable>
                        );
                      })}
                    </View>
                  </View>

                  <View className="flex-row gap-4">
                    {type === 'qadha' ? (
                      <View className="flex-1 gap-3">
                        <Text className={clsx('text-xs uppercase tracking-wider text-olive/70', settings?.theme === 'dark' && 'text-white/60')}>
                          {t('logs.countLabel')}
                        </Text>
                        <TextInput
                          keyboardType="number-pad"
                          inputMode="numeric"
                          value={count}
                          onChangeText={handleCountChange}
                          placeholder="1"
                          placeholderTextColor={placeholderColor}
                          className={clsx(
                            'rounded-2xl border px-4 py-3 text-teal shadow-sm',
                            borderMuted,
                            settings?.theme === 'dark' && 'bg-white/5 text-white shadow-none'
                          )}
                        />
                      </View>
                    ) : (
                      <View className="flex-1 gap-3">
                        <Text className={clsx('text-xs uppercase tracking-wider text-olive/70', settings?.theme === 'dark' && 'text-white/60')}>
                          {t('logs.countLabel')}
                        </Text>
                        <View
                          className={clsx(
                            'rounded-2xl border px-4 py-3',
                            borderMuted,
                            settings?.theme === 'dark' && 'bg-white/5'
                          )}
                        >
                          <Text className={clsx('text-teal', settings?.theme === 'dark' && 'text-white')}>
                            {t('logs.singleCount')}
                          </Text>
                        </View>
                      </View>
                    )}
                    <View className="flex-1 gap-3">
                      <Text className={clsx('text-xs uppercase tracking-wider text-olive/70', settings?.theme === 'dark' && 'text-white/60')}>
                        {t('logs.timeLabel')}
                      </Text>
                      <TextInput
                        value={time}
                        onChangeText={handleTimeChange}
                        placeholder="HH:mm"
                        placeholderTextColor={placeholderColor}
                        className={clsx(
                          'rounded-2xl border px-4 py-3 text-teal shadow-sm',
                          borderMuted,
                          settings?.theme === 'dark' && 'bg-white/5 text-white shadow-none'
                        )}
                      />
                    </View>
                  </View>

                  <View className="gap-3">
                    <Text className={clsx('text-xs uppercase tracking-wider text-olive/70', settings?.theme === 'dark' && 'text-white/60')}>
                      {t('logs.dateLabel')}
                    </Text>
                    <TextInput
                      value={date}
                      onChangeText={handleDateChange}
                      placeholder="YYYY-MM-DD"
                      placeholderTextColor={placeholderColor}
                      className={clsx(
                        'rounded-2xl border px-4 py-3 text-teal shadow-sm',
                        borderMuted,
                        settings?.theme === 'dark' && 'bg-white/5 text-white shadow-none'
                      )}
                    />
                  </View>
                </View>

                <View className="mt-6 flex-row gap-3">
                  <View className="flex-1">
                    <Button title={t('forms.cancel')} variant="secondary" onPress={onDismiss} />
                  </View>
                  <View className="flex-1">
                    <Button title={t('forms.confirm')} onPress={handleSave} />
                  </View>
                </View>
              </ScrollView>
            </View>
          </KeyboardAvoidingView>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};
