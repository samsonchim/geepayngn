import React, { useEffect } from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';

const App = ({ navigation }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      navigation.navigate('Main');
    }, 10000); 

    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>GeePay</Text>
      <Image source={require('./assets/803.gif')} style={styles.preloader} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000', 
  },
  title: {
    fontSize: 24,
    color: '#FFA500',
    marginBottom: 20,
  },
  preloader: {
    width: 100, 
    height: 100,
    resizeMode: 'contain',
  },
});

export default App;
