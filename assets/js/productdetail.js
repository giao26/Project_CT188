//=============================================================
//                       TÁC GIẢ
//    HUỲNH TẤN GIAO
//    B2408784
//=============================================================

// ============================================================
// PRODUCTDETAIL.JS — Trang chi tiết sản phẩm
// Chức năng:
//   - Đọc ID sản phẩm từ URL query string (?id=...)
//   - Tải dữ liệu sản phẩm từ file JSON và render toàn bộ giao diện
//   - Xử lý chọn màu sắc, kích thước, số lượng
//   - Xử lý gallery ảnh thumbnail ↔ ảnh chính
//   - Xử lý thêm sản phẩm vào giỏ hàng (lưu vào localStorage)
//   - Render sản phẩm liên quan và modal bảng size
// ============================================================
//Import danh sách sản phẩm
import data from "./data.js";

// ===== THAM CHIẾU DOM (cấp cao nhất — phần tử tồn tại sẵn trong HTML) =====
const singleProduct = document.querySelector(".container-main"); // Khu vực gallery + thông tin sản phẩm chính
const moreDescription = document.querySelector(".more-description"); // Khu vực mô tả chi tiết bên dưới
const references = document.querySelector(".references .references-product"); // Khu vực sản phẩm liên quan
const overlayModal = document.querySelector("#overlayModal"); // Modal overlay hiển thị bảng size

// ===== TRẠNG THÁI LỰA CHỌN CỦA NGƯỜI DÙNG =====
let currentColor = ""; // Màu sắc đang được chọn
let currentSize = ""; // Kích thước đang được chọn
let currentQuantity = 1; // Số lượng muốn mua (mặc định 1)
let currentToast = null; // Tham chiếu đến toast đang hiển thị (để ẩn trước khi tạo cái mới)

// ============================================================
// HÀM CHÍNH: getProductDetail
// Tải và render toàn bộ chi tiết sản phẩm, sau đó gắn tất cả
// event listener cần thiết cho trang.
// ============================================================
const getProductDetail = () => {
  try {
    // ── Lấy ID sản phẩm từ URL ──────────────────────
    const path = new URLSearchParams(window.location.search);
    const productId = path.get("id");

    // Nếu URL không có tham số ?id=... → báo lỗi và dừng
    if (!productId) {
      document.querySelector("body").innerHTML =
        `<div class="" style="width:100%;text-align:center;padding:3rem;color:var(--color-gray-600);"> 
          <p>
            Không tìm thấy sản phẩm. Vui lòng quay lại 
            <a href="productlist.html" style="display:inline;color:var(--color-primary);">danh sách sản phẩm.</a>
          </p>
        </div>`;
      return;
    }

    // Tìm sản phẩm có id khớp với productId trên URL
    // So sánh dạng string để tránh lỗi type mismatch (id có thể là number trong JSON)
    const product = data.find(
      (prod) => prod.id.toString() === productId.toString(),
    );

    // Nếu không tìm thấy sản phẩm nào khớp ID → báo lỗi và dừng
    if (!product) {
      document.querySelector("body").innerHTML =
        `<div class="" style="width:100%;text-align:center;padding:3rem;color:var(--color-gray-600);"> 
          <p>
            Không tìm thấy sản phẩm. Vui lòng quay lại 
            <a href="productlist.html" style="display:inline;color:var(--color-primary);">danh sách sản phẩm.</a>
          </p>
        </div>`;
      return;
    }

    // ── Khởi tạo trạng thái chọn mặc định ───────────
    currentColor = product.colors[0].color; // Màu đầu tiên trong danh sách
    currentSize = product.sizes[0]; // Size đầu tiên trong danh sách
    currentQuantity = 1; // Số lượng mặc định là 1

    // ── Lấy danh sách sản phẩm liên quan ────────────
    // product.references là mảng các ID → lọc ra các sản phẩm tương ứng
    const relatedId = product.references.map((id) => id.toString());
    const relatedProducts = data.filter((prod) => {
      return relatedId.includes(prod.id.toString());
    });

    // ── Render HTML khu vực gallery + thông tin sản phẩm ──
    singleProduct.innerHTML = `
    <div class="product-gallery">
      <!-- Cột thumbnail bên trái: ảnh chính, ảnh hover, ảnh bảng size -->
      <div class="thumbnail">
        <img
          class="active"
          src="${product.mainImg}"
          alt="${product.name}"
        />
        <img
          src="${product.ImgHover}"
          alt="${product.name}"
        />
        <img
          src="${product.ImgSizing}"
          alt="Bảng size ${product.name}"
        />
      </div>
      <!-- Ảnh chính hiển thị lớn ở giữa -->
      <div class="main-img">
        <img
          src="${product.mainImg}"
          alt="${product.name}"
        />
      </div>
    </div>

    <div class="product-info">
      <h4 class="detail-product-name">${product.name}</h4>
      <div class="detail-price-row">
        <!-- Giá sau giảm: priceValue * (1 - discountPercent/100), làm tròn lên bội số 1000 -->
        <p class="detail-price-current">${(Math.ceil((product.priceValue * (1 - product.discountPercent / 100)) / 1000) * 1000).toLocaleString("vi-VN")}₫</p>
        <p class="detail-price-old">${product.price}</p>
        <div class="detail-discount">${product.discountPercent}%</div>
      </div>
      <!-- Khung ưu đãi online (mã giảm giá, freeship) -->
      <div class="salebox">
        <h3 class="promotion">
          <img
            src="./assets/images/productlistimage/icon-product-promotion.png"
            width="22"
            height="22"
            loading="lazy"
            title="."
          />
          Ưu đãi online
        </h3>
        <ul>
          <li>Nhập mã <strong>CT188</strong> giảm 20K đơn từ 499K</li>
          <li>Nhập mã <strong>CT18806</strong> giảm 96K đơn từ 799K</li>
          <li>
            Nhập mã <strong>CT18806NHOM7</strong> giảm 196K đơn từ 1099K
          </li>
          <li>Freeship đơn từ 299K</li>
        </ul>
      </div>

      <!-- Selector màu sắc: mỗi <li> lưu ảnh tương ứng qua data-img -->
      <div class="color">
        <p class="current-color">Màu sắc: <strong>${currentColor}</strong></p>
        <ul>
          ${product.colors.map((item) => `<li data-img="${item.img}">${item.color}</li>`).join("")}
        </ul>
      </div>

      <!-- Selector kích thước -->
      <div class="size">
        <div class="size-head">
          <div class="current-size">Kích thước: <strong>${currentSize}</strong></div>
          <div class="sizing">
            <i class="fa-solid fa-ruler"></i>
            <span href="">Hướng dẫn chọn size</span>
          </div>
        </div>
        <div class="size-select">
          <ul>
            ${product.sizes.map((item) => `<li>${item}</li>`).join("")}
          </ul>
        </div>
      </div>

      <!-- Bộ điều khiển số lượng + nút thêm giỏ hàng -->
      <div class="selector-action">
        <div class="quantity-action">
          <button class="minus">-</button>
          <input type="text" class="quantity" title="Nhập số lượng" min="1" max="999" value="${currentQuantity}" />
          <button class="plus">+</button>
        </div>
        <div class="add-cart">
          <button>Thêm vào giỏ hàng</button>
        </div>
      </div>

      <!-- Chính sách mua hàng (freeship, đổi trả, COD...) -->
      <div class="product-policies">
        <ul>
          <li>
            <img
              src="assets/images/productlistimage/policy_product_image_1.png"
              alt=""
            />
            <p>FreeShip từ đơn 299k</p>
          </li>
          <li>
            <img
              src="assets/images/productlistimage/policy_product_image_2.png"
              alt=""
            />
            <p>Giảm giá thành viên lên đến 15%</p>
          </li>
          <li>
            <img
              src="assets/images/productlistimage/policy_product_image_3.png"
              alt=""
            />
            <p>Thanh toán COD</p>
          </li>
          <li>
            <img
              src="assets/images/productlistimage/policy_product_image_4.png"
              alt=""
            />
            <p>Đổi trả hàng miễn phí trong 15 ngày</p>
          </li>
        </ul>
      </div>
    </div>
  `;

    // Kích hoạt trạng thái "active" cho màu và size đầu tiên mặc định
    document.querySelector(".color ul li").classList.add("active");
    document.querySelector(".size-select ul li").classList.add("active");

    // Cập nhật tiêu đề tab trình duyệt thành tên sản phẩm
    document.querySelector("head title").innerHTML = product.name;

    // Lấy tham chiếu đến các phần tử tương tác ────
    const thumbnailImage = document.querySelectorAll(
      ".product-gallery .thumbnail img",
    );
    const colorSelector = document.querySelectorAll(
      ".product-info .color ul li",
    );
    const sizeSelector = document.querySelectorAll(
      ".product-info .size .size-select ul li",
    );
    const plusQuantityButton = document.querySelector(
      ".selector-action .quantity-action .plus",
    );
    const minusQuantityButton = document.querySelector(
      ".selector-action .quantity-action .minus",
    );
    const quantityInput = document.querySelector(
      ".selector-action .quantity-action .quantity",
    );
    const addCardBtn = document.querySelector(
      ".selector-action .add-cart button",
    );

    // ── Gắn sự kiện cho thumbnail ───────────────────
    // Click thumbnail → đổi ảnh chính + thêm hiệu ứng fade
    thumbnailImage.forEach((item) => {
      item.addEventListener("click", (e) => {
        // Xóa "active" của tất cả thumbnail rồi set lại cho thumbnail vừa click
        thumbnailImage.forEach((item) => item.classList.remove("active"));
        item.classList.add("active");

        const mainImg = document.querySelector(
          ".product-gallery .main-img img",
        );
        mainImg.src = e.target.src;

        // Trick tái kích hoạt CSS animation: xóa class → reflow → thêm lại
        mainImg.classList.remove("fade");
        void mainImg.offsetWidth; // Buộc trình duyệt tính lại layout để reset animation
        mainImg.classList.add("fade");
      });
    });

    // ── Gắn sự kiện chọn màu ────────────────────────
    // Click vào một màu → cập nhật currentColor, đổi ảnh chính và thumbnail active
    colorSelector.forEach((item) => {
      item.addEventListener("click", (e) => {
        // Bỏ qua nếu màu này đã đang active
        if (item.classList.contains("active")) return;

        colorSelector.forEach((item) => item.classList.remove("active"));
        item.classList.add("active");

        // Cập nhật biến trạng thái và text hiển thị
        currentColor = e.target.innerText;
        document.querySelector(
          ".product-info .color .current-color strong",
        ).innerHTML = currentColor;

        // Tìm và kích hoạt thumbnail tương ứng với màu vừa chọn (dựa theo data-img)
        thumbnailImage.forEach((thumb) => {
          thumb.classList.remove("active");
          if (thumb.getAttribute("src") === item.getAttribute("data-img"))
            thumb.classList.add("active");
        });

        // Đổi ảnh chính sang ảnh của màu được chọn + hiệu ứng fade
        const mainImg = document.querySelector(
          ".product-gallery .main-img img",
        );
        mainImg.src = item.getAttribute("data-img");
        mainImg.classList.remove("fade");
        void mainImg.offsetWidth; // Reset animation
        mainImg.classList.add("fade");
      });
    });

    // ── Gắn sự kiện chọn size ───────────────────────
    // Click vào một size → cập nhật currentSize và text hiển thị
    sizeSelector.forEach((item) => {
      item.addEventListener("click", (e) => {
        sizeSelector.forEach((item) => item.classList.remove("active"));
        item.classList.add("active");
        currentSize = e.target.innerText;
        document.querySelector(
          ".product-info .size .current-size strong",
        ).innerHTML = currentSize;
      });
    });

    // ── Gắn sự kiện điều chỉnh số lượng ────────────

    // Nút "-": giảm số lượng, giới hạn tối thiểu là 1
    minusQuantityButton.addEventListener("click", () => {
      if (currentQuantity > 1) currentQuantity--;
      quantityInput.value = currentQuantity;
    });

    // Nút "+": tăng số lượng, giới hạn tối đa là 999
    plusQuantityButton.addEventListener("click", () => {
      if (currentQuantity < 999) currentQuantity++;
      quantityInput.value = currentQuantity;
    });

    // Nhập tay vào ô số lượng:
    // - Xóa giá trị nếu nhỏ hơn 1 hoặc không phải số nguyên dương
    // - Giới hạn tối đa 999
    // - Fallback về 1 nếu ô trống
    quantityInput.addEventListener("input", (e) => {
      const isNumber = (str) => /^[0-9]+$/.test(str);
      if (Number(e.target.value) < 1 || !isNumber(e.target.value))
        e.target.value = "";
      if (Number(e.target.value) > 999) e.target.value = 999;
      currentQuantity = Number(e.target.value) || 1;
    });

    // Khi người dùng rời khỏi ô số lượng (blur):
    // nếu để trống hoặc < 1 thì tự động điền lại 1
    quantityInput.addEventListener("blur", (e) => {
      if (!e.target.value || Number(e.target.value) < 1) e.target.value = 1;
      currentQuantity = Number(e.target.value);
    });

    // ── Gắn sự kiện nút "Thêm vào giỏ hàng" ────────
    addCardBtn.addEventListener("click", () => {
      const currentUser = localStorage.getItem("currentUser");

      // Trường hợp chưa đăng nhập → hiển thị toast cảnh báo màu đỏ
      if (!currentUser) {
        if (currentToast) {
          currentToast.hideToast(); // Ẩn toast cũ nếu đang hiện
        }
        currentToast = Toastify({
          text: `Bạn cần đăng nhập để sử dụng tính năng này`,
          duration: 3000, // 3 giây rồi ẩn
          newWindow: true,
          gravity: "bottom",
          position: "right",
          stopOnFocus: true, // Tạm dừng đếm ngược khi hover vào toast
          style: {
            background: "#e50d2dff",
            color: "#ffffff",
            borderRadius: "8px",
          },
          onClick: function () {
            currentToast = null; // Xóa tham chiếu khi người dùng click vào toast
          },
        });
        currentToast.showToast();
        return;
      }

      // Trường hợp đã đăng nhập → hiển thị toast xác nhận màu xanh
      if (currentToast) {
        currentToast.hideToast();
      }
      currentToast = Toastify({
        text: `Đã thêm ${product.name} vào giỏ hàng`,
        duration: 3000,
        newWindow: true,
        gravity: "bottom",
        position: "right",
        stopOnFocus: true,
        style: {
          background: "#2563eb",
          color: "#ffffff",
          borderRadius: "8px",
        },
        onClick: function () {
          currentToast = null;
        },
      });
      currentToast.showToast();

      // ── Logic lưu giỏ hàng vào localStorage ──────────────
      // Cấu trúc: cartMap = Map<userId, Array<CartItem>>
      // Mỗi user có một mảng sản phẩm riêng, phân biệt bởi userId
      const jsonString = localStorage.getItem("cartMap");
      const cartMap = jsonString ? new Map(JSON.parse(jsonString)) : new Map();
      const userId = JSON.parse(currentUser).id;
      const cartList = cartMap.get(userId) || [];

      // Kiểm tra xem sản phẩm với cùng màu + size đã có trong giỏ chưa
      if (
        cartList.some(
          (item) =>
            item.id === product.id &&
            item.selectedColor === currentColor &&
            item.selectedSize === currentSize,
        )
      ) {
        // Đã có → chỉ cộng thêm số lượng, không tạo mục mới
        cartMap.set(
          userId,
          cartList.map((item) => {
            return item.id === product.id &&
              item.selectedColor === currentColor &&
              item.selectedSize === currentSize
              ? {
                  ...item,
                  quantity: Number(item.quantity) + Number(currentQuantity),
                }
              : item;
          }),
        );
      } else {
        // Chưa có → thêm mục mới vào cuối mảng giỏ hàng của user
        // mainImg ưu tiên lấy ảnh của màu đang chọn, fallback về ảnh chính
        cartMap.set(userId, [
          ...cartList,
          {
            id: product.id,
            name: product.name,
            price: product.price,
            priceValue: product.priceValue,
            sizes: product.sizes,
            colors: product.colors,
            mainImg:
              product.colors.find((c) => c.color === currentColor)?.img ||
              product.mainImg,
            ImgSizing: product.ImgSizing,
            discountPercent: product.discountPercent,
            stock: product.stock,
            quantity: Number(currentQuantity),
            selectedSize: currentSize,
            selectedColor: currentColor,
          },
        ]);
      }

      // Lưu cartMap (dạng Array of entries) vào localStorage
      // Map không serialize trực tiếp được nên phải dùng [...cartMap.entries()]
      localStorage.setItem("cartMap", JSON.stringify([...cartMap.entries()]));

      // Cập nhật badge số lượng trên header nếu hàm đã được khởi tạo
      if (typeof window.updateCartBadge === "function") {
        window.updateCartBadge();
      }
    });

    // ── Render khu vực mô tả chi tiết ───────────────
    moreDescription.innerHTML = `
    <hr />
    <h3>
      <strong>MELLOW® </strong>
      ${product.name}
    </h3>
    <ul>
      <li>
        <strong>Chất liệu: </strong>
        ${product.material}
      </li>
      <li>
        <strong>Form: </strong>
        ${product.form}
      </li>
    </ul>
    <hr />
    <p><strong>► Mô tả</strong></p>
    <span>${product.description}</span>
    <p><strong>► Cách bảo quản</strong></p>
    <span>${product.preserve}</span>
    <p><strong>► Kỹ thuật thiết kế</strong></p>
    <span>${product.designTechnique}</span>
    <hr />
  `;

    // ── Render khu vực sản phẩm liên quan ───────────
    // Mỗi card liên quan có ảnh hover, tên, giá và badge "NEW" nếu applicable
    references.innerHTML = relatedProducts
      .map(
        (prod) =>
          `
      <div
        class="related-product-card"
        data-key="${prod.id}"
        data-category-slug="${prod.categorySlug}"
      >
        <a
          href="productdetail.html?id=${prod.id}"
          class="related-card-image-link"
        >
          <img
            src="${prod.mainImg}"
            alt="${prod.name}"
            class="related-card-main-img"
          />
          <img
            src="${prod.ImgHover}"
            alt="${prod.name}"
            class="related-card-hover-img"
          />
        </a>
        <div class="related-card-content">
          <a href="productdetail.html?id=${prod.id}">
            <h3 class="related-card-name">${prod.name}</h3>
          </a>
          <div class="related-card-prices">
            <span class="related-card-current-price">${(Math.ceil((prod.priceValue * (1 - prod.discountPercent / 100)) / 1000) * 1000).toLocaleString("vi-VN")}₫</span>
            <div class="related-card-sale">
              <span class="related-card-old-price">${prod.price}</span>
              <span class="related-card-discount">${prod.discountPercent}%</span>
            </div>
          </div>
        </div>
        ${
          prod.isNew
            ? `
              <div class="related-card-badge">
                <img src="assets/images/productlistimage/news.png" alt="" />
              </div>
            `
            : ""
        }
      </div>
    `,
      )
      .join("");

    // ── Render modal bảng size ──────────────────────
    overlayModal.innerHTML = `
      <div class="modal-box">
        <span id="closeModalBtn" class="close-btn">&times;</span>
        <h2 style="text-align: center;">Bảng size ${product.name}</h2>
        <p style="text-align: center;">
          <img src="${product.ImgSizing}"/>
        </p>
      </div>
    `;

    // Click vào "Hướng dẫn chọn size" → mở modal overlay
    document
      .querySelector(".product-info .size .sizing span")
      .addEventListener("click", () => {
        overlayModal.classList.add("show");
      });

    // Click nút "×" trong modal → đóng modal
    document.getElementById("closeModalBtn").addEventListener("click", () => {
      overlayModal.classList.remove("show");
    });

    // Click vào vùng nền mờ bên ngoài modal → đóng modal
    window.addEventListener("click", (event) => {
      if (event.target === overlayModal) {
        overlayModal.classList.remove("show");
      }
    });
  } catch (error) {
    // Bắt mọi lỗi bất ngờ (network, JSON parse, DOM lỗi...) và hiển thị thông báo
    console.error("Lỗi khi tải chi tiết sản phẩm:", error);
    document.querySelector("main").innerHTML =
      `<p style="text-align:center;padding:3rem;color:var(--color-gray-600);">Có lỗi xảy ra khi tải sản phẩm. Vui lòng thử lại sau.</p>`;
  }
};

// ===== KHỞI ĐỘNG =====
// Gọi hàm tải chi tiết sản phẩm ngay khi script được thực thi
getProductDetail();
