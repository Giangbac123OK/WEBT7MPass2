app.controller('thongtintaikhoanController', function ($http, $scope) {
    const userInfo = JSON.parse(localStorage.getItem('userInfo'));
    console.log(userInfo);
    let idkh = userInfo.id;
    const apiUrl = "https://localhost:7196/api/Khachhangs/";

    // Lấy dữ liệu từ API
    $http.get(apiUrl+idkh)
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
