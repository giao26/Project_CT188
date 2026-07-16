// ==============================================================
// TÁC GIẢ
//         HUỲNH LÊ NHỰT TIẾN
//         B2405058
// ===============================================================

// ===============================================================
// LOGIN.JS - Xử lý tương tác trang Đăng nhập / Đăng ký của MELLOW
// ===============================================================
// File này xử lý toàn bộ logic cho giao diện với các tính năng chính:
//  1. Hiển thị thông báo Toastify động.
//  2. Chuyển đổi mượt mà giữa form Đăng nhập/Đăng ký.
//  3. Lời chào thay đổi theo thời gian thực (sáng, trưa, chiều, tối).
//  4. Validate dữ liệu chặt chẽ và quản lý người dùng qua LocalStorage.

// =============================
// CẤU HÌNH THÔNG BÁO (TOASTIFY)
// =============================
// Biến lưu trữ toast hiện tại để tránh hiện chồng chéo nhiều thông báo cùng lúc
let currentToast = null;

// Hàm hiển thị thông báo thành công (Màu xanh) sử dụng Toastify
const showSuccess = (message) => {
  if (currentToast) currentToast.hideToast(); // Ẩn ngay thông báo cũ nếu có

  currentToast = Toastify({
    text: message,
    duration: 5000,
    gravity: "top",
    position: "right",
    offset: {
      x: 5,
      y: 90, // Canh lề trục y để không đè lên thanh header
    },
    style: {
      background: "rgba(34, 197, 94, 0.9)",
      color: "#ffffff",
      borderRadius: "8px",
    },
  });
  currentToast.showToast();
};

// Hàm hiển thị thông báo lỗi (Màu đỏ) sử dụng Toastify
const showError = (message) => {
  if (currentToast) currentToast.hideToast();

  currentToast = Toastify({
    text: message,
    duration: 5000,
    gravity: "top",
    position: "right",
    offset: {
      x: 5,
      y: 90,
    },
    style: { background: "#ef4444", color: "#ffffff", borderRadius: "8px" },
  });
  currentToast.showToast();
};

// ====================================
// CHUYỂN ĐỔI FORM ĐĂNG NHẬP VÀ ĐĂNG KÝ
// ====================================

const loginForm = document.querySelector(".login-form");
const registerForm = document.querySelector(".register-form");
const wrapper = document.querySelector(".wrapper");
const title = document.querySelector(".title");

// Hàm chuyển sang giao diện Đăng ký
const registerFunction = () => {
  registerForm.classList.remove("hidden-form");
  registerForm.classList.add("show-form");
  loginForm.classList.add("hidden-form");

  wrapper.classList.remove("login-mode");
  wrapper.classList.add("register-mode"); // Đổi chiều cao khung chứa form
  title.textContent = "Đăng ký"; // Cập nhật thẻ tiêu đề
};

// Hàm chuyển sang giao diện Đăng nhập
const loginFunction = () => {
  registerForm.classList.add("hidden-form");
  registerForm.classList.remove("show-form");
  loginForm.classList.remove("hidden-form");

  wrapper.classList.remove("register-mode");
  wrapper.classList.add("login-mode");
  title.textContent = "Đăng nhập";
};

// Reset form (xóa trắng dữ liệu đang nhập dở) khi ấn chuyển qua lại
const resetReg = document.getElementById("reset-reg");
resetReg.addEventListener("click", () => {
  registerForm.reset();
});

const resetLog = document.getElementById("reset-log");
resetLog.addEventListener("click", () => {
  loginForm.reset();
});

// ============================
// LỜI CHÀO THEO THỜI GIAN THỰC
// ============================
const setGreeting = () => {
  const today = new Date();
  const hour = today.getHours(); // Lấy số giờ hiện tại
  let greeting = "";
  let gradient = "";

  // Tùy chỉnh câu chúc và dải màu gradient tương ứng với buổi trong ngày
  if (hour >= 5 && hour < 12) {
    greeting = "MELLOW chúc bạn có một buổi sáng vui vẻ ☀️";
    gradient = "linear-gradient(135deg, #f97316, #fbbf24)";
  } else if (hour >= 12 && hour < 18) {
    greeting = "MELLOW chúc bạn có một buổi chiều vui vẻ 🌤️";
    gradient = "linear-gradient(135deg, #f97316, #ef4444)";
  } else if (hour >= 18 && hour < 23) {
    greeting = "MELLOW chúc bạn có một buổi tối vui vẻ 🌙";
    gradient = "linear-gradient(135deg, #3b82f6, #60a5fa)";
  } else {
    greeting = "MELLOW chúc bạn ngủ ngon 💤";
    gradient = "linear-gradient(135deg, #6366f1, #111827)";
  }

  // Cập nhật DOM
  document.getElementById("greeting").innerHTML = greeting;
  document.getElementById("greeting").style.background = gradient;
};
setGreeting(); // Gọi ngay lần đầu load trang
setInterval(setGreeting, 60000); // Lặp lại hàm kiểm tra mỗi 1 phút để giữ tính chính xác

// ===========================
// HIỂN THỊ / ẨN MẬT KHẨU
// ===========================
const passwordInputs = document.querySelectorAll(".password-input");

// Tính năng 1: Bắt đầu gõ phím mới hiện icon con mắt
passwordInputs.forEach((input) => {
  const eye = input.parentElement.querySelector(".toggle");

  input.addEventListener("input", () => {
    if (input.value.length > 0) {
      eye.style.opacity = "1";
      eye.style.visibility = "visible";
    } else {
      eye.style.opacity = "0"; // Ẩn đi nếu ô input rỗng
      eye.style.visibility = "hidden";
    }
  });
});

// Tính năng 2: Click vào icon con mắt để Toggle type password <-> text
const toggles = document.querySelectorAll(".toggle");
toggles.forEach((toggle) => {
  toggle.addEventListener("click", () => {
    const input = toggle.parentElement.querySelector(".password-input");

    if (input.type === "password") {
      input.type = "text"; // Chuyển thành dạng text để xem mật khẩu
      toggle.classList.remove("ri-eye-off-fill");
      toggle.classList.add("ri-eye-fill"); // Đổi sang icon mở mắt
    } else {
      //ngược lại
      input.type = "password";
      toggle.classList.remove("ri-eye-fill");
      toggle.classList.add("ri-eye-off-fill");
    }
  });
});

// ===========================
// VALIDATE DỮ LIỆU & TIỆN ÍCH
// ===========================
// Bắt buộc SĐT VN và Email dùng đuôi .com hoặc .vn
const phoneRegex = /^(0[35789])+([0-9]{8})$/;
const emailRegex = /^[A-Za-z0-9._%+-]+@(?:[A-Za-z0-9-]+\.)+(?:com|vn)$/i;

// Tự động xóa class báo đỏ lỗi ngay khi người dùng gõ lại khớp với điều kiện
const removeError = (input, condition) => {
  input.addEventListener("input", () => {
    if (condition()) {
      input.parentElement.classList.remove("error-input");
    }
  });
};

// ===========================
//    XỬ LÝ FORM ĐĂNG KÝ
// ===========================
const nameInput = document.getElementById("reg-name");
const emailInput = document.getElementById("reg-email");
const phoneInput = document.getElementById("reg-phone");
const passwordInput = document.getElementById("reg-pass");
const confirmPasswordInput = document.getElementById("reg-confirmPass");

if (registerForm) {
  registerForm.addEventListener("submit", (event) => {
    event.preventDefault(); // Chặn hành động nạp lại trang mặc định

    // Bóc tách dữ liệu nhập vào và trim() dùng loại bỏ dấu cách dư thừa
    const name = document.getElementById("reg-name").value.trim();
    const email = emailInput.value.trim().toLowerCase();
    const phone = phoneInput.value.trim();
    const password = passwordInput.value.trim();
    const confirmPassword = confirmPasswordInput.value.trim();

    // Chuỗi các điều kiện kiểm tra Validate đầu vào, nếu sai sẽ hiện Toastify + Thêm class đỏ bọc viền input
    let hasError = false;

    if (!name) {
      nameInput.parentElement.classList.add("error-input");
      hasError = true;
    }

    if (!email) {
      emailInput.parentElement.classList.add("error-input");
      hasError = true;
    }

    if (!phone) {
      phoneInput.parentElement.classList.add("error-input");
      hasError = true;
    }

    if (!password) {
      passwordInput.parentElement.classList.add("error-input");
      hasError = true;
    }

    if (!confirmPassword) {
      confirmPasswordInput.parentElement.classList.add("error-input");
      hasError = true;
    }

    if (hasError) {
      showError("Vui lòng nhập đầy đủ thông tin");
      return;
    }

    if (!emailRegex.test(email)) {
      showError("Email không đúng định dạng");
      emailInput.parentElement.classList.add("error-input");
      return;
    }

    if (!phoneRegex.test(phone)) {
      showError("Số điện thoại không hợp lệ");
      phoneInput.parentElement.classList.add("error-input");
      return;
    }

    if (password.length < 8) {
      showError("Mật khẩu phải có ít nhất 8 kí tự");
      passwordInput.parentElement.classList.add("error-input");
      return;
    }

    if (password !== confirmPassword) {
      showError("Mật khẩu xác nhận không đúng");
      confirmPasswordInput.parentElement.classList.add("error-input");
      return;
    }

    // Đọc data từ localStorage và khởi tạo mảng rỗng nếu chưa từng có data
    const users = JSON.parse(localStorage.getItem("users")) || [];

    // Chặn trùng lặp email và chặn luôn email test hệ thống
    // .some() trả về true nếu có ít nhất 1 phần tử thỏa điều kiện
    const isExist = users.some((u) => u.email === email);
    if (isExist || email === "test@gmail.com") {
      showError("Email này đã được sử dụng");
      emailInput.parentElement.classList.add("error-input");
      return;
    }

    // Cơ chế tạo ID tăng dần
    const id = users.length > 0 ? users[users.length - 1].id + 1 : 1;
    const user = { id, name, email, phone, password };

    // Ghi lưu dữ liệu vào Storage
    users.push(user);
    localStorage.setItem("users", JSON.stringify(users));

    showSuccess("Đăng Ký Thành Công");
    registerForm.reset();
    loginFunction(); // Trả về giao diện login
  });

  // hàm removeError theo dõi sửa lỗi input
  removeError(nameInput, () => nameInput.value.length > 0);
  removeError(emailInput, () => emailRegex.test(emailInput.value.trim()));
  removeError(phoneInput, () => phoneRegex.test(phoneInput.value.trim()));
  removeError(passwordInput, () => passwordInput.value.length >= 8);
  removeError(
    confirmPasswordInput,
    () =>
      confirmPasswordInput.value === passwordInput.value &&
      passwordInput.value.length >= 8,
  );
}

// ===========================
// XỬ LÝ FORM ĐĂNG NHẬP
// ===========================
const emailLogInput = document.getElementById("log-email");
const passwordLogInput = document.getElementById("log-pass");

if (loginForm) {
  // tài khoản thử nghiệm nhanh
  const testUser = {
    id: 999,
    name: "test",
    email: "test@gmail.com",
    password: "12345678",
  };

  // lưu localstorage cho người dùng muốn xem và trải nghiệm thử
  localStorage.setItem("testUser", JSON.stringify(testUser));

  loginForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const email = emailLogInput.value.trim().toLowerCase();
    const password = passwordLogInput.value.trim();

    // Chuỗi các điều kiện kiểm tra Validate đầu vào, nếu sai sẽ hiện Toastify + Thêm class đỏ bọc viền input
    let hasError = false;

    if (!email) {
      emailLogInput.parentElement.classList.add("error-input");
      hasError = true;
    }

    if (!password) {
      passwordLogInput.parentElement.classList.add("error-input");
      hasError = true;
    }

    if (hasError) {
      showError("Vui lòng nhập email và mật khẩu");
      return;
    }

    // Check account test
    if (email === testUser.email && password === testUser.password) {
      localStorage.setItem("currentUser", JSON.stringify(testUser));
      localStorage.setItem(
        "toastMessage",
        "Chào mừng testUser đã đến với MELLOW",
      );
      window.location.href = "index.html"; // Redirect về trang chủ
      return;
    }

    // Validate email
    if (!emailRegex.test(email)) {
      showError("Email không đúng định dạng");
      emailLogInput.parentElement.classList.add("error-input");
      return;
    }

    // Tìm kiếm trong Storage
    // .find() trả về phần tử đầu tiên thỏa điều kiện, hoặc undefined nếu không tìm thấy
    const users = JSON.parse(localStorage.getItem("users")) || [];
    const user = users.find(
      (u) => u.email === email && u.password === password,
    );

    // Xử lý báo lỗi nếu không tìm thấy user
    if (!user) {
      showError("Sai tài khoản hoặc mật khẩu vui lòng thử lại");
      return;
    }

    // Dọn sạch form khi đã đăng nhập
    loginForm.reset();

    // Đặt biến nội dung toastMessage để trang index.html đọc và hiển thị câu Welcome khi chuyển hướng
    localStorage.setItem(
      "toastMessage",
      `Chào mừng ${user.name} đã đến với MELLOW 🎉`,
    );
    // Lưu user vừa đăng nhập thành currentUser để xác định người dùng
    localStorage.setItem("currentUser", JSON.stringify(user));
    window.location.href = "index.html";
  });
  // hàm removeError theo dõi sửa lỗi input
  removeError(emailLogInput, () => emailRegex.test(emailLogInput.value.trim()));
  removeError(passwordLogInput, () => passwordLogInput.value.length >= 8);
}
