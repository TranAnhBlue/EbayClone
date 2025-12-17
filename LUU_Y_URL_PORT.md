# ⚠️ Lưu Ý QUAN TRỌNG: URL Phải Có PORT!

## ❌ Lỗi Thường Gặp

Khi cấu hình `.env`, nhiều người quên thêm **PORT** vào URL, dẫn đến lỗi:

### ❌ SAI:
```env
CLIENT_URL=http://localhost
BASE_URL=http://localhost
REACT_APP_API_URL=http://localhost/api
```

### ✅ ĐÚNG:
```env
CLIENT_URL=http://localhost:3000
BASE_URL=http://localhost:9999
REACT_APP_API_URL=http://localhost:9999/api
```

---

## 🔍 Tại Sao Cần PORT?

### 1. CORS Configuration

Backend cần biết **chính xác** frontend chạy ở đâu để cho phép CORS:

```javascript
// back-end/server.js
app.use(cors({
  origin: [process.env.CLIENT_URL || 'http://localhost:3000'],
  credentials: true
}));
```

- ❌ `http://localhost` → Không rõ port → CORS có thể block
- ✅ `http://localhost:3000` → Rõ ràng port 3000 → CORS hoạt động

### 2. PayPal Callbacks

PayPal cần redirect về đúng URL với port:

```javascript
// back-end/src/controllers/paymentController.js
return_url: `${process.env.BASE_URL}/api/buyers/payments/paypal/callback`
```

- ❌ `http://localhost` → Không có port → Redirect sai
- ✅ `http://localhost:9999` → Có port → Redirect đúng

### 3. Frontend API Calls

Frontend cần biết backend chạy ở port nào:

```javascript
// front-end/src/utils/constants.js
const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:9999";
```

- ❌ `http://localhost/api` → Thiếu port → Không kết nối được
- ✅ `http://localhost:9999/api` → Có port → Kết nối được

---

## 📝 Cấu Hình Đúng

### Khi Chạy với Docker:

**File `.env` ở thư mục gốc:**

```env
MONGO_URI=mongodb://host.docker.internal:27017/shopii
CLIENT_URL=http://localhost:3000
BASE_URL=http://localhost:9999
REACT_APP_API_URL=http://localhost:9999/api
JWT_SECRET=your-secret-key-min-32-characters
```

**Lưu ý:**
- `CLIENT_URL` = `http://localhost:3000` (port của frontend khi chạy npm start)
- `BASE_URL` = `http://localhost:9999` (port của backend)
- Khi dùng Docker, frontend chạy trên port 80, nhưng `CLIENT_URL` vẫn là `:3000` cho CORS

### Khi Chạy Trực Tiếp (npm start):

**File `back-end/.env`:**

```env
MONGO_URI=mongodb://127.0.0.1:27017/shopii
CLIENT_URL=http://localhost:3000
BASE_URL=http://localhost:9999
JWT_SECRET=your-secret-key-min-32-characters
```

**File `front-end/.env`:**

```env
REACT_APP_API_URL=http://localhost:9999/api
```

---

## 🔧 Các Port Mặc Định

| Service | Port | URL |
|---------|------|-----|
| **Frontend (npm start)** | 3000 | `http://localhost:3000` |
| **Backend (npm start)** | 9999 | `http://localhost:9999` |
| **Frontend (Docker)** | 80 | `http://localhost` |
| **Backend (Docker)** | 9999 (nội bộ) | Qua Nginx port 80 |
| **MongoDB** | 27017 | `mongodb://127.0.0.1:27017` |

---

## ✅ Checklist

Trước khi chạy, kiểm tra:

- [ ] `CLIENT_URL` có port `:3000`?
- [ ] `BASE_URL` có port `:9999`?
- [ ] `REACT_APP_API_URL` có port `:9999`?
- [ ] `MONGO_URI` có port `:27017`?

---

## 🐛 Lỗi Nếu Thiếu PORT

### Lỗi CORS:
```
Access to XMLHttpRequest at 'http://localhost/api/...' from origin 'http://localhost:3000' has been blocked by CORS policy
```

**Nguyên nhân:** `CLIENT_URL` không có port → CORS không match

**Cách sửa:** Thêm `:3000` vào `CLIENT_URL`

### Lỗi Kết Nối API:
```
Network Error
Failed to fetch
```

**Nguyên nhân:** `REACT_APP_API_URL` không có port → Không biết kết nối đến đâu

**Cách sửa:** Thêm `:9999` vào `REACT_APP_API_URL`

### Lỗi PayPal Callback:
```
PayPal redirect failed
```

**Nguyên nhân:** `BASE_URL` không có port → Redirect sai URL

**Cách sửa:** Thêm `:9999` vào `BASE_URL`

---

## 💡 Tips

1. **Luôn kiểm tra URL có port:**
   - ✅ `http://localhost:3000`
   - ✅ `http://localhost:9999`
   - ❌ `http://localhost`

2. **Khi copy/paste URL:**
   - Đảm bảo có port
   - Kiểm tra lại sau khi paste

3. **Format chuẩn:**
   ```
   http://localhost:PORT
   hoặc
   http://127.0.0.1:PORT
   ```

---

**Nhớ: Luôn thêm PORT vào URL!** ⚠️

