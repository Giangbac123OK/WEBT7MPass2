app.controller('trahangController', function ($http, $scope, $location, $routeParams) {
    $scope.idhd = $routeParams.id;
    console.log($scope.idhd);

    // Gọi API để lấy danh sách sản phẩm
    $http.get("https://localhost:7196/api/Trahangchitiets/ListSanPhamByIdhd/" + $scope.idhd)
        .then(function (response) {
            $scope.dataSp = response.data.map(sp => {
                return {
                    ...sp,
                    maxsoluong: sp.soluong || 0, // Lưu số lượng tối đa từ API
                    soluong: 1, // Gán số lượng mặc định là 1
                    thanhtien: sp.giasp || 0, // Tính thành tiền ban đầu
                    selected: false // Mặc định chưa chọn
                };
            });
            $scope.tinhTongTien();
        })
        .catch(function (error) {
            console.error(error);
        });

    $scope.increase = function (sp) {
        if (sp.soluong < sp.maxsoluong) {
            sp.soluong++;
            sp.thanhtien = sp.soluong * sp.giasp;
            $scope.tinhTongTien();
        }
    };
    
    $scope.decrease = function (sp) {
        if (sp.soluong > 1) {
            sp.soluong--;
            sp.thanhtien = sp.soluong * sp.giasp;
            $scope.tinhTongTien();
        }
    };
    
    // Hàm tính tổng tiền
    $scope.tinhTongTien = function () {
        let total = 0;
        $scope.dataSp.forEach(sp => {
            sp.thanhtien = (sp.soluong || 0) * (sp.giasp || 0);
            if (sp.selected) {
                total += sp.thanhtien;
            }
        });
        $scope.tongtien = total;
        $scope.updateSelectAll();
    };

    // Chọn hoặc bỏ chọn tất cả sản phẩm
    $scope.toggleAll = function () {
        $scope.dataSp.forEach(sp => {
            sp.selected = $scope.selectAll;
        });
        $scope.tinhTongTien();
    };

    // Cập nhật trạng thái "Chọn tất cả"
    $scope.updateSelectAll = function () {
        $scope.selectAll = $scope.dataSp && $scope.dataSp.length > 0 && $scope.dataSp.every(sp => sp.selected);
    };

    // Gọi API lấy địa chỉ khách hàng
    $http.get('https://localhost:7196/api/Diachi/khachhang/' + $scope.idhd)
        .then(function (response) {
            $scope.dataDiaChi = response.data;
        })
        .catch(function (error) {
            console.error(error);
        });
        const apiProvince = "https://online-gateway.ghn.vn/shiip/public-api/master-data/province";
        const apiDistrict = "https://online-gateway.ghn.vn/shiip/public-api/master-data/district";
        const apiWard = "https://online-gateway.ghn.vn/shiip/public-api/master-data/ward";
    
        const token = "7b4f1e5c-0700-11f0-94b6-be01e07a48b5"; // Thay bằng token API GHN của bạn
    
        $scope.provinces = [];
        $scope.districts = [];
        $scope.wards = [];
    
        // Gọi API lấy danh sách tỉnh/thành phố
        $http.get(apiProvince, { headers: { "Token": token } })
            .then(function (response) {
                $scope.provinces = response.data.data;
            })
            .catch(function (error) {
                console.error("Lỗi khi lấy danh sách tỉnh/thành phố:", error);
            });
    
        // Khi chọn tỉnh/thành, lấy danh sách quận/huyện
        $scope.getDistricts = function () {
            if (!$scope.selectedProvince) return;
            $http.get(apiDistrict, { 
                headers: { "Token": token }, 
                params: { province_id: $scope.selectedProvince } 
            })
            .then(function (response) {
                $scope.districts = response.data.data;
                $scope.wards = []; // Reset danh sách phường/xã
            })
            .catch(function (error) {
                console.error("Lỗi khi lấy danh sách quận/huyện:", error);
            });
        };
    
        // Khi chọn quận/huyện, lấy danh sách phường/xã
        $scope.getWards = function () {
            if (!$scope.selectedDistrict) return;
            $http.get(apiWard, { 
                headers: { "Token": token }, 
                params: { district_id: $scope.selectedDistrict } 
            })
            .then(function (response) {
                $scope.wards = response.data.data;
            })
            .catch(function (error) {
                console.error("Lỗi khi lấy danh sách phường/xã:", error);
            });
        };
});