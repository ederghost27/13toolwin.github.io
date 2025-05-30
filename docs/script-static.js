// Global variables
let currentTab = 'tab1';
let accounts = [];
let isStaticVersion = true; // Static version uses localStorage

// DOM elements
const tabButtons = document.querySelectorAll('.tab-button');
const fileInput = document.getElementById('fileInput');
const uploadArea = document.getElementById('uploadArea');
const uploadContent = document.getElementById('uploadContent');
const uploadLoading = document.getElementById('uploadLoading');
const targetTab = document.getElementById('targetTab');
const loading = document.getElementById('loading');
const emptyState = document.getElementById('emptyState');
const accountsTable = document.getElementById('accountsTable');
const accountsBody = document.getElementById('accountsBody');
const tabTitle = document.getElementById('tabTitle');
const totalCount = document.getElementById('totalCount');

// Tab configuration
const tabConfig = {
    tab1: { name: 'Database 1', color: 'blue' },
    tab2: { name: 'Database 2', color: 'green' },
    tab3: { name: 'Database 3', color: 'purple' },
    tab4: { name: 'Database 4', color: 'orange' }
};

// LocalStorage functions for static version
function getLocalStorageData() {
    const data = localStorage.getItem('bankAccounts');
    return data ? JSON.parse(data) : {
        tab1: [],
        tab2: [],
        tab3: [],
        tab4: []
    };
}

function setLocalStorageData(data) {
    localStorage.setItem('bankAccounts', JSON.stringify(data));
}

function getAccountsByTab(tab) {
    const data = getLocalStorageData();
    return data[tab] || [];
}

function addMultipleAccounts(tab, newAccounts) {
    const data = getLocalStorageData();
    const tabData = data[tab] || [];

    let nextId = tabData.length > 0 ? Math.max(...tabData.map(a => a.id)) + 1 : 1;

    const accountsWithIds = newAccounts.map(account => ({
        ...account,
        id: nextId++,
        bankName: null,
        balance: 0,
        accountStatus: 'đang rãnh'
    }));

    data[tab] = [...tabData, ...accountsWithIds];
    setLocalStorageData(data);

    return accountsWithIds;
}

function updateAccount(tab, id, updates) {
    const data = getLocalStorageData();
    const tabData = data[tab] || [];

    const accountIndex = tabData.findIndex(a => a.id === id);
    if (accountIndex === -1) {
        return false;
    }

    tabData[accountIndex] = { ...tabData[accountIndex], ...updates };
    data[tab] = tabData;
    setLocalStorageData(data);

    return true;
}

function deleteAccountById(tab, id) {
    const data = getLocalStorageData();
    const tabData = data[tab] || [];

    const accountIndex = tabData.findIndex(a => a.id === id);
    if (accountIndex === -1) {
        return false;
    }

    tabData.splice(accountIndex, 1);
    data[tab] = tabData;
    setLocalStorageData(data);

    return true;
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

// Initialize app
document.addEventListener('DOMContentLoaded', function() {
    setupEventListeners();
    loadAccounts(currentTab);
});

// Setup event listeners
function setupEventListeners() {
    // Tab buttons
    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            const tab = this.dataset.tab;
            switchTab(tab);
        });
    });

    // File upload
    fileInput.addEventListener('change', handleFileSelect);

    // Drag and drop
    uploadArea.addEventListener('dragover', handleDragOver);
    uploadArea.addEventListener('dragleave', handleDragLeave);
    uploadArea.addEventListener('drop', handleDrop);
}

// Switch tab
function switchTab(tab) {
    currentTab = tab;

    // Update tab buttons
    tabButtons.forEach(button => {
        button.classList.remove('active');
        if (button.dataset.tab === tab) {
            button.classList.add('active');
            // Update button styles based on tab
            const config = tabConfig[tab];
            button.className = `tab-button active px-4 py-2 font-medium text-sm rounded-lg transition-colors bg-${config.color}-500 text-white`;
        } else {
            const config = tabConfig[button.dataset.tab];
            button.className = `tab-button px-4 py-2 font-medium text-sm rounded-lg transition-colors text-${config.color}-600 hover:bg-${config.color}-50`;
        }
    });

    // Update title
    tabTitle.textContent = `${tabConfig[tab].name} - Danh sách tài khoản`;

    // Load accounts for this tab
    loadAccounts(tab);
}

// Load accounts
function loadAccounts(tab) {
    showLoading();

    try {
        accounts = getAccountsByTab(tab);
        // Sort by createdAt desc
        accounts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        renderAccounts();
        updateTabCounts();
    } catch (error) {
        console.error('Error loading accounts:', error);
        showEmptyState();
    }
}

// Render accounts
function renderAccounts() {
    hideLoading();

    if (accounts.length === 0) {
        showEmptyState();
        return;
    }

    showAccountsTable();

    accountsBody.innerHTML = '';

    accounts.forEach((account, index) => {
        const row = createAccountRow(account, index + 1);
        accountsBody.appendChild(row);
    });

    totalCount.textContent = accounts.length;
}

// Create account row
function createAccountRow(account, index) {
    const row = document.createElement('tr');
    row.className = 'hover:bg-gray-50';

    const statusClass = account.status === 'Thành công'
        ? 'bg-green-100 text-green-800'
        : 'bg-red-100 text-red-800';

    // Account status styling
    const accountStatusClass = getAccountStatusClass(account.accountStatus || 'đang rãnh');

    // Balance formatting
    const balance = account.balance || 0;
    const balanceText = balance === 0 ? '0đ' : `${balance.toLocaleString('vi-VN')}đ`;

    const createdAt = formatDate(account.createdAt);

    row.innerHTML = `
        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${index}</td>
        <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${account.username}</td>
        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
            <div class="flex items-center space-x-2">
                <span class="font-mono password-field" data-password="${account.password}">••••••••</span>
                <button onclick="togglePassword(this)" class="text-gray-400 hover:text-gray-600">
                    <i class="fas fa-eye"></i>
                </button>
            </div>
        </td>
        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${account.fullName}</td>
        <td class="px-6 py-4 whitespace-nowrap">
            <span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full ${statusClass}">
                ${account.status}
            </span>
        </td>
        <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
            <span class="text-green-600">${balanceText}</span>
        </td>
        <td class="px-6 py-4 whitespace-nowrap">
            <span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full ${accountStatusClass}">
                ${account.accountStatus || 'đang rãnh'}
            </span>
        </td>
        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${account.reward}</td>
        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${account.bankName || '-'}</td>
        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${createdAt}</td>
        <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
            <div class="flex flex-wrap gap-1">
                <!-- Balance buttons -->
                <button onclick="updateBalance(${account.id}, 14000)" class="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded hover:bg-blue-200" title="Cập nhật số dư 14k">
                    14k
                </button>
                <button onclick="updateBalance(${account.id}, 48000)" class="text-xs bg-green-100 text-green-800 px-2 py-1 rounded hover:bg-green-200" title="Cập nhật số dư 48k">
                    48k
                </button>

                <!-- Status buttons -->
                <button onclick="updateAccountStatus(${account.id}, 'đang rãnh')" class="text-xs bg-green-100 text-green-800 px-2 py-1 rounded hover:bg-green-200" title="Đánh dấu đang rãnh">
                    <i class="fas fa-check"></i>
                </button>
                <button onclick="updateAccountStatus(${account.id}, 'đang sử dụng')" class="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded hover:bg-yellow-200" title="Đánh dấu đang sử dụng">
                    <i class="fas fa-play"></i>
                </button>
                <button onclick="updateAccountStatus(${account.id}, 'đã hủy')" class="text-xs bg-red-100 text-red-800 px-2 py-1 rounded hover:bg-red-200" title="Đánh dấu đã hủy">
                    <i class="fas fa-times"></i>
                </button>

                <!-- Edit/Delete buttons -->
                <button onclick="editAccount(${account.id})" class="text-blue-600 hover:text-blue-900" title="Chỉnh sửa">
                    <i class="fas fa-edit"></i>
                </button>
                <button onclick="deleteAccount(${account.id})" class="text-red-600 hover:text-red-900" title="Xóa">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </td>
    `;

    return row;
}

// Get account status styling
function getAccountStatusClass(status) {
    switch (status) {
        case 'đang rãnh':
            return 'bg-green-100 text-green-800';
        case 'đang sử dụng':
            return 'bg-yellow-100 text-yellow-800';
        case 'đã hủy':
            return 'bg-red-100 text-red-800';
        default:
            return 'bg-gray-100 text-gray-800';
    }
}

// Toggle password visibility
function togglePassword(button) {
    const passwordField = button.parentElement.querySelector('.password-field');
    const icon = button.querySelector('i');
    const password = passwordField.dataset.password;

    if (passwordField.textContent === '••••••••') {
        passwordField.textContent = password;
        icon.className = 'fas fa-eye-slash';
    } else {
        passwordField.textContent = '••••••••';
        icon.className = 'fas fa-eye';
    }
}

// Format date
function formatDate(dateString) {
    try {
        return new Date(dateString).toLocaleString('vi-VN');
    } catch {
        return dateString;
    }
}

// Update tab counts
function updateTabCounts() {
    for (const tab of ['tab1', 'tab2', 'tab3', 'tab4']) {
        const data = getAccountsByTab(tab);
        const countElement = document.getElementById(`count-${tab}`);
        if (countElement) {
            countElement.textContent = data.length;
        }
    }
}

// File upload handlers
function handleFileSelect(event) {
    const file = event.target.files[0];
    if (file) {
        uploadFile(file);
    }
}

function handleDragOver(event) {
    event.preventDefault();
    uploadArea.classList.add('dragover');
}

function handleDragLeave(event) {
    event.preventDefault();
    uploadArea.classList.remove('dragover');
}

function handleDrop(event) {
    event.preventDefault();
    uploadArea.classList.remove('dragover');

    const files = event.dataTransfer.files;
    if (files.length > 0) {
        uploadFile(files[0]);
    }
}

// Upload file (static version)
function uploadFile(file) {
    if (!file.name.endsWith('.txt')) {
        alert('Vui lòng chọn file .txt');
        return;
    }

    showUploadLoading();

    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const fileContent = e.target.result;
            const accounts = parseAccountFile(fileContent);

            if (accounts.length === 0) {
                alert('Không tìm thấy tài khoản hợp lệ trong file');
                return;
            }

            const results = addMultipleAccounts(targetTab.value, accounts);
            alert(`Thành công! Đã import ${results.length} tài khoản vào ${tabConfig[targetTab.value].name}`);

            // Refresh data if we're viewing the uploaded tab
            if (targetTab.value === currentTab) {
                loadAccounts(currentTab);
            } else {
                updateTabCounts();
            }
        } catch (error) {
            console.error('Error processing file:', error);
            alert('Có lỗi xảy ra khi xử lý file');
        } finally {
            hideUploadLoading();
            fileInput.value = '';
        }
    };

    reader.readAsText(file);
}

// Update account balance
function updateBalance(id, balance) {
    try {
        const success = updateAccount(currentTab, id, { balance: balance });
        if (success) {
            loadAccounts(currentTab);
            const balanceText = balance.toLocaleString('vi-VN');
            showToast(`Đã cập nhật số dư thành ${balanceText}đ`, 'success');
        } else {
            alert('Không tìm thấy tài khoản để cập nhật');
        }
    } catch (error) {
        console.error('Error updating balance:', error);
        alert('Có lỗi xảy ra khi cập nhật số dư');
    }
}

// Update account status
function updateAccountStatus(id, status) {
    try {
        const success = updateAccount(currentTab, id, { accountStatus: status });
        if (success) {
            loadAccounts(currentTab);
            showToast(`Đã cập nhật trạng thái thành "${status}"`, 'success');
        } else {
            alert('Không tìm thấy tài khoản để cập nhật');
        }
    } catch (error) {
        console.error('Error updating account status:', error);
        alert('Có lỗi xảy ra khi cập nhật trạng thái');
    }
}

// Edit account
function editAccount(id) {
    // TODO: Implement edit functionality
    console.log('Edit account:', id);
    alert('Tính năng chỉnh sửa sẽ được phát triển trong phiên bản tiếp theo');
}

// Delete account
function deleteAccount(id) {
    if (!confirm('Bạn có chắc chắn muốn xóa tài khoản này?')) {
        return;
    }

    try {
        const success = deleteAccountById(currentTab, id);
        if (success) {
            loadAccounts(currentTab);
            updateTabCounts();
            showToast('Đã xóa tài khoản thành công', 'success');
        } else {
            alert('Không tìm thấy tài khoản để xóa');
        }
    } catch (error) {
        console.error('Error deleting account:', error);
        alert('Có lỗi xảy ra khi xóa tài khoản');
    }
}

// UI state management
function showLoading() {
    loading.classList.remove('hidden');
    emptyState.classList.add('hidden');
    accountsTable.classList.add('hidden');
}

function hideLoading() {
    loading.classList.add('hidden');
}

function showEmptyState() {
    hideLoading();
    emptyState.classList.remove('hidden');
    accountsTable.classList.add('hidden');
    totalCount.textContent = '0';
}

function showAccountsTable() {
    hideLoading();
    emptyState.classList.add('hidden');
    accountsTable.classList.remove('hidden');
}

function showUploadLoading() {
    uploadContent.classList.add('hidden');
    uploadLoading.classList.remove('hidden');
}

function hideUploadLoading() {
    uploadContent.classList.remove('hidden');
    uploadLoading.classList.add('hidden');
}

// Show toast notification
function showToast(message, type = 'info') {
    // Remove existing toast
    const existingToast = document.querySelector('.toast-notification');
    if (existingToast) {
        existingToast.remove();
    }

    // Create toast element
    const toast = document.createElement('div');
    toast.className = `toast-notification fixed top-4 right-4 px-6 py-3 rounded-lg shadow-lg z-50 transition-all duration-300 transform translate-x-full`;

    // Set color based on type
    switch (type) {
        case 'success':
            toast.className += ' bg-green-500 text-white';
            break;
        case 'error':
            toast.className += ' bg-red-500 text-white';
            break;
        case 'warning':
            toast.className += ' bg-yellow-500 text-white';
            break;
        default:
            toast.className += ' bg-blue-500 text-white';
    }

    toast.innerHTML = `
        <div class="flex items-center space-x-2">
            <i class="fas fa-${type === 'success' ? 'check' : type === 'error' ? 'times' : 'info'}-circle"></i>
            <span>${message}</span>
        </div>
    `;

    // Add to page
    document.body.appendChild(toast);

    // Animate in
    setTimeout(() => {
        toast.classList.remove('translate-x-full');
    }, 100);

    // Auto remove after 3 seconds
    setTimeout(() => {
        toast.classList.add('translate-x-full');
        setTimeout(() => {
            if (toast.parentNode) {
                toast.remove();
            }
        }, 300);
    }, 3000);
}
