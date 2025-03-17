app.controller('Sanpham', function () {
  document.addEventListener("DOMContentLoaded", () => {
    // Hover effect for desktop ok
    if (window.innerWidth > 992) {
      const dropdownToggle = document.querySelector(".has-megamenu .dropdown-toggle")
      const dropdownMenu = document.querySelector(".has-megamenu .dropdown-menu")

      dropdownToggle.addEventListener("mouseenter", () => {
        dropdownMenu.classList.add("show")
      })

      document.querySelector(".has-megamenu").addEventListener("mouseleave", () => {
        dropdownMenu.classList.remove("show")
      })
    }

    // Add to favorites functionality
    const favoriteButtons = document.querySelectorAll(".btn-outline-danger")
    favoriteButtons.forEach((button) => {
      button.addEventListener("click", function () {
        const icon = this.querySelector("i")
        if (icon.classList.contains("bi-heart")) {
          icon.classList.remove("bi-heart")
          icon.classList.add("bi-heart-fill")
          this.classList.remove("btn-outline-danger")
          this.classList.add("btn-danger")
        } else {
          icon.classList.remove("bi-heart-fill")
          icon.classList.add("bi-heart")
          this.classList.remove("btn-danger")
          this.classList.add("btn-outline-danger")
        }
      })
    })
  })

  document.addEventListener("DOMContentLoaded", () => {
    // Hover effect for desktop dropdown
    if (window.innerWidth > 992) {
      const dropdownToggle = document.querySelector(".dropdown-toggle")
      const dropdownMenu = document.querySelector(".dropdown-menu")

      dropdownToggle.addEventListener("mouseenter", () => {
        dropdownMenu.classList.add("show")
      })

      document.querySelector(".dropdown").addEventListener("mouseleave", () => {
        dropdownMenu.classList.remove("show")
      })
    }

    // Add to favorites functionality
    const favoriteButtons = document.querySelectorAll(".btn-outline-danger")
    favoriteButtons.forEach((button) => {
      button.addEventListener("click", function () {
        const icon = this.querySelector("i")
        if (icon.classList.contains("bi-heart")) {
          icon.classList.remove("bi-heart")
          icon.classList.add("bi-heart-fill")
          this.classList.remove("btn-outline-danger")
          this.classList.add("btn-danger")
        } else {
          icon.classList.remove("bi-heart-fill")
          icon.classList.add("bi-heart")
          this.classList.remove("btn-danger")
          this.classList.add("btn-outline-danger")
        }
      })
    })

    // Filter functionality
    const filterButton = document.querySelector(".filter-sidebar .btn-primary")
    filterButton.addEventListener("click", () => {
      // Collect filter values
      const priceRange = document.querySelector('input[name="priceRange"]:checked').id
      const brands = Array.from(document.querySelectorAll(".filter-section:nth-child(2) input:checked")).map((input) =>
        input.nextElementSibling.textContent.trim(),
      )
      const sizes = Array.from(document.querySelectorAll(".filter-section:nth-child(3) input:checked")).map((input) =>
        input.nextElementSibling.textContent.trim(),
      )

      // Log filter values (in a real app, you would use these to filter products)
      console.log("Price Range:", priceRange)
      console.log("Brands:", brands)
      console.log("Sizes:", sizes)

      // Show filter applied notification
      alert("Bộ lọc đã được áp dụng!")
    })

    // Quick view functionality
    const quickViewButtons = document.querySelectorAll(".action-btn:nth-child(2)")
    quickViewButtons.forEach((button) => {
      button.addEventListener("click", function () {
        const productCard = this.closest(".product-card")
        const productName = productCard.querySelector(".card-title").textContent
        const productPrice = productCard.querySelector(".text-danger").textContent

        alert(`Xem nhanh: ${productName}\nGiá: ${productPrice}`)
      })
    })

    // Add to cart functionality
    const addToCartButtons = document.querySelectorAll(".action-btn:nth-child(1)")
    addToCartButtons.forEach((button) => {
      button.addEventListener("click", function () {
        const productCard = this.closest(".product-card")
        const productName = productCard.querySelector(".card-title").textContent

        alert(`Đã thêm ${productName} vào giỏ hàng!`)

        // Update cart badge count
        const cartBadge = document.querySelector(".cart-badge")
        cartBadge.textContent = Number.parseInt(cartBadge.textContent) + 1
      })
    })
  })
});
