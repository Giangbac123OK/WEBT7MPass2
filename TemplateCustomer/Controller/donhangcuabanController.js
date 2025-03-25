app.controller('donhangcuabanController', function($scope, $http) {
    // select hóa đơn theo mã khách hàng
    
    const userInfo = JSON.parse(localStorage.getItem('userInfo'));
    console.log(userInfo);
    let idkh = userInfo.id;

    // Hàm gọi API lấy dữ liệu hóa đơn
    $scope.loadHoaDon = function () {
        let api = "https://localhost:7196/api/Hoadons/hoa-don-theo-ma-kh-"+idkh;
        if ($scope.searchText && $scope.searchText.trim() !== "") {
            api += `?search=${encodeURIComponent($scope.searchText)}`;
        }

        $http.get(api)
            .then(function (response) {
                $scope.dataHoaDon = response.data;
                console.log("Dữ liệu hóa đơn:", $scope.dataHoaDon);
            })
            .catch(function (error) {
                console.error("Lỗi khi lấy dữ liệu:", error);
            });
        if($scope.dataHoaDon==null){
            return $scope.thongbaotimkiem = "Không tìm thấy mã hóa đơn "+$scope.searchText
        }
    };

    // Theo dõi sự thay đổi của searchText
    $scope.$watch("searchText", function (newValue, oldValue) {
        if (newValue !== oldValue) {
            $scope.loadHoaDon();
        }
    });

    // Gọi API ngay khi trang được load
    $scope.loadHoaDon();
    //select hóa đơn chi tiết theo mã hóa đơn
    
    $http.get('https://localhost:7196/api/Hoadonchitiets')
        .then(function(response){
            $scope.dataHoaDonCT = response.data
            console.log($scope.dataHoaDonCT)
        })
        .catch(function(error){
            console.error(error)
        })

    $http.get('https://localhost:7196/api/Trahangs')
        .then(function(response){
            $scope.dataTraHang = response.data
            console.log($scope.dataTraHang)
        })
        .catch(function(error){
            console.error(error)
        })
    
    
    $scope.chitietdh = function(id) {
        $scope.idhd = id;
        $("#chitietModal").modal("show");
    };
    
    $http.get("https://localhost:7196/api/Sanphamchitiets")
        .then(function (response) {
            $scope.sanphamct = response.data;
            console.log("sanphamct:", $scope.sanphamct);
        })
        .catch(function (error) {
            console.error("Lỗi khi lấy dữ liệu:", error);
        });
    $http.get("https://localhost:7196/api/Sanphams")
        .then(function (response) {
            $scope.sanphamList = response.data;
            console.log("sanpham:", $scope.sanphamList);
        })
        .catch(function (error) {
            console.error("Lỗi khi lấy dữ liệu:", error);
        });

    $http.get("https://localhost:7196/api/Thuonghieu")
        .then(function (response) {
            $scope.ThuonghieuList = response.data;
            console.log("Thuonghieu:", $scope.ThuonghieuList);
        })
        .catch(function (error) {
            console.error("Lỗi khi lấy dữ liệu:", error);
        });
    $scope.SelecttenSp = function(id) {
        if (!$scope.sanphamList || $scope.sanphamList.length === 0) {
                return "Đang tải...";
        }
        
        let sanpham = $scope.sanphamList.find(x => x.id == id);
        return sanpham ? sanpham.tenSanpham : "Không tìm thấy sản phẩm";
    };
    $scope.SelectTenTH = function(id) {
        if (!$scope.sanphamList || $scope.sanphamList.length === 0 || 
            !$scope.ThuonghieuList || $scope.ThuonghieuList.length === 0) {
            return "Đang tải...";
        }
    
        let sanpham = $scope.sanphamList.find(x => x.id == id);
        if (!sanpham) {
            return "Không tìm thấy sản phẩm";
        }
    
        let thuonghieu = $scope.ThuonghieuList.find(x => x.id == sanpham.idth);
        return thuonghieu ? thuonghieu.tenthuonghieu : "Không tìm thấy thương hiệu";
    };
    $http.get("https://localhost:7196/api/Phuongthucthanhtoans/")
            .then(function (response) {
                $scope.ListPttt = response.data;
                    console.log("Phương thức thanh toán:", $scope.ListPttt);
            })
            .catch(function (error) {
                console.error("Lỗi khi lấy dữ liệu:", error);
                $scope.ListPttt = "Lỗi tải dữ liệu";
            });
            //aaaaaaffffffffff
});

