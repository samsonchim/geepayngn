import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Vibration,
} from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons'; // Make sure Ionicons is included here

const PasscodeScreen = ({ navigation }) => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');

  const handleKeyPress = (key) => {
    setError(''); // Clear error on new input

    if (pin.length < 6) {
      setPin((prev) => prev + key);
    }

    if (pin.length + 1 === 6) {
      setTimeout(() => {
        if (pin + key === '131111') {
          navigation.replace('MainApp');
        } else {
          Vibration.vibrate();
          setPin('');
          setError('Incorrect PIN'); // Display error
        }
      }, 200);
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
        {[...Array(6)].map((_, index) => (
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
