const searchInp = document.getElementById("search-inp");
const fillterCategory = document.getElementById("filter-category");
const productsList = document.getElementById("product-grid");
const priceSort = document.getElementById("price-sort");

let data = [];
let currentCategory = "default";
let currentSearch = "";
let currentSort = "default";

const getProduct = async () => {
  try {
    data = await (await fetch("./assets/js/productlist.json")).json();
    loadProductList(data);
    loadCategoryList(data);
  } catch (error) {
    console.error("Lỗi khi tải danh sách sản phẩm:", error);
    document.querySelector("main").innerHTML =
      `<p style="text-align:center;padding:3rem;color:var(--color-gray-600);grid-column:1/-1;">Có lỗi xảy ra khi tải sản phẩm. Vui lòng thử lại sau.</p>`;
  }
};

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

const loadCategoryList = (data) => {
  const categoryMap = new Map();

  data.forEach((prod) => {
    categoryMap.set(prod.categorySlug, prod.category);
  });

  const category = Array.from(categoryMap)
    .map(
      ([categorySlug, categoryName]) => `
      <option value="${categorySlug}">${categoryName}</option>
    `,
    )
    .join();

  fillterCategory.innerHTML = `
    <option value="default" selected>Sản phẩm nổi bật</option>
    ${category}
  `;
};

const applySortAndFilter = () => {
  let products = [...data];
  if (currentCategory !== "default") {
    products = products.filter((item) => item.categorySlug === currentCategory);
  }
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
  if (currentSearch) {
    products = products.filter((item) =>
      removeVietnameseTones(item.name).includes(currentSearch),
    );
  }
  loadProductList(products);
};

function removeVietnameseTones(str) {
  if (!str) return "";

  // Bước 1: Chuyển về chữ thường
  str = str.toLowerCase();

  // Bước 2: Tách dấu ra khỏi ký tự gốc và xóa dấu đi
  str = str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

  // Bước 3: Thay thế chữ đ và Đ (normalize không xử lý được chữ này)
  str = str.replace(/[đĐ]/g, "d");

  // Bước 4: Xóa các khoảng trắng thừa ở đầu/cuối chuỗi
  str = str.trim().replace(/\s+/g, " ");

  return str;
}

fillterCategory.addEventListener("change", (e) => {
  currentCategory = e.target.value;
  applySortAndFilter();
});

priceSort.addEventListener("change", (e) => {
  currentSort = e.target.value;
  applySortAndFilter();
});

searchInp.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    e.preventDefault();
    currentSearch = removeVietnameseTones(e.target.value);
    applySortAndFilter();
  }
});

searchInp.addEventListener("input", (e) => {
  if (!e.target.value) {
    currentSearch = "";
    applySortAndFilter();
  }
});

getProduct();
