app.controller('donhangcuabanController', function($scope, $http) {
    // select hóa đơn theo mã khách hàng
    
    const userInfo = JSON.parse(localStorage.getItem('userInfo'));
    console.log(userInfo);
    let idkh = userInfo.id;

    // Hàm gọi API lấy dữ liệu hóa đơn
    $scope.loadHoaDon = function () {
        let api = "https://localhost:7196/api/Hoadons/hoa-don-theo-ma-kh-"+idkh;
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
    $http.get("https://localhost:7196/api/Hoadonchitiets")
            .then(function(response) {
                $scope.dataHoaDonCT = response.data;
                console.log("Dữ liệu hóa đơn chi tiết:", $scope.dataHoaDonCT);
            })
            .catch(function(error) {
                console.error("Lỗi khi lấy dữ liệu hóa đơn chi tiết:", error);
                alert("Có lỗi xảy ra khi tải dữ liệu. Vui lòng kiểm tra console.");
            });

        $scope.toggleItems = function() {
            $scope.showItems = !$scope.showItems;
        };
    $http.get('https://localhost:7196/api/Trahangs')
        .then(function(response){
            $scope.dataTraHang = response.data
            console.log($scope.dataTraHang)
        })
        .catch(function(error){
            console.error(error)
        })
    $scope.chitietdonhang = function(id){
        $scope.idhd = id;
        $('#chitietModal').modal('show');
    }
});

