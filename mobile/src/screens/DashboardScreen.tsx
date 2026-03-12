import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
} from 'react-native';
import { io } from 'socket.io-client';
import { BACKEND_BASE_URL } from '../config/env';
import { useAuth } from '../context/AuthContext';
import * as SecureStore from 'expo-secure-store';

export default function DashboardScreen() {
  const { user, token } = useAuth();
  const [socket, setSocket] = useState<any>(null);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (!token) return;

    // Initialize socket connection
    const newSocket = io(BACKEND_BASE_URL.replace('/api', ''), {
      auth: {
        token,
      },
      transports: ['websocket'],
    });

    newSocket.on('connect', () => {
      console.log('Socket connected');
      if (user?.role === 'security') {
        newSocket.emit('join_room', 'security_room');
      } else {
        newSocket.emit('join_room', `user_${user?.id}`);
      }
    });

    newSocket.on('disconnect', () => {
      console.log('Socket disconnected');
    });

    newSocket.on('sos:created', (data: any) => {
      setAlerts((prev) => [data, ...prev]);
    });

    newSocket.on('sos:updated', (data: any) => {
      setAlerts((prev) =>
        prev.map((alert) => (alert.id === data.id ? data : alert))
      );
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [token, user]);

  const onRefresh = async () => {
    setRefreshing(true);
    // Refresh logic here
    setTimeout(() => setRefreshing(false), 1000);
  };

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.content}>
        <Text style={styles.title}>Dashboard</Text>
        <Text style={styles.subtitle}>
          Welcome, {user?.email || 'User'}
        </Text>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Role</Text>
          <Text style={styles.cardValue}>{user?.role || 'N/A'}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Active Alerts</Text>
          <Text style={styles.cardValue}>{alerts.length}</Text>
        </View>

        {alerts.length > 0 && (
          <View style={styles.alertsContainer}>
            <Text style={styles.sectionTitle}>Recent Alerts</Text>
            {alerts.map((alert) => (
              <View key={alert.id} style={styles.alertCard}>
                <Text style={styles.alertText}>
                  SOS Alert #{alert.id.slice(0, 8)}
                </Text>
                <Text style={styles.alertStatus}>
                  Status: {alert.status}
                </Text>
              </View>
            ))}
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  content: {
    padding: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#9CA3AF',
    marginBottom: 24,
  },
  card: {
    backgroundColor: '#1e293b',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 14,
    color: '#9CA3AF',
    marginBottom: 8,
  },
  cardValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  alertsContainer: {
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 12,
  },
  alertCard: {
    backgroundColor: '#1e293b',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  alertText: {
    fontSize: 16,
    color: '#fff',
    marginBottom: 4,
  },
  alertStatus: {
    fontSize: 14,
    color: '#9CA3AF',
  },
});
