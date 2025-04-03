app.controller('QuanLySanPhamController', function ($scope) {
    $scope.categories = ['Bàn ăn', 'Ghế sofa', 'Tủ quần áo'];
    $scope.colors = [{ id: 1, name: 'Đỏ' }, { id: 2, name: 'Xanh' }, { id: 3, name: 'Vàng' }];
    $scope.sizes = [{ id: 1, name: 'S' }, { id: 2, name: 'M' }, { id: 3, name: 'L' }];
    $scope.chatlieus = [{ id: 1, name: 'Gỗ' }, { id: 2, name: 'Kim loại' }, { id: 3, name: 'Nhựa' }];

    $scope.product = {
        name: '',
        quantity: 0,
        price: 0,
        category: '',
        trangthai: true,
        variants: []
    };

    // Tạo biến thể mới khi mở modal
    $scope.newVariant = {};
    $scope.getColorName = function(id) {
        let color = $scope.colors.find(c => c.id === id);
        return color ? color.name : 'Không xác định';
    };
    
    $scope.getSizeName = function(id) {
        let size = $scope.sizes.find(s => s.id === id);
        return size ? size.name : 'Không xác định';
    };
    
    $scope.getMaterialName = function(id) {
        let material = $scope.chatlieus.find(cl => cl.id === id);
        return material ? material.name : 'Không xác định';
    };
    

    // Xử lý ảnh
    $scope.handleFileSelect = function (event) {
        var file = event.target.files[0];
        if (file) {
            var reader = new FileReader();
            reader.onload = function (e) {
                $scope.$applyAsync(() => {
                    $scope.newVariant.imagePreview = e.target.result;
                });
            };
            reader.readAsDataURL(file);
        }
    };
    $scope.isPriceFieldVisible = false;
    // Hiển thị modal thêm biến thể
    $scope.showAddVariantModal = function () {
        $scope.newVariant = {
            status :0
        }; // Reset biến thể mới
        $scope.isPriceFieldVisible = false; // Ẩn trường nhập liệu giá
        var modal = new bootstrap.Modal(document.getElementById('addVariantModal'));
        modal.show();
    };
    // Hiển thị modal sửa biến thể
    $scope.showEditVariantModal = function (variant) {
        $scope.newVariant = angular.copy(variant); // Sao chép biến thể để sửa
        $scope.isPriceFieldVisible = true; // Hiển thị trường nhập liệu giá
        var modal = new bootstrap.Modal(document.getElementById('addVariantModal'));
        modal.show();
    };

    // Thêm biến thể vào danh sách
    $scope.saveVariant = function () {
        if (!$scope.newVariant.idmau || !$scope.newVariant.idsize || !$scope.newVariant.soluong || !$scope.newVariant.Giathoidiemhientai) {
            alert("Vui lòng điền đầy đủ thông tin!");
            return;
        }
        // Kiểm tra xem biến thể đã tồn tại chưa
        var existingVariant = $scope.product.variants.find(v => v.idmau === $scope.newVariant.idmau && v.idsize === $scope.newVariant.idsize);
        if (existingVariant) {
            alert("Biến thể đã tồn tại!");
            $scope.newVariant = {
                status :0
            }; // Reset form
            return;

        }
        $scope.product.variants.push(angular.copy($scope.newVariant));
        $scope.newVariant = {}; // Reset form
       console.log($scope.product.variants);
       
        $scope.isPriceFieldVisible = false;
        // Đóng modal
        var modal = bootstrap.Modal.getInstance(document.getElementById('addVariantModal'));
        modal.hide();
    };

    // Xóa biến thể
    $scope.removeVariant = function (index) {
        $scope.product.variants.splice(index, 1);
    };

        // Hàm để chuyển đổi trạng thái hiển thị trường nhập liệu
        $scope.togglePriceField = function() {
            $scope.isPriceFieldVisible = true;
          };
        
          // Hàm để ẩn trường nhập liệu khi nhấn "Xóa"
          $scope.hidePriceField = function() {
            $scope.isPriceFieldVisible = false;
          };
    // Lưu sản phẩm
    $scope.saveProduct = function () {
        if (!$scope.product.name || !$scope.product.quantity || !$scope.product.price || !$scope.product.category) {
            alert("Vui lòng điền đầy đủ thông tin sản phẩm!");
            return;
        }
        // Lưu sản phẩm vào cơ sở dữ liệu hoặc xử lý theo cách bạn muốn
        console.log("Sản phẩm đã được lưu:", $scope.product);
        alert("Sản phẩm đã được lưu thành công!");
        // Reset form
        $scope.product = {
            name: '',
            quantity: 0,
            price: 0,
            category: '',
            trangthai: true,
            variants: []
        };
    };
});
