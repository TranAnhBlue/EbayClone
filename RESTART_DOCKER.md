# 🔄 Hướng Dẫn Tắt và Chạy Lại Docker Containers

## 🛑 BƯỚC 1: Tắt Tất Cả Containers

### Cách 1: Từ thư mục project (Khuyến nghị)

Mở PowerShell trong VS Code tại thư mục `EbayClone` và chạy:

```powershell
# Dừng tất cả containers
docker-compose down
```

### Cách 2: Tắt tất cả containers Docker (Nếu không có docker-compose)

```powershell
# Xem tất cả containers đang chạy
docker ps

# Dừng tất cả containers
docker stop $(docker ps -q)

# Hoặc dừng từng container
docker stop ebayclone-mongodb
docker stop ebayclone-backend-1
docker stop ebayclone-backend-2
docker stop ebayclone-backend-3
docker stop ebayclone-frontend
docker stop ebayclone-nginx
```

---

## 🗑️ BƯỚC 2: Xóa Containers Cũ (Tùy chọn)

### Xóa containers (Giữ lại data/volumes)

```powershell
docker-compose down
```

### Xóa containers + volumes (XÓA CẢ DATA - Cẩn thận!)

```powershell
docker-compose down -v
```

⚠️ **Lưu ý:** Lệnh này sẽ xóa cả database trong MongoDB container (nhưng không ảnh hưởng MongoDB local của bạn)

### Xóa containers + images (Xóa cả images đã build)

```powershell
docker-compose down --rmi all
```

### Xóa tất cả (Containers + Volumes + Images)

```powershell
docker-compose down -v --rmi all
```

---

## 🧹 BƯỚC 3: Dọn Dẹp (Nếu cần)

### Xóa containers đã dừng

```powershell
docker container prune
```

### Xóa images không dùng

```powershell
docker image prune
```

### Xóa tất cả (Containers + Images + Networks + Volumes không dùng)

```powershell
docker system prune -a --volumes
```

⚠️ **CẢNH BÁO:** Lệnh này sẽ xóa TẤT CẢ containers, images, networks, volumes không đang được sử dụng!

---

## ✅ BƯỚC 4: Kiểm Tra Đã Tắt Hết Chưa

```powershell
# Xem containers đang chạy
docker ps

# Xem tất cả containers (kể cả đã dừng)
docker ps -a
```

Nếu không thấy containers nào → ✅ Đã tắt hết

---

## 🚀 BƯỚC 5: Cập Nhật File .env

Trước khi chạy lại, đảm bảo file `.env` có:

```env
MONGO_URI=mongodb://host.docker.internal:27017/shopii
```

Và các biến khác cần thiết.

---

## 🔄 BƯỚC 6: Chạy Lại Với Cấu Hình Mới

### Build và chạy lại

```powershell
docker-compose up -d --build
```

**Giải thích:**
- `up` - Khởi động containers
- `-d` - Chạy ở background
- `--build` - Build lại images (quan trọng để áp dụng thay đổi)

### Chỉ chạy lại (không build)

```powershell
docker-compose up -d
```

---

## 📊 BƯỚC 7: Kiểm Tra Containers Đã Chạy

```powershell
# Xem trạng thái
docker-compose ps

# Xem logs
docker-compose logs -f
```

**Kết quả mong đợi:**
- Tất cả containers có status là "Up" hoặc "Up (healthy)"
- Backend logs hiển thị: "MongoDB connected successfully"
- Không có lỗi đỏ

---

## 🔍 BƯỚC 8: Kiểm Tra Kết Nối MongoDB

### Xem logs backend

```powershell
docker-compose logs backend-1 | grep -i mongo
```

Hoặc xem toàn bộ logs:

```powershell
docker-compose logs backend-1
```

**Tìm dòng:**
```
MongoDB connected successfully
```

Nếu thấy → ✅ Kết nối thành công!

---

## 🧪 BƯỚC 9: Test Frontend

1. Mở trình duyệt
2. Truy cập: `http://localhost`
3. Kiểm tra:
   - ✅ Không còn lỗi "Error loading categories"
   - ✅ Không còn lỗi "Error loading products"
   - ✅ Dữ liệu hiển thị bình thường

---

## 📝 Tóm Tắt Lệnh Nhanh

```powershell
# 1. Tắt containers
docker-compose down

# 2. Chạy lại với build
docker-compose up -d --build

# 3. Kiểm tra
docker-compose ps

# 4. Xem logs
docker-compose logs -f backend-1
```

---

## ❌ Nếu Gặp Lỗi

### Lỗi: "Port already in use"

```powershell
# Tìm process đang dùng port
netstat -ano | findstr :80
netstat -ano | findstr :27017

# Kill process (thay PID bằng process ID thực)
taskkill /PID <PID> /F
```

### Lỗi: "Container name already exists"

```powershell
# Xóa container cũ
docker rm -f ebayclone-backend-1
docker rm -f ebayclone-backend-2
docker rm -f ebayclone-backend-3
docker rm -f ebayclone-frontend
docker rm -f ebayclone-nginx
docker rm -f ebayclone-mongodb
```

### Lỗi: "Cannot connect to MongoDB"

- Kiểm tra MongoDB local đang chạy
- Kiểm tra `MONGO_URI` trong `.env` đúng chưa
- Xem logs: `docker-compose logs backend-1`

---

## 💡 Tips

1. **Lần đầu chạy:** Có thể mất 5-10 phút để build images
2. **Lần sau:** Chỉ mất vài giây vì đã có images
3. **Nếu thay đổi code:** Cần `--build` để build lại
4. **Nếu chỉ thay đổi config:** Không cần `--build`, chỉ cần `docker-compose restart`

---

**Chúc bạn thành công!** 🎉

