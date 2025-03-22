app.controller('thongtintaikhoanController', function ($http, $scope) {
    const userInfo = JSON.parse(localStorage.getItem('userInfo'));
    console.log(userInfo);
    let idkh = userInfo.id;
    const apiUrl = "https://localhost:7196/api/Khachhangs/";

    // Lấy dữ liệu từ API
    $http.get(apiUrl + idkh)
        .then(function (response) {
            $scope.dataTttk = response.data;
            console.log("Dữ liệu tài khoản:", $scope.dataTttk);
            
            // Kiểm tra và xử lý ngày sinh
            if ($scope.dataTttk.ngaysinh) {
                let dateObj = new Date($scope.dataTttk.ngaysinh);
                $scope.dataTttk.ngaysinh = new Date(dateObj.getFullYear(), dateObj.getMonth(), dateObj.getDate());
            }
        })
        .catch(function (error) {
            console.error("Lỗi khi lấy dữ liệu:", error);
            Swal.fire("Lỗi!", "Không thể lấy thông tin tài khoản. Vui lòng thử lại!", "error");
        });

    // Hàm cập nhật thông tin
    $scope.btnLuu = function () {
        const data = {
            ten: $scope.dataTttk.ten,
            sdt: $scope.dataTttk.sdt,
            ngaysinh: $scope.dataTttk.ngaysinh,  
            email: $scope.dataTttk.email,
            gioitinh: $scope.dataTttk.gioitinh
        };
        
        console.log("Dữ liệu gửi lên API:", data);
        
        $http.put(apiUrl  + idkh, data)
            .then(function (response) {
                Swal.fire("Đã sửa!", "Dữ liệu của bạn đã được cập nhật.", "success")
                    .then(() => {
                        location.reload();
                        window.scrollTo(0, 0);
                    });
            })
            .catch(function (error) {
                console.error("Lỗi khi cập nhật dữ liệu:", error);
                Swal.fire("Lỗi!", "Không thể cập nhật thông tin. Vui lòng thử lại!", "error");
                console.log(data )
            });
    };
});
