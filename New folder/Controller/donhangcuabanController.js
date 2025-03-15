app.controller('donhangcuabanController', function($scope, $http) {
    $http.get('http://localhost:36106/api/Hoadons')
        .then(function(response){
            $scope.dataHoaDon = response.data
            console.log($scope.dataHoaDon)
        })
        .catch(function(error){
            console.error(error)
        })
});

