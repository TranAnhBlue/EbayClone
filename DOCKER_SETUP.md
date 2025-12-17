# 🐳 Docker Setup Guide - EbayClone với Load Balancing

Hướng dẫn triển khai hệ thống EbayClone với Docker, Nginx Load Balancing và MongoDB.

## 📋 Yêu cầu

- Docker Desktop (Windows/Mac) hoặc Docker Engine (Linux)
- Docker Compose (thường đi kèm với Docker Desktop)
- Ít nhất 4GB RAM
- Port 80, 443, 27017 phải trống

## 🚀 Cài đặt nhanh

### Bước 1: Tạo file .env

Copy file `.env.example` thành `.env` và điền các giá trị:

```bash
# Windows PowerShell
Copy-Item .env.example .env

# Linux/Mac
cp .env.example .env
```

Sau đó chỉnh sửa file `.env` với các giá trị của bạn:

```env
# MongoDB
MONGO_ROOT_USERNAME=admin
MONGO_ROOT_PASSWORD=your-secure-password

# JWT Secret (QUAN TRỌNG - thay đổi trong production)
JWT_SECRET=your-super-secret-jwt-key-min-32-characters

# Email
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# Cloudinary
CLOUDINARY_URL=cloudinary://api_key:api_secret@cloud_name

# GHN Shipping
GHN_TOKEN=your-ghn-token
GHN_SHOP_ID=your-ghn-shop-id

# PayPal
PAYPAL_CLIENT_ID=your-paypal-client-id
PAYPAL_CLIENT_SECRET=your-paypal-client-secret
PAYPAL_MODE=sandbox
```

### Bước 2: Build và chạy containers

```bash
# Build và start tất cả services
docker-compose up -d --build

# Xem logs
docker-compose logs -f

# Xem logs của một service cụ thể
docker-compose logs -f nginx
docker-compose logs -f backend-1
```

### Bước 3: Kiểm tra hệ thống

Mở trình duyệt và truy cập:
- **Frontend**: http://localhost
- **Backend API**: http://localhost/api
- **Health Check**: http://localhost/api/health
- **Nginx Health**: http://localhost/health

## 🏗️ Kiến trúc hệ thống

```
                    ┌─────────────┐
                    │   Client    │
                    └──────┬──────┘
                           │
                    ┌──────▼──────┐
                    │   Nginx     │  Port 80 (Load Balancer)
                    │  (Reverse   │
                    │   Proxy)    │
                    └──────┬──────┘
                           │
        ┌──────────────────┼──────────────────┐
        │                  │                  │
  ┌─────▼─────┐    ┌──────▼──────┐    ┌──────▼──────┐
  │ Backend-1 │    │  Backend-2   │    │  Backend-3  │
  │  :9999    │    │    :9999     │    │    :9999    │
  └─────┬─────┘    └──────┬───────┘    └──────┬──────┘
        │                  │                  │
        └──────────────────┼──────────────────┘
                           │
                    ┌──────▼──────┐
                    │   MongoDB   │  Port 27017
                    └─────────────┘
```

## 📦 Các Services

### 1. MongoDB
- **Container**: `ebayclone-mongodb`
- **Port**: 27017
- **Volume**: Dữ liệu được lưu trong Docker volume `mongodb_data`

### 2. Backend (3 instances)
- **Containers**: `ebayclone-backend-1`, `ebayclone-backend-2`, `ebayclone-backend-3`
- **Port nội bộ**: 9999 (không expose ra ngoài)
- **Load Balancing**: Nginx phân phối request theo thuật toán `least_conn`

### 3. Frontend
- **Container**: `ebayclone-frontend`
- **Port nội bộ**: 80 (không expose ra ngoài)
- **Build**: Multi-stage build với Nginx

### 4. Nginx
- **Container**: `ebayclone-nginx`
- **Port**: 80 (HTTP), 443 (HTTPS - cần cấu hình SSL)
- **Chức năng**:
  - Reverse proxy cho frontend
  - Load balancer cho backend (3 instances)
  - Rate limiting
  - Gzip compression
  - WebSocket support (cho Socket.IO)

## 🔧 Cấu hình Load Balancing

Nginx sử dụng thuật toán **least_conn** (least connections) để phân phối request:

```nginx
upstream backend_servers {
    least_conn;
    server backend-1:9999 max_fails=3 fail_timeout=30s;
    server backend-2:9999 max_fails=3 fail_timeout=30s;
    server backend-3:9999 max_fails=3 fail_timeout=30s;
}
```

### Các thuật toán khác có thể dùng:

1. **Round Robin** (mặc định):
```nginx
upstream backend_servers {
    server backend-1:9999;
    server backend-2:9999;
    server backend-3:9999;
}
```

2. **IP Hash** (sticky sessions):
```nginx
upstream backend_servers {
    ip_hash;
    server backend-1:9999;
    server backend-2:9999;
    server backend-3:9999;
}
```

3. **Weighted** (phân phối theo trọng số):
```nginx
upstream backend_servers {
    server backend-1:9999 weight=3;
    server backend-2:9999 weight=2;
    server backend-3:9999 weight=1;
}
```

## 🧪 Testing Load Balancing

### Test với script:

**Windows (PowerShell):**
```powershell
.\test-load-balancing.ps1
```

**Linux/Mac:**
```bash
chmod +x test-load-balancing.sh
./test-load-balancing.sh
```

### Test thủ công:

```bash
# Test health endpoint nhiều lần
for i in {1..10}; do curl http://localhost/api/health; echo ""; done

# Test với timing
curl -w "\nTime: %{time_total}s\n" http://localhost/api/health
```

## 📊 Monitoring

### Xem logs real-time:
```bash
# Tất cả services
docker-compose logs -f

# Chỉ backend
docker-compose logs -f backend-1 backend-2 backend-3

# Chỉ nginx
docker-compose logs -f nginx
```

### Kiểm tra trạng thái containers:
```bash
docker-compose ps
```

### Xem resource usage:
```bash
docker stats
```

## 🔍 Troubleshooting

### 1. Containers không start được

```bash
# Xem logs lỗi
docker-compose logs

# Rebuild từ đầu
docker-compose down -v
docker-compose up -d --build
```

### 2. Backend không kết nối được MongoDB

Kiểm tra:
- MongoDB đã start chưa: `docker-compose ps mongodb`
- Connection string trong `.env` đúng chưa
- MongoDB health check: `docker-compose logs mongodb`

### 3. Nginx không route được request

Kiểm tra:
- Nginx config: `docker-compose exec nginx nginx -t`
- Backend instances đang chạy: `docker-compose ps`
- Nginx logs: `docker-compose logs nginx`

### 4. Frontend không load được

Kiểm tra:
- Frontend build thành công: `docker-compose logs frontend`
- Environment variable `REACT_APP_API_URL` đúng chưa
- Browser console có lỗi gì không

## 🔄 Các lệnh thường dùng

```bash
# Start services
docker-compose up -d

# Stop services
docker-compose stop

# Stop và xóa containers
docker-compose down

# Stop và xóa containers + volumes (XÓA DỮ LIỆU)
docker-compose down -v

# Rebuild một service cụ thể
docker-compose up -d --build backend-1

# Scale backend instances (ví dụ: 5 instances)
docker-compose up -d --scale backend-1=5

# Xem logs của một service
docker-compose logs -f [service-name]

# Execute command trong container
docker-compose exec backend-1 sh
docker-compose exec mongodb mongosh
```

## 📈 Scaling

### Tăng số lượng backend instances:

Sửa file `docker-compose.yml`, thêm thêm backend instances:

```yaml
backend-4:
  # ... copy config từ backend-1
```

Sau đó cập nhật `nginx/conf.d/default.conf`:

```nginx
upstream backend_servers {
    least_conn;
    server backend-1:9999;
    server backend-2:9999;
    server backend-3:9999;
    server backend-4:9999;  # Thêm dòng này
}
```

Cuối cùng rebuild:
```bash
docker-compose up -d --build
```

## 🔒 Production Checklist

Trước khi deploy production:

- [ ] Thay đổi `JWT_SECRET` thành giá trị mạnh (32+ ký tự)
- [ ] Thay đổi MongoDB password
- [ ] Cấu hình SSL/HTTPS cho Nginx
- [ ] Setup firewall rules
- [ ] Cấu hình backup MongoDB
- [ ] Setup monitoring (Prometheus, Grafana)
- [ ] Cấu hình log rotation
- [ ] Review và tối ưu Nginx config
- [ ] Test load balancing với production-like traffic
- [ ] Setup health checks và auto-restart

## 📚 Tài liệu tham khảo

- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Nginx Load Balancing](https://nginx.org/en/docs/http/load_balancing.html)
- [MongoDB Docker](https://hub.docker.com/_/mongo)

## 💡 Tips

1. **Development**: Có thể giảm số backend instances xuống 1-2 để tiết kiệm tài nguyên
2. **Production**: Nên có ít nhất 3 backend instances để đảm bảo high availability
3. **Monitoring**: Sử dụng `docker stats` để theo dõi CPU, memory usage
4. **Logs**: Cấu hình log rotation để tránh đầy disk

---

**Lưu ý**: File này được tạo tự động. Vui lòng cập nhật khi có thay đổi trong hệ thống.

