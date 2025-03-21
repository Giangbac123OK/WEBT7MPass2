app.controller('thongtintaikhoanController', function ($http, $scope) {
    const apiUrl = "http://localhost:36106/api/Khachhangs/1";

    // Lấy dữ liệu từ API
    $http.get(apiUrl)
        .then(function (response) {
            $scope.dataTttk = response.data;
            console.log("Dữ liệu tài khoản:", $scope.dataTttk);
            if($scope.dataTttk.ngaysinh!=null){
                let dateObj = new Date($scope.dataTttk.ngaysinh);
                $scope.dataTttk.ngaysinh = new Date(dateObj.getFullYear(), dateObj.getMonth(), dateObj.getDate());
            }
        })
        .catch(function (error) {
            console.error("Lỗi khi lấy dữ liệu:", error);
            Swal.fire("Lỗi!", "Không thể lấy thông tin tài khoản. Vui lòng thử lại!", "error");
        });
    
});
