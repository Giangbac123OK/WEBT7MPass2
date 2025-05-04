app.controller('trahangController', function ($scope, $http, $location, $interval, $timeout) {
    $scope.counts = {
        all: 0,
        pending: 0,
        confirmed: 0,
        shipping: 0,
        success: 0,
        failed: 0
    };
    const userInfoString = localStorage.getItem("userInfo1");
    const userInfo = JSON.parse(userInfoString);
    $scope.listTraHang = [];
    const api = "https://localhost:7196/api/Trahangs"
    $http.get(api)
        .then(function (response) {
            $scope.listTraHang = response.data;
            console.log("Data trả hàng: ", $scope.listTraHang)
            $scope.updateCounts();
        })
        .catch(function (error) {
            console.error("Lỗi API: ", error);
            Swal.fire({
                icon: 'error',
                title: 'Lỗi hệ thống',
                text: 'Đã xảy ra lỗi. Vui lòng thử lại sau!',
            });

        })

        $scope.updateCounts = function() {
            $scope.counts = {
                all: $scope.listTraHang.length,
                pending: $scope.listTraHang.filter(x => x.trangthai == 0).length,
                confirmed: $scope.listTraHang.filter(x => x.trangthai == 1).length,
                shipping: $scope.listTraHang.filter(x => x.trangthai == 2).length,
                success: 0,
                failed: 0
            };
        };

        $scope.OpenModalXacNhan = function (x) {
            if(x.idkh== null || x.idkh == undefined) {
                Swal.fire({
                    icon: 'error',
                    title: 'Lỗi',
                    text: 'Đơn hàng này không có thông tin khách hàng trên hệ thống hoặc đây là khách vãng lai!',
                });
                return;
            }
            Swal.fire({
                title: 'Bạn muốn xác nhận đơng hàng không?\nChọn một phương án xử lý:',
                html: `
                    <div style="text-align: left;">
                        <label><input type="radio" name="option" value="Trả hàng và hoàn tiền"> Trả hàng và hoàn tiền</label><br>
                        <label><input type="radio" name="option" value="Trả hàng không hoàn tiền"> Trả hàng không hoàn tiền</label><br>
                        <label><input type="radio" name="option" value="Không hoàn tiền và không hoàn hàng"> Không hoàn tiền và không hoàn hàng</label><br>
                        
                        <textarea id="ghichu" class="form-control" placeholder="Nhập chú thích (Nếu có)"></textarea>
                    </div>
                `,
                showCancelButton: true,
                confirmButtonText: 'Xác nhận',
                preConfirm: () => {
                    const selected = document.querySelector('input[name="option"]:checked');
                    const ghichu = document.getElementById('ghichu').value;
                    if (!selected) {
                        Swal.showValidationMessage('Bạn phải chọn một phương án');
                        return false;
                    }
                    return {
                        option: selected.value,
                        note: ghichu
                    };
                }
            }).then((result) => {
                if (result.isConfirmed) {
                    console.log('Phương án đã chọn:', result.value.option);
                    console.log('Ghi chú:', result.value.note);
                    $http({
                        method: 'PUT',
                        url: 'https://localhost:7196/api/Trahangs/Xacnhan',
                        params: {
                            id: x.id,
                            hinhthucxuly: result.value.option,
                            idnv: userInfo.id,
                            chuthich: result.value.note|| null
                        }
                    })
                    .then(function (response) {
                        console.log("Kết quả:", response.data);
                        Swal.fire({
                            icon: 'success',
                            title: 'Xác nhận thành công!',
                            text: `Đơn hàng đã được xác nhận.`,
                        }).then(() => {
                            location.reload();
                            window.scroll(0, 0);
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
        
    };


    $scope.huydon = function (x) {
        var lyDoHuy = prompt("Bạn có chắc chắn muốn hủy đơn hàng này không?\nVui lòng nhập lý do hủy (có thể để trống):");
    
        Swal.fire({
            title: 'Xác nhận hủy đơn hàng?',
            text: "Bạn có chắc chắn muốn hủy đơn hàng này không?",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Xác nhận',
            cancelButtonText: 'Hủy'
        }).then((result) => {
            if (result.isConfirmed) {
                const id = x;
                const idnv = userInfo.id;
                let api = `https://localhost:7196/api/Trahangs/HuyDon?id=${id}&idnv=${idnv}`;
    
                if (lyDoHuy != null && lyDoHuy.trim() !== "") {
                    api = `https://localhost:7196/api/Trahangs/HuyDon?id=${id}&idnv=${idnv}&chuthich=${encodeURIComponent(lyDoHuy)}`;
                }
    
                console.log("API gửi đi:", api);
    
                $http.put(api)
                    .then(function (response) {
                        console.log("Kết quả:", response.data);
                        Swal.fire({
                            icon: 'success',
                            title: 'Hủy đơn thành công!',
                            text: `Đơn hàng đã được hủy.`,
                        }).then(() => {
                            location.reload();
                            window.scroll(0, 0);
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
    
    
});
