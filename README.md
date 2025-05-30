# 🏦 Quản lý tài khoản ngân hàng

Ứng dụng web quản lý tài khoản ngân hàng với 4 database riêng biệt và tính năng upload file.

## ✨ Tính năng

- 🗂️ **4 Tab Database riêng biệt**: Mỗi tab quản lý một database độc lập
- 📤 **Upload File**: Hỗ trợ upload file `.txt` với định dạng accounts_*.txt
- 👁️ **Hiển thị/Ẩn mật khẩu**: Click icon mắt để xem mật khẩu
- 🗑️ **Xóa tài khoản**: Xóa tài khoản với xác nhận
- 📊 **Thống kê**: Hiển thị số lượng tài khoản cho mỗi tab
- 🎨 **Giao diện đẹp**: Sử dụng Tailwind CSS và Font Awesome

## 🚀 Cách chạy

### 1. Chạy local với Node.js

```bash
# Cài đặt dependencies
npm install

# Chạy server
npm start
```

Truy cập: http://localhost:3000

### 2. Demo trên GitHub Pages

Truy cập: https://13toolwin.github.io

*Phiên bản demo sử dụng localStorage để lưu trữ dữ liệu*

### 3. Deploy lên các platform khác

#### Vercel
```bash
# Cài đặt Vercel CLI
npm i -g vercel

# Deploy
vercel
```

#### Heroku
```bash
# Tạo app Heroku
heroku create your-app-name

# Deploy
git push heroku main
```

#### Railway
```bash
# Cài đặt Railway CLI
npm install -g @railway/cli

# Login và deploy
railway login
railway init
railway up
```

## 📁 Cấu trúc dự án

```
📁 bank-account-manager/
├── 📄 server.js              # Express server
├── 📄 package.json           # Dependencies
├── 📁 public/                # Static files cho server
│   ├── 📄 index.html
│   └── 📄 script.js
├── 📁 docs/                  # Static files cho GitHub Pages
│   ├── 📄 index.html
│   └── 📄 script-static.js
├── 📁 data/                  # Database JSON
│   └── 📄 accounts.json
└── 📁 uploads/               # Thư mục tạm cho file upload
```

## 📝 Định dạng file upload

File `.txt` cần có định dạng như sau:

```
DANH SÁCH TÀI KHOẢN ĐĂNG KÝ
==================================================
------------------------------
6. Tài khoản: user1756
   Mật khẩu: tranhan1481
   Họ tên: TRAN HOANG AN
   Trạng thái: Thành công
   Thưởng: DKTK(20.0k)
   Thời gian: 2025-05-30 08:38:08
------------------------------
```

## 🛠️ Công nghệ sử dụng

- **Backend**: Node.js, Express.js
- **Frontend**: HTML, CSS, JavaScript
- **Styling**: Tailwind CSS
- **Icons**: Font Awesome
- **Database**: JSON file (server) / localStorage (static)
- **File Upload**: Multer

## 📱 Responsive Design

Ứng dụng được thiết kế responsive, hoạt động tốt trên:
- 💻 Desktop
- 📱 Mobile
- 📟 Tablet

## 🔒 Bảo mật

- Validation file upload
- Xác nhận trước khi xóa
- Sanitize input data

## 🤝 Đóng góp

1. Fork repository
2. Tạo branch mới (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Tạo Pull Request

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

## 📞 Liên hệ

- GitHub: [@13toolwin](https://github.com/13toolwin)
- Project Link: [https://github.com/13toolwin/13toolwin.github.io](https://github.com/13toolwin/13toolwin.github.io)
