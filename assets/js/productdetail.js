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
      showError();
      return;
    }

    // Tìm sản phẩm có id khớp với productId trên URL
    // So sánh dạng string để tránh lỗi type mismatch (id có thể là number trong JSON)
    const product = data.find(
      (prod) => prod.id.toString() === productId.toString(),
    );

    // Nếu không tìm thấy sản phẩm nào khớp ID → báo lỗi và dừng
    if (!product) {
      showError();
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

    // ── Render khu vực gallery + thông tin sản phẩm bằng createElement ──
    while (singleProduct.firstChild)
      singleProduct.removeChild(singleProduct.firstChild);

    // --- Product Gallery ---
    const productGallery = document.createElement("div");
    productGallery.classList.add("product-gallery");

    // Cột thumbnail bên trái: ảnh chính, ảnh hover, ảnh bảng size
    const thumbnail = document.createElement("div");
    thumbnail.classList.add("thumbnail");

    const thumbMain = document.createElement("img");
    thumbMain.classList.add("active");
    thumbMain.setAttribute("src", product.mainImg);
    thumbMain.setAttribute("alt", product.name);

    const thumbHover = document.createElement("img");
    thumbHover.setAttribute("src", product.ImgHover);
    thumbHover.setAttribute("alt", product.name);

    const thumbSizing = document.createElement("img");
    thumbSizing.setAttribute("src", product.ImgSizing);
    thumbSizing.setAttribute("alt", `Bảng size ${product.name}`);

    thumbnail.appendChild(thumbMain);
    thumbnail.appendChild(thumbHover);
    thumbnail.appendChild(thumbSizing);

    // Ảnh chính hiển thị lớn ở giữa
    const mainImgDiv = document.createElement("div");
    mainImgDiv.classList.add("main-img");

    const mainImgTag = document.createElement("img");
    mainImgTag.setAttribute("src", product.mainImg);
    mainImgTag.setAttribute("alt", product.name);

    mainImgDiv.appendChild(mainImgTag);

    productGallery.appendChild(thumbnail);
    productGallery.appendChild(mainImgDiv);

    // --- Product Info ---
    const productInfo = document.createElement("div");
    productInfo.classList.add("product-info");

    // Tên sản phẩm
    const productName = document.createElement("h4");
    productName.classList.add("detail-product-name");
    productName.appendChild(document.createTextNode(product.name));

    // Dòng giá
    const priceRow = document.createElement("div");
    priceRow.classList.add("detail-price-row");

    // Giá sau giảm: priceValue * (1 - discountPercent/100), làm tròn lên bội số 1000
    const priceCurrent = document.createElement("p");
    priceCurrent.classList.add("detail-price-current");
    priceCurrent.appendChild(
      document.createTextNode(
        `${(Math.ceil((product.priceValue * (1 - product.discountPercent / 100)) / 1000) * 1000).toLocaleString("vi-VN")}₫`,
      ),
    );

    const priceOld = document.createElement("p");
    priceOld.classList.add("detail-price-old");
    priceOld.appendChild(document.createTextNode(product.price));

    const discountDiv = document.createElement("div");
    discountDiv.classList.add("detail-discount");
    discountDiv.appendChild(
      document.createTextNode(`${product.discountPercent}%`),
    );

    priceRow.appendChild(priceCurrent);
    priceRow.appendChild(priceOld);
    priceRow.appendChild(discountDiv);

    // Khung ưu đãi online (mã giảm giá, freeship)
    const salebox = document.createElement("div");
    salebox.classList.add("salebox");

    const promotionH3 = document.createElement("h3");
    promotionH3.classList.add("promotion");

    const promotionImg = document.createElement("img");
    promotionImg.setAttribute(
      "src",
      "./assets/images/productlistimage/icon-product-promotion.png",
    );
    promotionImg.setAttribute("width", "22");
    promotionImg.setAttribute("height", "22");
    promotionImg.setAttribute("loading", "lazy");
    promotionImg.setAttribute("title", ".");

    promotionH3.appendChild(promotionImg);
    promotionH3.appendChild(document.createTextNode(" Ưu đãi online"));

    const saleboxUl = document.createElement("ul");

    [
      { text: "Nhập mã ", code: "CT188", suffix: " giảm 50K đơn từ 499K" },
      { text: "Nhập mã ", code: "CT18806", suffix: " giảm 96K đơn từ 799K" },
      {
        text: "Nhập mã ",
        code: "CT18806NHOM7",
        suffix: " giảm 196K đơn từ 1099K",
      },
    ].forEach((item) => {
      const li = document.createElement("li");
      li.appendChild(document.createTextNode(item.text));
      const strong = document.createElement("strong");
      strong.appendChild(document.createTextNode(item.code));
      li.appendChild(strong);
      li.appendChild(document.createTextNode(item.suffix));
      saleboxUl.appendChild(li);
    });

    const freeshipLi = document.createElement("li");
    freeshipLi.appendChild(document.createTextNode("Freeship đơn từ 299K"));
    saleboxUl.appendChild(freeshipLi);

    salebox.appendChild(promotionH3);
    salebox.appendChild(saleboxUl);

    // Selector màu sắc: mỗi <li> lưu ảnh tương ứng qua data-img
    const colorDiv = document.createElement("div");
    colorDiv.classList.add("color");

    const currentColorP = document.createElement("p");
    currentColorP.classList.add("current-color");
    currentColorP.appendChild(document.createTextNode("Màu sắc: "));
    const currentColorStrong = document.createElement("strong");
    currentColorStrong.appendChild(document.createTextNode(currentColor));
    currentColorP.appendChild(currentColorStrong);

    const colorUl = document.createElement("ul");
    product.colors.forEach((item) => {
      const li = document.createElement("li");
      li.setAttribute("data-img", item.img);
      // Lưu tên màu vào data-color để sau này đọc qua getAttribute (tránh dùng innerText/textContent)
      li.setAttribute("data-color", item.color);
      li.appendChild(document.createTextNode(item.color));
      colorUl.appendChild(li);
    });

    colorDiv.appendChild(currentColorP);
    colorDiv.appendChild(colorUl);

    // Selector kích thước
    const sizeDiv = document.createElement("div");
    sizeDiv.classList.add("size");

    const sizeHead = document.createElement("div");
    sizeHead.classList.add("size-head");

    const currentSizeDiv = document.createElement("div");
    currentSizeDiv.classList.add("current-size");
    currentSizeDiv.appendChild(document.createTextNode("Kích thước: "));
    const currentSizeStrong = document.createElement("strong");
    currentSizeStrong.appendChild(document.createTextNode(currentSize));
    currentSizeDiv.appendChild(currentSizeStrong);

    const sizingDiv = document.createElement("div");
    sizingDiv.classList.add("sizing");

    const rulerIcon = document.createElement("i");
    rulerIcon.classList.add("fa-solid", "fa-ruler");

    const sizingSpan = document.createElement("span");
    sizingSpan.appendChild(document.createTextNode("Hướng dẫn chọn size"));

    sizingDiv.appendChild(rulerIcon);
    sizingDiv.appendChild(sizingSpan);

    sizeHead.appendChild(currentSizeDiv);
    sizeHead.appendChild(sizingDiv);

    const sizeSelectDiv = document.createElement("div");
    sizeSelectDiv.classList.add("size-select");

    const sizeUl = document.createElement("ul");
    product.sizes.forEach((item) => {
      const li = document.createElement("li");
      // Lưu tên size vào data-size để sau này đọc qua getAttribute (tránh dùng innerText/textContent)
      li.setAttribute("data-size", item);
      li.appendChild(document.createTextNode(item));
      sizeUl.appendChild(li);
    });

    sizeSelectDiv.appendChild(sizeUl);

    sizeDiv.appendChild(sizeHead);
    sizeDiv.appendChild(sizeSelectDiv);

    // Bộ điều khiển số lượng + nút thêm giỏ hàng
    const selectorAction = document.createElement("div");
    selectorAction.classList.add("selector-action");

    const quantityAction = document.createElement("div");
    quantityAction.classList.add("quantity-action");

    const minusBtn = document.createElement("button");
    minusBtn.classList.add("minus");
    minusBtn.appendChild(document.createTextNode("-"));

    const quantityInp = document.createElement("input");
    quantityInp.setAttribute("type", "text");
    quantityInp.classList.add("quantity");
    quantityInp.setAttribute("title", "Nhập số lượng");
    quantityInp.setAttribute("min", "1");
    quantityInp.setAttribute("max", "999");
    quantityInp.setAttribute("value", currentQuantity);

    const plusBtn = document.createElement("button");
    plusBtn.classList.add("plus");
    plusBtn.appendChild(document.createTextNode("+"));

    quantityAction.appendChild(minusBtn);
    quantityAction.appendChild(quantityInp);
    quantityAction.appendChild(plusBtn);

    const addCartDiv = document.createElement("div");
    addCartDiv.classList.add("add-cart");

    const addCartBtn = document.createElement("button");
    addCartBtn.appendChild(document.createTextNode("Thêm vào giỏ hàng"));

    addCartDiv.appendChild(addCartBtn);

    selectorAction.appendChild(quantityAction);
    selectorAction.appendChild(addCartDiv);

    // Chính sách mua hàng (freeship, đổi trả, COD...)
    const policiesDiv = document.createElement("div");
    policiesDiv.classList.add("product-policies");

    const policiesUl = document.createElement("ul");

    [
      {
        img: "assets/images/productlistimage/policy_product_image_1.png",
        text: "FreeShip từ đơn 299k",
      },
      {
        img: "assets/images/productlistimage/policy_product_image_2.png",
        text: "Giảm giá thành viên lên đến 15%",
      },
      {
        img: "assets/images/productlistimage/policy_product_image_3.png",
        text: "Thanh toán COD",
      },
      {
        img: "assets/images/productlistimage/policy_product_image_4.png",
        text: "Đổi trả hàng miễn phí trong 15 ngày",
      },
    ].forEach((item) => {
      const li = document.createElement("li");
      const img = document.createElement("img");
      img.setAttribute("src", item.img);
      img.setAttribute("alt", "");
      const p = document.createElement("p");
      p.appendChild(document.createTextNode(item.text));
      li.appendChild(img);
      li.appendChild(p);
      policiesUl.appendChild(li);
    });

    policiesDiv.appendChild(policiesUl);

    // Ghép tất cả vào productInfo
    productInfo.appendChild(productName);
    productInfo.appendChild(priceRow);
    productInfo.appendChild(salebox);
    productInfo.appendChild(colorDiv);
    productInfo.appendChild(sizeDiv);
    productInfo.appendChild(selectorAction);
    productInfo.appendChild(policiesDiv);

    // Ghép vào container chính
    singleProduct.appendChild(productGallery);
    singleProduct.appendChild(productInfo);

    // Kích hoạt trạng thái "active" cho màu và size đầu tiên mặc định
    document.querySelector(".color ul li").classList.add("active");
    document.querySelector(".size-select ul li").classList.add("active");

    // Cập nhật tiêu đề tab trình duyệt thành tên sản phẩm
    const titleEl = document.querySelector("head title");
    while (titleEl.firstChild) titleEl.removeChild(titleEl.firstChild);
    titleEl.appendChild(document.createTextNode(product.name));

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

        // Cập nhật biến trạng thái bằng getAttribute thay vì đọc e.target.innerText
        currentColor = item.getAttribute("data-color");
        const colorStrong = document.querySelector(
          ".product-info .color .current-color strong",
        );
        while (colorStrong.firstChild)
          colorStrong.removeChild(colorStrong.firstChild);
        colorStrong.appendChild(document.createTextNode(currentColor));

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
        // Cập nhật biến trạng thái bằng getAttribute thay vì đọc e.target.innerText
        currentSize = item.getAttribute("data-size");
        const sizeStrong = document.querySelector(
          ".product-info .size .current-size strong",
        );
        while (sizeStrong.firstChild)
          sizeStrong.removeChild(sizeStrong.firstChild);
        sizeStrong.appendChild(document.createTextNode(currentSize));
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
    // ── Render khu vực mô tả chi tiết bằng createElement ──
    while (moreDescription.firstChild)
      moreDescription.removeChild(moreDescription.firstChild);

    const hr1 = document.createElement("hr");

    const descH3 = document.createElement("h3");
    const mellowStrong = document.createElement("strong");
    mellowStrong.appendChild(document.createTextNode("MELLOW® "));
    descH3.appendChild(mellowStrong);
    descH3.appendChild(document.createTextNode(product.name));

    const materialUl = document.createElement("ul");

    const materialLi = document.createElement("li");
    const materialStrong = document.createElement("strong");
    materialStrong.appendChild(document.createTextNode("Chất liệu: "));
    materialLi.appendChild(materialStrong);
    materialLi.appendChild(document.createTextNode(product.material));

    const formLi = document.createElement("li");
    const formStrong = document.createElement("strong");
    formStrong.appendChild(document.createTextNode("Form: "));
    formLi.appendChild(formStrong);
    formLi.appendChild(document.createTextNode(product.form));

    materialUl.appendChild(materialLi);
    materialUl.appendChild(formLi);

    const hr2 = document.createElement("hr");

    // Mô tả, Bảo quản, Kỹ thuật thiết kế
    const descSections = [
      { title: "► Mô tả", content: product.description },
      { title: "► Cách bảo quản", content: product.preserve },
      { title: "► Kỹ thuật thiết kế", content: product.designTechnique },
    ];

    moreDescription.appendChild(hr1);
    moreDescription.appendChild(descH3);
    moreDescription.appendChild(materialUl);
    moreDescription.appendChild(hr2);

    descSections.forEach((section) => {
      const p = document.createElement("p");
      const strong = document.createElement("strong");
      strong.appendChild(document.createTextNode(section.title));
      p.appendChild(strong);

      const span = document.createElement("span");
      span.appendChild(document.createTextNode(section.content));

      moreDescription.appendChild(p);
      moreDescription.appendChild(span);
    });

    const hr3 = document.createElement("hr");
    moreDescription.appendChild(hr3);

    // ── Render khu vực sản phẩm liên quan ───────────
    // Mỗi card liên quan có ảnh hover, tên, giá và badge "NEW" nếu isNew === true
    // ── Render sản phẩm liên quan bằng createElement ──
    while (references.firstChild) references.removeChild(references.firstChild);

    relatedProducts.forEach((prod) => {
      const card = document.createElement("article");
      card.classList.add("related-product-card");
      card.setAttribute("data-key", prod.id);
      card.setAttribute("data-category-slug", prod.categorySlug);

      const imageLink = document.createElement("a");
      imageLink.setAttribute("href", `productdetail.html?id=${prod.id}`);
      imageLink.classList.add("related-card-image-link");

      const relMainImg = document.createElement("img");
      relMainImg.setAttribute("src", prod.mainImg);
      relMainImg.setAttribute("alt", prod.name);
      relMainImg.classList.add("related-card-main-img");

      const relHoverImg = document.createElement("img");
      relHoverImg.setAttribute("src", prod.ImgHover);
      relHoverImg.setAttribute("alt", prod.name);
      relHoverImg.classList.add("related-card-hover-img");

      imageLink.appendChild(relMainImg);
      imageLink.appendChild(relHoverImg);

      const cardContent = document.createElement("div");
      cardContent.classList.add("related-card-content");

      const nameLink = document.createElement("a");
      nameLink.setAttribute("href", `productdetail.html?id=${prod.id}`);

      const relName = document.createElement("h3");
      relName.classList.add("related-card-name");
      relName.appendChild(document.createTextNode(prod.name));

      nameLink.appendChild(relName);

      const pricesDiv = document.createElement("div");
      pricesDiv.classList.add("related-card-prices");

      const relCurrentPrice = document.createElement("span");
      relCurrentPrice.classList.add("related-card-current-price");
      relCurrentPrice.appendChild(
        document.createTextNode(
          `${(Math.ceil((prod.priceValue * (1 - prod.discountPercent / 100)) / 1000) * 1000).toLocaleString("vi-VN")}₫`,
        ),
      );

      const relSaleDiv = document.createElement("div");
      relSaleDiv.classList.add("related-card-sale");

      const relOldPrice = document.createElement("span");
      relOldPrice.classList.add("related-card-old-price");
      relOldPrice.appendChild(document.createTextNode(prod.price));

      const relDiscount = document.createElement("span");
      relDiscount.classList.add("related-card-discount");
      relDiscount.appendChild(
        document.createTextNode(`${prod.discountPercent}%`),
      );

      relSaleDiv.appendChild(relOldPrice);
      relSaleDiv.appendChild(relDiscount);

      pricesDiv.appendChild(relCurrentPrice);
      pricesDiv.appendChild(relSaleDiv);

      cardContent.appendChild(nameLink);
      cardContent.appendChild(pricesDiv);

      card.appendChild(imageLink);
      card.appendChild(cardContent);

      if (prod.isNew) {
        const badge = document.createElement("div");
        badge.classList.add("related-card-badge");
        const badgeImg = document.createElement("img");
        badgeImg.setAttribute("src", "assets/images/productlistimage/news.png");
        badgeImg.setAttribute("alt", "Sản phẩm mới");
        badge.appendChild(badgeImg);
        card.appendChild(badge);
      }

      references.appendChild(card);
    });

    // ── Render modal bảng size ──────────────────────
    // ── Render modal bảng size bằng createElement ──
    while (overlayModal.firstChild)
      overlayModal.removeChild(overlayModal.firstChild);

    const modalBox = document.createElement("div");
    modalBox.classList.add("modal-box");

    const closeBtn = document.createElement("span");
    closeBtn.id = "closeModalBtn";
    closeBtn.classList.add("close-btn");
    closeBtn.appendChild(document.createTextNode("\u00D7"));

    const modalH2 = document.createElement("h2");
    modalH2.style.textAlign = "center";
    modalH2.appendChild(document.createTextNode(`Bảng size ${product.name}`));

    const modalP = document.createElement("p");
    modalP.style.textAlign = "center";

    const modalImg = document.createElement("img");
    modalImg.setAttribute("src", product.ImgSizing);

    modalP.appendChild(modalImg);

    modalBox.appendChild(closeBtn);
    modalBox.appendChild(modalH2);
    modalBox.appendChild(modalP);

    overlayModal.appendChild(modalBox);

    // Click vào "Hướng dẫn chọn size" → mở modal overlay
    document
      .querySelector(".product-info .size .sizing span")
      .addEventListener("click", () => {
        overlayModal.classList.add("show");
      });

    // Click nút "×" trong modal → đóng modal
    closeBtn.addEventListener("click", () => {
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
    const mainEl = document.querySelector("main");
    while (mainEl.firstChild) mainEl.removeChild(mainEl.firstChild);
    const errorP = document.createElement("p");
    errorP.style.textAlign = "center";
    errorP.style.padding = "3rem";
    errorP.style.color = "var(--color-gray-600)";
    errorP.appendChild(
      document.createTextNode(
        "Có lỗi xảy ra khi tải sản phẩm. Vui lòng thử lại sau.",
      ),
    );
    mainEl.appendChild(errorP);
  }
};

//Hàm thông báo lỗi khi id không tồn tại hoặc không tìm thấy
const showError = () => {
  const body = document.querySelector("body");
  while (body.firstChild) body.removeChild(body.firstChild);
  const errorDiv = document.createElement("div");
  errorDiv.style.width = "100%";
  errorDiv.style.textAlign = "center";
  errorDiv.style.padding = "3rem";
  errorDiv.style.color = "var(--color-gray-600)";
  const errorP = document.createElement("p");
  errorP.appendChild(
    document.createTextNode("Không tìm thấy sản phẩm. Vui lòng quay lại "),
  );
  const errorLink = document.createElement("a");
  errorLink.setAttribute("href", "productlist.html");
  errorLink.style.display = "inline";
  errorLink.style.color = "var(--color-primary)";
  errorLink.appendChild(document.createTextNode("danh sách sản phẩm."));
  errorP.appendChild(errorLink);
  errorDiv.appendChild(errorP);
  body.appendChild(errorDiv);
};

// ===== KHỞI ĐỘNG =====
// Gọi hàm tải chi tiết sản phẩm ngay khi script được thực thi
getProductDetail();
