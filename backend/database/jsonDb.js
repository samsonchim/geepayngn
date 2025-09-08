const fs = require('fs').promises;
const path = require('path');

class JsonDatabase {
    constructor() {
        this.dataPath = path.join(__dirname, 'data.json');
        this.data = null;
    }

    async loadData() {
        try {
            const rawData = await fs.readFile(this.dataPath, 'utf8');
            this.data = JSON.parse(rawData);
        } catch (error) {
            console.error('Error loading JSON database:', error);
            this.data = { users: [], transactions: [], notifications: [], banks: [] };
        }
    }

    async saveData() {
        try {
            await fs.writeFile(this.dataPath, JSON.stringify(this.data, null, 2));
        } catch (error) {
            console.error('Error saving JSON database:', error);
            throw error;
        }
    }

    // Users methods
    async findUserByEmail(email) {
        if (!this.data) await this.loadData();
        return this.data.users.find(user => user.email === email);
    }

    async findUserById(id) {
        if (!this.data) await this.loadData();
        return this.data.users.find(user => user.id === parseInt(id));
    }

    async createUser(userData) {
        if (!this.data) await this.loadData();
        const newId = Math.max(...this.data.users.map(u => u.id), 0) + 1;
        const newUser = {
            id: newId,
            ...userData,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };
        this.data.users.push(newUser);
        await this.saveData();
        return newUser;
    }

    async updateUser(id, updates) {
        if (!this.data) await this.loadData();
        const userIndex = this.data.users.findIndex(user => user.id === parseInt(id));
        if (userIndex === -1) return null;
        
        this.data.users[userIndex] = {
            ...this.data.users[userIndex],
            ...updates,
            updated_at: new Date().toISOString()
        };
        await this.saveData();
        return this.data.users[userIndex];
    }

    // Transactions methods
    async getUserTransactions(userId, limit = 50) {
        if (!this.data) await this.loadData();
        return this.data.transactions
            .filter(tx => tx.sender_id === parseInt(userId) || tx.receiver_id === parseInt(userId))
            .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
            .slice(0, limit);
    }

    async createTransaction(txData) {
        if (!this.data) await this.loadData();
        const newId = Math.max(...this.data.transactions.map(tx => tx.id), 0) + 1;
        const newTransaction = {
            id: newId,
            transaction_id: `TXN_${newId}_${new Date().getFullYear()}`,
            ...txData,
            created_at: new Date().toISOString()
        };
        this.data.transactions.push(newTransaction);
        await this.saveData();
        return newTransaction;
    }

    async findTransactionById(txId) {
        if (!this.data) await this.loadData();
        return this.data.transactions.find(tx => tx.transaction_id === txId);
    }

    // Notifications methods
    async getUserNotifications(userId) {
        if (!this.data) await this.loadData();
        return this.data.notifications
            .filter(notif => notif.user_id === parseInt(userId))
            .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    }

    async createNotification(notifData) {
        if (!this.data) await this.loadData();
        const newId = Math.max(...this.data.notifications.map(n => n.id), 0) + 1;
        const newNotification = {
            id: newId,
            ...notifData,
            created_at: new Date().toISOString()
        };
        this.data.notifications.push(newNotification);
        await this.saveData();
        return newNotification;
    }

    async markNotificationRead(id) {
        if (!this.data) await this.loadData();
        const notifIndex = this.data.notifications.findIndex(n => n.id === parseInt(id));
        if (notifIndex === -1) return null;
        
        this.data.notifications[notifIndex].is_read = true;
        await this.saveData();
        return this.data.notifications[notifIndex];
    }

    // Banks methods
    async getAllBanks() {
        if (!this.data) await this.loadData();
        return this.data.banks;
    }

    async findBankByCode(bankCode) {
        if (!this.data) await this.loadData();
        return this.data.banks.find(bank => bank.bank_code === bankCode);
    }

    // Balance operations
    async updateUserBalance(userId, newBalance) {
        if (!this.data) await this.loadData();
        const userIndex = this.data.users.findIndex(user => user.id === parseInt(userId));
        if (userIndex === -1) return null;
        
        this.data.users[userIndex].account_balance = parseFloat(newBalance);
        this.data.users[userIndex].updated_at = new Date().toISOString();
        await this.saveData();
        return this.data.users[userIndex];
    }

    async transferMoney(senderId, receiverId, amount, description, recipientName) {
        if (!this.data) await this.loadData();
        
        const sender = this.data.users.find(u => u.id === parseInt(senderId));
        if (!sender || sender.account_balance < amount) {
            throw new Error('Insufficient balance');
        }

        // Update sender balance
        sender.account_balance -= amount;
        sender.updated_at = new Date().toISOString();

        // If receiver exists in our system, update their balance
        if (receiverId) {
            const receiver = this.data.users.find(u => u.id === parseInt(receiverId));
            if (receiver) {
                receiver.account_balance += amount;
                receiver.updated_at = new Date().toISOString();
            }
        }

        // Create transaction record
        const transaction = await this.createTransaction({
            sender_id: parseInt(senderId),
            receiver_id: receiverId ? parseInt(receiverId) : null,
            transaction_type: 'transfer',
            amount: amount,
            total_amount: amount,
            status: 'completed',
            description: description,
            recipient_name: recipientName,
            completed_at: new Date().toISOString()
        });

        await this.saveData();
        return transaction;
    }
}

module.exports = new JsonDatabase();
