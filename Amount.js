import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Modal, StyleSheet, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Amount = ({ navigation }) => {
  const [amount, setAmount] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [accountName, setAccountName] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Fetch saved account details from AsyncStorage when this page loads
    const fetchAccountDetails = async () => {
      try {
        const savedAccount = await AsyncStorage.getItem('savedAccount');
        if (savedAccount) {
          const accountData = JSON.parse(savedAccount);
          setAccountNumber(accountData.account_number);
          setAccountName(accountData.account_name);
        }
      } catch (error) {
        console.error("⚠️ Error retrieving account:", error);
      }
    };

    fetchAccountDetails();
  }, []);

  const handleTransfer = async () => {
    if (!amount || isNaN(amount) || amount < 50) {
      Alert.alert('Error', 'The amount must be at least 50 Naira');
      return;
    }
  
    const payload = {
      account_number: accountNumber,
      account_name: accountName,
      amount: amount,
    };
  
    console.log("🔍 Request Payload:", payload);
    setLoading(true);
  
    try {
      const response = await fetch('https://7d18-197-210-226-253.ngrok-free.app/backend/transfer.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),  // Sending the payload as a JSON string
      });
  
      const textResponse = await response.text();
      console.log("📥 Raw Response:", textResponse);
  
      try {
        const result = JSON.parse(textResponse);
  
        if (result.status) {
          Alert.alert('Success', 'Transfer successful!');
          // Redirect to another page or reset fields after successful transfer
          navigation.goBack();
        } else {
          Alert.alert('Error', result.message);
        }
      } catch (jsonError) {
        console.error("⚠️ JSON Parse Error:", jsonError);
        Alert.alert("Error", "Invalid response from the server.");
      }
    } catch (error) {
      console.error("🚨 Fetch Error:", error);
      Alert.alert('Error', 'Failed to connect to the server.');
    } finally {
      setLoading(false);
    }
  };
  

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Enter Amount to Transfer</Text>

      <TextInput
        style={styles.input}
        placeholder="Amount in Naira"
        placeholderTextColor="#888"
        value={amount}
        keyboardType="numeric"
        onChangeText={setAmount}
      />

      <TouchableOpacity style={styles.button} onPress={handleTransfer} disabled={loading}>
        <Text style={styles.buttonText}>{loading ? "Processing..." : "Send"}</Text>
      </TouchableOpacity>

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

export default Amount;
