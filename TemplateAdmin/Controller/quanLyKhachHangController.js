app.controller('quanLyKhachHangController', function ($scope, $http, $location, $timeout, $routeParams) {
    $scope.khachHangs = [];
    $scope.currentPage = 1; // Trang hiện tại
    $scope.pageSize = 9; // Số sản phẩm trên mỗi trang
    $scope.totalPages = 0; // Tổng số trang
    $scope.sortOption = 'newest'; // Tùy chọn sắp xếp mặc định
    $scope.khachHang = {
        ten: "",
        email: null,
        matKhau: null,
        soDienThoai: "",
        diaChi: "",
        ngaySinh: "",
        avatar: "",
        gioitinh: true,
        trangthai: 0,
        ngaytaotaikhoan: new Date(),
        idrank: 1,

    };
    // Lấy danh sách sản phẩm

     $scope.themKhachHang = function () {
 
        console.log(khachHang);
        $http.post("https://localhost:7196/api/Khachhangs", khachHang)
            .then(function (response) {
                console.log("Thêm thành công", response.data);
                alert("Thêm thành công");
                $scope.LoadKhachHang();
                $scope.resetForm();
            })
            .catch(function (error) {
                console.error("Lỗi khi thêm sản phẩm:", error);
                alert("Có lỗi xảy ra khi thêm sản phẩm.");
            });

     }
    $scope.resetForm = function () {
        $scope.khachHang = {
            ten: "",
            email: null,
            matKhau: null,
            soDienThoai: "",
            diaChi: "",
            ngaySinh: "",
            avatar: "",
            gioitinh: true,
            trangthai: 0,
            ngaytaotaikhoan: new Date(),
            idrank: 1,
        };
        $scope.selectedImage = null; // Reset hình ảnh đã chọn
        $scope.imagePreview = null; // Reset hình ảnh xem trước
    }
    $scope.uploadImage = function (event) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function (e) {
                $scope.$apply(function () {
                    $scope.imagePreview = e.target.result; // Cập nhật hình ảnh xem trước
                });
            };
            reader.readAsDataURL(file);
        }
    };
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
    };
    $scope.editKhachHang = function (khachHang) {
        $scope.khachHang = angular.copy(khachHang); // Sao chép đối tượng để chỉnh sửa
        console.log("Đối tượng chỉnh sửa", $scope.khachHang);
    };
    $scope.updateKhachHang = function () {
        $http.put("https://localhost:7196/api/Khachhangs/" + $scope.khachHang.id, $scope.khachHang)
            .then(function (response) {
                console.log("Cập nhật thành công", response.data);
                alert("Cập nhật thành công");
                $scope.LoadKhachHang();
                $scope.resetForm(); // Đặt lại form sau khi cập nhật
            })
            .catch(function (error) {
                console.error("Lỗi khi cập nhật sản phẩm:", error);
                alert("Có lỗi xảy ra khi cập nhật sản phẩm.");
            });
    };
    $scope.getPagedProducts = function () {
        let start = ($scope.currentPage - 1) * $scope.pageSize;
        let end = start + $scope.pageSize;
        return $scope.khachHangs.slice(start, end);
    };
    $scope.sortProducts = function () {
        switch ($scope.sortOption) {
            case 'newest': // Sắp xếp mới nhất
                $scope.khachHangs.sort((a, b) => new Date(b.ngaytaotaikhoan) - new Date(a.ngaytaotaikhoan));
                break;
            case 'oldest': // Sắp xếp cũ nhất
                $scope.khachHangs.sort((a, b) => new Date(a.ngaytaotaikhoan) - new Date(b.ngaytaotaikhoan));
                break;
            default:
                break;
        }
    };
    $scope.changePage = function (page) {
        if (page >= 1 && page <= $scope.totalPages) {
            $scope.currentPage = page;
        }
    };
    $scope.nextPage = function () {
        if ($scope.currentPage < $scope.totalPages) {
            $scope.currentPage++;
        }
    };
    $scope.prevPage = function () {
        if ($scope.currentPage > 1) {
            $scope.currentPage--;
        }
    };
    $scope.isActivePage = function (page) {
        return $scope.currentPage === page;
    };
    $scope.isFirstPage = function () {
        return $scope.currentPage === 1;
    };
    $scope.isLastPage = function () {
        return $scope.currentPage === $scope.totalPages;
    };
    $scope.isLoading = true; // Biến để kiểm tra trạng thái tải dữ liệu
    $scope.errorMessage = ""; // Biến để lưu thông báo lỗi
    $scope.LoadKhachHang = function () {
        $scope.isLoading = true; // Bắt đầu trạng thái tải
        $http.get("https://localhost:7196/api/Khachhangs")
            .then(function (response) {
                $scope.khachHangs = response.data;
                console.log("Khách hàng", $scope.khachHangs);
                // Cập nhật tổng số trang
                $scope.totalPages = Math.ceil($scope.khachHangs.length / $scope.pageSize);
                $scope.isLoading = false; // Kết thúc trạng thái tải
            })
            .catch(function (error) {
                console.error("Lỗi khi tải danh sách sản phẩm:", error);
                $scope.errorMessage = "Có lỗi xảy ra khi tải dữ liệu.";
                $scope.isLoading = false; // Kết thúc trạng thái tải
            });
    }
    $scope.LoadKhachHang(); // Gọi hàm tải danh sách sản phẩm khi trang được tải
    $scope.search = function () {
        if ($scope.searchQuery) {
            $scope.khachHangs = $scope.khachHangs.filter(function (khachHang) {
                return khachHang.ten.toLowerCase().includes($scope.searchQuery.toLowerCase());
            });
        } else {
            $scope.LoadKhachHang(); // Nếu không có từ khóa tìm kiếm, tải lại danh sách sản phẩm
        }
    };
    $scope.sortProducts(); // Gọi hàm sắp xếp sản phẩm khi trang được tải
    $scope.$watch('sortOption', function (newValue, oldValue) {
        if (newValue !== oldValue) {
            $scope.sortProducts(); // Gọi hàm sắp xếp sản phẩm khi tùy chọn thay đổi
        }
    });
    $scope.$watch('currentPage', function (newValue, oldValue) {
        if (newValue !== oldValue) {
            $scope.getPagedProducts(); // Gọi hàm phân trang khi trang hiện tại thay đổi
        }
    });
    $scope.$watch('pageSize', function (newValue, oldValue) {
        if (newValue !== oldValue) {
            $scope.getPagedProducts(); // Gọi hàm phân trang khi kích thước trang thay đổi
        }
    });
    $scope.$watch('searchQuery', function (newValue, oldValue) {
        if (newValue !== oldValue) {
            $scope.search(); // Gọi hàm tìm kiếm khi từ khóa thay đổi
        }
    });
    $scope.$watch('khachHang', function (newValue, oldValue) {
        if (newValue !== oldValue) {
            $scope.khachHang = newValue; // Cập nhật đối tượng khách hàng khi có thay đổi
        }
    }, true); // true để theo dõi sự thay đổi sâu trong đối tượng
    
    

});