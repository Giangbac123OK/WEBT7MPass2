app.controller('diachiController', function($scope, $http) {
    $scope.dataDiachi = [];

    // Danh sách tỉnh/thành
    $scope.tinhList = [];
    $scope.quanList = [];
    $scope.phuongList = [];
    $scope.edit = { thanhpho: '', quanhuyen: '', phuongxa: '' };

    // Load danh sách tỉnh/thành
    $http.get('https://esgoo.net/api-tinhthanh/1/0.htm')
        .then(function(response) {
            if (response.data.error === 0) {
                $scope.tinhList = response.data.data;
            }
        })
        .catch(function(error) {
            console.error('Lỗi khi tải danh sách tỉnh/thành:', error);
        });

    // Load quận/huyện theo tỉnh/thành
    $scope.loadQuanHuyen = function(thanhpho, callback) {
        if (!thanhpho) {
            $scope.quanList = [];
            return;
        }
        $http.get(`https://esgoo.net/api-tinhthanh/2/${thanhpho}.htm`)
            .then(function(response) {
                if (response.data.error === 0) {
                    $scope.quanList = response.data.data;
                }
                if (callback) callback();
            })
            .catch(function(error) {
                console.error('Lỗi khi tải danh sách quận/huyện:', error);
            });
    };

    // Load phường/xã theo quận/huyện
    $scope.loadPhuongXa = function(quanhuyen, callback) {
        if (!quanhuyen) {
            $scope.phuongList = [];
            return;
        }
        $http.get(`https://esgoo.net/api-tinhthanh/3/${quanhuyen}.htm`)
            .then(function(response) {
                if (response.data.error === 0) {
                    $scope.phuongList = response.data.data;
                }
                if (callback) callback();
            })
            .catch(function(error) {
                console.error('Lỗi khi tải danh sách phường/xã:', error);
            });
    };
    // Load địa chỉ của khách hàng
    function loadDiaChi() {
        $http.get("http://localhost:36106/api/Diachi/khachhang/1")
            .then(function(response) {
                $scope.dataDiachi = response.data;
            })
            .catch(function(error) {
                console.error("Lỗi khi lấy dữ liệu:", error);
            });
    }
    loadDiaChi();

    // Xóa địa chỉ
    $scope.DeleteBtn = function(id) {
        Swal.fire({
            title: "Bạn có chắc chắn?",
            text: "Dữ liệu này sẽ bị xóa và không thể khôi phục!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            cancelButtonColor: "#3085d6",
            confirmButtonText: "Xóa!",
            cancelButtonText: "Hủy"
        }).then((result) => {
            if (result.isConfirmed) {
                $http.delete("http://localhost:36106/api/Diachi/" + id)
                    .then(function() {
                        Swal.fire("Đã xóa!", "Địa chỉ của bạn đã bị xóa.", "success");
                        loadDiaChi();
                    })
                    .catch(function(error) {
                        console.error("Lỗi khi xóa dữ liệu:", error);
                        Swal.fire("Lỗi!", "Không thể xóa địa chỉ. Vui lòng thử lại!", "error");
                    });
            }
        });
    };

    // Thêm địa chỉ mới
    $scope.AddBtn = function() {
        let dataAdd = {
            idkh: 1,
            tennguoinhan: $scope.add.tennguoinhan,
            sdtnguoinhan: $scope.add.sdtnguoinhan,
            thanhpho: $scope.add.thanhpho,
            quanhuyen: $scope.add.quanhuyen,
            phuongxa: $scope.add.phuongxa,
            diachicuthe: $scope.add.diachicuthe
        };

        Swal.fire({
            title: "Bạn có chắc chắn?",
            text: "Bạn có muốn thêm địa chỉ mới không?",
            icon: "question",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            cancelButtonColor: "#3085d6",
            confirmButtonText: "Lưu!",
            cancelButtonText: "Hủy"
        }).then((result) => {
            if (result.isConfirmed) {
                $http.post("http://localhost:36106/api/Diachi", dataAdd)
                    .then(function() {
                        Swal.fire("Thêm thành công!", "Địa chỉ của bạn đã được thêm.", "success");
                        loadDiaChi();
                        $('#AddAddressModal').modal('hide');
                    })
                    .catch(function(error) {
                        console.error("Lỗi khi thêm dữ liệu:", error);
                        Swal.fire("Lỗi!", "Không thể thêm địa chỉ. Vui lòng thử lại!", "error");
                    });
            }
        });
    };

    // Hàm mở modal cập nhật địa chỉ
    $scope.LoadviewEdit = function(id) {
        $scope.edit = { thanhpho: '', quanhuyen: '', phuongxa: '' };
        $scope.quanList = [];
        $scope.phuongList = [];
        
        $http.get("http://localhost:36106/api/Diachi/" + id)
            .then(function(response) {
                $scope.edit = response.data;
                console.log("Dữ liệu địa chỉ:", $scope.edit);

                // Load danh sách quận/huyện và phường/xã tương ứng
                $scope.loadQuanHuyen($scope.edit.thanhpho, function() {
                    $scope.loadPhuongXa($scope.edit.quanhuyen, function() {
                        $('#EditAddressModal').modal('show');
                    });
                });
            })
            .catch(function(error) {
                console.error("Lỗi khi lấy dữ liệu địa chỉ:", error);
            });
    };
    

    // Cập nhật địa chỉ
    $scope.EditBtn = function(id) {
        Swal.fire({
            title: "Bạn có chắc chắn?",
            text: "Bạn có muốn sửa địa chỉ mới không?",
            icon: "question",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            cancelButtonColor: "#3085d6",
            confirmButtonText: "Lưu!",
            cancelButtonText: "Hủy"
        }).then((result) => {
            if (result.isConfirmed) {
                $http.put("http://localhost:36106/api/Diachi/" + id, $scope.edit)
                    .then(function() {
                        Swal.fire("Sửa thành công!", "Địa chỉ của bạn đã được sửa.", "success");
                        loadDiaChi();
                        $('#EditAddressModal').modal('hide');
                    })
                    .catch(function(error) {
                        console.error("Lỗi khi sửa dữ liệu:", error);
                        Swal.fire("Lỗi!", "Không thể sửa địa chỉ. Vui lòng thử lại!", "error");
                    });
            }
        });
    };
});
