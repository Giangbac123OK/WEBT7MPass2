app.controller('QuanLyThuocTinhController', function ($scope, $http) {
    $scope.colors = [];
    $scope.getALlMau = function () {
        $http.get("https://localhost:7196/api/Color")
            .then(function (response) {
                $scope.colors = response.data.map(function (color) {
                    console.log(response.data);
                    console.log(color);

                    return {
                        id: color.id,
                        name: color.tenmau,
                        colorCode: color.mamau,
                        status: color.trangthai,
                        isUsedInProduct: color.isUsedInProduct
                    };
                });
            }, function (error) {
                console.error("Error fetching colors:", error);
            });
    }
    // Mẫu mới
    $scope.newColor = {
        name: '',
        colorCode: '',
        status: 0
    };
    $scope.editingColor = false;
    //mở modal thêm màu
    $scope.showAddColorModal = function () {
        $scope.newColor = { name: '', colorCode: '', status: 0 };
        $scope.editingColor = false;
        var modal = new bootstrap.Modal(document.getElementById('addColorModal'));
        modal.show();
    };
    //Thêm màu
    $scope.addColor = function () {
        if ($scope.editingColor) {
            $scope.updateColor();
        } else {
            // Gửi yêu cầu POST đến API để thêm màu mới
            $http.post("https://localhost:7196/api/Color", {
                mamau: $scope.newColor.colorCode,
                tenmau: $scope.newColor.name,
                trangthai: $scope.newColor.status
            }).then(function (response) {
                $scope.getALlMau();
                // Reset lại dữ liệu nhập màu
                $scope.newColor = { name: '', colorCode: '', status: 0 };
            }).catch(function (error) {
                console.error("Error adding color:", error);
                alert("Đã có lỗi xảy ra khi thêm màu.");
            });
        }
    };
    //Chỉnh sửa màu
    $scope.editColor = function (color) {
        $scope.newColor = angular.copy(color);
        $scope.editingColor = true;
        console.log("Màu sửa", color);

    };
    $scope.duplicateName = false;
    $scope.duplicateColorCode = false;
    $scope.checkDuplicateColor = function () {
        $scope.duplicateName = $scope.colors.some(color => color.name.toLowerCase() === $scope.newColor.name.toLowerCase());
        $scope.duplicateColorCode = $scope.colors.some(color => color.colorCode.toLowerCase() === $scope.newColor.colorCode.toLowerCase());
    };
    //Cập nhật màu
    $scope.updateColor = function () {
        $http.put("https://localhost:7196/api/Color/" + $scope.newColor.id, {
            mamau: $scope.newColor.colorCode,
            tenmau: $scope.newColor.name,
            trangthai: $scope.newColor.status
        }).then(function (response) {
            // Reset lại dữ liệu nhập màu
            $scope.getALlMau();
            $scope.newColor = { name: '', colorCode: '', status: 0 };
            $scope.editingColor = false;
            // Đóng modal sau khi cập nhật
            var modal = bootstrap.Modal.getInstance(document.getElementById('addColorModal'));
            if (modal) {
                modal.hide();
            }
            alert("Cập nhật màu thành công!");
        }).catch(function (error) {
            console.error("Error updating color:", error);
            alert("Đã có lỗi xảy ra khi cập nhật màu.");
        });


        $scope.editingColor = false;
    };
    //Xóa màu
    $scope.deleteColor = function (color) {
        console.log(color);
        // Hiển thị hộp thoại xác nhận trước khi xóa
        if (!confirm("Bạn có chắc chắn muốn xóa màu này không?")) {
            return;
        }

        $http.delete("https://localhost:7196/api/Color/" + color.id)
            .then(function (response) {
                alert("Xóa màu thành công!");
                $scope.getALlMau();
            }).catch(function (error) {
                console.error("Error deleting color:", error);
                alert("Đã có lỗi xảy ra khi xóa màu.");
            });


    };
    $scope.getALlMau();

    $scope.chatLieus = [];
    $scope.newChatLieu = { tenchatlieu: '', trangthai: 0 };
    $scope.editingChatLieu = false;
    $scope.formError = {}; // Lưu lỗi validation

    //Lấy danh sách chất liệu
    $scope.getChatLieus = function () {
        $http.get("https://localhost:7196/api/ChatLieu").then(function (response) {
            $scope.chatLieus = response.data.map(function (cl) {
                return {
                    id: cl.id,
                    tenchatlieu: cl.tenchatlieu.toLowerCase(), // Chuyển về chữ thường để kiểm tra trùng
                    trangthai: cl.trangthai
                };
            });
        }, function (error) {
            alert("Lỗi khi lấy danh sách chất liệu!");
            console.error(error);
        });
    };

    //Reset modal
    $scope.resetChatLieu = function () {
        $scope.newChatLieu = { tenchatlieu: '', trangthai: 0 };
        $scope.editingChatLieu = false;
        $scope.formError = {};
    };

    //Kiểm tra dữ liệu hợp lệ
    $scope.validateChatLieu = function () {
        let ten = ($scope.newChatLieu.tenchatlieu || "").trim(); // Kiểm tra null/undefined
        if (!ten) {
            $scope.formError.tenchatlieu = "Tên chất liệu không được để trống!";
        } else if (ten.length < 2) {
            $scope.formError.tenchatlieu = "Tên chất liệu phải có ít nhất 2 ký tự!";
        } else if (ten.length > 50) {
            $scope.formError.tenchatlieu = "Tên chất liệu không được vượt quá 50 ký tự!";
        } else if ($scope.chatLieus.some(cl => cl.tenchatlieu === ten.toLowerCase() && cl.id !== $scope.newChatLieu.id)) {
            $scope.formError.tenchatlieu = "Tên chất liệu đã tồn tại!";
        } else {
            $scope.formError.tenchatlieu = null;
        }
    };
    //Thêm chất liệu
    $scope.addChatLieu = function () {
        $scope.validateChatLieu();
        if ($scope.formError.tenchatlieu) return;

        $http.post("https://localhost:7196/api/ChatLieu", {
            tenchatlieu: $scope.newChatLieu.tenchatlieu,
            trangthai: $scope.newChatLieu.trangthai
        }).then(function () {
            $scope.getChatLieus(); // Lấy lại danh sách mới
            $scope.resetChatLieu();
        }, function (error) {
            alert("Lỗi khi thêm chất liệu!");
            console.error(error);
        });
    };
    //Sửa chất liệu
    $scope.editChatLieu = function (cl) {
        $scope.newChatLieu = angular.copy(cl);
        $scope.editingChatLieu = true;
    };
    //Cập nhật chất liệu
    $scope.updateChatLieu = function () {
        $scope.validateChatLieu();
        if ($scope.formError.tenchatlieu) return;

        $http.put("https://localhost:7196/api/ChatLieu/" + $scope.newChatLieu.id, {
            tenchatlieu: $scope.newChatLieu.tenchatlieu,
            trangthai: $scope.newChatLieu.trangthai
        }).then(function () {
            $scope.getChatLieus(); // Lấy lại danh sách mới
            $scope.resetChatLieu();
        }, function (error) {
            alert("Lỗi khi cập nhật chất liệu!");
            console.error(error);
        });
    };
    //Xóa chất liệu
    $scope.deleteChatLieu = function (id) {
        if (confirm("Bạn có chắc muốn xóa chất liệu này?")) {
            $http.delete("https://localhost:7196/api/ChatLieu/" + id).then(function () {
                $scope.getChatLieus(); // Lấy lại danh sách mới
            }, function (error) {
                alert("Lỗi khi xóa chất liệu!");
                console.error(error);
            });
        }
    };
    $scope.getChatLieus();
    
    $scope.sizes = [];
    $scope.newSize = { sosize: '', trangthai: 0 };
    $scope.editingSize = false;
    $scope.formError1 = {};
    $scope.getSizes = function () {
        $http.get("https://localhost:7196/api/Size").then(function (response) {
            $scope.sizes = response.data.map(function (size) {
                return {
                    id: size.id,
                    sosize: size.sosize,
                    trangthai: size.trangthai
                };
            });
        }, function (error) {
            console.error("Lỗi khi lấy danh sách size:", error);
        });
    };
    $scope.resetSize = function () {
        $scope.newSize = { sosize: '', trangthai: 0 };
        $scope.editingSize = false;
        $scope.formError1 = {};
    };
    $scope.validateSize = function () {
        let size = $scope.newSize.sosize;
        if (!size) {
            $scope.formError.sosize = "Số size không được để trống!";
        } else if (size < 30 || size > 50) {
            $scope.formError1.sosize = "Số size phải từ 30 đến 50!";
        } else if ($scope.sizes.some(s => s.sosize == size && s.id !== $scope.newSize.id)) {
            $scope.formError1.sosize = "Số size đã tồn tại!";
        } else {
            $scope.formError1.sosize = null;
        }
    };
    $scope.addSize = function () {
        $scope.validateSize();
        if ($scope.formError1.sosize) return;

        $http.post("https://localhost:7196/api/Size", {
            sosize: $scope.newSize.sosize,
            trangthai: $scope.newSize.trangthai
        }).then(function (response) {
            $scope.sizes.push(response.data);
            alert("Thêm size thành công!");
            $scope.getSizes(); // Lấy lại danh sách mới
            $scope.resetSize();
        }, function (error) {
            console.error("Lỗi khi thêm size:", error);
        });
    };
    $scope.editSize = function (size) {
        $scope.newSize = angular.copy(size);
        $scope.editingSize = true;
        console.log("Size sửa", size);
        
    };
    $scope.updateSize = function () {
        $scope.validateSize();
        if ($scope.formError1.sosize) return;

        $http.put("https://localhost:7196/api/Size/" + $scope.newSize.id, {
            sosize: $scope.newSize.sosize,
            trangthai: $scope.newSize.trangthai
        }).then(function () {
            alert("Cập nhật size thành công!");
            $scope.getSizes(); // Lấy lại danh sách mới
            $scope.editingSize = false;
            $scope.resetSize();
        }, function (error) {
            console.error("Lỗi khi cập nhật size:", error);
        });
    };
    $scope.deleteSize = function (id) {
        if (confirm("Bạn có chắc muốn xóa size này?")) {
            $http.delete("https://localhost:7196/api/Size/" + id).then(function () {
                alert("Xóa size thành công!");
                $scope.getSizes(); // Lấy lại danh sách mới
            }, function (error) {
                console.error("Lỗi khi xóa size:", error);
            });
        }
    };
    $scope.getSizes();


});