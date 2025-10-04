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
import { useRTL } from '@/hooks/useRTL';
import { useAppContext } from '@/contexts/AppContext';
import { PrayerLog, PrayerName, PrayerType } from '@/types';
import { timeNow, todayISO } from '@/utils/calculations';

interface LogFormProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (log: Omit<PrayerLog, 'id'>) => Promise<void>;
  initial?: PrayerLog | null;
}

const SHEET_MAX_HEIGHT = Dimensions.get('window').height * 0.85;

export const LogForm: React.FC<LogFormProps> = ({ visible, onClose, onSubmit, initial }) => {
  const { t } = useTranslation();
  const { settings } = useAppContext();
  const rtl = useRTL();
  const [prayer, setPrayer] = useState<PrayerName>('asr');
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
      setPrayer('asr');
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
    if (type === 'qada' && (Number.isNaN(countValue) || countValue <= 0)) return;
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

  const placeholderColor = '#94a38c';
  const borderMuted = 'border-olive/20';

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
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onDismiss}>
      <View className="flex-1 justify-end bg-black/40">
        <TouchableWithoutFeedback onPress={onDismiss}>
          <View className="flex-1" />
        </TouchableWithoutFeedback>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          className="w-full"
        >
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View
              style={{ maxHeight: SHEET_MAX_HEIGHT }}
              className="rounded-t-3xl bg-white/95 px-5 pt-5 pb-6 shadow-2xl"
            >
              <ScrollView
                contentContainerStyle={{ paddingBottom: 20 }}
                showsVerticalScrollIndicator={false}
              >
                <Text className="mb-1 text-xl font-semibold text-teal">
                  {initial ? t('logs.edit') : t('logs.add')}
                </Text>
                <Text className="text-sm text-olive/70">
                  {t('logs.save')}
                </Text>

                <View className="mt-5 gap-4">
                  <View className="gap-2.5">
                    <Text className="text-xs uppercase tracking-wider text-olive/70">
                      {t('logs.prayerLabel')}
                    </Text>
                    <View
                      className={clsx(
                        'overflow-hidden rounded-2xl border bg-white/80',
                        borderMuted
                      )}
                    >
                      <Picker 
                        selectedValue={prayer} 
                        onValueChange={(value) => setPrayer(value)}
                        style={{
                          height: Platform.OS === 'ios' ? 110 : undefined,
                        }}
                        itemStyle={Platform.OS === 'ios' ? {
                          height: 110,
                          fontSize: 14,
                        } : undefined}
                      >
                        {PRAYER_ORDER.map((p) => (
                          <Picker.Item key={p} label={t(`prayers.${p}`)} value={p} color={'#000'} />
                        ))}
                      </Picker>
                    </View>
                  </View>

                  <View className="gap-2.5">
                    <Text className="text-xs uppercase tracking-wider text-olive/70">
                      {t('logs.typeLabel')}
                    </Text>
                    <View className={clsx("gap-2", rtl.flexDirection)}>
                      {(['current', 'qada'] as PrayerType[]).map((option) => {
                        const active = type === option;
                        return (
                          <Pressable
                            key={option}
                            onPress={() => setType(option)}
                            className={clsx(
                              'flex-1 rounded-2xl border px-4 py-2.5',
                              active
                                ? 'border-olive bg-olive'
                                : 'border-olive/20 bg-white/70'
                            )}
                          >
                              <Text
                                className={clsx(
                                'text-center font-semibold',
                                fontSizeClass,
                                active ? 'text-white' : 'text-teal'
                              )}
                            >
                              {t(`logs.type${option === 'current' ? 'Current' : 'Qada'}`)}
                            </Text>
                          </Pressable>
                        );
                      })}
                    </View>
                  </View>

                  <View className={clsx("gap-4", rtl.flexDirection)}>
                    {type === 'qada' ? (
                      <View className="flex-1 gap-2.5">
                        <Text className="text-xs uppercase tracking-wider text-olive/70">
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
                            'rounded-2xl border px-4 py-2.5 text-teal shadow-sm',
                            borderMuted
                          )}
                        />
                      </View>
                    ) : (
                      <View className="flex-1 gap-2.5">
                        <Text className="text-xs uppercase tracking-wider text-olive/70">
                          {t('logs.countLabel')}
                        </Text>
                        <View
                          className={clsx(
                            'rounded-2xl border px-4 py-2.5',
                            borderMuted
                          )}
                        >
                          <Text className="text-teal">
                            {t('logs.singleCount')}
                          </Text>
                        </View>
                      </View>
                    )}
                    <View className="flex-1 gap-2.5">
                      <Text className="text-xs uppercase tracking-wider text-olive/70">
                        {t('logs.timeLabel')}
                      </Text>
                      <TextInput
                        value={time}
                          onChangeText={handleTimeChange}
                          placeholder="HH:mm"
                          placeholderTextColor={placeholderColor}
                          className={clsx(
                          'rounded-2xl border px-4 py-2.5 text-teal shadow-sm',
                            borderMuted
                          )}
                      />
                    </View>
                  </View>

                  <View className="gap-2.5">
                    <Text className="text-xs uppercase tracking-wider text-olive/70">
                      {t('logs.dateLabel')}
                    </Text>
                    <TextInput
                      value={date}
                      onChangeText={handleDateChange}
                      placeholder="YYYY-MM-DD"
                      placeholderTextColor={placeholderColor}
                      className={clsx(
                        'rounded-2xl border px-4 py-2.5 text-teal shadow-sm',
                        borderMuted
                      )}
                    />
                  </View>
                </View>

                <View style={{ marginTop: 12 }} className={clsx("gap-2", rtl.flexDirection)}>
                  <View className="flex-1">
                    <Button
                      title={t('forms.cancel')}
                      variant="secondary"
                      size="compact"
                      onPress={onDismiss}
                    />
                  </View>
                  <View className="flex-1">
                    <Button title={t('forms.confirm')} onPress={handleSave} size="compact" />
                  </View>
                </View>
              </ScrollView>
            </View>
          </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
};
