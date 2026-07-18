//===================================================================================
//                       TÁC GIẢ (Phần trang chủ)
//    Trương Trọng Nguyễn
//    B2410738
//===================================================================================

//===================================================================================
//                       TÁC GIẢ (Logic render header và footer ở các trang)
//    Huỳnh Tấn Giao
//    B2408784
//===================================================================================

// Import hàm tạo header và footer
import createHeader from "./header.js";
import createFooter from "./footer.js";

document.addEventListener("DOMContentLoaded", () => {
  document.querySelector(".header").appendChild(createHeader());
  document.querySelector(".footer").appendChild(createFooter());

  initHeaderEvents();
  updateCartBadge();
  const path = window.location.pathname;
  if (path.endsWith("index.html") || path.endsWith("/")) {
    showWelcomeToast(); // Hiển thị toast chào mừng nếu vừa đăng nhập thành công
  }
});

// ===========================
// HIỂN THỊ TOAST CHÀO MỪNG SAU KHI ĐĂNG NHẬP
// ===========================
/**
 * Đọc "toastMessage" từ localStorage (được login.js ghi trước khi redirect).
 * Nếu có, hiển thị thông báo Toastify màu xanh lá rồi xóa key để tránh lặp lại khi F5.
 */
function showWelcomeToast() {
  const message = localStorage.getItem("toastMessage");
  if (!message) return;

  // Xóa ngay để tránh hiện lại khi người dùng F5
  localStorage.removeItem("toastMessage");

  // Dùng setTimeout nhỏ để đảm bảo Toastify đã được load xong
  setTimeout(() => {
    if (typeof Toastify === "function") {
      Toastify({
        text: message,
        duration: 5000,
        gravity: "top",
        position: "right",
        offset: {
          x: 5,
          y: 90, // Canh lề để không đè lên thanh header
        },
        style: {
          background: "rgba(34, 197, 94, 0.92)",
          color: "#ffffff",
          borderRadius: "8px",
          fontWeight: "600",
          fontSize: "15px",
          boxShadow: "0 4px 15px rgba(34, 197, 94, 0.35)",
        },
      }).showToast();
    }
  }, 300);
}

/**
 * Khởi tạo các sự kiện cho thanh điều hướng (header) như:
 * - Đánh dấu (active) mục menu hiện tại
 * - Đóng/mở menu trên điện thoại (mobile menu)
 * - Quản lý nút Đăng nhập / Đăng xuất tùy theo trạng thái user
 */
function initHeaderEvents() {
  const mobileMenuToggle = document.getElementById("mobile-menu-toggle");
  const mobileMenuClose = document.getElementById("mobile-menu-close");
  const navLinksMenu = document.getElementById("nav-links-menu");
  const navOverlay = document.getElementById("nav-overlay");
  const navLinks = document.querySelectorAll(".nav-links .links");
  // Xử lý active ở thanh điều hướng

  const map = new Map([
    ["index.html", 0],
    ["productlist.html", 1],
    ["about.html", 2],
  ]);

  const path = window.location.pathname;
  for (const [page, index] of map) {
    // Kiểm tra cả trường hợp path là "/" (Vercel serve index.html qua root URL)
    if (path.endsWith(page) || (index === 0 && (path === "/" || path === ""))) {
      navLinks[index].classList.add("active");
      break;
    }
  }

  // Xử lý đóng/mở Menu di động
  if (mobileMenuToggle && navLinksMenu && navOverlay) {
    // Click nút 3 gạch -> Mở menu
    mobileMenuToggle.addEventListener("click", () => {
      navLinksMenu.classList.add("active");
      navOverlay.classList.add("active");
    });

    const closeMenu = () => {
      navLinksMenu.classList.remove("active");
      navOverlay.classList.remove("active");
    };

    // Click nút chữ X -> Đóng menu
    if (mobileMenuClose) {
      mobileMenuClose.addEventListener("click", closeMenu);
    }

    // Click vùng nền mờ bên ngoài -> Đóng menu
    navOverlay.addEventListener("click", closeMenu);

    // Click các liên kết bên trong menu -> Tự động đóng menu để chuyển trang
    const menuLinks = navLinksMenu.querySelectorAll("a");
    menuLinks.forEach((link) => {
      link.addEventListener("click", closeMenu);
    });
  }

  // --- XỬ LÝ TRẠNG THÁI ĐĂNG NHẬP & NÚT ĐĂNG XUẤT ---
  const userAccountBtn = document.getElementById("user-account-btn");
  if (userAccountBtn) {
    const currentUserRaw = localStorage.getItem("currentUser");

    if (currentUserRaw) {
      // Trường hợp: Đã đăng nhập thành công
      let displayUsername = "User";
      try {
        const userObj = JSON.parse(currentUserRaw);
        displayUsername = userObj.name || "User";
      } catch (e) {
        displayUsername = currentUserRaw;
      }

      // Hiển thị lời chào dạng text thay vì icon hình người
      // Xóa con của userAccountBtn bằng removeChild và thêm span/createTextNode để tránh innerHTML
      while (userAccountBtn.firstChild)
        userAccountBtn.removeChild(userAccountBtn.firstChild);
      const welcomeSpan = document.createElement("span");
      welcomeSpan.classList.add("welcome");
      welcomeSpan.style.fontSize = "14px";
      welcomeSpan.style.fontWeight = "700";
      welcomeSpan.style.whiteSpace = "nowrap";
      welcomeSpan.appendChild(
        document.createTextNode(`Hi, ${displayUsername}`),
      );
      userAccountBtn.appendChild(welcomeSpan);
      userAccountBtn.title = "Tài khoản của tôi";
      userAccountBtn.style.pointerEvents = "none"; // Khóa chuyển hướng sang trang login khi đã đăng nhập

      // Tự động tạo nút Log out bằng code JS (nếu chưa tồn tại)
      let logoutBtn = document.getElementById("logout-btn");
      if (!logoutBtn) {
        logoutBtn = document.createElement("a");
        logoutBtn.id = "logout-btn";
        logoutBtn.href = "#";
        logoutBtn.title = "Đăng xuất";
        // Tạo icon dạng Element thay vì innerHTML string
        const logoutIcon = document.createElement("i");
        logoutIcon.classList.add("ti", "ti-logout");
        logoutIcon.style.fontWeight = "bold";
        logoutIcon.style.marginLeft = "15px";
        logoutBtn.appendChild(logoutIcon);
        userAccountBtn.parentNode.insertBefore(
          logoutBtn,
          userAccountBtn.nextSibling,
        );
      }

      // Sự kiện Click vào nút Đăng xuất
      logoutBtn.addEventListener("click", (e) => {
        e.preventDefault();
        const confirmLogout = confirm(
          "Bạn có chắc chắn muốn đăng xuất tài khoản không?",
        );
        if (confirmLogout) {
          localStorage.removeItem("currentUser");
          alert("Đăng xuất thành công!");
          window.location.reload();
        }
      });
    } else {
      // Trả lại icon hình người ban đầu, dùng removeChild + appendChild thay vì innerHTML
      while (userAccountBtn.firstChild)
        userAccountBtn.removeChild(userAccountBtn.firstChild);
      const userIcon = document.createElement("i");
      userIcon.classList.add("ti", "ti-user");
      userAccountBtn.appendChild(userIcon);
      userAccountBtn.title = "Tài khoản";
      userAccountBtn.style.pointerEvents = "auto";

      userAccountBtn.addEventListener("click", (e) => {
        e.preventDefault();
        window.location.href = "login.html";
      });

      // Xóa nút đăng xuất nếu có
      const existingLogoutBtn = document.getElementById("logout-btn");
      if (existingLogoutBtn) {
        existingLogoutBtn.remove();
      }
    }
  }
}

// --- 2. CẬP NHẬT SỐ LƯỢNG SẢN PHẨM TRONG GIỎ HÀNG ---
/**
 * Hàm này được để ở phạm vi toàn cục (global) để các trang/file JS khác có thể gọi tải lại số lượng khi thêm sản phẩm
 * Nó tính toán tổng số loại sản phẩm có trong giỏ hàng (cartMap) của người dùng hiện tại
 */
function updateCartBadge() {
  const cartBadge = document.querySelector(".cart-badge");
  if (!cartBadge) return;

  const currentUserRaw = localStorage.getItem("currentUser");

  if (!currentUserRaw) {
    // Thay đổi số lượng giỏ hàng bằng removeChild + createTextNode để tránh dùng textContent trực tiếp
    while (cartBadge.firstChild) cartBadge.removeChild(cartBadge.firstChild);
    cartBadge.appendChild(document.createTextNode("0"));
    return;
  }

  try {
    const currentUser = JSON.parse(currentUserRaw);
    if (!currentUser || !currentUser.id) {
      while (cartBadge.firstChild) cartBadge.removeChild(cartBadge.firstChild);
      cartBadge.appendChild(document.createTextNode("0"));
      return;
    }

    const userId = currentUser.id;
    const jsonString = localStorage.getItem("cartMap");

    const cartMap = jsonString ? new Map(JSON.parse(jsonString)) : new Map();
    const cartList = cartMap.get(userId) || [];

    // Cộng dồn thuộc tính .quantity của từng item trong giỏ

    while (cartBadge.firstChild) cartBadge.removeChild(cartBadge.firstChild);
    cartBadge.appendChild(document.createTextNode(cartList.length));
  } catch (error) {
    while (cartBadge.firstChild) cartBadge.removeChild(cartBadge.firstChild);
    cartBadge.appendChild(document.createTextNode("0"));
  }
}
window.updateCartBadge = updateCartBadge;
