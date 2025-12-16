# 🚀 Hướng Dẫn Chạy Ứng Dụng - Từng Bước Chi Tiết

Hướng dẫn chi tiết cách mở và chạy các ứng dụng cần thiết cho project EbayClone.

## 📋 Danh Sách Ứng Dụng Cần Thiết

1. **Docker Desktop** - Quan trọng nhất! (Bắt buộc)
2. **VS Code** - Để chỉnh sửa code (Đã có)
3. **PowerShell hoặc Terminal** - Để chạy lệnh
4. **Trình duyệt** - Để xem kết quả

---

## 🐳 BƯỚC 1: Cài Đặt và Chạy Docker Desktop

### 1.1. Kiểm tra đã cài Docker Desktop chưa

**Cách 1: Kiểm tra trong Start Menu**
- Nhấn phím `Windows`
- Gõ "Docker Desktop"
- Nếu thấy ứng dụng → Đã cài
- Nếu không thấy → Cần cài đặt

**Cách 2: Kiểm tra bằng PowerShell**
```powershell
docker --version
```
- Nếu hiện version (ví dụ: `Docker version 24.0.0`) → Đã cài
- Nếu báo lỗi "command not found" → Chưa cài

### 1.2. Cài Đặt Docker Desktop (Nếu chưa có)

1. **Tải Docker Desktop:**
   - Truy cập: https://www.docker.com/products/docker-desktop
   - Hoặc tìm "Docker Desktop Windows" trên Google
   - Tải file `.exe` về máy

2. **Cài đặt:**
   - Chạy file `.exe` vừa tải
   - Nhấn "Next" → "Next" → "Install"
   - Đợi quá trình cài đặt hoàn tất
   - **QUAN TRỌNG:** Khởi động lại máy tính sau khi cài xong

3. **Sau khi khởi động lại:**
   - Mở Docker Desktop từ Start Menu
   - Đợi Docker Desktop khởi động (có thể mất 1-2 phút lần đầu)

### 1.3. Mở Docker Desktop

**Cách 1: Từ Start Menu**
1. Nhấn phím `Windows`
2. Gõ "Docker Desktop"
3. Nhấn Enter hoặc click vào ứng dụng

**Cách 2: Từ System Tray (Taskbar)**
- Tìm icon Docker (con cá voi) ở góc dưới bên phải màn hình
- Click đúp vào icon đó

**Cách 3: Từ Desktop**
- Nếu có shortcut Docker Desktop trên Desktop → Click đúp

### 1.4. Kiểm tra Docker Desktop đã chạy chưa

**Dấu hiệu Docker Desktop đã chạy:**
- ✅ Icon Docker ở system tray (góc dưới phải) có màu xanh
- ✅ Mở Docker Desktop thấy giao diện chính (không phải màn hình loading)
- ✅ Ở góc dưới trái có dòng "Docker Desktop is running"

**Kiểm tra bằng PowerShell:**
```powershell
docker ps
```
- Nếu thấy output (kể cả rỗng) → ✅ Docker đã chạy
- Nếu báo lỗi → ❌ Docker chưa chạy, cần mở Docker Desktop

---

## 💻 BƯỚC 2: Mở PowerShell hoặc Terminal

### 2.1. Mở PowerShell trong VS Code (Khuyến nghị)

1. **Mở VS Code:**
   - Mở thư mục project: `C:\Users\hoang\Desktop\EbayClone`
   - Hoặc: File → Open Folder → Chọn thư mục EbayClone

2. **Mở Terminal trong VS Code:**
   - **Cách 1:** Nhấn phím tắt: `Ctrl + `` (phím backtick, ở trên phím Tab)
   - **Cách 2:** Menu: `Terminal` → `New Terminal`
   - **Cách 3:** Menu: `View` → `Terminal`

3. **Kiểm tra đang ở đúng thư mục:**
   - Terminal sẽ hiện: `PS C:\Users\hoang\Desktop\EbayClone>`
   - Nếu không đúng, gõ: `cd C:\Users\hoang\Desktop\EbayClone`

### 2.2. Mở PowerShell riêng (Ngoài VS Code)

1. **Cách 1: Từ Start Menu**
   - Nhấn phím `Windows`
   - Gõ "PowerShell"
   - Click vào "Windows PowerShell" hoặc "PowerShell"

2. **Cách 2: Từ Run**
   - Nhấn `Windows + R`
   - Gõ: `powershell`
   - Nhấn Enter

3. **Di chuyển đến thư mục project:**
   ```powershell
   cd C:\Users\hoang\Desktop\EbayClone
   ```

---

## 🎯 BƯỚC 3: Chạy Docker Compose

### 3.1. Kiểm tra trước khi chạy

**Kiểm tra 1: Docker Desktop đã chạy chưa?**
```powershell
docker ps
```
→ Phải thấy output (không báo lỗi)

**Kiểm tra 2: Đang ở đúng thư mục chưa?**
```powershell
pwd
# Hoặc
Get-Location
```
→ Phải thấy: `C:\Users\hoang\Desktop\EbayClone`

**Kiểm tra 3: Có file docker-compose.yml không?**
```powershell
ls docker-compose.yml
```
→ Phải thấy file `docker-compose.yml`

**Kiểm tra 4: Có file .env không?**
```powershell
ls .env
```
→ Phải thấy file `.env` (nếu không có, xem Bước 4)

### 3.2. Chạy lệnh Docker Compose

```powershell
docker-compose up -d --build
```

**Giải thích lệnh:**
- `docker-compose` - Lệnh để quản lý nhiều containers
- `up` - Khởi động containers
- `-d` - Chạy ở chế độ background (detached)
- `--build` - Build lại images trước khi chạy

**Quá trình chạy:**
1. Docker sẽ build images (có thể mất 5-10 phút lần đầu)
2. Tạo và khởi động containers
3. Hiển thị logs trong quá trình build

**Khi nào xong:**
- Thấy dòng: `Creating ebayclone-nginx ... done`
- Thấy dòng: `Creating ebayclone-backend-1 ... done`
- Không còn lỗi đỏ

### 3.3. Kiểm tra containers đã chạy chưa

```powershell
docker-compose ps
```

**Kết quả mong đợi:**
```
NAME                     STATUS              PORTS
ebayclone-mongodb        Up (healthy)        0.0.0.0:27017->27017/tcp
ebayclone-backend-1      Up (healthy)        
ebayclone-backend-2      Up (healthy)        
ebayclone-backend-3      Up (healthy)        
ebayclone-frontend       Up                   
ebayclone-nginx         Up (healthy)        0.0.0.0:80->80/tcp
```

Tất cả phải có status là **"Up"** hoặc **"Up (healthy)"**

---

## 📝 BƯỚC 4: Tạo File .env (Nếu chưa có)

### 4.1. Kiểm tra có file .env chưa

```powershell
ls .env
```

- Nếu thấy file → Bỏ qua bước này
- Nếu báo "cannot find" → Cần tạo file

### 4.2. Tạo file .env

**Cách 1: Từ VS Code**
1. Trong VS Code, click vào icon "New File" (hoặc `Ctrl + N`)
2. Copy nội dung sau vào:

```env
MONGO_ROOT_USERNAME=admin
MONGO_ROOT_PASSWORD=password123
JWT_SECRET=your-super-secret-jwt-key-min-32-characters-change-this-in-production
CLIENT_URL=http://localhost
BASE_URL=http://localhost
REACT_APP_API_URL=http://localhost/api
```

3. Lưu file với tên: `.env` (có dấu chấm ở đầu)
   - File → Save As
   - Tên file: `.env`
   - Lưu ở thư mục: `C:\Users\hoang\Desktop\EbayClone`

**Cách 2: Từ PowerShell**
```powershell
# Tạo file .env
@"
MONGO_ROOT_USERNAME=admin
MONGO_ROOT_PASSWORD=password123
JWT_SECRET=your-super-secret-jwt-key-min-32-characters-change-this-in-production
CLIENT_URL=http://localhost
BASE_URL=http://localhost
REACT_APP_API_URL=http://localhost/api
"@ | Out-File -FilePath .env -Encoding utf8
```

---

## 🌐 BƯỚC 5: Mở Trình Duyệt và Kiểm Tra

### 5.1. Mở trình duyệt

Mở bất kỳ trình duyệt nào:
- Chrome
- Edge
- Firefox

### 5.2. Truy cập các URL

**1. Frontend (Giao diện chính):**
```
http://localhost
```

**2. API Health Check:**
```
http://localhost/api/health
```
→ Phải thấy: `{"status":"ok","timestamp":"...","service":"ebayclone-backend"}`

**3. Nginx Health Check:**
```
http://localhost/health
```
→ Phải thấy: `healthy`

---

## 🔍 BƯỚC 6: Xem Logs (Nếu có lỗi)

### 6.1. Xem logs tất cả services

```powershell
docker-compose logs -f
```

- `-f` = follow (theo dõi real-time)
- Nhấn `Ctrl + C` để dừng

### 6.2. Xem logs của một service cụ thể

```powershell
# Backend
docker-compose logs -f backend-1

# MongoDB
docker-compose logs -f mongodb

# Nginx
docker-compose logs -f nginx

# Frontend
docker-compose logs -f frontend
```

---

## 🛑 BƯỚC 7: Dừng và Xóa Containers

### 7.1. Dừng containers (Giữ lại data)

```powershell
docker-compose stop
```

### 7.2. Dừng và xóa containers (Giữ lại data)

```powershell
docker-compose down
```

### 7.3. Dừng và xóa tất cả (XÓA CẢ DATA)

```powershell
docker-compose down -v
```
⚠️ **CẢNH BÁO:** Lệnh này sẽ xóa cả database!

---

## 🧪 BƯỚC 8: Test Load Balancing

### 8.1. Chạy script test (Windows)

```powershell
.\test-load-balancing.ps1
```

### 8.2. Test thủ công

Mở nhiều tab trình duyệt và truy cập:
```
http://localhost/api/health
```

Refresh nhiều lần, mỗi lần có thể được route đến backend instance khác nhau.

---

## ❓ Troubleshooting - Xử Lý Lỗi

### Lỗi 1: "Docker daemon is not running"

**Nguyên nhân:** Docker Desktop chưa mở

**Cách sửa:**
1. Mở Docker Desktop
2. Đợi đến khi icon Docker xanh
3. Chạy lại lệnh

### Lỗi 2: "Port 80 is already in use"

**Nguyên nhân:** Port 80 đã được sử dụng bởi ứng dụng khác

**Cách sửa:**
1. Tìm ứng dụng đang dùng port 80:
```powershell
netstat -ano | findstr :80
```

2. Hoặc đổi port trong `docker-compose.yml`:
```yaml
nginx:
  ports:
    - "8080:80"  # Thay vì "80:80"
```
Sau đó truy cập: `http://localhost:8080`

### Lỗi 3: "Cannot connect to MongoDB"

**Nguyên nhân:** MongoDB container chưa sẵn sàng

**Cách sửa:**
```powershell
# Kiểm tra MongoDB
docker-compose ps mongodb

# Xem logs
docker-compose logs mongodb

# Restart MongoDB
docker-compose restart mongodb
```

### Lỗi 4: "Build failed"

**Nguyên nhân:** Lỗi trong quá trình build

**Cách sửa:**
```powershell
# Xem logs chi tiết
docker-compose build --no-cache

# Hoặc rebuild từ đầu
docker-compose down -v
docker-compose up -d --build
```

### Lỗi 5: "File .env not found"

**Cách sửa:** Xem Bước 4 ở trên

---

## 📊 Checklist - Danh Sách Kiểm Tra

Trước khi chạy `docker-compose up -d --build`, đảm bảo:

- [ ] Docker Desktop đã được cài đặt
- [ ] Docker Desktop đang chạy (icon xanh)
- [ ] Đã mở PowerShell/Terminal
- [ ] Đang ở đúng thư mục: `C:\Users\hoang\Desktop\EbayClone`
- [ ] Có file `docker-compose.yml`
- [ ] Có file `.env` với nội dung tối thiểu
- [ ] Port 80 trống (hoặc đã đổi port)

Sau khi chạy lệnh:

- [ ] Không có lỗi đỏ trong output
- [ ] `docker-compose ps` hiển thị tất cả containers là "Up"
- [ ] Truy cập `http://localhost` thấy giao diện
- [ ] Truy cập `http://localhost/api/health` thấy JSON response

---

## 🎓 Tóm Tắt Các Lệnh Quan Trọng

```powershell
# Kiểm tra Docker
docker ps
docker --version

# Di chuyển đến thư mục project
cd C:\Users\hoang\Desktop\EbayClone

# Chạy Docker Compose
docker-compose up -d --build

# Xem trạng thái
docker-compose ps

# Xem logs
docker-compose logs -f

# Dừng
docker-compose stop

# Xóa
docker-compose down
```

---

## 💡 Tips

1. **Lần đầu chạy:** Có thể mất 10-15 phút để build images
2. **Lần sau:** Chỉ mất vài giây vì đã có images
3. **Nếu lỗi:** Luôn xem logs trước: `docker-compose logs`
4. **Tắt máy:** Nhớ dừng containers: `docker-compose stop` (không bắt buộc)

---

**Chúc bạn thành công!** 🎉

Nếu gặp lỗi, hãy copy toàn bộ thông báo lỗi và gửi cho tôi!

