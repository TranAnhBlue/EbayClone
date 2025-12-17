# 🔍 Hướng Dẫn Kiểm Tra Lỗi Container Restart

## ❌ Vấn Đề: Container đang restart liên tục

Khi thấy lỗi: `Container is restarting, wait until the container is running`

→ Container đang crash và Docker tự động restart lại.

## 🔍 BƯỚC 1: Xem Logs Backend

Chạy lệnh này để xem lỗi chi tiết:

```powershell
docker-compose logs backend-1
```

Hoặc xem logs real-time:

```powershell
docker-compose logs -f backend-1
```

**Tìm các lỗi phổ biến:**
- `MongoDB connection error`
- `Cannot find module`
- `EADDRINUSE` (port đã được sử dụng)
- `ENOENT` (file không tồn tại)

## 🔍 BƯỚC 2: Kiểm Tra Trạng Thái Containers

```powershell
docker-compose ps
```

**Quan sát:**
- Status là gì? (Up, Restarting, Exited)
- Uptime có tăng không? (Nếu restart liên tục, uptime sẽ reset)

## 🔍 BƯỚC 3: Kiểm Tra File .env

Đảm bảo file `.env` có:

```env
MONGO_URI=mongodb://host.docker.internal:27017/shopii
```

**Kiểm tra:**
```powershell
# Xem nội dung file .env
cat .env
# Hoặc
Get-Content .env
```

## 🔍 BƯỚC 4: Kiểm Tra MongoDB Local

### Kiểm tra MongoDB đang chạy:

```powershell
# Kiểm tra port 27017
netstat -ano | findstr :27017
```

### Test kết nối MongoDB:

Mở MongoDB Compass và kết nối:
```
mongodb://127.0.0.1:27017/shopii
```

Nếu không kết nối được → MongoDB chưa chạy hoặc có vấn đề.

## 🔍 BƯỚC 5: Kiểm Tra Environment Variables Trong Container

```powershell
# Xem env vars của container (khi container đang chạy)
docker-compose exec backend-1 env | grep MONGO
```

Nếu container đang restart, dùng:

```powershell
# Xem env vars từ image
docker inspect ebayclone-backend-1 | findstr MONGO
```

## 🔍 BƯỚC 6: Test Kết Nối MongoDB Từ Container

Khi container đã chạy ổn định:

```powershell
# Vào container
docker-compose exec backend-1 sh

# Test kết nối (nếu có mongosh)
# Hoặc test bằng Node.js
node -e "const mongoose = require('mongoose'); mongoose.connect(process.env.MONGO_URI).then(() => console.log('OK')).catch(e => console.error(e))"
```

## 🛠️ CÁC LỖI THƯỜNG GẶP VÀ CÁCH SỬA

### Lỗi 1: "MongoDB connection error: connect ECONNREFUSED"

**Nguyên nhân:** Không kết nối được đến MongoDB

**Cách sửa:**
1. Kiểm tra MongoDB local đang chạy
2. Kiểm tra `MONGO_URI` trong `.env` đúng chưa
3. Thử đổi `host.docker.internal` thành IP thực của máy:
```powershell
# Tìm IP máy
ipconfig
# Tìm "IPv4 Address" (ví dụ: 192.168.1.100)
```

Sau đó sửa `.env`:
```env
MONGO_URI=mongodb://192.168.1.100:27017/shopii
```

### Lỗi 2: "Cannot find module"

**Nguyên nhân:** Thiếu dependencies trong container

**Cách sửa:**
```powershell
# Rebuild lại với --no-cache
docker-compose build --no-cache backend-1
docker-compose up -d backend-1
```

### Lỗi 3: "EADDRINUSE: address already in use"

**Nguyên nhân:** Port đã được sử dụng

**Cách sửa:**
```powershell
# Tìm process đang dùng port
netstat -ano | findstr :9999

# Kill process (thay PID)
taskkill /PID <PID> /F
```

### Lỗi 4: "MONGO_URI is not defined"

**Nguyên nhân:** Environment variable không được set

**Cách sửa:**
1. Kiểm tra file `.env` có `MONGO_URI` chưa
2. Đảm bảo file `.env` ở đúng thư mục (cùng với docker-compose.yml)
3. Restart containers:
```powershell
docker-compose down
docker-compose up -d --build
```

## 🔧 CÁCH SỬA NHANH

### Nếu lỗi về MongoDB connection:

1. **Kiểm tra MongoDB local:**
```powershell
# Mở MongoDB Compass
# Kết nối: mongodb://127.0.0.1:27017/shopii
```

2. **Cập nhật .env:**
```env
MONGO_URI=mongodb://host.docker.internal:27017/shopii
```

3. **Restart containers:**
```powershell
docker-compose restart backend-1 backend-2 backend-3
```

4. **Xem logs:**
```powershell
docker-compose logs -f backend-1
```

### Nếu vẫn lỗi, thử dùng IP thực:

1. **Tìm IP máy:**
```powershell
ipconfig
# Tìm "IPv4 Address"
```

2. **Sửa .env:**
```env
MONGO_URI=mongodb://<IP-CUA-BAN>:27017/shopii
# Ví dụ: MONGO_URI=mongodb://192.168.1.100:27017/shopii
```

3. **Restart:**
```powershell
docker-compose down
docker-compose up -d --build
```

## 📊 CHECKLIST KIỂM TRA

- [ ] MongoDB local đang chạy (kiểm tra trong Compass)
- [ ] File `.env` có `MONGO_URI=mongodb://host.docker.internal:27017/shopii`
- [ ] File `.env` ở đúng thư mục (cùng với docker-compose.yml)
- [ ] Đã xem logs: `docker-compose logs backend-1`
- [ ] Không có lỗi "Cannot find module"
- [ ] Không có lỗi "EADDRINUSE"
- [ ] MongoDB connection string đúng format

## 🚀 LỆNH TỔNG HỢP

```powershell
# 1. Xem logs
docker-compose logs backend-1

# 2. Xem trạng thái
docker-compose ps

# 3. Kiểm tra .env
Get-Content .env

# 4. Restart
docker-compose restart backend-1

# 5. Rebuild nếu cần
docker-compose up -d --build backend-1
```

---

**Chạy các lệnh trên và gửi kết quả logs cho tôi để tôi có thể giúp bạn sửa chính xác!**

