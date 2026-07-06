// ================= Lấy dữ liệu =================

const currentUser = JSON.parse(localStorage.getItem("currentUser"));

const cartMap = new Map(JSON.parse(localStorage.getItem("cartMap")) || []);

let cartList = currentUser ? cartMap.get(currentUser.id) || [] : [];

// ================= Định dạng giá =================

function formatPrice(price) {
  return price.toLocaleString("vi-VN") + "₫";
}

// ================= Render giỏ hàng =================

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

  container.innerHTML = "";

  if (cartList.length === 0) {
    container.innerHTML = `
            <h2>Giỏ hàng đang trống.</h2>
        `;

    updateSummary();
    return;
  }

  cartList.forEach((product, index) => {
    container.innerHTML += `
        <div class="cart-item">

            <img src="${product.mainImg}" alt="${product.name}">

            <div class="details">

                <h2>${product.name}</h2>

                <div class="option-select">

                    
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

                <div class="bottom-info">

                        <div class="quantity-box">

                            <button class="minus" data-index="${index}">-</button>

                            <span class="quantity-number">
                                ${product.quantity}
                            </span>

                            <button class="plus" data-index="${index}">+</button>

                        </div>

                    <p class="price">
                        ${formatPrice(Math.ceil((product.priceValue * (1 - product.discountPercent / 100)) / 1000) * 1000 * product.quantity)}
                    </p>

                </div>

            </div>

            <button class="remove" data-index="${index}">
                <i class="fa-solid fa-trash"></i>
            </button>

        </div>
        `;
  });

  bindEvents();
  updateSummary();
}

// ================= Gắn sự kiện =================

function bindEvents() {
  // Tăng số lượng
  document.querySelectorAll(".plus").forEach((button) => {
    button.onclick = () => {
      const index = Number(button.dataset.index);

      cartList[index].quantity++;

      saveCart();
      renderCart();
    };
  });

  // Giảm số lượng
  document.querySelectorAll(".minus").forEach((button) => {
    button.onclick = () => {
      const index = Number(button.dataset.index);

      cartList[index].quantity--;

      if (cartList[index].quantity <= 0) {
        cartList.splice(index, 1);
      }

      saveCart();
      renderCart();
    };
  });

  // Xóa sản phẩm
  document.querySelectorAll(".remove").forEach((button) => {
    button.onclick = () => {
      const index = Number(button.dataset.index);

      cartList.splice(index, 1);

      if (typeof window.updateCartBadge === "function") {
        window.updateCartBadge();
      }
      saveCart();
      renderCart();
    };
  });

  // Đổi màu
  document.querySelectorAll(".color-select").forEach((select) => {
    select.onchange = () => {
      const index = Number(select.dataset.index);

      const product = cartList[index];

      product.selectedColor = select.value;

      // Đổi ảnh theo màu
      const selected = product.colors.find(
        (color) => color.color === select.value,
      );

      if (selected) {
        product.mainImg = selected.img;
      }

      saveCart();
      renderCart();
    };
  });

  // Đổi size
  document.querySelectorAll(".size-select").forEach((select) => {
    select.onchange = () => {
      const index = Number(select.dataset.index);

      cartList[index].selectedSize = select.value;

      saveCart();
    };
  });
}

// ================= Tổng tiền =================

function lastCost() {
  const voucherValue = Number(
    document.querySelector(".voucher-aplied strong").getAttribute("value"),
  );
  const preCost = Number(
    document
      .querySelector(".pricing-info .pre-cost strong")
      .getAttribute("value"),
  );
  const deliveryCost = Number(
    document
      .querySelector(".pricing-info .delivery-cost strong")
      .getAttribute("value"),
  );

  const lastCost = preCost + deliveryCost - voucherValue;

  document.querySelector(".pricing-info .total-cost strong").innerHTML =
    formatPrice(lastCost);
  document
    .querySelector(".pricing-info .total-cost strong")
    .setAttribute("value", lastCost);
}

function updateSummary() {
  let total = 0;

  cartList.forEach((item) => {
    total +=
      Math.ceil((item.priceValue * (1 - item.discountPercent / 100)) / 1000) *
      1000 *
      item.quantity;
  });
  document
    .querySelector(".pricing-info .pre-cost strong")
    .setAttribute("value", total);
  document.querySelector(".pricing-info .pre-cost strong").innerHTML =
    formatPrice(total);
  if (total > 0) {
    document.querySelector(".pricing-info .delivery-cost strong").innerHTML =
      total >= 299000 ? "Miễn phí" : formatPrice(30000);
    document
      .querySelector(".pricing-info .delivery-cost strong")
      .setAttribute("value", total >= 299000 ? 0 : 30000);
  } else {
    document.querySelector(".pricing-info .delivery-cost strong").innerHTML =
      "0₫";
    document
      .querySelector(".pricing-info .delivery-cost strong")
      .setAttribute("value", 0);
  }
  document
    .querySelector(".pricing-info .voucher-aplied strong")
    .setAttribute("value", 0);
  document.querySelector(".pricing-info .voucher-aplied strong").innerHTML =
    "0₫";

  lastCost();
}

// ================= Lưu LocalStorage =================

function saveCart() {
  if (!currentUser) return;

  cartMap.set(currentUser.id, cartList);

  localStorage.setItem("cartMap", JSON.stringify([...cartMap]));
}

// ================= Render lần đầu =================
document.addEventListener("DOMContentLoaded", () => {
  renderCart();

  // ================= Đặt hàng =================

  document.querySelector(".checkout").addEventListener("click", function () {
    if (cartList.length === 0) {
      alert("Giỏ hàng đang trống!");
      return;
    }

    const fullname = document.getElementById("fullname").value.trim();
    const phone = document.getElementById("phone").value.trim();
    const address = document.getElementById("address").value.trim();

    if (fullname === "" || phone === "" || address === "") {
      alert("Vui lòng nhập đầy đủ thông tin!");
      return;
    }

    const toast = document.getElementById("success-message");

    toast.classList.add("show");

    setTimeout(() => {
      toast.classList.remove("show");
    }, 3000);

    // Xóa giỏ hàng
    cartList = [];

    saveCart();

    renderCart();

    if (typeof window.updateCartBadge === "function") {
      window.updateCartBadge();
    }

    // Xóa form
    document.getElementById("fullname").value = "";
    document.getElementById("phone").value = "";
    document.getElementById("address").value = "";
    document.getElementById("note").value = "";

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
    document.querySelector(".voucher input").placeholder =
      "Nhập mã giảm giá của bạn...";
    document.querySelector(".voucher input").classList.remove("error");
  });

  // Xử lý áp dụng voucher
  document.querySelector(".voucher button").addEventListener("click", () => {
    const voucherInput = document.querySelector(".voucher input");
    const preCost = document.querySelector(".pricing-info .pre-cost strong");
    const voucherApply = document.querySelector(".voucher-aplied strong");

    const voucherMap = new Map([
      ["CT188", { voucherValue: 50000, condition: 499000 }],
      ["CT18806", { voucherValue: 96000, condition: 799000 }],
      ["CT18806NHOM7", { voucherValue: 196000, condition: 1099000 }],
    ]);
    if (!voucherMap.has(voucherInput.value.trim())) {
      voucherInput.value = "";
      voucherInput.placeholder = "Mã giảm giá không tồn tại.";
      voucherInput.classList.add("error");
      voucherApply.setAttribute("value", 0);
      voucherApply.innerHTML = "0₫";
      lastCost();
      return;
    }
    const { voucherValue, condition } = voucherMap.get(
      voucherInput.value.trim(),
    );
    if (Number(preCost.getAttribute("value")) >= condition) {
      voucherApply.setAttribute("value", voucherValue);
      voucherApply.innerHTML = formatPrice(voucherValue);
      voucherInput.value = "";
      voucherInput.placeholder = "Nhập mã giảm giá của bạn...";
      voucherInput.classList.remove("error");
    } else {
      voucherInput.value = "";
      voucherInput.placeholder = "Giá trị đơn hàng không đủ điều kiện áp dụng";
      voucherInput.classList.add("error");
      voucherApply.setAttribute("value", 0);
      voucherApply.innerHTML = "0₫";
    }
    lastCost();
  });
});
