app.controller("VoucherController", function ($http, $scope, $timeout) {
  $scope.vouchers = [];
  $scope.filteredVouchers = [];
  $scope.ranks = [];
  $scope.newVoucher = {};
  $scope.editingVoucher = null;
  $scope.message = "";
  $scope.itemsPerPage = 5; // Số lượng voucher mỗi trang
  $scope.currentPage = 1;

  // Lấy danh sách voucher
  function loadVouchers() {
      $http.get("https://localhost:7196/api/Giamgia").then(function (res) {
          $scope.vouchers = res.data;
          $scope.applyFilters(); // Áp dụng bộ lọc sau khi tải dữ liệu
      });
  }

  // Lấy danh sách rank
  function loadRanks() {
      $http.get("https://localhost:7196/api/Ranks").then(function (res) {
          $scope.ranks = res.data;
      });
  }

  // Áp dụng bộ lọc
  $scope.applyFilters = function () {
      $scope.filteredVouchers = $scope.vouchers.filter(function (v) {
          return (
              (!$scope.statusFilter || v.trangThai === $scope.statusFilter) &&
              (!$scope.typeFilter || v.loai === $scope.typeFilter) &&
              (!$scope.rankFilter || v.rankId === $scope.rankFilter)
          );
      });
      $scope.currentPage = 1; // Reset trang khi thay đổi bộ lọc
  };

  // Chọn voucher để chỉnh sửa
  $scope.editVoucher = function (voucher) {
      $scope.editingVoucher = angular.copy(voucher);
  };

  // Lưu chỉnh sửa voucher
  $scope.updateVoucher = function () {
      $http.put(`https://localhost:7196/api/Giamgia/${$scope.editingVoucher.id}`, $scope.editingVoucher).then(
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

  // Phân trang
  $scope.prevPage = function () {
      if ($scope.currentPage > 1) {
          $scope.currentPage--;
      }
  };

  $scope.nextPage = function () {
      if ($scope.currentPage < $scope.totalPages()) {
          $scope.currentPage++;
      }
  };

  $scope.totalPages = function () {
      return Math.ceil($scope.filteredVouchers.length / $scope.itemsPerPage);
  };

  // Khởi tạo
  function init() {
      loadVouchers();
      loadRanks();
  }

  init();
});
