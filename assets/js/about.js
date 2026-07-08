//=============================================================
//                       TÁC GIẢ
//    Hồ Cao Tiến
//    B2405532
//=============================================================

// ========================================
// ABOUT.JS - Tương tác trang giới thiệu
// ========================================

document.addEventListener("DOMContentLoaded", function () {
  // ---------- HIỆU ỨNG FADE-IN KHI CUỘN ----------
  const revealEls = document.querySelectorAll(
    ".fact-card, .value-card, .member-list li, .story-grid, .logo-feature",
  );

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target); // Chỉ chạy 1 lần
        }
      });
    },
    { threshold: 0.12 },
  );

  revealEls.forEach((el, i) => {
    // Thêm delay nhỏ để các card xuất hiện lần lượt
    el.style.transitionDelay = `${i * 60}ms`;
    observer.observe(el);
  });
});
