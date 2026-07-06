// ============================================================
// PRODUCTLIST.JS — Trang danh sách sản phẩm
// Chức năng:
//   - Tải danh sách sản phẩm từ file JSON
//   - Render thẻ sản phẩm lên lưới (product grid)
//   - Tạo bộ lọc danh mục động từ dữ liệu
//   - Hỗ trợ lọc theo danh mục, sắp xếp theo giá, tìm kiếm theo tên
//   - Đồng bộ trạng thái bộ lọc với URL query string
// ============================================================

// ===== THAM CHIẾU DOM =====
const searchInp = document.getElementById("search-inp"); // Ô nhập từ khóa tìm kiếm
const fillterCategory = document.getElementById("filter-category"); // Dropdown lọc danh mục
const productsList = document.getElementById("product-grid"); // Container chứa lưới sản phẩm
const priceSort = document.getElementById("price-sort"); // Dropdown sắp xếp theo giá

// ===== TRẠNG THÁI TOÀN CỤC =====
let data = []; // Toàn bộ dữ liệu sản phẩm tải từ JSON
let currentCategory = "default"; // Danh mục đang được lọc ("default" = hiển thị tất cả)
let currentSearch = ""; // Từ khóa tìm kiếm hiện tại
let currentSort = "default"; // Thứ tự sắp xếp: "default" | "asc" | "desc"
let URL = ``; // Chuỗi query string sẽ gắn vào địa chỉ trang

// ===== HÀM TẢI DỮ LIỆU =====
/**
 * Tải dữ liệu sản phẩm từ file productlist.json, sau đó khởi tạo giao diện:
 *  1. Render toàn bộ sản phẩm lên lưới
 *  2. Tạo danh sách danh mục cho dropdown
 *  3. Áp dụng bộ lọc/sắp xếp từ URL (nếu có)
 *  4. Đồng bộ giá trị các control với trạng thái hiện tại
 */
const getProduct = async () => {
  try {
    data = await (await fetch("./assets/js/productlist.json")).json();
    loadProductList(data);
    loadCategoryList(data);
    applySortAndFilter();
    applyUIAction();
  } catch (error) {
    // Nếu fetch thất bại, hiển thị thông báo lỗi thân thiện thay toàn bộ trang
    console.error("Lỗi khi tải danh sách sản phẩm:", error);
    document.querySelector("body").innerHTML =
      `<div class="" style="width:100%;text-align:center;padding:3rem;color:var(--color-gray-600);"> 
          <p>
            Không tìm thấy sản phẩm. Vui lòng thử lại sau.
          </p>
        <div/>`;
  }
};

// ===== HÀM RENDER LƯỚI SẢN PHẨM =====

const loadProductList = (data) => {
  const innerProductsList = data
    .map(
      (prod) => `
        <div class="product-card" data-key="${prod.id}" data-category-slug="${prod.categorySlug}" >
          <a href="productdetail.html?id=${prod.id}" class="img-wrapper">
            <img
              src="${prod.mainImg}"
              alt="${prod.name}"
              class="main-img"
            />
            <img
              src="${prod.ImgHover}"
              alt="${prod.name}"
              class="hover-img"
            />
          </a>
          <div class="content">
            <a href="productdetail.html?id=${prod.id}">
              <h3 class="product-name">${prod.name}</h3>
            </a>
            <div class="content-footer flex">
              <!-- Giá sau giảm: làm tròn lên bội số 1000 -->
              <span class="product-price affter-sale">${(Math.ceil((prod.priceValue * (1 - prod.discountPercent / 100)) / 1000) * 1000).toLocaleString("vi-VN")}₫</span>
              <div class="sale">
                <span class="price-before">${prod.price}</span>
                <span class="discount-percent">${prod.discountPercent}%</span>
              </div>
            </div>
          </div>
          ${
            prod.isNew
              ? ` 
            <div class="banner">
              <img src="assets/images/productlistimage/news.png" alt="" />
            </div>`
              : ""
          }
        </div>
    `,
    )
    .join("");

  productsList.innerHTML = innerProductsList;
};

// ===== HÀM TẠO DANH SÁCH DANH MỤC =====
const loadCategoryList = (data) => {
  // Dùng Map để đảm bảo mỗi danh mục chỉ xuất hiện một lần
  const categoryMap = new Map();

  data.forEach((prod) => {
    categoryMap.set(prod.categorySlug, prod.category);
  });

  // Chuyển Map thành chuỗi HTML các thẻ <option>
  const category = Array.from(categoryMap)
    .map(
      ([categorySlug, categoryName]) => `
      <option value="${categorySlug}">${categoryName}</option>
    `,
    )
    .join("");

  // Thêm option mặc định "Sản phẩm nổi bật" lên đầu danh sách
  fillterCategory.innerHTML = `
    <option value="default" selected>Sản phẩm nổi bật</option>
    ${category}
  `;
};

// ===== HÀM ĐỒNG BỘ GIAO DIỆN VỚI TRẠNG THÁI =====
/**
 * Sau khi áp dụng bộ lọc từ URL, đồng bộ lại giá trị hiển thị
 * trên các control (ô tìm kiếm, dropdown danh mục, dropdown sắp xếp)
 * để khớp với trạng thái đang lọc.
 */
const applyUIAction = () => {
  searchInp.value = currentSearch;
  // Nếu category là "all" thì hiển thị lại "default" trên dropdown
  fillterCategory.value =
    currentCategory !== "all" ? currentCategory : "default";
  priceSort.value = currentSort;
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
const applySortAndFilter = () => {
  const path = new URLSearchParams(window.location.search);

  // Đọc tham số danh mục từ URL (nếu có)
  if (path.get("category"))
    currentCategory =
      path.get("category") !== "all" ? path.get("category") : "default";

  // Đọc tham số từ khóa từ URL, khôi phục dấu "-" thành dấu cách
  if (path.get("key"))
    currentSearch = path.get("key").trim().replaceAll("-", " ");

  // Đọc tham số sắp xếp giá từ URL
  if (path.get("price")) currentSort = path.get("price");

  // Tạo bản sao mảng để không làm thay đổi mảng gốc
  let products = [...data];

  // Lọc theo danh mục
  if (currentCategory !== "default") {
    products = products.filter((item) => item.categorySlug === currentCategory);
  }

  // Sắp xếp theo giá sau giảm
  // Công thức giá sau giảm: làm tròn lên bội số 1000 gần nhất
  if (currentSort !== "default") {
    products = products.sort((a, b) =>
      currentSort === "asc"
        ? Math.ceil((a.priceValue * (1 - a.discountPercent / 100)) / 1000) *
            1000 -
          Math.ceil((b.priceValue * (1 - b.discountPercent / 100)) / 1000) *
            1000
        : Math.ceil((b.priceValue * (1 - b.discountPercent / 100)) / 1000) *
            1000 -
          Math.ceil((a.priceValue * (1 - a.discountPercent / 100)) / 1000) *
            1000,
    );
  }

  // Lọc theo từ khóa tìm kiếm (so sánh không phân biệt dấu)
  if (currentSearch) {
    products = products.filter((item) =>
      removeVietnameseTones(item.name).includes(currentSearch),
    );
  }

  loadProductList(products);
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
 * - price: thứ tự sắp xếp ("default" | "asc" | "desc")
 */
const updateURL = () => {
  URL = `category=${currentCategory !== "default" ? currentCategory : "all"}&key=${currentSearch.trim().replaceAll(" ", "-")}&price=${currentSort}`;
  window.location.search = URL;
};

// ===== EVENT LISTENERS =====

// Khi đổi danh mục → cập nhật trạng thái và reload trang với URL mới
fillterCategory.addEventListener("change", (e) => {
  currentCategory = e.target.value;
  updateURL();
});

// Khi đổi thứ tự sắp xếp → cập nhật trạng thái và reload trang với URL mới
priceSort.addEventListener("change", (e) => {
  currentSort = e.target.value;
  updateURL();
});

// Khi nhấn Enter trên ô tìm kiếm → chuẩn hóa từ khóa và reload trang
// Dùng "keydown" thay vì "input" để tránh Unikey xóa-chèn lại ký tự có dấu
// gây kích hoạt liên tục khi đang gõ
searchInp.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    e.preventDefault();
    currentSearch = removeVietnameseTones(e.target.value);
    updateURL();
  }
});

// ===== KHỞI ĐỘNG =====
// Gọi hàm tải dữ liệu ngay khi script được thực thi
getProduct();
