//=============================================================
//                       TÁC GIẢ
//    HUỲNH TẤN GIAO
//    B2408784
//=============================================================

// ============================================================
// PRODUCTLIST.JS — Trang danh sách sản phẩm
// Chức năng:
//   - Hỗ trợ lọc theo danh mục, kiếm theo tên
//   - Đồng bộ trạng thái bộ lọc với URL query string
// ============================================================

// ===== THAM CHIẾU DOM =====
const searchInp = document.getElementById("search-inp"); // Ô nhập từ khóa tìm kiếm
const fillterCategory = document.getElementById("filter-category"); // Dropdown lọc danh mục
const productsList = document.getElementById("product-grid"); // Container chứa lưới sản phẩm
const priceSort = document.getElementById("price-sort"); // Dropdown sắp xếp theo giá
const products = document.querySelectorAll(
  ".product .product-grid .product-card",
); // Danh sách sản phẩm

// ===== TRẠNG THÁI TOÀN CỤC =====
let currentCategory = "default"; // Danh mục đang được lọc ("default" = hiển thị tất cả)
let currentSearch = ""; // Từ khóa gốc (có dấu tiếng Việt) — dùng để hiển thị & lưu URL
let currentSearchNormalized = ""; // Từ khóa đã chuẩn hóa (không dấu) — chỉ dùng để lọc sản phẩm

// ===== HÀM TẢI DỮ LIỆU =====
const initProductListEvent = () => {
  try {
    applyFilter();
    applyUIAction();
  } catch (error) {
    const body = document.querySelector("body");

    while (body.firstChild) body.removeChild(body.firstChild);

    const errorDiv = document.createElement("div");
    errorDiv.style.width = "100%";
    errorDiv.style.textAlign = "center";
    errorDiv.style.padding = "3rem";
    errorDiv.style.color = "var(--color-gray-600)";
    const errorP = document.createElement("p");
    errorP.appendChild(
      document.createTextNode("Không tìm thấy sản phẩm. Vui lòng thử lại sau."),
    );
    errorDiv.appendChild(errorP);
    body.appendChild(errorDiv);
  }
};

// ===== HÀM ĐỒNG BỘ GIAO DIỆN VỚI TRẠNG THÁI =====
/**
 * Sau khi áp dụng bộ lọc từ URL, đồng bộ lại giá trị hiển thị
 * trên các control (ô tìm kiếm, dropdown danh mục, dropdown sắp xếp)
 * để khớp với trạng thái đang lọc.
 */
const applyUIAction = () => {
  searchInp.value = currentSearch; // Hiển thị từ khóa gốc (có dấu)
  // Nếu category là "all" thì hiển thị lại "default" trên dropdown
  fillterCategory.value =
    currentCategory !== "all" ? currentCategory : "default";
};

// ===== HÀM ÁP DỤNG BỘ LỌC & SẮP XẾP =====
/**
 * Đọc các tham số từ URL query string (?category=...&key=...&price=...)
 * rồi lọc và sắp xếp mảng sản phẩm theo thứ tự:
 *  1. Lọc theo danh mục (categorySlug)
 *  2. Sắp xếp theo giá (asc: thấp→cao, desc: cao→thấp)
 *  3. Lọc theo từ khóa tìm kiếm (không phân biệt dấu tiếng Việt)
 * Cuối cùng render lại lưới sản phẩm với kết quả đã xử lý.
 */
const applyFilter = () => {
  const path = new URLSearchParams(window.location.search);

  // Đọc tham số danh mục từ URL (nếu có)
  if (path.get("category"))
    currentCategory =
      path.get("category") !== "all" ? path.get("category") : "default";

  // Đọc tham số từ khóa gốc từ URL (URLSearchParams.get đã tự decode)
  if (path.get("key")) {
    currentSearch = path.get("key").trim().replaceAll("-", " ");
    currentSearchNormalized = removeVietnameseTones(currentSearch);
  }

  // Lọc đồng thời theo danh mục và từ khóa tìm kiếm

  products.forEach((item) => {
    const matchCategory =
      currentCategory === "default" ||
      item.getAttribute("data-category-slug") === currentCategory;

    const matchSearch =
      !currentSearchNormalized ||
      item.getAttribute("product-name").includes(currentSearchNormalized);

    if (matchCategory && matchSearch) {
      item.classList.remove("hidden");
    } else {
      item.classList.add("hidden");
    }
  });

  //loadProductList(products);
};

// ===== HÀM CHUẨN HÓA CHUỖI TIẾNG VIỆT =====
function removeVietnameseTones(str) {
  if (!str) return "";

  str = str.toLowerCase();

  // Tách tổ hợp ký tự Unicode, xóa các dấu kết hợp (combining marks)
  str = str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

  // Xử lý riêng ký tự đ/Đ vì NFD không phân tách được
  str = str.replace(/[đĐ]/g, "d");

  // Xóa khoảng trắng đầu/cuối và thu gọn nhiều khoảng trắng liên tiếp
  str = str.trim().replace(/\s+/g, " ");

  return str;
}

// ===== HÀM CẬP NHẬT URL =====
/**
 * Ghi trạng thái bộ lọc hiện tại vào URL query string rồi reload trang.
 * Trang sẽ tự đọc lại URL và áp dụng bộ lọc khi load lại.
 * - category: slug danh mục đang chọn ("all" nếu là "default")
 * - key: từ khóa tìm kiếm (thay khoảng trắng bằng "-" để đưa lên URL)
 */
const updateURL = () => {
  // Lưu từ khóa gốc (có dấu) lên URL, thay khoảng trắng bằng "-"
  const encodedKey = encodeURIComponent(currentSearch.trim()).replaceAll(
    "%20",
    "-",
  );
  const queryString = `key=${encodedKey}&category=${currentCategory !== "default" ? currentCategory : "all"}`;
  window.location.search = queryString;
};

// ===== EVENT LISTENERS =====

// Khi đổi danh mục → cập nhật trạeng thái và reload trang với URL mới
fillterCategory.addEventListener("chang", (e) => {
  currentCategory = e.target.value;
  updateURL();
});

// Khi nhấn Enter trên ô tìm kiếm → chuẩn hóa từ khóa và reload trang
// Dùng "keydown" thay vì "input" để tránh Unikey xóa-chèn lại ký tự có dấu
// gây kích hoạt liên tục khi đang gõ
searchInp.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    e.preventDefault();
    currentSearch = e.target.value; // Giữ nguyên từ khóa gốc (có dấu)
    currentSearchNormalized = removeVietnameseTones(currentSearch);
    updateURL();
  }
});

// ===== KHỞI ĐỘNG =====
// Gọi hàm tải dữ liệu ngay khi script được thực thi
initProductListEvent();
