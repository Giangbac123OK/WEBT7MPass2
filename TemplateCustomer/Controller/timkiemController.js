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
});