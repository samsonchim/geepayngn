import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Modal, StyleSheet, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ApiService from './services/ApiService';

const Amount = ({ navigation }) => {
  const [amount, setAmount] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [accountName, setAccountName] = useState('');
  const [bankCode, setBankCode] = useState('');
  const [bankName, setBankName] = useState('');
  const [loading, setLoading] = useState(false);
  const [passcode, setPasscode] = useState('');
  const [showPasscodeModal, setShowPasscodeModal] = useState(false);

  const apiService = ApiService.getInstance();

  useEffect(() => {
    // Fetch saved account details from AsyncStorage when this page loads
    const fetchAccountDetails = async () => {
      try {
        const savedAccount = await AsyncStorage.getItem('savedAccount');
        if (savedAccount) {
          const accountData = JSON.parse(savedAccount);
          setAccountNumber(accountData.account_number);
          setAccountName(accountData.account_name);
          setBankCode(accountData.bank_code);
          setBankName(accountData.bank_name);
        }
      } catch (error) {
        console.error("⚠️ Error retrieving account:", error);
      }
    };

    fetchAccountDetails();
  }, []);

  const showPasscodePrompt = () => {
    if (!amount || isNaN(amount) || parseFloat(amount) < 50) {
      Alert.alert('Error', 'The amount must be at least 50 Naira');
      return;
    }

    setShowPasscodeModal(true);
  };

  const handleTransfer = async () => {
    if (!passcode || passcode.length !== 4) {
      Alert.alert('Error', 'Please enter your 4-digit passcode');
      return;
    }

    const transferData = {
      account_number: accountNumber,
      bank_code: bankCode,
      account_name: accountName,
      amount: parseFloat(amount),
      description: `Transfer to ${accountName}`,
      passcode: passcode,
      bankName: bankName,
    };

    console.log("🔍 Transfer Data:", transferData);
    setLoading(true);
    setShowPasscodeModal(false);

    try {
      const response = await apiService.externalTransfer(transferData);

      if (response.status === 'success') {
        Alert.alert('Success', 'Transfer completed successfully!', [
          {
            text: 'OK',
            onPress: () => {
              // Clear saved account and navigate back
              AsyncStorage.removeItem('savedAccount');
              navigation.navigate('Success', {
                amount: amount,
                recipientName: accountName,
                accountNumber: accountNumber,
                bankName: bankName,
                transactionId: response.data.transaction_id,
                timestamp: new Date().toISOString()
              });
            }
          }
        ]);
      } else {
        Alert.alert('Error', response.message || 'Transfer failed');
      }
    } catch (error) {
      console.error("🚨 Transfer Error:", error);
      Alert.alert('Error', error.message || 'Failed to process transfer');
    } finally {
      setLoading(false);
      setPasscode('');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Enter Amount to Transfer</Text>

      {accountName && (
        <View style={styles.accountInfo}>
          <Text style={styles.accountLabel}>Recipient:</Text>
          <Text style={styles.accountText}>{accountName}</Text>
          <Text style={styles.bankText}>{bankName}</Text>
        </View>
      )}

      <TextInput
        style={styles.input}
        placeholder="Amount in Naira"
        placeholderTextColor="#888"
        value={amount}
        keyboardType="numeric"
        onChangeText={setAmount}
      />

      <TouchableOpacity style={styles.button} onPress={showPasscodePrompt} disabled={loading}>
        <Text style={styles.buttonText}>{loading ? "Processing..." : "Continue"}</Text>
      </TouchableOpacity>

      {/* Passcode Modal */}
      <Modal visible={showPasscodeModal} transparent={true} animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Enter Transaction Passcode</Text>
            <TextInput
              style={styles.passcodeInput}
              placeholder="4-digit passcode"
              placeholderTextColor="#888"
              value={passcode}
              keyboardType="numeric"
              maxLength={4}
              secureTextEntry={true}
              onChangeText={setPasscode}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton]} 
                onPress={() => {
                  setShowPasscodeModal(false);
                  setPasscode('');
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalButton, styles.confirmButton]} 
                onPress={handleTransfer}
                disabled={passcode.length !== 4}
              >
                <Text style={styles.confirmButtonText}>Transfer</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Loading Modal */}
      <Modal visible={loading} transparent={true} animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalText}>Processing your transfer...</Text>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#121212',
  },
  header: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 20,
    marginTop: 20,
  },
  accountInfo: {
    backgroundColor: '#1e1e1e',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
  },
  accountLabel: {
    color: '#888',
    fontSize: 14,
    marginBottom: 5,
  },
  accountText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  bankText: {
    color: '#FFA500',
    fontSize: 14,
  },
  input: {
    backgroundColor: '#1e1e1e',
    color: '#fff',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
    fontSize: 18,
  },
  button: {
    backgroundColor: '#FFA500',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#000',
    fontWeight: 'bold',
    fontSize: 16,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  modalContent: {
    backgroundColor: '#1e1e1e',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
    minWidth: 300,
  },
  modalTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  modalText: {
    marginBottom: 20,
    fontSize: 16,
    color: '#fff',
  },
  passcodeInput: {
    backgroundColor: '#333',
    color: '#fff',
    padding: 15,
    borderRadius: 8,
    width: '100%',
    textAlign: 'center',
    fontSize: 18,
    letterSpacing: 10,
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  modalButton: {
    flex: 1,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  cancelButton: {
    backgroundColor: '#666',
  },
  confirmButton: {
    backgroundColor: '#FFA500',
  },
  cancelButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  confirmButtonText: {
    color: '#000',
    fontWeight: 'bold',
  },
});

export default Amount;
