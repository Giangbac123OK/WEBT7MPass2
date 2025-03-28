app.controller('nhanvienController', function ($scope, $http, $location, $interval) {
    // Hàm lấy thứ trong tuần bằng tiếng Việt
    function getVietnameseDay(dayIndex) {
        const days = ["Chủ Nhật", "Thứ Hai", "Thứ Ba", "Thứ Tư", "Thứ Năm", "Thứ Sáu", "Thứ Bảy"];
        return days[dayIndex];
    }

    // Hàm cập nhật thời gian
    function updateTime() {
        var now = new Date();
        var dayOfWeek = getVietnameseDay(now.getDay());
        var day = String(now.getDate()).padStart(2, '0');
        var month = String(now.getMonth() + 1).padStart(2, '0'); // Tháng bắt đầu từ 0
        var year = now.getFullYear();
        var hours = String(now.getHours()).padStart(2, '0');
        var minutes = String(now.getMinutes()).padStart(2, '0');
        var seconds = String(now.getSeconds()).padStart(2, '0');

        $scope.time = `${dayOfWeek}, ${day}/${month}/${year} - ${hours}:${minutes}:${seconds}`;
    }

    // Cập nhật mỗi giây
    $interval(updateTime, 1000);

    // Chạy ngay khi trang tải
    updateTime();
    function LoadData(){
        $http.get("https://localhost:7196/api/Nhanviens")
            .then(function(response) {
                $scope.listNhanVien = response.data;
                console.log($scope.listNhanVien);
            })
            .catch(function(error) {
                console.error(error);
            });
    }
    LoadData();
    $scope.btnAdd = function(){
        if ($scope.AddNhanVienfrm.$invalid) {
            // Đánh dấu tất cả các input là 'touched' để hiển thị lỗi ngay
            angular.forEach($scope.AddNhanVienfrm.$error, function (fields) {
                angular.forEach(fields, function (field) {
                    field.$setTouched();
                });
            });
            return; // Dừng lại nếu form có lỗi
        }
    
        // Nếu hợp lệ, xử lý lưu dữ liệu (viết API hoặc logic ở đây)
        console.log("Dữ liệu nhân viên:", $scope.add);
        const data = {
            id:0,
            hovaten: $scope.add.hovaten,
            ngaysinh: new Date() ,
            diachi: $scope.add.diachi,
            gioitinh: $scope.add.gioitinh,
            sdt: $scope.add.sdt,
            email: $scope.add.email,
            trangthai: 0,
            password: $scope.add.password,
            role: $scope.add.chucvu,
            ngaytaotaikhoan: new Date()
        }
            Swal.fire({
                title: "Xác nhận",
                text: "Bạn có chắc chắn muốn thêm nhân viên này?",
                icon: "question",
                showCancelButton: true,
                confirmButtonText: "Đồng ý",
                cancelButtonText: "Hủy"
            }).then((result) => {
                if (result.isConfirmed) {
                    
                    $http.post("https://localhost:7196/api/Nhanviens",data)
                        .then(function(){// Xử lý lưu dữ liệu
                            console.log("Dữ liệu nhân viên:", $scope.add);
                            $("#ThemNVModal").modal("hide");
                            location.reload();
                            window.scrollTo(1,1);

                            // Hiển thị thông báo thành công
                            Swal.fire({
                                title: "Thành công!",
                                text: "Nhân viên đã được thêm thành công.",
                                icon: "success",
                                confirmButtonText: "OK"
                            });
                
                            // Reset form sau khi thêm thành công
                            $scope.add = {};
                            $scope.AddNhanVienfrm.$setPristine();
                            $scope.AddNhanVienfrm.$setUntouched();
                        })
                        .catch(function(error){
                            console.error("Error:", error);
                            Swal.fire({
                                title: "Lỗi",
                                text: "Lỗi dữ liệu!.",
                                icon: "error",
                                confirmButtonText: "OK"
                            });
                        })
                }
            });
    }
});
