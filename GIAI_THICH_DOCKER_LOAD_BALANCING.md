# 🔄 Giải Thích: Docker Load Balancing với 3 Backend Instances

## 🤔 Câu Hỏi: Làm Sao 3 Backend Chạy Cùng Lúc?

Khi chạy Docker, bạn có **3 backend containers chạy song song**, và **Nginx phân phối request** đến chúng.

---

## 🏗️ Kiến Trúc Khi Chạy Docker

```
                    ┌─────────────┐
                    │   Client     │
                    │ (Browser)    │
                    └──────┬──────┘
                           │
                           │ HTTP Request
                           │
                    ┌──────▼──────┐
                    │   Nginx     │  Port 80
                    │ (Load       │
                    │ Balancer)   │
                    └──────┬──────┘
                           │
        ┌──────────────────┼──────────────────┐
        │                  │                  │
        │ Request 1         │ Request 2        │ Request 3
        │                  │                  │
  ┌─────▼─────┐    ┌──────▼──────┐    ┌──────▼──────┐
  │ Backend-1 │    │  Backend-2   │    │  Backend-3  │
  │ :9999     │    │    :9999     │    │    :9999   │
  │           │    │              │    │            │
  └─────┬─────┘    └──────┬───────┘    └──────┬──────┘
        │                  │                  │
        └──────────────────┼──────────────────┘
                           │
                    ┌──────▼──────┐
                    │   MongoDB   │  Port 27017
                    │   (Local)   │
                    └─────────────┘
```

---

## 🔄 Cách Hoạt Động

### 1. Khi Client Gửi Request

**Ví dụ:** Client truy cập `http://localhost/api/products`

1. Request đến **Nginx** (Port 80)
2. Nginx xem có **3 backend** đang chạy
3. Nginx chọn **1 backend** (theo thuật toán least_conn)
4. Nginx forward request đến backend đó
5. Backend xử lý và trả response
6. Nginx trả response về client

### 2. Thuật Toán Load Balancing

Nginx sử dụng **least_conn** (least connections):

```nginx
upstream backend_servers {
    least_conn;  # Chọn backend có ít connections nhất
    server backend-1:9999;
    server backend-2:9999;
    server backend-3:9999;
}
```

**Ví dụ:**
- Request 1 → Backend-1 (0 connections)
- Request 2 → Backend-2 (0 connections)
- Request 3 → Backend-3 (0 connections)
- Request 4 → Backend-1 (1 connection, ít nhất)
- Request 5 → Backend-2 (1 connection, ít nhất)

### 3. Tất Cả Backend Dùng Chung MongoDB

```
Backend-1 ──┐
Backend-2 ──┼──→ MongoDB (127.0.0.1:27017/shopii)
Backend-3 ──┘
```

Tất cả 3 backend:
- ✅ Kết nối đến **cùng 1 MongoDB**
- ✅ Đọc/ghi **cùng 1 database** (`shopii`)
- ✅ Xem **cùng 1 dữ liệu**

---

## 🚀 Khi Chạy Docker Compose

### Lệnh:
```powershell
docker-compose up -d --build
```

### Điều Gì Xảy Ra:

1. **Docker tạo 3 backend containers:**
   - `ebayclone-backend-1` → Chạy trên port 9999 (nội bộ)
   - `ebayclone-backend-2` → Chạy trên port 9999 (nội bộ)
   - `ebayclone-backend-3` → Chạy trên port 9999 (nội bộ)

2. **Mỗi container là một process riêng:**
   - Backend-1: Process Node.js độc lập
   - Backend-2: Process Node.js độc lập
   - Backend-3: Process Node.js độc lập

3. **Nginx kết nối đến cả 3:**
   - Nginx biết địa chỉ của 3 backend trong Docker network
   - Khi có request, Nginx chọn 1 trong 3 để forward

4. **Tất cả kết nối MongoDB:**
   - Backend-1 → `mongodb://host.docker.internal:27017/shopii`
   - Backend-2 → `mongodb://host.docker.internal:27017/shopii`
   - Backend-3 → `mongodb://host.docker.internal:27017/shopii`

---

## 📊 Ví Dụ Thực Tế

### Scenario: 100 Users Truy Cập Cùng Lúc

**Không có Load Balancing (1 backend):**
```
100 requests → Backend-1
→ Backend-1 quá tải → Chậm/Crash
```

**Có Load Balancing (3 backends):**
```
100 requests → Nginx
→ Phân phối:
   - 33 requests → Backend-1
   - 33 requests → Backend-2
   - 34 requests → Backend-3
→ Mỗi backend chỉ xử lý ~33 requests → Nhanh hơn!
```

---

## 🔍 Kiểm Tra 3 Backend Đang Chạy

### Xem containers:
```powershell
docker-compose ps
```

**Kết quả:**
```
NAME                     STATUS
ebayclone-backend-1     Up (healthy)
ebayclone-backend-2     Up (healthy)
ebayclone-backend-3     Up (healthy)
```

### Xem logs từng backend:
```powershell
# Backend-1
docker-compose logs backend-1

# Backend-2
docker-compose logs backend-2

# Backend-3
docker-compose logs backend-3
```

### Test Load Balancing:

Chạy script test:
```powershell
.\test-load-balancing.ps1
```

Hoặc test thủ công:
```powershell
# Gửi 10 requests
for ($i=1; $i -le 10; $i++) {
    Invoke-RestMethod -Uri "http://localhost/api/health"
    Start-Sleep -Milliseconds 100
}
```

Mỗi request có thể được xử lý bởi backend khác nhau!

---

## ⚙️ Cấu Hình Chi Tiết

### 1. Docker Compose - 3 Backend Services

```yaml
backend-1:
  build: ./back-end
  container_name: ebayclone-backend-1
  environment:
    - MONGO_URI=mongodb://host.docker.internal:27017/shopii
  networks:
    - ebayclone-network

backend-2:
  build: ./back-end
  container_name: ebayclone-backend-2
  environment:
    - MONGO_URI=mongodb://host.docker.internal:27017/shopii
  networks:
    - ebayclone-network

backend-3:
  build: ./back-end
  container_name: ebayclone-backend-3
  environment:
    - MONGO_URI=mongodb://host.docker.internal:27017/shopii
  networks:
    - ebayclone-network
```

**Lưu ý:**
- Cả 3 dùng **cùng 1 code** (build từ `./back-end`)
- Cả 3 có **cùng environment variables**
- Cả 3 kết nối **cùng 1 MongoDB**

### 2. Nginx - Load Balancer

```nginx
upstream backend_servers {
    least_conn;
    server backend-1:9999 max_fails=3 fail_timeout=30s;
    server backend-2:9999 max_fails=3 fail_timeout=30s;
    server backend-3:9999 max_fails=3 fail_timeout=30s;
}

location /api {
    proxy_pass http://backend_servers;
}
```

**Giải thích:**
- `least_conn`: Chọn backend có ít connections nhất
- `max_fails=3`: Nếu backend fail 3 lần → tạm thời loại bỏ
- `fail_timeout=30s`: Sau 30s, thử lại backend đã fail

---

## 🆚 So Sánh: Docker vs npm start

### Chạy với Docker (3 backends):

```powershell
docker-compose up -d
```

**Kết quả:**
- ✅ 3 backend processes chạy song song
- ✅ Nginx phân phối request
- ✅ Có thể xử lý nhiều request cùng lúc
- ✅ Nếu 1 backend crash, 2 backend còn lại vẫn chạy
- ✅ Giống production environment

### Chạy với npm start (1 backend):

```powershell
cd back-end
npm start
```

**Kết quả:**
- ✅ Chỉ 1 backend process
- ❌ Không có load balancing
- ❌ Nếu backend crash → toàn bộ hệ thống dừng
- ✅ Dễ debug hơn
- ✅ Hot reload tự động

---

## 💡 Tại Sao Cần 3 Backends?

### 1. **High Availability (Tính Sẵn Sàng Cao)**
- Nếu Backend-1 crash → Backend-2 và Backend-3 vẫn chạy
- Hệ thống không bị dừng hoàn toàn

### 2. **Performance (Hiệu Suất)**
- Phân tán tải → Mỗi backend xử lý ít request hơn
- Response time nhanh hơn

### 3. **Scalability (Khả Năng Mở Rộng)**
- Có thể tăng lên 5, 10, 20 backends nếu cần
- Dễ dàng scale theo nhu cầu

### 4. **Production-Ready**
- Giống môi trường production thực tế
- Test được load balancing

---

## 🔧 Tùy Chỉnh Số Lượng Backends

### Tăng lên 5 backends:

1. **Sửa `docker-compose.yml`:**
```yaml
backend-4:
  build: ./back-end
  container_name: ebayclone-backend-4
  # ... (copy config từ backend-1)

backend-5:
  build: ./back-end
  container_name: ebayclone-backend-5
  # ... (copy config từ backend-1)
```

2. **Sửa `nginx/conf.d/default.conf`:**
```nginx
upstream backend_servers {
    least_conn;
    server backend-1:9999;
    server backend-2:9999;
    server backend-3:9999;
    server backend-4:9999;  # Thêm
    server backend-5:9999;  # Thêm
}
```

3. **Chạy lại:**
```powershell
docker-compose up -d --build
```

### Giảm xuống 1 backend:

1. **Comment backend-2 và backend-3** trong `docker-compose.yml`
2. **Sửa Nginx config** chỉ có backend-1
3. **Chạy lại**

---

## 🧪 Test Load Balancing

### Cách 1: Dùng Script

```powershell
.\test-load-balancing.ps1
```

### Cách 2: Test Thủ Công

Mở nhiều tab trình duyệt và truy cập:
```
http://localhost/api/health
```

Refresh nhiều lần, mỗi lần có thể được route đến backend khác nhau.

### Cách 3: Xem Logs

```powershell
# Xem logs của cả 3 backends
docker-compose logs -f backend-1 backend-2 backend-3
```

Gửi requests và xem logs → Mỗi backend sẽ nhận requests khác nhau.

---

## 📊 Monitoring

### Xem Resource Usage:

```powershell
docker stats
```

**Kết quả:**
```
CONTAINER           CPU %    MEM USAGE
ebayclone-backend-1  2.5%    150MB
ebayclone-backend-2  1.8%    145MB
ebayclone-backend-3  2.1%    148MB
```

### Xem Connections:

Mỗi backend sẽ có số connections khác nhau tùy theo load balancing.

---

## ✅ Tóm Tắt

**Khi chạy Docker với 3 backends:**

1. ✅ **3 containers chạy song song** (mỗi container là 1 process Node.js)
2. ✅ **Nginx phân phối request** đến 3 backends (theo thuật toán least_conn)
3. ✅ **Tất cả kết nối cùng 1 MongoDB** (đọc/ghi cùng database)
4. ✅ **Tự động failover** (nếu 1 backend crash, 2 backend còn lại vẫn chạy)
5. ✅ **Tăng hiệu suất** (phân tán tải)

**Khác với npm start:**
- npm start: Chỉ 1 backend process
- Docker: 3 backend processes + Nginx load balancer

---

**Đây là cách production systems thường hoạt động!** 🚀

