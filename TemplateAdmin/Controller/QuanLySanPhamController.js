app.controller('QuanLySanPhamController', function ($scope, $http, $location, $timeout) {
    $scope.categories = [];
    $scope.colors = [];
    $scope.sizes = [];
    $scope.chatlieus = [];
    $scope.product = {
        tenSanpham: "",
        mota: "",
        trangthai: 0,
        soluong: 0,
        giaBan: null,
        ngayThemMoi: new Date().toISOString(),
        chieudai: null,
        chieurong: null,
        trongluong: null,
        Chieucao: null,
        idth: 0
    };
    $scope.products = []; // Danh sách sản phẩm
    $scope.product.variants = []; // Danh sách biến thể của sản phẩm

    $scope.loadProducts = function () {
        $http.get("https://localhost:7196/api/Sanphams")
            .then(function (response) {
                $scope.products = response.data;

                $scope.products.forEach(function (product) {
                    // Gọi API lấy biến thể từng sản phẩm
                    $http.get("https://localhost:7196/api/Sanphamchitiets/sanpham/" + product.id)
                        .then(function (res) {
                            product.variants = res.data;
                            product.image = product.variants.length > 0
                                ? product.variants[0].urlHinhanh
                                : 'default-image.jpg';
                        })
                        .catch(function () {
                            product.image = 'default-image.jpg';
                        });
                });
                console.log($scope.products);

            });
    };
    $scope.loadCategories = function () {
        $http.get("https://localhost:7196/api/Thuonghieu")
            .then(function (response) {
                $scope.categories = response.data;
                console.log($scope.categories);

            })
            .catch(function (error) {
                console.error("Lỗi khi tải danh sách thương hiệu:", error);
            }
            );
    }
    $scope.loadColors = function () {
        $http.get("https://localhost:7196/api/Color")
            .then(function (response) {
                $scope.colors = response.data;
                console.log($scope.colors);
            })
            .catch(function (error) {
                console.error("Lỗi khi tải danh sách màu sắc:", error);
            });
    };
    $scope.loadSizes = function () {
        $http.get("https://localhost:7196/api/Size")
            .then(function (response) {
                $scope.sizes = response.data;
                console.log($scope.sizes);
            })
            .catch(function (error) {
                console.error("Lỗi khi tải danh sách kích thước:", error);
            });
    }
    $scope.loadChatlieus = function () {
        $http.get("https://localhost:7196/api/Chatlieu")
            .then(function (response) {
                $scope.chatlieus = response.data;
                console.log($scope.chatlieus);
            })
            .catch(function (error) {
                console.error("Lỗi khi tải danh sách chất liệu:", error);
            });
    }
    $scope.loadColors();
    $scope.loadSizes();
    $scope.loadChatlieus();
    $scope.loadCategories();
    $scope.loadProducts();

    // Tạo biến thể mới khi mở modal
    $scope.newVariant = {};
    $scope.getColorName = function (id) {
        let color = $scope.colors.find(c => c.id === id);
        return color ? color.tenmau : 'Không xác định';
    };

    $scope.getSizeName = function (id) {
        let size = $scope.sizes.find(s => s.id === id);
        return size ? size.sosize : 'Không xác định';
    };
    $scope.getCategoriesName = function (id) {
        let categories = $scope.categories.find(s => s.id === id);
        return categories ? categories.tenthuonghieu : 'Không xác định';
    };
    $scope.getMaterialName = function (id) {
        let material = $scope.chatlieus.find(cl => cl.id === id);
        return material ? material.tenchatlieu : 'Không xác định';
    };
    // Xử lý ảnh
    $scope.handleFileSelect = function (event, variantType) {
        var file = event.target.files[0];
        if (file) {
            var reader = new FileReader();
            reader.onload = function (e) {
                $scope.$applyAsync(() => {
                    $scope[variantType].UrlHinhanh = e.target.result; // Hiển thị ảnh base64
                    $scope[variantType].file = file; // File gốc để gửi lên API
                    console.log("Đã chọn file:", file); // Debug log
                });
            };
            reader.readAsDataURL(file);
        }
    };


    $scope.isPriceFieldVisible = false;

    $scope.saveProduct = function () {
        if ($scope.frm.$valid) {
            $http.post("https://localhost:7196/api/Sanphams", $scope.product)
                .then(function (response) {
                    const createdProduct = response.data;
                    const productId = createdProduct.id;
                    console.log("✅ Sản phẩm đã được lưu:", createdProduct);

                    // Gửi từng biến thể dưới dạng FormData
                    let promises = [];
                    for (let variant of $scope.product.variants) {
                        variant.Idsp = productId;

                        let formData = new FormData();
                        for (let key in variant) {
                            if (key !== 'file' && key !== 'UrlHinhanh') { // Không gửi base64
                                formData.append(key, variant[key]);
                            }
                        }
                        if (variant.file) {
                            formData.append("file", variant.file); // Gửi file thật
                        }
                        let promise = $http.post("https://localhost:7196/api/Sanphamchitiets", formData, {
                            headers: { 'Content-Type': undefined }
                        })
                            .then(function (response) {
                                console.log("✅ Biến thể đã được lưu:", response.data);
                            })
                            .catch(function (error) {
                                console.error("❌ Lỗi khi lưu biến thể:", error);
                                alert("Có lỗi xảy ra khi lưu biến thể.");
                            });

                        promises.push(promise);
                    }
                    Promise.all(promises)
                        .then(function () {
                            alert("Sản phẩm và tất cả biến thể đã được lưu thành công!");
                            $scope.loadProducts(); // Tải lại danh sách sản phẩm
                            $location.url('/sanpham');
                        })
                        .catch(function () {
                            alert("Có lỗi xảy ra khi lưu một hoặc nhiều biến thể.");
                        });

                })
                .catch(function (error) {
                    console.error("❌ Lỗi khi lưu sản phẩm:", error);
                    alert("Có lỗi xảy ra khi lưu sản phẩm.");
                });
        }
    };
    $scope.showEditVariantModal = function (variant, index) {
        let variantToEdit = {
            IdMau: variant.IdMau,
            IdSize: variant.IdSize,
            IdChatLieu: variant.IdChatLieu,
            Soluong: variant.Soluong,
            Giathoidiemhientai: variant.Giathoidiemhientai,
            Trangthai: variant.Trangthai,
            UrlHinhanh: variant.UrlHinhanh,
            file: variant.file || null // ✅ giữ lại file nếu có
        };
        $scope.newVariant = variantToEdit
        $scope.variantEditingIndex = index; // ✅ Ghi nhớ vị trí cần cập nhật
        $scope.isPriceFieldVisible = true;
    
        $timeout(function () {
            if ($scope.variantForm) {
                $scope.variantForm.$setPristine();
                $scope.variantForm.$setUntouched();
                $scope.variantForm.$submitted = false;
            }
        });
    
        var modal = new bootstrap.Modal(document.getElementById('addVariantModal'));
        modal.show();
    };
    


// Mở modal THÊM mới biến thể
$scope.showAddVariantModal = function () {
    $scope.newVariant = { Trangthai: 0 };
    $scope.variantEditingIndex = -1; // ✅ Đặt lại chế độ về "thêm mới"
    $scope.isPriceFieldVisible = false;
    $timeout(function () {
        if ($scope.variantForm) {
            $scope.variantForm.$setPristine();
            $scope.variantForm.$setUntouched();
        }
    });

    var modal = new bootstrap.Modal(document.getElementById('addVariantModal'));
    modal.show();
};

// Reset form khi đóng modal (gắn vào nút đóng)
$scope.resetVariantForm = function () {
    $scope.newVariant = {};
    $scope.isEditing = false;
    $scope.isPriceFieldVisible = false;

    if ($scope.variantForm) {
        $scope.variantForm.$setPristine();
        $scope.variantForm.$setUntouched();
    }
};


$scope.saveVariant = function () {
    if ($scope.variantForm.$invalid) {
        angular.forEach($scope.variantForm.$error, function (field) {
            angular.forEach(field, function (errorField) {
                errorField.$setTouched();
            });
        });
        $scope.variantForm.$setSubmitted();
        return;
    }

    if ($scope.variantEditingIndex === -1) {
        // ✅ Kiểm tra trùng khi thêm mới
        var existingVariant = $scope.product.variants.find(v =>
            v.IdMau === $scope.newVariant.IdMau && v.IdSize === $scope.newVariant.IdSize
        );
        if (existingVariant) {
            alert("❌ Biến thể đã tồn tại!");
            return;
        }

        if (!$scope.newVariant.Giathoidiemhientai) {
            $scope.newVariant.Giathoidiemhientai = $scope.product.giaBan;
        }

        let variantToAdd = {
            IdMau: $scope.newVariant.IdMau,
            IdSize: $scope.newVariant.IdSize,
            IdChatLieu: $scope.newVariant.IdChatLieu,
            Soluong: $scope.newVariant.Soluong,
            Giathoidiemhientai: $scope.newVariant.Giathoidiemhientai,
            Trangthai: $scope.newVariant.Trangthai,
            UrlHinhanh: $scope.newVariant.UrlHinhanh,
            file: $scope.newVariant.file
        };
    
        $scope.product.variants.push(variantToAdd);
        alert("✅ Đã thêm biến thể mới!");
        console.log("Biến thể mới:", $scope.newVariant);
        
    } else {
        // ✅ Cập nhật lại biến thể cũ
        if (!$scope.newVariant.Giathoidiemhientai) {
            $scope.newVariant.Giathoidiemhientai = $scope.product.giaBan;
        }
        let variantToEdit = {
            IdMau: $scope.newVariant.IdMau,
            IdSize: $scope.newVariant.IdSize,
            IdChatLieu: $scope.newVariant.IdChatLieu,
            Soluong: $scope.newVariant.Soluong,
            Giathoidiemhientai: $scope.newVariant.Giathoidiemhientai,
            Trangthai: $scope.newVariant.Trangthai,
            UrlHinhanh: $scope.newVariant.UrlHinhanh,
            file: $scope.newVariant.file
        };
        $scope.product.variants[$scope.variantEditingIndex] =  variantToEdit;
        alert("✅ Đã cập nhật biến thể!");
        console.log("Biến thể đã cập nhật:", $scope.newVariant);
    }

    // Reset lại modal
    $scope.newVariant = { Trangthai: 0 };
    $scope.isPriceFieldVisible = false;
    $scope.variantEditingIndex = -1;

    if ($scope.variantForm) {
        $scope.variantForm.$setPristine();
        $scope.variantForm.$setUntouched();
        $scope.variantForm.$submitted = false;
    }

    var modalElement = document.getElementById('addVariantModal');
    if (modalElement) {
        var modal = bootstrap.Modal.getOrCreateInstance(modalElement);
        modal.hide();
    }
};


    

    // Xóa biến thể
    $scope.removeVariant = function (index) {
        $scope.product.variants.splice(index, 1);
    };

    // Hàm để chuyển đổi trạng thái hiển thị trường nhập liệu
    $scope.togglePriceField = function () {
        $scope.isPriceFieldVisible = true;
        $scope.newVariant.Giathoidiemhientai = null; // Đặt lại giá trị
    };

    // Hàm để ẩn trường nhập liệu khi nhấn "Xóa"
    $scope.hidePriceField = function () {
        $scope.isPriceFieldVisible = false;
        $scope.newVariant.Giathoidiemhientai = null; // Đặt lại giá trị
    };
    // Xóa sản phẩm
    $scope.deleteProduct = function (product) {
        if (confirm("Bạn có chắc chắn muốn xóa sản phẩm này?")) {
            $http.delete("https://localhost:7196/api/Sanphams/" + product.id)
                .then(function (response) {
                    console.log("✅ Sản phẩm đã được xóa:", response.data);
                    alert("Sản phẩm đã được xóa thành công!");
                    $scope.loadProducts(); // Tải lại danh sách sản phẩm
                })
                .catch(function (error) {
                    console.error("❌ Lỗi khi xóa sản phẩm:", error);
                    alert("Có lỗi xảy ra khi xóa sản phẩm.");
                });
        }
    };
});
app.directive('fileModel', ['$parse', function ($parse) {
    return {
        restrict: 'A',
        link: function (scope, element, attrs) {
            let model = $parse(attrs.fileModel);
            element.bind('change', function () {
                scope.$apply(function () {
                    model.assign(scope, element[0].files[0]);
                });
            });
        }
    };
}]);

