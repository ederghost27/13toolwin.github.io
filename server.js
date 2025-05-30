const express = require('express');
const multer = require('multer');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Configure multer for file uploads
const upload = multer({ dest: 'uploads/' });

// Database file path
const DB_PATH = path.join(__dirname, 'data', 'accounts.json');

// Ensure data directory exists
function ensureDataDir() {
  const dataDir = path.dirname(DB_PATH);
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
}

// Initialize empty database if it doesn't exist
function initializeDatabase() {
  return {
    tab1: [],
    tab2: [],
    tab3: [],
    tab4: []
  };
}

// Read database
function readDatabase() {
  ensureDataDir();

  if (!fs.existsSync(DB_PATH)) {
    const initialData = initializeDatabase();
    writeDatabase(initialData);
    return initialData;
  }

  try {
    const data = fs.readFileSync(DB_PATH, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading database:', error);
    return initializeDatabase();
  }
}

// Write database
function writeDatabase(data) {
  ensureDataDir();

  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error writing database:', error);
    throw error;
  }
}

// Parse account file
function parseAccountFile(fileContent) {
  console.log('Parsing file content, length:', fileContent.length);
  const accounts = [];
  const lines = fileContent.split('\n');

  let currentAccount = {};

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmedLine = line.trim();

    // Debug log
    if (trimmedLine.includes('Tài khoản:') || trimmedLine.includes('Mật khẩu:')) {
      console.log(`Line ${i}: "${trimmedLine}"`);
    }

    if (trimmedLine.includes('Tài khoản:')) {
      // Save previous account if exists
      if (currentAccount.username && currentAccount.password && currentAccount.fullName) {
        accounts.push({...currentAccount});
        console.log('Added account:', currentAccount.username);
      }

      // Start new account
      currentAccount = {};
      const username = trimmedLine.split('Tài khoản:')[1];
      if (username) {
        currentAccount.username = username.trim();
      }
    } else if (trimmedLine.includes('Mật khẩu:')) {
      const password = trimmedLine.split('Mật khẩu:')[1];
      if (password) {
        currentAccount.password = password.trim();
      }
    } else if (trimmedLine.includes('Họ tên:')) {
      const fullName = trimmedLine.split('Họ tên:')[1];
      if (fullName) {
        currentAccount.fullName = fullName.trim();
      }
    } else if (trimmedLine.includes('Trạng thái:')) {
      const status = trimmedLine.split('Trạng thái:')[1];
      if (status) {
        currentAccount.status = status.trim();
      }
    } else if (trimmedLine.includes('Thưởng:')) {
      const reward = trimmedLine.split('Thưởng:')[1];
      if (reward) {
        currentAccount.reward = reward.trim();
      }
    } else if (trimmedLine.includes('Thời gian:')) {
      const createdAt = trimmedLine.split('Thời gian:')[1];
      if (createdAt) {
        currentAccount.createdAt = createdAt.trim();
      }
    }
  }

  // Add the last account if exists and is complete
  if (currentAccount.username && currentAccount.password && currentAccount.fullName) {
    accounts.push({...currentAccount});
    console.log('Added final account:', currentAccount.username);
  }

  console.log('Total accounts parsed:', accounts.length);
  return accounts;
}

// API Routes

// Get accounts for a specific tab
app.get('/api/accounts', (req, res) => {
  try {
    const tab = req.query.tab || 'tab1';
    const data = readDatabase();
    const accounts = data[tab] || [];

    // Sort by createdAt desc
    accounts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.json(accounts);
  } catch (error) {
    console.error('Error fetching accounts:', error);
    res.status(500).json({ error: 'Failed to fetch accounts' });
  }
});

// Add account
app.post('/api/accounts', (req, res) => {
  try {
    const { tab, ...accountData } = req.body;
    const data = readDatabase();
    const tabData = data[tab] || [];

    const newId = tabData.length > 0 ? Math.max(...tabData.map(a => a.id)) + 1 : 1;
    const newAccount = {
      ...accountData,
      id: newId
    };

    data[tab] = [...tabData, newAccount];
    writeDatabase(data);

    res.json(newAccount);
  } catch (error) {
    console.error('Error creating account:', error);
    res.status(500).json({ error: 'Failed to create account' });
  }
});

// Update account
app.put('/api/accounts', (req, res) => {
  try {
    const { id, tab, ...accountData } = req.body;
    const data = readDatabase();
    const tabData = data[tab] || [];

    const accountIndex = tabData.findIndex(a => a.id === id);
    if (accountIndex === -1) {
      return res.status(404).json({ error: 'Account not found' });
    }

    const updatedAccount = { ...tabData[accountIndex], ...accountData };
    tabData[accountIndex] = updatedAccount;

    data[tab] = tabData;
    writeDatabase(data);

    res.json(updatedAccount);
  } catch (error) {
    console.error('Error updating account:', error);
    res.status(500).json({ error: 'Failed to update account' });
  }
});

// Delete account
app.delete('/api/accounts', (req, res) => {
  try {
    const id = parseInt(req.query.id);
    const tab = req.query.tab || 'tab1';
    const data = readDatabase();
    const tabData = data[tab] || [];

    const accountIndex = tabData.findIndex(a => a.id === id);
    if (accountIndex === -1) {
      return res.status(404).json({ error: 'Account not found' });
    }

    tabData.splice(accountIndex, 1);
    data[tab] = tabData;
    writeDatabase(data);

    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting account:', error);
    res.status(500).json({ error: 'Failed to delete account' });
  }
});

// Upload file
app.post('/api/upload', upload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file provided' });
    }

    const tab = req.body.tab;
    const fileContent = fs.readFileSync(req.file.path, 'utf8');
    const accounts = parseAccountFile(fileContent);

    if (accounts.length === 0) {
      return res.status(400).json({ error: 'No valid accounts found in file' });
    }

    const data = readDatabase();
    const tabData = data[tab] || [];

    let nextId = tabData.length > 0 ? Math.max(...tabData.map(a => a.id)) + 1 : 1;

    const newAccounts = accounts.map(account => ({
      ...account,
      id: nextId++,
      bankName: null,
      balance: 0, // Số dư ban đầu
      accountStatus: 'đang rãnh' // Trạng thái ban đầu
    }));

    data[tab] = [...tabData, ...newAccounts];
    writeDatabase(data);

    // Clean up uploaded file
    fs.unlinkSync(req.file.path);

    res.json({
      success: true,
      message: `Successfully imported ${newAccounts.length} accounts`,
      count: newAccounts.length
    });
  } catch (error) {
    console.error('Error uploading file:', error);
    res.status(500).json({
      error: 'Failed to upload file',
      details: error.message
    });
  }
});

// Health check endpoint for Render
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Server is running' });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});
