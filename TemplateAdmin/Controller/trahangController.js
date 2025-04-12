app.controller('trahangController', function ($scope, $http, $location, $interval, $timeout ) {
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
});
