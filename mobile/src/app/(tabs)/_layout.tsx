import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { C } from '../../theme';

type IoniconName = keyof typeof Ionicons.glyphMap;

const makeTabIcon = (focusedName: IoniconName, unfocusedName: IoniconName) =>
  ({ focused, color, size }: { focused: boolean; color: string; size: number }) => (
    <Ionicons
      name={focused ? focusedName : unfocusedName}
      color={color}
      size={size ?? 22}
    />
  );

export default function TabsLayout() {
  const insets = useSafeAreaInsets();
  const bottomInset = Math.max(insets.bottom, Platform.OS === 'ios' ? 16 : 8);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: C.primary,
        tabBarInactiveTintColor: '#7D8A79',
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopColor: C.border,
          borderTopWidth: 1,
          height: (Platform.OS === 'ios' ? 52 : 58) + bottomInset,
          paddingBottom: bottomInset,
          paddingTop: 6,
          ...Platform.select({
            ios: {
              shadowColor: '#000',
              shadowOffset: { width: 0, height: -2 },
              shadowOpacity: 0.05,
              shadowRadius: 8,
            },
            android: {
              elevation: 8,
            },
            default: {},
          }),
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '700',
          marginTop: 2,
        },
      }}
    >
      <Tabs.Screen
        name="scan"
        options={{
          title: 'Scan',
          tabBarIcon: makeTabIcon('scan', 'scan-outline'),
        }}
      />
      <Tabs.Screen
        name="pantry"
        options={{
          title: 'Pantry',
          tabBarIcon: makeTabIcon('basket', 'basket-outline'),
        }}
      />
      <Tabs.Screen
        name="recipes"
        options={{
          title: 'Recipes',
          tabBarIcon: makeTabIcon('restaurant', 'restaurant-outline'),
        }}
      />
      <Tabs.Screen
        name="copilot"
        options={{
          title: 'Copilot',
          tabBarIcon: makeTabIcon('chatbubbles', 'chatbubbles-outline'),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: makeTabIcon('person', 'person-outline'),
        }}
      />
    </Tabs>
  );
}
