app.controller('thongtintaikhoanController', function ($http, $scope, $location) {
    const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
    let dataCheck = {};

    if (userInfo && userInfo.id) { 
        console.log("User Info:", userInfo);
        let idkh = userInfo.id;
        let api = "https://localhost:7196/api/Khachhangs/";

        // Load thông tin tài khoản
        function loadData() {
            $http.get(api + idkh)
                .then(function (response) {
                    $scope.dataTttk = response.data;
                    console.log("Thông tin khách hàng:", $scope.dataTttk);
                    dataCheck = angular.copy(response.data); // Sao chép object
                    if ($scope.dataTttk.ngaysinh) {
                        $scope.dataTttk.ngaysinh = new Date($scope.dataTttk.ngaysinh);
                    }
                })
                .catch(function (error) {
                    console.error("Lỗi khi lấy dữ liệu:", error);
                    let errorMessage = error.data?.message || "Không thể kết nối đến máy chủ.";
                    Swal.fire('Lỗi!', `Đã xảy ra lỗi trong hệ thống:\n${errorMessage}`, 'error');
                });
        }

        loadData();

        $scope.EditBtn = function () {
            let updatedData = {
                ten: $scope.dataTttk.ten,
                sdt: $scope.dataTttk.sdt,
                ngaysinh: $scope.dataTttk.ngaysinh ? new Date($scope.dataTttk.ngaysinh).toISOString().split('T')[0] : null, 
                email: $scope.dataTttk.email,
                diachi: $scope.dataTttk.diachi,
                avatar: $scope.dataTttk.avatar,
                gioitinh: $scope.dataTttk.gioitinh
            };

            // So sánh dữ liệu cũ và mới
            if (JSON.stringify(updatedData) === JSON.stringify(dataCheck)) {
                Swal.fire('Thông báo', 'Không có thay đổi nào được thực hiện!', 'info');
                return;
            }

            Swal.fire({
                title: 'Bạn có muốn sửa thông tin không?',
                text: "Bạn sẽ không thể hoàn tác hành động này!",
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Đồng ý',
                cancelButtonText: 'Hủy bỏ'
            }).then((result) => {
                if (result.isConfirmed) {
                    console.log("Dữ liệu gửi lên API:", updatedData);
                    let updateApiUrl = `${api}UpdateThongTinKhachhangAsync/${idkh}`;

                    $http.put(updateApiUrl, updatedData)
                        .then(function () {
                            Swal.fire('Đã xác nhận!', 'Sửa thông tin thành công!', 'success')
                                .then(() => {
                                    loadData(); // Cập nhật dữ liệu thay vì reload trang
                                });
                        })
                        .catch(function (error) {
                            console.error("Lỗi khi cập nhật dữ liệu:", error);
                            let errorMessage = error.data?.message || "Không thể kết nối đến máy chủ.";
                            Swal.fire('Lỗi!', `Đã xảy ra lỗi trong hệ thống:\n${errorMessage}`, 'error');
                        });
                }
            });
        };
    } else {
        Swal.fire('Lỗi!', 'Vui lòng đăng nhập!', 'error');
        $location.path('/login');
    }
});
