import React from 'react';
import { Redirect } from 'expo-router';
import { View, ActivityIndicator } from 'react-native';
import { useAppContext } from '@/contexts/AppContext';

const IndexScreen: React.FC = () => {
  const { settings, loading } = useAppContext();

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-sand">
        <ActivityIndicator size="large" color="#7a8b71" />
      </View>
    );
  }

  if (!settings?.startDate) {
    return <Redirect href="/onboarding" />;
  }

  return <Redirect href="/(tabs)/home" />;
};

export default IndexScreen;
