//=============================================================
//                       TÁC GIẢ
//    HUỲNH TẤN GIAO
//    B2408784
//=============================================================

function createFooter() {
  const fragment = document.createDocumentFragment();

  // Line
  const line = document.createElement("div");
  line.className = "footer-line";
  fragment.appendChild(line);

  // Content
  const content = document.createElement("div");
  content.className = "footer-content";

  /* ========= MELLOW ========= */

  const mellow = document.createElement("div");
  mellow.className = "footer-item footer-mellow";

  const brand = document.createElement("div");
  brand.className = "footer-brand";

  const brandImg = document.createElement("img");
  brandImg.src = "./assets/images/footer/logo_footer.png";
  brandImg.alt = "logo";

  const brandText = document.createElement("span");
  brandText.className = "footer-brand-text";
  brandText.textContent = "MELLOW";

  brand.append(brandImg, brandText);

  const text = document.createElement("p");
  text.className = "footer-text";
  text.innerText =
    "Mang đến cho bạn những thời trang phong cách hiện đại nhất.\nHãy tỏa sáng theo cách của bạn";

  const slogan = document.createElement("p");
  slogan.className = "footer-slogan";
  slogan.textContent = '"Uy tín làm nên thương hiệu"';

  const titleWrap = document.createElement("div");
  titleWrap.className = "footer-title-underline";

  const title = document.createElement("h4");
  title.className = "footer-title";
  title.textContent = "Theo dõi MELLOW ngay";

  const underline = document.createElement("div");
  underline.className = "footer-underline";

  titleWrap.append(title, underline);

  const social = document.createElement("div");
  social.className = "footer-social";

  [
    "ri-facebook-fill",
    "ri-instagram-fill",
    "ri-tiktok-fill",
    "ri-twitter-x-line",
  ].forEach((icon) => {
    const a = document.createElement("a");
    a.href = "#";

    const i = document.createElement("i");
    i.className = icon;

    a.appendChild(i);
    social.appendChild(a);
  });

  mellow.append(brand, text, slogan, titleWrap, social);

  /* ========= ABOUT ========= */

  function createSection(titleText, links, icon) {
    const section = document.createElement("div");
    section.className = "footer-item";

    const wrap = document.createElement("div");
    wrap.className = "footer-title-underline";

    const h4 = document.createElement("h4");
    h4.className = "footer-title";
    h4.textContent = titleText;

    const line = document.createElement("div");
    line.className = "footer-underline";

    wrap.append(h4, line);

    const ul = document.createElement("ul");
    ul.className = "footer-links";

    links.forEach((text) => {
      const li = document.createElement("li");

      const a = document.createElement("a");
      a.href = "#";

      const i = document.createElement("i");
      i.className = icon;

      const span = document.createElement("span");
      span.textContent = text;

      a.append(i, span);
      li.appendChild(a);
      ul.appendChild(li);
    });

    section.append(wrap, ul);

    return section;
  }

  const about = createSection(
    "MELLOW VIỆT NAM",
    [
      "Về MELLOW",
      "Tuyển dụng",
      "Điều khoản MELLOW",
      "Chính sách bảo mật",
      "Flash Sale",
    ],
    "ri-arrow-right-s-line",
  );
  about.classList.add("footer-about");

  const contact = createSection(
    "LIÊN HỆ MELLOW",
    [
      "36 Đường 3/2, P.Xuân Khánh, Q.Ninh Kiều, Cần Thơ",
      "0363 636 369",
      "cskh@mellow.com.vn",
    ],
    "",
  );
  contact.classList.add("footer-contact");

  contact.querySelectorAll("i")[0].className = "ri-map-pin-fill";
  contact.querySelectorAll("i")[1].className = "ri-phone-fill";
  contact.querySelectorAll("i")[2].className = "ri-mail-line";

  content.append(mellow, about, contact);

  fragment.appendChild(content);

  /* ========= Bottom ========= */

  const bottom = document.createElement("div");
  bottom.className = "footer-bottom";

  const p = document.createElement("p");

  p.append(document.createTextNode("©2026 "));

  const img = document.createElement("img");
  img.src = "./assets/images/footer/logo_footer.png";
  img.alt = "logo";

  p.appendChild(img);

  p.append(document.createTextNode(" MELLOW. Made with by Group 7 CT188"));

  const bard = document.createElement("i");
  bard.className = "ri-bard-line";

  p.appendChild(bard);

  bottom.appendChild(p);

  fragment.appendChild(bottom);

  return fragment;
}

export default createFooter;
