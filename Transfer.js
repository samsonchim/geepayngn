import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Modal, StyleSheet, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ApiService from './services/ApiService';

const Transfer = ({ navigation }) => {
  const [accountNumber, setAccountNumber] = useState('');
  const [bankCode, setBankCode] = useState('');
  const [accountName, setAccountName] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [banks, setBanks] = useState([]);

  const apiService = ApiService.getInstance();

  useEffect(() => {
    loadBanks();
  }, []);

  const loadBanks = async () => {
    try {
      const response = await apiService.getBanks();
      if (response.status === 'success') {
        setBanks(response.data);
      }
    } catch (error) {
      console.error('Failed to load banks:', error);
    }
  };

  // Function to validate account and save account details
  const validateAccount = async () => {
    if (!accountNumber || !bankCode) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (accountNumber.length !== 10) {
      Alert.alert('Error', 'Please enter a valid 10-digit account number');
      return;
    }

    setLoading(true);

    try {
      const response = await apiService.validateAccount(accountNumber, bankCode);

      if (response.status === 'success') {
        // Save the account details to AsyncStorage
        const accountDetails = {
          account_number: accountNumber,
          account_name: response.data.account_name,
          bank_code: bankCode,
          bank_name: response.data.bank_name,
        };

        await AsyncStorage.setItem('savedAccount', JSON.stringify(accountDetails));
        console.log("✅ Account Saved:", accountDetails);

        // Set account name to display in modal
        setAccountName(response.data.account_name);
        setModalVisible(true);
      } else {
        Alert.alert('Error', response.message || 'Account validation failed');
      }
    } catch (error) {
      console.error("🚨 Validation Error:", error);
      Alert.alert('Error', error.message || 'Failed to validate account');
    } finally {
      setLoading(false);
    }
  };

  // Function to retrieve saved account details from AsyncStorage
  const getSavedAccount = async () => {
    try {
      const savedData = await AsyncStorage.getItem('savedAccount');
      if (savedData) {
        console.log("📦 Retrieved Account:", JSON.parse(savedData));
        return JSON.parse(savedData);
      }
    } catch (error) {
      console.error("⚠️ Error retrieving account:", error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Transfer to Bank</Text>

      <TextInput
        style={styles.input}
        placeholder="Enter 10-digit Account No."
        placeholderTextColor="#888"
        value={accountNumber}
        keyboardType="numeric"
        maxLength={10}
        onChangeText={setAccountNumber}
      />
      
      <TextInput
        style={styles.input}
        placeholder="Bank Code"
        placeholderTextColor="#888"
        value={bankCode}
        keyboardType="numeric"
        onChangeText={setBankCode}
      />

      <TouchableOpacity style={styles.button} onPress={validateAccount} disabled={loading}>
        <Text style={styles.buttonText}>{loading ? "Verifying..." : "Proceed"}</Text>
      </TouchableOpacity>

      {/* Modal to show account name */}
      <Modal visible={modalVisible} transparent={true} animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalText}>Account Name: {accountName}</Text>
            <TouchableOpacity
              style={styles.button}
              onPress={() => {
                setModalVisible(false);
                navigation.navigate('Amount'); 
              }}
            >
              <Text style={styles.buttonText}>Continue</Text>
            </TouchableOpacity>
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
  },
  input: {
    backgroundColor: '#1e1e1e',
    color: '#fff',
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
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
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  modalText: {
    marginBottom: 20,
    fontSize: 16,
  },
});

export default Transfer;
