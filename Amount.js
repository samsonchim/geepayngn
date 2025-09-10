import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  Modal, 
  StyleSheet, 
  Alert, 
  StatusBar,
  SafeAreaView,
  Animated,
  Dimensions
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ApiService from './services/ApiService';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

const Amount = ({ navigation, route }) => {
  const [amount, setAmount] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [accountName, setAccountName] = useState('');
  const [bankCode, setBankCode] = useState('');
  const [bankName, setBankName] = useState('');
  const [loading, setLoading] = useState(false);
  const [passcode, setPasscode] = useState('');
  const [showPasscodeModal, setShowPasscodeModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [transactionData, setTransactionData] = useState(null);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(height));

  const apiService = ApiService.getInstance();

  useEffect(() => {
    // Get data from navigation params first (from Transfer screen)
    if (route?.params) {
      const { bankName, bankCode, accountNumber, accountName } = route.params;
      if (bankName) setBankName(bankName);
      if (bankCode) setBankCode(bankCode);
      if (accountNumber) setAccountNumber(accountNumber);
      if (accountName) setAccountName(accountName);
      return; // Don't fetch from AsyncStorage if we have params
    }

    // Fallback: Fetch saved account details from AsyncStorage
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
  }, [route?.params]);

  const showPasscodePrompt = () => {
    if (!amount || isNaN(amount) || parseFloat(amount) < 50) {
      showCustomAlert('Invalid Amount', 'The amount must be at least ₦50');
      return;
    }

    // Animate modal in
    setShowPasscodeModal(true);
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const hidePasscodeModal = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: height,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setShowPasscodeModal(false);
      setPasscode('');
    });
  };

  const showCustomAlert = (title, message) => {
    Alert.alert(
      title,
      message,
      [{ text: 'OK', style: 'default' }],
      { 
        cancelable: true,
        userInterfaceStyle: 'light'
      }
    );
  };

  const formatAmount = (value) => {
    if (!value) return '';
    const numericValue = value.replace(/[^0-9]/g, '');
    return new Intl.NumberFormat('en-NG').format(numericValue);
  };

  const handleTransfer = async () => {
    if (!passcode || passcode.length !== 4) {
      showCustomAlert('Invalid Passcode', 'Please enter your 4-digit passcode');
      return;
    }

    const numericAmount = parseFloat(amount.replace(/,/g, ''));
    const transferData = {
      account_number: accountNumber,
      bank_code: bankCode,
      account_name: accountName,
      amount: numericAmount,
      description: `Transfer to ${accountName}`,
      passcode: passcode,
      bankName: bankName,
    };

    console.log("🔍 Flutterwave Transfer Data:", transferData);
    setLoading(true);
    hidePasscodeModal();

    try {
      // Use Flutterwave for transfer processing
      const response = await apiService.externalTransfer(transferData);

      if (response.status === 'success') {
        const txnData = {
          amount: numericAmount,
          recipientName: accountName,
          accountNumber: accountNumber,
          bankName: bankName,
          transactionId: response.data?.transaction_id || `FLW${Date.now()}`,
          timestamp: new Date().toISOString(),
          status: 'success'
        };
        
        setTransactionData(txnData);
        
        // Clear saved account
        await AsyncStorage.removeItem('savedAccount');
        
        // Show success modal
        setShowSuccessModal(true);
        
      } else {
        showCustomAlert('Transfer Failed', response.message || 'Unable to process transfer. Please try again.');
      }
    } catch (error) {
      console.error("🚨 Flutterwave Transfer Error:", error);
      showCustomAlert('Network Error', 'Unable to connect to payment service. Please check your connection and try again.');
    } finally {
      setLoading(false);
      setPasscode('');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#2E86AB" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#000000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Transfer Amount</Text>
        <View style={styles.headerSpacer} />
      </View>

      <View style={styles.content}>
        {/* Recipient Info Card */}
        {accountName && (
          <View style={styles.recipientCard}>
            <View style={styles.recipientHeader}>
              <Ionicons name="person-circle" size={32} color="#FFA500" />
              <Text style={styles.recipientLabel}>Transfer to</Text>
            </View>
            <Text style={styles.recipientName}>{accountName}</Text>
            <Text style={styles.recipientBank}>{bankName}</Text>
            <Text style={styles.recipientAccount}>Account: {accountNumber}</Text>
          </View>
        )}

        {/* Amount Input */}
        <View style={styles.amountSection}>
          <Text style={styles.amountLabel}>Enter Amount</Text>
          <View style={styles.amountInputContainer}>
            <Text style={styles.currencySymbol}>₦</Text>
            <TextInput
              style={styles.amountInput}
              placeholder="0"
              placeholderTextColor="#A8A8A8"
              value={formatAmount(amount)}
              keyboardType="numeric"
              onChangeText={(text) => setAmount(text.replace(/,/g, ''))}
              autoFocus={true}
            />
          </View>
          <Text style={styles.minimumText}>Minimum amount: ₦50</Text>
        </View>

        {/* Continue Button */}
        <TouchableOpacity 
          style={[styles.continueButton, loading && styles.buttonDisabled]} 
          onPress={showPasscodePrompt} 
          disabled={loading}
          activeOpacity={0.8}
        >
          {loading ? (
            <View style={styles.loadingContainer}>
              <Text style={styles.buttonText}>Processing...</Text>
            </View>
          ) : (
            <>
              <Text style={styles.buttonText}>Continue Transfer</Text>
              <Ionicons name="arrow-forward" size={20} color="white" />
            </>
          )}
        </TouchableOpacity>
      </View>

      {/* Enhanced Passcode Modal */}
      <Modal visible={showPasscodeModal} transparent={true} animationType="none">
        <Animated.View style={[styles.modalOverlay, { opacity: fadeAnim }]}>
          <Animated.View style={[styles.modalContainer, { transform: [{ translateY: slideAnim }] }]}>
            <View style={styles.modalHeader}>
              <Ionicons name="lock-closed" size={24} color="#FFA500" />
              <Text style={styles.modalTitle}>Secure Transfer</Text>
            </View>
            
            <Text style={styles.modalSubtitle}>Enter your 4-digit transaction PIN</Text>
            
            <View style={styles.passcodeContainer}>
              <TextInput
                style={styles.passcodeInput}
                value={passcode}
                keyboardType="numeric"
                maxLength={4}
                secureTextEntry={true}
                onChangeText={setPasscode}
                autoFocus={true}
                placeholder="Enter 4-digit PIN"
                placeholderTextColor="#999"
              />
              <View style={styles.passcodeDots}>
                {[...Array(4)].map((_, index) => (
                  <View 
                    key={index} 
                    style={[
                      styles.passcodeDot, 
                      passcode.length > index && styles.passcodeDotFilled
                    ]} 
                  />
                ))}
              </View>
            </View>

            <View style={styles.transferSummary}>
              <Text style={styles.summaryText}>Amount: ₦{formatAmount(amount)}</Text>
              <Text style={styles.summaryText}>To: {accountName}</Text>
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton]} 
                onPress={hidePasscodeModal}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalButton, styles.confirmButton, passcode.length !== 4 && styles.buttonDisabled]} 
                onPress={handleTransfer}
                disabled={passcode.length !== 4}
              >
                <Text style={styles.confirmButtonText}>Confirm Transfer</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </Animated.View>
      </Modal>

      {/* Success Modal */}
      <Modal visible={showSuccessModal} transparent={true} animationType="fade">
        <View style={styles.successModalOverlay}>
          <View style={styles.successModalContainer}>
            <Ionicons name="checkmark-circle" size={64} color="#4CAF50" />
            <Text style={styles.successTitle}>Transfer Successful!</Text>
            <Text style={styles.successMessage}>
              ₦{formatAmount(transactionData?.amount?.toString() || '')} has been sent to {transactionData?.recipientName}
            </Text>
            
            <TouchableOpacity 
              style={styles.successButton}
              onPress={() => {
                setShowSuccessModal(false);
                navigation.navigate('Success', transactionData);
              }}
            >
              <Text style={styles.successButtonText}>View Receipt</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    backgroundColor: '#FFA500',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    flex: 1,
    color: '#000000',
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
    marginRight: 32,
  },
  headerSpacer: {
    width: 32,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  recipientCard: {
    backgroundColor: '#1A1A1A',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#333333',
  },
  recipientHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  recipientLabel: {
    marginLeft: 12,
    color: '#888888',
    fontSize: 14,
    fontWeight: '500',
  },
  recipientName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  recipientBank: {
    fontSize: 16,
    color: '#FFA500',
    fontWeight: '600',
    marginBottom: 4,
  },
  recipientAccount: {
    fontSize: 14,
    color: '#CCCCCC',
    fontWeight: '500',
  },
  amountSection: {
    backgroundColor: '#1A1A1A',
    borderRadius: 16,
    padding: 24,
    marginBottom: 32,
    borderWidth: 1,
    borderColor: '#333333',
  },
  amountLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 16,
    textAlign: 'center',
  },
  amountInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  currencySymbol: {
    fontSize: 32,
    fontWeight: '700',
    color: '#FFA500',
    marginRight: 8,
  },
  amountInput: {
    fontSize: 36,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    minWidth: 150,
    padding: 0,
  },
  minimumText: {
    fontSize: 12,
    color: '#888888',
    textAlign: 'center',
    marginTop: 8,
  },
  continueButton: {
    backgroundColor: '#FFA500',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
    shadowColor: '#FFA500',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
    elevation: 1,
    shadowOpacity: 0.1,
  },
  buttonText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: '700',
    marginRight: 8,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#1A1A1A',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
    minHeight: height * 0.5,
    borderTopWidth: 2,
    borderTopColor: '#FFA500',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    marginLeft: 12,
  },
  modalSubtitle: {
    fontSize: 16,
    color: '#CCCCCC',
    textAlign: 'center',
    marginBottom: 32,
  },
  passcodeContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  passcodeInput: {
    backgroundColor: '#2A2A2A',
    color: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    fontSize: 18,
    textAlign: 'center',
    width: 200,
    borderWidth: 2,
    borderColor: '#FFA500',
    letterSpacing: 15,
    marginBottom: 20,
  },
  passcodeDots: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  passcodeDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#333333',
    marginHorizontal: 8,
  },
  passcodeDotFilled: {
    backgroundColor: '#FFA500',
  },
  transferSummary: {
    backgroundColor: '#2A2A2A',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#444444',
  },
  summaryText: {
    fontSize: 14,
    color: '#FFFFFF',
    marginBottom: 4,
    textAlign: 'center',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginHorizontal: 8,
  },
  cancelButton: {
    backgroundColor: '#333333',
  },
  cancelButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
  },
  confirmButton: {
    backgroundColor: '#FFA500',
  },
  confirmButtonText: {
    color: '#000000',
    fontWeight: '700',
    fontSize: 16,
  },
  
  // Success Modal
  successModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  successModalContainer: {
    backgroundColor: '#1A1A1A',
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    marginHorizontal: 20,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    borderWidth: 2,
    borderColor: '#FFA500',
  },
  successTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    marginTop: 16,
    marginBottom: 12,
    textAlign: 'center',
  },
  successMessage: {
    fontSize: 16,
    color: '#CCCCCC',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  successButton: {
    backgroundColor: '#FFA500',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 32,
    minWidth: 150,
  },
  successButtonText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
  },
});

export default Amount;
