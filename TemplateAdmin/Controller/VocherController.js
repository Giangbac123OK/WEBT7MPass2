app.controller("VoucherController", function ($http, $scope, $timeout, $q) {
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
      var trangthai = parseInt(document.getElementById("trangthaiadd").value);

      // Lấy danh sách rank đã chọn
      var rankCheckboxes = document.querySelectorAll("#rank_coupon input[type='checkbox']:checked");
      var rankNames = [];

      rankCheckboxes.forEach(function (checkbox) {
          var rankId = checkbox.id.replace('rank_', ''); // lấy ra id thôi (bỏ prefix)
          
          // Tìm trong ranks list (biến ranks AngularJS) cái rank có id tương ứng
          var selectedRank = $scope.ranks.find(function (rank) {
              return rank.id == rankId;
          });

          if (selectedRank) {
              rankNames.push(selectedRank.tenrank);
          }
      });


      if (rankNames.length === 0) {
        alert("Vui lòng chọn ít nhất một rank!");
        return;
      }

      // Chuẩn bị dữ liệu để gửi API
      var voucherData = {
        Mota: mota,
        Donvi: donvi,
        Giatri: giatri,
        Soluong: soluong,
        Ngaybatdau: ngaybatdau,
        Ngayketthuc: ngayketthuc,
        Trangthai: trangthai,
        RankNames: rankNames
      };

      // Gửi 1 lần duy nhất
      fetch("https://localhost:7196/api/Giamgia/AddRankToGiamgia", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(voucherData),
      })
        .then(response => {
          if (!response.ok) {
            throw new Error("Tạo voucher thất bại");
          }
          return response.text();
        })
        .then(data => {
          alert("Thêm mã giảm giá thành công!");
          var modal = bootstrap.Modal.getInstance(document.getElementById("addVoucherModal"));
          modal.hide();
        })
        .catch(error => {
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
    
    // Chuyển ngày về định dạng phù hợp
    $scope.editingVoucher.ngaybatdau = formatDateTimeLocal(voucher.ngaybatdau);
    $scope.editingVoucher.ngayketthuc = formatDateTimeLocal(voucher.ngayketthuc);
    
    // Load all ranks
    $http.get("https://localhost:7196/api/Ranks").then(function (res) {
        $scope.allRanks = res.data.map(function(rank) {
            // Khởi tạo selectedEdit = false cho tất cả rank
            return angular.extend({}, rank, { selectedEdit: false });
        });
        
        // Get voucher-rank relationships
        $http.get("https://localhost:7196/api/Giamgia_rank").then(function (response) {
            console.log('Data từ Giamgia_rank:', response.data); // Debug
            
            // Lưu toàn bộ dữ liệu quan hệ voucher-rank vào $scope.voucherRanks
            $scope.voucherRanks = response.data.filter(function(item) {
                // Kiểm tra cả null/undefined
                return item && item.iDgiamgia === $scope.editingVoucher.id;
            });
            
            console.log('voucherRanks đã lọc:', $scope.voucherRanks); // Debug
            
            // Lấy danh sách ID rank áp dụng
            var appliedRankIds = $scope.voucherRanks.map(function(item) {
                return item && item.idrank; // Kiểm tra null/undefined
            }).filter(function(id) { 
                return id !== undefined && id !== null; // Lọc bỏ undefined/null
            });
            
            console.log('appliedRankIds:', appliedRankIds); // Debug
            
            // Đánh dấu các rank được chọn
            $scope.allRanks.forEach(function(rank) {
                rank.selectedEdit = appliedRankIds.includes(rank.id);
            });
            
            // Hiển thị modal
            var modalElement = document.getElementById('editVoucherModal');
            var modal = new bootstrap.Modal(modalElement);
            modal.show();
        });
    });
};

  // Hàm kiểm tra rank có được chọn không
  $scope.isRankSelected = function (rankId) {
    if (!$scope.voucherRanks) return false;
    return $scope.voucherRanks.some(function (item) {
      return item.iDrank === rankId;
    });
  };


  function formatDateTimeLocal(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    const dd = ('0' + date.getDate()).slice(-2);
    const MM = ('0' + (date.getMonth() + 1)).slice(-2);
    const yyyy = date.getFullYear();
    const HH = ('0' + date.getHours()).slice(-2);
    const mm = ('0' + date.getMinutes()).slice(-2);
    return `${dd}/${MM}/${yyyy} ${HH}:${mm}`;
  }


  $scope.updateVoucher = function() {
    // Thu thập các rank đã chọn hiện tại
    var newlySelectedRanks = $scope.allRanks.filter(r => r.selectedEdit).map(r => r.id);
    
    if (newlySelectedRanks.length === 0) {
        alert("Vui lòng chọn ít nhất một Rank!");
        return;
    }

    // So sánh với danh sách rank ban đầu
    var originalSelectedRanks = $scope.voucherRanks.map(r => r.idrank);
    
    // Tìm các rank cần thêm
    var ranksToAdd = newlySelectedRanks.filter(id => 
        !originalSelectedRanks.includes(id));
    
    // Tìm các rank cần xóa
    var ranksToRemove = originalSelectedRanks.filter(id => 
        !newlySelectedRanks.includes(id));

    // Tạo promise chain để xử lý tuần tự
    var updateChain = $q.when();

    // Xử lý xóa các rank không còn chọn
    ranksToRemove.forEach(rankId => {
        updateChain = updateChain.then(() => {
            return $http.delete(`https://localhost:7196/api/Giamgia_rank/idgiamgia/${$scope.editingVoucher.id}/idrank/${rankId}`)
                .catch(err => {
                    console.error('Lỗi khi xóa rank:', err);
                    // Vẫn tiếp tục xử lý các thao tác khác dù có lỗi
                    return $q.resolve();
                });
        });
    });

    // Xử lý thêm các rank mới chọn
    ranksToAdd.forEach(rankId => {
        updateChain = updateChain.then(() => {
            var newRelation = {
                iDgiamgia: $scope.editingVoucher.id,
                iDrank: rankId
            };
            return $http.post('https://localhost:7196/api/Giamgia_rank', newRelation)
                .catch(err => {
                    console.error('Lỗi khi thêm rank:', err);
                    return $q.resolve();
                });
        });
    });

    // Cập nhật thông tin voucher chính
    var updatedVoucher = angular.copy($scope.editingVoucher);
      delete updatedVoucher.rankIds; // Xóa trường không cần thiết

      // Chuyển đổi trạng thái sang dạng số
      switch(updatedVoucher.trangthai) {
          case "Đang phát hành":
              updatedVoucher.trangthai = 0;
              break;
          case "Chuẩn bị phát hành":
              updatedVoucher.trangthai = 1;
              break;
          case "Dừng phát hành":
              updatedVoucher.trangthai = 2;
              break;
          default:
              updatedVoucher.trangthai = 1; // Mặc định nếu không khớp
      }

      // Hàm chuyển đổi ngày sang định dạng ISO

      // Chuyển đổi ngày bắt đầu và kết thúc
      updatedVoucher.ngaybatdau = convertToISODate(updatedVoucher.ngaybatdau);
      updatedVoucher.ngayketthuc = convertToISODate(updatedVoucher.ngayketthuc);

      // Chuyển đổi đơn vị giá trị sang dạng số
      updatedVoucher.donvi = updatedVoucher.donvi === "VND" ? 1 : 0;

      $http.put(`https://localhost:7196/api/Giamgia/${updatedVoucher.id}`, updatedVoucher)
    .then(function(response) {
        if (response.status === 200) {
            alert("Cập nhật mã giảm giá thành công!");
            var modal = bootstrap.Modal.getInstance(document.getElementById("editVoucherModal"));
            modal.hide();
            loadVouchers(); // Reload lại danh sách voucher
        } else {
            alert("Cập nhật thất bại. Vui lòng thử lại.");
        }
    })
    .catch(function(err) {
        console.error('Lỗi khi cập nhật:', err);
        alert("Có lỗi xảy ra khi cập nhật!");
    });
};


function convertToISODate(dateString) {
  if (!dateString) return null;
  
  // Kiểm tra nếu đã là định dạng ISO thì giữ nguyên
  if (dateString.includes('T')) return dateString;
  
  // Xử lý định dạng dd/MM/yyyy HH:mm
  const [datePart, timePart] = dateString.split(' ');
  const [day, month, year] = datePart.split('/');
  const [hours, minutes] = timePart.split(':');
  
  return new Date(year, month-1, day, hours, minutes).toISOString();
}



  // Xóa voucher và các quan hệ rank
$scope.deleteVoucher = function(id) {
  if (!confirm("Bạn có chắc chắn muốn xóa mã giảm giá này không?")) {
      return;
  }

  // Tạo promise chain
  var deleteChain = $q.when();

  // 1. Xóa tất cả quan hệ trong Giamgia_rank trước
  deleteChain = deleteChain.then(() => {
      return $http.delete(`https://localhost:7196/api/Giamgia_rank/idgg/${id}`)
          .catch(err => {
              console.error('Lỗi khi xóa quan hệ rank:', err);
              // Vẫn tiếp tục dù có lỗi xóa quan hệ
              return $q.resolve();
          });
  });

  // 2. Xóa voucher chính
  deleteChain = deleteChain.then(() => {
      return $http.delete(`https://localhost:7196/api/Giamgia/${id}`);
  });

  // Xử lý kết quả
  deleteChain.then(() => {
      alert("Đã xóa voucher và các quan hệ thành công!");
      loadVouchers(); // gọi lại hàm load
      $timeout(() => {
          $scope.message = "";
      }, 3000);
  }).catch(err => {
      console.error('Lỗi khi xóa voucher:', err);
      alert("Xóa voucher thất bại! Vui lòng thử lại.");
  });
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
