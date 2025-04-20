app.controller('quanLyKhachHangController', function ($scope, $http, $location, $timeout, $routeParams) {
    $scope.khachHangs = [];
    $scope.Ranks = [];
    // Lấy danh sách sản phẩm
    $scope.newkhachHang = {
        id: 0,
        ten: null,
        sdt: null,
        ngaysinh: null,
        tichdiem: 0,
        email: null,
        password: null,
        ngaytaotaikhoan: new Date().toISOString(),
        diemsudung: 0,
        trangthai: 0,
        idrank: 0,
        gioitinh: true,
        avatar: ""
    };
    
     $scope.themKhachHang = function () {

        $http.post("https://localhost:7196/api/Khachhangs",$scope.newkhachHang)
            .then(function (response) {
                console.log("Thêm thành công", response.data);
                alert("Thêm thành công");
                $scope.LoadKhachHang();
                $location.url('/KhachHang');
            })
            .catch(function (error) {
                console.error("Lỗi khi thêm sản phẩm:", error);
                alert("Có lỗi xảy ra khi thêm sản phẩm.");
            });

     }
    
    $scope.LoadKhachHang = function () {
        $scope.isLoading = true; // Bắt đầu trạng thái tải
        $http.get("https://localhost:7196/api/Khachhangs")
            .then(function (response) {
                $scope.khachHangs = response.data;
                console.log("Khách hàng", $scope.khachHangs);
            
            })
            .catch(function (error) {
                console.error("Lỗi khi tải danh sách sản phẩm:", error);
                $scope.errorMessage = "Có lỗi xảy ra khi tải dữ liệu.";
                $scope.isLoading = false; // Kết thúc trạng thái tải
            });
    }
    $scope.loadRank = function(){
        $http.get("https://localhost:7196/api/Ranks")
            .then(function (response) {
                $scope.Ranks = response.data;
                console.log("Ranks", $scope.Ranks);
            })
            .catch(function (error) {
                console.error("Lỗi khi tải danh sách sản phẩm:", error);
                $scope.errorMessage = "Có lỗi xảy ra khi tải dữ liệu.";
                $scope.isLoading = false; // Kết thúc trạng thái tải
            });
    }
    $scope.LoadKhachHang(); 
    $scope.loadRank();
    $scope.deleteKhachHang = function (id) {
        if (confirm("Bạn có chắc chắn muốn xóa khách hàng này không?")) {
            $http.delete("https://localhost:7196/api/Khachhangs/" + id)
                .then(function (response) {
                    console.log("Xóa thành công", response.data);
                    alert("Xóa thành công");
                    $scope.LoadKhachHang();
                })
                .catch(function (error) {
                    console.error("Lỗi khi xóa sản phẩm:", error);
                    alert("Có lỗi xảy ra khi xóa sản phẩm.");
                });
        }
    }
    $scope.getKhachHangById = function (id) {
        $http.get("https://localhost:7196/api/Khachhangs/" + id)
            .then(function (response) {
                $scope.newkhachHang = response.data;
                if ($scope.newkhachHang.ngaysinh) {
                    $scope.newkhachHang.ngaysinh = new Date($scope.newkhachHang.ngaysinh);
                }
                if($scope.newkhachHang.trangthai ==="Hoạt động"){
                    $scope.newkhachHang.trangthai = 0;
                }
                if($scope.newkhachHang.trangthai ==="Tài khoản bị khoá"){
                    $scope.newkhachHang.trangthai = 1;
                }
                
                console.log("Khách hàng", $scope.newkhachHang);
            })
            .catch(function (error) {
                console.error("Lỗi khi tải danh sách sản phẩm:", error);
                $scope.errorMessage = "Có lỗi xảy ra khi tải dữ liệu.";
            });

    }
    $scope.updateKhachHang = function () {
        $http.put("https://localhost:7196/api/Khachhangs/" + $scope.newkhachHang.id, $scope.newkhachHang)
            .then(function (response) {
                console.log("Cập nhật thành công", response.data);
                alert("Cập nhật thành công");
                $scope.LoadKhachHang();
                $location.url('/KhachHang');
            })
            .catch(function (error) {
                console.error("Lỗi khi cập nhật sản phẩm:", error);
                alert("Có lỗi xảy ra khi cập nhật sản phẩm.");
            });
    }
    if($routeParams.id) {
        let id = $routeParams.id;
        $scope.getKhachHangById(id);
    }
});