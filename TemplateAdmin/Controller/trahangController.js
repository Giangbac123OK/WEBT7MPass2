app.controller('trahangController', function ($scope, $http, $location, $interval, $timeout) {
    $scope.counts = {
        all: 0,
        pending: 0,
        confirmed: 0,
        shipping: 0,
        success: 0,
        failed: 0,
    };
    const userInfoString = localStorage.getItem("userInfo1");
    const userInfo = JSON.parse(userInfoString);

    const api = "https://localhost:7196/api/Trahangs"
    $http.get(api)
        .then(function (response) {
            $scope.listTraHang = response.data;
            console.log("Data trả hàng: ", $scope.listTraHang)
        })
        .catch(function (error) {
            console.error("Lỗi API: ", error);
            Swal.fire({
                icon: 'error',
                title: 'Lỗi hệ thống',
                text: 'Đã xảy ra lỗi. Vui lòng thử lại sau!',
            });

        })

        $scope.OpenModalXacNhan = function (id) {
            Swal.fire({
                title: 'Chọn phương thức hoàn tiền',
                html: `
                    <label class="mb-3">
                        <input type="radio" name="refundMethod1" value="Hoàn trả sản phẩm và nhận tiền" /> Hoàn trả sản phẩm và nhận tiền
                    </label>
                    <label class="mb-3">
                        <input type="radio" name="refundMethod1" value="Hoàn tiền không yêu cầu gửi lại sản phẩm" /> Hoàn tiền không yêu cầu gửi lại sản phẩm
                    </label>
                    <textarea class="mb-3 form-control" id="ghichu" placeholder="Ghi chú (nếu có)"></textarea>
                `,
                showCancelButton: true,
                confirmButtonText: 'Xác nhận',
                cancelButtonText: 'Hủy',
                preConfirm: () => {
                    const selectedMethod = $('input[name="refundMethod1"]:checked').val();
                    const ghiChu = $('#ghichu').val();
        
                    if (!selectedMethod) {
                        Swal.showValidationMessage('Vui lòng chọn ít nhất một phương thức hoàn tiền.');
                        return false;
                    }
        
                    return {
                        method1: selectedMethod,
                        ghiChu: ghiChu
                    };
                }
            }).then((result) => {
                if (result.isConfirmed) {
                    const method1 = result.value.method1;
                    const ghiChu = result.value.ghiChu;
        
                    if (!method1) {
                        Swal.fire('Lỗi', 'Phương thức hoàn tiền là bắt buộc!', 'error');
                        return;
                    }
        
                    // Gọi API để lấy số tiền hoàn
                    $http.get("https://localhost:7196/api/Trahangs/" + id)
                        .then(function (response) {
                            const sotienhoan = response.data.sotienhoan;
        
                            // Tạo URL cho yêu cầu PUT
                            let api = `https://localhost:7196/api/Trahangs/Xacnhan?idth=${encodeURIComponent(id)}&hinhthuc=${encodeURIComponent(method1)}&tien=${encodeURIComponent(sotienhoan)}`;
                            if (ghiChu != null && ghiChu !== "") {
                                api += `&ghichu=${encodeURIComponent(ghiChu)}`;
                            }
        
                            // Gửi yêu cầu API để xác nhận
                            return $http.put(api);
                        })
                        .then(function (response) {
                            location.reload(); // Tải lại trang sau khi xác nhận thành công
                            window.scroll(0, 0); // Cuộn lên đầu trang
                            Swal.fire({
                                icon: 'success',
                                title: 'Xác nhận thành công!',
                                text: `Phương thức hoàn tiền: ${method1}`,
                            });
                        })
                        .catch(function (error) {
                            console.error("Lỗi API: ", error);
                            let msg = error.data?.message || "Đã xảy ra lỗi. Vui lòng thử lại sau!";
                            Swal.fire('Lỗi hệ thống', msg, 'error');
                        });
                }
            });
        };
        
        
    $scope.dataTrahang = {}
    $http.get("https://localhost:7196/api/Hinhanh/")
        .then(function (response) {
            $scope.listHinhanh = response.data;
            console.log("Dữ liệu trả hàng: ", $scope.listHinhanh);
        })
        .catch(function (error) {
            console.error("Lỗi API: ", error);
            let msg = error.data?.message || "Đã xảy ra lỗi. Vui lòng thử lại sau!";
            Swal.fire('Lỗi hệ thống', msg, 'error');
        });
    $scope.OpenModalChiTiet = function (idth) {
        // Hiển thị modal
        $("#returnDetailModal").modal('show');

        // Reset dữ liệu cũ
        $scope.dataTrahang = null;
        $scope.detailLoading = true;

        // 1) Lấy thông tin chung của trả hàng
        $http.get(`https://localhost:7196/api/Trahangs/${idth}`)
            .then(function (res) {
                $scope.dataTrahang = res.data;
                // 2) Lấy hình ảnh
                return $http.get(`https://localhost:7196/api/Hinhanh/TraHang/${idth}`);
            })
            .then(function (imgRes) {
                // Gán hình ảnh (nếu có)
                $scope.dataTrahang.hinhanhs = imgRes.data.map(img => {
                    if (img.url && !img.url.startsWith('http')) {
                        img.url = 'https://localhost:7196/' + img.url.replace(/^\/+/, '');
                    }
                    return img;
                });
                // 3) Lấy danh sách sản phẩm trả hàng
                return $http.get(`https://localhost:7196/api/Trahangchitiets/ListSanPhamByIdth/${idth}`);
            })
            .then(function (prodRes) {
                // Gán danh sách chi tiết trả hàng
                // Giả sử ViewModel của bạn có các trường:
                //   urlHinhanh, tensp, mau, size, soluong, lydo
                $scope.dataTrahang.trahangchitiets = prodRes.data.map(item => ({
                    anh: `https://localhost:7196/picture/${item.urlHinhanh}`,
                    tensanpham: item.tensp,
                    mau: item.mau,
                    size: item.size,
                    soluong: item.soluong,
                }));
            })
            .catch(function (error) {
                console.error("Lỗi API: ", error);
                let msg = error.data?.message || "Đã xảy ra lỗi. Vui lòng thử lại sau!";
                Swal.fire('Lỗi hệ thống', msg, 'error');
            })
            .finally(function () {
                $scope.detailLoading = false;
                console.log("$scope.dataTrahang.trahangchitiets: ", $scope.dataTrahang.trahangchitiets);
            });
    };


    $scope.huydon = function (x) {
        let chuthich = prompt("Nhập ghi chú lý do hủy (nếu có):");

        if (x.id == null) {
            Swal.fire({
                icon: 'error',
                title: 'Lỗi',
                text: 'ID không được để trống!',
            });
            return;
        }

        if (parseInt(x.trangthai) != 0) {
            Swal.fire({
                icon: 'error',
                title: 'Lỗi',
                text: 'Hóa đơn này đã được xác nhận hoặc trả hàng thành công!',
            });
            return;
        }

        Swal.fire({
            title: 'Xác nhận hủy đơn',
            text: "Bạn có chắc chắn muốn hủy đơn hàng này không?",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Có, hủy!',
            cancelButtonText: 'Không, quay lại!'
        }).then((result) => {
            if (result.isConfirmed) {
                const data = {
                    id: parseInt(x.id),
                    chuthich: chuthich || ""
                };
                let api = "https://localhost:7196/api/Trahangs/Huydon?id=" + data.id;
                if (data.chuthich != "") {
                    api += "&chuthich=" + encodeURIComponent(data.chuthich);
                }

                $http.put(api)
                    .then(function (response) {
                        Swal.fire({
                            icon: 'success',
                            title: 'Thông báo',
                            text: 'Hủy trả đơn hàng thành công!',
                        }).then(() => {
                            window.scroll(0, 0);
                            location.reload(); // Load lại danh sách nếu có
                        });
                    })
                    .catch(function (error) {
                        console.error("Lỗi API: ", error);
                        let errorMessage = "Đã xảy ra lỗi. Vui lòng thử lại sau!";
                        if (error.data && error.data.message) {
                            errorMessage = error.data.message;
                        }

                        Swal.fire({
                            icon: 'error',
                            title: 'Lỗi hệ thống',
                            text: errorMessage,
                        });
                    });
            }
        });
    };
});
