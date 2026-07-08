//==========================================================================
//                  TÁC GIẢ(Phần xử lý tổng tiền(hàm lastCost) và áp dụng voucher(sự kiện cho thẻ nhập voucher))
//    HUỲNH TẤN GIAO
//    B2408784
//                  TÁC GIẢ(Phần còn lại)
//    Phùng Cao Yến Trang
//    B2404885
//==========================================================================

/**
 * cart.js - Quản lý giỏ hàng
 *
 * File này chịu trách nhiệm toàn bộ logic trang giỏ hàng (cart.html), bao gồm:
 *  - Hiển thị danh sách sản phẩm trong giỏ hàng
 *  - Tăng/giảm số lượng, xóa sản phẩm
 *  - Đổi màu sắc, kích thước sản phẩm
 *  - Tính toán tổng tiền, phí vận chuyển, áp dụng voucher
 *  - Xử lý đặt hàng và lưu trạng thái vào LocalStorage
 */

// ================= Lấy dữ liệu =================

/**
 * Lấy thông tin người dùng đang đăng nhập từ LocalStorage.
 * Giá trị là null nếu chưa đăng nhập.
 * @type {Object|null}
 */
const currentUser = JSON.parse(localStorage.getItem("currentUser"));

/**
 * Map lưu giỏ hàng của tất cả người dùng, với key là userId và value là mảng sản phẩm.
 * Dữ liệu được khởi tạo từ LocalStorage; nếu không có thì tạo Map rỗng.
 * @type {Map<string, Array>}
 */
const cartMap = new Map(JSON.parse(localStorage.getItem("cartMap")) || []);

/**
 * Danh sách sản phẩm trong giỏ hàng của người dùng hiện tại.
 * Nếu chưa đăng nhập, mặc định là mảng rỗng.
 * @type {Array<Object>}
 */
let cartList = currentUser ? cartMap.get(currentUser.id) || [] : [];

// ================= Định dạng giá =================

/**
 * Định dạng số tiền sang chuỗi theo kiểu tiền tệ Việt Nam.
 * Ví dụ: 150000 → "150.000₫"
 *
 * @param {number} price - Giá trị số cần định dạng
 * @returns {string} Chuỗi giá đã được định dạng kèm ký hiệu ₫
 */
function formatPrice(price) {
  return price.toLocaleString("vi-VN") + "₫";
}

// ================= Render giỏ hàng =================

/**
 * Hàm render (hiển thị) danh sách sản phẩm trong giỏ hàng lên giao diện.
 * Hàm này sẽ được gọi mỗi khi có thay đổi trong giỏ hàng (thêm, xóa, sửa số lượng).
 *
 * Các trường hợp được xử lý:
 *  - Container không tồn tại trong DOM → thoát sớm
 *  - Chưa đăng nhập → hiển thị thông báo yêu cầu đăng nhập
 *  - Giỏ hàng rỗng → hiển thị thông báo "Giỏ hàng đang trống"
 *  - Có sản phẩm → render từng sản phẩm dưới dạng HTML và gắn sự kiện
 */
function renderCart() {
  const container = document.getElementById("cart-list");

  // Lỗi 2: Bảo vệ nếu element không tồn tại trong DOM
  if (!container) return;

  // Lỗi 1: Nếu chưa đăng nhập, hiển thị thông báo và không render sản phẩm
  if (!currentUser) {
    container.innerHTML = `
            <h2>Vui lòng <a href="login.html" style="color: var(--color-primary);">đăng nhập</a> để xem giỏ hàng.</h2>
        `;
    updateSummary();
    return;
  }

  // Xóa nội dung cũ trước khi render lại
  container.innerHTML = "";

  // Nếu giỏ hàng rỗng, hiển thị thông báo và cập nhật tổng tiền về 0
  if (cartList.length === 0) {
    container.innerHTML = `
            <h2>Giỏ hàng đang trống.</h2>
        `;

    updateSummary();
    return;
  }

  // Duyệt qua từng sản phẩm và tạo HTML tương ứng
  cartList.forEach((product, index) => {
    container.innerHTML += `
        <div class="cart-item">

            <!-- Ảnh sản phẩm (thay đổi theo màu được chọn) -->
            <img src="${product.mainImg}" alt="${product.name}">

            <div class="details">

                <h2>${product.name}</h2>

                <!-- Dropdown chọn màu sắc và kích thước -->
                <div class="option-select">

                    <!-- Dropdown màu: hiển thị tất cả màu, đánh dấu màu đang chọn -->
                        <select class="color-select" data-index=${index} name="Màu">
                            ${product.colors
                              .map(
                                (color) => `
                                <option
                                    value="${color.color}"
                                    ${color.color === product.selectedColor ? "selected" : ""}
                                >
                                    ${color.color}
                                </option>
                            `,
                              )
                              .join("")}
                        </select>

                        <!-- Dropdown size: hiển thị tất cả size, đánh dấu size đang chọn -->
                        <select class="size-select" data-index=${index} name="Size">
                            ${product.sizes
                              .map(
                                (size) => `
                                <option
                                    value="${size}"
                                    ${size === product.selectedSize ? "selected" : ""}
                                >
                                    ${size}
                                </option>
                            `,
                              )
                              .join("")}
                        </select>

                </div>

                <!-- Phần dưới: điều chỉnh số lượng và hiển thị giá -->
                <div class="bottom-info">

                        <div class="quantity-box">

                            <button class="minus" data-index="${index}">-</button>

                            <span class="quantity-number">
                                ${product.quantity}
                            </span>

                            <button class="plus" data-index="${index}">+</button>

                        </div>

                    <!-- Giá = giá gốc * (1 - % giảm) * số lượng, làm tròn lên bội 1000 -->
                    <p class="price">
                        ${formatPrice(Math.ceil((product.priceValue * (1 - product.discountPercent / 100)) / 1000) * 1000 * product.quantity)}
                    </p>

                </div>

            </div>

            <!-- Nút xóa sản phẩm khỏi giỏ hàng -->
            <button class="remove" data-index="${index}">
                <i class="fa-solid fa-trash"></i>
            </button>

        </div>
        `;
  });

  // Sau khi render xong, gắn lại toàn bộ sự kiện và cập nhật tổng tiền
  bindEvents();
  updateSummary();
}

// ================= Gắn sự kiện =================

/**
 * Gắn các sự kiện click/change cho các nút chức năng bên trong giỏ hàng sau khi render.
 * Phải gọi lại mỗi lần renderCart() vì innerHTML thay thế toàn bộ DOM → mất sự kiện cũ.
 *
 * Các sự kiện được gắn:
 *  - Nút "+" (class .plus): tăng số lượng sản phẩm
 *  - Nút "-" (class .minus): giảm số lượng; nếu ≤ 0 thì xóa sản phẩm
 *  - Nút xóa (class .remove): xóa sản phẩm khỏi giỏ
 *  - Dropdown màu (class .color-select): cập nhật màu và ảnh sản phẩm
 *  - Dropdown size (class .size-select): cập nhật kích thước sản phẩm
 */
function bindEvents() {
  // ---- Tăng số lượng ----
  document.querySelectorAll(".plus").forEach((button) => {
    button.onclick = () => {
      const index = Number(button.dataset.index);

      cartList[index].quantity++;

      saveCart();
      renderCart();
    };
  });

  // ---- Giảm số lượng ----
  // Nếu số lượng về 0 hoặc âm → tự động xóa sản phẩm khỏi mảng
  document.querySelectorAll(".minus").forEach((button) => {
    button.onclick = () => {
      const index = Number(button.dataset.index);

      cartList[index].quantity--;

      if (cartList[index].quantity <= 0) {
        cartList.splice(index, 1); // Xóa phần tử tại vị trí index
      }

      saveCart();
      renderCart();
    };
  });

  // ---- Xóa sản phẩm ----
  document.querySelectorAll(".remove").forEach((button) => {
    button.onclick = () => {
      const index = Number(button.dataset.index);

      cartList.splice(index, 1); // Xóa sản phẩm khỏi mảng

      // Cập nhật badge số lượng trên icon giỏ hàng ở header (nếu hàm tồn tại)
      if (typeof window.updateCartBadge === "function") {
        window.updateCartBadge();
      }
      saveCart();
      renderCart();
    };
  });

  // ---- Đổi màu sắc ----
  // Khi thay đổi màu, cập nhật selectedColor và đổi ảnh chính sang ảnh của màu đó
  document.querySelectorAll(".color-select").forEach((select) => {
    select.onchange = () => {
      const index = Number(select.dataset.index);

      const product = cartList[index];

      product.selectedColor = select.value;

      // Tìm object màu tương ứng để lấy ảnh preview
      const selected = product.colors.find(
        (color) => color.color === select.value,
      );

      if (selected) {
        product.mainImg = selected.img; // Cập nhật ảnh hiển thị theo màu mới
      }

      saveCart();
      renderCart();
    };
  });

  // ---- Đổi kích thước (size) ----
  // Chỉ cập nhật selectedSize, không cần re-render giao diện
  document.querySelectorAll(".size-select").forEach((select) => {
    select.onchange = () => {
      const index = Number(select.dataset.index);

      cartList[index].selectedSize = select.value;

      saveCart();
    };
  });
}

// ================= Tổng tiền =================

/**
 * Tính và cập nhật số tiền cuối cùng phải thanh toán.
 * Công thức: Tổng tiền gốc + Phí vận chuyển - Giảm giá voucher
 *
 * Đọc giá trị từ thuộc tính `value` của các element DOM (không dùng innerHTML
 * để tránh sai sót với định dạng chuỗi).
 */
function lastCost() {
  // Lấy giá trị voucher đã áp dụng (0 nếu chưa dùng mã)
  const voucherValue = Number(
    document.querySelector(".voucher-aplied strong").getAttribute("value"),
  );
  // Lấy tổng tiền hàng trước phí
  const preCost = Number(
    document
      .querySelector(".pricing-info .pre-cost strong")
      .getAttribute("value"),
  );
  // Lấy phí vận chuyển (0 nếu được miễn phí)
  const deliveryCost = Number(
    document
      .querySelector(".pricing-info .delivery-cost strong")
      .getAttribute("value"),
  );

  const lastCost = preCost + deliveryCost - voucherValue;

  // Hiển thị và lưu tổng tiền cuối cùng vào DOM
  document.querySelector(".pricing-info .total-cost strong").innerHTML =
    formatPrice(lastCost);
  document
    .querySelector(".pricing-info .total-cost strong")
    .setAttribute("value", lastCost);
}

/**
 * Tính toán lại tổng tiền hàng gốc dựa trên danh sách sản phẩm hiện tại,
 * đồng thời cập nhật phí vận chuyển và reset voucher về 0.
 *
 * Logic phí vận chuyển:
 *  - Tổng tiền = 0 → phí = 0₫ (giỏ hàng rỗng)
 *  - Tổng tiền >= 299.000₫ → Miễn phí vận chuyển
 *  - Tổng tiền < 299.000₫ → Phí vận chuyển 30.000₫
 *
 * Sau khi cập nhật, gọi lastCost() để tính tổng cuối cùng.
 */
function updateSummary() {
  let total = 0;

  // Tính tổng tiền: mỗi sản phẩm = giá sau giảm (làm tròn bội 1000) × số lượng
  cartList.forEach((item) => {
    total +=
      Math.ceil((item.priceValue * (1 - item.discountPercent / 100)) / 1000) *
      1000 *
      item.quantity;
  });

  // Cập nhật hiển thị tổng tiền hàng
  document
    .querySelector(".pricing-info .pre-cost strong")
    .setAttribute("value", total);
  document.querySelector(".pricing-info .pre-cost strong").innerHTML =
    formatPrice(total);

  // Cập nhật phí vận chuyển dựa theo ngưỡng giá trị đơn hàng
  if (total > 0) {
    document.querySelector(".pricing-info .delivery-cost strong").innerHTML =
      total >= 299000 ? "Miễn phí" : formatPrice(30000);
    document
      .querySelector(".pricing-info .delivery-cost strong")
      .setAttribute("value", total >= 299000 ? 0 : 30000);
  } else {
    // Giỏ hàng rỗng: phí vận chuyển = 0
    document.querySelector(".pricing-info .delivery-cost strong").innerHTML =
      "0₫";
    document
      .querySelector(".pricing-info .delivery-cost strong")
      .setAttribute("value", 0);
  }

  // Reset giảm giá voucher về 0 mỗi lần tính lại tổng
  document
    .querySelector(".pricing-info .voucher-aplied strong")
    .setAttribute("value", 0);
  document.querySelector(".pricing-info .voucher-aplied strong").innerHTML =
    "0₫";

  // Tính và cập nhật tổng cuối cùng
  lastCost();
}

// ================= Lưu LocalStorage =================

/**
 * Lưu trạng thái giỏ hàng hiện tại (`cartList`) vào LocalStorage.
 * Sử dụng `cartMap` để quản lý giỏ hàng của nhiều người dùng cùng lúc.
 * Key lưu trữ: "cartMap" → chuỗi JSON của toàn bộ Map (dạng mảng các cặp [key, value])
 */
function saveCart() {
  if (!currentUser) return; // Chỉ lưu khi có người dùng đăng nhập

  // Cập nhật giỏ hàng của người dùng hiện tại trong Map
  cartMap.set(currentUser.id, cartList);

  // Chuyển Map thành mảng để serialize bằng JSON.stringify
  localStorage.setItem("cartMap", JSON.stringify([...cartMap]));
}

// ================= Render lần đầu =================
document.addEventListener("DOMContentLoaded", () => {
  // Render giỏ hàng ngay khi trang tải xong
  renderCart();

  // ================= Xử lý đặt hàng =================

  /**
   * Xử lý sự kiện click nút "Đặt hàng" (class .checkout).
   * Kiểm tra điều kiện hợp lệ, hiển thị thông báo thành công,
   * xóa giỏ hàng và reset toàn bộ form thông tin giao hàng.
   */
  document.querySelector(".checkout").addEventListener("click", function () {
    // Kiểm tra giỏ hàng không được rỗng
    if (cartList.length === 0) {
      alert("Giỏ hàng đang trống!");
      return;
    }

    // Lấy thông tin giao hàng từ form và loại bỏ khoảng trắng thừa
    const fullname = document.getElementById("fullname").value.trim();
    const phone = document.getElementById("phone").value.trim();
    const address = document.getElementById("address").value.trim();

    // Kiểm tra người dùng đã điền đủ thông tin bắt buộc chưa
    if (fullname === "" || phone === "" || address === "") {
      alert("Vui lòng nhập đầy đủ thông tin!");
      return;
    }

    // Hiển thị toast thông báo đặt hàng thành công trong 3 giây
    const toast = document.getElementById("success-message");

    toast.classList.add("show");

    setTimeout(() => {
      toast.classList.remove("show");
    }, 3000);

    // Xóa toàn bộ sản phẩm trong giỏ hàng
    cartList = [];

    saveCart();

    renderCart();

    // Cập nhật badge giỏ hàng trên header (nếu script.js đã định nghĩa hàm này)
    if (typeof window.updateCartBadge === "function") {
      window.updateCartBadge();
    }

    // Xóa (reset) toàn bộ các trường trong form thông tin giao hàng
    document.getElementById("fullname").value = "";
    document.getElementById("phone").value = "";
    document.getElementById("address").value = "";
    document.getElementById("note").value = "";

    // Reset hiển thị các ô tổng tiền về 0₫
    document.querySelector(".pricing-info .pre-cost strong").innerHTML = "0₫";
    document
      .querySelector(".pricing-info .pre-cost strong")
      .setAttribute("value", 0);

    document.querySelector(".pricing-info .delivery-cost strong").innerHTML =
      "0₫";
    document
      .querySelector(".pricing-info .delivery-cost strong")
      .setAttribute("value", 0);

    document.querySelector(".pricing-info .voucher-aplied strong").innerHTML =
      "0₫";
    document
      .querySelector(".pricing-info .voucher-aplied strong")
      .setAttribute("value", 0);

    document.querySelector(".pricing-info .total-cost strong").innerHTML = "0₫";
    document
      .querySelector(".pricing-info .total-cost strong")
      .setAttribute("value", 0);

    // Reset ô nhập mã giảm giá về trạng thái ban đầu
    document.querySelector(".voucher input").placeholder =
      "Nhập mã giảm giá của bạn...";
    document.querySelector(".voucher input").classList.remove("error");
  });

  // ================= Xử lý voucher (Mã giảm giá) =================

  /**
   * Xử lý sự kiện click nút "Áp dụng" mã giảm giá.
   *
   * Danh sách mã hợp lệ và điều kiện:
   *  - "CT188"        → Giảm 50.000₫  | Đơn từ 499.000₫
   *  - "CT18806"      → Giảm 96.000₫  | Đơn từ 799.000₫
   *  - "CT18806NHOM7" → Giảm 196.000₫ | Đơn từ 1.099.000₫
   *
   * Các trường hợp lỗi:
   *  - Mã không tồn tại → hiển thị thông báo lỗi, reset giảm giá về 0
   *  - Mã hợp lệ nhưng đơn hàng chưa đạt điều kiện → thông báo không đủ điều kiện
   */
  document.querySelector(".voucher button").addEventListener("click", () => {
    const voucherInput = document.querySelector(".voucher input");
    const preCost = document.querySelector(".pricing-info .pre-cost strong");
    const voucherApply = document.querySelector(".voucher-aplied strong");

    // Khởi tạo danh sách các mã giảm giá hợp lệ và điều kiện áp dụng
    const voucherMap = new Map([
      ["CT188", { voucherValue: 50000, condition: 499000 }],
      ["CT18806", { voucherValue: 96000, condition: 799000 }],
      ["CT18806NHOM7", { voucherValue: 196000, condition: 1099000 }],
    ]);

    // Kiểm tra mã có tồn tại trong hệ thống không
    if (!voucherMap.has(voucherInput.value.trim())) {
      voucherInput.value = "";
      voucherInput.placeholder = "Mã giảm giá không tồn tại.";
      voucherInput.classList.add("error"); // Viền đỏ báo lỗi
      voucherApply.setAttribute("value", 0);
      voucherApply.innerHTML = "0₫";
      lastCost();
      return;
    }

    // Lấy thông tin của mã giảm giá hợp lệ
    const { voucherValue, condition } = voucherMap.get(
      voucherInput.value.trim(),
    );

    // Kiểm tra tổng đơn hàng có đủ điều kiện áp dụng mã không
    if (Number(preCost.getAttribute("value")) >= condition) {
      // Áp dụng thành công: cập nhật giá trị giảm và làm sạch input
      voucherApply.setAttribute("value", voucherValue);
      voucherApply.innerHTML = formatPrice(voucherValue);
      voucherInput.value = "";
      voucherInput.placeholder = "Nhập mã giảm giá của bạn...";
      voucherInput.classList.remove("error");
    } else {
      // Đơn hàng chưa đạt ngưỡng tối thiểu: thông báo lỗi, không áp dụng
      voucherInput.value = "";
      voucherInput.placeholder = "Giá trị đơn hàng không đủ điều kiện áp dụng";
      voucherInput.classList.add("error");
      voucherApply.setAttribute("value", 0);
      voucherApply.innerHTML = "0₫";
    }

    // Tính lại tổng tiền sau khi xử lý voucher
    lastCost();
  });
});
