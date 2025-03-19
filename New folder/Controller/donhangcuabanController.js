app.controller('donhangcuabanController', function($scope, $http) {
    // select hóa đơn theo mã khách hàng

    const baseUrl = "http://localhost:36106/api/Hoadons/hoa-don-theo-ma-kh-1";

    // Hàm gọi API lấy dữ liệu hóa đơn
    $scope.loadHoaDon = function () {
        let api = baseUrl;
        if ($scope.searchText && $scope.searchText.trim() !== "") {
            api += `?search=${encodeURIComponent($scope.searchText)}`;
        }

        $http.get(api)
            .then(function (response) {
                $scope.dataHoaDon = response.data;
                console.log("Dữ liệu hóa đơn:", $scope.dataHoaDon);
            })
            .catch(function (error) {
                console.error("Lỗi khi lấy dữ liệu:", error);
            });
    };

    // Theo dõi sự thay đổi của searchText
    $scope.$watch("searchText", function (newValue, oldValue) {
        if (newValue !== oldValue) {
            $scope.loadHoaDon();
        }
    });

    // Gọi API ngay khi trang được load
    $scope.loadHoaDon();
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

