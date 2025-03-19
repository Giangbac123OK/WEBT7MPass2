app.controller('homeController', function($scope, $http) {
    $scope.sanPhamMoi = [];

    function loadHinhAnh(idSPCT, callback) {
        fetch(`https://localhost:7196/api/Sanphamchitiets/GetImageById/${idSPCT}`)  // Thay API URL đúng
            .then(response => response.blob())  // Chuyển response thành Blob
            .then(blob => {
                let imgUrl = URL.createObjectURL(blob); // Tạo URL từ Blob
                console.log("Đã tải ảnh:", imgUrl);
                callback(imgUrl);
            })
            .catch(error => console.error("Lỗi tải ảnh:", error));
    }
    

    // Lấy danh sách sản phẩm
    $http.get("https://localhost:7196/api/Sanphams/GetALLSanPham")
        .then(function(response) {
            $scope.sanPhamMoi = response.data.map(sp => {
                sp.hinhAnh = "default-image.jpg"; // Ảnh mặc định
            
                if (sp.sanphamchitiets && sp.sanphamchitiets.length > 0) {
                    let spct = sp.sanphamchitiets[0]; 
                    loadHinhAnh(spct.id, function(imgUrl) {
                        sp.hinhAnh = imgUrl;
                        console.log("Đã tải ảnh:", sp.hinhAnh);
                        $scope.$apply(); // Cập nhật lại view
                    });
                }
            
                return sp;
            });
            console.log($scope.sanPhamMoi);
        })
        .catch(function(error) {
            console.error("Lỗi khi tải danh sách sản phẩm:", error);
            $scope.errorMessage = "Có lỗi xảy ra khi tải dữ liệu.";
        });
    
        $scope.getTotalSPCT = function (product) {
            return product.sanphamchitiets.reduce(function (total, spct) {
                return total + spct.soLuongBan;
            }, 0);
        };
        
});
