app.controller('timkiemController', function ($scope, $routeParams, $http, $timeout) {
  $scope.searchKey = $routeParams.search || '';
  $scope.filteredResults = [];
  $scope.displayResults = [];
  $scope.errorMessage = '';
  $scope.isLoading = true;
  
  // Initialize filters
  $scope.filters = {
      priceRange: null,
      minPrice: null,
      maxPrice: null,
      brands: {},
      sizes: {}
  };
  
  // Available sizes for filter
  $scope.availableSizes = ['37', '37.5', '38', '38.5', '39', '40', '41', '42', 'S', 'M', 'L', 'XL'];
  
  // Image loading function - similar to the one in SanphamController
  function loadHinhAnh(idSPCT, callback) {
      fetch(`https://localhost:7196/api/Sanphamchitiets/GetImageById/${idSPCT}`)
          .then(response => {
              if (!response.ok) {
                  throw new Error('Network response was not ok');
              }
              return response.blob();
          })
          .then(blob => {
              let imgUrl = URL.createObjectURL(blob);
              callback(imgUrl);
          })
          .catch(error => {
              console.error("Lỗi tải ảnh:", error);
              callback('assets/images/default-product.jpg'); // Fallback image
          });
  }

  // Fetch brand data
  $http.get('https://localhost:7196/api/Thuonghieu')
      .then(function (response) {
          $scope.dataThuonghieu = response.data;
      })
      .catch(function (error) {
          console.error('API Error:', error);
      });

  // Fetch search results from API - fixed string template syntax
  $http.get(`https://localhost:7196/api/Sanphams/search?name=${encodeURIComponent($scope.searchKey)}`)
      .then(function (response) {
          $scope.filteredResults = response.data
              .filter(sp => sp.sanphamchitiets && sp.sanphamchitiets.length > 0)
              .map(sp => {
                  // Set default image
                  sp.hinhAnh = "assets/images/default-product.jpg";
                  
                  // Calculate total sales for the product
                  sp.soLuongBan = sp.sanphamchitiets.reduce(function(total, spct) {
                      return total + (spct.soLuongBan || 0);
                  }, 0);
                  
                  // Load image from first product detail
                  if (sp.sanphamchitiets && sp.sanphamchitiets.length > 0) {
                      let spct = sp.sanphamchitiets[0];
                      loadHinhAnh(spct.id, function(imgUrl) {
                          sp.hinhAnh = imgUrl;
                          // Use $timeout to safely apply changes outside of Angular's digest cycle
                          $timeout(function() {
                              $scope.$apply();
                          }, 0);
                      });
                  }
                  
                  return sp;
              });
              
          $scope.displayResults = [...$scope.filteredResults];
          $scope.isLoading = false;
          console.log('Search results:', $scope.filteredResults);
      })
      .catch(function (error) {
          $scope.errorMessage = 'Không thể tải dữ liệu từ server. Vui lòng thử lại!';
          console.error('API Error:', error);
          $scope.isLoading = false;
      });

  // Generate star ratings
  $scope.generateStars = function (rating) {
      rating = parseFloat(rating) || 0;
      const fullStars = Math.floor(rating);
      const halfStar = rating % 1 >= 0.5;
      const emptyStars = 5 - Math.ceil(rating);

      let stars = [];
      for (let i = 0; i < fullStars; i++) stars.push('full');
      if (halfStar) stars.push('half');
      for (let i = 0; i < emptyStars; i++) stars.push('empty');
      return stars;
  };
  
  // Get total sold items for a product
  $scope.getTotalSPCT = function(product) {
      if (!product || !product.sanphamchitiets) return 0;
      return product.sanphamchitiets.reduce(function(total, spct) {
          return total + (spct.soLuongBan || 0);
      }, 0);
  };

  // Apply all filters on button click
  $scope.applyAllFilters = function () {
      // Get price range values
      let minPrice = $scope.filters.minPrice;
      let maxPrice = $scope.filters.maxPrice;
      
      // Get selected brands
      const selectedBrands = Object.keys($scope.filters.brands)
          .filter(key => $scope.filters.brands[key])
          .map(key => parseInt(key));
      
      // Get selected sizes
      const selectedSizes = Object.keys($scope.filters.sizes)
          .filter(key => $scope.filters.sizes[key]);

      // Apply filters
      $scope.displayResults = $scope.filteredResults.filter(item => {
          // Price filter
          const priceToCheck = item.giasale || item.giaban;
          const matchesPrice = (!minPrice && !maxPrice) || 
                              (priceToCheck >= (minPrice || 0) && 
                               priceToCheck <= (maxPrice || Infinity));
          
          // Brand filter
          const matchesBrand = selectedBrands.length === 0 || 
                              selectedBrands.includes(item.idth);
          
          // Size filter - check if any product detail has the selected size
          const matchesSize = selectedSizes.length === 0 || 
                            item.sanphamchitiets.some(spct => 
                              selectedSizes.includes(spct.size));
          
          return matchesPrice && matchesBrand && matchesSize;
      });
  };

  // Reset Filters
  $scope.resetFilters = function () {
      $scope.filters = {
          priceRange: null,
          minPrice: null,
          maxPrice: null,
          brands: {},
          sizes: {}
      };
      $scope.displayResults = [...$scope.filteredResults];
  };
// Sản phẩm

  $scope.sanPham = [];
  $scope.currentPage = 1; // Trang hiện tại
  $scope.pageSize = 9; // Số sản phẩm trên mỗi trang
  $scope.totalPages = 0; // Tổng số trang
  $scope.sortOption = 'newest'; // Tùy chọn sắp xếp mặc định

  function loadHinhAnh(idSPCT, callback) {
      fetch(`https://localhost:7196/api/Sanphamchitiets/GetImageById/${idSPCT}`)
          .then(response => response.blob())
          .then(blob => {
              let imgUrl = URL.createObjectURL(blob);
              callback(imgUrl);
          })
          .catch(error => console.error("Lỗi tải ảnh:", error));
  }

  // Lấy danh sách sản phẩm
  $http.get("https://localhost:7196/api/Sanphams/GetALLSanPham")
      .then(function (response) {
        $scope.sanPham = response.data
        .filter(sp => sp.sanphamchitiets && sp.sanphamchitiets.length > 0)
        .map(sp => {
            sp.hinhAnh = "default-image.jpg"; // Ảnh mặc định

            // Lấy hình ảnh từ sản phẩm chi tiết đầu tiên
            let spct = sp.sanphamchitiets[0];
            loadHinhAnh(spct.id, function (imgUrl) {
                sp.hinhAnh = imgUrl;
                $scope.$apply(); // Cập nhật lại view
            });

            return sp;
        });

    console.log($scope.sanPham);

    // Cập nhật tổng số trang
    $scope.totalPages = Math.ceil($scope.sanPham.length / $scope.pageSize);
      })
      .catch(function (error) {
          console.error("Lỗi khi tải danh sách sản phẩm:", error);
          $scope.errorMessage = "Có lỗi xảy ra khi tải dữ liệu.";
      });

  // Hàm sắp xếp sản phẩm
  $scope.sortProducts = function() {
    switch ($scope.sortOption) {
        case 'newest': // Sắp xếp mới nhất
            $scope.sanPham.sort((a, b) => new Date(b.ngayThemSanPham) - new Date(a.ngayThemSanPham));
            break;
        case 'oldest': // Sắp xếp cũ nhất
            $scope.sanPham.sort((a, b) => new Date(a.ngayThemSanPham) - new Date(b.ngayThemSanPham));
            break;
        case 'lowToHigh': // Giá từ thấp đến cao
            $scope.sanPham.sort((a, b) => a.giasale - b.giasale);
            break;
        case 'highToLow': // Giá từ cao đến thấp
            $scope.sanPham.sort((a, b) => b.giasale - a.giasale);
            break;
        case 'bestseller': 
            $scope.sanPham.sort((a, b) => $scope.getTotalSPCT(b) - $scope.getTotalSPCT(a));
            break;
        default:
            break;
    }
};

  $scope.getTotalSPCT = function(product) {
    return product.sanphamchitiets.reduce(function(total, spct) {
        return total + spct.soLuongBan;
    }, 0);
};

  $scope.getPagedProducts = function () {
      let start = ($scope.currentPage - 1) * $scope.pageSize;
      let end = start + $scope.pageSize;
      return $scope.sanPham.slice(start, end);
  };


  $scope.previousPage = function () {
      if ($scope.currentPage > 1) {
          $scope.currentPage--;
      }
  };


  $scope.nextPage = function () {
      if ($scope.currentPage < $scope.totalPages) {
          $scope.currentPage++;
      }
  };

  // Chuyển tới trang cụ thể
  $scope.goToPage = function (page) {
      if (page >= 1 && page <= $scope.totalPages) {
          $scope.currentPage = page;
      }
  };
  $scope.generateStars = function (rating) {
    const fullStars = Math.floor(rating); // Số sao đầy
    const halfStar = rating % 1 >= 0.5; // Có nửa sao hay không
    const emptyStars = 5 - Math.ceil(rating); // Số sao trống

    let stars = [];
    for (let i = 0; i < fullStars; i++) stars.push('full'); // Sao đầy
    if (halfStar) stars.push('half'); // Sao nửa
    for (let i = 0; i < emptyStars; i++) stars.push('empty'); // Sao trống
    return stars;
};
});