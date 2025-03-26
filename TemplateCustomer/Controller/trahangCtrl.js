app.controller('trahangController', function ($http, $scope, $location, $routeParams) {
  $scope.idhd = $routeParams.id;
  console.log($scope.idhd);

  // Gọi API để lấy danh sách sản phẩm
  $http.get("https://localhost:7196/api/Trahangchitiets/ListSanPhamByIdhd/" + $scope.idhd)
      .then(function (response) {
          $scope.dataSp = response.data.map(sp => {
              sp.maxsoluong = sp.soluong; // Số lượng tối đa từ API
              return sp;
          });
          $scope.tinhTongTien(); // Tính tổng tiền ban đầu
          console.log($scope.dataSp);
      })
      .catch(function (error) {
          console.error(error);
      });

  // Hàm tính tổng tiền
  $scope.tinhTongTien = function () {
      $scope.tongtien = $scope.dataSp.reduce((total, sp) => total + (sp.soluong * sp.giasp), 0);
  };

  // Tăng số lượng
  $scope.increase = function (sp) {
      if (sp.soluong < sp.maxsoluong) {
          sp.soluong++;
          $scope.tinhTongTien();
      }
  };

  // Giảm số lượng
  $scope.decrease = function (sp) {
      if (sp.soluong > 1) {
          sp.soluong--;
          $scope.tinhTongTien();
      }
  };
});
