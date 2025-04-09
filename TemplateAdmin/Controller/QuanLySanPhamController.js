app.controller('QuanLySanPhamController', function ($scope, $http, $location, $timeout, $routeParams) {
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
                $scope.productsStatus0 = [];
                $scope.productsStatus1 = [];
                $scope.productsStatus2 = [];
                

                $scope.products.forEach(function (product) {
                    product.trangThaiSwitch = product.trangthai === 0;
                    // Gọi API lấy biến thể từng sản phẩm
                    $http.get("https://localhost:7196/api/Sanphamchitiets/sanpham/" + product.id)
                        .then(function (res) {
                            product.variants = res.data;
                            product.image = product.variants.length > 0
                                ? product.variants[0].urlHinhanh
                                : 'default-image.jpg';
                            // Phân loại sản phẩm theo trạng thái
                            if (product.trangthai === 0) {
                                $scope.productsStatus0.push(product);
                            } else if (product.trangthai === 1) {
                                $scope.productsStatus1.push(product);
                            } else if (product.trangthai === 2) {
                                $scope.productsStatus2.push(product);
                            }
                            console.log($scope.productsStatus0);
                            
                        })
                        .catch(function () {
                            product.image = 'default-image.jpg';
                        });
                });
                console.log($scope.products);

            });
    };
    $scope.TatSanPham = function (product) {
        $http.put(`https://localhost:7196/api/Sanphams/${product.id}/cancel` )
            .then(function (response) {
                console.log("✅ Sản phẩm đã được tắt:", response.data);
                
                $scope.loadProducts(); // Tải lại danh sách sản phẩm
                alert("Sản phẩm đã được tắt thành công!");
            })
            .catch(function (error) {
                console.error("❌ Lỗi khi tắt sản phẩm:", error);
                alert("Có lỗi xảy ra khi tắt sản phẩm.");
            });
    }
    $scope.KichHoatSanPham = function (product) {
        $http.put(`https://localhost:7196/api/Sanphams/${product.id}/update-status-load` )
            .then(function (response) {
                console.log("✅ Sản phẩm đã được kích hoạt:", response.data);
                alert("Sản phẩm đã được kích hoạt thành công!");
                $scope.loadProducts(); // Tải lại danh sách sản phẩm
            })
            .catch(function (error) {
                console.error("❌ Lỗi khi kích hoạt sản phẩm:", error);
                alert("Có lỗi xảy ra khi kích hoạt sản phẩm.");
            });
    }
    $scope.toggleProductStatus = function (product) {
        if (product.trangThaiSwitch) {
            // Nếu bật switch => kích hoạt sản phẩm
            $scope.KichHoatSanPham(product);
        } else {
            // Nếu tắt switch => tắt sản phẩm
            $scope.TatSanPham(product);
        }
    };
    $scope.loadCategories = function () {
        $http.get("https://localhost:7196/api/Thuonghieu")
            .then(function (response) {
                //Thương hiệu hoạt động
                $scope.categories0 = []
                $scope.categories = response.data;
                $scope.categories.forEach(function (category) {
                    if (category.tinhtrang === 0) {
                        $scope.categories0.push(category);
                    }
                console.log("thanh", $scope.categories0);
                

                });
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
                //Color hoạt động
                $scope.colors0 = []
                $scope.colors = response.data;
                $scope.colors.forEach(function (color) {
                    if (color.trangthai === 0) {
                        $scope.colors0.push(color);
                    }
                });
                console.log("Thành", $scope.colors0);

                console.log($scope.colors);
            })
            .catch(function (error) {
                console.error("Lỗi khi tải danh sách màu sắc:", error);
            });
    };
    $scope.loadSizes = function () {
        $http.get("https://localhost:7196/api/Size")
            .then(function (response) {
                //Size hoạt động
                $scope.sizes0 = []
                $scope.sizes = response.data;
                $scope.sizes.forEach(function (size) {
                    if (size.trangthai === 0) {
                        $scope.sizes0.push(size);
                    }
                });
                console.log($scope.sizes);
            })
            .catch(function (error) {
                console.error("Lỗi khi tải danh sách kích thước:", error);
            });
    }
    $scope.loadChatlieus = function () {
        $http.get("https://localhost:7196/api/Chatlieu")
            .then(function (response) {
                //Chất liệu hoạt động
                $scope.chatlieus0 = []
                $scope.chatlieus = response.data;
                $scope.chatlieus.forEach(function (chatlieu) {
                    if (chatlieu.trangthai === 0) {
                        $scope.chatlieus0.push(chatlieu);
                    }
                });
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
            $scope.product.variants[$scope.variantEditingIndex] = variantToEdit;
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
    $scope.addThuongHieu = function () {
        if (!$scope.newThuongHieu || !$scope.newThuongHieu.trim()) {
            alert("Tên thương hiệu không được để trống.");
            return;
            
        }else if ($scope.newThuongHieu.length < 2) {
            alert("Tên thương hiệu phải có ít nhất 2 ký tự.");
            return;
        }
        else if ($scope.newThuongHieu.length > 50) {
            alert("Tên thương hiệu không được quá 50 ký tự.");
            return;
        }
        const isDuplicate = $scope.categories0.some(th =>
            th.tenthuonghieu.toLowerCase().trim() === $scope.newThuongHieu.toLowerCase().trim());
        if (isDuplicate) {
            alert("Tên thương hiệu đã tồn tại.");
            return;
        }
        const newTH = {
            tenthuonghieu: $scope.newThuongHieu.trim(),
            trangthai: 0
        };
        $http.post("https://localhost:7196/api/Thuonghieu", newTH)
            .then(function (response) {
                console.log("✅ Thương hiệu đã được thêm:", response.data);
                alert("Thương hiệu đã được thêm thành công!");
            })
            .catch(function (error) {
                console.error("❌ Lỗi khi thêm thương hiệu:", error);
                alert("Có lỗi xảy ra khi thêm thương hiệu.");
            });
        // Gọi API thêm hoặc xử lý tiếp...
        $scope.categories0.push(newTH);
        $scope.newThuongHieu = '';
    };
    $scope.addChatLieu = function () {
        if (!$scope.newChatLieu || !$scope.newChatLieu.trim()) {
            alert("Tên chất liệu không được để trống.");
            return;
        }else if ($scope.newChatLieu.length < 2) {
            alert("Tên chất liệu phải có ít nhất 2 ký tự.");
            return;
        }
        else if ($scope.newChatLieu.length > 50) {
            alert("Tên chất liệu không được quá 50 ký tự.");
            return;
        }

    
        const isDuplicate = $scope.chatlieus0.some(cl =>
            cl.tenchatlieu.toLowerCase().trim() === $scope.newChatLieu.toLowerCase().trim());
    
        if (isDuplicate) {
            alert("Tên chất liệu đã tồn tại.");
            return;
        }
    
        const newCL = {
            tenchatlieu: $scope.newChatLieu.trim(),
            trangthai: 0
        };
        $http.post("https://localhost:7196/api/Chatlieu", newCL)
            .then(function (response) {
                console.log("✅ Chất liệu đã được thêm:", response.data);
                alert("Chất liệu đã được thêm thành công!");
            })
            .catch(function (error) {
                console.error("❌ Lỗi khi thêm chất liệu:", error);
                alert("Có lỗi xảy ra khi thêm chất liệu.");
            });
        
        $scope.chatlieus0.push(newCL);
        $scope.newChatLieu = '';
    };
    $scope.addColor = function () {
        if (!$scope.newColor || !$scope.newColor.tenmau || !$scope.newColor.tenmau.trim()) {
            alert("Tên màu không được để trống.");
            return;
        }else if ($scope.newColor.tenmau.length < 2) {
            alert("Tên màu phải có ít nhất 2 ký tự.");
            return;
        }
        else if ($scope.newColor.tenmau.length > 50) {
            alert("Tên màu không được quá 50 ký tự.");
            return;
        }
        else if (!$scope.newColor.mamau) {
            alert("Mã màu không được để trống.");
            return;
        }
    
        const isDuplicate = $scope.colors0.some(color =>
            color.tenmau.toLowerCase().trim() === $scope.newColor.tenmau.toLowerCase().trim());
    
        if (isDuplicate) {
            alert("Tên màu đã tồn tại.");
            return;
        }
    
        const newColor = {
            tenmau: $scope.newColor.tenmau.trim(),
            mamau: $scope.newColor.mamau || '#000000',
            trangthai: 0
        };
        $http.post("https://localhost:7196/api/Color", newColor)
            .then(function (response) {
                console.log("✅ Màu đã được thêm:", response.data);
                alert("Màu đã được thêm thành công!");
            })
            .catch(function (error) {
                console.error("❌ Lỗi khi thêm màu:", error);
                alert("Có lỗi xảy ra khi thêm màu.");
            });
    
        $scope.colors0.push(newColor);
        $scope.newColor = {};
    };
    $scope.addSize = function () {
        if ($scope.newSize == null || $scope.newSize === '') {
            alert("Vui lòng nhập số size.");
            return;
        } 
        const sizeValue = parseInt($scope.newSize);
        if (isNaN(sizeValue)) {
            alert("Số size phải là số nguyên.");
            return;
        }if (sizeValue <= 30 || sizeValue >= 50) {
            alert("Số size phải nằm trong khoảng từ 30 đến 50.");
            return;
        }
        const isDuplicate = $scope.sizes0.some(sz => sz.sosize === sizeValue);
        if (isDuplicate) {
            alert("Số size đã tồn tại.");
            return;
        }
    
        const newSizeObj = {
            sosize: sizeValue,
            trangthai: 0
        };
    
        // Nếu bạn có gọi API:
        $http.post("https://localhost:7196/api/Size", newSizeObj)
            .then(function (response) {
                $scope.sizes0.push(response.data); 
                $scope.newSize = '';
                alert("Thêm size thành công!");
            })
            .catch(function (error) {
                console.error("Lỗi khi thêm size:", error);
                alert("Đã xảy ra lỗi khi thêm size.");
            });
    
        
        $scope.sizes0.push(newSizeObj);
        $scope.newSize = '';
    };
    $scope.resetSize = function () {
        $scope.newSize = null;
    };
    $scope.resetColor = function () {
        $scope.newColor = null;
    };
    $scope.resetChatLieu = function () {
        $scope.newChatLieu = null;
    };
    $scope.resetThuongHieu = function () {
        $scope.newThuongHieu = null;
    };
    $scope.blockInvalidKeys = function (event) {
        const invalidKeys = [190, 188, 110]; // . , trên các layout khác nhau
    
        if (invalidKeys.includes(event.keyCode)) {
            event.preventDefault();
        }
    };
    $scope.getProductById = function (id) {
        $http.get("https://localhost:7196/api/Sanphams/" + id)
            .then(function (response) {
                $scope.product = response.data;
                console.log("📦 Thông tin sản phẩm:", $scope.product);
                // Gọi tiếp API lấy biến thể
                return $http.get("https://localhost:7196/api/Sanphamchitiets/sanpham/" + id);
            })
            .then(function (response) {
                const variantsRaw = response.data;

                $scope.product.variants = variantsRaw.map(variant => ({
                    Id: variant.id,
                    Idsp: variant.idsp,
                    IdMau: variant.idMau,
                    IdSize: variant.idSize,
                    IdChatLieu: variant.idChatLieu,
                    Soluong: variant.soluong,
                    Giathoidiemhientai: variant.giathoidiemhientai,
                    Trangthai: variant.trangthai,
                    UrlHinhanh: variant.urlHinhanh,
                    file: variant.file || null
                }));
    
                console.log("🎨 Biến thể đã xử lý:", $scope.product.variants);
            })
            .catch(function (error) {
                console.error("❌ Lỗi khi tải sản phẩm hoặc biến thể:", error);
            });
    };
    
    if ($routeParams.id) {
        let id = $routeParams.id;
        $scope.getProductById(id);
    }
    
    
    
    
    

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

