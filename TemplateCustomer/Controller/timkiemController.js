app.controller('timkiemController', function ($scope, $routeParams, $http, $timeout) {
    // Decode the search parameter properly to handle Vietnamese characters
    $scope.searchKey = decodeURIComponent($routeParams.search || '');
    $scope.filteredResults = [];
    $scope.displayResults = [];
    $scope.errorMessage = '';
    $scope.isLoading = true;
    
    // Pagination settings
    $scope.currentPage = 1;
    $scope.pageSize = 9;
    $scope.totalPages = 0;
    $scope.sortOption = 'newest';
    
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
    
    // Image loading function
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
            console.log('Loaded brands:', $scope.dataThuonghieu);
        })
        .catch(function (error) {
            console.error('API Error loading brands:', error);
        });
  
    // Log the search term for debugging
    console.log('Searching for:', $scope.searchKey);
    
    // Fetch search results from API with proper encoding
    $http.get(`https://localhost:7196/api/Sanphams/search?name=${encodeURIComponent($scope.searchKey)}`)
        .then(function (response) {
            console.log('API Response:', response.data);
            
            if (response.data && response.data.length > 0) {
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
                        
                        // Log the product data to see the structure
                        console.log('Product data structure:', sp);
                        
                        return sp;
                    });
                    
                $scope.displayResults = [...$scope.filteredResults];
                console.log('Processed results:', $scope.displayResults);
            } else {
                console.log('No results found');
                $scope.filteredResults = [];
                $scope.displayResults = [];
            }
            
            $scope.isLoading = false;
            
            // Update total pages based on search results
            $scope.totalPages = Math.ceil($scope.displayResults.length / $scope.pageSize);
        })
        .catch(function (error) {
            $scope.errorMessage = 'Không thể tải dữ liệu từ server. Vui lòng thử lại!';
            console.error('API Error:', error);
            $scope.isLoading = false;
        });
  
    // Try a fallback search if no results are found
    $scope.tryFallbackSearch = function() {
        // If no results were found with the exact search, try a more flexible search
        if ($scope.displayResults.length === 0) {
            $http.get(`https://localhost:7196/api/Sanphams/GetALLSanPham`)
                .then(function(response) {
                    // Filter products that contain the search term in their name (case insensitive)
                    const searchTerm = $scope.searchKey.toLowerCase();
                    const matchingProducts = response.data.filter(product => 
                        product.tensp && product.tensp.toLowerCase().includes(searchTerm)
                    );
                    
                    if (matchingProducts.length > 0) {
                        $scope.filteredResults = matchingProducts
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
                                        $timeout(function() {
                                            $scope.$apply();
                                        }, 0);
                                    });
                                }
                                
                                // Log the product data to see the structure
                                console.log('Fallback product data structure:', sp);
                                
                                return sp;
                            });
                            
                        $scope.displayResults = [...$scope.filteredResults];
                        $scope.totalPages = Math.ceil($scope.displayResults.length / $scope.pageSize);
                    }
                })
                .catch(function(error) {
                    console.error('Fallback search error:', error);
                });
        }
    };
    
    // Call the fallback search after a short delay
    $timeout(function() {
        if ($scope.displayResults.length === 0 && !$scope.isLoading) {
            $scope.tryFallbackSearch();
        }
    }, 1000);
  
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
        // Handle price range radio buttons
        if ($scope.filters.priceRange) {
            switch($scope.filters.priceRange) {
                case 'under1m':
                    $scope.filters.minPrice = 0;
                    $scope.filters.maxPrice = 1000000;
                    break;
                case '1m-2m':
                    $scope.filters.minPrice = 1000000;
                    $scope.filters.maxPrice = 2000000;
                    break;
                case '2m-3m':
                    $scope.filters.minPrice = 2000000;
                    $scope.filters.maxPrice = 3000000;
                    break;
                case '3m-4m':
                    $scope.filters.minPrice = 3000000;
                    $scope.filters.maxPrice = 4000000;
                    break;
                case 'over4m':
                    $scope.filters.minPrice = 4000000;
                    $scope.filters.maxPrice = null;
                    break;
            }
        }
        
        // Get price range values
        let minPrice = $scope.filters.minPrice;
        let maxPrice = $scope.filters.maxPrice;
        
        // Get selected brands
        const selectedBrands = Object.keys($scope.filters.brands)
            .filter(key => $scope.filters.brands[key])
            .map(key => parseInt(key));
        
        console.log('Selected brands:', selectedBrands);
        
        // Get selected sizes
        const selectedSizes = Object.keys($scope.filters.sizes)
            .filter(key => $scope.filters.sizes[key]);
        
        console.log('Selected sizes:', selectedSizes);
  
        // Apply filters to the original search results
        $scope.displayResults = $scope.filteredResults.filter(item => {
            // Price filter
            const priceToCheck = item.giasale || item.giaban;
            const matchesPrice = (!minPrice && !maxPrice) || 
                                (priceToCheck >= (minPrice || 0) && 
                                 priceToCheck <= (maxPrice || Infinity));
            
            // Brand filter - check both idth and idThuongHieu fields
            // The API might be returning different field names
            const brandId = item.idth || item.idThuongHieu || item.idthuonghieu;
            console.log(`Product ${item.tensp} has brand ID:`, brandId);
            
            // If no brands are selected, or the product's brand is in the selected brands
            const matchesBrand = selectedBrands.length === 0 || 
                                (brandId && selectedBrands.includes(parseInt(brandId)));
            
            // Size filter - check if any product detail has the selected size
            const matchesSize = selectedSizes.length === 0 || 
                              (item.sanphamchitiets && item.sanphamchitiets.some(spct => 
                                selectedSizes.includes(spct.size)));
            
            const result = matchesPrice && matchesBrand && matchesSize;
            console.log(`Product ${item.tensp}: Price match: ${matchesPrice}, Brand match: ${matchesBrand}, Size match: ${matchesSize}, Final: ${result}`);
            
            return result;
        });
        
        console.log('Filtered results:', $scope.displayResults);
        
        // Reset to first page after filtering
        $scope.currentPage = 1;
        $scope.totalPages = Math.ceil($scope.displayResults.length / $scope.pageSize);
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
        $scope.currentPage = 1;
        $scope.totalPages = Math.ceil($scope.displayResults.length / $scope.pageSize);
    };
  
    // Get products for current page
    $scope.getPagedProducts = function () {
        let start = ($scope.currentPage - 1) * $scope.pageSize;
        let end = start + $scope.pageSize;
        return $scope.displayResults.slice(start, end);
    };
  
    // Pagination functions
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
  
    $scope.goToPage = function (page) {
        if (page >= 1 && page <= $scope.totalPages) {
            $scope.currentPage = page;
        }
    };
  
    // Sort search results
    $scope.sortProducts = function() {
        switch ($scope.sortOption) {
            case 'newest':
                $scope.displayResults.sort((a, b) => new Date(b.ngayThemSanPham) - new Date(a.ngayThemSanPham));
                break;
            case 'oldest':
                $scope.displayResults.sort((a, b) => new Date(a.ngayThemSanPham) - new Date(b.ngayThemSanPham));
                break;
            case 'lowToHigh':
                $scope.displayResults.sort((a, b) => (a.giasale || a.giaban) - (b.giasale || b.giaban));
                break;
            case 'highToLow':
                $scope.displayResults.sort((a, b) => (b.giasale || b.giaban) - (a.giasale || a.giaban));
                break;
            case 'bestseller':
                $scope.displayResults.sort((a, b) => $scope.getTotalSPCT(b) - $scope.getTotalSPCT(a));
                break;
        }
        // Reset to first page after sorting
        $scope.currentPage = 1;
    };
  });