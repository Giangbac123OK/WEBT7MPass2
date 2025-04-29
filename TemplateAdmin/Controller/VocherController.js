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
      renderRanks(res.data);
    });
  }

  function renderRanks(ranks) {
    var container = document.getElementById("rank_coupon");
    container.innerHTML = ""; // reset container

    ranks.forEach(function (rank) {
      var label = document.createElement("label");
      label.style.display = "block"; // mỗi checkbox xuống dòng riêng

      var checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.value = rank.id;
      checkbox.name = "rank"; // hoặc "rank[]" nếu bạn submit form nhiều checkbox
      checkbox.id = "rank_" + rank.id;

      label.appendChild(checkbox);
      label.appendChild(document.createTextNode(" " + rank.tenrank));

      container.appendChild(label);
    });
  }
  document
    .getElementById("saveVoucherBtn")
    .addEventListener("click", function () {
      var mota = document.getElementById("mota").value;
      var donvi = parseInt(document.getElementById("donvi").value);
      var giatri = parseFloat(document.getElementById("giatri").value);
      var soluong = parseInt(document.getElementById("soluong").value);
      var ngaybatdau = document.getElementById("ngaybatdau").value;
      var ngayketthuc = document.getElementById("ngayketthuc").value;
      var trangthai = parseInt(document.getElementById("trangthai").value);

      // Lấy danh sách rank đã chọn
      var rankCheckboxes = document.querySelectorAll(
        "#rank_coupon input[type='checkbox']:checked"
      );
      var rankNames = [];
      var rankIds = [];

      rankCheckboxes.forEach(function (checkbox) {
        rankNames.push(checkbox.getAttribute("data-name"));
        rankIds.push(parseInt(checkbox.value));
      });

      if (rankNames.length === 0) {
        alert("Vui lòng chọn ít nhất một rank!");
        return;
      }

      // Chuẩn bị dữ liệu để gửi
      var voucherData = {
        mota: mota,
        donvi: donvi,
        soluong: soluong,
        giatri: giatri,
        ngaybatdau: convertDate(ngaybatdau),
        ngayketthuc: convertDate(ngayketthuc),
        trangthai: trangthai,
        rankNames: rankNames,
      };

      // Gửi yêu cầu tạo voucher
      fetch("https://localhost:7196/api/Giamgia/AddRankToGiamgia", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(voucherData),
      })
        .then((response) => response.json())
        .then((data) => {
        //   var newVoucherId = typeof data === "object" ? data.id : data; // lấy id voucher mới

        //   if (!newVoucherId || isNaN(newVoucherId)) {
        //     alert("Không lấy được ID của voucher mới tạo!");
        //     return;
        //   }

        //   // Gửi từng rank để liên kết voucher và rank
        //   rankIds.forEach(function (idrank) {
        //     var rankData = {
        //       iDgiamgia: parseInt(newVoucherId),
        //       idrank: parseInt(idrank),
        //     };

        //     fetch("https://localhost:7196/api/Giamgia_rank", {
        //       method: "POST",
        //       headers: {
        //         "Content-Type": "application/json",
        //       },
        //       body: JSON.stringify(rankData),
        //     })
        //       .then((r) => r.json())
        //       .then(console.log)
        //       .catch(console.error);
        //   });

        //   alert("Thêm mã giảm giá thành công!");
        //   var modal = bootstrap.Modal.getInstance(
        //     document.getElementById("addVoucherModal")
        //   );
        //   modal.hide();
        })

        .catch(function (error) {
          console.error("Lỗi khi tạo voucher:", error);
          alert("Có lỗi xảy ra khi tạo mã giảm giá.");
        });
    });

  // Hàm chuyển đổi ngày từ dd/mm/yyyy thành yyyy-MM-ddTHH:mm:ss
  function convertDate(dateStr) {
    var parts = dateStr.split("/");
    var date = new Date(parts[2], parts[1] - 1, parts[0]);
    return date.toISOString();
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
// Khi bấm nút sửa voucher
$scope.editVoucher = function (voucher) {
  $scope.editingVoucher = angular.copy(voucher);

  // Chuyển ngày về định dạng phù hợp datetime-local
  $scope.editingVoucher.ngaybatdau = formatDateTimeLocal(voucher.ngaybatdau);
  $scope.editingVoucher.ngayketthuc = formatDateTimeLocal(voucher.ngayketthuc);

  // Hiển thị modal
  $('#editVoucherModal').modal('show');
};

function formatDateTimeLocal(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  const yyyy = date.getFullYear();
  const MM = ('0' + (date.getMonth() + 1)).slice(-2);
  const dd = ('0' + date.getDate()).slice(-2);
  const HH = ('0' + date.getHours()).slice(-2);
  const mm = ('0' + date.getMinutes()).slice(-2);
  return `${yyyy}-${MM}-${dd}T${HH}:${mm}`;
}


// Hàm lưu voucher sau chỉnh sửa
$scope.updateVoucher = function () {
  // Thu thập các rank đã chọn
  var selectedRanks = $scope.ranks.filter(r => r.selectedEdit).map(r => r.id);

  if (selectedRanks.length === 0) {
    alert("Vui lòng chọn ít nhất một Rank!");
    return;
  }

  // Cập nhật voucher
  var updatedVoucher = angular.copy($scope.editingVoucher);
  updatedVoucher.rankIds = selectedRanks;

  // Gửi PUT API
  $http.put(`https://localhost:7196/api/Giamgia/${updatedVoucher.id}`, updatedVoucher)
    .then(function (res) {
      $scope.message = "Cập nhật thành công!";
      $('#editVoucherModal').modal('hide');
      loadVouchers();
      $timeout(() => ($scope.message = ""), 3000);
    })
    .catch(function (err) {
      console.error(err);
      alert("Cập nhật thất bại!");
    });
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
