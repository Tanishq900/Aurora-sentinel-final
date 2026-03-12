import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import DashboardScreen from '../screens/DashboardScreen';
import SosScreen from '../screens/SosScreen';
import AlertsScreen from '../screens/AlertsScreen';
import ProfileScreen from '../screens/ProfileScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const MainTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: true,
        tabBarActiveTintColor: '#4F46E5',
        tabBarInactiveTintColor: '#6B7280',
        headerStyle: {
          backgroundColor: '#0f172a',
        },
        headerTintColor: '#fff',
        tabBarStyle: {
          backgroundColor: '#0f172a',
          borderTopColor: '#1e293b',
        },
      }}
    >
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{
          tabBarLabel: 'Dashboard',
        }}
      />
      <Tab.Screen
        name="SOS"
        component={SosScreen}
        options={{
          tabBarLabel: 'SOS',
        }}
      />
      <Tab.Screen
        name="Alerts"
        component={AlertsScreen}
        options={{
          tabBarLabel: 'Alerts',
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Profile',
        }}
      />
    </Tab.Navigator>
  );
};

export const MainNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MainTabs" component={MainTabs} />
    </Stack.Navigator>
  );
};
