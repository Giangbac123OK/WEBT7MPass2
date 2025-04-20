app.controller('trahangController', function ($scope, $http, $location, $interval, $timeout ) {
    const userInfoString = localStorage.getItem("userInfo1");
    const userInfo = JSON.parse(userInfoString);
    console.log(userInfo);
    const api = "https://localhost:7196/api/Trahangs"
    $http.get(api)
        .then(function(response){
            $scope.listTraHang = response.data;
            console.log("Data trả hàng: ",$scope.listTraHang)
        })
        .catch(function(error){
            console.error("Lỗi API: ",error);
            Swal.fire({
                icon: 'error',
                title: 'Lỗi hệ thống',
                text: 'Đã xảy ra lỗi. Vui lòng thử lại sau!',
              });
              
        })
    $http.get("https://localhost:7196/api/Hinhanh")
        .then(function(response){
            $scope.listHinhanh = response.data;
            console.log("Data hình ảnh: ",$scope.listHinhanh)
        })
        .catch(function(error){
            console.error("Lỗi API: ",error);
            Swal.fire({
                icon: 'error',
                title: 'Lỗi hệ thống',
                text: 'Đã xảy ra lỗi. Vui lòng thử lại sau!',
              });
              
        })
    $scope.OpenModalXacNhan = function(id){
        $scope.idXacnhan = id;
        $("#XacnhanModal").modal('show');
    }

});
