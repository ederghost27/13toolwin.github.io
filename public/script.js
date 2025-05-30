// Global variables
let currentTab = 'tab1';
let accounts = [];
let isStaticVersion = false; // Will be set to true in static version

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
async function loadAccounts(tab) {
    showLoading();

    try {
        const response = await fetch(`/api/accounts?tab=${tab}`);
        if (response.ok) {
            accounts = await response.json();
            renderAccounts();
            updateTabCounts();
        } else {
            console.error('Failed to load accounts, status:', response.status);
            const errorText = await response.text();
            console.error('Error response:', errorText);
            showEmptyState();
        }
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
async function updateTabCounts() {
    for (const tab of ['tab1', 'tab2', 'tab3', 'tab4']) {
        try {
            const response = await fetch(`/api/accounts?tab=${tab}`);
            if (response.ok) {
                const data = await response.json();
                const countElement = document.getElementById(`count-${tab}`);
                if (countElement) {
                    countElement.textContent = data.length;
                }
            }
        } catch (error) {
            console.error(`Error loading count for ${tab}:`, error);
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

// Upload file
async function uploadFile(file) {
    if (!file.name.endsWith('.txt')) {
        alert('Vui lòng chọn file .txt');
        return;
    }

    console.log('Uploading file:', file.name, 'Size:', file.size);
    showUploadLoading();

    const formData = new FormData();
    formData.append('file', file);
    formData.append('tab', targetTab.value);

    try {
        const response = await fetch('/api/upload', {
            method: 'POST',
            body: formData
        });

        const result = await response.json();
        console.log('Upload response:', result);

        if (response.ok) {
            alert(`Thành công! Đã import ${result.count} tài khoản vào ${tabConfig[targetTab.value].name}`);

            // Refresh data if we're viewing the uploaded tab
            if (targetTab.value === currentTab) {
                loadAccounts(currentTab);
            } else {
                updateTabCounts();
            }
        } else {
            console.error('Upload failed:', result);
            alert(`Lỗi: ${result.error}\nChi tiết: ${result.details || 'Không có thông tin chi tiết'}`);
        }
    } catch (error) {
        console.error('Error uploading file:', error);
        alert('Có lỗi xảy ra khi upload file: ' + error.message);
    } finally {
        hideUploadLoading();
        fileInput.value = '';
    }
}

// Edit account
function editAccount(id) {
    // TODO: Implement edit functionality
    console.log('Edit account:', id);
    alert('Tính năng chỉnh sửa sẽ được phát triển trong phiên bản tiếp theo');
}

// Update account balance
async function updateBalance(id, balance) {
    try {
        const response = await fetch('/api/accounts', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                id: id,
                tab: currentTab,
                balance: balance
            })
        });

        if (response.ok) {
            loadAccounts(currentTab);
            // Show success message
            const balanceText = balance.toLocaleString('vi-VN');
            showToast(`Đã cập nhật số dư thành ${balanceText}đ`, 'success');
        } else {
            alert('Có lỗi xảy ra khi cập nhật số dư');
        }
    } catch (error) {
        console.error('Error updating balance:', error);
        alert('Có lỗi xảy ra khi cập nhật số dư');
    }
}

// Update account status
async function updateAccountStatus(id, status) {
    try {
        const response = await fetch('/api/accounts', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                id: id,
                tab: currentTab,
                accountStatus: status
            })
        });

        if (response.ok) {
            loadAccounts(currentTab);
            // Show success message
            showToast(`Đã cập nhật trạng thái thành "${status}"`, 'success');
        } else {
            alert('Có lỗi xảy ra khi cập nhật trạng thái');
        }
    } catch (error) {
        console.error('Error updating account status:', error);
        alert('Có lỗi xảy ra khi cập nhật trạng thái');
    }
}

// Delete account
async function deleteAccount(id) {
    if (!confirm('Bạn có chắc chắn muốn xóa tài khoản này?')) {
        return;
    }

    try {
        const response = await fetch(`/api/accounts?id=${id}&tab=${currentTab}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            loadAccounts(currentTab);
            updateTabCounts();
            showToast('Đã xóa tài khoản thành công', 'success');
        } else {
            alert('Có lỗi xảy ra khi xóa tài khoản');
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
