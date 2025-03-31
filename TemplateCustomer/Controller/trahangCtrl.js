app.controller("trahangController", function ($http, $scope, $location, $routeParams) {
    $scope.idhd = $routeParams.id;
    console.log($scope.idhd);
    const userInfo = JSON.parse(localStorage.getItem('userInfo'));
    console.log(userInfo);

    // Initialize variables
    $scope.selectedProducts = []; // Danh sách sản phẩm đã chọn
    $scope.images = []; // Mảng lưu trữ ảnh
    $scope.imageCount = 0;
    $scope.token = "7b4f1e5c-0700-11f0-94b6-be01e07a48b5";
    $scope.shopId = "3846066";
    $scope.provinces = [];
    $scope.districts = [];
    $scope.wards = [];
    $scope.fullAddress = "";
    $scope.estimatedDeliveryDate = null;
    $scope.ListNganHang = [];

    // Thông tin địa chỉ đã chọn
    $scope.selectedInfo = {
        provinceId: null,
        provinceName: "",
        districtId: null,
        districtName: "",
        wardCode: null,
        wardName: ""
    };

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

    // ========== GHN API Functions ==========
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

    // ========== Image Handling Functions ==========
    // Mở file picker khi click vào box "Thêm hình ảnh"
    $scope.openFileInput = function () {
        document.getElementById("fileInput").click();
    };

    // Xử lý chọn ảnh từ thư viện
    $scope.selectImages = function (event) {
        if (!$scope.images) $scope.images = [];
        const files = event.target.files;

        if ($scope.images.length >= 3) {
            alert("Bạn chỉ có thể chọn tối đa 3 ảnh!");
            event.target.value = '';
            return;
        }

        for (let i = 0; i < files.length; i++) {
            if ($scope.images.length >= 3) break;

            const file = files[i];
            const objectURL = URL.createObjectURL(file); // Lấy URL trực tiếp

            $scope.$apply(() => {
                $scope.images.push({
                    url: objectURL,
                    file: file
                });
                $scope.imageCount = $scope.images.length;
            });
        }

        event.target.value = '';
    };

    // Xóa ảnh đã chọn
    $scope.removeImage = function (index) {
        URL.revokeObjectURL($scope.images[index].url); // Giải phóng URL blob
        $scope.images.splice(index, 1);
        $scope.imageCount = $scope.images.length;
    };

    // Bật camera
    let videoStream = null;
    $scope.startCamera = function () {
        let video = document.getElementById("cameraFeed");

        navigator.mediaDevices.getUserMedia({ video: true })
            .then(function (stream) {
                video.srcObject = stream;
                videoStream = stream;
            })
            .catch(function (error) {
                console.error("Không thể truy cập camera!", error);
            });
    };

    // Chụp ảnh từ camera
    $scope.capturePhoto = function () {
        if ($scope.images.length >= 3) {
            alert("Bạn chỉ có thể chọn tối đa 3 ảnh!");
            return;
        }

        let video = document.getElementById("cameraFeed");
        let canvas = document.getElementById("cameraCanvas");
        let context = canvas.getContext("2d");

        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0, canvas.width, canvas.height);

        canvas.toBlob((blob) => {
            const objectURL = URL.createObjectURL(blob);

            $scope.$apply(() => {
                $scope.images.push({
                    url: objectURL,
                    file: blob
                });
                $scope.imageCount = $scope.images.length;
            });
        }, 'image/png', 0.9); // Lưu ảnh dưới dạng PNG

        // Tắt camera sau khi chụp
        if (videoStream) {
            let tracks = videoStream.getTracks();
            tracks.forEach(track => track.stop());
            video.srcObject = null;
        }

        // Đóng modal sau khi chụp
        setTimeout(() => {
            document.querySelector("#cameraModal .btn-close").click();
        }, 500);
    };

    // Hàm upload ảnh
    function uploadImages(idtrahang) {
        if (!$scope.images || $scope.images.length === 0) {
            alert("Vui lòng chọn ít nhất một ảnh!");
            return Promise.reject("Không có ảnh để upload");
        }

        $scope.isUploading = true;
        let successCount = 0;
        let failedCount = 0;
        const uploadResults = [];

        // Xử lý tuần tự từng ảnh
        const processImagesSequentially = async () => {
            for (let index = 0; index < $scope.images.length; index++) {
                const imageData = $scope.images[index];

                try {
                    const result = await processSingleImage(imageData, index, idtrahang);
                    uploadResults.push(result);
                    successCount++;
                    console.log(`Upload ảnh ${index + 1}/${$scope.images.length} thành công`);
                } catch (error) {
                    failedCount++;
                    console.error(`Lỗi khi upload ảnh ${index + 1}:`, error);
                    uploadResults.push({ success: false, index: index, error: error });
                }
            }

            return { total: $scope.images.length, success: successCount, failed: failedCount, results: uploadResults };
        };

        // Hàm xử lý upload từng ảnh
        const processSingleImage = (imageData, index, idtrahang) => {
            return new Promise((resolve, reject) => {
                const canvas = document.createElement('canvas');
                const img = new Image();

                img.onload = function () {
                    canvas.width = img.width;
                    canvas.height = img.height;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0);

                    // Chuyển đổi sang PNG
                    canvas.toBlob((blob) => {
                        const formData = new FormData();
                        const fileName = `image_${idtrahang}_${Date.now()}_${index}.png`;

                        formData.append('file', blob, fileName);
                        formData.append('idtrahang', idtrahang);
                        formData.append('Iddanhgia', 0);
                        formData.append('Urlhinhanh', fileName);

                        $http.post('https://localhost:7196/api/Hinhanh', formData, {
                            headers: { 'Content-Type': undefined },
                            transformRequest: angular.identity
                        })
                            .then(response => {
                                resolve({ success: true, index: index, fileName: fileName, response: response.data });
                            })
                            .catch(error => {
                                reject(error);
                            });
                    }, 'image/png', 0.9); // Lưu ảnh dưới dạng PNG
                };

                img.onerror = () => reject(new Error("Không thể tải ảnh"));
                img.src = imageData.url;
            });
        };

        return processImagesSequentially().finally(() => {
            $scope.$apply(() => {
                $scope.isUploading = false;
            });
        });
    }

    // ========== Bank List ==========
    $http.get("https://api.vietqr.io/v2/banks")
        .then(function (response) {
            if (response.data && response.data.data) {
                $scope.ListNganHang = response.data.data;
                console.log("Danh sách ngân hàng:", $scope.ListNganHang);
            } else {
                console.log("Dữ liệu ngân hàng không hợp lệ:", response);
            }
        })
        .catch(function (error) {
            console.error("Lỗi khi lấy danh sách ngân hàng:", error);
        });
    // ========== Submit Function ==========
    $scope.btnAdd = function () {
        let errorMessages = [];

        // Kiểm tra từng trường và thêm lỗi vào danh sách
        if (!$scope.selectedProducts || $scope.selectedProducts.length === 0) {
            errorMessages.push("Vui lòng chọn ít nhất một sản phẩm.");
        }
        if (!$scope.description) {
            errorMessages.push("Vui lòng nhập lý do trả hàng.");
        }
        if (!$scope.selectedInfo.provinceId || !$scope.selectedInfo.districtId || !$scope.selectedInfo.wardCode || !$scope.fullAddress) {
            errorMessages.push("Vui lòng nhập đầy đủ địa chỉ hàng.");
        }
        if (!$scope.refundMethod) {
            errorMessages.push("Vui lòng chọn phương thức hoàn tiền.");
        }
        if (!$scope.images || $scope.images.length === 0) {
            errorMessages.push("Vui lòng tải lên ít nhất một hình ảnh làm bằng chứng.");
        }
        if ($scope.refundMethod === 'bank' && (!$scope.bankName || !$scope.accountNumber)) {
            errorMessages.push("Vui lòng nhập ngân hàng & số tài khoản.");
        }

        // Nếu có lỗi, hiển thị tất cả bằng Swal.fire
        if (errorMessages.length > 0) {
            Swal.fire("Lỗi!", errorMessages.join("<br>"), "error");
            return;
        }
    
        Swal.fire({
            title: "Xác nhận trả hàng?",
            text: "Bạn có chắc chắn muốn gửi yêu cầu trả hàng không?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "Có, gửi yêu cầu!",
            cancelButtonText: "Hủy"
        }).then((result) => {
            if (!result.isConfirmed) return;
    
            // 1. Chuẩn bị dữ liệu trả hàng
            const data = {
                tenkhachhang: userInfo?.ten || "Không xác định",
                idnv: null,
                idkh: userInfo.id,
                sotienhoan: $scope.tongtien,
                lydotrahang: $scope.description,
                trangthai: 0,
                phuongthuchoantien: $scope.refundMethod,
                ngaytrahangdukien: $scope.estimatedDeliveryDate,
                ngaytrahangthucte: null,
                chuthich: null,
                hinhthucxuly: $scope.refundMethod
            };
    
            // 2. Gửi dữ liệu trả hàng
            $http.post("https://localhost:7196/api/Trahangs", data)
                .then(() => {
                    console.log("Thêm trả hàng thành công!");
                    return $http.get("https://localhost:7196/api/Trahangs");
                })
                .then(response => {
                    if (!response.data || response.data.length === 0) {
                        throw new Error("Không có dữ liệu trả về từ API.");
                    }
    
                    const maxId = Math.max(...response.data.map(item => item.id));
                    console.log("ID lớn nhất:", maxId);
    
                    // 3. Thêm chi tiết trả hàng
                    return Promise.all(
                        $scope.selectedProducts.map(element => {
                            const datathct = {
                                idth: maxId,
                                soluong: element.soluong,
                                tinhtrang: 0,
                                ghichu: $scope.description,
                                idhdct: element.id
                            };
                            return $http.post("https://localhost:7196/api/Trahangchitiets", datathct);
                        })
                    ).then(() => maxId); // Trả về maxId sau khi hoàn thành chi tiết
                })
                .then(maxId => {
                    // 4. Upload ảnh nếu có
                    if ($scope.images && $scope.images.length > 0) {
                        return uploadImages(maxId).then(() => maxId);
                    }
                    return maxId;
                })
                .then(() => {
                    // 5. Cập nhật trạng thái hóa đơn
                    return $http.put(`https://localhost:7196/api/Trahangs/UpdateTrangThaiHd/${$scope.idhd}`);
                })
                .then(() => {
                    console.log("Xử lý trả hàng hoàn tất!");
                    Swal.fire("Đã gửi!", "Yêu cầu trả hàng của bạn đã được gửi thành công.", "success")
                        .then(() => $location.path("/donhangcuaban"));
                })
                .catch(error => {
                    console.error("Lỗi trong quá trình xử lý:", error);
                    Swal.fire("Thất bại!", "Đã xảy ra lỗi khi gửi yêu cầu. Vui lòng thử lại sau.", "error");
                });
        });
    };
    
});