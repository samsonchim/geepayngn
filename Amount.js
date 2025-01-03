import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Modal, StyleSheet, Alert } from 'react-native';

const Account = ({ navigation }) => {
  const [accountNumber, setAccountNumber] = useState('');
  const [bankCode, setBankCode] = useState('');
  const [accountName, setAccountName] = useState('');
  const [modalVisible, setModalVisible] = useState(false);

  const validateAccount = async () => {
    if (!accountNumber || !bankCode) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    try {
      const response = await fetch('https://b78d-102-88-84-248.ngrok-free.app/backend/validate.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ account_number: accountNumber, bank_code: bankCode }),
      });

      const result = await response.json();

      if (result.status) {
        setAccountName(result.data.account_name);
        setModalVisible(true);
      } else {
        Alert.alert('Error', result.message);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to connect to the server.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Transfer to Bank</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter 10-digit Account No."
        placeholderTextColor="#666"
        value={accountNumber}
        onChangeText={setAccountNumber}
      />
      <TextInput
        style={styles.input}
        placeholder="Bank Code"
        placeholderTextColor="#666"
        value={bankCode}
        onChangeText={setBankCode}
      />
      <TouchableOpacity style={styles.button} onPress={validateAccount}>
        <Text style={styles.buttonText}>Proceed</Text>
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
    backgroundColor: '#000',
  },
  header: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 20,
  },
  input: {
    backgroundColor: '#1a1a1a',
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

export default Account;
