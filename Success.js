import React, { useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ViewShot from 'react-native-view-shot';
import * as MediaLibrary from 'expo-media-library';

const Success = ({ route, navigation }) => {
  const { recipientName, accountNumber, bankName, amount, transactionId, timestamp } = route.params;
  const viewRef = useRef(null);
  const [saving, setSaving] = useState(false);

  const formattedDate = new Date(timestamp || Date.now()).toLocaleString();

  const saveToDevice = async () => {
    try {
      setSaving(true);
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Please allow media permissions to save the receipt.');
        setSaving(false);
        return;
      }

      const uri = await viewRef.current.capture();
      await MediaLibrary.saveToLibraryAsync(uri);
      Alert.alert('Saved', 'Receipt saved to your device gallery.');
    } catch (e) {
      console.error('Save error:', e);
      Alert.alert('Error', 'Could not save the receipt.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.navigate('MainApp')}>
          <Ionicons name="home" size={22} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.header}>Transfer Successful</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ViewShot ref={viewRef} options={{ format: 'png', quality: 0.9 }} style={styles.shotWrap}>
        <View style={styles.receiptCard}>
          <View style={styles.successBadge}>
            <Ionicons name="checkmark-circle" size={56} color="#4CAF50" />
            <Text style={styles.successText}>Success</Text>
          </View>

          <View style={styles.rowBetween}>
            <Text style={styles.label}>Recipient</Text>
            <Text style={styles.value}>{recipientName}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.rowBetween}>
            <Text style={styles.label}>Account Number</Text>
            <Text style={styles.value}>{accountNumber}</Text>
          </View>
          <View style={styles.rowBetween}>
            <Text style={styles.label}>Bank</Text>
            <Text style={styles.value}>{bankName}</Text>
          </View>
          <View style={styles.rowBetween}>
            <Text style={styles.label}>Amount</Text>
            <Text style={[styles.value, styles.amount]}>₦{parseFloat(amount).toLocaleString()}</Text>
          </View>
          <View style={styles.rowBetween}>
            <Text style={styles.label}>Transaction ID</Text>
            <Text style={styles.value}>{transactionId}</Text>
          </View>
          <View style={styles.rowBetween}>
            <Text style={styles.label}>Timestamp</Text>
            <Text style={styles.value}>{formattedDate}</Text>
          </View>

          <View style={styles.footerNote}>
            <Ionicons name="shield-checkmark" size={16} color="#4CAF50" />
            <Text style={styles.footerText}>This transaction is secured with 256-bit SSL</Text>
          </View>
        </View>
      </ViewShot>

      <View style={styles.actionsRow}>
        <TouchableOpacity style={styles.secondaryBtn} onPress={() => navigation.navigate('MainApp')}>
          <Ionicons name="arrow-back" size={18} color="#FFA500" />
          <Text style={styles.secondaryText}>Back Home</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.primaryBtn} onPress={saveToDevice} disabled={saving}>
          <Ionicons name="download" size={18} color="#fff" />
          <Text style={styles.primaryText}>{saving ? 'Saving…' : 'Save to device'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0A',
    paddingHorizontal: 20,
    paddingTop: 60,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#2C2C2E',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerSpacer: { width: 40 },
  header: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  shotWrap: {
    flex: 1,
  },
  receiptCard: {
    backgroundColor: '#1A1A1A',
    borderRadius: 16,
    padding: 20,
    marginTop: 10,
  },
  successBadge: {
    alignItems: 'center',
    marginBottom: 20,
  },
  successText: {
    color: '#4CAF50',
    fontSize: 16,
    marginTop: 8,
    fontWeight: '600',
  },
  rowBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  label: {
    color: '#888',
    fontSize: 14,
  },
  value: {
    color: '#fff',
    fontSize: 16,
    maxWidth: '60%',
    textAlign: 'right',
  },
  amount: {
    color: '#FFA500',
    fontWeight: 'bold',
  },
  divider: {
    height: 1,
    backgroundColor: '#2C2C2E',
    marginVertical: 10,
  },
  footerNote: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  footerText: {
    color: '#4CAF50',
    marginLeft: 6,
    fontSize: 12,
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 20,
  },
  secondaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#FFA500',
  },
  secondaryText: {
    color: '#FFA500',
    fontWeight: '600',
    marginLeft: 8,
  },
  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 10,
    backgroundColor: '#FFA500',
  },
  primaryText: {
    color: '#fff',
    fontWeight: '700',
    marginLeft: 8,
  },
});

export default Success;
