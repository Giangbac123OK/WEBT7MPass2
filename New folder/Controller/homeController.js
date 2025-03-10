app.controller('homeController', function($scope, $http) {
    // Sản phẩm nổi bật
    $http.get("https://localhost:7196/api/Sanphams/sp-noi-bat")
        .then(function(response){
            // Handle success
            $scope.dataSpNoiBat = response.data;
            console.log("Sản phẩm nổi bật:\n" + $scope.dataSpNoiBat);
        })
        .catch(function(error){
            // Handle error
            console.error("Lỗi:\n" + error);
            $scope.errorMessage = "Có lỗi xảy ra khi tải dữ liệu.";
        })
    // Sản phẩm nổi bật
    $http.get("https://localhost:7196/api/Sanphams/sp-moi-nhat")
        .then(function(response){
            // Handle success
            $scope.dataSpMoiNhat = response.data;
            console.log("Sản phẩm nổi bật:\n" + $scope.dataSpMoiNhat);
        })
        .catch(function(error){
            // Handle error
            console.error("Lỗi:\n" + error);
            $scope.errorMessage = "Có lỗi xảy ra khi tải dữ liệu.";
       })
});
