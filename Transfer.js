import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  Modal, 
  StyleSheet, 
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Animated,
  FlatList
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ApiService from './services/ApiService';
import { BankValidationService } from './services/BankValidationService';

const Transfer = ({ navigation }) => {
  const [accountNumber, setAccountNumber] = useState('');
  const [bankCode, setBankCode] = useState('');
  const [selectedBank, setSelectedBank] = useState(null);
  const [accountName, setAccountName] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [bankModalVisible, setBankModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [banks, setBanks] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [fadeAnim] = useState(new Animated.Value(0));

  const apiService = ApiService.getInstance();

  useEffect(() => {
    loadBanks();
    
    // Animate in the form
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, []);

  const loadBanks = async () => {
    try {
      // Use Flutterwave to get banks for consistency
      console.log('🏦 Loading banks from Flutterwave...');
      const fw = await BankValidationService.getBanksFromFlutterwave();
      
      if (fw?.status === 'success' && Array.isArray(fw?.data)) {
        const flutterwaveBanks = fw.data
          .filter(b => b?.code && b?.name)
          .map(b => ({ 
            name: b.name, 
            code: String(b.code), 
            color: '#FFA500' 
          }))
          .sort((a, b) => a.name.localeCompare(b.name)); // Sort alphabetically
        
        console.log(`✅ Loaded ${flutterwaveBanks.length} banks from Flutterwave`);
        setBanks(flutterwaveBanks);
        return;
      }

      // Fallback to local curated banks if Flutterwave fails
      console.log('⚠️ Flutterwave banks failed, using local banks');
      const response = await apiService.getBanks();
      if (response.success) {
        setBanks(response.banks);
      }
    } catch (error) {
      console.error('Failed to load banks:', error);
      // Final fallback to local banks
      try {
        const response = await apiService.getBanks();
        if (response.success) setBanks(response.banks);
      } catch {}
    }
  };

  const filteredBanks = banks.filter(bank =>
    bank.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    bank.code.includes(searchQuery)
  );

  const selectBank = (bank) => {
    setSelectedBank(bank);
    setBankCode(bank.code);
    setBankModalVisible(false);
    setSearchQuery('');
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
      console.log(`🔍 Validating account ${accountNumber} with bank code ${bankCode} using Flutterwave...`);
      
      // Use Flutterwave for validation since we got the bank codes from Flutterwave
      const fw = await BankValidationService.validateAccountFlutterwave(accountNumber, bankCode);
      let account_name = '';
      let bank_name = selectedBank?.name || '';

      if (fw?.status === 'success' && fw?.data?.account_name) {
        account_name = fw.data.account_name;
        bank_name = fw.data.bank_name || bank_name;
        console.log(`✅ Flutterwave validation successful: ${account_name}`);
      } else {
        console.log('❌ Flutterwave validation failed:', fw?.message || 'Unknown error');
        
        // Only fallback to other services if Flutterwave explicitly fails
        console.log('🔄 Trying Nubapi as fallback...');
        const nu = await BankValidationService.validateAccountNubapi(accountNumber, bankCode);
        if (nu?.account_name) {
          account_name = nu.account_name;
          console.log(`✅ Nubapi validation successful: ${account_name}`);
        } else if (nu?.data?.account_name) {
          account_name = nu.data.account_name;
          console.log(`✅ Nubapi validation successful: ${account_name}`);
        } else if (nu?.first_name || nu?.last_name) {
          account_name = [nu?.first_name, nu?.last_name].filter(Boolean).join(' ').trim();
          console.log(`✅ Nubapi validation successful: ${account_name}`);
        } else if (nu?.data?.first_name || nu?.data?.last_name) {
          account_name = [nu?.data?.first_name, nu?.data?.last_name].filter(Boolean).join(' ').trim();
          console.log(`✅ Nubapi validation successful: ${account_name}`);
        }
      }

      if (!account_name) {
        const msg = fw?.message || fw?.data?.message || 'Unable to validate account. Please check the account number and try again.';
        Alert.alert('Validation Failed', msg);
        return;
      }

      const accountDetails = {
        account_number: accountNumber,
        account_name,
        bank_code: bankCode,
        bank_name,
      };

      await AsyncStorage.setItem('savedAccount', JSON.stringify(accountDetails));
      setAccountName(account_name);
      setModalVisible(true);
  } catch (error) {
      console.error('🚨 Validation Error:', error);
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
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Send Money</Text>
          <View style={styles.placeholder} />
        </View>

        <Animated.View style={[styles.formContainer, { opacity: fadeAnim }]}>
          {/* Step Indicator */}
          <View style={styles.stepIndicator}>
            <View style={styles.activeStep}>
              <Text style={styles.stepNumber}>1</Text>
            </View>
            <View style={styles.stepLine} />
            <View style={styles.inactiveStep}>
              <Text style={styles.inactiveStepNumber}>2</Text>
            </View>
            <View style={styles.stepLine} />
            <View style={styles.inactiveStep}>
              <Text style={styles.inactiveStepNumber}>3</Text>
            </View>
          </View>
          
          <Text style={styles.stepTitle}>Enter Recipient Details</Text>
          <Text style={styles.stepSubtitle}>Choose the bank and enter account details</Text>

          {/* Bank Selection */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>
              <Ionicons name="business" size={16} color="#FFA500" /> Select Bank
            </Text>
            <TouchableOpacity 
              style={styles.bankSelector}
              onPress={() => setBankModalVisible(true)}
            >
              <Text style={selectedBank ? styles.bankSelectedText : styles.bankPlaceholderText}>
                {selectedBank ? selectedBank.name : 'Choose your bank'}
              </Text>
              <Ionicons name="chevron-down" size={20} color="#FFA500" />
            </TouchableOpacity>
            {selectedBank && (
              <View style={styles.bankInfo}>
                <Text style={styles.bankCode}>Code: {selectedBank.code}</Text>
              </View>
            )}
          </View>

          {/* Account Number */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>
              <Ionicons name="card" size={16} color="#FFA500" /> Account Number
            </Text>
            <TextInput
              style={styles.input}
              placeholder="Enter 10-digit account number"
              placeholderTextColor="#666"
              value={accountNumber}
              keyboardType="numeric"
              maxLength={10}
              onChangeText={setAccountNumber}
            />
            <View style={styles.inputIndicator}>
              <Text style={[styles.digitCount, accountNumber.length === 10 ? styles.digitCountComplete : null]}>
                {accountNumber.length}/10
              </Text>
            </View>
          </View>

          {/* Validation Status */}
          {accountName && (
            <Animated.View style={[styles.validationCard, styles.validationSuccess]}>
              <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
              <View style={styles.validationInfo}>
                <Text style={styles.validationTitle}>Account Verified</Text>
                <Text style={styles.validationName}>{accountName}</Text>
                <Text style={styles.validationBank}>{selectedBank?.name}</Text>
              </View>
            </Animated.View>
          )}

          {/* Action Button */}
          <TouchableOpacity 
            style={[
              styles.continueButton, 
              (!accountNumber || !bankCode || accountNumber.length !== 10) && styles.continueButtonDisabled
            ]}
            onPress={validateAccount} 
            disabled={loading || !accountNumber || !bankCode || accountNumber.length !== 10}
          >
            {loading ? (
              <View style={styles.loadingContainer}>
                <Animated.View style={[styles.loadingDot, styles.loadingDot1]} />
                <Animated.View style={[styles.loadingDot, styles.loadingDot2]} />
                <Animated.View style={[styles.loadingDot, styles.loadingDot3]} />
                <Text style={styles.loadingText}>Verifying...</Text>
              </View>
            ) : (
              <>
                <Text style={styles.continueButtonText}>Verify Account</Text>
                <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
              </>
            )}
          </TouchableOpacity>

          {/* Security Notice */}
          <View style={styles.securityNotice}>
            <Ionicons name="shield-checkmark" size={16} color="#4CAF50" />
            <Text style={styles.securityText}>Your transaction is secured with 256-bit SSL encryption</Text>
          </View>
        </Animated.View>

        {/* Bank Selection Modal */}
        <Modal visible={bankModalVisible} transparent={true} animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={styles.bankModal}>
              {/* Modal Header */}
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Select Bank</Text>
                <TouchableOpacity onPress={() => setBankModalVisible(false)}>
                  <Ionicons name="close" size={24} color="#FFFFFF" />
                </TouchableOpacity>
              </View>

              {/* Search */}
              <View style={styles.searchContainer}>
                <Ionicons name="search" size={20} color="#666" />
                <TextInput
                  style={styles.searchInput}
                  placeholder="Search banks..."
                  placeholderTextColor="#666"
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                />
              </View>

              {/* Banks List */}
              <FlatList
                data={filteredBanks}
                keyExtractor={(item) => item.code}
                style={styles.banksList}
                renderItem={({ item }) => (
                  <TouchableOpacity 
                    style={styles.bankItem}
                    onPress={() => selectBank(item)}
                  >
                    <View style={[styles.bankIcon, { backgroundColor: item.color || '#FFA500' }]}>
                      <Text style={styles.bankIconText}>{item.name.charAt(0)}</Text>
                    </View>
                    <View style={styles.bankDetails}>
                      <Text style={styles.bankName}>{item.name}</Text>
                      <Text style={styles.bankCodeText}>Code: {item.code}</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color="#666" />
                  </TouchableOpacity>
                )}
                showsVerticalScrollIndicator={false}
              />
            </View>
          </View>
        </Modal>

        {/* Account Confirmation Modal */}
        <Modal visible={modalVisible} transparent={true} animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={styles.confirmationModal}>
              <View style={styles.confirmationHeader}>
                <Ionicons name="checkmark-circle" size={48} color="#4CAF50" />
                <Text style={styles.confirmationTitle}>Account Verified!</Text>
              </View>
              
              <View style={styles.confirmationDetails}>
                <Text style={styles.confirmationName}>{accountName}</Text>
                <Text style={styles.confirmationBank}>{selectedBank?.name}</Text>
                <Text style={styles.confirmationAccount}>{accountNumber}</Text>
              </View>

              <TouchableOpacity
                style={styles.proceedButton}
                onPress={() => {
                  setModalVisible(false);
                  navigation.navigate('Amount', {
                    bankName: selectedBank?.name || 'Unknown Bank',
                    bankCode: bankCode,
                    accountNumber: accountNumber,
                    accountName: accountName // Use state variable instead of local variable
                  }); 
                }}
              >
                <Text style={styles.proceedButtonText}>Proceed to Amount</Text>
                <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0A',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: '#1A1A1A',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#2C2C2E',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  placeholder: {
    width: 40,
  },
  formContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 30,
  },
  stepIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 30,
  },
  activeStep: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFA500',
    alignItems: 'center',
    justifyContent: 'center',
  },
  inactiveStep: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#2C2C2E',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumber: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  inactiveStepNumber: {
    color: '#666',
    fontSize: 16,
    fontWeight: 'bold',
  },
  stepLine: {
    width: 40,
    height: 2,
    backgroundColor: '#2C2C2E',
    marginHorizontal: 10,
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 8,
  },
  stepSubtitle: {
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
    marginBottom: 40,
  },
  inputGroup: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 16,
    color: '#FFA500',
    marginBottom: 8,
    fontWeight: '600',
  },
  bankSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1A1A1A',
    paddingHorizontal: 16,
    paddingVertical: 18,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#333',
  },
  bankSelectedText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
  bankPlaceholderText: {
    color: '#666',
    fontSize: 16,
  },
  bankInfo: {
    marginTop: 8,
    paddingHorizontal: 16,
  },
  bankCode: {
    color: '#FFA500',
    fontSize: 14,
  },
  input: {
    backgroundColor: '#1A1A1A',
    color: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 18,
    borderRadius: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#333',
  },
  inputIndicator: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 8,
  },
  digitCount: {
    color: '#666',
    fontSize: 12,
  },
  digitCountComplete: {
    color: '#4CAF50',
    fontWeight: 'bold',
  },
  validationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  validationSuccess: {
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    borderWidth: 1,
    borderColor: '#4CAF50',
  },
  validationInfo: {
    flex: 1,
    marginLeft: 12,
  },
  validationTitle: {
    color: '#4CAF50',
    fontSize: 14,
    fontWeight: '600',
  },
  validationName: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 2,
  },
  validationBank: {
    color: '#888',
    fontSize: 14,
    marginTop: 2,
  },
  continueButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFA500',
    paddingVertical: 18,
    borderRadius: 12,
    marginTop: 20,
  },
  continueButtonDisabled: {
    backgroundColor: '#333',
  },
  continueButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 8,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  loadingText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 12,
  },
  loadingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#fff',
    marginHorizontal: 2,
  },
  loadingDot1: { opacity: 0.7 },
  loadingDot2: { opacity: 0.5 },
  loadingDot3: { opacity: 0.3 },
  securityNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    paddingBottom: 40,
  },
  securityText: {
    color: '#4CAF50',
    fontSize: 12,
    marginLeft: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'flex-end',
  },
  bankModal: {
    backgroundColor: '#1A1A1A',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2C2C2E',
    margin: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
  },
  searchInput: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 16,
    marginLeft: 12,
  },
  banksList: {
    paddingHorizontal: 20,
  },
  bankItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#2C2C2E',
  },
  bankIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  bankIconText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  bankDetails: {
    flex: 1,
  },
  bankName: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
  bankCodeText: {
    color: '#888',
    fontSize: 14,
    marginTop: 2,
  },
  confirmationModal: {
    backgroundColor: '#1A1A1A',
    margin: 20,
    borderRadius: 24,
    padding: 24,
  },
  confirmationHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  confirmationTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 12,
  },
  confirmationDetails: {
    alignItems: 'center',
    marginBottom: 32,
  },
  confirmationName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  confirmationBank: {
    fontSize: 16,
    color: '#FFA500',
    marginBottom: 4,
  },
  confirmationAccount: {
    fontSize: 16,
    color: '#888',
  },
  proceedButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFA500',
    paddingVertical: 16,
    borderRadius: 12,
  },
  proceedButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 8,
  },
});

export default Transfer;
