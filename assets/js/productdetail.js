const singleProduct = document.querySelector(".container-main");
const moreDescription = document.querySelector(".more-description");
const references = document.querySelector(".references .references-product");
const overlayModal = document.querySelector("#overlayModal");

let currentColor = "";
let currentSize = "";
let currentQuantity = 1;
let currentToast = null;

const getProductDetail = async () => {
  try {
    const path = new URLSearchParams(window.location.search);
    const productId = path.get("id");

    if (!productId) {
      document.querySelector("main").innerHTML =
        `<p style="text-align:center;padding:3rem;color:var(--color-gray-600);">Không tìm thấy sản phẩm. Vui lòng quay lại <a href="productlist.html" style="color:var(--color-primary);">danh sách sản phẩm</a>.</p>`;
      return;
    }

    const productList = await (
      await fetch("./assets/js/productlist.json")
    ).json();

    const product = productList.find(
      (prod) => prod.id.toString() === productId.toString(),
    );

    if (!product) {
      document.querySelector("main").innerHTML =
        `<p style="text-align:center;padding:3rem;color:var(--color-gray-600);">Sản phẩm không tồn tại. Vui lòng quay lại <a href="productlist.html" style="color:var(--color-primary);">danh sách sản phẩm</a>.</p>`;
      return;
    }

    currentColor = product.colors[0].color;
    currentSize = product.sizes[0];
    currentMainImage = product.mainImg;
    currentQuantity = 1;

    const relatedId = product.references.map((id) => id.toString());
    const relatedProducts = productList.filter((prod) => {
      return relatedId.includes(prod.id.toString());
    });

    singleProduct.innerHTML = `
    <div class="product-gallery">
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
        <p class="detail-price-current">${(Math.ceil((product.priceValue * (1 - product.discountPercent / 100)) / 1000) * 1000).toLocaleString("vi-VN")}₫</p>
        <p class="detail-price-old">${product.price}</p>
        <div class="detail-discount">${product.discountPercent}%</div>
      </div>
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
          <li>Nhập mã <strong>CT18806</strong> giảm 50K đơn từ 799K</li>
          <li>
            Nhập mã <strong>CT18806NHOM7</strong> giảm 80K đơn từ 1099K
          </li>
          <li>Freeship đơn từ 399K</li>
        </ul>
      </div>

      <div class="color">
        <p class="current-color">Màu sắc: <strong>${currentColor}</strong></p>
        <ul>
          ${product.colors.map((item) => `<li data-img="${item.img}">${item.color}</li>`).join("")}
        </ul>
      </div>

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

      <div class="product-policies">
        <ul>
          <li>
            <img
              src="assets/images/productlistimage/policy_product_image_1.png"
              alt=""
            />
            <p>FreeShip từ đơn 399k</p>
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
    document.querySelector(".color ul li").classList.add("active");
    document.querySelector(".size-select ul li").classList.add("active");

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

    thumbnailImage.forEach((item) => {
      item.addEventListener("click", (e) => {
        thumbnailImage.forEach((item) => item.classList.remove("active"));
        item.classList.add("active");

        const mainImg = document.querySelector(
          ".product-gallery .main-img img",
        );
        mainImg.src = e.target.src;

        mainImg.classList.remove("fade");
        void mainImg.offsetWidth;
        mainImg.classList.add("fade");
      });
    });

    colorSelector.forEach((item) => {
      item.addEventListener("click", (e) => {
        if (item.classList.contains("active")) return;
        colorSelector.forEach((item) => item.classList.remove("active"));
        item.classList.add("active");

        currentColor = e.target.innerText;

        document.querySelector(
          ".product-info .color .current-color strong",
        ).innerHTML = currentColor;

        thumbnailImage.forEach((thumb) => {
          thumb.classList.remove("active");
          if (thumb.getAttribute("src") === item.getAttribute("data-img"))
            thumb.classList.add("active");
        });

        const mainImg = document.querySelector(
          ".product-gallery .main-img img",
        );
        mainImg.src = item.getAttribute("data-img");
        mainImg.classList.remove("fade");
        void mainImg.offsetWidth;
        mainImg.classList.add("fade");
      });
    });

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

    minusQuantityButton.addEventListener("click", () => {
      if (currentQuantity > 1) currentQuantity--;
      quantityInput.value = currentQuantity;
    });

    plusQuantityButton.addEventListener("click", () => {
      if (currentQuantity < 999) currentQuantity++;
      quantityInput.value = currentQuantity;
    });

    quantityInput.addEventListener("input", (e) => {
      const isNumber = (str) => /^[0-9]+$/.test(str);
      if (Number(e.target.value) < 1 || !isNumber(e.target.value))
        e.target.value = "";
      if (Number(e.target.value) > 999) e.target.value = 999;
      currentQuantity = Number(e.target.value) || 1;
    });

    quantityInput.addEventListener("blur", (e) => {
      if (!e.target.value || Number(e.target.value) < 1) e.target.value = 1;
      currentQuantity = Number(e.target.value);
    });

    addCardBtn.addEventListener("click", () => {
      if (currentToast) {
        currentToast.hideToast();
      }
      currentToast = Toastify({
        text: `Đã thêm ${product.name} vào giỏ hàng`,
        duration: 3000, // 3 giây rồi ẩn
        newWindow: true,
        gravity: "bottom", // Tọa độ Y: "top" hoặc "bottom" (Chọn bottom theo ý bạn)
        position: "right", // Tọa độ X: "left", "center", hoặc "right" (Chọn right theo ý bạn)
        stopOnFocus: true, // Tạm dừng đếm ngược khi di chuột vào toast
        style: {
          background: "#2563eb", // Background màu xanh theo yêu cầu
          color: "#ffffff", // Chữ màu trắng
          borderRadius: "8px", // Bo góc cho đẹp (tùy chọn)
        },
        onClick: function () {
          currentToast = null;
        }, // Callback sau khi click vào toast (nếu cần)
      });
      currentToast.showToast();

      const cartProduct = JSON.parse(localStorage.getItem("cart") || "[]");

      if (
        cartProduct.some(
          (item) =>
            item.id === product.id &&
            item.selectedColor === currentColor &&
            item.selectedSize === currentSize,
        )
      ) {
        localStorage.setItem(
          "cart",
          JSON.stringify(
            cartProduct.map((item) => {
              return item.id === product.id &&
                item.selectedColor === currentColor &&
                item.selectedSize === currentSize
                ? {
                    ...item,
                    quantity: Number(item.quantity) + Number(currentQuantity),
                  }
                : item;
            }),
          ),
        );
      } else
        localStorage.setItem(
          "cart",
          JSON.stringify([
            ...cartProduct,
            {
              id: product.id,
              name: product.name,
              price: product.price,
              priceValue: product.priceValue,
              sizes: product.sizes,
              colors: product.colors,
              mainImg: product.mainImg,
              ImgHover: product.ImgHover,
              ImgSizing: product.ImgSizing,
              discountPercent: product.discountPercent,
              stock: product.stock,
              quantity: currentQuantity,
              selectedSize: currentSize,
              selectedColor: currentColor,
            },
          ]),
        );
    });

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

    overlayModal.innerHTML = `
      <div class="modal-box">
        <span id="closeModalBtn" class="close-btn">&times;</span>
        <h2 style="text-align: center;">Bảng size ${product.name}</h2>
        <p style="text-align: center;">
          <img src="${product.ImgSizing}"/>
        </p>
      </div>
    `;

    document
      .querySelector(".product-info .size .sizing span")
      .addEventListener("click", () => {
        overlayModal.classList.add("show");
      });
    document
      .getElementById("closeModalBtn")
      .addEventListener("click", function () {
        overlayModal.classList.remove("show");
      });
    window.addEventListener("click", function (event) {
      if (event.target === overlayModal) {
        overlayModal.classList.remove("show");
      }
    });
  } catch (error) {
    console.error("Lỗi khi tải chi tiết sản phẩm:", error);
    document.querySelector("main").innerHTML =
      `<p style="text-align:center;padding:3rem;color:var(--color-gray-600);">Có lỗi xảy ra khi tải sản phẩm. Vui lòng thử lại sau.</p>`;
  }
};

getProductDetail();
