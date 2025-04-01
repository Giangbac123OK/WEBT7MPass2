// Thêm file này vào thư mục Controller của bạn
app.controller("SearchResultsController", ($scope, $http, $location, $timeout) => {
    // Khởi tạo biến
    $scope.searchTerm = $location.search().q || ""
    $scope.products = []
    $scope.filteredProducts = []
    $scope.loading = true
    $scope.searchPerformed = false
    $scope.showMobileFilter = false
  
    // Phân trang
    $scope.currentPage = 1
    $scope.itemsPerPage = 9
    $scope.totalPages = 1
  
    // Sắp xếp
    $scope.sortOption = "popularity"
  
    // Bộ lọc
    $scope.filters = {
      priceRange: "0-0",
      brands: {},
      sizes: {},
    }
  
    // Dữ liệu cho bộ lọc
    $scope.priceRanges = [
      { value: "0-1000000", label: "DƯỚI 1,000,000₫" },
      { value: "1000000-2000000", label: "1,000,000₫->2,000,000₫" },
      { value: "2000000-3000000", label: "2,000,000₫->3,000,000₫" },
      { value: "3000000-4000000", label: "3,000,000₫->4,000,000₫" },
      { value: "4000000-0", label: "TRÊN 4,000,000₫" },
    ]
  
    $scope.brands = ["NIKE", "ADIDAS", "PUMA", "CONVERSE", "VANS", "NEW BALANCE"]
    $scope.sizes = ["36", "37", "38", "39", "40", "41", "42", "43", "44", "45"]
  
    // Tìm kiếm khi trang được tải
    $scope.search = () => {
      if (!$scope.searchTerm) {
        $scope.loading = false
        return
      }
  
      $scope.loading = true
      $scope.searchPerformed = true
  
      // Trong môi trường thực tế, gọi API để lấy kết quả tìm kiếm
      // $http.get('https://localhost:7196/api/search/products?term=' + encodeURIComponent($scope.searchTerm))
      //     .then(function(response) {
      //         $scope.products = response.data;
      //         $scope.applyFilters();
      //         $scope.updatePagination();
      //     })
      //     .catch(function(error) {
      //         console.error('Lỗi khi tìm kiếm sản phẩm:', error);
      //         $scope.products = [];
      //         $scope.filteredProducts = [];
      //     })
      //     .finally(function() {
      //         $scope.loading = false;
      //     });
  
      // Dữ liệu mẫu cho kết quả tìm kiếm
      $timeout(() => {
        // Giả lập kết quả tìm kiếm
        var mockProducts = [
          {
            id: "1",
            name: "Giày Nike Air Force 1 Low White",
            brand: "NIKE",
            originalPrice: 2900000,
            salePrice: 2500000,
            discount: 14,
            image: "https://via.placeholder.com/300x300.png?text=Nike+Air+Force+1",
            rating: 4.8,
            soldCount: 1243,
            sizes: ["38", "39", "40", "41", "42"],
            inWishlist: false,
          },
          {
            id: "2",
            name: "Giày Adidas Superstar Classic",
            brand: "ADIDAS",
            originalPrice: 2200000,
            salePrice: 1800000,
            discount: 18,
            image: "https://via.placeholder.com/300x300.png?text=Adidas+Superstar",
            rating: 4.7,
            soldCount: 987,
            sizes: ["37", "38", "39", "40", "41", "42", "43"],
            inWishlist: false,
          },
          {
            id: "3",
            name: "Giày Converse Chuck Taylor All Star Classic",
            brand: "CONVERSE",
            originalPrice: 1500000,
            salePrice: 1350000,
            discount: 10,
            image: "https://via.placeholder.com/300x300.png?text=Converse+Chuck+Taylor",
            rating: 4.6,
            soldCount: 756,
            sizes: ["36", "37", "38", "39", "40", "41", "42", "43"],
            inWishlist: false,
          },
          {
            id: "4",
            name: "Giày Vans Old Skool Classic Black",
            brand: "VANS",
            originalPrice: 1800000,
            salePrice: 1600000,
            discount: 11,
            image: "https://via.placeholder.com/300x300.png?text=Vans+Old+Skool",
            rating: 4.5,
            soldCount: 654,
            sizes: ["36", "37", "38", "39", "40", "41", "42"],
            inWishlist: false,
          },
          {
            id: "5",
            name: "Giày Puma Suede Classic",
            brand: "PUMA",
            originalPrice: 1900000,
            salePrice: 1700000,
            discount: 11,
            image: "https://via.placeholder.com/300x300.png?text=Puma+Suede",
            rating: 4.4,
            soldCount: 543,
            sizes: ["38", "39", "40", "41", "42", "43"],
            inWishlist: false,
          },
          {
            id: "6",
            name: "Giày New Balance 574 Classic",
            brand: "NEW BALANCE",
            originalPrice: 2100000,
            salePrice: 1850000,
            discount: 12,
            image: "https://via.placeholder.com/300x300.png?text=New+Balance+574",
            rating: 4.6,
            soldCount: 432,
            sizes: ["39", "40", "41", "42", "43", "44"],
            inWishlist: false,
          },
        ]
  
        // Lọc sản phẩm theo từ khóa tìm kiếm
        $scope.products = mockProducts.filter(
          (product) =>
            product.name.toLowerCase().includes($scope.searchTerm.toLowerCase()) ||
            product.brand.toLowerCase().includes($scope.searchTerm.toLowerCase()),
        )
  
        $scope.applyFilters()
        $scope.updatePagination()
        $scope.loading = false
      }, 800) // Giả lập độ trễ mạng
    }
  
    // Hàm áp dụng bộ lọc
    $scope.applyFilters = () => {
      // Lọc sản phẩm theo các tiêu chí
      $scope.filteredProducts = $scope.products.filter((product) => {
        // Lọc theo giá
        if ($scope.filters.priceRange !== "0-0") {
          var [minPrice, maxPrice] = $scope.filters.priceRange.split("-").map(Number)
          if (minPrice > 0 && product.salePrice < minPrice) return false
          if (maxPrice > 0 && product.salePrice > maxPrice) return false
        }
  
        // Lọc theo thương hiệu
        var selectedBrands = Object.keys($scope.filters.brands).filter((brand) => $scope.filters.brands[brand])
  
        if (selectedBrands.length > 0 && !selectedBrands.includes(product.brand)) {
          return false
        }
  
        // Lọc theo size
        var selectedSizes = Object.keys($scope.filters.sizes).filter((size) => $scope.filters.sizes[size])
  
        if (selectedSizes.length > 0) {
          var hasSize = selectedSizes.some((size) => product.sizes.includes(size))
  
          if (!hasSize) return false
        }
  
        return true
      })
  
      // Sắp xếp sản phẩm
      $scope.sortProducts()
  
      // Cập nhật phân trang
      $scope.currentPage = 1
      $scope.updatePagination()
  
      // Đóng filter trên mobile
      if (window.innerWidth < 992) {
        $scope.showMobileFilter = false
      }
    }
  
    // Hàm sắp xếp sản phẩm
    $scope.sortProducts = () => {
      $scope.filteredProducts.sort((a, b) => {
        switch ($scope.sortOption) {
          case "priceAsc":
            return a.salePrice - b.salePrice
          case "priceDesc":
            return b.salePrice - a.salePrice
          case "newest":
            // Trong thực tế, sẽ sắp xếp theo ngày
            return b.id - a.id
          case "popularity":
          default:
            return b.soldCount - a.soldCount
        }
      })
  
      $scope.updatePagination()
    }
  
    // Hàm cập nhật phân trang
    $scope.updatePagination = () => {
      $scope.totalPages = Math.ceil($scope.filteredProducts.length / $scope.itemsPerPage)
  
      // Giới hạn sản phẩm hiển thị theo trang hiện tại
      var startIndex = ($scope.currentPage - 1) * $scope.itemsPerPage
      var endIndex = startIndex + $scope.itemsPerPage
  
      $scope.displayedProducts = $scope.filteredProducts.slice(startIndex, endIndex)
    }
  
    // Hàm chuyển trang
    $scope.changePage = (page) => {
      if (page < 1 || page > $scope.totalPages) return
  
      $scope.currentPage = page
      $scope.updatePagination()
  
      // Cuộn lên đầu danh sách sản phẩm
      window.scrollTo({
        top: document.querySelector(".product-listing").offsetTop - 100,
        behavior: "smooth",
      })
    }
  
    // Hàm tạo mảng số trang
    $scope.getPages = () => {
      var pages = []
      var startPage = Math.max(1, $scope.currentPage - 2)
      var endPage = Math.min($scope.totalPages, startPage + 4)
  
      for (var i = startPage; i <= endPage; i++) {
        pages.push(i)
      }
  
      return pages
    }
  
    // Hàm toggle filter trên mobile
    $scope.toggleMobileFilter = () => {
      $scope.showMobileFilter = !$scope.showMobileFilter
  
      // Khóa/mở khóa scroll của body
      document.body.style.overflow = $scope.showMobileFilter ? "hidden" : ""
    }
  
    // Hàm thêm vào giỏ hàng
    $scope.addToCart = (product) => {
      // Trong thực tế, gọi API để thêm sản phẩm vào giỏ hàng
      alert("Đã thêm " + product.name + " vào giỏ hàng!")
    }
  
    // Hàm xem chi tiết sản phẩm
    $scope.viewProductDetail = (product) => {
      // Trong thực tế, chuyển hướng đến trang chi tiết sản phẩm
      $location.path("/san-pham/" + product.id)
    }
  
    // Hàm toggle wishlist
    $scope.toggleWishlist = (product) => {
      product.inWishlist = !product.inWishlist
  
      // Trong thực tế, gọi API để thêm/xóa sản phẩm khỏi wishlist
      if (product.inWishlist) {
        alert("Đã thêm " + product.name + " vào danh sách yêu thích!")
      } else {
        alert("Đã xóa " + product.name + " khỏi danh sách yêu thích!")
      }
    }
  
    // Tìm kiếm khi trang được tải
    $scope.search()
  })
  
  