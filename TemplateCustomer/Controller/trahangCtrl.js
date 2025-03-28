app.controller("trahangController", function ($http, $scope, $location, $routeParams) {
    $scope.idhd = $routeParams.id;
    console.log($scope.idhd);
    const userInfo = JSON.parse(localStorage.getItem('userInfo'));
    console.log(userInfo);
    // Gọi API để lấy danh sách sản phẩm
    $http.get("https://localhost:7196/api/Trahangchitiets/ListSanPhamByIdhd/" + $scope.idhd)
        .then(function (response) {
            $scope.dataSp = response.data.map(sp => ({
                ...sp,
                maxsoluong: sp.soluong || 0, // Lưu số lượng tối đa từ API
                soluong: 1, // Gán số lượng mặc định là 1
                thanhtien: sp.giasp || 0, // Tính thành tiền ban đầu
                selected: false // Mặc định chưa chọn
            }));
            $scope.tinhTongTien();
            console.log($scope.dataSp)
        })
        .catch(error => console.error(error));

    // Hàm tăng giảm số lượng
    $scope.increase = function (sp) {
        if (sp.soluong < sp.maxsoluong) {
            sp.soluong++;
            sp.thanhtien = sp.soluong * sp.giasp;
            $scope.updateSelectedProduct(sp); // Cập nhật số lượng trong danh sách đã chọn
            $scope.tinhTongTien();
        }
    };
    
    $scope.decrease = function (sp) {
        if (sp.soluong > 1) {
            sp.soluong--;
            sp.thanhtien = sp.soluong * sp.giasp;
            $scope.updateSelectedProduct(sp); // Cập nhật số lượng trong danh sách đã chọn
            $scope.tinhTongTien();
        }
    };
    
    

    // Hàm tính tổng tiền
    $scope.tinhTongTien = function () {
        let total = 0;
        $scope.selectedProducts.forEach(p => {
            let sp = $scope.dataSp.find(item => item.id === p.id);
            if (sp) {
                p.soluong = sp.soluong; // Cập nhật số lượng trong danh sách đã chọn
                total += sp.soluong * sp.giasp;
            }
        });
        $scope.tongtien = total;
        $scope.updateSelectAll(); // Gọi để cập nhật trạng thái "Chọn tất cả"
    };
    
    

    $scope.selectedProducts = []; // Danh sách sản phẩm đã chọn (chứa id và số lượng)

    $scope.toggleProductSelection = function (sp) {
        if (sp.selected) {
            let existingProduct = $scope.selectedProducts.find(p => p.id === sp.id);
            if (!existingProduct) {
                $scope.selectedProducts.push({ id: sp.id, soluong: sp.soluong });
            }
        } else {
            $scope.selectedProducts = $scope.selectedProducts.filter(p => p.id !== sp.id);
        }
        console.log("Danh sách sản phẩm đã chọn:", $scope.selectedProducts);
        $scope.tinhTongTien();
    };
    $scope.updateQuantity = function (sp) {
        if (sp.soluong < 1) {
            sp.soluong = 1; // Không cho số lượng nhỏ hơn 1
        } else if (sp.soluong > sp.maxsoluong) {
            sp.soluong = sp.maxsoluong; // Không cho vượt quá số lượng tối đa
        }
    
        sp.thanhtien = sp.soluong * sp.giasp; // Cập nhật thành tiền
    
        $scope.updateSelectedProduct(sp); // Cập nhật số lượng trong danh sách đã chọn
        $scope.tinhTongTien(); // Cập nhật tổng tiền
    };
        
    

    $scope.toggleAll = function () {
        $scope.selectedProducts = []; // Reset danh sách sản phẩm đã chọn
    
        $scope.dataSp.forEach(sp => {
            sp.selected = $scope.selectAll;
            if ($scope.selectAll) {
                $scope.selectedProducts.push({ id: sp.id, soluong: sp.soluong });
            }
        });
    
        console.log("Danh sách sản phẩm đã chọn:", $scope.selectedProducts);
        $scope.tinhTongTien();
    };

    // Cập nhật trạng thái "Chọn tất cả"
    $scope.updateSelectedProduct = function (sp) {
        let selectedProduct = $scope.selectedProducts.find(p => p.id === sp.id);
        if (selectedProduct) {
            selectedProduct.soluong = sp.soluong; // Cập nhật số lượng
            console.log($scope.selectedProducts)
        }
    };
    
    
    $scope.updateSelectAll = function () {
        $scope.selectAll = $scope.dataSp.every(sp => sp.selected);
    };
    

    // GHN API
    const token = "7b4f1e5c-0700-11f0-94b6-be01e07a48b5"; // Thay bằng token API GHN của bạn
    const shopId = "3846066"; // Thay bằng Shop ID của bạn
    
    $scope.provinces = [];
    $scope.districts = [];
    $scope.wards = [];
    
    // Gọi API lấy danh sách tỉnh/thành phố
    $http.get("https://online-gateway.ghn.vn/shiip/public-api/master-data/province", { headers: { "Token": token } })
        .then(function (response) {
            $scope.provinces = response.data.data;
        })
        .catch(function (error) {
            console.error("Lỗi khi lấy danh sách tỉnh/thành phố:", error);
        });
    
    // Khi chọn tỉnh/thành, lấy danh sách quận/huyện
    $scope.getDistricts = function () {
        if (!$scope.selectedProvince) return;
        
        // Reset danh sách quận/huyện và phường/xã
        $scope.districts = [];
        $scope.wards = [];
        $scope.selectedDistrict = null;
        $scope.selectedWard = null;
        $scope.selectedProvinceName = $scope.provinces.find(p => p.ProvinceID == $scope.selectedProvince)?.ProvinceName || "";

        $http.get("https://online-gateway.ghn.vn/shiip/public-api/master-data/district", {
            headers: { "Token": token },
            params: { province_id: $scope.selectedProvince }
        })
        .then(function (response) {
            $scope.districts = response.data.data;
        })
        .catch(function (error) {
            console.error("Lỗi khi lấy danh sách quận/huyện:", error);
        });
    };

    // Khi chọn quận/huyện, lấy danh sách phường/xã
    $scope.getWards = function () {
        if (!$scope.selectedDistrict) return;
        
        // Reset danh sách phường/xã
        $scope.wards = [];
        $scope.selectedWard = null;
        $scope.selectedDistrictName = $scope.districts.find(d => d.DistrictID == $scope.selectedDistrict)?.DistrictName || "";

        $http.get("https://online-gateway.ghn.vn/shiip/public-api/master-data/ward", {
            headers: { "Token": token },
            params: { district_id: $scope.selectedDistrict }
        })
        .then(function (response) {
            $scope.wards = response.data.data;
        })
        .catch(function (error) {
            console.error("Lỗi khi lấy danh sách phường/xã:", error);
        });
    };

    // Khi chọn phường/xã
    $scope.selectWard = function () {
        $scope.selectedWardName = $scope.wards.find(w => w.WardCode == $scope.selectedWard)?.WardName || "";
        console.log("Phường/Xã đã chọn:", $scope.selectedWardName);
        $scope.calculateEstimatedDelivery();
    };

    // Tính ngày giao dự kiến
    $scope.calculateEstimatedDelivery = function () {
        if (!$scope.selectedProvince || !$scope.selectedDistrict || !$scope.selectedWard) {
            console.error("Vui lòng chọn đầy đủ địa chỉ");
            return;
        }

        let requestData = {
            from_district_id: 1444, // ID quận/huyện nơi gửi hàng
            from_ward_code: "20308", // Mã phường/xã nơi gửi hàng
            to_district_id: $scope.selectedDistrict,
            to_ward_code: $scope.selectedWard,
            service_id: 53320
        };

        let config = {
            headers: {
                "Token": token,
                "ShopId": shopId,
                "Content-Type": "application/json"
            }
        };

        $http.post("https://online-gateway.ghn.vn/shiip/public-api/v2/shipping-order/leadtime", requestData, config)
            .then(function (response) {
                $scope.estimatedDeliveryDate = new Date(response.data.data.leadtime * 1000);
                console.log("Dự kiến ngày giao:", $scope.estimatedDeliveryDate);
            })
            .catch(function (error) {
                console.error("Lỗi khi tính ngày giao:", error);
                $scope.errorMessage = "Không thể tính ngày giao dự kiến.";
            });
    };

    $scope.btnAdd = function () {
        if (!$scope.selectedProducts || $scope.selectedProducts.length === 0) {
            console.error("Chưa có sản phẩm nào!");
            return;
        }

        const data = {
            tenkhachhang: userInfo?.ten || "Không xác định",
            idnv: null,
            idkh: userInfo?.id || null,
            sotienhoan: $scope.tongtien,
            lydotrahang: $scope.description,
            trangthai: 0,
            phuongthuchoantien: $scope.refundMethod,  // Sửa lỗi chỗ này
            ngaytrahangdukien: $scope.estimatedDeliveryDate,
            ngaytrahangthucte: null,
            chuthich: $scope.description // Sửa lỗi chỗ này
        };

        // Bước 1: Gửi dữ liệu trả hàng
        $http.post("https://localhost:7196/api/Trahangs", data)
            .then(() => {
                console.log("Thêm trả hàng thành công!");

                // Bước 2: Gọi API để lấy ID lớn nhất
                return $http.get("https://localhost:7196/api/Trahangs");
            })
            .then(response => {
                if (response.data && response.data.length > 0) {
                    let maxId = Math.max(...response.data.map(item => item.id));
                    console.log("ID lớn nhất:", maxId);

                    // Bước 3: Thêm danh sách sản phẩm vào chi tiết trả hàng
                    let promises = $scope.selectedProducts.map(element => {
                        const datathct = {
                            idth: maxId,
                            soluong: element.soluong,
                            tinhtrang: 0,
                            ghichu: $scope.description, // Sửa lỗi chỗ này
                            idhdct: element.id
                        };
                        return $http.post("https://localhost:7196/api/Trahangchitiets", datathct);
                    });

                    // Chạy tất cả các request POST chi tiết trả hàng
                    return Promise.all(promises).then(() => maxId);
                } else {
                    throw new Error("Không có dữ liệu trả về từ API.");
                }
            })
            .then(maxId => {
                return $http.put(`https://localhost:7196/api/Trahangs/UpdateTrangThaiHd/${$scope.idhd}`)
                    .then(() => {
                        console.log("Cập nhật trạng thái hóa đơn thành công!");
                    });
            })
            .catch(error => {
                console.error("Lỗi:", error);
            });
    };

    $scope.token = "7b4f1e5c-0700-11f0-94b6-be01e07a48b5";
    $scope.shopId = "3846066";

    $scope.provinces = [];
    $scope.districts = [];
    $scope.wards = [];
    $scope.fullAddress = "";
    $scope.estimatedDeliveryDate = null;

    // Thông tin địa chỉ đã chọn
    $scope.selectedInfo = {
        provinceId: null,
        provinceName: "",
        districtId: null,
        districtName: "",
        wardCode: null,
        wardName: ""
    };

    // Lấy danh sách tỉnh/thành phố
    $http.get("https://online-gateway.ghn.vn/shiip/public-api/master-data/province", {
        headers: { "Token": $scope.token }
    })
    .then(response => $scope.provinces = response.data.data)
    .catch(error => console.error("Lỗi lấy tỉnh/thành:", error));

    // Khi chọn tỉnh/thành → Lấy danh sách quận/huyện
    $scope.getDistricts = function () {
        if (!$scope.selectedInfo.provinceId) return;
        $scope.districts = [];
        $scope.wards = [];
        $scope.selectedInfo.districtId = null;
        $scope.selectedInfo.wardCode = null;

        $http.get("https://online-gateway.ghn.vn/shiip/public-api/master-data/district", {
            headers: { "Token": $scope.token },
            params: { province_id: $scope.selectedInfo.provinceId }
        })
        .then(response => $scope.districts = response.data.data)
        .catch(error => console.error("Lỗi lấy quận/huyện:", error));
    };

    // Khi chọn quận/huyện → Lấy danh sách phường/xã
    $scope.getWards = function () {
        if (!$scope.selectedInfo.districtId) return;
        $scope.wards = [];
        $scope.selectedInfo.wardCode = null;

        $http.get("https://online-gateway.ghn.vn/shiip/public-api/master-data/ward", {
            headers: { "Token": $scope.token },
            params: { district_id: $scope.selectedInfo.districtId }
        })
        .then(response => $scope.wards = response.data.data)
        .catch(error => console.error("Lỗi lấy phường/xã:", error));
    };

    // Khi chọn phường/xã, cập nhật địa chỉ và tính ngày giao hàng
    $scope.selectWard = function () {
        $scope.selectedInfo.wardName = $scope.wards.find(w => w.WardCode === $scope.selectedInfo.wardCode)?.WardName || "";
        $scope.selectedInfo.districtName = $scope.districts.find(d => d.DistrictID === $scope.selectedInfo.districtId)?.DistrictName || "";
        $scope.selectedInfo.provinceName = $scope.provinces.find(p => p.ProvinceID === $scope.selectedInfo.provinceId)?.ProvinceName || "";

        $scope.chuthich = `Địa chỉ lấy hàng: ${$scope.fullAddress}, ${$scope.selectedInfo.wardName}, ${$scope.selectedInfo.districtName}, ${$scope.selectedInfo.provinceName}`;
        console.log("Địa chỉ lấy hàng:", $scope.chuthich);

        $scope.calculateEstimatedDelivery();
    };

    // Tính ngày trả hàng dự kiến
    $scope.calculateEstimatedDelivery = function () {
        if (!$scope.selectedInfo.provinceId || !$scope.selectedInfo.districtId || !$scope.selectedInfo.wardCode) {
            console.error("Vui lòng chọn đầy đủ địa chỉ");
            return;
        }

        let requestData = {
            from_district_id: 1444, // Quận nơi gửi hàng
            from_ward_code: "20308", // Phường nơi gửi hàng
            to_district_id: $scope.selectedInfo.districtId,
            to_ward_code: $scope.selectedInfo.wardCode,
            service_id: 53320
        };

        $http.post("https://online-gateway.ghn.vn/shiip/public-api/v2/shipping-order/leadtime", requestData, {
            headers: {
                "Token": $scope.token,
                "ShopId": $scope.shopId,
                "Content-Type": "application/json"
            }
        })
        .then(response => {
            $scope.estimatedDeliveryDate = new Date(response.data.data.leadtime * 1000);
            console.log("Dự kiến ngày giao:", $scope.estimatedDeliveryDate);
        })
        .catch(error => {
            console.error("Lỗi tính ngày giao:", error);
            $scope.errorMessage = "Không thể tính ngày giao dự kiến.";
        });
    };
});
