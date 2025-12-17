# 🚀 Quick Start Guide - Docker Setup

Hướng dẫn nhanh để chạy hệ thống với Docker và Load Balancing.

## ⚡ Bước 1: Tạo file .env

Tạo file `.env` ở thư mục gốc với nội dung:

```env
# MongoDB
MONGO_ROOT_USERNAME=admin
MONGO_ROOT_PASSWORD=password123

# JWT Secret (QUAN TRỌNG!)
JWT_SECRET=your-super-secret-jwt-key-min-32-characters-change-this

# URLs - QUAN TRỌNG: Phải có PORT trong URL!
CLIENT_URL=http://localhost:3000
BASE_URL=http://localhost:9999
REACT_APP_API_URL=http://localhost:9999/api

# Email (tùy chọn)
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# Cloudinary (tùy chọn)
CLOUDINARY_URL=cloudinary://api_key:api_secret@cloud_name

# GHN Shipping (tùy chọn)
GHN_TOKEN=your-ghn-token
GHN_SHOP_ID=your-ghn-shop-id

# PayPal (tùy chọn)
PAYPAL_CLIENT_ID=your-paypal-client-id
PAYPAL_CLIENT_SECRET=your-paypal-client-secret
PAYPAL_MODE=sandbox
```

## 🐳 Bước 2: Chạy Docker Compose

```bash
# Build và start tất cả services
docker-compose up -d --build

# Xem logs
docker-compose logs -f
```

## ✅ Bước 3: Kiểm tra

Mở trình duyệt:
- **Frontend**: http://localhost
- **API Health**: http://localhost/api/health
- **Nginx Health**: http://localhost/health

## 🧪 Bước 4: Test Load Balancing

**Windows:**
```powershell
.\test-load-balancing.ps1
```

**Linux/Mac:**
```bash
chmod +x test-load-balancing.sh
./test-load-balancing.sh
```

## 📊 Kiến trúc

```
Client → Nginx (Port 80) → [Backend-1, Backend-2, Backend-3] → MongoDB
                          ↓
                       Frontend
```

- **3 Backend instances** được load balance bởi Nginx
- **Nginx** làm reverse proxy và load balancer
- **MongoDB** lưu trữ dữ liệu

## 🔧 Lệnh thường dùng

```bash
# Start
docker-compose up -d

# Stop
docker-compose stop

# Stop và xóa
docker-compose down

# Xem logs
docker-compose logs -f [service-name]

# Rebuild
docker-compose up -d --build
```

## ❓ Troubleshooting

**Containers không start?**
```bash
docker-compose logs
docker-compose down -v
docker-compose up -d --build
```

**Backend không kết nối MongoDB?**
- Kiểm tra MongoDB đã start: `docker-compose ps mongodb`
- Kiểm tra connection string trong `.env`

**Port 80 đã được sử dụng?**
- Đổi port trong `docker-compose.yml`: `"8080:80"` thay vì `"80:80"`

Xem chi tiết trong file `DOCKER_SETUP.md`

