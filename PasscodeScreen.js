import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Vibration,
  Alert,
} from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ApiService from './services/ApiService';

const PasscodeScreen = ({ navigation }) => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const apiService = ApiService.getInstance();

  useEffect(() => {
    // Initialize API service from storage
    initializeApiService();
  }, []);

  const initializeApiService = async () => {
    await apiService.initializeFromStorage();
    
    // Check if user is already authenticated
    if (apiService.isAuthenticated()) {
      const user = apiService.getCurrentUser();
      console.log('User already authenticated:', user?.first_name);
    }
  };

  const handleKeyPress = (key) => {
    setError(''); // Clear error on new input

    if (pin.length < 4) { // Changed to 4 digits for passcode
      setPin((prev) => prev + key);
    }

    if (pin.length + 1 === 4) {
      setTimeout(() => {
        verifyPasscode(pin + key);
      }, 200);
    }
  };

  const verifyPasscode = async (enteredPin) => {
    setLoading(true);
    
    try {
      // For demo, use a default email or get from storage
      const savedEmail = await AsyncStorage.getItem('userEmail');
      const email = savedEmail || 'samson@geepayngn.com'; // Default for testing
      
      const response = await apiService.verifyPasscode(email, enteredPin);
      
      if (response.status === 'success') {
        // Save email for future use
        await AsyncStorage.setItem('userEmail', email);
        
        console.log('Login successful:', response.data.user);
        navigation.replace('MainApp');
      } else {
        Vibration.vibrate();
        setPin('');
        setError('Incorrect passcode');
      }
    } catch (error) {
      console.error('Passcode verification error:', error);
      Vibration.vibrate();
      setPin('');
      setError('Invalid passcode. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = () => {
    setPin((prev) => prev.slice(0, -1));
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Enter Passcode</Text>
      {error ? <Text style={styles.errorText}>{error}</Text> : null} {/* Display error message */}
      <View style={styles.passcodeContainer}>
        {[...Array(4)].map((_, index) => (
          <View
            key={index}
            style={[styles.passcodeDot, index < pin.length && styles.filledDot]}
          />
        ))}
      </View>

      <View style={styles.keypad}>
        <View style={styles.row}>
          {['1', '2', '3'].map((key) => (
            <TouchableOpacity
              key={key}
              style={styles.key}
              onPress={() => handleKeyPress(key)}
            >
              <Text style={styles.keyText}>{key}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <View style={styles.row}>
          {['4', '5', '6'].map((key) => (
            <TouchableOpacity
              key={key}
              style={styles.key}
              onPress={() => handleKeyPress(key)}
            >
              <Text style={styles.keyText}>{key}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <View style={styles.row}>
          {['7', '8', '9'].map((key) => (
            <TouchableOpacity
              key={key}
              style={styles.key}
              onPress={() => handleKeyPress(key)}
            >
              <Text style={styles.keyText}>{key}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <View style={[styles.row, styles.lastRow]}>
          <TouchableOpacity onPress={() => alert('Biometric Auth')}>
            <MaterialIcons name="fingerprint" size={25} color="#FFFFFF" /> {/* Reduced size */}
          </TouchableOpacity>
          <TouchableOpacity style={styles.key} onPress={() => handleKeyPress('0')}>
            <Text style={styles.keyText}>0</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleDelete}>
            <Ionicons name="backspace" size={25} color="#FFFFFF" /> {/* Backspace icon */}
          </TouchableOpacity>
        </View>
      </View>
      <TouchableOpacity>
        <Text style={styles.forgotText}>Forgot passcode?</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1C1C1E',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 20,
    color: '#FFFFFF',
    marginBottom: 50,
  },
  errorText: {
    color: '#FF0000',
    fontSize: 16,
    marginBottom: 30,
  },
  passcodeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 70,
    width: '60%',
  },
  passcodeDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    backgroundColor: 'transparent',
  },
  filledDot: {
    backgroundColor: '#FFFFFF',
  },
  keypad: {
    width: '80%',
    justifyContent: 'center',
    marginBottom: 20,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  lastRow: {
    justifyContent: 'space-around', // Center the "0" and icons evenly
  },
  key: {
    width: 70,
    height: 70,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 35,
    backgroundColor: '#2C2C2E',
  },
  keyText: {
    color: '#FFFFFF',
    fontSize: 24,
  },
  forgotText: {
    color: '#AAAAAA',
    marginTop: 10,
    fontSize: 14,
  },
});

export default PasscodeScreen;
