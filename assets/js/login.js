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
const toggles = document.querySelectorAll(".toggle");
toggles.forEach((toggle) => {
  toggle.addEventListener("click", () => {
    const input = toggle.parentElement.querySelector(".password-input");

    if (input.type === "password") {
      input.type = "text";
      toggle.classList.remove("ri-eye-fill");
      toggle.classList.add("ri-eye-off-fill");
    } else {
      input.type = "password";
      toggle.classList.remove("ri-eye-off-fill");
      toggle.classList.add("ri-eye-fill");
    }
  });
});

/*=== ĐỊNH DẠNG ===*/
const phoneRegex = /^(0[35789])+([0-9]{8})$/;

/*============== 
     ĐĂNG KÝ 
===============*/
const notyf = new Notyf({
  duration: 2000,
  position: {
    x: "right",
    y: "top",
  },
});

if (registerForm) {
  registerForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const name = document.getElementById("reg-name").value.trim();
    const email = document.getElementById("reg-mail").value.trim();
    const phone = document.getElementById("reg-phone").value.trim();
    const password = document.getElementById("reg-pass").value.trim();
    const confirmPassword = document
      .getElementById("reg-confirmPass")
      .value.trim();

    if (!phoneRegex.test(phone)) {
      notyf.error("Số điện thoại không hợp lệ");
      return;
    }

    if (password.length < 8) {
      notyf.error("Mật khẩu phải có ít nhất 8 kí tự");
      return;
    }

    if (password !== confirmPassword) {
      notyf.error("Mật khẩu xác nhận không đúng");
      return;
    }

    // Lưu localStorage
    // || [] tránh lỗi khi chưa có user nào localstorage trả về NULL
    const users = JSON.parse(localStorage.getItem("users")) || [];

    const isExist = users.some((u) => u.email === email);
    if (isExist || email === "admin@gmail.com") {
      notyf.error("Email này đã được sử dụng");
      return;
    }

    const id = users.length > 0 ? users[users.length - 1].id + 1 : 1;
    const user = { id, name, email, phone, password };
    users.push(user);
    localStorage.setItem("users", JSON.stringify(users));

    notyf.success("Đăng Ký Thành Công");
    registerForm.reset();
    loginFunction();
  });
}

/*=============
   Đăng nhập
==============*/
if (loginForm) {
  // test account
  const testUser = {
    name: "test",
    email: "test@gmail.com",
    password: "12345678",
  };

  localStorage.setItem("testUser", JSON.stringify(testUser));

  loginForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const email = document.getElementById("log-mail").value.trim();
    const password = document.getElementById("log-pass").value.trim();

    if (email === testUser.email && password === testUser.password) {
      localStorage.setItem("currentUser", JSON.stringify(testUser));
      console.log(localStorage.getItem("currentUser"));
      // sessionStorage.setItem("toastMessage", "Chào mừng bạn đã đến với MELLOW");
      /* đợi trang Home */
      notyf.success("Chào mừng bạn đã đến với MELLOW");
      window.location.href = "index.html";
      return;
    }

    // normal account
    if (password.length < 8) {
      notyf.error("Mật khẩu phải có ít nhất 8 ký tự");
      return;
    }

    // find user
    const users = JSON.parse(localStorage.getItem("users")) || [];
    const user = users.find(
      (u) => u.email === email && u.password === password,
    );

    if (!user) {
      notyf.error("Sai tài khoản hoặc mật khẩu vui lòng thử lại");
      return;
    }
    loginForm.reset();

    localStorage.setItem("currentUser", JSON.stringify(user));
    window.location.href = "index.html";
    // notyf.success("Chào mừng bạn đã đến với MELLOW");
  });
}
