app.controller('timkiemController', function ($scope, $routeParams, $http) {
  $scope.searchKey = $routeParams.search || '';
  $scope.filteredResults = [];
  $scope.displayResults = [];
  $scope.errorMessage = '';
  
  // Bộ lọc
  $scope.filters = {
    priceRange: 'all',
    minPrice: null,
    maxPrice: null,
    brands: {},
    sizes: {}
  };
  
  // Khoảng giá
  $scope.priceRanges = [
    { value: 'all', label: 'Tất cả' },
    { value: 'under1m', label: 'DƯỚI 1,000,000Đ' },
    { value: '1m-2m', label: '1,000,000Đ -> 2,000,000Đ' },
    { value: '2m-3m', label: '2,000,000Đ -> 3,000,000Đ' },
    { value: '3m-4m', label: '3,000,000Đ -> 4,000,000Đ' },
    { value: 'above4m', label: 'TRÊN 4,000,000Đ' }
  ];
  
  // Kích thước có sẵn
  $scope.availableSizes = ['37.5', '38', '38.5', '39', '40', '41', '42', '43', 'X', 'XL'];
  
  // Fetch brand data
  $http.get('https://localhost:7196/api/Thuonghieu')
    .then(function (response) {
      $scope.dataThuonghieu = response.data;
    })
    .catch(function (error) {
      console.error('API Error:', error);
    });
  
  // Fetch search results from API
  $http.get(`https://localhost:7196/api/Sanphams/search?name=${encodeURIComponent($scope.searchKey)}`)
    .then(function (response) {
      $scope.filteredResults = response.data;
      $scope.displayResults = [...$scope.filteredResults];
      console.log($scope.filteredResults);
    })
    .catch(function (error) {
      $scope.errorMessage = 'Không thể tải dữ liệu từ server. Vui lòng thử lại!';
      console.error('API Error:', error);
    });
  
  // Apply all filters on button click
  $scope.applyAllFilters = function() {
    let filtered = [...$scope.filteredResults];
    
    // Lọc theo khoảng giá
    if ($scope.filters.priceRange !== 'all') {
      switch ($scope.filters.priceRange) {
        case 'under1m':
          filtered = filtered.filter(item => item.giasale < 1000000);
          break;
        case '1m-2m':
          filtered = filtered.filter(item => item.giasale >= 1000000 && item.giasale <= 2000000);
          break;
        case '2m-3m':
          filtered = filtered.filter(item => item.giasale > 2000000 && item.giasale <= 3000000);
          break;
        case '3m-4m':
          filtered = filtered.filter(item => item.giasale > 3000000 && item.giasale <= 4000000);
          break;
        case 'above4m':
          filtered = filtered.filter(item => item.giasale > 4000000);
          break;
      }
    }
    
    // Lọc theo giá tùy chỉnh
    if ($scope.filters.minPrice) {
      filtered = filtered.filter(item => item.giasale >= $scope.filters.minPrice);
    }
    
    if ($scope.filters.maxPrice) {
      filtered = filtered.filter(item => item.giasale <= $scope.filters.maxPrice);
    }
    
    // Lọc theo thương hiệu
    const selectedBrands = Object.keys($scope.filters.brands).filter(key => $scope.filters.brands[key]);
    if (selectedBrands.length > 0) {
      filtered = filtered.filter(item => selectedBrands.includes(String(item.idth)));
    }
    
    // Lọc theo kích thước (giả định có trường size)
    const selectedSizes = Object.keys($scope.filters.sizes).filter(key => $scope.filters.sizes[key]);
    if (selectedSizes.length > 0) {
      // Trong thực tế, bạn cần điều chỉnh logic này dựa trên cấu trúc dữ liệu của bạn
      // Ví dụ: filtered = filtered.filter(item => item.sizes.some(s => selectedSizes.includes(s)));
    }
    
    $scope.displayResults = filtered;
  };
  
  // Reset Filters
  $scope.resetFilters = function() {
    $scope.filters = {
      priceRange: 'all',
      minPrice: null,
      maxPrice: null,
      brands: {},
      sizes: {}
    };
    $scope.displayResults = [...$scope.filteredResults];
  };
  
  // Tạo sao đánh giá
  $scope.generateStars = function(rating) {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    
    let stars = [];
    for (let i = 0; i < fullStars; i++) stars.push('full');
    if (hasHalfStar) stars.push('half');
    for (let i = 0; i < emptyStars; i++) stars.push('empty');
    
    return stars;
  };
});