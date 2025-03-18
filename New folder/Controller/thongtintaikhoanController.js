app.controller('thongtintaikhoanController', function ($http, $scope) {
    const apiUrl = "http://localhost:36106/api/Khachhangs/1";

    $http.get(apiUrl)
        .then(function (response) {
            $scope.dataTttk = response.data;
            console.log("Dữ liệu tài khoản:", $scope.dataTttk);
        })
        .catch(function (error) {
            console.error("Lỗi khi lấy dữ liệu:", error);
            alert("Không thể lấy thông tin tài khoản. Vui lòng thử lại!");
        });
});
