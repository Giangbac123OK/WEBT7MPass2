app.controller('nhanvienController', function ($scope, $http, $location, $interval, $timeout) {
    // Hàm lấy thứ trong tuần bằng tiếng Việt
    function getVietnameseDay(dayIndex) {
        const days = ["Chủ Nhật", "Thứ Hai", "Thứ Ba", "Thứ Tư", "Thứ Năm", "Thứ Sáu", "Thứ Bảy"];
        return days[dayIndex];
    }

    // Hàm cập nhật thời gian
    function updateTime() {
        var now = new Date();
        var dayOfWeek = getVietnameseDay(now.getDay());
        var day = String(now.getDate()).padStart(2, '0');
        var month = String(now.getMonth() + 1).padStart(2, '0'); // Tháng bắt đầu từ 0
        var year = now.getFullYear();
        var hours = String(now.getHours()).padStart(2, '0');
        var minutes = String(now.getMinutes()).padStart(2, '0');
        var seconds = String(now.getSeconds()).padStart(2, '0');

        $scope.time = `${dayOfWeek}, ${day}/${month}/${year} - ${hours}:${minutes}:${seconds}`;
    }

    // Cập nhật mỗi giây
    $interval(updateTime, 1000);
    let api ="https://localhost:7196/api/Nhanviens";
    // Chạy ngay khi trang tải
    updateTime();
    function LoadData(){
        $http.get(api)
            .then(function(response) {
                $scope.listNhanVien = response.data;
                console.log($scope.listNhanVien);
            })
            .catch(function(error) {
                console.error(error);
            });
    }
    LoadData();
    $scope.loiTuoi = false;

    $scope.kiemTraTuoi = function () {
        if (!$scope.add.ngaysinh) {
            $scope.loiTuoi = false;
            return;
        }

        const namHienTai = new Date().getFullYear();
        const namSinh=new Date($scope.add.ngaysinh).getFullYear();
        $scope.loiTuoi = (namHienTai - namSinh) < 18;
    };
    $scope.loiEmail = false;
    $scope.kiemTraEmail = function () {
        if (!$scope.add.email) {
            $scope.loiEmail = false;
            return;
        }

        // Nếu tìm thấy email trùng, thì có lỗi
        const trungEmail = $scope.listNhanVien.find(x => x.email === $scope.add.email);
        $scope.loiEmail = trungEmail ? true : false;
    };
    $scope.loiSdt = false;

    $scope.kiemTraSdt = function () {
        if (!$scope.add.sdt) {
            $scope.loiSdt = false;
            return;
        }

        const sdtNhap = $scope.add.sdt.toString();
        const trungSdt = $scope.listNhanVien.find(x => x.sdt.toString() === sdtNhap);

    $scope.loiSdt = !!trungSdt;
    };
    var cropper;
    var modalEl = document.getElementById('cropModal');
    var bootstrapModal = new bootstrap.Modal(modalEl);
    $scope.croppedDataUrl = null;

    $scope.openCropModal = function () {
      document.getElementById('imageInput').value = "";
      document.getElementById('imagePreview').src = "";
      if (cropper) {
        cropper.destroy();
        cropper = null;
      }
      bootstrapModal.show();
    };

    document.getElementById('imageInput').addEventListener('change', function (e) {
      var file = e.target.files[0];
      if (!file) return;

      var reader = new FileReader();
      reader.onload = function (evt) {
        var image = document.getElementById('imagePreview');
        image.src = evt.target.result;

        image.onload = function () {
          if (cropper) cropper.destroy();
          cropper = new Cropper(image, {
            aspectRatio: 1,
            viewMode: 1
          });
        };
      };
      reader.readAsDataURL(file);
    });

    $scope.cropImage = function () {
      if (!cropper) {
        Swal.fire({
            icon: 'error',
            title: 'Lỗi',
            text: 'Vui lòng chọn ảnh trước khi cắt!'
        });
        return;
      }

      var canvas = cropper.getCroppedCanvas({
        width: 300,
        height: 300
      });

      $timeout(function () {
        $scope.croppedDataUrl = canvas.toDataURL('image/png');
        
        if ($scope.update) {
            $scope.update.avatar = $scope.croppedDataUrl;
        }
    
        bootstrapModal.hide();
    
        // Hiện lại modal cập nhật
        $('#UpdateModal').modal('show');
    });
      console.log($scope.croppedDataUrl)
      bootstrapModal.hide();
    };

    $scope.removeImage = function () {
        $scope.croppedDataUrl = null;
        if ($scope.update) {
            $scope.update.avatar = null;
        }
    };
    $scope.nhanvien={}
    $scope.btnAdd = function () {
        $scope.kiemTraTuoi();
        $scope.kiemTraEmail();
        $scope.kiemTraSdt();
        // Nếu form lỗi hoặc tuổi không hợp lệ → dừng lại
        if ($scope.frmAdd.$invalid || $scope.loiTuoi) {
            angular.forEach($scope.frmAdd.$error, function (field) {
                angular.forEach(field, function (errorField) {
                    errorField.$setTouched();
                });
            });
            return;
        }
    
        // Chuẩn bị dữ liệu
        const data = {
            id: 0,
            hovaten: $scope.add.hoten,
            ngaysinh: $scope.add.ngaysinh,
            diachi: $scope.add.diachi,
            gioitinh: $scope.add.gioitinh === "true", // convert string to boolean
            sdt: $scope.add.sdt,
            email: $scope.add.email,
            trangthai: 0,
            password: $scope.add.password,
            role: parseInt($scope.add.role), // convert string to number
            ngaytaotaikhoan: new Date().toISOString(),
            avatar: $scope.croppedDataUrl || ""
        };
    
        // Kiểm tra log dữ liệu trước khi gửi
        console.log("Dữ liệu gửi đi:", data);
    
        // Xác nhận trước khi gửi
        Swal.fire({
            title: 'Xác nhận',
            text: 'Bạn có chắc chắn muốn thêm nhân viên này?',
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Thêm',
            cancelButtonText: 'Hủy'
        }).then((result) => {
            if (result.isConfirmed) {
                $http.post(api, data)
                    .then(function () {
                        location.reload();
                        window.scrollTo(0, 0);
    
                        // Reset form
                        $scope.add = {};
                        $scope.frmAdd.$setPristine();
                        $scope.frmAdd.$setUntouched();
    
                        Swal.fire({
                            icon: 'success',
                            title: 'Đã thêm',
                            text: 'Nhân viên đã được thêm thành công!',
                            timer: 2000,
                            showConfirmButton: false
                        });
                    })
                    .catch(function (error) {
                        console.error("Chi tiết lỗi:", error.data);
    
                        let errorMsg = "Không thể thêm nhân viên. Vui lòng thử lại!";
                        if (error.data && error.data.errors) {
                            // Lấy lỗi đầu tiên (nếu có nhiều)
                            const firstField = Object.keys(error.data.errors)[0];
                            errorMsg = error.data.errors[firstField][0];
                        } else if (error.data && error.data.title) {
                            errorMsg = error.data.title;
                        }
    
                        Swal.fire({
                            icon: 'error',
                            title: 'Thất bại',
                            text: errorMsg
                        });
                    });
            }
        });
    };
    $scope.btnDelete = function (id) {
       
        Swal.fire({
            title: 'Xác nhận',
            text: 'Bạn có chắc chắn muốn xóa nhân viên này?',
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Xóa',
            cancelButtonText: 'Hủy'
        }).then((result) => {
            if (result.isConfirmed) {
                $http.delete(api+"/"+id)
                    .then(function () {
                        location.reload();
                        window.scrollTo(0, 0);
    
                        Swal.fire({
                            icon: 'success',
                            title: 'Đã xóa',
                            text: 'Nhân viên đã xóa thành công!',
                            timer: 2000,
                            showConfirmButton: false
                        });
                    })
                    .catch(function (error) {
                        console.error("Chi tiết lỗi:", error.data);
    
                        let errorMsg = "Không thể xóa nhân viên. Vui lòng thử lại!";
                        if (error.data && error.data.errors) {
                            // Lấy lỗi đầu tiên (nếu có nhiều)
                            const firstField = Object.keys(error.data.errors)[0];
                            errorMsg = error.data.errors[firstField][0];
                        } else if (error.data && error.data.title) {
                            errorMsg = error.data.title;
                        }
    
                        Swal.fire({
                            icon: 'error',
                            title: 'Thất bại',
                            text: errorMsg
                        });
                    });
            }
        });
    };
    $scope.showDetail = function (nhanvien) {
        $scope.detail = angular.copy(nhanvien);
        const modal = new bootstrap.Modal(document.getElementById('staticBackdrop'));
        modal.show();
    };
    $scope.showUpdate = function (nv) {
        $scope.update = angular.copy(nv);

        // Kiểm tra nếu dữ liệu từ backend là chuỗi
        if (typeof nv.gioitinh === "string") {
            $scope.update.gioitinh = nv.gioitinh === "Nam";
        }

        if (typeof nv.trangthai === "string") {
            $scope.update.trangthai = nv.trangthai === "Hoạt động" ? 0 : 1;
        }
        if (typeof nv.role === "string") {
            $scope.update.role = nv.role === "Quản lý" ? 0 : 1;
        }
        $scope.croppedDataUrl=nv.avatar
        $scope.update.ngaysinh = new Date(nv.ngaysinh);

        const modal = new bootstrap.Modal(document.getElementById('UpdateModal'));
        modal.show();
    };

    
    $scope.btnUpdate = function () {
        
        if ($scope.frmUpdate.$invalid || $scope.loiTuoiUpdate) {
            angular.forEach($scope.frmUpdate.$error, function (field) {
                angular.forEach(field, function (errorField) {
                    errorField.$setTouched();
                });
            });
            return;
        }
        
        const dataUpdate = {
            id: $scope.update.id,
            hovaten: $scope.update.hovaten,
            ngaysinh: $scope.update.ngaysinh,
            diachi: $scope.update.diachi,
            gioitinh: $scope.update.gioitinh,
            sdt: $scope.update.sdt,
            email: $scope.update.email,
            trangthai: $scope.update.trangthai,
            password: $scope.update.password,
            role: $scope.update.role,
            ngaytaotaikhoan: $scope.update.ngaytaotaikhoan,
            avatar: $scope.update.avatar
        };
        Swal.fire({
            title: 'Xác nhận',
            text: 'Bạn có chắc muốn cập nhật thông tin?',
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Cập nhật',
            cancelButtonText: 'Hủy'
        }).then((result) => {
            if (result.isConfirmed) {
                $http.put(api + "/" + $scope.update.id, dataUpdate)
                    .then(function () {
                        $('#UpdateModal').modal('hide');
                        location.reload();
    
                        Swal.fire({
                            icon: 'success',
                            title: 'Cập nhật thành công',
                            timer: 2000,
                            showConfirmButton: false
                        });
                    })
                    .catch(function (error) {
                        console.error(error);
                        Swal.fire({
                            icon: 'error',
                            title: 'Lỗi cập nhật',
                            text: 'Vui lòng thử lại!'
                        });
                    });
            }
        });
    };
    
});
