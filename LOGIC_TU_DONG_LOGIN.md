# 🔐 Logic Tự Động Login Khi Chạy `npm start`

## 📍 Tổng Quan

Khi bạn chạy `npm start` cho frontend và backend riêng, ứng dụng sẽ **tự động login** nếu có token hợp lệ trong `localStorage`. Logic này hoạt động **không cần gọi API** khi app khởi động.

---

## 🔍 Các File Liên Quan

### 1. **`front-end/src/features/auth/authSlice.js`** - Logic Chính

Đây là file **quan trọng nhất** chứa logic tự động login:

```5:30:front-end/src/features/auth/authSlice.js
// Sửa: Đảm bảo luôn trả về object hợp lệ
const getInitialState = () => {
  try {
    const token = localStorage.getItem('token');
    if (token) {
      const decoded = jwtDecode(token);
      return {
        user: {
          id: decoded.id,
          username: decoded.username,
          role: decoded.role,
        },
        token,
        isAuthenticated: true
      };
    }
  } catch (error) {
    console.error("Lỗi giải mã token:", error);
  }
  
  // Trả về state mặc định nếu có lỗi
  return {
    user: null,
    token: null,
    isAuthenticated: false
  };
};

const authSlice = createSlice({
  name: 'auth',
  initialState: getInitialState(),
```

**Cách hoạt động:**
1. ✅ Khi Redux store khởi tạo, `getInitialState()` được gọi
2. ✅ Kiểm tra `localStorage.getItem('token')`
3. ✅ Nếu có token → Decode JWT bằng `jwtDecode(token)`
4. ✅ Lấy thông tin user từ token (id, username, role)
5. ✅ Set `isAuthenticated: true` → User được coi là đã login
6. ❌ **KHÔNG verify token với backend** - chỉ decode JWT

---

### 2. **`front-end/src/redux/store.js`** - Redux Persist

```18:23:front-end/src/redux/store.js
const persistConfig = {
  key: 'root',
  storage,
};

const persistedAuthReducer = persistReducer(persistConfig, authReducer);
```

**Cách hoạt động:**
- Redux Persist lưu auth state vào localStorage
- Khi app reload, state được restore từ localStorage
- Nhưng logic chính vẫn là `getInitialState()` trong authSlice

---

### 3. **`front-end/src/index.js`** - App Entry Point

```14:22:front-end/src/index.js
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <App />
      </PersistGate>
    </Provider>
  </React.StrictMode>
);
```

**Cách hoạt động:**
- `PersistGate` đợi Redux Persist restore state từ localStorage
- Sau đó mới render `<App />`
- Trong quá trình này, `getInitialState()` đã chạy và set user state

---

### 4. **`front-end/src/services/index.js`** - Axios Interceptor

```11:31:front-end/src/services/index.js
// Add a request interceptor to include auth token with every request
api.interceptors.request.use(
    config => {
        // Try to get token from localStorage first (this is most common)
        let token = localStorage.getItem('token');
        
        // If not found, try to get from accessToken key (alternative storage key)
        if (!token) {
            token = localStorage.getItem('accessToken');
        }
        
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        } else {
            console.warn('No authentication token found for API request');
        }
        return config;
    },
    error => {
        return Promise.reject(error);
    }
);
```

**Cách hoạt động:**
- Mọi API request tự động thêm token vào header
- Token được lấy từ `localStorage.getItem('token')`
- Nếu không có token → Request vẫn gửi nhưng không có Authorization header

---

### 5. **`front-end/src/services/index.js`** - Token Refresh Logic

```33:69:front-end/src/services/index.js
api.interceptors.response.use(
    response => response,
    async error => {
        const originalRequest = error.config;

        // Only attempt token refresh if we have a 401 error and haven't tried refreshing yet
        if (error.response && error.response.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                const { data } = await axios.post(`${BACKEND_API_URI}/user/refresh-token`);
                
                // Store the new token
                localStorage.setItem('token', data.accessToken);
                localStorage.setItem('accessToken', data.accessToken);
                
                // Update the original request with the new token
                originalRequest.headers['Authorization'] = `Bearer ${data.accessToken}`;
                
                // Retry the original request
                return api(originalRequest);
            } catch (err) {
                console.error('Failed to refresh token:', err);
                // Redirect to login or dispatch logout action
                localStorage.removeItem('token');
                localStorage.removeItem('accessToken');
                window.location.href = '/signin';
            }
        } else if (error.response && error.response.status === 403) {
            // Redirect to a custom error page with an error message
            const errorMessage = error.response.data.message || "You do not have permission to access this resource.";
            window.location.href = `/error?status=403&message=${encodeURIComponent(errorMessage)}`;
        }

        return Promise.reject(error);
    }
);
```

**Cách hoạt động:**
- Khi API trả về `401 Unauthorized` → Thử refresh token
- Nếu refresh thành công → Retry request với token mới
- Nếu refresh thất bại → Xóa token và redirect về `/signin`

---

## 🔄 Luồng Hoạt Động Khi App Khởi Động

### **Bước 1: App Khởi Động**
```
1. index.js render App
2. Redux store khởi tạo
3. authSlice.getInitialState() được gọi
```

### **Bước 2: Kiểm Tra Token**
```
4. localStorage.getItem('token') → Lấy token
5. Nếu có token:
   - jwtDecode(token) → Decode JWT
   - Lấy user info từ token
   - Set isAuthenticated = true
6. Nếu không có token:
   - Set isAuthenticated = false
```

### **Bước 3: App Render**
```
7. App.js render với auth state từ Redux
8. Components check isAuthenticated để hiển thị UI
9. Nếu isAuthenticated = true → User thấy UI đã login
```

### **Bước 4: Khi Gọi API**
```
10. Axios interceptor tự động thêm token vào header
11. Nếu token hết hạn → Backend trả về 401
12. Interceptor thử refresh token
13. Nếu refresh thành công → Retry request
14. Nếu refresh thất bại → Redirect về /signin
```

---

## ⚠️ Lưu Ý Quan Trọng

### ✅ **Ưu Điểm:**
- ✅ User không cần login lại mỗi lần reload page
- ✅ Trải nghiệm mượt mà, không cần chờ API call
- ✅ Token được lưu trong localStorage → Persist qua sessions

### ⚠️ **Nhược Điểm:**
- ⚠️ **KHÔNG verify token với backend khi app khởi động**
- ⚠️ Nếu token hết hạn, user vẫn thấy UI đã login cho đến khi gọi API
- ⚠️ Nếu token bị revoke ở backend, frontend vẫn nghĩ user đã login
- ⚠️ JWT decode chỉ kiểm tra format, không kiểm tra signature với backend

### 🔒 **Bảo Mật:**
- Token được lưu trong `localStorage` → Có thể bị XSS attack
- Nên dùng `httpOnly` cookies cho production (cần backend support)
- Token có expiration time → Tự động hết hạn sau một thời gian

---

## 🛠️ Cách Hoạt Động Chi Tiết

### **Khi User Login Lần Đầu:**

```javascript
// SignIn.jsx
const response = await login({ email, password });
dispatch(setCredentials({
  user: response.user,
  token: response.accessToken
}));
```

**Kết quả:**
- Token được lưu vào `localStorage.setItem('token', token)`
- Redux state được update: `isAuthenticated: true`
- User được redirect về home page

### **Khi App Reload:**

```javascript
// authSlice.js - getInitialState()
const token = localStorage.getItem('token'); // ✅ Lấy token từ localStorage
const decoded = jwtDecode(token); // ✅ Decode JWT (không cần API)
return {
  user: { id, username, role },
  token,
  isAuthenticated: true // ✅ Tự động set là đã login
};
```

**Kết quả:**
- User tự động được coi là đã login
- Không cần gọi API verify token
- UI hiển thị như user đã login

### **Khi Token Hết Hạn:**

```javascript
// services/index.js - Response Interceptor
if (error.response.status === 401) {
  // Thử refresh token
  const { data } = await axios.post('/user/refresh-token');
  // Nếu thành công → Retry request
  // Nếu thất bại → Redirect về /signin
}
```

**Kết quả:**
- User vẫn thấy UI đã login cho đến khi gọi API
- Khi gọi API với token hết hạn → Backend trả 401
- Frontend thử refresh token
- Nếu refresh thành công → User vẫn login
- Nếu refresh thất bại → Redirect về `/signin`

---

## 📝 Tóm Tắt

**Logic tự động login hoạt động như sau:**

1. ✅ **App khởi động** → `getInitialState()` kiểm tra `localStorage.getItem('token')`
2. ✅ **Nếu có token** → Decode JWT và set `isAuthenticated: true`
3. ✅ **User tự động được coi là đã login** → Không cần gọi API
4. ⚠️ **Token chỉ được verify khi gọi API** → Nếu token hết hạn, sẽ thử refresh
5. ⚠️ **Nếu refresh thất bại** → Xóa token và redirect về `/signin`

**File chính chứa logic:**
- `front-end/src/features/auth/authSlice.js` - Logic tự động login
- `front-end/src/services/index.js` - Axios interceptors
- `front-end/src/redux/store.js` - Redux Persist config

---

**Ngày tạo:** 2025-12-17
**Mục đích:** Giải thích logic tự động login khi chạy `npm start`


