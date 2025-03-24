app.controller('SanPhamSaleController', function ($scope, $http) {
    $scope.sanPhamSale = [];
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
    $http.get("https://localhost:7196/api/Sanphams/GetALLSanPhamGiamGia")
        .then(function (response) {
            $scope.sanPhamSale = response.data.map(sp => {
                sp.hinhAnh = "default-image.jpg"; // Ảnh mặc định
  
                if (sp.sanphamchitiets && sp.sanphamchitiets.length > 0) {
                    let spct = sp.sanphamchitiets[0];
                    loadHinhAnh(spct.id, function (imgUrl) {
                        sp.hinhAnh = imgUrl;
                        $scope.$apply(); // Cập nhật lại view
                    });
                }
  
                return sp;
            });
             console.log($scope.sanPhamSale);
             
            // Cập nhật tổng số trang
            $scope.totalPages = Math.ceil($scope.sanPhamSale.length / $scope.pageSize);
        })
        .catch(function (error) {
            console.error("Lỗi khi tải danh sách sản phẩm:", error);
            $scope.errorMessage = "Có lỗi xảy ra khi tải dữ liệu.";
        });
  
    // Hàm sắp xếp sản phẩm
    $scope.sortProducts = function() {
      switch ($scope.sortOption) {
          case 'newest': // Sắp xếp mới nhất
              $scope.sanPhamSale.sort((a, b) => new Date(b.ngayThemSanPham) - new Date(a.ngayThemSanPham));
              break;
          case 'oldest': // Sắp xếp cũ nhất
              $scope.sanPhamSale.sort((a, b) => new Date(a.ngayThemSanPham) - new Date(b.ngayThemSanPham));
              break;
          case 'lowToHigh': // Giá từ thấp đến cao
              $scope.sanPhamSale.sort((a, b) => a.giasale - b.giasale);
              break;
          case 'highToLow': // Giá từ cao đến thấp
              $scope.sanPhamSale.sort((a, b) => b.giasale - a.giasale);
              break;
          case 'bestseller': // Bán chạy nhất
              $scope.sanPhamSale.sort((a, b) => $scope.getTotalSPCT(b) - $scope.getTotalSPCT(a));
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
    // Lấy danh sách sản phẩm cho trang hiện tại
    $scope.getPagedProducts1 = function () {
        let start = ($scope.currentPage - 1) * $scope.pageSize;
        let end = start + $scope.pageSize;
        return $scope.sanPhamSale.slice(start, end);
    };
  
    // Chuyển sang trang trước
    $scope.previousPage1 = function () {
        if ($scope.currentPage > 1) {
            $scope.currentPage--;
        }
    };
  
    // Chuyển sang trang tiếp theo
    $scope.nextPage1 = function () {
        if ($scope.currentPage < $scope.totalPages) {
            $scope.currentPage++;
        }
    };
  
    // Chuyển tới trang cụ thể
    $scope.goToPage1 = function (page) {
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
