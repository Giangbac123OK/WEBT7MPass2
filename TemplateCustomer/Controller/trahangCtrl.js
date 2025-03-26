app.controller('trahangController', function ($http, $scope,$location,$routeParams) {
  const idhd = $routeParams.id;
  console.log(idhd);
  $scope.spct =[];
  $http.get("https://localhost:7196/api/Hoadonchitiets")
    .then(function(response) {
      // Kiểm tra xem dữ liệu có tồn tại không
      if (response.data && response.data.length) {
        $scope.hoadonChiTiet = response.data.find(x => x.idhd == idhd);
        console.log($scope.hoadonChiTiet);
      } else {
        console.log("Không có dữ liệu nào được trả về.");
      }
    })
    .catch(function(error) {
      console.error("Lỗi khi lấy dữ liệu:", error);
    });
    $http.get("https://localhost:7196/api/Sanphamchitiets")
    .then(function(response) {
      // Kiểm tra xem dữ liệu có tồn tại không
      if (response.data && response.data.length) {
        $scope.SanphamChiTiet = response.data;
        console.log($scope.SanphamChiTiet);
      } else {
        console.log("Không có dữ liệu nào được trả về.");
      }
    })
    .catch(function(error) {
      console.error("Lỗi khi lấy dữ liệu:", error);
    });
});
