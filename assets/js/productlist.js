//=============================================================
//                       TÁC GIẢ
//    HUỲNH TẤN GIAO
//    B2408784
//=============================================================

// ============================================================
// PRODUCTLIST.JS — Trang danh sách sản phẩm
// Chức năng:
//   - Tải danh sách sản phẩm từ file JSON
//   - Render thẻ sản phẩm lên lưới (product grid)
//   - Tạo bộ lọc danh mục động từ dữ liệu
//   - Hỗ trợ lọc theo danh mục, sắp xếp theo giá, tìm kiếm theo tên
//   - Đồng bộ trạng thái bộ lọc với URL query string
// ============================================================
// Import mảng danh sách sản phẩm
import data from "./data.js";

// ===== THAM CHIẾU DOM =====
const searchInp = document.getElementById("search-inp"); // Ô nhập từ khóa tìm kiếm
const fillterCategory = document.getElementById("filter-category"); // Dropdown lọc danh mục
const productsList = document.getElementById("product-grid"); // Container chứa lưới sản phẩm
const priceSort = document.getElementById("price-sort"); // Dropdown sắp xếp theo giá

// ===== TRẠNG THÁI TOÀN CỤC ===== // Toàn bộ dữ liệu sản phẩm tải từ JSON
let currentCategory = "default"; // Danh mục đang được lọc ("default" = hiển thị tất cả)
let currentSearch = ""; // Từ khóa gốc (có dấu tiếng Việt) — dùng để hiển thị & lưu URL
let currentSearchNormalized = ""; // Từ khóa đã chuẩn hóa (không dấu) — chỉ dùng để lọc sản phẩm
let currentSort = "default"; // Thứ tự sắp xếp: "default" | "asc" | "desc"
// ===== HÀM TẢI DỮ LIỆU =====
/**
 * Tải dữ liệu sản phẩm từ file productlist.json, sau đó khởi tạo giao diện:
 *  1. Render toàn bộ sản phẩm lên lưới
 *  2. Tạo danh sách danh mục cho dropdown
 *  3. Áp dụng bộ lọc/sắp xếp từ URL (nếu có)
 *  4. Đồng bộ giá trị các control với trạng thái hiện tại
 */
const getProduct = () => {
  try {
    loadCategoryList(data);
    applySortAndFilter();
    applyUIAction();
  } catch (error) {
    console.error("Lỗi khi tải danh sách sản phẩm:", error);
    const body = document.querySelector("body");
    // Xóa toàn bộ con của body bằng removeChild thay vì innerHTML = ""
    while (body.firstChild) body.removeChild(body.firstChild);
    // Tạo cấu trúc thông báo lỗi bằng createElement và appendChild
    const errorDiv = document.createElement("div");
    errorDiv.style.width = "100%";
    errorDiv.style.textAlign = "center";
    errorDiv.style.padding = "3rem";
    errorDiv.style.color = "var(--color-gray-600)";
    const errorP = document.createElement("p");
    errorP.appendChild(document.createTextNode("Không tìm thấy sản phẩm. Vui lòng thử lại sau."));
    errorDiv.appendChild(errorP);
    body.appendChild(errorDiv);
  }
};

// ===== HÀM RENDER LƯỚI SẢN PHẨM =====

const loadProductList = (data) => {
  data.forEach((prod) => {
    const productCard = document.createElement("article");
    productCard.classList.add("product-card");
    productCard.setAttribute("data-key", prod.id);
    productCard.setAttribute("data-category-slug", prod.categorySlug);

    const imageWrapper = document.createElement("a");
    imageWrapper.classList.add("img-wrapper");
    imageWrapper.setAttribute("href", `productdetail.html?id=${prod.id}`);

    const content = document.createElement("div");
    content.classList.add("content");

    const banner = document.createElement("div");
    banner.classList.add("banner");

    const mainImg = document.createElement("img");
    mainImg.classList.add("main-img");
    mainImg.setAttribute("src", prod.mainImg);
    mainImg.setAttribute("alt", prod.name);

    const hoverImg = document.createElement("img");
    hoverImg.classList.add("hover-img");
    hoverImg.setAttribute("src", prod.ImgHover);
    hoverImg.setAttribute("alt", prod.name);

    const nameWrapper = document.createElement("a");
    nameWrapper.setAttribute("href", `productdetail.html?id=${prod.id}`);

    const productName = document.createElement("h3");
    productName.classList.add("product-name");
    productName.appendChild(document.createTextNode(prod.name));

    const contentFooter = document.createElement("div");
    contentFooter.classList.add("content-footer", "flex");

    const productPrice = document.createElement("span");
    productPrice.classList.add("product-price", "after-sale");
    productPrice.appendChild(
      document.createTextNode(
        `${(Math.ceil((prod.priceValue * (1 - prod.discountPercent / 100)) / 1000) * 1000).toLocaleString("vi-VN")}₫`,
      ),
    );

    const sale = document.createElement("div");
    sale.classList.add("sale");

    const priceBefore = document.createElement("span");
    priceBefore.classList.add("price-before");
    priceBefore.appendChild(document.createTextNode(prod.price));

    const discountPercent = document.createElement("span");
    discountPercent.classList.add("discount-percent");
    discountPercent.appendChild(
      document.createTextNode(`${prod.discountPercent}%`),
    );

    const imgBanner = document.createElement("img");
    imgBanner.setAttribute("src", "assets/images/productlistimage/news.png");
    imgBanner.setAttribute("alt", "Sản phẩm mới");

    imageWrapper.appendChild(mainImg);
    imageWrapper.appendChild(hoverImg);

    sale.appendChild(priceBefore);
    sale.appendChild(discountPercent);

    contentFooter.appendChild(productPrice);
    contentFooter.appendChild(sale);

    nameWrapper.appendChild(productName);

    content.appendChild(nameWrapper);
    content.appendChild(contentFooter);

    productCard.appendChild(imageWrapper);
    productCard.appendChild(content);

    if (prod.isNew) {
      banner.appendChild(imgBanner);
      productCard.appendChild(banner);
    }

    productsList.appendChild(productCard);
  });
};

// ===== HÀM TẠO DANH SÁCH DANH MỤC =====
const loadCategoryList = (data) => {
  // Dùng Map để đảm bảo mỗi danh mục chỉ xuất hiện một lần
  const categoryMap = new Map();

  data.forEach((prod) => {
    categoryMap.set(prod.categorySlug, prod.category);
  });

  const defaultCategory = document.createElement("option");
  defaultCategory.setAttribute("value", "default");
  defaultCategory.appendChild(document.createTextNode("Sản phẩm nổi bật"));

  fillterCategory.appendChild(defaultCategory);

  Array.from(categoryMap).forEach(([categorySlug, categoryName]) => {
    const option = document.createElement("option");
    option.setAttribute("value", categorySlug);
    option.appendChild(document.createTextNode(categoryName));

    fillterCategory.appendChild(option);
  });
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

  // Đọc tham số từ khóa gốc từ URL (URLSearchParams.get đã tự decode)
  if (path.get("key")) {
    currentSearch = path.get("key").trim().replaceAll("-", " ");
    currentSearchNormalized = removeVietnameseTones(currentSearch);
  }

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
  if (currentSearchNormalized) {
    products = products.filter((item) =>
      removeVietnameseTones(item.name).includes(currentSearchNormalized),
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
  // Lưu từ khóa gốc (có dấu) lên URL, thay khoảng trắng bằng "-"
  const encodedKey = encodeURIComponent(currentSearch.trim()).replaceAll(
    "%20",
    "-",
  );
  const queryString = `category=${currentCategory !== "default" ? currentCategory : "all"}&key=${encodedKey}&price=${currentSort}`;
  window.location.search = queryString;
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
    currentSearch = e.target.value; // Giữ nguyên từ khóa gốc (có dấu)
    currentSearchNormalized = removeVietnameseTones(currentSearch);
    updateURL();
  }
});


// ===== KHỞI ĐỘNG =====
// Gọi hàm tải dữ liệu ngay khi script được thực thi
getProduct();
