app.controller('trahangController', function ($http, $scope, $location, $routeParams) {
    $scope.idhd = $routeParams.id;
    console.log($scope.idhd);

    // Gọi API để lấy danh sách sản phẩm
    $http.get("https://localhost:7196/api/Trahangchitiets/ListSanPhamByIdhd/" + $scope.idhd)
        .then(function (response) {
            $scope.dataSp = response.data.map(sp => {
                sp.maxsoluong = sp.soluong; // Số lượng tối đa từ API
                return sp;
            });
            $scope.tinhTongTien(); // Tính tổng tiền ban đầu
            console.log($scope.dataSp);
        })
        .catch(function (error) {
            console.error(error);
        });

    // Hàm tính thành tiền
    $scope.tinhThanhTien = function () {
        $scope.thanhtien = $scope.dataSp.reduce((total, sp) => total + (sp.soluong * sp.giasp), 0);
    };

    // Tăng số lượng
    $scope.increase = function (sp) {
        if (sp.soluong < sp.maxsoluong) {
            sp.soluong++;
            $scope.tinhTongTien();
        }
    };

    // Giảm số lượng
    $scope.decrease = function (sp) {
        if (sp.soluong > 1) {
            sp.soluong--;
            $scope.tinhTongTien();
        }
    };
    $scope.tinhTongTien = function () {
        $scope.tongtien = $scope.dataSp
            .filter(sp => sp.selected) // Lọc ra các sản phẩm đã chọn
            .reduce((total, sp) => total + (sp.soluong * sp.giasp), 0);
    };
    $scope.toggleAll = function () {
        $scope.dataSp.forEach(sp => sp.selected = $scope.selectAll);
        $scope.tinhTongTien(); // Cập nhật tổng tiền khi chọn tất cả
    };
    
});
