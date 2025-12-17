# 📦 Tóm tắt Deployment - Docker + Nginx Load Balancing

## ✅ Đã hoàn thành

### 1. Docker Files
- ✅ `back-end/Dockerfile` - Container cho backend Node.js
- ✅ `front-end/Dockerfile` - Multi-stage build cho React app
- ✅ `back-end/.dockerignore` - Loại trừ files không cần thiết
- ✅ `front-end/.dockerignore` - Loại trừ files không cần thiết

### 2. Docker Compose
- ✅ `docker-compose.yml` - Orchestration cho:
  - MongoDB (1 instance)
  - Backend (3 instances - load balanced)
  - Frontend (1 instance)
  - Nginx (reverse proxy + load balancer)

### 3. Nginx Configuration
- ✅ `nginx/nginx.conf` - Main Nginx config với:
  - Load balancing (least_conn algorithm)
  - Rate limiting
  - Gzip compression
  - WebSocket support
  
- ✅ `nginx/conf.d/default.conf` - Server blocks:
  - Frontend routing
  - Backend API routing với load balancing
  - Health check endpoints

### 4. Health Checks
- ✅ Backend health endpoint: `/api/health`
- ✅ Nginx health endpoint: `/health`
- ✅ Docker health checks cho tất cả services

### 5. Testing Scripts
- ✅ `test-load-balancing.sh` - Bash script cho Linux/Mac
- ✅ `test-load-balancing.ps1` - PowerShell script cho Windows

### 6. Documentation
- ✅ `DOCKER_SETUP.md` - Hướng dẫn chi tiết
- ✅ `QUICK_START.md` - Hướng dẫn nhanh
- ✅ `.env.example` - Template cho environment variables

## 🏗️ Kiến trúc

```
                    Internet
                       │
                       ▼
                  ┌─────────┐
                  │  Nginx  │  Port 80
                  │ (Load   │
                  │Balancer)│
                  └────┬────┘
                       │
        ┌──────────────┼──────────────┐
        │              │              │
   ┌────▼────┐   ┌────▼────┐   ┌────▼────┐
   │Backend-1│   │Backend-2│   │Backend-3│
   │ :9999   │   │ :9999   │   │ :9999   │
   └────┬────┘   └────┬────┘   └────┬────┘
        │              │              │
        └──────────────┼──────────────┘
                       │
                  ┌────▼────┐
                  │ MongoDB  │  Port 27017
                  └──────────┘
```

## 🚀 Cách sử dụng

### Bước 1: Tạo file .env
```bash
# Copy template (nếu có)
cp .env.example .env

# Hoặc tạo mới với nội dung tối thiểu:
MONGO_ROOT_USERNAME=admin
MONGO_ROOT_PASSWORD=password123
JWT_SECRET=your-secret-key-min-32-characters
CLIENT_URL=http://localhost
BASE_URL=http://localhost
REACT_APP_API_URL=http://localhost/api
```

### Bước 2: Build và chạy
```bash
docker-compose up -d --build
```

### Bước 3: Kiểm tra
- Frontend: http://localhost
- API: http://localhost/api/health
- Nginx: http://localhost/health

### Bước 4: Test load balancing
```bash
# Windows
.\test-load-balancing.ps1

# Linux/Mac
chmod +x test-load-balancing.sh
./test-load-balancing.sh
```

## 📊 Load Balancing Configuration

### Thuật toán: Least Connections
Nginx sẽ route request đến backend instance có ít connections nhất.

### Backend Instances: 3
- `backend-1`: Container `ebayclone-backend-1`
- `backend-2`: Container `ebayclone-backend-2`
- `backend-3`: Container `ebayclone-backend-3`

### Health Checks
- Mỗi backend có health check mỗi 30s
- Nginx sẽ tự động loại bỏ backend không healthy
- Backend sẽ được thêm lại sau khi healthy

## 🔧 Tùy chỉnh

### Thay đổi số lượng backend instances

1. Sửa `docker-compose.yml` - thêm `backend-4`, `backend-5`, etc.
2. Sửa `nginx/conf.d/default.conf` - thêm vào upstream:
```nginx
server backend-4:9999 max_fails=3 fail_timeout=30s;
```

3. Rebuild:
```bash
docker-compose up -d --build
```

### Thay đổi thuật toán load balancing

Sửa `nginx/conf.d/default.conf`:
```nginx
# Round Robin (mặc định)
upstream backend_servers {
    server backend-1:9999;
    server backend-2:9999;
    server backend-3:9999;
}

# IP Hash (sticky sessions)
upstream backend_servers {
    ip_hash;
    server backend-1:9999;
    server backend-2:9999;
    server backend-3:9999;
}

# Weighted
upstream backend_servers {
    server backend-1:9999 weight=3;
    server backend-2:9999 weight=2;
    server backend-3:9999 weight=1;
}
```

## 📈 Monitoring

### Xem logs
```bash
# Tất cả
docker-compose logs -f

# Chỉ backend
docker-compose logs -f backend-1 backend-2 backend-3

# Chỉ nginx
docker-compose logs -f nginx
```

### Xem resource usage
```bash
docker stats
```

### Kiểm tra trạng thái
```bash
docker-compose ps
```

## ⚠️ Lưu ý quan trọng

1. **JWT_SECRET**: Phải thay đổi trong production (32+ ký tự)
2. **MongoDB Password**: Phải thay đổi trong production
3. **Port 80**: Phải trống hoặc đổi port trong docker-compose.yml
4. **Environment Variables**: Một số là optional (email, cloudinary, etc.)
5. **SSL/HTTPS**: Cần cấu hình thêm cho production

## 🐛 Troubleshooting

### Containers không start
```bash
docker-compose logs
docker-compose down -v
docker-compose up -d --build
```

### Backend không kết nối MongoDB
- Kiểm tra MongoDB logs: `docker-compose logs mongodb`
- Kiểm tra connection string trong `.env`
- Đảm bảo MongoDB đã healthy: `docker-compose ps mongodb`

### Nginx không route được
- Test config: `docker-compose exec nginx nginx -t`
- Xem logs: `docker-compose logs nginx`
- Kiểm tra backend instances: `docker-compose ps`

## 📚 Tài liệu tham khảo

- `DOCKER_SETUP.md` - Hướng dẫn chi tiết
- `QUICK_START.md` - Hướng dẫn nhanh
- [Docker Compose Docs](https://docs.docker.com/compose/)
- [Nginx Load Balancing](https://nginx.org/en/docs/http/load_balancing.html)

---

**Tất cả đã sẵn sàng để deploy!** 🎉

