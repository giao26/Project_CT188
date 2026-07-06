// ========================================
// ABOUT.JS - Tương tác trang giới thiệu
// ========================================

document.addEventListener("DOMContentLoaded", function () {
  // ---------- HIỆU ỨNG KHI CUỘN (Scroll Animation) ----------
  const cards = document.querySelectorAll(
    ".mission-card, .stat-item, .logo-wrapper, .story-grid",
  );

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.style.opacity = "1";
          entry.target.style.transform = "translateY(0)";
        }
      });
    },
    {
      threshold: 0.1,
    },
  );

  cards.forEach((card) => {
    card.style.opacity = "0";
    card.style.transform = "translateY(40px)";
    card.style.transition = "all 0.7s ease";
    observer.observe(card);
  });

  // ---------- ĐẾM SỐ (Count Animation) ----------
  const numbers = document.querySelectorAll(".stat-number");

  numbers.forEach((num, index) => {
    const originalText = num.textContent;
    const match = originalText.match(/\d+/);
    if (!match) return;

    const target = parseInt(match[0]);
    const suffix = originalText.replace(target, "");
    let current = 0;
    const increment = Math.ceil(target / 50);

    setTimeout(() => {
      const counter = setInterval(() => {
        current += increment;
        if (current >= target) {
          current = target;
          clearInterval(counter);
        }
        num.textContent = current + suffix;
      }, 40);
    }, 300 * index);
  });

  // ---------- HIỆU ỨNG CLICK VÀO LOGO ----------
  const logoImage = document.querySelector(".logo-image img");
  if (logoImage) {
    logoImage.addEventListener("click", function () {
      alert(
        "🎉 Chào mừng bạn đến với nhóm của chúng tôi!\n\n5 thành viên - 1 mục tiêu chung! 💪",
      );
    });
  }

  // ---------- HIỆU ỨNG CLICK VÀO TAG ----------
  const tags = document.querySelectorAll(".tag");
  tags.forEach((tag) => {
    tag.addEventListener("click", function () {
      const tagText = this.textContent;
      alert(
        `✨ Bạn vừa chọn: ${tagText}\n\nĐây là một trong những giá trị cốt lõi của nhóm chúng tôi!`,
      );
    });
  });
});
