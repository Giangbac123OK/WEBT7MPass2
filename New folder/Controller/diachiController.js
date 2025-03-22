app.controller('diachiController', function ($scope, $http) {
    const userInfo = JSON.parse(localStorage.getItem('userInfo'));
    if (!userInfo || !userInfo.id) {
        console.error("Không tìm thấy thông tin người dùng!");
        return;
    }
    
    let idkh = userInfo.id;
    const apiUrl = "https://localhost:7196/api/Khachhangs/";
    const host = "https://provinces.open-api.vn/api/";
    
    $scope.cities = [];
    $scope.districts = [];
    $scope.wards = [];
    $scope.add = {};
    $scope.edit = {};
    
    function loadCities() {
        axios.get(host + '?depth=1').then(response => {
            $scope.$apply(() => {
                $scope.cities = response.data;
            });
        });
    }
    loadCities();
    
    $scope.loadDistricts = function () {
        if ($scope.selectedCity) {
            axios.get(`${host}p/${$scope.selectedCity.code}?depth=2`).then(response => {
                $scope.$apply(() => {
                    $scope.districts = response.data.districts;
                    $scope.wards = [];
                    $scope.selectedDistrict = null;
                    $scope.selectedWard = null;
                });
            });
        }
    };
    
    $scope.loadWards = function () {
        if ($scope.selectedDistrict) {
            axios.get(`${host}d/${$scope.selectedDistrict.code}?depth=2`).then(response => {
                $scope.$apply(() => {
                    $scope.wards = response.data.wards;
                    $scope.selectedWard = null;
                });
            });
        }
    };
    
    function loadDiaChi() {
        $http.get(`https://localhost:7196/api/Diachi/khachhang/${idkh}`)
            .then(function (response) {
                $scope.dataDiachi = response.data;
            })
            .catch(function (error) {
                console.error("Lỗi khi lấy dữ liệu:", error);
            });
    }
    loadDiaChi();
    
    $scope.openAddModal = function () {
        $scope.add = {};
        $scope.selectedCity = null;
        $scope.selectedDistrict = null;
        $scope.selectedWard = null;
        $scope.districts = [];
        $scope.wards = [];
        loadCities();
        $("#AddAddressModal").modal("show");
    };
    $scope.openAddModalWithReload = function () {
        $scope.add = {};
        $scope.selectedCity = null;
        $scope.selectedDistrict = null;
        $scope.selectedWard = null;
        $scope.districts = [];
        $scope.wards = [];
        
        // Gọi API để load lại danh sách tỉnh/thành phố
        loadCities();
        
        $("#AddAddressModal").modal("show");
    };
    
    $scope.AddBtn = function () {
        swal.fire({
            title: "Bạn có chắc chắn?",
            text: "Dữ liệu sẽ được thêm mới!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: " Xác nhận",
            cancelButtonText: "Hủy"
        }).then((result) => {
            if (result.isConfirmed) {
        
                let data = {
                    idkh: idkh,
                    tennguoinhan: $scope.add.tennguoinhan,
                    sdtnguoinhan: $scope.add.sdtnguoinhan,
                    thanhpho: $scope.selectedCity.name,
                    quanhuyen: $scope.selectedDistrict.name,
                    phuongxa: $scope.selectedWard.name,
                    diachicuthe: $scope.add.diachicuthe,
                    trangthai: $scope.add.trangthai
                };
                $http.post("https://localhost:7196/api/Diachi", data)
                    .then(function () {
                        swal.fire({
                            title: "Thêm thành công!",
                            text: "Thông tin khách hàng đã được thêm mới.",
                            icon: "success",
                            confirmButtonText: "OK"
                        });
                        $("#AddAddressModal").modal("hide");
                        loadDiaChi();
                    })
                    .catch(function (error) {
                        console.error("Lỗi khi gửi dữ liệu:", error);swal.fire({
                            title: "Lỗi!",
                            text: "Có lỗi xảy ra khi thêm mới. Vui lòng thử lại!",
                            icon: "error",
                            confirmButtonText: "OK"
                        });
                    });
            }
        });
        
    };
    
    $scope.LoadviewEdit = function (id) {
        $http.get(`https://localhost:7196/api/Diachi/${id}`)
            .then(function (response) {
                $scope.edit = response.data;
                
                $scope.selectedCity = $scope.cities.find(city => city.name === $scope.edit.thanhpho);
                if ($scope.selectedCity) {
                    axios.get(`${host}p/${$scope.selectedCity.code}?depth=2`).then(response => {
                        $scope.$apply(() => {
                            $scope.districts = response.data.districts;
                            $scope.selectedDistrict = $scope.districts.find(d => d.name === $scope.edit.quanhuyen);
                            if ($scope.selectedDistrict) {
                                axios.get(`${host}d/${$scope.selectedDistrict.code}?depth=2`).then(response => {
                                    $scope.$apply(() => {
                                        $scope.wards = response.data.wards;
                                        $scope.selectedWard = $scope.wards.find(w => w.name === $scope.edit.phuongxa);
                                    });
                                });
                            }
                        });
                    });
                }
                
                $("#EditAddressModal").modal("show");
            })
            .catch(function (error) {
                console.error("Lỗi khi lấy dữ liệu:", error);
            });
    };
    
    $scope.EditBtn = function (id) {
        swal.fire({
            title: "Bạn có chắc chắn?",
            text: "Dữ liệu sẽ được cập nhật!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "Xác nhận",
            cancelButtonText: "Hủy"
        }).then((result) => {
            if (result.isConfirmed) {
                if (!$scope.edit.tennguoinhan || !$scope.edit.sdtnguoinhan || !$scope.selectedCity || !$scope.selectedDistrict || !$scope.selectedWard || !$scope.edit.diachicuthe) {
                    swal.fire({
                        title: "Lỗi!",
                        text: "Có lỗi xảy ra khi cập nhật. Vui lòng điền đẩy đủ thông tin!",
                        icon: "error",
                        confirmButtonText: "OK"
                    });
                    return;
                }
        
                let data = {
                    id: id,
                    idkh: userInfo.id,
                    tennguoinhan: $scope.edit.tennguoinhan,
                    sdtnguoinhan: $scope.edit.sdtnguoinhan,
                    thanhpho: $scope.selectedCity.name,
                    quanhuyen: $scope.selectedDistrict.name,
                    phuongxa: $scope.selectedWard.name,
                    diachicuthe: $scope.edit.diachicuthe,
                    trangthai: $scope.edit.trangthai
                };
        
                $http.put(`https://localhost:7196/api/Diachi/${id}`, data)
                    .then(function () {
                        swal.fire({
                            title: "Cập nhật thành công!",
                            text: "Thông tin khách hàng đã được cập nhật.",
                            icon: "success",
                            confirmButtonText: "OK"
                        });
                        $("#EditAddressModal").modal("hide");
                        loadDiaChi();
                    })
                    .catch(function (error) {
                        console.error("Lỗi khi cập nhật:", error);
                        swal.fire({
                            title: "Lỗi!",
                            text: "Có lỗi xảy ra khi cập nhật. Vui lòng thử lại!",
                            icon: "error",
                            confirmButtonText: "OK"
                        });
                    });
            }
        });
        
    };
    
    $scope.DeleteBtn = function (id) {

        $http.delete(`https://localhost:7196/api/Diachi/${id}`)
            .then(function () {
                swal.fire({
                    title: "Xoá thành công!",
                    text: "Thông tin khách hàng đã được xóa.",
                    icon: "success",
                    confirmButtonText: "OK"
                });
                loadDiaChi();
            })
            .catch(function (error) {
                console.error("Lỗi khi xóa:", error);
                swal.fire({
                    title: "Lỗi!",
                    text: "Có lỗi xảy ra khi cập nhật. Vui lòng thử lại!",
                    icon: "error",
                    confirmButtonText: "OK"
                });
            });
    };  
    $scope.MacDinhBtn = function (id) {
        swal.fire({
            title: "Bạn có chắc chắn?",
            text: "Dữ liệu sẽ được cập nhật!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "Xác nhận",
            cancelButtonText: "Hủy"
        }).then((result) => {
            if (result.isConfirmed) {$http.get(`https://localhost:7196/api/Diachi/${id}`)
                .then(function (response) {
                    let dataMacDinh = {
                        id: response.data.id,
                        idkh: response.data.idkh,
                        tennguoinhan: response.data.tennguoinhan,
                        sdtnguoinhan: response.data.sdtnguoinhan,
                        thanhpho: response.data.thanhpho,
                        quanhuyen: response.data.quanhuyen,
                        phuongxa: response.data.phuongxa,
                        diachicuthe: response.data.diachicuthe,
                        trangthai: "Mặc định"
                    };
        
                    return $http.put(`https://localhost:7196/api/Diachi/${id}`, dataMacDinh);
                })
                .then(function () {
                    swal.fire({
                        title: "Cập nhật thành công!",
                        text: "Thông tin khách hàng đã được cập nhật.",
                        icon: "success",
                        confirmButtonText: "OK"
                    });
                    loadDiaChi(); // Load lại danh sách địa chỉ sau khi cập nhật
                })
                .catch(function (error) {
                    console.error("Lỗi khi cập nhật:", error);
                    swal.fire({
                        title: "Lỗi!",
                        text: "Có lỗi xảy ra khi cập nhật. Vui lòng thử lại!",
                        icon: "error",
                        confirmButtonText: "OK"
                    });
                });
            }
        });
    
        
    };
    $scope.customSort = function (item) {
        return item.trangthai === "Mặc định" ? 0 : 1;
    };
        
    
});
