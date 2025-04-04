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
    $scope.getMaxYear = function() {
        const today = new Date();
        const maxDate = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate()); // Trừ đúng 18 năm từ hôm nay
        return maxDate.toISOString().split("T")[0]; // Chuyển về yyyy-mm-dd
    };
    
    
    $scope.btnAdd = function(){
        if ($scope.AddNhanVienfrm.$invalid) {
            angular.forEach($scope.AddNhanVienfrm.$error, function (fields) {
                angular.forEach(fields, function (field) {
                    field.$setTouched();
                });
            });
            return; // Dừng lại nếu form có lỗi
        }
        // Xử lý ngày sinh đúng múi giờ
        const date = new Date($scope.add.ngaysinh); // Đảm bảo có giờ
        const formattedDate = date.toISOString(); // Chuyển sang ISO UTC
        const data = {
            id: 0,
            hovaten: $scope.add.hovaten,
            ngaysinh: date, // Lưu dưới dạng ISO
            diachi: $scope.add.diachi,
            gioitinh: $scope.add.gioitinh === "true", // Đảm bảo đúng kiểu boolean
            sdt: $scope.add.sdt,
            email: $scope.add.email,
            trangthai: 0,
            password: $scope.add.password,
            role: Number($scope.add.chucvu), // Đảm bảo số nguyên
            ngaytaotaikhoan: new Date(), // Lưu thời gian tạo tài khoản
            avatar: "giang.img"
        };
        if ($scope.listNhanVien.find(x => x.sdt === data.sdt)) {
            Swal.fire({
                title: "Lỗi",
                text: "Số điện thoại đã tồn tại!",
                icon: "error",
                confirmButtonText: "OK"
            });
            return;
        }
        if ($scope.listNhanVien.find(x => x.email === data.email)) {
            Swal.fire({
                title: "Lỗi",
                text: "Email đã tồn tại!",
                icon: "error",
                confirmButtonText: "OK"
            });
            return;
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
                $http.post("https://localhost:7196/api/Nhanviens", data)
                    .then(function(){
                        const dataSendEmail = {
                            toEmail: data.email,
                            hoten: data.hovaten,
                            password: data.password,
                            role: data.role
                        };
                        
                        $http.post("https://localhost:7196/api/Nhanviens/Send_Account_Creation_Email", null, { params: dataSendEmail })
                            .then(() => {
                                
                                window.scroll(0,0);
                                location.reload();
                                Swal.fire({
                                    title: "Thành công!",
                                    text: "Nhân viên đã được thêm và email đã gửi.",
                                    icon: "success",
                                    confirmButtonText: "OK"
                                });
                                // Reset form
                                $scope.add = {};
                                $scope.AddNhanVienfrm.$setPristine();
                                $scope.AddNhanVienfrm.$setUntouched();
                            })
                            .catch((error) => {
                                console.error(error);
                                let errorMessage = error.data?.message || "Lỗi khi gửi email!";
                                Swal.fire({
                                    title: "Lỗi",
                                    text: errorMessage,
                                    icon: "error",
                                    confirmButtonText: "OK"
                                });
                            });
                        
                        
                    })
                    .catch(function(error){
                        console.error("Error:", error);
                        let errorMessage = error.data?.message || "Lỗi dữ liệu!";
                        Swal.fire({
                            title: "Lỗi",
                            text: errorMessage,
                            icon: "error",
                            confirmButtonText: "OK"
                        });
                    });
            }
        });
    };
    $scope.showEdit = function(id) {
        $scope.isEditing = true;
        
        $http.get("https://localhost:7196/api/Nhanviens/" + id)
            .then(function(response) {
                $scope.edit = response.data;
                $scope.edit.ngaysinh = new Date($scope.edit.ngaysinh); // chuyển thành đối tượng Date
                $scope.edit.gioitinh = $scope.edit.gioitinh ? 'false' : 'true';
            })
            .catch(function(error) {
                console.error(error);
            });
    };
    
    
});
