# 🔧 Sửa Lỗi: Frontend Docker Không Load Được Dữ Liệu

## 🔍 Vấn Đề

Khi chạy Docker, frontend bị lỗi:
- ❌ "Error loading categories"
- ❌ "Error loading products"

Nhưng khi chạy `npm start` trực tiếp thì không sao.

## 🎯 Nguyên Nhân

1. **Frontend build trong Docker** không nhận được `REACT_APP_API_URL` đúng cách
2. **Backend chưa kết nối được MongoDB** (có thể)
3. **API URL trong build** không đúng

## ✅ Đã Sửa

### 1. Sửa Dockerfile để nhận env var khi build

Đã cập nhật `front-end/Dockerfile` để nhận `REACT_APP_API_URL` khi build.

### 2. Sửa docker-compose.yml để pass env var vào build

Đã cập nhật `docker-compose.yml` để pass `REACT_APP_API_URL` vào build args.

## 🚀 Cách Sửa

### Bước 1: Kiểm tra file `.env`

Đảm bảo file `.env` ở thư mục gốc có:

```env
REACT_APP_API_URL=http://localhost/api
```

**Lưu ý:** 
- ✅ Đúng: `http://localhost/api` (cho Docker, qua Nginx)
- ❌ Sai: `http://localhost:9999/api` (sẽ không work vì backend không expose port 9999 ra ngoài)

### Bước 2: Kiểm tra Backend đã kết nối MongoDB

```powershell
docker-compose logs backend-1 | Select-String "MongoDB"
```

Tìm dòng: `MongoDB connected successfully`

Nếu không thấy → Backend chưa kết nối được MongoDB.

### Bước 3: Rebuild Frontend với cấu hình mới

```powershell
# Dừng containers
docker-compose down

# Rebuild frontend (và tất cả)
docker-compose up -d --build
```

Hoặc chỉ rebuild frontend:

```powershell
docker-compose build --no-cache frontend
docker-compose up -d frontend
```

### Bước 4: Kiểm tra lại

1. Mở trình duyệt: `http://localhost`
2. Mở Developer Tools (F12) → Console tab
3. Xem có lỗi gì không

**Lỗi thường gặp:**
- `Network Error` → Backend chưa chạy hoặc Nginx không route đúng
- `CORS error` → `CLIENT_URL` trong `.env` sai
- `404 Not Found` → API URL sai

## 🔍 Debug Chi Tiết

### 1. Kiểm tra Backend logs

```powershell
docker-compose logs -f backend-1
```

**Tìm:**
- ✅ `MongoDB connected successfully` → Backend OK
- ❌ `MongoDB connection error` → Backend chưa kết nối được

### 2. Kiểm tra Frontend build có đúng API URL không

```powershell
# Vào container frontend
docker-compose exec frontend sh

# Xem file build (nếu có thể)
# Hoặc kiểm tra network requests trong browser
```

### 3. Kiểm tra Browser Console

Mở `http://localhost` → F12 → Console

**Xem:**
- API requests đang gọi đến đâu?
- Có lỗi CORS không?
- Có lỗi 404 không?

### 4. Test API trực tiếp

```powershell
# Test API qua Nginx
Invoke-RestMethod -Uri "http://localhost/api/health"

# Test API trực tiếp backend (nếu expose port)
# Invoke-RestMethod -Uri "http://localhost:9999/api/health"
```

## 🛠️ Các Trường Hợp Cụ Thể

### Trường hợp 1: Backend chưa kết nối MongoDB

**Triệu chứng:** Logs backend có `MongoDB connection error`

**Cách sửa:**
1. Kiểm tra MongoDB local đang chạy
2. Kiểm tra `MONGO_URI` trong `.env`: `mongodb://host.docker.internal:27017/shopii`
3. Restart backend: `docker-compose restart backend-1 backend-2 backend-3`

### Trường hợp 2: Frontend gọi API sai URL

**Triệu chứng:** Browser console có lỗi `404` hoặc `Network Error`

**Cách sửa:**
1. Kiểm tra `REACT_APP_API_URL` trong `.env`: `http://localhost/api`
2. Rebuild frontend: `docker-compose build --no-cache frontend`
3. Restart: `docker-compose up -d frontend`

### Trường hợp 3: CORS Error

**Triệu chứng:** Browser console có lỗi CORS

**Cách sửa:**
1. Kiểm tra `CLIENT_URL` trong `.env`: `http://localhost:3000` (cho npm start) hoặc `http://localhost` (cho Docker)
2. Restart backend: `docker-compose restart backend-1 backend-2 backend-3`

## 📝 Checklist

- [ ] File `.env` có `REACT_APP_API_URL=http://localhost/api`
- [ ] File `.env` có `MONGO_URI=mongodb://host.docker.internal:27017/shopii`
- [ ] Backend logs có `MongoDB connected successfully`
- [ ] Đã rebuild frontend: `docker-compose build --no-cache frontend`
- [ ] Browser console không có lỗi đỏ
- [ ] API test thành công: `http://localhost/api/health`

## 🚀 Lệnh Nhanh

```powershell
# 1. Kiểm tra backend
docker-compose logs backend-1 | Select-String "MongoDB"

# 2. Rebuild frontend
docker-compose build --no-cache frontend
docker-compose up -d frontend

# 3. Kiểm tra tất cả
docker-compose ps

# 4. Test API
Invoke-RestMethod -Uri "http://localhost/api/health"
```

---

**Sau khi làm các bước trên, frontend sẽ load được dữ liệu!** ✅

