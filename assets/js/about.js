// ========================================
// ABOUT.JS - Tương tác trang giới thiệu
// ========================================

document.addEventListener("DOMContentLoaded", function () {
  // ---------- HIỆU ỨNG KHI CUỘN (Scroll Animation) ----------
  const cards = document.querySelectorAll(
    ".mission-card, .stat-item, .logo-wrapper, .story-grid",
  );

  // Tạo một IntersectionObserver để theo dõi khi các phần tử cuộn vào vùng nhìn thấy của màn hình (viewport)
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          // Khi phần tử xuất hiện, thêm hiệu ứng rõ dần (opacity: 1) và trượt về vị trí ban đầu
          entry.target.style.opacity = "1";
          entry.target.style.transform = "translateY(0)";
        }
      });
    },
    {
      // Ngưỡng 0.1 nghĩa là hàm callback sẽ chạy khi 10% diện tích phần tử đã xuất hiện trên màn hình
      threshold: 0.1,
    },
  );

  // Thiết lập trạng thái ban đầu cho các phần tử (mờ đi và thụt xuống dưới) trước khi observer bắt đầu theo dõi
  cards.forEach((card) => {
    card.style.opacity = "0";
    card.style.transform = "translateY(40px)";
    card.style.transition = "all 0.7s ease";
    observer.observe(card); // Bắt đầu theo dõi từng phần tử
  });

  // ---------- ĐẾM SỐ (Count Animation) ----------
  const numbers = document.querySelectorAll(".stat-number");

  numbers.forEach((num, index) => {
    const originalText = num.textContent;
    // Tìm các chữ số trong chuỗi văn bản ban đầu (ví dụ: "100+" sẽ lấy ra "100")
    const match = originalText.match(/\d+/);
    if (!match) return;

    const target = parseInt(match[0]); // Đích đến của bộ đếm
    const suffix = originalText.replace(target, ""); // Phần hậu tố (ví dụ: "+", "%", ...)
    let current = 0;
    // Bước nhảy đếm số: chia mục tiêu thành 50 phần để có hiệu ứng mượt mà
    const increment = Math.ceil(target / 50);

    // Dùng setTimeout để tạo độ trễ giữa các con số khác nhau (hiệu ứng đếm lần lượt)
    setTimeout(() => {
      const counter = setInterval(() => {
        current += increment;
        // Đảm bảo không đếm vượt quá số mục tiêu
        if (current >= target) {
          current = target;
          clearInterval(counter); // Dừng bộ đếm khi đạt mục tiêu
        }
        num.textContent = current + suffix;
      }, 40); // Cứ 40ms sẽ tăng số một lần
    }, 300 * index); // Mỗi con số sẽ bắt đầu đếm chậm hơn con số trước 300ms
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
