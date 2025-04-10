app.controller('nhanvienController', function ($scope, $http, $location, $interval, $timeout ) {
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

    // Chạy ngay khi trang tải
    updateTime();
    function LoadData() {
        $http.get("https://localhost:7196/api/Nhanviens")
            .then(function (response) {
                // Lọc bỏ user hiện tại khỏi danh sách
                $scope.listNhanVien = response.data.filter(function(nhanvien) {
                    return nhanvien.id !== userInfo.id;
                });
                console.log('Danh sách nhân viên (đã lọc):', $scope.listNhanVien);
            })
            .catch(function (error) {
                console.error('Lỗi khi tải dữ liệu nhân viên:', error);
                Swal.fire('Lỗi', 'Không thể tải danh sách nhân viên', 'error');
            });
    }
    
    // Khởi tạo userInfo từ localStorage
    const userInfoString = localStorage.getItem("userInfo1");
    const userInfo = JSON.parse(userInfoString);
    LoadData();
    $scope.getMaxYear = function () {
        const today = new Date();
        const maxDate = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate()); // Trừ đúng 18 năm từ hôm nay
        return maxDate.toISOString().split("T")[0]; // Chuyển về yyyy-mm-dd
    };

    
    $scope.add = {}; // Khởi tạo nếu chưa có

    $scope.add.avatarFile = "";

    // Hàm preview ảnh modal thêm
    $scope.previewAvatar = function (file) {
        if (file && file.type && file.type.startsWith('image/')) {
            const imageUrl = URL.createObjectURL(file);
            $timeout(function () {
                document.getElementById('imagePreview').style.backgroundImage = 'url(' + imageUrl + ')';
            });
    
            file.previewUrl = imageUrl;
            $scope.add.avatarFile = file;
        } else {
            document.getElementById('imagePreview').style.backgroundImage = '';
            $scope.add.avatarFile = null;
        }
    };         

    // Hàm preview ảnh mặc định modal thêm
    $scope.setDefaultAvatar = function (type) {
        const defaultUrl = "https://i.pinimg.com/736x/11/5e/8a/115e8a22e7ee37d2c662d1a1714a90bf.jpg";
        $timeout(function () {
            document.getElementById('imagePreview').style.backgroundImage = 'url(' + defaultUrl + ')';
        });
    
        const defaultAvatar = {
            isDefault: true,
            previewUrl: defaultUrl
        };
    
        if (type === 'add') {
            $scope.add.avatarFile = defaultAvatar;
        } else if (type === 'edit') {
            $scope.edit.avatarFile = defaultAvatar;
        }
    };           

    // Hàm thêm nhân viên
    $scope.btnAdd = function () {
        if ($scope.AddNhanVienfrm.$invalid) {
            angular.forEach($scope.AddNhanVienfrm.$error, function (fields) {
                angular.forEach(fields, function (field) {
                    field.$setTouched();
                });
            });
            return;
        }
    
        if ($scope.listNhanVien.find(x => x.sdt === $scope.add.sdt)) {
            Swal.fire({ title: "Lỗi", text: "Số điện thoại đã tồn tại!", icon: "error" });
            return;
        }
    
        if ($scope.listNhanVien.find(x => x.email === $scope.add.email)) {
            Swal.fire({ title: "Lỗi", text: "Email đã tồn tại!", icon: "error" });
            return;
        }
    
        Swal.fire({
            title: "Xác nhận",
            text: "Bạn có chắc chắn muốn thêm nhân viên này?",
            icon: "question",
            showCancelButton: true,
            confirmButtonText: "Đồng ý",
            cancelButtonText: "Hủy"
        }).then((result) => {
            if (result.isConfirmed) {
                var formData = new FormData();
                formData.append('hovaten', $scope.add.hovaten);
                formData.append('ngaysinh', new Date($scope.add.ngaysinh).toISOString());
                formData.append('diachi', $scope.add.diachi);
                formData.append('gioitinh', $scope.add.gioitinh);
                formData.append('sdt', $scope.add.sdt);
                formData.append('email', $scope.add.email);
                formData.append('chucvu', $scope.add.chucvu);
                formData.append('password', $scope.add.password);
                formData.append('trangthai', 0);
    
                if ($scope.add.avatarFile && !$scope.add.avatarFile.isDefault) {
                    formData.append('avatarFile', $scope.add.avatarFile);
                }
    
                $http.post('https://localhost:7196/api/Nhanviens', formData, {
                    transformRequest: angular.identity,
                    headers: { 'Content-Type': undefined }
                }).then(function (response) {
                    const result = response.data;
                    if (response.status === 200) {
                        Swal.fire({
                            title: "Thành công",
                            text: result.Message || "Thêm nhân viên thành công!",
                            icon: "success"
                        });
    
                        $('#ThemNVModal').modal('hide');
                        LoadData();
                        location.reload();
                        window.scroll(0,0);
                        $scope.add = {};
                        $scope.AddNhanVienfrm.$setPristine();
                        $scope.AddNhanVienfrm.$setUntouched();
                    } else {
                        Swal.fire({
                            title: "Lỗi",
                            text: result.Message || "Có lỗi xảy ra khi thêm nhân viên",
                            icon: "error"
                        });
                    }
                }).catch(function (error) {
                    Swal.fire({
                        title: "Lỗi",
                        text: error.data?.Message || error.Message || "Có lỗi xảy ra",
                        icon: "error"
                    });
                });
            }
        });
    };    

    $scope.edit = {}; // Khởi tạo
    $scope.edit.avatarFile = ""; // Mặc định chưa có ảnh

    $scope.previewAvataredit = function (file) {
        if (file && file.type && file.type.startsWith('image/')) {
            const imageUrl = URL.createObjectURL(file);
            $timeout(function () {
                document.getElementById('editimagePreviewf').style.backgroundImage = 'url(' + imageUrl + ')';
            });
    
            file.previewUrl = imageUrl;
            $scope.edit.avatarFile = file;
        } else {
            document.getElementById('editimagePreviewf').style.backgroundImage = '';
            $scope.edit.avatarFile = null;
        }
    };

    // Hàm preview ảnh mặc định modal thêm
    $scope.setDefaultAvataredit = function (type) {
        const defaultUrl = "https://i.pinimg.com/736x/11/5e/8a/115e8a22e7ee37d2c662d1a1714a90bf.jpg";
        $timeout(function () {
            document.getElementById('editimagePreviewf').style.backgroundImage = 'url(' + defaultUrl + ')';
        });
    
        const defaultAvatar = {
            isDefault: true,
            previewUrl: defaultUrl
        };
    
        if (type === 'add') {
            $scope.add.avatarFile = defaultAvatar;
        } else if (type === 'edit') {
            $scope.edit.avatarFile = defaultAvatar;
        }
    };   

    $scope.showEdit = function (id) {
        $scope.isEditing = true;
    
        $http.get("https://localhost:7196/api/Nhanviens/" + id)
            .then(function (response) {
                $scope.edit = response.data;
                $scope.edit.ngaysinh = new Date($scope.edit.ngaysinh);
                $scope.edit.gioitinh = $scope.edit.gioitinh ? 'true' : 'false';
                $scope.edit.chucvu = $scope.edit.role.toString(); // Convert number to string
                
                const existingImageUrl = 'https://localhost:7196/picture/' + ($scope.edit.avatar);
                $timeout(function () {
                    const previewElement = document.getElementById('editimagePreviewf');
                    previewElement.style.backgroundImage = 'url(' + existingImageUrl + ')';
                    
                    // Hide avatar edit button if it's the default image
                    const avatarEditBtn = document.getElementById('avatar-edit-modal');
                    if (avatarEditBtn) {
                        avatarEditBtn.style.display = ($scope.edit.avatar === 'AnhNhanVien.png') ? 'none' : 'block';
                    }
                });
                console.log("$scope.edit", $scope.edit)
            })
            .catch(function (error) {
                console.error(error);
            });
    };
    
    $scope.btnEdit = function () {
        console.log('Dữ liệu edit trước khi gửi:', $scope.edit);
        var formData = new FormData();
    
        formData.append("Id", $scope.edit.id);
        formData.append("Hovaten", $scope.edit.hovaten);
        formData.append("Ngaysinh", new Date($scope.edit.ngaysinh).toISOString());
        formData.append("Diachi", $scope.edit.diachi);
        formData.append("Gioitinh", $scope.edit.gioitinh === 'true'); // boolean
        formData.append("Sdt", $scope.edit.sdt);
        formData.append("Email", $scope.edit.email);
        formData.append("Role", $scope.edit.chucvu);
    
        // Xử lý ảnh:
        if ($scope.edit.avatarFile && !$scope.edit.avatarFile.isDefault) {
            formData.append("avatarFile", $scope.edit.avatarFile);
        }
    
        // Nếu là ảnh mặc định
        if ($scope.edit.avatarFile && $scope.edit.avatarFile.isDefault) {
            formData.append("avatar", $scope.edit.avatarFile.previewUrl);
        }
    
        $http.put("https://localhost:7196/api/Nhanviens/" + $scope.edit.id, formData, {
            transformRequest: angular.identity,
            headers: { 'Content-Type': undefined }
        }).then(function (res) {
            Swal.fire({
                title: "Thành công",
                text: res.data.message,
                icon: "success"
            }).then((result) => {
                if (result.isConfirmed) {
                    $('#EditNVModal').modal('hide');
                    location.reload();
                    window.scroll(0,0);
                }
            });
        }).catch(function (error) {
            Swal.fire("Lỗi", error.data.message, "error");
        });
    };
    $scope.viewImage = function (avatarFileName) {
        $scope.currentImage = 'https://localhost:7196/picture/' + (avatarFileName || 'AnhNhanVien.png');
    };
    $scope.delete = function(nv){
        $http.put("https://localhost:7196/api/Nhanviens/delete/" + nv.id)
        .then(function (res) {
            Swal.fire({
                title: "Thành công",
                text: res.data.message,
                icon: "success"
            }).then((result) => {
                if (result.isConfirmed) {
                    location.reload();
                    window.scroll(0,0);
                }
            });
            }).catch(function (error) {
                Swal.fire("Lỗi", error.data.message, "error");
            });
    }
});
