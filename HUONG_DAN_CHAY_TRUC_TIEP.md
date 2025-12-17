# 🚀 Hướng Dẫn Chạy Front-end và Back-end Trực Tiếp (Không Docker)

## 📋 Tổng Quan

Bạn có **2 cách** chạy hệ thống:

1. **Docker** (đã setup) - Tất cả trong containers
2. **Trực tiếp** (npm start) - Chạy trên máy local

## ⚠️ Lưu Ý Quan Trọng

### Khi chạy trực tiếp (npm start):
- ✅ **Không cần Docker** (có thể tắt Docker Desktop)
- ✅ **MongoDB local** phải đang chạy
- ✅ **Port 3000** (frontend) và **Port 9999** (backend) phải trống
- ✅ **File .env** phải có đúng cấu hình

---

## 🔧 BƯỚC 1: Chuẩn Bị

### 1.1. Kiểm tra MongoDB Local đang chạy

Mở MongoDB Compass và kết nối:
```
mongodb://127.0.0.1:27017/shopii
```

Nếu kết nối được → ✅ MongoDB đang chạy

### 1.2. Kiểm tra Ports trống

```powershell
# Kiểm tra port 3000 (frontend)
netstat -ano | findstr :3000

# Kiểm tra port 9999 (backend)
netstat -ano | findstr :9999
```

Nếu không thấy output → ✅ Ports trống

### 1.3. Cập nhật file `.env` trong back-end

Tạo hoặc sửa file `back-end/.env`:

```env
# MongoDB (kết nối trực tiếp, không cần host.docker.internal)
MONGO_URI=mongodb://127.0.0.1:27017/shopii

# JWT Secret
JWT_SECRET=your-secret-key-min-32-characters-change-this

# URLs - QUAN TRỌNG: Phải có PORT trong URL!
CLIENT_URL=http://localhost:3000
BASE_URL=http://localhost:9999

# Optional
EMAIL_USER=
EMAIL_PASS=
CLOUDINARY_URL=
GHN_TOKEN=
GHN_SHOP_ID=
PAYPAL_CLIENT_ID=
PAYPAL_CLIENT_SECRET=
PAYPAL_MODE=sandbox
```

**Lưu Ý QUAN TRỌNG:** 
- ⚠️ **PHẢI có PORT trong URL!** 
  - ❌ SAI: `http://localhost` 
  - ✅ ĐÚNG: `http://localhost:3000` hoặc `http://localhost:9999`
- `MONGO_URI` dùng `127.0.0.1` thay vì `host.docker.internal`
- `CLIENT_URL` là `http://localhost:3000` (port của React dev server)
- `BASE_URL` là `http://localhost:9999` (port của backend)

### 1.4. Cập nhật file `.env` trong front-end (nếu có)

Tạo file `front-end/.env`:

```env
REACT_APP_API_URL=http://localhost:9999/api
```

---

## 🖥️ BƯỚC 2: Chạy Back-end

### 2.1. Mở Terminal 1 (cho Backend)

```powershell
# Di chuyển đến thư mục back-end
cd C:\Users\hoang\Desktop\EbayClone\back-end

# Cài đặt dependencies (chỉ lần đầu)
npm install

# Chạy backend
npm start
```

**Hoặc nếu muốn auto-reload khi code thay đổi:**
```powershell
npm run dev
```

### 2.2. Kiểm tra Backend đã chạy

Bạn sẽ thấy:
```
Connecting to MongoDB...
MongoDB connected successfully
Server is running at PORT 9999
WebSocket server is running
```

✅ Nếu thấy các dòng này → Backend đã chạy thành công!

**Test:** Mở trình duyệt: `http://localhost:9999/api/health`
- Phải thấy: `{"status":"ok",...}`

---

## 🎨 BƯỚC 3: Chạy Front-end

### 3.1. Mở Terminal 2 (cho Frontend)

**Mở terminal mới** (giữ Terminal 1 chạy backend):

```powershell
# Di chuyển đến thư mục front-end
cd C:\Users\hoang\Desktop\EbayClone\front-end

# Cài đặt dependencies (chỉ lần đầu)
npm install

# Chạy frontend
npm start
```

### 3.2. Kiểm tra Frontend đã chạy

Bạn sẽ thấy:
```
Compiled successfully!

You can now view orebishop in the browser.

  Local:            http://localhost:3000
  On Your Network:  http://192.168.x.x:3000
```

✅ Trình duyệt sẽ tự động mở `http://localhost:3000`

---

## 📊 Tóm Tắt

### Terminal 1 (Backend):
```powershell
cd back-end
npm start
# Hoặc: npm run dev (với nodemon)
```

### Terminal 2 (Frontend):
```powershell
cd front-end
npm start
```

### Kết quả:
- **Backend:** `http://localhost:9999`
- **Frontend:** `http://localhost:3000`
- **API:** `http://localhost:9999/api`

---

## ⚠️ Lưu Ý Quan Trọng

### 1. MongoDB Connection

**Khi chạy trực tiếp:**
- Dùng: `mongodb://127.0.0.1:27017/shopii`
- **KHÔNG** dùng: `mongodb://host.docker.internal:27017/shopii`

### 2. CORS Configuration

Backend đã cấu hình CORS cho `http://localhost:3000`, nên không cần sửa gì.

### 3. Environment Variables

- **Backend:** File `.env` ở `back-end/.env`
- **Frontend:** File `.env` ở `front-end/.env` (nếu cần)

### 4. Ports

- **Backend:** Port 9999 (có thể đổi trong `back-end/.env`)
- **Frontend:** Port 3000 (React mặc định)

### 5. Hot Reload

- **Backend:** Dùng `npm run dev` (nodemon) để auto-reload
- **Frontend:** `npm start` tự động có hot reload

---

## 🔄 So Sánh: Docker vs Trực Tiếp

| Tính năng | Docker | Trực tiếp (npm start) |
|-----------|--------|----------------------|
| **Setup** | Phức tạp hơn | Đơn giản hơn |
| **Load Balancing** | ✅ Có (3 backend instances) | ❌ Không |
| **Nginx** | ✅ Có | ❌ Không |
| **Hot Reload** | ❌ Cần rebuild | ✅ Tự động |
| **Debugging** | Khó hơn | Dễ hơn |
| **Production-like** | ✅ Giống production | ❌ Khác production |
| **Resource** | Nhiều hơn | Ít hơn |

---

## 🐛 Troubleshooting

### Lỗi: "Port 3000 already in use"

**Cách sửa:**
```powershell
# Tìm process đang dùng port 3000
netstat -ano | findstr :3000

# Kill process (thay PID)
taskkill /PID <PID> /F
```

Hoặc đổi port frontend trong `front-end/.env`:
```env
PORT=3001
```

### Lỗi: "Port 9999 already in use"

**Cách sửa:**
```powershell
# Tìm process
netstat -ano | findstr :9999

# Kill process
taskkill /PID <PID> /F
```

Hoặc đổi port backend trong `back-end/.env`:
```env
PORT=9998
```

### Lỗi: "Cannot connect to MongoDB"

**Kiểm tra:**
1. MongoDB đang chạy chưa? (Mở MongoDB Compass)
2. `MONGO_URI` trong `back-end/.env` đúng chưa?
3. MongoDB có authentication không? (nếu có, thêm username:password)

### Lỗi: "Module not found"

**Cách sửa:**
```powershell
# Cài lại dependencies
cd back-end
npm install

cd ../front-end
npm install
```

---

## ✅ Checklist

Trước khi chạy `npm start`:

- [ ] MongoDB local đang chạy
- [ ] File `back-end/.env` có `MONGO_URI=mongodb://127.0.0.1:27017/shopii`
- [ ] File `back-end/.env` có `CLIENT_URL=http://localhost:3000`
- [ ] File `back-end/.env` có `BASE_URL=http://localhost:9999`
- [ ] File `front-end/.env` có `REACT_APP_API_URL=http://localhost:9999/api` (nếu cần)
- [ ] Port 3000 và 9999 trống
- [ ] Đã chạy `npm install` ở cả 2 thư mục

---

## 🎯 Tóm Tắt Lệnh

### Chạy Backend:
```powershell
cd back-end
npm install  # Chỉ lần đầu
npm start    # Hoặc npm run dev
```

### Chạy Frontend:
```powershell
cd front-end
npm install  # Chỉ lần đầu
npm start
```

### Dừng:
- Nhấn `Ctrl + C` trong mỗi terminal

---

## 💡 Tips

1. **Development:** Nên dùng `npm start` vì dễ debug và hot reload
2. **Testing Load Balancing:** Phải dùng Docker
3. **Production:** Nên dùng Docker
4. **Có thể chạy cả 2:** Docker cho một số services, npm start cho services khác (nhưng phức tạp)

---

**Chúc bạn thành công!** 🎉

