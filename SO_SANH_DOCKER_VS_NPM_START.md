# 🔄 So Sánh: Docker vs npm start - Khi Nào Cần Terminal?

## ✅ Khi Chạy Docker (docker-compose up -d)

### **KHÔNG CẦN mở terminal cho Backend/Frontend!**

```powershell
# Chỉ cần 1 lệnh này
docker-compose up -d --build
```

**Sau khi chạy:**
- ✅ **Backend** tự động chạy trong container (không cần terminal)
- ✅ **Frontend** tự động chạy trong container (không cần terminal)
- ✅ **Nginx** tự động chạy trong container (không cần terminal)
- ✅ **MongoDB** tự động chạy trong container (không cần terminal)

**Tất cả chạy ở background (detached mode) - `-d`**

### Kiểm Tra:

```powershell
# Xem containers đang chạy
docker-compose ps
```

**Kết quả:**
```
NAME                     STATUS
ebayclone-backend-1     Up (healthy)    ← Đang chạy tự động
ebayclone-backend-2     Up (healthy)    ← Đang chạy tự động
ebayclone-backend-3     Up (healthy)    ← Đang chạy tự động
ebayclone-frontend      Up              ← Đang chạy tự động
ebayclone-nginx         Up (healthy)    ← Đang chạy tự động
ebayclone-mongodb       Up (healthy)    ← Đang chạy tự động
```

**→ Tất cả đã chạy, KHÔNG cần mở terminal!**

### Truy Cập:

- **Frontend:** `http://localhost` (qua Nginx)
- **Backend API:** `http://localhost/api` (qua Nginx)
- **Tất cả tự động!**

---

## ⚠️ Khi Chạy Trực Tiếp (npm start)

### **CẦN mở terminal cho Backend VÀ Frontend!**

**Terminal 1 - Backend:**
```powershell
cd back-end
npm start
```
→ Phải giữ terminal này mở, nếu đóng → Backend dừng

**Terminal 2 - Frontend:**
```powershell
cd front-end
npm start
```
→ Phải giữ terminal này mở, nếu đóng → Frontend dừng

**→ CẦN 2 terminals mở liên tục!**

---

## 📊 Bảng So Sánh

| | Docker | npm start |
|---|---|---|
| **Số Terminal Cần** | 1 (chỉ để chạy lệnh) | 2 (BE + FE) |
| **Terminal Phải Mở Liên Tục?** | ❌ Không | ✅ Có |
| **Chạy Ở Background?** | ✅ Có (`-d`) | ❌ Không |
| **Tự Động Restart?** | ✅ Có (`restart: unless-stopped`) | ❌ Không |
| **Load Balancing?** | ✅ Có (3 backends) | ❌ Không |
| **Nginx?** | ✅ Có | ❌ Không |

---

## 🎯 Khi Nào Dùng Gì?

### Dùng Docker Khi:
- ✅ Muốn test load balancing
- ✅ Muốn môi trường giống production
- ✅ Không muốn mở nhiều terminals
- ✅ Muốn tự động restart khi crash
- ✅ Muốn tất cả chạy ở background

### Dùng npm start Khi:
- ✅ Đang develop/debug code
- ✅ Cần hot reload nhanh
- ✅ Muốn xem logs trực tiếp trong terminal
- ✅ Muốn dừng/start dễ dàng

---

## 🔍 Kiểm Tra Docker Đang Chạy

### Xem tất cả containers:
```powershell
docker-compose ps
```

### Xem logs (không cần terminal riêng):
```powershell
# Logs backend
docker-compose logs -f backend-1

# Logs frontend
docker-compose logs -f frontend

# Logs tất cả
docker-compose logs -f
```

### Dừng tất cả (không cần đóng terminal):
```powershell
docker-compose stop
```

### Start lại (không cần mở terminal mới):
```powershell
docker-compose start
```

---

## ✅ Tóm Tắt

### Docker:
```powershell
# Chạy 1 lần
docker-compose up -d

# Xong! Tất cả tự động chạy
# KHÔNG cần mở terminal cho BE/FE
# KHÔNG cần giữ terminal mở
```

### npm start:
```powershell
# Terminal 1
cd back-end
npm start  # Phải giữ terminal này mở

# Terminal 2  
cd front-end
npm start  # Phải giữ terminal này mở
```

---

## 💡 Tips

1. **Development:** Dùng `npm start` (dễ debug)
2. **Testing/Production:** Dùng Docker (giống production)
3. **Có thể chạy cả 2:** Nhưng phức tạp và dễ conflict port

---

**Với Docker, bạn chỉ cần chạy 1 lệnh và tất cả tự động chạy!** 🎉

