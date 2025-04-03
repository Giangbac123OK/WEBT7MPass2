app.controller('QuanLyThuocTinhController', function ($scope, $http) {
    $scope.colors = [];

    $http.get("https://localhost:7196/api/Color")
    .then(function (response) {
        $scope.colors = response.data.map(function (color) {
            console.log(response.data);
            console.log(color);
            
            return {
                id : color.id,
                name: color.tenmau,
                colorCode: color.mamau,
                status: color.trangthai,
                isUsedInProduct : color.isUsedInProduct
            };
        });
    }, function (error) {
        console.error("Error fetching colors:", error);
    });
    // Mẫu mới
    $scope.newColor = {
        name: '',
        colorCode: '',
        status: 0
    };

    $scope.editingColor = false;
    //mở modal thêm màu
    $scope.showAddColorModal = function() {
        $scope.newColor = { name: '', colorCode: '', status: 0 };
        $scope.editingColor = false;
        var modal = new bootstrap.Modal(document.getElementById('addColorModal'));
        modal.show();
    };
    //Thêm màu
    $scope.addColor = function() {
        if ($scope.editingColor) {
            $scope.updateColor();
        } else {
            // Gửi yêu cầu POST đến API để thêm màu mới
            $http.post("https://localhost:7196/api/Color", {
                mamau: $scope.newColor.colorCode,
                tenmau: $scope.newColor.name,
                trangthai: $scope.newColor.status
            }).then(function(response) {
                // Nếu thêm màu thành công, thêm vào danh sách màu sắc
                var newColor = response.data; // Dữ liệu trả về từ API chứa id mới của màu
                $scope.colors.push({
                    id: newColor.id,
                    name: newColor.tenmau,
                    colorCode: newColor.mamau,
                    status: newColor.trangthai,
                    isUsedInProduct: newColor.isUsedInProduct
                });
    
                // Reset lại dữ liệu nhập màu
                $scope.newColor = { name: '', colorCode: '', status: 0 };
            }).catch(function(error) {
                console.error("Error adding color:", error);
                alert("Đã có lỗi xảy ra khi thêm màu.");
            });
        }
    };

 
   
    

    // Chỉnh sửa màu
    $scope.editColor = function(color) {
        $scope.newColor = angular.copy(color);
        $scope.editingColor = true;
    };

    // Cập nhật màu
    $scope.updateColor = function() {
        for (var i = 0; i < $scope.colors.length; i++) {
            if ($scope.colors[i].colorCode === $scope.newColor.colorCode) {
                $scope.colors[i] = angular.copy($scope.newColor);
                break;
            }
        }
        $scope.newColor = { name: '', colorCode: '', status: 0 };
        $scope.editingColor = false;
    };

    // Xóa màu
    $scope.deleteColor = function(color) {
        console.log(color);
        
       $http.delete ("https://localhost:7196/api/Color/" + color.id)
        .then(function(response) {
            // Nếu xóa màu thành công, xóa khỏi danh sách màu sắc
            $scope.colors = $scope.colors.filter(function(c) {
                return c.id !== color.id;
            });
        }).catch(function(error) {
            console.error("Error deleting color:", error);
            alert("Đã có lỗi xảy ra khi xóa màu.");
        });


    };

});