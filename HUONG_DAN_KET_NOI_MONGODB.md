# 🔌 Hướng Dẫn Kết Nối MongoDB Local với Docker Containers

## 📋 Vấn Đề

Bạn có MongoDB đang chạy local ở `mongodb://127.0.0.1:27017/shopii` với dữ liệu sẵn, nhưng backend containers trong Docker không thể kết nối được vì:
- Docker containers có network riêng
- `127.0.0.1` trong container là chính container đó, không phải máy host
- Cần sử dụng `host.docker.internal` để kết nối đến localhost từ container

## ✅ Giải Pháp

Đã cập nhật `docker-compose.yml` để:
1. Sử dụng `host.docker.internal` thay vì `mongodb:27017`
2. Thêm `extra_hosts` để containers có thể truy cập host machine
3. Loại bỏ dependency vào MongoDB container (vì dùng MongoDB local)

## 🔧 Cấu Hình

### 1. Cập nhật file `.env`

Thêm dòng này vào file `.env`:

```env
MONGO_URI=mongodb://host.docker.internal:27017/shopii
```

**Hoặc** nếu MongoDB của bạn có authentication:

```env
MONGO_URI=mongodb://username:password@host.docker.internal:27017/shopii?authSource=admin
```

### 2. Kiểm tra MongoDB Local đang chạy

**Cách 1: Kiểm tra trong MongoDB Compass**
- Mở MongoDB Compass
- Kết nối đến: `mongodb://127.0.0.1:27017/shopii`
- Nếu kết nối được → MongoDB đang chạy ✅

**Cách 2: Kiểm tra bằng PowerShell**
```powershell
# Kiểm tra port 27017 có đang được sử dụng không
netstat -ano | findstr :27017
```

Nếu thấy output → MongoDB đang chạy ✅

**Cách 3: Kiểm tra service**
```powershell
# Xem MongoDB service
Get-Service | Where-Object {$_.Name -like "*mongo*"}
```

### 3. Đảm bảo MongoDB cho phép kết nối từ bên ngoài

MongoDB mặc định chỉ bind đến `127.0.0.1`, cần kiểm tra:

**Nếu MongoDB chạy như service:**
- Mặc định đã có thể kết nối từ Docker containers
- Nếu không, cần sửa file config MongoDB

**Nếu MongoDB chạy thủ công:**
- Đảm bảo bind IP là `0.0.0.0` hoặc `127.0.0.1`
- Port 27017 phải accessible

### 4. Restart Docker Containers

Sau khi cập nhật `.env`:

```powershell
# Dừng containers
docker-compose down

# Khởi động lại với cấu hình mới
docker-compose up -d --build
```

### 5. Kiểm tra kết nối

**Xem logs backend:**
```powershell
docker-compose logs backend-1
```

**Tìm dòng:**
```
MongoDB connected successfully
```

Nếu thấy dòng này → ✅ Kết nối thành công!

Nếu thấy lỗi → Xem phần Troubleshooting bên dưới

## 🧪 Test Kết Nối

### Test từ container đến MongoDB local

```powershell
# Vào trong container backend-1
docker-compose exec backend-1 sh

# Test kết nối (nếu có mongosh trong container)
# Hoặc test bằng Node.js
node -e "const mongoose = require('mongoose'); mongoose.connect('mongodb://host.docker.internal:27017/shopii').then(() => console.log('Connected!')).catch(e => console.error(e))"
```

### Test từ PowerShell đến MongoDB local

```powershell
# Test kết nối MongoDB
mongosh mongodb://127.0.0.1:27017/shopii
```

Nếu kết nối được → MongoDB local đang chạy ✅

## ❌ Troubleshooting

### Lỗi 1: "MongoServerError: connect ECONNREFUSED"

**Nguyên nhân:** MongoDB local chưa chạy hoặc không accessible

**Cách sửa:**
1. Kiểm tra MongoDB đang chạy:
```powershell
netstat -ano | findstr :27017
```

2. Nếu không thấy, khởi động MongoDB:
   - Mở MongoDB Compass và kết nối
   - Hoặc start MongoDB service:
```powershell
net start MongoDB
```

3. Kiểm tra firewall không block port 27017

### Lỗi 2: "MongoServerError: Authentication failed"

**Nguyên nhân:** MongoDB có authentication nhưng connection string không đúng

**Cách sửa:**
1. Kiểm tra MongoDB có authentication không
2. Cập nhật `MONGO_URI` trong `.env`:
```env
MONGO_URI=mongodb://username:password@host.docker.internal:27017/shopii?authSource=admin
```

### Lỗi 3: "host.docker.internal: unknown host"

**Nguyên nhân:** `host.docker.internal` không hoạt động (hiếm gặp trên Windows)

**Cách sửa:**
1. Tìm IP của host machine:
```powershell
ipconfig
```
Tìm "IPv4 Address" (ví dụ: `192.168.1.100`)

2. Sửa `MONGO_URI` trong `.env`:
```env
MONGO_URI=mongodb://192.168.1.100:27017/shopii
```
(Thay `192.168.1.100` bằng IP thực của bạn)

### Lỗi 4: "Cannot connect to MongoDB from container"

**Nguyên nhân:** MongoDB chỉ bind đến `127.0.0.1` và không cho phép remote connections

**Cách sửa:**
1. Tìm file config MongoDB (thường ở `C:\Program Files\MongoDB\Server\7.0\bin\mongod.cfg`)
2. Sửa `net.bindIp` thành `0.0.0.0`:
```yaml
net:
  bindIp: 0.0.0.0
  port: 27017
```
3. Restart MongoDB service

**Lưu ý:** Chỉ làm nếu bạn chắc chắn về bảo mật!

## 🔄 Tùy Chọn: Tắt MongoDB Container

Nếu bạn chỉ dùng MongoDB local, có thể comment MongoDB service trong `docker-compose.yml`:

```yaml
# MongoDB Database (Commented out - using local MongoDB)
# mongodb:
#   image: mongo:7.0
#   ...
```

Sau đó xóa `depends_on: mongodb` trong các backend services (đã làm rồi).

## 📊 Kiểm Tra Dữ Liệu

Sau khi kết nối thành công, kiểm tra dữ liệu:

1. **Từ MongoDB Compass:**
   - Kết nối: `mongodb://127.0.0.1:27017/shopii`
   - Xem collections và documents

2. **Từ Backend API:**
   - Truy cập: `http://localhost/api/products`
   - Phải thấy danh sách products từ database

3. **Từ Frontend:**
   - Truy cập: `http://localhost`
   - Không còn lỗi "Error loading categories" và "Error loading products"

## ✅ Checklist

- [ ] MongoDB local đang chạy (kiểm tra trong Compass)
- [ ] File `.env` có `MONGO_URI=mongodb://host.docker.internal:27017/shopii`
- [ ] Đã restart containers: `docker-compose down && docker-compose up -d --build`
- [ ] Logs backend hiển thị: "MongoDB connected successfully"
- [ ] Frontend load được dữ liệu (không còn lỗi)

---

**Sau khi làm xong các bước trên, backend sẽ kết nối được đến MongoDB local và load được dữ liệu!** 🎉

