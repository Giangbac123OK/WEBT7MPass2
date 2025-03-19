app.controller('thongtintaikhoanController', function ($http, $scope) {
    const apiUrl = "http://localhost:36106/api/Khachhangs/1";

    // Lấy dữ liệu từ API
    $http.get(apiUrl)
        .then(function (response) {
            $scope.dataTttk = response.data;
            console.log("Dữ liệu tài khoản:", $scope.dataTttk);
        })
        .catch(function (error) {
            console.error("Lỗi khi lấy dữ liệu:", error);
            Swal.fire("Lỗi!", "Không thể lấy thông tin tài khoản. Vui lòng thử lại!", "error");
        });

    // Hàm cập nhật thông tin tài khoản
    $scope.updateTK = function () {
        Swal.fire({
            title: "Bạn có chắc chắn?",
            text: "Hành động này không thể hoàn tác!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "Có, cập nhật!"
        }).then((result) => {
            if (result.isConfirmed) {
                // Cập nhật dữ liệu
                $scope.$apply(() => {
                    $scope.dataEditTK = {
                        ten: $scope.dataTttk.ten,
                        sdt: $scope.dataTttk.sdt,
                        ngaysinh: $scope.dataTttk.ngaysinh,
                        tichdiem: $scope.dataTttk.tichdiem,
                        email: $scope.dataTttk.email,
                        diachi: $scope.dataTttk.diachi,
                        password: $scope.dataTttk.password,
                        diemsudung: $scope.dataTttk.diemsudung,
                        trangthai: $scope.dataTttk.trangthai,
                        idrank: $scope.dataTttk.idrank,
                        gioitinh: false,
                        avatar: $scope.dataTttk.avatar
                    };
                });

                // Gửi yêu cầu cập nhật
                $http.put(apiUrl, $scope.dataEditTK)
                    .then(function (response) {
                        Swal.fire("Thành công!", "Thông tin đã được cập nhật.", "success");
                        console.log("Cập nhật thành công");
                    })
                    .catch(function (error) {
                        console.error("Lỗi khi cập nhật:", error);
                        Swal.fire("Lỗi!", "Không thể cập nhật tài khoản. Vui lòng thử lại!", "error");
                    });
            }
        });
    };
});
