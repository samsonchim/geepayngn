import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  FlatList,
  Dimensions,
  Animated,
  RefreshControl,
} from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import ApiService from './services/ApiService';

const { width } = Dimensions.get('window');

const MainApp = ({ navigation }) => {
  const [isBalanceBlurred, setIsBalanceBlurred] = useState(false);
  const [blurValue] = useState(new Animated.Value(0));
  const [isBalanceVisible, setIsBalanceVisible] = useState(true);
  const [transactions, setTransactions] = useState([]);
  const [user, setUser] = useState(null);
  const [balance, setBalance] = useState('0.00');
  const [unreadCount, setUnreadCount] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  const apiService = ApiService.getInstance();

  useEffect(() => {
    loadUserData();
    loadTransactions();
    loadNotificationCount();
  }, []);

  const loadUserData = async () => {
    try {
  const currentUser = await apiService.getCurrentUser();
      if (currentUser) {
        setUser(currentUser);
        setBalance(parseFloat(currentUser.account_balance).toFixed(2));
      }

      // Refresh balance from API
      const balanceResponse = await apiService.getBalance();
      if (balanceResponse.status === 'success') {
        setBalance(parseFloat(balanceResponse.data.balance).toFixed(2));
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const loadTransactions = async () => {
    try {
      const response = await apiService.getTransactions(1, 10);
      if (response.status === 'success') {
        setTransactions(response.data);
      }
    } catch (error) {
      console.error('Error loading transactions:', error);
    }
  };

  const loadNotificationCount = async () => {
    try {
      const response = await apiService.getUnreadCount();
      if (response.status === 'success') {
        setUnreadCount(response.data.unread_count);
      }
    } catch (error) {
      console.error('Error loading notification count:', error);
    }
  };

  const handleTransactionPress = (item) => {
    // Extract raw amount (prefer stored numeric)
    const rawAmount = typeof item?.meta?.rawAmount === 'number'
      ? item.meta.rawAmount
      : (() => {
          const isNegative = typeof item?.amount === 'string' && item.amount.trim().startsWith('-');
          const num = parseFloat(String(item?.amount || '').replace(/[^\d.]/g, '')) || 0;
          return isNegative ? -num : num;
        })();

    // Derive recipient name
    let recipientName = item?.meta?.recipientName;
    if (!recipientName && typeof item?.name === 'string') {
      const m = item.name.match(/Transfer to\s+(.+)/i);
      recipientName = m ? m[1] : item.name;
    }

    navigation.navigate('Success', {
      amount: rawAmount,
      recipientName: recipientName || 'N/A',
      accountNumber: item?.meta?.accountNumber || 'N/A',
      bankName: item?.meta?.bankName || 'N/A',
      transactionId: item?.id,
      timestamp: item?.meta?.rawDate || new Date().toISOString(),
      direction: item?.type === 'incoming' ? 'incoming' : 'outgoing',
    });
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([
      loadUserData(),
      loadTransactions(),
      loadNotificationCount()
    ]);
    setRefreshing(false);
  };

  const toggleBalanceBlur = () => {
    const toValue = isBalanceBlurred ? 0 : 10; // Blur effect level (0 to 10)
    Animated.timing(blurValue, {
      toValue,
      duration: 300,
      useNativeDriver: true,
    }).start();
    setIsBalanceBlurred(!isBalanceBlurred);
  };

  const toggleBalanceVisibility = () => {
    setIsBalanceVisible(!isBalanceVisible);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.userSection}>
          <Image
            source={require('./assets/avatar.png')}
            style={styles.userImage}
          />
          <View>
            <Text style={styles.greeting}>Hi, welcome</Text>
            <Text style={styles.username}>
              {user ? `${user.first_name} ${user.last_name}` : 'Loading...'}
            </Text>
          </View>
        </View>
        <TouchableOpacity style={styles.notificationButton}>
          <Ionicons name="notifications-outline" size={24} color="#FFA500" />
          {unreadCount > 0 && (
            <View style={styles.notificationBadge}>
              <Text style={styles.notificationCount}>
                {unreadCount > 9 ? '9+' : unreadCount}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Balance and Statistics */}
      <View style={styles.balanceSection}>
        <View>
          <Text style={styles.balanceLabel}>My Balance</Text>
          <TouchableOpacity onPress={toggleBalanceVisibility}>
            <Animated.View style={[styles.balanceContainer, { filter: `blur(${blurValue}px)` }]}>
              <Text style={styles.balance}>
                {isBalanceVisible ? `₦${parseFloat(balance).toLocaleString()}` : '******'}
              </Text>
            </Animated.View>
          </TouchableOpacity>
        </View>
        <TouchableOpacity style={styles.statisticsButton}>
          <MaterialIcons name="insights" size={18} color="#fff" />
          <Text style={styles.statisticsText}>Statistics</Text>
        </TouchableOpacity>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionButtonsContainer}>
        <View style={styles.actionButtonWrapper}>
          <TouchableOpacity
            style={styles.transferButton}
            onPress={() => navigation.navigate('Transfer')} >
            <Ionicons name="swap-horizontal" size={18} color="#fff" />
            <Text style={styles.actionButtonText}>Transfer</Text>
          </TouchableOpacity>
          <View style={styles.divider} />
          <TouchableOpacity style={styles.requestButton} onPress={() => navigation.navigate('Request')}>
            <Ionicons name="arrow-down-circle-outline" size={18} color="#fff" />
            <Text style={styles.actionButtonText}>Request</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Recent Transactions Section */}
      <View style={styles.recentTransactionsSection}>
        <TouchableOpacity style={styles.getPlanButton}>
          <Ionicons name="happy-outline" size={20} color="#fff" />
          <Text style={styles.getPlanText}>Get plan</Text>
        </TouchableOpacity>
        <View style={styles.recentHeader}>
          <Text style={styles.recentLabel}>Recent Transactions</Text>
        </View>
      </View>

      {/* Transactions List Container */}
      <FlatList
        data={transactions}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.transactionList}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#FFA500']}
            tintColor="#FFA500"
          />
        }
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => handleTransactionPress(item)}>
            <View style={styles.transactionItem}>
              <Ionicons
                name={item.type === 'incoming' ? 'arrow-down-circle' : 'arrow-up-circle'}
                size={30}
                color={item.type === 'incoming' ? '#4CAF50' : '#FF3B30'}
                style={styles.transactionIcon}
              />
              <View style={styles.transactionDetails}>
                <Text style={styles.transactionName}>{item.name}</Text>
                <Text style={styles.transactionDate}>{item.date}</Text>
              </View>
              <Text
                style={[styles.transactionAmount, item.amount.startsWith('-') ? styles.expense : styles.income]}
              >
                {item.amount}
              </Text>
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No transactions yet</Text>
            <Text style={styles.emptySubText}>Your transactions will appear here</Text>
          </View>
        )}
      />

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navButton}>
          <Ionicons name="home" size={24} color="#FFA500" /> {/* Orange for active */}
          <Text style={[styles.navButtonText, { color: '#FFA500' }]}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navButton}>
          <Ionicons name="receipt-outline" size={24} color="#BBBBBB" /> {/* Dull white */}
          <Text style={[styles.navButtonText, { color: '#BBBBBB' }]}>Bills</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navButton}>
          <Ionicons name="trophy-outline" size={24} color="#BBBBBB" /> {/* Dull white */}
          <Text style={[styles.navButtonText, { color: '#BBBBBB' }]}>Rewards</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navButton}>
          <Ionicons name="swap-horizontal-outline" size={24} color="#BBBBBB" /> {/* Dull white */}
          <Text style={[styles.navButtonText, { color: '#BBBBBB' }]}>Exchanges</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navButton}>
          <Ionicons name="person-outline" size={24} color="#BBBBBB" /> {/* Dull white */}
          <Text style={[styles.navButtonText, { color: '#BBBBBB' }]}>Profile</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1C1C1E',
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 55,
  },
  userSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 15,
  },
  greeting: {
    fontSize: 14,
    color: '#BBBBBB',
  },
  username: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  notificationButton: {
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: 'red',
    width: 16,
    height: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationCount: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  balanceSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 25,
  },
  balanceLabel: {
    fontSize: 14,
    color: '#BBBBBB',
  },
  balanceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  balance: {
    fontSize: 30,
    fontWeight: 'bold',
    color: 'white',
  },
  statisticsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2C2C2E',
    padding: 10,
    borderRadius: 8,
  },
  statisticsText: {
    color: '#FFFFFF',
    marginLeft: 5,
    fontSize: 14,
  },
  actionButtonsContainer: {
    marginBottom: 25,
  },
  actionButtonWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3A3A3C',
    borderRadius: 30,
    overflow: 'hidden',
    paddingVertical: 0.90,
  },
  transferButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
  },
  requestButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
  },
  divider: {
    width: 1,
    height: '60%',
    backgroundColor: '#fff',
    opacity: 0.5,
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    marginTop: 5,
  },
  recentTransactionsSection: {
    marginBottom: 25,
  },
  getPlanButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3A3A3C',
    padding: 15,
    borderRadius: 12,
    marginBottom: 20,
  },
  getPlanText: {
    color: '#FFFFFF',
    marginLeft: 10,
    fontSize: 14,
  },
  recentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  recentLabel: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  transactionList: {
    paddingBottom: 20,
  },
  transactionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  transactionIcon: {
    marginRight: 10,
  },
  transactionDetails: {
    flex: 1,
    justifyContent: 'center',
  },
  transactionName: {
    color: '#FFFFFF',
    fontSize: 14,
  },
  transactionDate: {
    color: '#AAAAAA',
    fontSize: 10,
  },
  transactionAmount: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  expense: {
    color: '#FF3B30',
  },
  income: {
    color: '#4CAF50',
  },
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
 
    bottom: 0,
    width: '100%',
    backgroundColor: '#1C1C1E',
    paddingVertical: 10,
  },
  navButton: {
    alignItems: 'center',
  },
  navButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    marginTop: 5,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  emptySubText: {
    color: '#BBBBBB',
    fontSize: 14,
  },
});
export default MainApp;