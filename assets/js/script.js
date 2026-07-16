//===================================================================
//                       TÁC GIẢ (Phần render Header và Footer)
//    HUỲNH TẤN GIAO
//    B2408784
//===================================================================

document.addEventListener("DOMContentLoaded", async () => {
  await getHeaderAndFooter("#header", "header.html");
  await getHeaderAndFooter("#footer", "footer.html");

  initHeaderEvents();
  updateCartBadge();
  const path = window.location.pathname;
  if (path.endsWith("index.html") || path.endsWith("/")) {
    initHomePageEvent();
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
  }, 300);
}

/**
 * Hàm tải nội dung HTML của header và footer từ các file tương ứng (header.html, footer.html)
 * Sử dụng Fetch API để chèn nội dung vào các thẻ được chỉ định
 */
const getHeaderAndFooter = async (selector, path) => {
  const targetElement = document.querySelector(selector);
  if (!targetElement) return;
  try {
    const response = await fetch(path);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    targetElement.innerHTML = await response.text();
  } catch (error) {
    console.error(`Lỗi khi tải ${path}:`, error);
  }
};

//=============================================================
//                       TÁC GIẢ (Phần trang chủ)
//    Trương Trọng Nguyễn
//    B2410738
//=============================================================

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
      userAccountBtn.innerHTML = `
                <span class="welcome" style="font-size: 14px; font-weight: 700;  white-space: nowrap;">
                    Hi, ${displayUsername}
                </span>
            `;
      userAccountBtn.title = "Tài khoản của tôi";
      userAccountBtn.style.pointerEvents = "none"; // Khóa chuyển hướng sang trang login khi đã đăng nhập

      // Tự động tạo nút Log out bằng code JS (nếu chưa tồn tại)
      let logoutBtn = document.getElementById("logout-btn");
      if (!logoutBtn) {
        logoutBtn = document.createElement("a");
        logoutBtn.id = "logout-btn";
        logoutBtn.href = "#";
        logoutBtn.title = "Đăng xuất";
        logoutBtn.innerHTML = `<i class="ti ti-logout" style=" font-weight: bold; margin-left: 15px;"></i>`;
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
      // Trường hợp: Chưa đăng nhập, hiển thị icon user mặc định
      userAccountBtn.innerHTML = `<i class="ti ti-user"></i>`;
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
    cartBadge.textContent = "0";
    return;
  }

  try {
    const currentUser = JSON.parse(currentUserRaw);
    if (!currentUser || !currentUser.id) {
      cartBadge.textContent = "0";
      return;
    }

    const userId = currentUser.id;
    const jsonString = localStorage.getItem("cartMap");

    const cartMap = jsonString ? new Map(JSON.parse(jsonString)) : new Map();
    const cartList = cartMap.get(userId) || [];

    // Cộng dồn thuộc tính .quantity của từng item trong giỏ

    cartBadge.textContent = cartList.length;
  } catch (error) {
    console.error("Lỗi xử lý dữ liệu giỏ hàng:", error);
    cartBadge.textContent = "0";
  }
}
window.updateCartBadge = updateCartBadge;

/**
 * Khởi tạo các sự kiện dành riêng cho Trang Chủ (index.html)
 * Chức năng chính: Xử lý tìm kiếm danh mục (hiệu ứng nổi bật khung danh mục theo từ khóa)
 */
function initHomePageEvent() {
  const searchInput = document.getElementById("search-input");
  const searchBtn = document.getElementById("search-btn");
  const searchInputMobile = document.getElementById("search-input-mobile");
  const searchBtnMobile = document.getElementById("search-btn-mobile");
  // ================= XỬ LÝ SỰ KIỆN TÌM KIẾM THEO DANH MỤC TRÊN TRANG CHỦ =================
  if (searchBtn) {
    searchBtn.addEventListener("click", executeSearch);
  }
  if (searchBtnMobile) {
    searchBtnMobile.addEventListener("click", executeSearch);
  }
  if (searchInput) {
    searchInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") executeSearch();
    });
  }
  if (searchInputMobile) {
    searchInputMobile.addEventListener("keypress", (e) => {
      if (e.key === "Enter") executeSearch();
    });
  }
}
