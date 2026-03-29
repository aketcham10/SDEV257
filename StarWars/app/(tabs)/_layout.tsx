import { Tabs } from 'expo-router';
import React from 'react';

import { HapticTab } from '../../components/haptic-tab';
import { IconSymbol } from '../../components/ui/icon-symbol';
import { Colors } from '../../constants/theme';
import { useColorScheme } from '../../hooks/use-color-scheme';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tabIconSelected,
        tabBarInactiveTintColor: Colors[colorScheme ?? 'light'].tabIconDefault,
        tabBarStyle: {
          backgroundColor: Colors[colorScheme ?? 'light'].background,
          borderTopColor: colorScheme === 'dark' ? '#333' : '#e0e0e0',
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
        headerShown: true,
        headerStyle: {
          backgroundColor: colorScheme === 'dark' ? '#151718' : '#0a7ea4',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
          fontSize: 20,
          color: '#fff',
        },
        headerTitle: 'Star Wars',
        tabBarButton: HapticTab,
      }}>
      <Tabs.Screen
        name="planets"
        options={{
          title: 'Planets',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="globe" color={color} />,
        }}
      />
      <Tabs.Screen
        name="films"
        options={{
          title: 'Films',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="film.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="spaceships"
        options={{
          title: 'Spaceships',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="paperplane.fill" color={color} />,
        }}
      />
    </Tabs>
  );
}
