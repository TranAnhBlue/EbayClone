# ⚡ Hướng Dẫn Nhanh - 5 Bước Chạy Ứng Dụng

## 🎯 BƯỚC 1: Mở Docker Desktop

1. Nhấn phím `Windows`
2. Gõ "Docker Desktop"
3. Nhấn Enter
4. **Đợi** đến khi icon Docker (con cá voi) ở góc dưới phải màn hình có màu **XANH** ✅

---

## 💻 BƯỚC 2: Mở PowerShell trong VS Code

1. Mở VS Code
2. Mở thư mục: `C:\Users\hoang\Desktop\EbayClone`
3. Nhấn `Ctrl + `` (phím backtick, trên phím Tab)
4. Terminal sẽ hiện ở dưới màn hình

---

## 📝 BƯỚC 3: Tạo File .env (Nếu chưa có)

**Kiểm tra:**
```powershell
ls .env
```

**Nếu không có, tạo file:**
1. Trong VS Code: Click "New File" → Tên: `.env`
2. Copy nội dung này vào:

```env
MONGO_ROOT_USERNAME=admin
MONGO_ROOT_PASSWORD=password123
JWT_SECRET=your-secret-key-min-32-characters-change-this
CLIENT_URL=http://localhost:3000
BASE_URL=http://localhost:9999
REACT_APP_API_URL=http://localhost:9999/api
```

3. Lưu file (`Ctrl + S`)

---

## 🚀 BƯỚC 4: Chạy Docker Compose

Trong PowerShell, gõ:

```powershell
docker-compose up -d --build
```

**Đợi 5-10 phút** (lần đầu tiên)

**Khi nào xong:**
- Thấy dòng: `Creating ebayclone-nginx ... done`
- Không còn lỗi đỏ

---

## ✅ BƯỚC 5: Kiểm Tra

1. Mở trình duyệt
2. Truy cập: `http://localhost`
3. Nếu thấy giao diện → **THÀNH CÔNG!** 🎉

---

## 🔍 Kiểm Tra Nhanh

```powershell
# Xem containers đã chạy chưa
docker-compose ps

# Tất cả phải là "Up" hoặc "Up (healthy)"
```

---

## ❌ Nếu Gặp Lỗi

### Lỗi: "Docker daemon is not running"
→ **Mở Docker Desktop** (Bước 1)

### Lỗi: "Port 80 is already in use"
→ Đổi port trong `docker-compose.yml`: `"8080:80"` thay vì `"80:80"`
→ Truy cập: `http://localhost:8080`

### Lỗi: "File .env not found"
→ **Tạo file .env** (Bước 3)

---

## 📚 Xem Chi Tiết

Xem file `HUONG_DAN_CHAY_UNG_DUNG.md` để biết chi tiết hơn!

---

**Tóm tắt lệnh:**
```powershell
# 1. Kiểm tra Docker
docker ps

# 2. Di chuyển đến thư mục
cd C:\Users\hoang\Desktop\EbayClone

# 3. Chạy
docker-compose up -d --build

# 4. Kiểm tra
docker-compose ps
```

