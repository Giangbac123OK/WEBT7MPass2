app.controller('trahangController', function ($scope, $http, $location, $interval, $timeout ) {
    const userInfoString = localStorage.getItem("userInfo1");
    const userInfo = JSON.parse(userInfoString);
    console.log(userInfo);
    const api = "https://localhost:7196/api/Trahangs"
    $http.get(api)
        .then(function(response){
            $scope.listTraHang = response.data;
            console.log("Data trả hàng: ",$scope.listTraHang)
        })
        .catch(function(error){
            console.error("Lỗi API: ",error);
            Swal.fire({
                icon: 'error',
                title: 'Lỗi hệ thống',
                text: 'Đã xảy ra lỗi. Vui lòng thử lại sau!',
              });
              
        })
    $http.get("https://localhost:7196/api/Hinhanh")
        .then(function(response){
            $scope.listHinhanh = response.data;
            console.log("Data hình ảnh: ",$scope.listHinhanh)
        })
        .catch(function(error){
            console.error("Lỗi API: ",error);
            Swal.fire({
                icon: 'error',
                title: 'Lỗi hệ thống',
                text: 'Đã xảy ra lỗi. Vui lòng thử lại sau!',
              });
              
        })
    $scope.OpenModalXacNhan = function(id){
        $scope.idXacnhan = id;
        $("#XacnhanModal").modal('show');
    }
    $scope.dataTrahang = {}
    $scope.OpenModalChiTiet = function(idth){
        $("#returnDetailModal").modal('show');
        $http.get("https://localhost:7196/api/Trahangs/"+idth)
            .then(function(res){
                $scope.dataTrahang = res.data;
            })
            .catch(function(error) {
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
    $scope.huydon = function(x) {
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
                .then(function(response) {
                    Swal.fire({
                        icon: 'success',
                        title: 'Thông báo',
                        text: 'Hủy trả đơn hàng thành công!',
                    }).then(() => {
                        window.scroll(0,0);
                        location.reload(); // Load lại danh sách nếu có
                    });
                })
                .catch(function(error) {
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
