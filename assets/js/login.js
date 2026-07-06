// toast
let currentToast = null;

// Hàm hiển thị thông báo thành công (Màu xanh)
const showSuccess = (message) => {
  if (currentToast) currentToast.hideToast();

  currentToast = Toastify({
    text: message,
    duration: 3000,
    gravity: "top",
    position: "right",
    style: {
      background: "rgba(75, 247, 13, 0.9)",
      color: "#ffffff",
      borderRadius: "8px",
    },
  });
  currentToast.showToast();
};

// Hàm hiển thị thông báo lỗi (Màu đỏ)
const showError = (message) => {
  if (currentToast) currentToast.hideToast();

  currentToast = Toastify({
    text: message,
    duration: 3000,
    gravity: "top",
    position: "right",
    style: { background: "#ef4444", color: "#ffffff", borderRadius: "8px" }, // Màu đỏ cho lỗi
  });
  currentToast.showToast();
};
// change form
const loginForm = document.querySelector(".login-form");
const registerForm = document.querySelector(".register-form");
const wrapper = document.querySelector(".wrapper");
const title = document.querySelector(".title");

const registerFunction = () => {
  registerForm.classList.remove("hidden-form");
  registerForm.classList.add("show-form");
  loginForm.classList.add("hidden-form");

  wrapper.classList.remove("login-mode");
  wrapper.classList.add("register-mode");
  title.textContent = "Đăng ký";
};

const loginFunction = () => {
  registerForm.classList.add("hidden-form");
  registerForm.classList.remove("show-form");
  loginForm.classList.remove("hidden-form");

  wrapper.classList.remove("register-mode");
  wrapper.classList.add("login-mode");
  title.textContent = "Đăng nhập";
};

const resetReg = document.getElementById("reset-reg");
resetReg.addEventListener("click", () => {
  registerForm.reset();
});

const resetLog = document.getElementById("reset-log");
resetReg.addEventListener("click", () => {
  loginForm.reset();
});

const today = new Date();
const hour = today.getHours();
let greeting;
if (hour > 18) {
  greeting = "MELLOW chúc bạn có một buổi tối vui vẻ 🌙";
} else if (hour > 12) {
  greeting = "MELLOW chúc bạn có một buổi chiều vui vẻ 🌤️";
} else {
  greeting = "MELLOW chúc bạn có một buổi sáng vui vẻ ☀️";
}

// document.getElementById("greeting").innerHTML = greeting;

/*=== SHOW/HIDE PASS ===*/
const passwordInputs = document.querySelectorAll(".password-input");
passwordInputs.forEach((input) => {
  const eye = input.parentElement.querySelector(".toggle");

  input.addEventListener("input", () => {
    if (input.value.length > 0) {
      eye.style.opacity = "1";
      eye.style.visibility = "visible";
    } else {
      eye.style.opacity = "0";
      eye.style.visibility = "hidden";
    }
  });
});

const toggles = document.querySelectorAll(".toggle");
toggles.forEach((toggle) => {
  toggle.addEventListener("click", () => {
    const input = toggle.parentElement.querySelector(".password-input");

    if (input.type === "password") {
      input.type = "text";
      toggle.classList.remove("ri-eye-off-fill");
      toggle.classList.add("ri-eye-fill");
    } else {
      input.type = "password";
      toggle.classList.remove("ri-eye-fill");
      toggle.classList.add("ri-eye-off-fill");
    }
  });
});

/*=== ĐỊNH DẠNG ===*/
const phoneRegex = /^(0[35789])+([0-9]{8})$/;

/*============== 
     ĐĂNG KÝ 
===============*/
if (registerForm) {
  registerForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const emailInput = document.getElementById("reg-mail");
    const phoneInput = document.getElementById("reg-phone");
    const passwordInput = document.getElementById("reg-pass");
    const confirmPasswordInput = document.getElementById("reg-confirmPass");

    const name = document.getElementById("reg-name").value.trim();
    const email = emailInput.value.trim();
    const phone = phoneInput.value.trim();
    const password = passwordInput.value.trim();
    const confirmPassword = confirmPasswordInput.value.trim();

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

    // Lưu localStorage
    // || [] tránh lỗi khi chưa có user nào localstorage trả về NULL
    const users = JSON.parse(localStorage.getItem("users")) || [];

    const isExist = users.some((u) => u.email === email);
    if (isExist || email === "admin@gmail.com") {
      showError("Email này đã được sử dụng");
      emailInput.parentElement.classList.add("error-input");
      return;
    }

    const id = users.length > 0 ? users[users.length - 1].id + 1 : 1;
    const user = { id, name, email, phone, password };
    users.push(user);
    localStorage.setItem("users", JSON.stringify(users));

    showSuccess("Đăng Ký Thành Công");
    registerForm.reset();
    loginFunction();
  });

  document.getElementById("reg-phone").addEventListener("input", (event) => {
    if (phoneRegex.test(event.target.value)) {
      event.target.parentElement.classList.remove("error-input");
    }
  });

  document.getElementById("reg-pass").addEventListener("input", (event) => {
    if (event.target.value.length >= 8) {
      event.target.classList.remove("error-input");
    }
  });

  document
    .getElementById("reg-confirmPass")
    .addEventListener("input", (event) => {
      if (event.target.value.length >= 8) {
        event.target.classList.remove("error-input");
      }
    });
}

/*=============
   Đăng nhập
==============*/
if (loginForm) {
  // test account
  const testUser = {
    id: 0,
    name: "test",
    email: "test@gmail.com",
    password: "12345678",
  };

  localStorage.setItem("testUser", JSON.stringify(testUser));

  loginForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const emailInput = document.getElementById("log-mail");
    const passwordInput = document.getElementById("log-pass");

    const email = document.getElementById("log-mail").value.trim();
    const password = document.getElementById("log-pass").value.trim();

    if (email === testUser.email && password === testUser.password) {
      localStorage.setItem("currentUser", JSON.stringify(testUser));
      console.log(localStorage.getItem("currentUser"));
      // sessionStorage.setItem("toastMessage", "Chào mừng bạn đã đến với MELLOW");
      /* đợi trang Home */
      // showSuccess("Chào mừng bạn đã đến với MELLOW");
      window.location.href = "index.html";
      return;
    }

    // normal account
    if (password.length < 8) {
      showError("Sai mật khẩu vui lòng nhập lại");
      passwordInput.parentElement.classList.add("error-input");
      return;
    }
    // find user
    const users = JSON.parse(localStorage.getItem("users")) || [];
    const user = users.find(
      (u) => u.email === email && u.password === password,
    );

    if (!user) {
      showError("Sai tài khoản hoặc mật khẩu vui lòng thử lại");
      return;
    }
    loginForm.reset();

    localStorage.setItem("currentUser", JSON.stringify(user));
    window.location.href = "index.html";
  });

  // Gõ đủ tự xóa viền đỏ
  document.getElementById("log-pass").addEventListener("input", function () {
    if (this.value.trim().length >= 8) {
      this.parentElement.classList.remove("error-input");
    }
  });
}
