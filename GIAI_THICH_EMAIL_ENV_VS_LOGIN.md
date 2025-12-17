# 🔍 Giải Thích: EMAIL_USER/EMAIL_PASS trong .env KHÔNG phải để Login

## ❌ Hiểu Nhầm

Bạn đang nghĩ rằng:
- `EMAIL_USER=winfourt4@gmail.com` trong `.env` được dùng để tự động login
- `EMAIL_PASS=poth jzta gtby ldyz` trong `.env` được dùng để tự động login

**❌ SAI!** Đây là hiểu nhầm.

---

## ✅ Sự Thật

### **EMAIL_USER và EMAIL_PASS trong .env dùng để GỬI EMAIL**

**File:** `back-end/src/services/emailService.js`

```4:13:back-end/src/services/emailService.js
console.log('EMAIL_USER:', process.env.EMAIL_USER);
console.log('EMAIL_PASS:', process.env.EMAIL_PASS ? '[REDACTED]' : 'undefined');

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.EMAIL_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});
```

**Mục đích:**
- ✅ Gửi email quên mật khẩu
- ✅ Gửi email chào mừng khi đăng ký
- ✅ Gửi email thông báo đơn hàng
- ❌ **KHÔNG dùng để login**

---

## 🔐 Logic Login Thực Sự Hoạt Động Như Thế Nào?

### **Bước 1: User Nhập Email/Password vào Form**

**File:** `front-end/src/pages/SignIn.jsx`

```42:56:front-end/src/pages/SignIn.jsx
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const response = await login({
        email: formData.email,  // ← Email từ FORM, KHÔNG phải từ .env
        password: formData.password  // ← Password từ FORM, KHÔNG phải từ .env
      });
      
      // Ensure we use accessToken consistently
      dispatch(setCredentials({
        user: response.user,
        token: response.accessToken || response.token
      }));
```

**Lưu ý:**
- Email và password đến từ **form input** của user
- **KHÔNG** lấy từ `.env` file

---

### **Bước 2: Frontend Gửi Request đến Backend**

**File:** `front-end/src/services/authService.js`

```6:16:front-end/src/services/authService.js
export const login = async (credentials) => {
  try {
    const response = await axios.post(`${API_URL}/login`, credentials);
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || 
      'Đã xảy ra lỗi khi đăng nhập'
    );
  }
};
```

**Request gửi đi:**
```json
{
  "email": "user@example.com",  // ← Từ form
  "password": "userpassword"     // ← Từ form
}
```

---

### **Bước 3: Backend Verify Email/Password**

**File:** `back-end/src/controllers/authController.js`

```75:116:back-end/src/controllers/authController.js
// Đăng nhập
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;  // ← Lấy từ request body

    // Kiểm tra đầu vào
    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Email và password là bắt buộc" });
    }

    // Tìm người dùng theo email
    const user = await User.findOne({ email });  // ← Tìm trong MongoDB
    if (!user) {
      return res.status(400).json({ success: false, message: "Thông tin đăng nhập không hợp lệ" });
    }

    // Kiểm tra mật khẩu
    const isMatch = await user.comparePassword(password);  // ← So sánh với password đã hash trong DB
    if (!isMatch) {
      return res.status(400).json({ success: false, message: "Thông tin đăng nhập không hợp lệ" });
    }

    // Tạo JWT token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({
      success: true,
      token,  // ← Trả về token
      user: {
        id: user._id,
        username: user.username,
        role: user.role,
      },
    });
  } catch (error) {
    logger.error("Lỗi đăng nhập:", error);
    res.status(500).json({ success: false, message: "Lỗi server" });
  }
};
```

**Quá trình:**
1. ✅ Lấy `email` và `password` từ **request body** (từ form)
2. ✅ Tìm user trong **MongoDB** theo email
3. ✅ So sánh password với **password đã hash trong database**
4. ✅ Nếu đúng → Tạo JWT token và trả về
5. ❌ **KHÔNG** dùng `EMAIL_USER` hoặc `EMAIL_PASS` từ `.env`

---

### **Bước 4: Frontend Lưu Token vào localStorage**

**File:** `front-end/src/features/auth/authSlice.js`

```36:43:front-end/src/features/auth/authSlice.js
    setCredentials: (state, action) => {
      const { user, token } = action.payload;
      state.user = user;
      state.token = token;
      state.isAuthenticated = true;
      localStorage.setItem('token', token);  // ← Lưu token vào localStorage
      localStorage.setItem('accessToken', token);
    },
```

**Kết quả:**
- Token được lưu vào `localStorage.setItem('token', token)`
- Token này được dùng cho các lần login tự động sau

---

### **Bước 5: Lần Sau App Khởi Động - Tự Động Login**

**File:** `front-end/src/features/auth/authSlice.js`

```5:30:front-end/src/features/auth/authSlice.js
// Sửa: Đảm bảo luôn trả về object hợp lệ
const getInitialState = () => {
  try {
    const token = localStorage.getItem('token');  // ← Lấy token từ localStorage
    if (token) {
      const decoded = jwtDecode(token);  // ← Decode JWT (không cần gọi API)
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
```

**Quá trình:**
1. ✅ Lấy token từ **localStorage** (không phải từ `.env`)
2. ✅ Decode JWT để lấy thông tin user
3. ✅ Set `isAuthenticated: true`
4. ❌ **KHÔNG** dùng `EMAIL_USER` hoặc `EMAIL_PASS` từ `.env`

---

## 📊 So Sánh

| Thứ | EMAIL_USER/EMAIL_PASS trong .env | Token trong localStorage |
|-----|--------------------------------|-------------------------|
| **Mục đích** | Gửi email (forgot password, welcome, etc.) | Xác thực user đã login |
| **Dùng khi nào** | Backend gửi email | Frontend tự động login |
| **Lấy từ đâu** | File `.env` | `localStorage.getItem('token')` |
| **Có dùng để login không?** | ❌ KHÔNG | ✅ CÓ |

---

## 🔄 Luồng Hoạt Động Đầy Đủ

### **Lần Đầu Login:**

```
1. User nhập email/password vào form SignIn
   ↓
2. Frontend gửi POST /api/login với { email, password }
   ↓
3. Backend tìm user trong MongoDB theo email
   ↓
4. Backend so sánh password với password đã hash trong DB
   ↓
5. Nếu đúng → Backend tạo JWT token và trả về
   ↓
6. Frontend lưu token vào localStorage.setItem('token', token)
   ↓
7. User được coi là đã login
```

### **Lần Sau App Khởi Động:**

```
1. App khởi động
   ↓
2. getInitialState() gọi localStorage.getItem('token')
   ↓
3. Nếu có token → Decode JWT
   ↓
4. Set isAuthenticated = true
   ↓
5. User tự động được coi là đã login
   (KHÔNG cần nhập email/password lại)
```

---

## ❓ Câu Hỏi Thường Gặp

### **Q: Tại sao EMAIL_USER và EMAIL_PASS lại có trong .env?**

**A:** Để backend có thể gửi email:
- Email quên mật khẩu
- Email chào mừng khi đăng ký
- Email thông báo đơn hàng
- **KHÔNG** dùng để login

### **Q: Làm sao app biết user nào đã login?**

**A:** 
- Lần đầu: User nhập email/password → Backend verify → Trả về token → Lưu vào localStorage
- Lần sau: App lấy token từ localStorage → Decode JWT → Biết user nào

### **Q: Token lấy từ đâu?**

**A:** 
- ✅ Từ `localStorage.getItem('token')` (sau khi login thành công)
- ❌ **KHÔNG** từ `.env` file

---

## 📝 Tóm Tắt

1. ✅ **EMAIL_USER và EMAIL_PASS trong .env** → Dùng để **gửi email**, không dùng để login
2. ✅ **Logic tự động login** → Dùng **token từ localStorage**, không dùng email/password từ .env
3. ✅ **Token được tạo** → Khi user login thành công với email/password từ **form**
4. ✅ **Token được lưu** → Vào `localStorage` sau khi login thành công
5. ✅ **Token được dùng** → Để tự động login lần sau khi app khởi động

**Kết luận:** App **KHÔNG** lấy email/password từ `.env` để login. Nó chỉ dùng token đã lưu trong localStorage từ lần login trước.

---

**Ngày tạo:** 2025-12-17
**Mục đích:** Giải thích sự khác biệt giữa EMAIL_USER/EMAIL_PASS trong .env và logic login


