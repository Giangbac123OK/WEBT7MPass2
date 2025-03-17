app.controller('donhangcuabanController', function($scope, $http) {
    // select hóa đơn theo mã khách hàng
    $http.get('http://localhost:36106/api/Hoadons/hoa-don-theo-ma-kh-1')
        .then(function(response){
            $scope.dataHoaDon = response.data
            console.log($scope.dataHoaDon)
        })
        .catch(function(error){
            console.error(error)
        })
    //select hóa đơn chi tiết theo mã hóa đơn
    
    $http.get('http://localhost:36106/api/Hoadonchitiets')
        .then(function(response){
            $scope.dataHoaDonCT = response.data
            console.log($scope.dataHoaDonCT)
        })
        .catch(function(error){
            console.error(error)
        })

    $http.get('http://localhost:36106/api/Trahangs')
        .then(function(response){
            $scope.dataTraHang = response.data
            console.log($scope.dataTraHang)
        })
        .catch(function(error){
            console.error(error)
        })
});

