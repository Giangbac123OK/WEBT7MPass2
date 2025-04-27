app.controller("VoucherController", function ($http, $scope, $timeout) {
    $scope.vouchers = [];
    $scope.ranks = [];
    $scope.newVoucher = {};
    $scope.editingVoucher = null;
    $scope.message = "";
  
    // Lấy danh sách voucher
    function loadVouchers() {
      $http.get("https://localhost:7196/api/Giamgia").then(function (res) {
        $scope.vouchers = res.data;
      });
    }
  
    // Lấy danh sách rank
    function loadRanks() {
      $http.get("https://localhost:7196/api/Giamgia_rank").then(function (res) {
        $scope.ranks = res.data;
      });
    }
  
    // Tạo mới voucher
    $scope.addVoucher = function () {
      $http.post("https://localhost:7196/api/Giamgia", $scope.newVoucher).then(
        function (res) {
          $scope.message = "Đã thêm mã giảm giá thành công!";
          $scope.newVoucher = {};
          loadVouchers();
          $timeout(() => ($scope.message = ""), 3000);
        },
        function (err) {
          console.error(err);
          alert("Thêm thất bại!");
        }
      );
    };
  
    // Chọn voucher để chỉnh sửa
    $scope.editVoucher = function (voucher) {
      $scope.editingVoucher = angular.copy(voucher);
    };
  
    // Lưu chỉnh sửa voucher
    $scope.updateVoucher = function () {
      $http
        .put(
          `https://localhost:7196/api/Giamgia/${$scope.editingVoucher.id}`,
          $scope.editingVoucher
        )
        .then(
          function (res) {
            $scope.message = "Cập nhật thành công!";
            $scope.editingVoucher = null;
            loadVouchers();
            $timeout(() => ($scope.message = ""), 3000);
          },
          function (err) {
            console.error(err);
            alert("Cập nhật thất bại!");
          }
        );
    };
  
    // Xóa voucher
    $scope.deleteVoucher = function (id) {
      if (confirm("Bạn có chắc chắn muốn xóa mã này không?")) {
        $http.delete(`https://localhost:7196/api/Giamgia/${id}`).then(
          function (res) {
            $scope.message = "Đã xóa thành công!";
            loadVouchers();
            $timeout(() => ($scope.message = ""), 3000);
          },
          function (err) {
            console.error(err);
            alert("Xóa thất bại!");
          }
        );
      }
    };
  
    // Gán thông tin giảm giá theo rank (nếu cần dùng)
    $scope.getRankDiscount = function (rankId) {
      const rank = $scope.ranks.find((r) => r.id === rankId);
      return rank ? rank.discountPercent + "%" : "Không áp dụng";
    };
  
    // Hàm khởi tạo khi controller được gọi
    function init() {
      loadVouchers();
      loadRanks();
    }
  
    init();
  });
  