import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ApiService from './services/ApiService';

const Request = ({ navigation }) => {
  const [amount, setAmount] = useState('');
  const [sender, setSender] = useState('');
  const [loading, setLoading] = useState(false);
  const api = ApiService.getInstance();

  const onSubmit = async () => {
    const value = parseFloat(amount);
    if (isNaN(value) || value <= 0) {
      Alert.alert('Invalid amount', 'Enter a valid amount greater than 0');
      return;
    }
    if (!sender.trim()) {
      Alert.alert('Missing sender', 'Enter the sender name');
      return;
    }

    setLoading(true);
    try {
      const res = await api.receiveMoney(value, sender, 'Incoming transfer');
      if (res?.success) {
        navigation.navigate('Success', {
          amount: value,
          recipientName: sender, // Will be labeled as Sender in Success when direction is incoming
          accountNumber: 'N/A',
          bankName: 'N/A',
          transactionId: res.transaction?.id || Date.now().toString(),
          timestamp: res.transaction?.date || new Date().toISOString(),
          direction: 'incoming',
        });
      } else {
        Alert.alert('Error', res?.message || 'Could not process request');
      }
    } catch (e) {
      console.error(e);
      Alert.alert('Error', 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.headerRow}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.header}>Request Money</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Amount (₦)</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter amount"
          placeholderTextColor="#777"
          value={amount}
          onChangeText={setAmount}
          keyboardType="numeric"
        />

        <Text style={styles.label}>Sender</Text>
        <TextInput
          style={styles.input}
          placeholder="Who sent it?"
          placeholderTextColor="#777"
          value={sender}
          onChangeText={setSender}
        />

        <TouchableOpacity style={[styles.primaryBtn, loading && { opacity: 0.7 }]} onPress={onSubmit} disabled={loading}>
          <Ionicons name="download" size={18} color="#fff" />
          <Text style={styles.primaryText}>{loading ? 'Saving…' : 'Mark as received'}</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0A0A', paddingHorizontal: 20, paddingTop: 60 },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#2C2C2E', alignItems: 'center', justifyContent: 'center' },
  header: { fontSize: 20, fontWeight: 'bold', color: '#fff' },
  card: { backgroundColor: '#1A1A1A', borderRadius: 16, padding: 20 },
  label: { color: '#FFA500', fontSize: 14, marginBottom: 8, marginTop: 16 },
  input: { backgroundColor: '#111', color: '#fff', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 14, borderWidth: 1, borderColor: '#333' },
  primaryBtn: { marginTop: 24, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFA500', paddingVertical: 16, borderRadius: 12 },
  primaryText: { color: '#fff', fontWeight: '700', marginLeft: 8 },
});

export default Request;
