import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const Success = ({ route }) => {
  const { accountName, accountNumber, amount, timestamp } = route.params;

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Transfer Successful</Text>
      <View style={styles.receipt}>
        <Text style={styles.receiptText}>Account Name: {accountName}</Text>
        <Text style={styles.receiptText}>Account Number: {accountNumber}</Text>
        <Text style={styles.receiptText}>Amount Transferred: ₦{amount}</Text>
        <Text style={styles.receiptText}>Timestamp: {timestamp}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#121212',
    padding: 20,
  },
  header: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 20,
  },
  receipt: {
    backgroundColor: '#1e1e1e',
    padding: 20,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
  },
  receiptText: {
    color: '#fff',
    fontSize: 16,
    marginBottom: 10,
  },
});

export default Success;
