import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function TransferToBank({ navigation }) {
  const [amount, setAmount] = useState('');
  const [accountNumber, setAccountNumber] = useState('');

  const handleNext = async () => {
    if (amount && accountNumber) {
      // Save data to AsyncStorage (you can also use other state management solutions)
      await AsyncStorage.setItem('transferData', JSON.stringify({ amount, accountNumber }));
      // Redirect to Receipt.js
      navigation.navigate('Receipt');
    } else {
      Alert.alert('Error', 'Please enter both amount and account number.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Transfer to Bank</Text>
      <TextInput
        style={styles.input}
        placeholder="Amount"
        placeholderTextColor="#ccc"
        keyboardType="numeric"
        value={amount}
        onChangeText={setAmount}
      />
      <TextInput
        style={styles.input}
        placeholder="Account Number"
        placeholderTextColor="#ccc"
        keyboardType="numeric"
        value={accountNumber}
        onChangeText={setAccountNumber}
      />
      <TouchableOpacity style={styles.button} onPress={handleNext}>
        <Text style={styles.buttonText}>Next</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
    padding: 20,
  },
  label: {
    color: '#fff',
    fontSize: 18,
    marginBottom: 20,
  },
  input: {
    backgroundColor: '#1f1f1f',
    color: '#fff',
    padding: 10,
    marginBottom: 15,
    borderRadius: 5,
  },
  button: {
    backgroundColor: '#ff8800',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
});
