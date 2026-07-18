//=============================================================
//                       TÁC GIẢ
//    HUỲNH TẤN GIAO
//    B2408784
//=============================================================

function createHeader() {
  const fragment = document.createDocumentFragment();

  // Overlay
  const overlay = document.createElement("div");
  overlay.className = "nav-overlay";
  overlay.id = "nav-overlay";
  fragment.appendChild(overlay);

  // Nav
  const nav = document.createElement("nav");
  nav.className = "nav";

  // Menu button
  const menuBtn = document.createElement("button");
  menuBtn.className = "menu-toggle";
  menuBtn.id = "mobile-menu-toggle";
  menuBtn.title = "Menu";

  const menuIcon = document.createElement("i");
  menuIcon.className = "ti ti-menu-2";

  menuBtn.appendChild(menuIcon);
  nav.appendChild(menuBtn);

  // Logo
  const logoDiv = document.createElement("div");
  logoDiv.className = "nav-logo";

  const logoLink = document.createElement("a");
  logoLink.href = "index.html";

  const logoImg = document.createElement("img");
  logoImg.src = "assets/images/homepage/logo1.png";
  logoImg.alt = "logo";

  logoLink.appendChild(logoImg);
  logoDiv.appendChild(logoLink);
  nav.appendChild(logoDiv);

  // Menu
  const ul = document.createElement("ul");
  ul.className = "nav-links";
  ul.id = "nav-links-menu";

  // Close button
  const closeLi = document.createElement("li");
  closeLi.className = "mobile-close-item";

  const closeBtn = document.createElement("button");
  closeBtn.className = "menu-close";
  closeBtn.id = "mobile-menu-close";
  closeBtn.title = "Đóng Menu";

  const closeIcon = document.createElement("i");
  closeIcon.className = "ti ti-x";

  closeBtn.appendChild(closeIcon);
  closeLi.appendChild(closeBtn);
  ul.appendChild(closeLi);

  const menus = [
    {
      text: "TRANG CHỦ",
      href: "index.html",
    },
    {
      text: "DANH MỤC SẢN PHẨM",
      href: "productlist.html?category=all&key=&price=default",
    },
    {
      text: "GIỚI THIỆU",
      href: "about.html",
    },
  ];

  menus.forEach((item) => {
    const li = document.createElement("li");
    li.className = "links";

    const a = document.createElement("a");
    a.href = item.href;
    a.textContent = item.text;

    li.appendChild(a);
    ul.appendChild(li);
  });

  nav.appendChild(ul);

  // Icons
  const icons = document.createElement("div");
  icons.className = "nav-icons";

  // Cart
  const cart = document.createElement("a");
  cart.href = "cart.html";
  cart.title = "Giỏ hàng";
  cart.style.position = "relative";

  const cartIcon = document.createElement("i");
  cartIcon.className = "ti ti-shopping-bag";

  const badge = document.createElement("span");
  badge.className = "cart-badge";
  badge.textContent = "0";

  cart.append(cartIcon, badge);

  // User
  const user = document.createElement("a");
  user.href = "login.html";
  user.id = "user-account-btn";
  user.title = "Tài khoản";

  const userIcon = document.createElement("i");
  userIcon.className = "ti ti-user";

  user.appendChild(userIcon);

  icons.append(cart, user);

  nav.appendChild(icons);

  fragment.appendChild(nav);

  return fragment;
}

export default createHeader;
