import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import * as Location from 'expo-location';
import { sosApi } from '../api/sos';
import { useAuth } from '../context/AuthContext';

export default function SosScreen() {
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const handleTriggerSOS = async () => {
    Alert.alert(
      'Trigger SOS',
      'Are you sure you want to trigger an emergency alert?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            try {
              // Request location permission
              const { status } = await Location.requestForegroundPermissionsAsync();
              if (status !== 'granted') {
                Alert.alert('Error', 'Location permission is required');
                setLoading(false);
                return;
              }

              // Get current location
              const location = await Location.getCurrentPositionAsync({});
              
              // Trigger SOS
              const sosEvent = await sosApi.triggerSOS({
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
              });

              Alert.alert('SOS Triggered', `Emergency alert sent. ID: ${sosEvent.id.slice(0, 8)}`);
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Failed to trigger SOS');
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Emergency SOS</Text>
        <Text style={styles.subtitle}>
          Tap the button below to trigger an emergency alert
        </Text>

        <TouchableOpacity
          style={[styles.sosButton, loading && styles.sosButtonDisabled]}
          onPress={handleTriggerSOS}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" size="large" />
          ) : (
            <>
              <Text style={styles.sosButtonText}>SOS</Text>
              <Text style={styles.sosButtonSubtext}>Emergency Alert</Text>
            </>
          )}
        </TouchableOpacity>

        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>What happens when you trigger SOS?</Text>
          <Text style={styles.infoText}>
            • Your location will be shared with security{'\n'}
            • Security personnel will be notified immediately{'\n'}
            • Your alert will appear in the security dashboard
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#9CA3AF',
    marginBottom: 48,
    textAlign: 'center',
  },
  sosButton: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: '#DC2626',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 48,
    shadowColor: '#DC2626',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 8,
  },
  sosButtonDisabled: {
    opacity: 0.6,
  },
  sosButtonText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  sosButtonSubtext: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '600',
  },
  infoCard: {
    backgroundColor: '#1e293b',
    borderRadius: 12,
    padding: 16,
    width: '100%',
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 12,
  },
  infoText: {
    fontSize: 14,
    color: '#9CA3AF',
    lineHeight: 20,
  },
});
